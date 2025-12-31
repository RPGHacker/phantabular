import db from "/shared/database.mjs";
import settings from "/shared/settings.mjs";


async function capturePreviewImage(tab) {
	if (await db.hasPreviewImageCapturePermissions()) {
		try {
			return await db.capturePrewviewImage(tab);
		} catch {}
	}
	
	return null;
}


async function fillCacheEntry(cacheEntry, tab) {
	cacheEntry = {
		id: tab.id,
		metadata: tab
	};
	
	const previewImage = capturePreviewImage(tab);
	
	if (previewImage) {
		cacheEntry.previewimageurl = previewImage;
	}
}


async function checkCreatedTab(tab) {
	const existingTabs = await db.getCachedTabs([tab.id]);
		
	const archiveSettings = await settings.archiveSettings;
	
	if (existingTabs.length === 0 || !existingTabs[0]) {
		// This is a tab not in the cache yet and thus likely a newly created tab.
		// Add it to the cache now.
		const cacheEntry = {};
		await fillCacheEntry(cacheEntry, tab);
		await db.writeCachedTabs([cacheEntry]);
	} else if (!archiveSettings.archiveAllTabsOnBrowserClose) {
		// The tab is already in our cache, but we don't have "archiveAllTabsOnBrowserClose" enabled.
		// Just update the entry in the cache and do nothing else.
		const cacheEntry = existingTabs[0];
		await fillCacheEntry(cacheEntry, tab);
		await db.writeCachedTabs([cacheEntry]);
	} else {
		// This tab is already in the cache and we do have "archiveAllTabsOnBrowserClose" enabled.
		// The most likely scenario is that we just opened the browser and the tab has been restored,
		// because it couldn't be archived during the previous sesson for some reason, so now is the time
		// to ACTUALLY archive it.
		cacheEntry = existingTabs[0];
		const tabToArchive = cacheEntry.metadata;
		
		if (cacheEntry.previewimageurl) {
			tabToArchive.previewImage = previewimageurl;
		}
		
		try {
			await db.archiveTabs(tabToArchive);
			await db.deletedCachedTabs([cacheEntry.id]);
		} catch {}
	}
}

async function checkCreatedTabs(tabs) {
	for (const tab of tabs) {
		await checkCreatedTab(tab);
	}
}


// Check for all tabs that are already open (mostly relevant after newly installing the extension,
// and also probably after a session restore).
browser.tabs.query({ }).then(checkCreatedTabs);


browser.tabs.onCreated.addListener(async (tab) => {
	await checkCreatedTab(tab);
});

browser.tabs.onUpdated.addListener(async (id, change, tab) => {
	const existingTabs = await db.getCachedTabs([id]);
	let cacheEntry = {};
	
	if (existingTabs.length !== 0 && existingTabs[0]) {
		cacheEntry = existingTabs[0];
	}
	
	await fillCacheEntry(cacheEntry, tab);
	await db.writeCachedTabs([cacheEntry]);
});

browser.tabs.onRemoved.addListener(async (id, info) => {
	const archiveSettings = await settings.archiveSettings;
	
	if (info.isWindowClosing) {
		// We're closing the entire window.
		if (archiveSettings.archiveAllTabsOnBrowserClose) {
		}
	} else {
		// We're only closing an individual tab.
		if (archiveSettings.TODO) {
		}
	}
	
	db.deletedCachedTabs([id]);
});