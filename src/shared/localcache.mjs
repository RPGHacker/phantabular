export class LocalCache {
	constructor() {		
		this._defaultStorage = {
			archive: {
				actionsPanelWasOpen: true,
			}
		};
		this._storage = JSON.parse(JSON.stringify(this._defaultStorage));
		
		this._storagePromise = browser.storage.local.get(this._storage);
		this._storagePromise.then((storage) => {
			this._storage = storage;
			this._patchMissingSettings(this._storage, this._defaultStorage);
			this._removeOutdatedSettings(this._storage, this._defaultStorage);
			this._storagePromise = null;
		});
		
		browser.storage.local.onChanged.addListener((changes) => {
			// Not logging changed local storage here - debughelper.mjs already does that.
			
			for (const changedKey in changes) {
				if (this._storage[changedKey]) {
					this._storage[changedKey] = JSON.parse(JSON.stringify(changes[changedKey].newValue));
					this._patchMissingSettings(this._storage[changedKey], this._defaultStorage[changedKey]);
					this._removeOutdatedSettings(this._storage, this._defaultStorage);
				}
			}
		});
	}
	
	_patchMissingSettings(target, source) {
		for (const key in source) {
			if (typeof source[key] === "object" && typeof target[key] === "object") {
				this._patchMissingSettings(target[key], source[key]);
			} else if (typeof target[key] !== typeof source[key]) {
				target[key] = source[key];
			}
		}
	}
	
	_removeOutdatedSettings(target, source) {
		for (const key in target) {
			if (typeof source[key] === "undefined") {
				delete target[key];
			} else if (typeof source[key] === "object") {
				this._removeOutdatedSettings(target[key], source[key]);
			}
		}
	}
	
	get archive() {	
		return (async () => {
			if (this._storagePromise !== null) {
				await this._storagePromise;
			}
			
			return this._storage.archive;
		})();
	}
	
	async update() {		
		return browser.storage.local.set(this._storage);
	}
}

export const localcache = new LocalCache();
export { localcache as default };
