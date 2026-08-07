import debugh from "../shared/debughelper.mjs";
import settings from "../shared/settings.mjs";
import db from "../shared/database.mjs";


debugh.log("Initializing background script.");


async function archiveTabs(tabs, windowData) {	
	if (tabs.length === 0) {
		return;
	}
	
	const archiveSettings = await settings.archiveSettings;
	
	try {
		const origin = "session-restore";
		const archivedTabs = await db.archiveTabs(tabs, origin, windowData.sessionDate);
		
		if (archiveSettings.contextSpecificSettings.sessionRestore.autoCloseArchivedTabs) {
			db.doPostArchivalClose(archivedTabs, origin);
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
		
		if (archiveSettings.contextSpecificSettings.sessionRestore.archiveAllTabs) {
			let windowTabs = openWindow.tabs;
			
			if (!windowTabs) {
				windowTabs = await browser.tabs.query({windowId: openWindow.id});
			}
			
			for (const windowTab of windowTabs) {				
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

async function toggleArchive() {
	const archiveUrl = browser.runtime.getURL("archive/archive.html");
	
	const openArchiveTabs = await browser.tabs.query({ currentWindow: true, url: archiveUrl });
	
	if (openArchiveTabs.length > 0) {
		let openTab = openArchiveTabs[0];
		
		for (const openArchiveTab of openArchiveTabs) {
			if (openArchiveTab.active) {
				openTab = openArchiveTab;
				break;
			}
		}
		
		if (openTab.active) {
			debugh.logVerbose("Archive tab already open and active - closing it.");
			browser.tabs.remove(openTab.id);
		} else {
			debugh.logVerbose("Archive tab already open, but inactive - activating it.");
			browser.tabs.update(openTab.id, {active: true});
		}
	} else {
		debugh.logVerbose("No archive tab open - creating a new one.");
		
		const createProperties = {
			active: true,
			url: archiveUrl,
		};		
		
		browser.tabs.create(createProperties);
	}
}

async function archiveTabsViaShortcut(usedShortcut) {	
	const archiveSettings = await settings.archiveSettings;
	
	let tabQuery = null;
	let origin = "popup";
	
	switch (usedShortcut) {
		case "archive-selected-tabs":
			debugh.log("Archiving selected tabs.");
			
			tabQuery = {
				highlighted: true,
				currentWindow: true
			};
			
			origin = "popup-manual-selection";
			break;
			
		case "archive-tabs-in-window":
			debugh.log("Archiving tabs in current window.");
			
			tabQuery = {
				currentWindow: true
			};
			break;
			
		case "archive-all-tabs":
			debugh.log("Archiving tabs in all windows.");
			
			tabQuery = {
			};
			break;
	}
	
	if (tabQuery !== null) {
		const tabs = await browser.tabs.query(tabQuery);
		
		const archivedTabs = await db.archiveTabs(tabs, origin);
		
		if (archiveSettings.contextSpecificSettings.popup.autoCloseArchivedTabs) {
			db.doPostArchivalClose(archivedTabs, origin);
		}
	}
}

browser.commands.onCommand.addListener((command) => {
	switch (command) {
		case "open-close-archive":
			debugh.log("\"open-close-archive\" shortcut activated.");
			toggleArchive();
			break;
			
		case "archive-selected-tabs":
			archiveTabsViaShortcut(command);
			break;
			
		case "archive-tabs-in-window":
			archiveTabsViaShortcut(command);
			break;
			
		case "archive-all-tabs":
			archiveTabsViaShortcut(command);
			break;
	}
});
