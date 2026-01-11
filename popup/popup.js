import debugh from "../shared/debughelper.mjs";
import settings from "../shared/settings.mjs";
import db from "../shared/database.mjs";

let hasCapturePermission = false;
	
async function updatePreviewImageCapturePermissions() {
	let allPermissions = await browser.permissions.getAll();
	
	hasCapturePermission = allPermissions.origins.includes("<all_urls>");
}

browser.permissions.onAdded.addListener(updatePreviewImageCapturePermissions);
browser.permissions.onRemoved.addListener(updatePreviewImageCapturePermissions);

updatePreviewImageCapturePermissions();


async function archiveTabs(tabs, origin) {
	spinnerRoot.hidden = false;
	
	const archiveSettings = await settings.archiveSettings;
	
	try {
		const archivedTabs = await db.archiveTabs(tabs, origin);
		
		if (archiveSettings.autoCloseArchivedTabsFromPopup) {
			db.doPostArchivalClose(archivedTabs, origin);
		}
		
		// A little timeout to prevent the spinner from disappearing so fast it looks glitchy.
		await new Promise(r => setTimeout(r, 250));
	} catch (error) {
		archiveTabsError.textContent = error;
		archiveTabsErrorDialog.showModal();
	}
	
	spinnerRoot.hidden = true;
}

document.addEventListener("click", async (e) => {
	if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
		return;
	}
	
	const archiveSettings = await settings.archiveSettings;
	
	let tabQuery = null;
	let origin = "popup";

	switch (e.target.dataset.action) {
		case "archive-selected-tabs":
			debugh.log("Archiving selected tabs.");
			
			tabQuery = {
				highlighted: true,
				currentWindow: true
			};
			
			origin = "popup-manual-selection";
			
			break;
		case "archive-tabs-in-current-window":
			debugh.log("Archiving tabs in current window.");
			
			tabQuery = {
				currentWindow: true
			};
			
			break;
		case "archive-tabs-in-all-windows":
			debugh.log("Archiving tabs in all windows.");
			
			tabQuery = {
			};
			
			break;
	}
	
	if (tabQuery !== null) {
		await browser.tabs.query(tabQuery).then((tabs) => {
			archiveTabs(tabs, origin);
		});
		return;
	}
		
	switch (e.target.dataset.action) {
		case "view-archive":
			debugh.log("Viewing archive.");
			browser.tabs.create({
			url: '../archive/archive.html'
			});
			window.close();
			break;
		case "view-settings":
			debugh.log("Viewing settings.");
			browser.tabs.create({
			url: '../settings/settings.html'
			});
			window.close();
			break;
	}
});
