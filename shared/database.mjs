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
			sessions: '++id, creationdate', // non-indexed fields: sortkey
			tabs: '++id, url, title, *categories, *sessions', // non-indexed fields: metadata, sortkey, previewimageurl (optional)
			// The "cached tabs" table mainly exists to work around browser limitations. Currently there is no meaningful and reliable support
			// in browsers for doing something with tabs and windows BEFORE they're closed, so there is no direct path to implementing our
			// "archive all tabs on browser close" feature. However, we can keep a cache of all opened tabs as they're being created or updated,
			// and then instead of archiving the tabs on browser close, we can archive them the next time the browser is opened and the respective
			// tab is restored.
			cachedtabs: '&id, sessiondate' // non-indexed fields: metadata, previewimageurl (optional), closedthrougharchival
		});
	}

	async getSession(sessionDate) {
		const matchingSessions = await this.sessions.where("creationdate")
			.equals(sessionDate)
			.sortBy("creationdate");

		if (matchingSessions.length > 0) {
			return matchingSessions.pop();
		}

		return undefined;
	}

	async createNewSession(sessionDate = Date.now()) {
		debugh.log("Creating new session with date:", sessionDate);
		
		let newSession = {
			creationdate: sessionDate,
			sortkey: sessionDate
		};
		const newSessionId = await this.sessions.add(newSession);

		newSession.id = newSessionId;
		
		debugh.log("Created new session with ID", newSession.id, "and date", sessionDate);

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

	async _addTabsToArchive(preprocessedTabDatas, sessionId) {
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
				sessions: [ sessionId ],
				metadata: preprocessedTabData.tab,
				sortkey: { keyHigh: currentDate, keyMid: preprocessedTabData.tab.windowId, keyLow: preprocessedTabData.tab.id }
			}
			
			if (preprocessedTabData.previewImage) {
				newEntry.previewimageurl = preprocessedTabData.previewImage;
			}
			
			newTableEntries.push(newEntry);
			
			urlsWithIndices[preprocessedTabData.tab.url] = currentIndex;
			++currentIndex;
		}
		
		const archiveSettings = await settings.archiveSettings;

		// If the "no duplicate URLs" setting is enabled, check if we already have
		// any of the tab URLs archived. If so, instead of storing a new entry in the
		// database, we need to update the existing one.
		/*
		let sessionIdsToCheckForDeletion = [];
		*/
		
		if (archiveSettings.noDuplicateUrls) {
			const existingArchivedTabs = await this.tabs.where("url")
				.anyOf(justUrls)
				.toArray();
			
			// Archiving tabs with the "noDuplicateUrls" setting enabled might cause them to move
			// from one session to another, which might cause the previous session to now be empty.
			// Therefore we'll need to check for this after we're done archiving.
			// Update: Okay, I'm not sure what I was thinking there. Somehow in my head, I saw tabs
			// as only having a single session assigned to them, but as we can plainly see down here,
			// tabs have multiple sessions, so what I described here should never be able to happen.
			/*
			sessionIdsToCheckForDeletion = this._getAllSessionIdsFromTabs(existingArchivedTabs);
			*/
				
			for (const existingArchivedTab of existingArchivedTabs) {
				let entryToUpdate = newTableEntries[urlsWithIndices[existingArchivedTab.url]];
				entryToUpdate.id = existingArchivedTab.id;
	
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
				
				// If the new entry doesn't have a preview image, but the old entry had one,
				// also copy the preview image from the old entry so that we don't just wipe it needlessly.
				// (Probably could apply this logic to more than just the preview image, but the preview image
				// is the most likely thing to get lost from a discared tab).
				if (!entryToUpdate.previewimageurl && existingArchivedTab.previewimageurl) {
					entryToUpdate.previewimageurl = existingArchivedTab.previewimageurl;
				}
			}
		}
		
		// Wrapping everything into a transaction here, just to make it easier to handle error cases.
		// The caller might want to close tabs on success, so with the transaction we only ever have
		// to close all tabs or none.
		await this.transaction("rw", this.tabs, async (tx) => {
			await this.tabs.bulkPut(newTableEntries);
		});
		
		// Check if any sessions are now empty as result of moving tabs
		// and if so, automatically delete the respective session.
		/*
		for (const sessionIdToCheck of sessionIdsToCheckForDeletion) {
			this.deleteSessionIfNoLongerNeeded(sessionIdToCheck);
		}
		*/
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
		debugh.log("Archiving", tabs.length, "tabs into session with date:", sessionDate);
		debugh.logVerbose("Tab details:", tabs);
		
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
		
			// Retrieve or create the session that our tabs will go into.
			let currentSession = null;
			try {				
				await this.transaction("rw", this.sessions, async (tx) => {				
					if (!sessionDate) {
						sessionDate = archiveSettings.currentSessionDate;
					}
					
					currentSession = await this.getSession(sessionDate);
				
					if (!currentSession) {
						currentSession = await this.createNewSession(sessionDate);
					} else {
						debugh.log("Retrieved session with ID", currentSession.id, "and date", currentSession.creationdate);
					}
				});
			} catch (error) {
				errors.push("Retrieving or creating session for tabs failed: " + error);
				hasCriticalErrors = true;
			}
		
			// Transform our list of tabs into the format that our DB helper expects.
			let preprocessedTabDatas = [];
		
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
					categories: categoriesToAdd
				}
				
				if (savePreviewImages) {
					if (tab.previewImage) {
						// Don't generate a new preview image if we're already passing one in (for example, from a cached tab).
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
		
				preprocessedTabDatas.push(newEntry);
			}
		
			if (!hasCriticalErrors) {
				try {
					await this._addTabsToArchive(preprocessedTabDatas, currentSession.id);
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
	
	async deleteSessionIfNoLongerNeeded(sessionId) {
		this.tabs.where("sessions").equals(sessionId).toArray().then((tabs) => {
			if (tabs.length === 0) {
				this.deleteSession(sessionId);
			}
		}).catch((error) => {
			debugh.error("Error while looking for empty sessions: " + error);
		});
	}
	
	_getAllSessionIdsFromTabs(tabs) {
		const unqiueSessionIds = {};
		
		for (const tab of tabs) {
			for (const sessionId of tab.sessions) {
				unqiueSessionIds[sessionId] = sessionId;
			}
		}
		
		const sessionIds = [];
		
		for (const key in unqiueSessionIds) {
			sessionIds.push(unqiueSessionIds[key]);
		}
		
		return sessionIds;
	}
	
	async deleteTabs(ids) {
		debugh.log("Deleting", ids.length, "tabs.");
		debugh.logVerbose("IDs:", ids);
		
		const tabs = await this.tabs.bulkGet(ids);
		
		const sessionIds = this._getAllSessionIdsFromTabs(tabs);
		
		const returnPromise = this.tabs.bulkDelete(ids);
		
		returnPromise.then(() => {
			// Check if any sessions are now empty as result of deleting tabs,
			// and if so, automatically delete the respective session.
			for (const sessionId of sessionIds) {
				this.deleteSessionIfNoLongerNeeded(sessionId);
			}
		});
		
		return returnPromise;
	}
	
	async deleteCategory(id) {
		debugh.log("Deleting category with ID:", id);
		return this.categories.delete(id);
	}
	
	async deleteSession(id) {
		debugh.log("Deleting session with ID:", id);
		return this.sessions.delete(id);
	}
	
	async deleteArchive() {
		debugh.log("Deleting entire archive.");
		const returnValue = await this.transaction("rw", this.categories, this.sessions, this.tabs, this.cachedtabs, async (tx) => {
			await this.categories.clear();
			await this.sessions.clear();
			await this.tabs.clear();
			await this.cachedtabs.clear();
		});
		await browser.runtime.sendMessage({
			type: "deleted-archive"
		});
		return returnValue;
	}
	
	newLiveQuery(query) {
		return liveQuery(query);
	}
	
	async getCachedTabs(ids) {
		return await this.cachedtabs.bulkGet(ids);
	}
	
	async getAllCachedTabs() {
		return await this.cachedtabs.toArray();
	}
	
	async writeCachedTabs(cachedTabs) {
		debugh.log("Writing", cachedTabs.length, "tabs to cache.");
		debugh.logVerbose("Cached tab details:", cachedTabs);
		return await this.cachedtabs.bulkPut(cachedTabs);
	}
	
	async deleteCachedTabs(ids) {
		debugh.log("Deleting", ids.length, "cached tabs.");
		debugh.logVerbose("IDs:", ids);
		return await this.cachedtabs.bulkDelete(ids);
	}
}

export const db = new PhanTabularDB();
export { db as default };
