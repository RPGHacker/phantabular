import { Dexie, liveQuery } from "../deps/dexie/dist/dexie.mjs";
import settings from "../shared/settings.mjs";

console.log("[Tab Archive] Using Dexie: v" + Dexie.semVer);

export class TabArchiveDB extends Dexie {
	constructor() {
		super('TabArchiveDB');

		this.version(1).stores({
			categories: '++id, name', // non-indexed fields: color, rule, sortkey
			sessions: '++id, creationdate', // non-indexed fields: sortkey
			tabs: '++id, url, title, *categories, *sessions' // non-indexed fields: metadata, sortkey
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

	async addTabsToArchive(tabsWithCategories, sessionId) {
		let justUrls = [];
		let newTableEntries = [];
		let urlsWithIndices = {};
		
		let currentDate = Date.now();

		// Convert our list of tabs into the correct format for the database.
		let currentIndex = 0;
		for (const tabWithCategories of tabsWithCategories) {
			justUrls.push(tabWithCategories.tab.url);
			
			newTableEntries.push({
				url: tabWithCategories.tab.url,
				title: tabWithCategories.tab.title,
				categories: tabWithCategories.categories,
				sessions: [ sessionId ],
				metadata: tabWithCategories.tab,
				sortkey: { keyHigh: currentDate, keyMid: tabWithCategories.tab.windowId, keyLow: tabWithCategories.tab.id }
			});
			
			urlsWithIndices[tabWithCategories.tab.url] = currentIndex;
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
		
		console.log(newTableEntries);
		await this.tabs.bulkPut(newTableEntries);
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
}

export const db = new TabArchiveDB();
export { db as default };
