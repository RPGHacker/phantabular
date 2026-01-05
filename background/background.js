import debugh from "/shared/debughelper.mjs";
import settings from "/shared/settings.mjs";
import db from "/shared/database.mjs";


debugh.log("Initializng background script.");


async function capturePreviewImage(tab) {
	if (await db.hasPreviewImageCapturePermissions()) {
		try {
			return await db.capturePrewviewImage(tab);
		} catch {}
	}
	
	return null;
}


async function fillCacheEntry(cacheEntry, tab) {		
	const archiveSettings = await settings.archiveSettings;
	
	cacheEntry.id = tab.id;
	cacheEntry.sessiondate = archiveSettings.currentSessionDate;
	cacheEntry.metadata = tab;
	cacheEntry.closedthrougharchival = false;
	
	const previewImage = await capturePreviewImage(tab);
	
	if (previewImage) {
		cacheEntry.previewimageurl = previewImage;
	}
}


async function checkOpenTab(tab) {
	debugh.logVerbose("Checking open tab with ID:", tab.id);
	debugh.logVerbose("Tab details:", tab);
		
	const existingTabs = await db.getCachedTabs([tab.id]);
		
	const archiveSettings = await settings.archiveSettings;
	
	if (existingTabs.length === 0 || !existingTabs[0]) {
		// This is a tab not in the cache yet and thus likely a newly created tab.
		// Add it to the cache now.
		debugh.log("Tab with ID", tab.id, "wasn't found in the cache and is likely a new tab. Writing it to the cache.");
		debugh.logVerbose("Tab details:", tab);
		const cacheEntry = {};
		await fillCacheEntry(cacheEntry, tab);
		await db.writeCachedTabs([cacheEntry]);
	} else if (!archiveSettings.archiveAllTabsOnBrowserClose
		|| existingTabs[0].sessiondate === archiveSettings.currentSessionDate
		|| (existingTabs[0].metadata.hidden && !archiveSettings.archiveOnBrowserCloseArchivesHiddenTabs)
		|| (existingTabs[0].metadata.pinned && !archiveSettings.archiveOnBrowserCloseArchivesPinnedTabs)) {
		// The tab is already in our cache, but we either don't have "archiveAllTabsOnBrowserClose" enabled,
		// or the tab isn't supposed to be archived (for any number of reasons). In this case, we just update the cache
		// and do nothing else.
		debugh.log("Updating cache entry for tab with ID:", tab.id);
		debugh.logVerbose("Tab details:", tab);
		
		if (archiveSettings.archiveAllTabsOnBrowserClose && (await debugh.verboseModeEnabled())) {
			if (existingTabs[0].sessiondate === archiveSettings.currentSessionDate) {
				debugh.logVerbose("Tab was ruled out for archival, because its session date", existingTabs[0].sessiondate, "matches the current session date.");
			} else {
				debugh.logVerbose("Tab was ruled out for archival, because user settings prevent archival of this tab.");
			}
		}
		
		const cacheEntry = existingTabs[0];
		await fillCacheEntry(cacheEntry, tab);
		await db.writeCachedTabs([cacheEntry]);
	} else {
		debugh.log("Archiving open tab from previous session with ID:", tab.id);
		debugh.logVerbose("Tab details:", tab);
		
		// This tab is already in the cache and we do have "archiveAllTabsOnBrowserClose" enabled.
		// The most likely scenario is that we just opened the browser and the tab has been restored,
		// because it couldn't be archived during the previous sesson for some reason, so now is the time
		// to ACTUALLY archive it.
		const cacheEntry = existingTabs[0];
		const tabToArchive = cacheEntry.metadata;
		
		if (cacheEntry.previewimageurl) {
			tabToArchive.previewImage = cacheEntry.previewimageurl;
		}
		
		try {
			await db.archiveTabs([tabToArchive], cacheEntry.sessiondate);
			
			if (archiveSettings.archiveOnBrowserCloseClosesTab) {
				debugh.log("Closing: ", cacheEntry.id);
				await browser.tabs.remove([cacheEntry.id]);
			}
			
			await db.deleteCachedTabs([cacheEntry.id]);
		} catch {}
	}
}

async function checkOpenTabs() {
	const tabs = await browser.tabs.query({ });
	
	debugh.logVerbose("Checking", tabs.length, "open tabs for archival.");
	debugh.logVerbose("Tab details:", tabs);
	
	for (const tab of tabs) {
		await checkOpenTab(tab);
	}
}



settings.archiveSettings.then(async (archiveSettings) => {
	const newSessionDate = Date.now();
	debugh.log("Updating current session date to:", newSessionDate);
	archiveSettings.currentSessionDate = newSessionDate;
	await settings.update();
	
	// Check for all tabs that are currently open. Either we just installed the extension and need to initialize the cache,
	// or we just restored a browser session and need to check if there's any tabs we need to archive that we couldn't archive
	// during the last session (because closing the browser prevents the onRemoved hook in here from running).
	debugh.log("Checking for tabs that need archival.");
	await checkOpenTabs();
	
	// Also check if there's still any tabs remaining in the cache that aren't currently open. The most likely cause for this
	// should be the user closing the browser and not having its "restore last session" setting enabled. The tabs couldn't be
	// archived during the previous session, but the above query also didn't get them, because these tabs are no longer open.
	const cachedTabs = await db.getAllCachedTabs();
	debugh.logVerbose(cachedTabs.length, "tabs in cache.");
	debugh.logVerbose("Cached tab details:", cachedTabs);
	
	for (const cachedTab of cachedTabs) {
		// Rule out any tabs that are currently open. These SHOULD have been archived via the query above, so the fact they
		// weren't most likely means some user settings are preventing these tabs from being archived. Basically, this is
		// a shortcut around having to check every single archival condition again here.
		let openTab = null;
		
		try {
			openTab = await browser.tabs.get(cachedTab.id);
		} catch {}
		
		if (!openTab) {
			if (archiveSettings.archiveAllTabsOnBrowserClose) {
				debugh.log("Archiving cached tab from previous session with ID:", cachedTab.metadata.id);				
				
				const tabToArchive = cachedTab.metadata;
				
				if (cachedTab.previewimageurl) {
					tabToArchive.previewImage = cachedTab.previewimageurl;
				}
				
				try {
					await db.archiveTabs([tabToArchive], cachedTab.sessiondate);
					await db.deleteCachedTabs([cachedTab.id]);
				} catch {}
			}
		} else {
			// If the tab DOES remain open, update the session date on the cached entry. All open tabs should now
			// belong to the current session.
			cachedTab.sessiondate = archiveSettings.currentSessionDate;			
			await db.writeCachedTabs([cachedTab]);
		}
	}
	
	
	// Now install our listeners so that any tabs created or closed during this session also update our cache.
	// Maybe doing it this late could cause some issues, because the user COULD open a new tab in the (hopefully) short amount
	// of time it takes to complete the functions above. However, I do think it's generally safest to install these listeners
	// only after the session date has been updated. Also the onUpdated listener should run very frequently and should cause
	// any tabs that have been missed within this time frame to still end up in the cache.
	browser.tabs.onCreated.addListener(async (tab) => {
		debugh.log("Detected newly created tab with ID:", tab.id);
		debugh.logVerbose("Tab details:", tab);
		await checkOpenTab(tab);
	});
	
	browser.tabs.onUpdated.addListener(async (id, change, tab) => {
		debugh.logVerbose("Properties changed of tab with ID:", tab.id);
		debugh.logVerbose("Tab details:", tab);
		
		const existingTabs = await db.getCachedTabs([id]);
		let cacheEntry = {};
		
		if (existingTabs.length !== 0 && existingTabs[0]) {
			cacheEntry = existingTabs[0];
		}
		
		await fillCacheEntry(cacheEntry, tab);
		await db.writeCachedTabs([cacheEntry]);
	});
	
	browser.tabs.onRemoved.addListener(async (id, info) => {
		debugh.logVerbose("Closed tab with ID:", id);
		
		const archiveSettings = await settings.archiveSettings;
		
		const archiveBecauseOfWindowClose = archiveSettings.archiveAllTabsOnBrowserClose && info.isWindowClosing;
		const shouldBeArchived = archiveSettings.archiveTabOnClose || archiveBecauseOfWindowClose;
		
		if (shouldBeArchived) {
			const existingTabs = await db.getCachedTabs([id]);
			
			if (existingTabs.length === 0 || !existingTabs[0]) {
				debugh.error("Couldn't archive tab with ID", id, "on close: Tab not found in cache.");
			} else {
				const cacheEntry = existingTabs[0];
				
				// Make sure this tab hasn't already been archived.
				// This would typically happen when archiving tabs via the popup while having the
				// "Archiving tabs via the popup automatically closes them" setting enabled.
				// To prevent potentially harmful recursion, we just skip archival in that particular case.
				let canArchive = !cacheEntry.closedthrougharchival;
				
				// Also don't archive if it's a hidden or pinned tab and we configured the extension to
				// not archive those on window close.
				if (archiveBecauseOfWindowClose
					&& ((cacheEntry.metadata.hidden && !archiveSettings.archiveOnBrowserCloseArchivesHiddenTabs)
						|| (cacheEntry.metadata.pinned && !archiveSettings.archiveOnBrowserCloseArchivesPinnedTabs))) {
					canArchive = false;
				}
				
				if (canArchive) {
					const tabToArchive = cacheEntry.metadata;
					
					if (cacheEntry.previewimageurl) {
						tabToArchive.previewImage = cacheEntry.previewimageurl;
					}
					
					try {
						await db.archiveTabs([tabToArchive]);
					} catch {}
				}
			}
		}
		
		await db.deleteCachedTabs([id]);
	});
	
	browser.runtime.onMessage.addListener(async (message, sender) => {
		// If we just deleted our entire archive, we need to rebuild our tab cache from all currently open tabs.
		if (message.type === "deleted-archive") {
			debugh.log("Detected archive deletion. Rebuilding tab cache.");
			await checkOpenTabs();
		}
	});
});
