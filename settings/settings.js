import settings from "../shared/settings.mjs";
import db from "../shared/database.mjs";

function initializeForms(archiveSettings, openSettings) {
	archiveHiddenTabsCheckbox.checked = archiveSettings.archiveHiddenTabs;
	archivePinnedTabsCheckbox.checked = archiveSettings.archivePinnedTabs;
	noDuplicateUrlsCheckbox.checked = archiveSettings.noDuplicateUrls;
	autoCloseCheckbox.checked = archiveSettings.autoCloseArchivedTabs;
	archiveAllOnCloseCheckbox.checked = archiveSettings.archiveAllTabsOnBrowserClose;
	
	deleteTabsUponOpen.checked = openSettings.deleteTabsUponOpen;
	tabOpenPosition.value = openSettings.tabOpenPosition;
	confirmTabDeletionCheckbox.checked = openSettings.confirmTabDeletion;
}

settings.archiveSettings.then((archiveSettings) => {
	settings.openSettings.then((openSettings) => {
		initializeForms(archiveSettings, openSettings);
	});
});

async function saveChanges() {
	const archiveSettings = await settings.archiveSettings;
	const openSettings = await settings.openSettings;
	
	archiveSettings.archiveHiddenTabs = archiveHiddenTabsCheckbox.checked;
	archiveSettings.archivePinnedTabs = archivePinnedTabsCheckbox.checked;
	archiveSettings.noDuplicateUrls = noDuplicateUrlsCheckbox.checked;
	archiveSettings.autoCloseArchivedTabs = autoCloseCheckbox.checked;
	archiveSettings.archiveAllTabsOnBrowserClose = archiveAllOnCloseCheckbox.checked;
	
	openSettings.deleteTabsUponOpen = deleteTabsUponOpen.checked;
	openSettings.tabOpenPosition = tabOpenPosition.value;
	openSettings.confirmTabDeletion = confirmTabDeletionCheckbox.checked;
	
	settings.update();
}


document.addEventListener("change", (e) => {
	saveChanges();
});


document.addEventListener("click", (e) => {
	if (e.target.tagName !== "BUTTON") {
		return;
	}

	switch (e.target.dataset.action) {
		case "reset-settings":
			console.log("[Tab Archive] Resetting settings.");
			settings.reset().then(() => {
				settings.archiveSettings.then((archiveSettings) => {
					initializeForms(archiveSettings);
				});				
			});
			break;
			
		case "delete-archive":
			console.log("[Tab Archive] Requesting deletion of archive.");
			confirmArchiveDeletionDialog.showModal();
			break;
			
		case "cancel-archive-deletion":
			console.log("[Tab Archive] Cancelling deletion of archive.");
			confirmArchiveDeletionDialog.close();
			break;
			
		case "confirm-archive-deletion":
			console.log("[Tab Archive] Deleting archive.");
			
			deletingArchiveDialog.showModal();
			
			db.deleteArchive().then(() => {
				// Add a timer so that in case the database delete happens to
				// be super fast, we still briefly get to see the confirmation dialog.
				new Promise(r => setTimeout(r, 1000)).then(() => {				
					deletingArchiveDialog.close();
				});
			});
			
			break;
	}
});
