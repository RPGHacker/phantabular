import settings from "../shared/settings.mjs";
import db from "../shared/database.mjs";

let previewImageTimer = null;
let hasCapturePermission = false;

function initializeForms(archiveSettings, openSettings) {
	archiveHiddenTabsCheckbox.checked = archiveSettings.archiveHiddenTabs;
	archivePinnedTabsCheckbox.checked = archiveSettings.archivePinnedTabs;
	noDuplicateUrlsCheckbox.checked = archiveSettings.noDuplicateUrls;
	autoCloseCheckbox.checked = archiveSettings.autoCloseArchivedTabs;
	archiveAllOnCloseCheckbox.checked = archiveSettings.archiveAllTabsOnBrowserClose;
	
	savePreviewImagesCheckbox.checked = archiveSettings.savePreviewImages;
	previewImageFormatSelect.value = archiveSettings.previewImageFormat;
	previewImageQualityRange.value = archiveSettings.previewImageQuality;
	previewImageQualityNumber.value = archiveSettings.previewImageQuality;
	previewImageScaleRange.value = archiveSettings.previewImageScale * 100;
	previewImageScaleNumber.value = archiveSettings.previewImageScale * 100;
	
	deleteTabsUponOpenCheckbox.checked = openSettings.deleteTabsUponOpen;
	tabOpenPositionSelect.value = openSettings.tabOpenPosition;
	confirmTabDeletionCheckbox.checked = openSettings.confirmTabDeletion;
	
	updateFormActivityStates();
	refreshPreviewImage();
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
	
	archiveSettings.savePreviewImages = savePreviewImagesCheckbox.checked;
	archiveSettings.previewImageFormat = previewImageFormatSelect.value;
	archiveSettings.previewImageQuality = parseInt(previewImageQualityNumber.value);
	archiveSettings.previewImageScale = parseInt(previewImageScaleNumber.value) / 100;
	
	openSettings.deleteTabsUponOpen = deleteTabsUponOpenCheckbox.checked;
	openSettings.tabOpenPosition = tabOpenPositionSelect.value;
	openSettings.confirmTabDeletion = confirmTabDeletionCheckbox.checked;
	
	settings.update();
}

function setLabelDisabled(label, disabled) {	
	if (disabled) {
		label.setAttribute("disabled", "");
	} else {
		label.removeAttribute("disabled");
	}
}

async function updateFormActivityStates() {
	const archiveSettings = await settings.archiveSettings;
	
	const showPreviewImageFormatSelection = archiveSettings.savePreviewImages;
	const showPreviewImageQualitySelection = showPreviewImageFormatSelection && archiveSettings.previewImageFormat == "jpeg";
	const showPreviewImageScaleSelection = showPreviewImageFormatSelection;
	
	setLabelDisabled(previewImageFormatLabel, !showPreviewImageFormatSelection);
	previewImageFormatSelect.disabled = !showPreviewImageFormatSelection;
	
	setLabelDisabled(previewImageQualityLabel, !showPreviewImageQualitySelection);
	previewImageQualityRange.disabled = !showPreviewImageQualitySelection;
	previewImageQualityNumber.disabled = !showPreviewImageQualitySelection;
	
	setLabelDisabled(previewImageScaleLabel, !showPreviewImageScaleSelection);
	setLabelDisabled(previewImageScalePercentLabel, !showPreviewImageScaleSelection);
	previewImageScaleRange.disabled = !showPreviewImageScaleSelection;
	previewImageScaleNumber.disabled = !showPreviewImageScaleSelection;
}


function toReadableFileSize(sizeInBytes, decimalPlaces=2) {
	const threshold = 1024;

	if (Math.abs(sizeInBytes) < threshold) {
		return sizeInBytes + ' bytes';
	}
	
	const unitSuffixes = [ 'kilobytes', 'megabytes', 'gigabytes' ];
	let unitIndex = -1;
	const decimalPlaceMultiplier = 10**decimalPlaces;
	
	do {
		sizeInBytes /= threshold;
		++unitIndex;
	} while (Math.round(Math.abs(sizeInBytes) * decimalPlaceMultiplier) / decimalPlaceMultiplier >= threshold && unitIndex < unitSuffixes.length - 1);


	return sizeInBytes.toFixed(decimalPlaces) + ' ' + unitSuffixes[unitIndex];
}


async function refreshPreviewImage() {
	clearTimeout(previewImageTimer);

	previewImageTimer = setTimeout(async () => {
		const archiveSettings = await settings.archiveSettings;
		
		if (archiveSettings.savePreviewImages) {
			await updatePreviewImageCapturePermissions();
			
			if (!hasCapturePermission) {
				needsCapturePermissionDialog.showModal();
				return;
			}
			
			const activeTab = (await browser.tabs.query({ active: true, currentWindow: true }))[0];
			
			const previewOptions = {
				format: archiveSettings.previewImageFormat,
				quality: archiveSettings.previewImageQuality,
				rect: {
					x: previewImageSourceContent.offsetLeft,
					y: previewImageSourceContent.offsetTop,
					width: previewImageSourceContent.offsetWidth,
					height: previewImageSourceContent.offsetHeight
				},
				scale: archiveSettings.previewImageScale / window.devicePixelRatio
			};
			
			const sizeEstimateOptions = JSON.parse(JSON.stringify(previewOptions));
			sizeEstimateOptions.rect = undefined;
			
			const sizeEstimateCapturePromise = browser.tabs.captureTab(activeTab.id, sizeEstimateOptions);
			const previewImageData = await browser.tabs.captureTab(activeTab.id, previewOptions);
			
			previewImageContainer.textContent = "";
			previewImageContainer.insertAdjacentHTML("afterbegin", `
				<img src="${previewImageData}" class="capture-preview-target-content"/>
			`);
			
			const sizeEstimateImageData = await sizeEstimateCapturePromise;
			
			previewImageSizeEstimateLabel.textContent = toReadableFileSize(new Blob([sizeEstimateImageData]).size);
		} else {
			previewImageContainer.textContent = "";
			previewImageSizeEstimateLabel.textContent = "0 bytes";
		}
	}, 100);
}

async function updatePreviewImageCapturePermissions() {
	let allPermissions = await browser.permissions.getAll();
	
	hasCapturePermission = allPermissions.origins.includes("<all_urls>");
}

async function requestPreviewImageCapturePermissions() {	
	const permissionsToRequest = {
		origins: ["<all_urls>"]
	}
	
	hasCapturePermission = await browser.permissions.request(permissionsToRequest);
}

browser.permissions.onAdded.addListener(updatePreviewImageCapturePermissions);
browser.permissions.onRemoved.addListener(updatePreviewImageCapturePermissions);


document.addEventListener("input", async (e) => {
	let updatePreviewImage = false;
	
	if (e.target == previewImageQualityRange) {
		previewImageQualityNumber.value = previewImageQualityRange.value;
		updatePreviewImage = true;
	} else if (e.target == previewImageQualityNumber) {
		previewImageQualityRange.value = previewImageQualityNumber.value;
		updatePreviewImage = true;
	}
	
	if (e.target == previewImageScaleRange) {
		previewImageScaleNumber.value = previewImageScaleRange.value;
		updatePreviewImage = true;
	} else if (e.target == previewImageScaleNumber) {
		previewImageScaleRange.value = previewImageScaleNumber.value;
		updatePreviewImage = true;
	}
	
	if (updatePreviewImage) {
		refreshPreviewImage();
	}
});


document.addEventListener("change", async (e) => {
	// A very sucky place to have this check, but Firefox requires permission
	// requests to always be coming directly from a user input action.
	if (e.target == savePreviewImagesCheckbox && savePreviewImagesCheckbox.checked) {
		await requestPreviewImageCapturePermissions();
	}
	
	await saveChanges();
	updateFormActivityStates();
	refreshPreviewImage();
});

document.addEventListener("toggle", async (e) => {
	if (e.target === previewImageRoot && previewImageRoot.open) {
		refreshPreviewImage();
	}
}, true);


document.addEventListener("click", (e) => {
	if (e.target.tagName !== "BUTTON") {
		return;
	}

	switch (e.target.dataset.action) {
		case "reset-settings":
			console.log("[Tab Archive] Resetting settings.");
			settings.reset().then(() => {
				settings.archiveSettings.then((archiveSettings) => {
					settings.openSettings.then((openSettings) => {
						initializeForms(archiveSettings, openSettings);
					});
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
