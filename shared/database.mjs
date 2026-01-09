import debugh from "./debughelper.mjs";
import { Dexie, liveQuery } from "../deps/dexie/dist/dexie.mjs";
import settings from "./settings.mjs";
import ruleeval from "./rules.mjs";

debugh.log("Using Dexie: v" + Dexie.semVer);

export class PhanTabularDB extends Dexie {
	constructor() {
		super('PhanTabularDB');

		this.version(1).stores({
			categories: '++id, name', // non-indexed fields: color, rule, sortkey
			sessions: '&creationdate', // non-indexed fields: sortkey
			tabs: '++id, url, title, *categories, *sessions' // non-indexed fields: metadata, sortkey, previewimageurl (optional)
		});
	}

	async getSession(sessionDate) {
		return await this.sessions.get(sessionDate);
	}

	async createNewSession(sessionDate = Date.now()) {
		debugh.log("Creating new session with date:", debugh.formatTimestamp(sessionDate));
		
		let newSession = {
			creationdate: sessionDate,
			sortkey: sessionDate
		};
		const newSessionPromise = this.sessions.add(newSession);
		
		newSessionPromise.then(() => {
			debugh.log("Created new session with date", debugh.formatTimestamp(sessionDate));
		}).catch((error) => {			
			debugh.error("Couldn't create session with date", debugh.formatTimestamp(sessionDate), "because the following error occured:", error);
		});
		
		await newSessionPromise;

		return newSession;
	}

	async createNewCategory(name = "New Category", color = undefined, rule = undefined) {
		debugh.log("Creating new category:", name);
		
		let currentDate = Date.now();
		
		let newCategory = {
			name: name,
			color: color,
			rule: rule,
			sortkey: currentDate
		};
		
		if (color === undefined) {
			newCategory.color = settings.supportedColors[Math.floor(Math.random() * settings.supportedColors.length)];
		}
		
		const newCategoryId = await this.categories.add(newCategory);

		newCategory.id = newCategoryId;
		
		debugh.log("Created new category with ID", newCategory.id, "and name", name);

		return newCategory;
	}

	async getCategoriesWithAutoCatchRules() {
		let categoriesWithAutoCatchRules = []
		
		await this.categories.each(category => {
			if (category.rule !== undefined) {
				categoriesWithAutoCatchRules.push(category);
			}
		});

		return categoriesWithAutoCatchRules;
	}

	async _addTabsToArchive(preprocessedTabDatas, archiveSettings) {
		let justUrls = [];
		let newTableEntries = [];
		let urlsWithIndices = {};
		
		let currentDate = Date.now();

		// Convert our list of tabs into the correct format for the database.
		let currentIndex = 0;
		for (const preprocessedTabData of preprocessedTabDatas) {
			justUrls.push(preprocessedTabData.tab.url);
			
			const newEntry = {
				url: preprocessedTabData.tab.url,
				title: preprocessedTabData.tab.title,
				categories: preprocessedTabData.categories,
				sessions: preprocessedTabData.sessions,
				metadata: preprocessedTabData.tab,
				sortkey: { keyHigh: currentDate, keyMid: preprocessedTabData.tab.windowId, keyLow: preprocessedTabData.tab.index }
			}
			
			if (preprocessedTabData.previewImage) {
				newEntry.previewimageurl = preprocessedTabData.previewImage;
			}
			
			// If we have "noDuplicateUrls" enabled, make sure we don't have the same URL
			// in our selection multiple times. If we do, we need to remove either entry.
			// We just use the "lastAccessed" flag to decide which entry to keep.
			// Update: Also do this for "onlyStoreLatestSession".
			if ((archiveSettings.noDuplicateUrls || archiveSettings.onlyStoreLatestSession) && typeof urlsWithIndices[newEntry.url] !== "undefined") {
				const previousIndex = urlsWithIndices[newEntry.url];
				const previousEntry = newTableEntries[previousIndex];
				
				if (newEntry.metadata.lastAccessed > previousEntry.metadata.lastAccessed) {
					newTableEntries[previousIndex] = newEntry;
				}
				
				continue;
			}
			
			newTableEntries.push(newEntry);
			
			urlsWithIndices[preprocessedTabData.tab.url] = currentIndex;
			++currentIndex;
		}

		// Some settings require us to update old entries instead of creating new ones.
		// We take care of that here.
		let sessionDatesToCheckForDeletion = [];
		const entryIdsToDelete = [];
		
		if (archiveSettings.noDuplicateUrls || archiveSettings.onlyStoreLatestSession) {
			const existingArchivedTabs = await this.tabs.where("url")
				.anyOf(justUrls)
				.toArray();
			
			// Archiving tabs with the "noDuplicateUrls" setting enabled might cause them to move
			// from one session to another, which might cause the previous session to now be empty.
			// Therefore we'll need to check for this after we're done archiving.
			// Update: Okay, I'm not sure what I was thinking there. Somehow in my head, I saw tabs
			// as only having a single session assigned to them, but as we can plainly see down here,
			// tabs have multiple sessions, so what I described here should never be able to happen.
			// Update: Well, it can now, because the new "onlyStoreLatestSession" can now
			// actually cause a tab to exit a session. Back on the table it goes!
			sessionDatesToCheckForDeletion = this._getAllSessionDatesFromTabs(existingArchivedTabs);
			// Also add the session dates of all tabs we're about to archive to the list. Technically,
			// they COULD be older than any of the sessions already stored in the database.			
			const sessionDatesFromNewEntries = this._getAllSessionDatesFromTabs(newTableEntries);
			for (const sessionDateFromNewEntry of sessionDatesFromNewEntries) {
				if (!sessionDatesToCheckForDeletion.includes(sessionDateFromNewEntry)) {
					sessionDatesToCheckForDeletion.push(sessionDateFromNewEntry);
				}
			}
				
			for (const existingArchivedTab of existingArchivedTabs) {				
				let entryToUpdate = newTableEntries[urlsWithIndices[existingArchivedTab.url]];
								
				debugh.logVerbose("Merging tab with URL", entryToUpdate.url, "into database entry", existingArchivedTab.id);
				debugh.logVerbose("Tab details:", entryToUpdate, existingArchivedTab);
				
				const previousEntryToUpdateId = entryToUpdate.id;
				entryToUpdate.id = existingArchivedTab.id;
	
				if (archiveSettings.onlyStoreLatestSession && !archiveSettings.noDuplicateUrls) {
					const newestSessionOldEntry = Math.max(...existingArchivedTab.sessions);
					const newestSessionNewEntry = Math.max(...entryToUpdate.sessions);
					
					if (newestSessionOldEntry > newestSessionNewEntry) {
						entryToUpdate = existingArchivedTab;
						entryToUpdate.sessions = [newestSessionOldEntry];
					} else {
						entryToUpdate.sessions = [newestSessionNewEntry];
					}
					
					// If entryToUpdate already had an ID assigned to it, the same URL must have occured multiple
					// times within existingArchivedTabs, so we must collapse all existing entries into one.
					// The simplest solution for this is to delete the previous entry.
					if (previousEntryToUpdateId !== undefined) {
						entryIdsToDelete.push(previousEntryToUpdateId);
					}
				} else {
					for (const cateogry of existingArchivedTab.categories) {
						if (!entryToUpdate.categories.includes(cateogry)) {
							entryToUpdate.categories.push(cateogry);
						}
					}
		
					for (const session of existingArchivedTab.sessions) {
						if (!entryToUpdate.sessions.includes(session)) {
							entryToUpdate.sessions.push(session);
						}
					}
					
					if (archiveSettings.onlyStoreLatestSession) {						
						const newestSession = Math.max(...entryToUpdate.sessions);
						entryToUpdate.sessions = [newestSession];
					}
				}
				
				// If the new entry doesn't have a preview image, but the old entry had one,
				// also copy the preview image from the old entry so that we don't just wipe it needlessly.
				// (Probably could apply this logic to more than just the preview image, but the preview image
				// is the most likely thing to get lost from a discared tab).
				if (!entryToUpdate.previewimageurl && existingArchivedTab.previewimageurl) {
					entryToUpdate.previewimageurl = existingArchivedTab.previewimageurl;
				}
				
				debugh.logVerbose("Merged tab details:", entryToUpdate);
			}
		}
		
		// Wrapping everything into a transaction here, just to make it easier to handle error cases.
		// The caller might want to close tabs on success, so with the transaction we only ever have
		// to close all tabs or none.
		await this.transaction("rw", this.tabs, this.sessions, async (tx) => {
			await this.tabs.bulkPut(newTableEntries);
			if (entryIdsToDelete.length > 0) {
				await this.deleteTabs(entryIdsToDelete);
			}
		
			// Check if any sessions are now empty as result of moving tabs
			// and if so, automatically delete the respective session.
			const deletionPromisesToAwait = [];
			
			if (sessionDatesToCheckForDeletion.length > 0) {
				debugh.log("Checking for empty sessions to delete.");
				for (const sessionDateToCheck of sessionDatesToCheckForDeletion) {
					deletionPromisesToAwait.push(this.deleteSessionIfNoLongerNeeded(sessionDateToCheck));
				}
			}
			
			for (const deletionPromiseToAwait of deletionPromisesToAwait) {
				await deletionPromisesToAwait;
			}
		});
	}

	async hasPreviewImageCapturePermissions() {	
		let allPermissions = await browser.permissions.getAll();
	
		return allPermissions.origins.includes("<all_urls>");
	}
	
	async capturePrewviewImage(tab) {
		debugh.logVerbose("Capturing preview image for tab with ID:", tab.id);
		debugh.logVerbose("Tab details:", tab);
		
		const archiveSettings = await settings.archiveSettings;
		
		const previewImageOptions = {
			format: archiveSettings.previewImageFormat,
			quality: archiveSettings.previewImageQuality,
			scale: archiveSettings.previewImageScale / window.devicePixelRatio
		};
		
		if (tab.discarded) {
			throw("Couldn't capture preview images for unloaded tabs.");
		} else {
			let openTab = null;
			try {
				openTab = await browser.tabs.get(tab.id);
			} catch {}
			
			if (!openTab) {
				throw("Couldn't capture preview images of tabs that are no longer open.");
			}
		}
		
		return await browser.tabs.captureTab(tab.id, previewImageOptions);
	}

	async archiveTabs(tabs, sessionDate = undefined) {
		debugh.log("Archiving", tabs.length, "tabs into session with date:", debugh.formatTimestamp(sessionDate));
		debugh.logVerbose("Tab details:", tabs);
		
		const currentDate = Date.now();
		
		const errors = [];
		let hasCriticalErrors = false;
		
		const archiveSettings = await settings.archiveSettings;
		
		let savePreviewImages = false;
		
		if (archiveSettings.savePreviewImages) {
			const previewImageCapturePermissions = await this.hasPreviewImageCapturePermissions();
			
			if (previewImageCapturePermissions) {
				savePreviewImages = true;
			} else {
				errors.push("Saving preview images requires the permission to access your data for all websites.");
			}
		}
	
		let tabsToArchive = [];
	
		// Sort out tabs that are part of the selection, but we don't want to archive.
		// NOTE: Now handled by caller instead, because there's situations where we don't want to apply these settings.
		tabsToArchive = tabs;
		/*
		for (const tab of tabs){
			if ((tab.hidden && !archiveSettings.archiveHiddenTabs)
				|| (tab.pinned && !archiveSettings.archivePinnedTabs))
			{
				continue;
			}
	
			debugh.log("Archiving: " + tab.url);
			tabsToArchive.push(tab);
		};
		*/
	
		if (tabsToArchive.length === 0) {
			errors.push("No archivable tabs in selection.");
			hasCriticalErrors = true;
		} else {
			// Retrieve all categories that have auto-catch rules, so that we can check if
			// any of them need to be applied to the tab's we're about to archive.
			let autoCatchCategories = [];
			try {
				autoCatchCategories = await this.getCategoriesWithAutoCatchRules();
			} catch (error) {
				errors.push("Retrieving categories with auto-catch rules failed: " + error);
			}
		
			// Transform our list of tabs into the format that our DB helper expects.
			const preprocessedTabDatas = [];
			const uniqueSessionDates = [];
			
			if (sessionDate !== undefined) {
				uniqueSessionDates.push(sessionDate);
			}
		
			for (const tab of tabsToArchive) {
				let categoriesToAdd = [];
				
				// Check, which categories match, and add them to our list of categories for this tab.
				for (const category of autoCatchCategories) {
					try {
						if (await ruleeval.matchesRule(tab, category.rule)) {
							categoriesToAdd.push(category.id);
						}
					} catch (error) {
						const errorText = "Evaluating auto-catch rule failed: " + error;
						if (!errors.includes(errorText)) {
							errors.push(errorText);
						}
					}
				}
				
				const newEntry = {
					tab: tab,
					categories: categoriesToAdd,
					sessions: [sessionDate]
				}
				
				if (savePreviewImages) {
					if (tab.previewImage) {
						// Don't generate a new preview image if we're already passing one in (for example, from a cache).
						newEntry.previewImage = tab.previewImage;
					} else {
						const previewImageOptions = {
							format: archiveSettings.previewImageFormat,
							quality: archiveSettings.previewImageQuality,
							scale: archiveSettings.previewImageScale / window.devicePixelRatio
						};
						
						try {
							newEntry.previewImage = await this.capturePrewviewImage(tab);
						} catch(error) {
							const errorText = "Capturing tab preview image failed: " + error;
							if (!errors.includes(errorText)) {
								errors.push(errorText);
							}
						}
					}
				}
		
				// If we didn't explicitly pass in a session date, get the one associated to the tab.
				// Usually this is the window's session date, unless that for some reason hasn't been set yet
				// or isn't available, in which case we just use the current date.
				if (newEntry.sessions[0] === undefined) {
					let sessionDate = currentDate;
					try {
						const windowData = await browser.sessions.getWindowValue(newEntry.tab.windowId, "phantabular");
						sessionDate = windowData.sessionDate;
					} catch {}
					
					newEntry.sessions = [sessionDate];
					
					if (!uniqueSessionDates.includes(sessionDate)) {
						uniqueSessionDates.push(sessionDate);
					}
				}
		
				preprocessedTabDatas.push(newEntry);
			}
			
			// Iterate all the unique session dates that we've used and check if the respective session already exists.
			// If not, it needs to be created.
			try {
				await this.transaction("rw", this.sessions, async (tx) => {
					debugh.logVerbose("Checking if", uniqueSessionDates.length, "sessions already exist:");
					debugh.logVerbose("Session details:", uniqueSessionDates.map((date) => {return debugh.formatTimestamp(date);}));
					for (const uniqueSessionDate of uniqueSessionDates) {
						debugh.logVerbose("Checking session:", debugh.formatTimestamp(uniqueSessionDate));
						const existingSession = await this.getSession(uniqueSessionDate);
						
						if (!existingSession) {
							debugh.logVerbose("Creating new session", debugh.formatTimestamp(uniqueSessionDate), "because it wasn't found.");
							await this.createNewSession(uniqueSessionDate);
						} else {
							debugh.logVerbose("Not creating new session", debugh.formatTimestamp(uniqueSessionDate), "because it was found in the database:", existingSession);
						}
					}
				});
			} catch (error) {
				errors.push("Retrieving or creating a session failed: " + error);
				hasCriticalErrors = true;
			}
		
			if (!hasCriticalErrors) {
				try {
					await this._addTabsToArchive(preprocessedTabDatas, archiveSettings);
				} catch(error) {
					errors.push("Adding tabs to archive failed: " + error);
					hasCriticalErrors = true;
				}
			}
		}
		
		if (errors.length > 0) {
			// Oh boy, this error handling feels stinky...
			// Do we ever want non-critical errors to appear in UI? If so, we need to entirely rethink this.
			const fullErrorText = errors.join("\n");
			if (hasCriticalErrors) {
				throw(fullErrorText);
			} else {
				debugh.error("Encountered non-critical errors while archiving tabs:", fullErrorText, "\nThe tabs were still archived, but some settings might not have been applied.");
			}
		}
	}
	
	async deleteSessionIfNoLongerNeeded(sessionDate) {
		debugh.logVerbose("Checking if session with date", debugh.formatTimestamp(sessionDate), "is empty and can be deleted");
		this.tabs.where("sessions").equals(sessionDate).toArray().then((tabs) => {
			if (tabs.length === 0) {
				this.deleteSession(sessionDate);
			}
		}).catch((error) => {
			debugh.error("Error while looking for empty sessions:", error);
		});
	}
	
	_getAllSessionDatesFromTabs(tabs) {
		const unqiueSessionDates = {};
		
		for (const tab of tabs) {
			for (const sessionDate of tab.sessions) {
				unqiueSessionDates[sessionDate] = sessionDate;
			}
		}
		
		const sessionDates = [];
		
		for (const key in unqiueSessionDates) {
			sessionDates.push(unqiueSessionDates[key]);
		}
		
		return sessionDates;
	}
	
	async deleteTabs(ids) {
		debugh.log("Deleting", ids.length, "tabs.");
		debugh.logVerbose("IDs:", ids);
		
		const tabs = await this.tabs.bulkGet(ids);
		
		const sessionDates = this._getAllSessionDatesFromTabs(tabs);
		
		const returnPromise = this.tabs.bulkDelete(ids);
		
		returnPromise.then(() => {
			// Check if any sessions are now empty as result of deleting tabs,
			// and if so, automatically delete the respective session.
			if (sessionDates.length > 0) {
				debugh.log("Checking for empty sessions to delete.");
				for (const sessionDate of sessionDates) {
					this.deleteSessionIfNoLongerNeeded(sessionDate);
				}
			}
		});
		
		return returnPromise;
	}
	
	async deleteCategory(id) {
		debugh.log("Deleting category with ID:", id);
		return this.categories.delete(id);
	}
	
	async deleteSession(date) {
		debugh.log("Deleting session with date:", debugh.formatTimestamp(date));
		return this.sessions.delete(date);
	}
	
	async deleteArchive() {
		debugh.log("Deleting entire archive.");
		return await this.delete({disableAutoOpen: false});
	}
	
	newLiveQuery(query) {
		return liveQuery(query);
	}
}

export const db = new PhanTabularDB();
export { db as default };
