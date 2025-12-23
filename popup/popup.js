import db from "../shared/database.mjs";
import ruleeval from "../shared/rules.mjs";
import settings from "../shared/settings.mjs";

let hasCapturePermission = false;

async function updatePreviewImageCapturePermissions() {
	let allPermissions = await browser.permissions.getAll();
	
	hasCapturePermission = allPermissions.origins.includes("<all_urls>");
}

browser.permissions.onAdded.addListener(updatePreviewImageCapturePermissions);
browser.permissions.onRemoved.addListener(updatePreviewImageCapturePermissions);

updatePreviewImageCapturePermissions();


async function archiveTabs(tabs) {
	spinnerRoot.hidden = false;
	
	try {
		await db.archiveTabs(tabs);
		// A little timeout to prevent the spinner from disappearing so fast it looks glitchy.
		await new Promise(r => setTimeout(r, 250));
	} catch (error) {
		archiveTabsError.textContent = error;
		archiveTabsErrorDialog.showModal();
	}
	
	spinnerRoot.hidden = true;
}

document.addEventListener("click", (e) => {
	if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
		return;
	}

	switch (e.target.dataset.action) {
		case "archive-selected-tabs":
			console.log("[PhanTabular] Archiving selected tabs.");
			browser.tabs
				.query({ highlighted: true, currentWindow: true })
				.then(archiveTabs);
			break;
		case "archive-tabs-in-current-window":
			console.log("[PhanTabular] Archiving tabs in current window.");
			browser.tabs
				.query({ currentWindow: true })
				.then(archiveTabs);
			break;
		case "archive-tabs-in-all-windows":
			console.log("[PhanTabular] Archiving tabs in all windows.");
			browser.tabs
				.query({ })
				.then(archiveTabs);
			break;
		case "view-archive":
			console.log("[PhanTabular] Viewing archive.");
			browser.tabs.create({
			  url: '../archive/archive.html'
			});
			window.close();
			break;
		case "view-settings":
			console.log("[PhanTabular] Viewing settings.");
			browser.tabs.create({
			  url: '../settings/settings.html'
			});
			window.close();
			break;
	}
});
