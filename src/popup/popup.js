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
		
		if (archiveSettings.contextSpecificSettings.popup.autoCloseArchivedTabs) {
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
	if (e.target.tagName !== "BUTTON" || !e.target.closest("#popupContentRoot")) {
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

// Because popup windows are kinda special and require setting a size manually to support certain behaviors,
// we need to invest a little bit of extra effort here to make them look nicely even if the resolution
// on the target device is too small to make the full popup fit. The mode parameter is passed in via
// the extension's action in in manifest.json.
let isPopupWindow = (new URLSearchParams(location.search).get("mode") === "popup");

function updateMaxHeight() {	
	// Determined by trial and error. Not sure what the proper way would be to calculate this (that also needs
	// to work in the context of a popup).
	const requiredHeight = popupContentRoot.scrollHeight + 22;
	let availableHeight = window.innerHeight;
	
	if (isPopupWindow) {
		// Okay, this calculation here is the fuckiest of fucky hacks and probably only works on exactly my own machine.
		// Excuse the language here, but I'm losing it a bit after hours of trying to get this to work. window.innerHeight,
		// when used in extension popup windows, does just not work. At least not in the scenario I tested with a browser
		// window at 2x scale. The size returned by it is just too large, causing the popup to be cut off. To make matters
		// worse, the value keeps shrinking after resizing the document. Using it here would cause the onresize event below
		// to fire infinitely often, shrinking the window every time (until it wraps around). And then it turns out innerHeight
		// does not even actually change when the browser window size does. At least it didn't in my tests. Well, outerHeight
		// seems to have none of these issues. It does NOT constantly change size on window resize, it DOES return a height that
		// is affected by the browser window size and it does NOT cause a negative feedback loop. The only issue? Well, it doesn't
		// actually return the size that we need. So what I did was just use trial and error to determine how much I need to
		// subtract from it before the popup exactly seems to fit the available screen space - which is exactly why this likely
		// ONLY really works on this machine here, since the delta here is probably affected by things like task bar and
		// browser settings. Whatever. It's the only even remotely working solution I could find, and chances are this won't
		// even effect a single user out there, as it seems rare to even run a browser at a scale and display resolution
		// where not the entire popup window just fully fits into the browser window.
		availableHeight = window.outerHeight - 113;
	}
	
	// The subracted pixels here are once again determined by trial and error.
	let maxHeight = Math.min(availableHeight - 8, requiredHeight);
	
	document.documentElement.style.height = `${maxHeight}px`;
}

document.addEventListener("DOMContentLoaded", updateMaxHeight);

window.onresize = () => {
	updateMaxHeight();
};
