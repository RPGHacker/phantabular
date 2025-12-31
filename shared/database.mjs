import { Dexie, liveQuery } from "../deps/dexie/dist/dexie.mjs";
import settings from "./settings.mjs";
import ruleeval from "./rules.mjs";

console.log("[PhanTabular] Using Dexie: v" + Dexie.semVer);

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
			cachedtabs: '&id' // non-indexed fields: metadata, previewimageurl (optional)
		});
	}

	async getCurrentSession() {
		// Allow some time tolerance for what defines the "current session"
		// so that if the "archive current tab" button is clicked multiple
		// times within a short time period we aren't creating a new session
		// for each of them. It makes much more sense to consider them all
		// part of the same session.
		// Maybe a better idea is to automatically create a new session
		// whenever the browser is started and to then return that.
		const maxAgeInMilliseconds = 5 * 60 * 1000;

		const recentSessions = await this.sessions.where("creationdate")
			.aboveOrEqual(Date.now() - maxAgeInMilliseconds)
			.sortBy("creationdate");

		if (recentSessions.length > 0) {
			return recentSessions.pop();
		}

		return undefined;
	}

	async createNewSession() {
		let currentDate = Date.now();
		
		let newSession = {
			creationdate: currentDate,
			sortkey: currentDate
		};
		const newSessionId = await this.sessions.add(newSession);

		newSession.id = newSessionId;

		return newSession;
	}

	async createNewCategory(name = "New Category", color = undefined, rule = undefined) {
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
		if (archiveSettings.noDuplicateUrls) {
			const existingArchivedTabs = await this.tabs.where("url")
				.anyOf(justUrls)
				.toArray();
				
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
			}
		}
		
		// Wrapping everything into a transaction here, just to make it easier to handle error cases.
		// The caller might want to close tabs on success, so with the transaction we only ever have
		// to close all tabs or none.
		await this.transaction("rw", this.tabs, async (tx) => {
			await this.tabs.bulkPut(newTableEntries);
		});
	}

	async hasPreviewImageCapturePermissions() {	
		let allPermissions = await browser.permissions.getAll();
	
		return allPermissions.origins.includes("<all_urls>");
	}
	
	async capturePrewviewImage(tab) {		
		const archiveSettings = await settings.archiveSettings;
		
		const previewImageOptions = {
			format: archiveSettings.previewImageFormat,
			quality: archiveSettings.previewImageQuality,
			scale: archiveSettings.previewImageScale / window.devicePixelRatio
		};
		
		if (tab.discarded) {
			throw("Couldn't capture preview images for unloaded tabs.");
		}
		
		return await browser.tabs.captureTab(tab.id, previewImageOptions);
	}

	async archiveTabs(tabs) {
		const errors = [];
		
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
	
			console.log("[PhanTabular] Archiving: " + tab.url);
			tabsToArchive.push(tab);
		};
		*/
	
		if (tabsToArchive.length === 0) {
			errors.push("No archivable tabs in selection.");
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
			let currentSession = -1;
			try {
				currentSession = await this.getCurrentSession();
			
				if (!currentSession) {
					currentSession = await this.createNewSession();
				}
			} catch (error) {
				// Should this be a critical error instead and abort archival process?
				errors.push("Retrieving or creating session for tabs failed: " + error);
			}
		
			console.log("[PhanTabular] Session: " + currentSession.id + " -> " + currentSession.creationdate);
		
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
		
			try {
				await this._addTabsToArchive(preprocessedTabDatas, currentSession.id);
			} catch(error) {
				errors.push("Adding tabs to archive failed: " + error);
			}
		}
		
		if (errors.length > 0) {
			throw(errors.join("\n"));
		}
	}
	
	async deleteSessionIfNoLongerNeeded(sessionId) {
		this.tabs.where("sessions").equals(sessionId).toArray().then((tabs) => {
			if (tabs.length === 0) {
				this.deleteSession(sessionId);
			}
		}).catch((error) => {
			console.error("Error while looking for empty sessions: " + error);
		});
	}
	
	async deleteTabs(ids) {
		const tabs = await this.tabs.bulkGet(ids);
		
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
		return this.categories.delete(id);
	}
	
	async deleteSession(id) {
		return this.sessions.delete(id);
	}
	
	async deleteArchive() {		
		await this.categories.clear();
		await this.sessions.clear();
		await this.tabs.clear();
	}
	
	newLiveQuery(query) {
		return liveQuery(query);
	}
	
	async getCachedTabs(ids) {
		return await this.cachedtabs.bulkGet(ids);
	}
	
	async writeCachedTabs(cachedTabs) {		
		return await this.cachedtabs.bulkPut(cachedTabs);
	}
	
	async deletedCachedTabs(ids) {
		return await this.cachedtabs.bulkDelete(ids);
	}
}

export const db = new PhanTabularDB();
export { db as default };
