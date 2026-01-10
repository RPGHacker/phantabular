import debugh from "/shared/debughelper.mjs";
import settings from "/shared/settings.mjs";
import db from "/shared/database.mjs";


debugh.log("Initializing background script.");


async function archiveTabs(tabs, windowData) {	
	if (tabs.length === 0) {
		return;
	}
	
	const archiveSettings = await settings.archiveSettings;
	
	try {
		const archivedTabs = await db.archiveTabs(tabs, windowData.sessionDate);
		db.doPostArchivalClose(archivedTabs);
	} catch (error) {
		debugh.error("Failed to archive tabs on session restore:", error);
	}
}

async function checkOpenWindow(tabsToArchive, outWindowData, openWindow) {
	debugh.log("Checking window with ID:", openWindow.id);
	debugh.logVerbose("Window details:", openWindow);
	
	let windowData = null;
	
	try {
		windowData = await browser.sessions.getWindowValue(openWindow.id, "phantabular");
	} catch {}
	
	if (windowData) {
		// This is an old window - likely a restored session. Check if it needs to be archived!
		debugh.log(openWindow.id, "is likely a restored window. Checking for archival.");
	
		const archiveSettings = await settings.archiveSettings;
		
		// TODO: Replace by proper setting!
		if (archiveSettings.archiveAllTabsOnBrowserClose) {
			let windowTabs = openWindow.tabs;
			
			if (!windowTabs) {
				windowTabs = await browser.tabs.query({windowId: openWindow.id});
			}
			
			for (const windowTab of windowTabs) {
				if ((!archiveSettings.archiveHiddenTabs && windowTab.hidden)
					|| (!archiveSettings.archivePinnedTabs && windowTab.pinned)
				) {
					continue;
				}
				
				tabsToArchive.push(windowTab);
			}
			
			outWindowData.sessionDate = windowData.sessionDate;
		}

		windowData.sessionDate = Date.now();
		/*await*/ browser.sessions.setWindowValue(openWindow.id, "phantabular", windowData);
	} else {
		// This is a new window. Initialize it!
		debugh.log(openWindow.id, "is likely a new window. Initializing.");
		
		const initialValue = {
			version: 0,
			sessionDate: Date.now()
		}
		/*await*/ browser.sessions.setWindowValue(openWindow.id, "phantabular", initialValue);
	}
}

browser.windows.onCreated.addListener(async (newWindow) => {
	debugh.log("Detected newly created window with ID:", newWindow.id);
	debugh.logVerbose("Window details:", newWindow);

	const tabsToArchive = [];
	const windowData = {};
	await checkOpenWindow(tabsToArchive, windowData, newWindow);
	
	await archiveTabs(tabsToArchive, windowData);
});

async function initializeAllOpenWindows() {	
	const openWindows = await browser.windows.getAll({populate: true, windowTypes: ["normal"]});
	
	debugh.log("Found", openWindows.length, "open windows.");
	debugh.logVerbose("Window details:", openWindows);
	
	const tabsToArchive = [];
	const windowData = {};
	const promisesToAwait = [];
	for (const openWindow of openWindows) {
		promisesToAwait.push(checkOpenWindow(tabsToArchive, windowData, openWindow));
	}
	
	for (const promiseToAwait of promisesToAwait) {
		await promiseToAwait;
	}
	
	await archiveTabs(tabsToArchive, windowData);
}

browser.runtime.onStartup.addListener(async () => {
	debugh.log("Browser was just started. Running open window check.");
	await initializeAllOpenWindows();
});

browser.runtime.onInstalled.addListener(async () => {
	debugh.log("Extension was just installed. Running open window check.");
	await initializeAllOpenWindows();
});
