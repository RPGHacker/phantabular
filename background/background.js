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
		await db.archiveTabs(tabs, windowData.sessionDate);
		
		if (archiveSettings.autoCloseArchivedTabs) {
			// Get a list of how many tabs we're closing in each window.
			const windowInfos = {};
			for (const tab of tabs) {
				if (typeof windowInfos[tab.windowId] === "undefined") {
					windowInfos[tab.windowId] = {
						windowId: tab.windowId,
						closingTabCount: 0,
						willBeClosed: false
					};
				}
				
				windowInfos[tab.windowId].closingTabCount++;
			}
			
			// Check if we're closing all tabs of a window - if so, it means the
			// window would be closed as a result.
			const promisesToAwait = [];
			for (const windowId in windowInfos) {
				const windowInfo = windowInfos[windowId];
				const newPromise = browser.tabs.query({windowId: windowInfo.windowId}).then((tabs) => {
					windowInfo.willBeClosed = (windowInfo.closingTabCount >= tabs.length);
				});
				promisesToAwait.push(newPromise);
			}
			
			for (const promiseToAwait of promisesToAwait) {
				await promiseToAwait;
			}
			
			// If a window would be closed as a result of us closing tabs, create a new tab
			// in that window to prevent it from being closed. Otherwise, it could create a destructive
			// close loop where a user's window always immediately closes after being opened.
			for (const windowId in windowInfos) {
				const windowInfo = windowInfos[windowId];
				if (windowInfo.willBeClosed) {
					browser.tabs.create({
						windowId: windowInfo.windowId,
						url: '../archive/archive.html'
					});
				}
			}
			
			// Finally close our tabs.
			const justTabIds = tabs.map((tab) => tab.id);
			await browser.tabs.remove(justTabIds);
		}
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
