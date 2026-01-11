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
		this._defaultStorage = {
			archiveSettings: {
				noDuplicateUrls: false,
				onlyStoreLatestSession: false,
				
				autoCloseArchivedTabsFromPopup: true,
				archiveHiddenTabsFromPopup: false,
				closeHiddenTabsFromPopup: false,
				archivePinnedTabsFrompPopup: false,
				closePinnedTabsFromPopup: false,
				
				archiveAllTabsOnSessionRestore: false,
				autoCloseArchivedTabsFromSessionRestore: true,
				archiveHiddenTabsFromSessionRestore: false,
				closeHiddenTabsFromSessionRestore: false,
				archivePinnedTabsFromSessionRestore: false,
				closePinnedTabsFromSessionRestore: false,
				
				savePreviewImages: false,
				previewImageFormat: "jpeg",
				previewImageQuality: 92,
				previewImageScale: 0.25,
			},
			openSettings: {
				deleteTabsUponOpen: false,
				tabOpenPosition: "nextToActiveTab",
				confirmTabDeletion: true,
			}
		};
		
		this._storage = JSON.parse(JSON.stringify(this._defaultStorage));
		
		this._storagePromise = browser.storage.sync.get(this._storage);
		
		this._storagePromise.then((storage) => {
			this._storage = storage;
			this._patchMissingSettings(this._storage, this._defaultStorage);
			// TODO: Also remove settings that no longer exist.
			this._storagePromise = null;
		});
		
		browser.storage.sync.onChanged.addListener((changes) => {
			debugh.log("Detected changed settings in sync storage.");
			
			for (const changedKey in changes) {
				if (this._storage[changedKey]) {
					this._storage[changedKey] = JSON.parse(JSON.stringify(changes[changedKey].newValue));
					this._patchMissingSettings(this._storage[changedKey], this._defaultStorage[changedKey]);
				}
			}
		});
	}
	
	_patchMissingSettings(target, source) {
		for (const key in source) {
			if (typeof target[key] === "object") {
				if (typeof target[key] === "undefined") {
					target[key] = JSON.parse(JSON.stringify(source[key]));
				} else {
					this._patchMissingSettings(target[key], source[key]);
				}
			} else {
				if (typeof target[key] === "undefined") {
					target[key] = source[key];
				}
			}
		}
	}
	
	get supportedColors() {
		return this._supportedColors;
	}
	
	get archiveSettings() {	
		return (async () => {
			if (this._storagePromise !== null) {
				await this._storagePromise;
			}
			
			return this._storage.archiveSettings;
		})();
	}
	
	get openSettings() {	
		return (async () => {
			if (this._storagePromise !== null) {
				await this._storagePromise;
			}
			
			return this._storage.openSettings;
		})();
	}
	
	async update() {
		return browser.storage.sync.set(this._storage);
	}
	
	async reset() {
		this._storage = JSON.parse(JSON.stringify(this._defaultStorage));
		
		return this.update();
	}
}

export const settings = new Settings();
export { settings as default };
