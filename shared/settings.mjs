import debugh from "./debughelper.mjs";

export class Settings {
	constructor() {
		this._supportedColors = [
			"gray",
			"red",
			"pink",
			"grape",
			"violet",
			"indigo",
			"blue",
			"cyan",
			"teal",
			"green",
			"lime",
			"yellow",
			"orange",
		];
		Object.freeze(this._supportedColors);
		
		this._storage = {};
		this._defaultSettings = {
			archiveSettings: {
				archiveHiddenTabs: false,
				archivePinnedTabs: false,
				noDuplicateUrls: false,
				autoCloseArchivedTabs: true,
				
				savePreviewImages: false,
				previewImageFormat: "jpeg",
				previewImageQuality: 92,
				previewImageScale: 0.25,
				
				archiveTabOnClose: false,
				archiveAllTabsOnBrowserClose: false,
				archiveOnBrowserCloseArchivesHiddenTabs: false,
				archiveOnBrowserCloseArchivesPinnedTabs: false,
				archiveOnBrowserCloseClosesTab: false,
				
				// Should be overwritten by the extension only.
				currentSessionDate: Date.now()
			},
			openSettings: {
				deleteTabsUponOpen: false,
				tabOpenPosition: "nextToActiveTab",
				confirmTabDeletion: true
			}
		};
		
		this._storage.currentSettings = JSON.parse(JSON.stringify(this._defaultSettings));
		
		this._storagePromise = browser.storage.sync.get(this._storage);
		
		browser.storage.sync.onChanged.addListener((changes) => {
			debugh.log("Detected changed settings in sync storage.");
			
			for (const changedKey in changes) {
				if (this._storage[changedKey]) {
					this._storage[changedKey] = JSON.parse(JSON.stringify(changes[changedKey].newValue));
				}
			}
			
			this._storagePromise = browser.storage.sync.get(this._storage);
		});
	}
	
	async waitForInitialization() {
		if (this._storagePromise) {
			await this._storagePromise;
			//this._storagePromise = null;
		}
	}
	
	get supportedColors() {
		return this._supportedColors;
	}
	
	get archiveSettings() {	
		return (async () => {
			try {
				this._storage = await this._storagePromise;
			} catch(e) {}
			return this._storage.currentSettings.archiveSettings;
		})();
	}
	
	get openSettings() {	
		return (async () => {
			try {
				this._storage = await this._storagePromise;
			} catch(e) {}
			return this._storage.currentSettings.openSettings;
		})();
	}
	
	async update() {
		return browser.storage.sync.set(this._storage);
	}
	
	async reset() {
		this._storage.currentSettings = JSON.parse(JSON.stringify(this._defaultSettings));
		
		return this.update();
	}
}

export const settings = new Settings();
export { settings as default };
