import debugh from "/shared/debughelper.mjs";
import settings from "../shared/settings.mjs";
import db from "../shared/database.mjs";

let previewImageTimer = null;
let hasCapturePermission = false;

function createTabsView(container, tabs) {
	const returnedElements = {};
	
	container.insertAdjacentHTML("beforeend", `
		<div class="tabs-view" data-selectedtab="0">
			<div class="tabs-view-tab-selection-bar">
			</div>
			<div class="tab-view-contents-root">
			</div>
		</div>
	`);
	
	const selectionBar = container.querySelector(".tabs-view:last-of-type > .tabs-view-tab-selection-bar");
	const contentsRoot = container.querySelector(".tabs-view:last-of-type > .tab-view-contents-root");
	let tabCount = 0;
	
	for (const tabName in tabs) {
		const tabDisplayName = tabs[tabName];
		
		selectionBar.insertAdjacentHTML("beforeend", `
			<button class="tabs-view-tab-selection-button" data-tabindex="${tabCount}" data-action="select-tab">${tabDisplayName}</button>
		`);
		
		contentsRoot.insertAdjacentHTML("beforeend", `
			<div class="tab-view-contents" data-tabindex="${tabCount}">
			</div>
		`);
		
		returnedElements[tabName] = {}
		returnedElements[tabName].root = contentsRoot.querySelector(`.tab-view-contents[data-tabindex="${tabCount}"]`);
		
		tabCount++;
	}
	
	return returnedElements;
}

function createTabSpecificSettingsTabView(container, targetObject, contextName) {
	const tabs = {
		hidden: "Hidden Tabs",
		pinned: "Pinned Tabs",
		browser: "Browser-specific Tabs (\"about:\")",
		extension: "Extension Tabs (\"moz-extension:\")",
	}
	
	targetObject.tabSpecificSettings = createTabsView(container, tabs);
	
	for (const tabName in tabs) {
		targetObject.tabSpecificSettings[tabName].root.insertAdjacentHTML("beforeend", `
			<div><input type="checkbox" id="${contextName}_${tabName}_canArchive_checkbox" /><label id="${contextName}_${tabName}_canArchive_label" for="${contextName}_${tabName}_canArchive_checkbox">Can be archived</label></div>
			<div><label class="note">NOTE: The "Selected Tab(s)" button can always archive tabs.</label></div>
			<div><input type="checkbox" id="${contextName}_${tabName}_canClose_checkbox" /><label id="${contextName}_${tabName}_canClose_label" for="${contextName}_${tabName}_canClose_checkbox">Will be closed after archival</label></div>
		`);
	}
}

const contextSpecificSettingTabElements = createTabsView(contextSpecificSettings, {
	popup: "Popup",
	sessionRestore: "Session Restore",
});

contextSpecificSettingTabElements.popup.root.insertAdjacentHTML("beforeend", `
	<div><input type="checkbox" id="popup_autoCloseArchivedTabs_checkbox" /><label id="popup_autoCloseArchivedTabs_label" for="popup_autoCloseArchivedTabs_checkbox">Automatically close tabs after archival</label></div>
	
	<h3>Tab-specific settings:</h3>
`);

contextSpecificSettingTabElements.sessionRestore.root.insertAdjacentHTML("beforeend", `
	<div><input type="checkbox" id="sessionRestore_archiveAllTabs_checkbox" /><label id="sessionRestore_archiveAllTabs_label" for="sessionRestore_archiveAllTabs_checkbox">Archive all open tabs on session restore</label></div>
	<div><label class="note" >NOTE: Installing a new version of the extension will also trigger this effect and archive all tabs. Since the browser can update extensions automatically in the background, this might lead to your tabs being archived seemingly at random sometimes. (Namely whenever an update of the extension releases).</label></div>
	<div><input type="checkbox" id="sessionRestore_autoCloseArchivedTabs_checkbox" /><label id="sessionRestore_autoCloseArchivedTabs_label" for="sessionRestore_autoCloseArchivedTabs_checkbox">Automatically close tabs after archival</label></div>
	
	<h3>Tab-specific settings:</h3>
`);

for (const contextName in contextSpecificSettingTabElements) {
	const contextSpecificTabData = contextSpecificSettingTabElements[contextName];
	createTabSpecificSettingsTabView(contextSpecificTabData.root, contextSpecificTabData, contextName);
}
	
function initializeForms(archiveSettings, openSettings) {
	noDuplicateUrlsCheckbox.checked = archiveSettings.noDuplicateUrls;
	onlyStoreLatestSessionCheckbox.checked = archiveSettings.onlyStoreLatestSession;
	
	savePreviewImagesCheckbox.checked = archiveSettings.savePreviewImages;
	previewImageFormatSelect.value = archiveSettings.previewImageFormat;
	previewImageQualityRange.value = archiveSettings.previewImageQuality;
	previewImageQualityNumber.value = archiveSettings.previewImageQuality;
	previewImageScaleRange.value = archiveSettings.previewImageScale * 100;
	previewImageScaleNumber.value = archiveSettings.previewImageScale * 100;
	
	for (const contextName in archiveSettings.contextSpecificSettings) {
		const contextSpecificSettings = archiveSettings.contextSpecificSettings[contextName];
		
		for (const settingName in contextSpecificSettings) {
			const settingValue = contextSpecificSettings[settingName];
			
			if (typeof settingValue === "boolean") {
				window[`${contextName}_${settingName}_checkbox`].checked = settingValue;
			}
		}
		
		for (const tabName in contextSpecificSettings.tabSpecificSettings) {
			const tabSpecificSettings = contextSpecificSettings.tabSpecificSettings[tabName];
		
			for (const settingName in tabSpecificSettings) {
				const settingValue = tabSpecificSettings[settingName];
				
				if (typeof settingValue === "boolean") {
					window[`${contextName}_${tabName}_${settingName}_checkbox`].checked = settingValue;
				}
			}
		}
	}
	
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
	
	archiveSettings.noDuplicateUrls = noDuplicateUrlsCheckbox.checked;
	archiveSettings.onlyStoreLatestSession = onlyStoreLatestSessionCheckbox.checked;
	
	archiveSettings.savePreviewImages = savePreviewImagesCheckbox.checked;
	archiveSettings.previewImageFormat = previewImageFormatSelect.value;
	archiveSettings.previewImageQuality = parseInt(previewImageQualityNumber.value);
	archiveSettings.previewImageScale = parseInt(previewImageScaleNumber.value) / 100;
	
	for (const contextName in archiveSettings.contextSpecificSettings) {
		const contextSpecificSettings = archiveSettings.contextSpecificSettings[contextName];
		
		for (const settingName in contextSpecificSettings) {			
			if (typeof contextSpecificSettings[settingName] === "boolean") {
				contextSpecificSettings[settingName] = window[`${contextName}_${settingName}_checkbox`].checked;
			}
		}
		
		for (const tabName in contextSpecificSettings.tabSpecificSettings) {
			const tabSpecificSettings = contextSpecificSettings.tabSpecificSettings[tabName];
		
			for (const settingName in tabSpecificSettings) {				
				if (typeof tabSpecificSettings[settingName] === "boolean") {
					tabSpecificSettings[settingName] = window[`${contextName}_${tabName}_${settingName}_checkbox`].checked;
				}
			}
		}
	}
	
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

function setSettingEnabled(settingName, enabled) {
	window[`${settingName}_checkbox`].disabled = !enabled;
	setLabelDisabled(window[`${settingName}_label`], !enabled);
}

async function updateFormActivityStates() {
	const archiveSettings = await settings.archiveSettings;
	
	for (const contextName in archiveSettings.contextSpecificSettings) {
		const contextSpecificSettings = archiveSettings.contextSpecificSettings[contextName];
		
		let canChangeSettings = true;
		
		if (contextName === "sessionRestore" && !window[`${contextName}_archiveAllTabs_checkbox`].checked) {
			canChangeSettings = false;
		}
		
		setSettingEnabled(`${contextName}_autoCloseArchivedTabs`, canChangeSettings);
		
		for (const tabName in contextSpecificSettings.tabSpecificSettings) {
			const tabSpecificSettings = contextSpecificSettings.tabSpecificSettings[tabName];
		
			setSettingEnabled(`${contextName}_${tabName}_canArchive`, canChangeSettings);
			
			const canChangeCloseSetting = canChangeSettings && window[ `${contextName}_${tabName}_canArchive_checkbox` ].checked;
		
			setSettingEnabled(`${contextName}_${tabName}_canClose`, canChangeCloseSetting);
		}
	}
	
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
			
			const zoomLevel = await browser.tabs.getZoom(activeTab.id);
			
			const previewOptions = {
				format: archiveSettings.previewImageFormat,
				quality: archiveSettings.previewImageQuality,
				rect: {
					x: previewImageSourceContent.offsetLeft,
					y: previewImageSourceContent.offsetTop,
					width: previewImageSourceContent.offsetWidth,
					height: previewImageSourceContent.offsetHeight
				},
				scale: archiveSettings.previewImageScale / zoomLevel
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

updatePreviewImageCapturePermissions();


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
			debugh.log("Resetting settings.");
			settings.reset().then(() => {
				settings.archiveSettings.then((archiveSettings) => {
					settings.openSettings.then((openSettings) => {
						initializeForms(archiveSettings, openSettings);
					});
				});
			});
			break;
			
		case "delete-archive":
			debugh.log("Requesting deletion of archive.");
			confirmArchiveDeletionDialog.showModal();
			break;
			
		case "cancel-archive-deletion":
			debugh.log("Cancelling deletion of archive.");
			confirmArchiveDeletionDialog.close();
			break;
			
		case "confirm-archive-deletion":
			debugh.log("Deleting archive.");
			
			deletingArchiveDialog.showModal();
			
			db.deleteArchive().then(() => {
				// Add a timer so that in case the database delete happens to
				// be super fast, we still briefly get to see the confirmation dialog.
				new Promise(r => setTimeout(r, 1000)).then(() => {				
					deletingArchiveDialog.close();
				});
			});
			
			break;
			
		case "select-tab":
			const tabsView = e.target.closest(".tabs-view");
			tabsView.dataset.selectedtab = e.target.dataset.tabindex;
	}
});
