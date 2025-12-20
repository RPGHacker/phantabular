import db from "../shared/database.mjs";
import settings from "../shared/settings.mjs";
import ruleeval from "../shared/rules.mjs";

const minimumSpinnerDisplayTime = 250;

const activeLiveQuerySubscriptions = {};
const activeMutationObservers = {};

const windowIdRemaps = {};

let currentDragParent = null;
let currentDragElement = null;

const groupsRootList = document.querySelector("#groups-root-list");

function escapeHTML(unescaped) {
	const div = document.createElement("div");
	div.textContent = unescaped;
	return div.innerHTML;
}

function createGroup(container, className, id, displayName, actionsContent, insertLocation = "beforeend") {
	container.insertAdjacentHTML(insertLocation, `
		<details class="${className}" id="${id}" data-version="1" data-queriedversion="0" data-receivedversion="0">
			<summary>
				<span class="summary-contents">
					<span class="summary-statics">
						<span class="summary-open-marker"></span>
					</span>
					<span class="summary-dynamics">
						<span class="summary-badge">100</span>
						<span class="summary-title">${displayName}</span>
						<span class="summary-actions">${actionsContent}</span>
					</span>
				</span>
			</summary>
			<div class="group-content-setup-root overlapping-content">
				<div class="group-contents">
				</div>
			</div>
		</details>
	`);

	let group = container.querySelector("#" + id);

	incrementGroupVersion(group);
	
	return group;
}

function createSpinnerAnimation(container) {
	container.insertAdjacentHTML("beforeend", `
		<div class="spinner-root" data-activequerycount="0">
			<div class="spinner-background">
			</div>
			<div class="spinner-container">
				<div class="spinner-animation">
					<div class="spinner"></div>
				</div>
			</div>
		</div>
	`);
	
	return container.querySelector(".spinner-root");
}

function showSpinnerAnimation(container) {
	const spinnerElement = container.querySelector(".spinner-root");
	
	spinnerElement.hidden = false;
	spinnerElement.dataset.activequerycount = parseInt(spinnerElement.dataset.activequerycount) + 1;
}

function hideSpinnerAnimation(container) {
	const spinnerElement = container.querySelector(".spinner-root");
	
	const activeQueryCount = parseInt(spinnerElement.dataset.activequerycount) - 1;
	spinnerElement.dataset.activequerycount = activeQueryCount;
	
	if (activeQueryCount === 0) {
		spinnerElement.hidden = true;
	}
}

function createTabsList(container) {
	container.insertAdjacentHTML("beforeend", `
		<ul class="tabs-list">
		</ul>
		<ul class="tabs-list-for-drag-and-drop">
		</ul>
	`);
	
	return container.querySelector(".tabs-list");
}

function initializeGroupAsTabListContainer(group, type) {
	group.setAttribute("data-istablist", true);
	group.setAttribute(`data-is${type}`, true);
	
	const groupContentSetupRoot = group.querySelector(".group-content-setup-root");
	const groupContents = group.querySelector(".group-contents");
	
	const spinnerElement = createSpinnerAnimation(groupContentSetupRoot);
	const tabsList = createTabsList(groupContents);
}

function createGroupsList(container) {
	container.insertAdjacentHTML("beforeend", `
		<div class="groups-list">
		</div>
	`);
	
	const groupsList = container.querySelector(".groups-list");
	
	activeMutationObservers[container.id] = new MutationObserver((mutations, observer) => {
		for (let mutation of mutations) {
			if (mutation.type === "childList") {
				for (let removedNode of mutation.removedNodes) {
					if (removedNode.nodeType == Node.ELEMENT_NODE) {
						const group = removedNode;
						
						if (activeLiveQuerySubscriptions[group.id]) {
							activeLiveQuerySubscriptions[group.id].unsubscribe();
							activeLiveQuerySubscriptions[group.id] = undefined;
						}
					}
				}
			}
		}
	});
	
	activeMutationObservers[container.id].observe(groupsList, { childList: true });
	
	return groupsList;
}

function initializeInnerGroup(outerGroup, groupData, idPrefix, getGroupPropertiesFunction, insertLocation = "beforeend") {
	const groupProperties = getGroupPropertiesFunction(groupData);
	
	const idSuffix = groupProperties.id;

	const innerGroup = createGroup(outerGroup, "group-details group-box colorize-" + groupProperties.color, idPrefix + "-" + idSuffix, groupProperties.name, groupProperties.actions, insertLocation);
	innerGroup.setAttribute("data-" + idPrefix + "id", idSuffix);
	
	initializeGroupAsTabListContainer(innerGroup, idPrefix);
}

function initializeGroupAsChildGroupListContainer(group, type) {
	group.setAttribute("data-isgrouplist", true);
	group.setAttribute(`data-is${type}list`, true);
	
	const groupContentSetupRoot = group.querySelector(".group-content-setup-root");
	const groupContents = group.querySelector(".group-contents");
	
	const spinnerElement = createSpinnerAnimation(groupContentSetupRoot);
	const groupsList = createGroupsList(groupContents);
}

const rootGroups = {
	categories: createGroup(groupsRootList, "root-details group-box colorize-cyan", "categoriesGroup", "Categories", ""),
	sessions: createGroup(groupsRootList, "root-details group-box colorize-cyan", "sessionsGroup", "Sessions", ""),
	unsortedTabs: createGroup(groupsRootList, "root-details group-box colorize-cyan", "unsortedTabsGroup", "Unsorted Tabs", "")
}

function getCategoryProperties(category) {
	let properties = {
		name: category.name,
		id: category.id,
		color: category.color,
		actions: `
			<button data-action="edit-category-settings" class="colorize-button image-button action-button"><img src="../icons/iconoir/edits/settings-solid-fixed-light.svg" class="only-in-light-theme" style="height: 32px;" /><img src="../icons/iconoir/edits/settings-solid-fixed-dark.svg" class="only-in-dark-theme" style="height: 32px;" /></button>
			<button data-action="delete-category" class="colorize-button image-button action-button"><img src="../icons/iconoir/edits/trash-solid.svg" style="height: 32px;" /></button>
		`
	}
	
	return properties;
}

function getSessionProperties(session) {
	const dateOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
		
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	};
	
	let properties = {
		name: new Date(session.creationdate).toLocaleDateString(undefined, dateOptions),
		id: session.id,
		color: "gray",
		actions: `
			<button data-action="delete-session" class="colorize-button image-button action-button"><img src="../icons/iconoir/edits/trash-solid.svg" style="height: 32px;" /></button>
		`
	}
	
	return properties;
}


async function sortedQuery(originalQuery, sortFunction) {
	const queryResult = await originalQuery;
	return queryResult.sort(sortFunction);
}

async function querySessions() {
	return sortedQuery(db.sessions.toArray(), compareSortKeysReversed);
}

async function queryCategories() {
	return sortedQuery(db.categories.toArray(), compareSortKeysReversed);
}

async function queryTabsInSession(session) {
	return sortedQuery(db.tabs.where("sessions").equals(session.id).toArray(), compareSortKeys);
}

async function queryTabsInCategory(category) {
	return sortedQuery(db.tabs.where("categories").equals(category.id).toArray(), compareSortKeys);
}

async function queryAllTabs(_) {
	return sortedQuery(db.tabs.toCollection().toArray(), compareSortKeys);
}

initializeGroupAsTabListContainer(rootGroups.unsortedTabs, "unsortedtabs");
initializeGroupAsChildGroupListContainer(rootGroups.sessions, "sessions");
initializeGroupAsChildGroupListContainer(rootGroups.categories, "categories");

rootGroups.categories.querySelector(".group-contents").insertAdjacentHTML("afterbegin", `
	<button data-action="create-category" class="colorize-button">&#xff0b;</button>
`);


async function createNewCategory() {
	const newCategory = await db.createNewCategory();

	incrementGroupVersion(document.querySelector("[data-iscategorieslist]"));
}


const tooltipData = {
	tooltipTimer: null,
	lastMouseEvent: null
}

function updateTooltipData(e) {	
	tooltipData.lastMouseEvent = e;

	clearTimeout(tooltipData.tooltipTimer);

	tooltipData.tooltipTimer = setTimeout(async () => {	
		const tooltipElement = tooltipData.lastMouseEvent.target.closest(".has-tooltip");
		if (!tooltipElement) {
			tooltipLayer.style.opacity = 0;
			return;
		}
		
		tooltipLayer.textContent = "";
		
		switch (tooltipElement.dataset.tooltiptype) {
			case "tab":
				db.tabs.get({id: parseInt(tooltipElement.dataset.tabid)}).then((tab) => {
					tooltipLayer.insertAdjacentHTML("afterbegin", `
						<div>
							<span class="fav-icon-list-item" data-validimage="${tab.metadata.favIconUrl !== undefined}"><img src="${tab.metadata.favIconUrl}" class="fav-icon-small"></span><span class="tooltip-title">${tab.title}</span>
						</div>
						<div><a href="${tab.url}" class="colorize-link">${tab.url}</a></div>
						<div>
							<span class="metadata-entry"><img src="../icons/iconoir/edits/web-window-solid-dark.svg" class="only-in-dark-theme" /><img src="../icons/iconoir/edits/web-window-solid-light.svg" class="only-in-light-theme" /> Window Id: ${tab.metadata.windowId}</span>
							<span class="metadata-entry"><img src="../icons/iconoir/edits/window-tabs-solid-dark.svg" class="only-in-dark-theme" /><img src="../icons/iconoir/edits/window-tabs-solid-light.svg" class="only-in-light-theme" /> Tab Id: ${tab.metadata.id}</span>
							<span class="metadata-entry" data-show="${tab.metadata.pinned}"><img src="../icons/iconoir/edits/pin-solid.svg" /> Pinned</span>
							<span class="metadata-entry" data-show="${tab.metadata.hidden}"><img src="../icons/iconoir/edits/eye-closed-dark.svg" class="only-in-dark-theme" /><img src="../icons/iconoir/edits/eye-closed-light.svg" class="only-in-light-theme" /> Hidden</span>
						</div>
					`);
				});
				break;
				
			default:
				tooltipLayer.textContent = tooltipElement.dataset.tooltip;
				break;
		}
		
		const tooltipWidth = tooltipLayer.offsetWidth;
		const tooltipHeight = tooltipLayer.offsetHeight;
		
		const xOffset = 0;
		const yOffset = 20;
		
		let xPos = tooltipData.lastMouseEvent.clientX + xOffset;
		let yPos = tooltipData.lastMouseEvent.clientY + yOffset;
		
		if (tooltipWidth + xPos > window.innerWidth) {
			xPos = window.innerWidth - tooltipWidth;
		}
		
		if (tooltipHeight + yPos > window.innerHeight) {
			yPos = tooltipData.lastMouseEvent.clientY - yOffset - tooltipHeight;
		}
	
		tooltipLayer.style.left = `${xPos}px`;
		tooltipLayer.style.top = `${yPos}px`;
		tooltipLayer.style.opacity = 1;
	}, 500);
}


async function editCategorySettings(categoryElement) {	
	editCategoryDialog.showModal();
	
	/*
		I assume categories have already been cached by this point,
		and accessing the database again will be fast? I don't know
		how Dexie works. It's possible we need to cache stuff ourselves.
	*/
	let category = await db.categories.get({id: parseInt(categoryElement.dataset.categoryid)});
	
	editCategoryDialog.dataset.categoryid = category.id;
	categoryName.value = category.name;
	categoryRule.value = (category.rule ? category.rule : "");
	categoryColorSelector.dataset.selectedcolor = category.color;
	categoryRuleTemplates.open = false;
}

async function applyCategorySettings() {	
	const ruleIsJustWhitespace = (categoryRule.value.replace(/\s/g, "").length === 0);
	const rule = (ruleIsJustWhitespace ? undefined : categoryRule.value);
	
	try {
		await ruleeval.isRuleValid(rule);
	} catch (error) {
		console.error("Auto-catch rule validity check failed: " + error);
		ruleValidtyCheckFailedDialog.showModal();
		autoCatchRuleError.textContent = error;
		return false;
	}
	
	const categoryId = parseInt(editCategoryDialog.dataset.categoryid);
	let category = await db.categories.get({id: categoryId});
	
	const groupElement = document.querySelector("#category-" + categoryId);
	
	const categoryUpdate = {
		name: categoryName.value,
		color: categoryColorSelector.dataset.selectedcolor,
		rule: rule
	}
	
	groupElement.setAttribute("class", groupElement.getAttribute("class").replace("colorize-" + category.color, "colorize-" + categoryUpdate.color));
	groupElement.querySelector(".summary-title").textContent = categoryUpdate.name;
	
	return await db.categories.update(categoryId, categoryUpdate);
}


async function confirmCategoryDeletion(categoryId, deleteContainedTabs) {
	if (deleteContainedTabs) {
		const tabsToDelete = await db.tabs.where("categories").equals(categoryId).toArray();
		
		const justKeys = tabsToDelete.map((tab) => tab.id);
		await db.deleteTabs(justKeys);
	}
	
	await db.deleteCategory(categoryId);
	
	incrementGroupVersion(document.querySelector("[data-iscategorieslist]"));
}


async function confirmSessionDeletion(sessionId, deleteContainedTabs) {
	if (deleteContainedTabs) {
		const tabsToDelete = await db.tabs.where("sessions").equals(sessionId).toArray();
		
		const justKeys = tabsToDelete.map((tab) => tab.id);
		await db.deleteTabs(justKeys);
	}
	
	await db.deleteSession(sessionId);
	
	incrementGroupVersion(document.querySelector("[data-issessionslist]"));
}


function selectColor(clickedSelector) {
	clickedSelector.closest("[data-selectedcolor]").setAttribute("data-selectedcolor", clickedSelector.closest("[data-color]").getAttribute("data-color"));
}

function initializeColorSelector(container) {
	for (const color of settings.supportedColors) {
		container.insertAdjacentHTML("beforeend", `
			<div class="color-selector-root" data-color="${color}">
				<div class="colorize-color-selector colorize-${color}" data-action="select-color">
					<center>&#x2713;</center>
				</div>
			</div>
		`);
	}
}

initializeColorSelector(categoryColorSelector);


function escapeStringContents(input, escapableChars = ["\\", '"'], escapeChar = "\\") {
	let escaped = "";
	for (const char of input) {
		if (escapableChars.includes(char)) {
			escaped += escapeChar;
		}
		escaped += char;
	}

	return escaped;
}

function fillCategoryRuleFromTemplate() {
	let targetText = "<target>";
	
	switch (categoryTemplateTarget.value) {
		case "title":
			targetText = "tab.title";
			break;
		case "url":
			targetText = "tab.url";
			break;
	}
	
	const valueText = escapeStringContents(categoryRuleString.value);
	const caseInsensitive = categoryTemplateCaseInsensitive.checked;
	
	let lowerTransform = "";
	let caseInsensitiveRegExFlags = "";
	
	if (caseInsensitive) {
		lowerTransform = "|lower";
		caseInsensitiveRegExFlags = "i";
	}
	
	let ruleText = "";
	
	switch (categoryTemplateType.value) {
		case "never-matches":
			ruleText = "";
			break;
		case "always-matches":
			ruleText = "true";
			break;
		case "equal-to":
			ruleText = `${targetText}${lowerTransform} == "${valueText}"${lowerTransform}`;
			break;
		case "contains":
			ruleText = `"${valueText}"${lowerTransform} in ${targetText}${lowerTransform}`;
			break;
		case "doesnt-contain":
			ruleText = `!("${valueText}"${lowerTransform} in ${targetText}${lowerTransform})`;
			break;
		case "starts-with":
			ruleText = `startsWith(${targetText}${lowerTransform}, "${valueText}"${lowerTransform})`;
			break;
		case "ends-with":
			ruleText = `endsWith(${targetText}${lowerTransform}, "${valueText}"${lowerTransform})`;
			break;
		case "matches-regex":
			let userRegex = categoryRuleString.value;
			if (!userRegex.startsWith("/")) {
				userRegex = "/" + userRegex + "/";
			}

			const flagsStartIndex = userRegex.lastIndexOf("/");
			if (!userRegex.substring(flagsStartIndex+1).includes(caseInsensitiveRegExFlags)) {
				userRegex += caseInsensitiveRegExFlags;
			}

			let escapedRegex = escapeStringContents(userRegex);
			ruleText = `matchRegex(${targetText}${lowerTransform}, "${escapedRegex}", "_matches")`;

			let capturingGroupElements = categoryRegexRuleCaptureGroups.querySelectorAll("li input");

			let capturingGroupIndex = 1;
			for (const input of capturingGroupElements) {
				const groupMatchContent = escapeStringContents(input.value);
				ruleText += ` && (_matches[${capturingGroupIndex}]${lowerTransform} == "${groupMatchContent}"${lowerTransform})`
				capturingGroupIndex += 1;
			}

			break;
	}
	
	categoryRule.value = ruleText;
}


async function getSessionForId(id) {
	return db.sessions.get({id: id});
}

async function getCategoryForId(id) {
	return db.categories.get({id: id});
}


function checkTooltipMouseMove(e) {
	const movementThreshold = 0.9;
	
	if (tooltipData.lastMouseEvent === null
		|| Math.abs(e.clientX - tooltipData.lastMouseEvent.clientX) >= movementThreshold
		|| Math.abs(e.clientY - tooltipData.lastMouseEvent.clientY) >= movementThreshold
	) {
		tooltipLayer.style.opacity = 0;
	}
	
	updateTooltipData(e);
}

document.addEventListener("mouseover", (e) => {
	checkTooltipMouseMove(e);
});

document.addEventListener("mousemove", (e) => {
	checkTooltipMouseMove(e);
});

document.addEventListener("scroll", (e) => {
	clearTimeout(tooltipData.tooltipTimer);
	tooltipLayer.style.opacity = 0;
});

document.addEventListener("change", (e) => {
	if (e.target.tagName == "SELECT") {
		if (e.target.id == "categoryTemplateType") {
			const optionsUsingTextField = ["equal-to", "contains", "doesnt-contain", "starts-with", "ends-with", "matches-regex"];
			const optionsUsingCaptureGrous = ["matches-regex"];
			
			categoryRuleStringRoot.hidden = !optionsUsingTextField.includes(e.target.value);
			categoryRegexRuleCaptureGroupsRoot.hidden = !optionsUsingCaptureGrous.includes(e.target.value);
		}
	}
});

function createTabsListForDragAndDrop(group, tabsList) {
	const tabsListForDragAndDrop = group.querySelector(".tabs-list-for-drag-and-drop");
	tabsListForDragAndDrop.textContent = "";
	
	const tabsListChildren = tabsList.querySelectorAll("li");
	
	let dropTargetIndex = 0;
	for (const tabsListChild of tabsListChildren) {
		tabsListForDragAndDrop.appendChild(tabsListChild.cloneNode(true));
		++dropTargetIndex;
	}
	
	tabsListForDragAndDrop.insertAdjacentHTML("beforeend", `
		<li class="tab-entry colorize-gray drop-footer" data-tabid="-1" data-droptargetindex="${dropTargetIndex}">
			<span class="fav-icon-list-item" data-validimage="false"><img src="" class="fav-icon-small"/></span>
			<span class="title"><center>&#x2191;</center></span>
		</li>
	`);
}

async function populateTabListGroup(group) {	
	const currentVersion = parseInt(group.dataset.version);
	let queriedVersion = parseInt(group.dataset.queriedversion);
	if (currentVersion > queriedVersion) {
		queriedVersion = currentVersion;
		group.dataset.queriedversion = queriedVersion;
	
		let queryFunction = undefined;
		let queryArgument = undefined;
		let canRemove = false;
	
		if (group.dataset.iscategory) {
			// This is a category
			queryFunction = queryTabsInCategory;
			queryArgument = await getCategoryForId(parseInt(group.dataset.categoryid));
			canRemove = true;
		} else if (group.dataset.issession) {
			// This is a session
			queryFunction = queryTabsInSession;
			queryArgument = await getSessionForId(parseInt(group.dataset.sessionid));
			canRemove = true;
		} else if (group.dataset.isunsortedtabs) {
			// This is an unsorted tab list
			queryFunction = queryAllTabs;
		} else {
			console.error("The following tab list is of an unknown type: " + group);
		}
		
		if (!activeLiveQuerySubscriptions[group.id]) {
			function queryFunctionWithArgument() {
				return queryFunction(queryArgument);
			}
			
			const observable = db.newLiveQuery(queryFunctionWithArgument);
			activeLiveQuerySubscriptions[group.id] = observable.subscribe({
				next: (result) => incrementGroupVersion(group),
				error: (error) => console.error(`Live query for group ${group.id} failed: ${error}`)
			});
			
			// It seems creating the live query itself always results in it firing the callback once,
			// so we return here to prevent the spinner animation from showing up twice as long.
			return;
		}
		
		showSpinnerAnimation(group);
		
		queryFunction(queryArgument).then((tabs) => {					
			// Additional brief timer to prevent the spinner from ever
			// disappearing so quickly that the UI just appears glitchy.
			new Promise(r => setTimeout(r, minimumSpinnerDisplayTime)).then(() => {
				hideSpinnerAnimation(group);
				
				let receivedVersion = parseInt(group.dataset.receivedversion);
				
				if (queriedVersion <= receivedVersion) {
					// We got the result of a query that's older than our current contents.
					// An unlikely scenario, but could potentially happen when two queries
					// are simultaneously in flight and the older one takes longer to complete
					// than the newer one. If this ever happens, just discard the result and abort.
					return;
				}
				
				receivedVersion = queriedVersion;
				group.dataset.receivedversion = receivedVersion;
				
				const tabsList = group.querySelector(".tabs-list");
				tabsList.textContent = "";
				
				let dropTargetIndex = 0;
				for (const tab of tabs) {
					tabsList.insertAdjacentHTML("beforeend", `
						<li class="tab-entry has-tooltip colorize-gray" data-tabid="${tab.id}" data-droptargetindex="${dropTargetIndex}" draggable="true">
							<span class="fav-icon-list-item" data-validimage="${tab.metadata.favIconUrl !== undefined}"><img src="${tab.metadata.favIconUrl}" class="fav-icon-small"/></span>
							<span class="title">${escapeHTML(tab.title)}</span>
							<span class="actions">
								<button class="colorize-button image-button action-button" data-action="open-tab"><img src="../icons/iconoir/edits/open-in-browser-dark.svg" class="only-in-dark-theme" style="height: 24px;" /><img src="../icons/iconoir/edits/open-in-browser-light.svg" class="only-in-light-theme" style="height: 24px;" /></button>
								<button class="colorize-button image-button action-button" data-action="delete-tab"><img src="../icons/iconoir/edits/trash-solid.svg" style="height: 24px;"/></button>
								<button class="colorize-button image-button action-button" data-action="remove-tab"><img src="../icons/iconoir/edits/xmark.svg" style="height: 24px; ${canRemove ? "" : "display: none;"}"/></button>
							</span>
						</li>
					`);
					
					const newElement = tabsList.querySelector(`[data-tabid="${tab.id}"]`);
					newElement.setAttribute("data-tooltiptype", "tab");
					newElement.setAttribute("data-sortkey", JSON.stringify(tab.sortkey));
					
					++dropTargetIndex;
				}
				
				createTabsListForDragAndDrop(group, tabsList);
			});
		});
	}
}

async function populateGroupListGroup(group) {
	const currentVersion = parseInt(group.dataset.version);
	let queriedVersion = parseInt(group.dataset.queriedversion);
	if (currentVersion > queriedVersion) {
		queriedVersion = currentVersion;
		group.dataset.queriedversion = queriedVersion;			
		
		let idPrefix = undefined;
		let groupQueryFunction = undefined;
		let getGroupPropertiesFunction = undefined;
		
		if (group.dataset.iscategorieslist) {
			idPrefix = "category";
			groupQueryFunction = queryCategories;
			getGroupPropertiesFunction = getCategoryProperties;
		} else if (group.dataset.issessionslist) {
			idPrefix = "session";
			groupQueryFunction = querySessions;
			getGroupPropertiesFunction = getSessionProperties;
		} else {
			console.error("The following group list is of an unknown type: " + group);
		}
		
		if (!activeLiveQuerySubscriptions[group.id]) {
			const observable = db.newLiveQuery(groupQueryFunction);
			activeLiveQuerySubscriptions[group.id] = observable.subscribe({
				next: (result) => incrementGroupVersion(group),
				error: (error) => console.error(`Live query for group ${group.id} failed: ${error}`)
			});
			
			// It seems creating the live query itself always results in it firing the callback once,
			// so we return here to prevent the spinner animation from showing up twice as long.
			return;
		}
		
		showSpinnerAnimation(group);
		
		groupQueryFunction().then((innerGroupDatas) => {
			// Additional brief timer to prevent the spinner from ever
			// disappearing so quickly that the UI just appears glitchy.
			new Promise(r => setTimeout(r, minimumSpinnerDisplayTime)).then(() => {
				hideSpinnerAnimation(group);
				
				let receivedVersion = parseInt(group.dataset.receivedversion);
				
				if (queriedVersion <= receivedVersion) {
					// We got the result of a query that's older than our current contents.
					// An unlikely scenario, but could potentially happen when two queries
					// are simultaneously in flight and the older one takes longer to complete
					// than the newer one. If this ever happens, just discard the result and abort.
					return;
				}
				
				receivedVersion = queriedVersion;
				group.dataset.receivedversion = receivedVersion;
				
				let innerGroupsList = group.querySelector(".groups-list");
				innerGroupsList.textContent = "";
				
				for (const innerGroupData of innerGroupDatas) {
					initializeInnerGroup(innerGroupsList, innerGroupData, idPrefix, getGroupPropertiesFunction);
				}
			});
		});
	}
}

async function populateGroup(group) {
	if (!group.open) {
		return;
	}

	if (group.dataset.istablist) {
		await populateTabListGroup(group);
	} else if (group.dataset.isgrouplist) {
		await populateGroupListGroup(group)
	}
}

function incrementGroupVersion(group) {
	group.dataset.version = parseInt(group.dataset.version) + 1;
	populateGroup(group);
}

document.addEventListener("toggle", async (e) => {
	if (e.target.tagName === "DETAILS") {
		populateGroup(e.target);
	}
}, true);

async function openTab(tab) {
	const openSettings = await settings.openSettings;
		
	const legalProperties = [
		"active",
		"cookieStoreId",
		"discarded",
		"index",
		"muted",
		"openInReaderMode",
		"pinned",
		"selected",
		"url",
		"windowId",
	];
	
	const createProperties = {};
	
	for (const propertyName of legalProperties) {
		if (typeof tab.metadata[propertyName] !== "undefined") {
			createProperties[propertyName] = tab.metadata[propertyName];
		}
	}
	
	if (createProperties.discarded && tab.metadata.title) {
		createProperties.title = tab.metadata.title;
	}
	
	if (windowIdRemaps[createProperties.windowId]) {
		createProperties.windowId = windowIdRemaps[createProperties.windowId];
	}
	
	switch (openSettings.tabOpenPosition) {
		case "originalPosition":			
			break;
			
		case "nextToActiveTab":
			const activeTab = (await browser.tabs.query({ active: true, currentWindow: true }))[0];
			createProperties.windowId = activeTab.windowId;
			createProperties.index = activeTab.index + 1;
			break;
			
		case "endOfActiveWindow":
			const windowTabs = await browser.tabs.query({ currentWindow: true });
			createProperties.windowId = browser.windows.getCurrent().id;
			createProperties.index = windowTabs.length;
			break;
	}
	
	// TODO: Try to restore some more properties, like "hidden".
	
	const openPromise = browser.tabs.create(createProperties);
	
	openPromise.then(async () => {		
		if (openSettings.deleteTabsUponOpen) {
			await db.deleteTabs([ tab.id ]);
		}
	});
	
	return openPromise;
}

async function createNewWindowIfNeeded(defaultTabsToClose, tab) {
	// Check if we already created a window for this ID
	if (windowIdRemaps[tab.metadata.windowId]) {
		// But also make sure it actually still exists - if not, clear its ID.	
		try {
			await browser.windows.get(windowIdRemaps[tab.metadata.windowId]);
		} catch(error) {
			windowIdRemaps[tab.metadata.windowId] = undefined;
		}
		
		return;
	}
	
	try {
		// If not, check if a window with this ID already happens to exist
		await browser.windows.get(tab.metadata.windowId);
	} catch(error) {
		// Otherwise create a new window
		const newWindow = await browser.windows.create();
		const defaultTabs = await browser.tabs.query({ windowId: newWindow.id });
		
		for (const defaultTab of defaultTabs) {
			// Allow us to close default tabs created by the new window
			defaultTabsToClose.push(defaultTab.id);
		}
		
		windowIdRemaps[tab.metadata.windowId] = newWindow.id;
	}
}

async function openTabById(tabId) {
	const openSettings = await settings.openSettings;
	
	const tab = await db.tabs.get({id: tabId});
	
	const defaultTabsToClose = [];
	if (openSettings.tabOpenPosition == "originalPosition") {
		await createNewWindowIfNeeded(defaultTabsToClose, tab);
	}
	
	const returnPromise = openTab(tab);
	
	returnPromise.then((tab) => {
		// Browsers like to put default empty tabs into newly created windows.
		// Let's remove them.
		browser.tabs.remove(defaultTabsToClose);
	});
	
	return returnPromise;
}

function compareSortKeys(a, b) {
	if (typeof a.sortkey !== "object") {
		return Math.sign(a.sortkey - b.sortkey);
	}
	
	let lastComparisonResult = 0;
	
	for (const propertyName in a.sortkey) {		
		if (typeof a.sortkey[propertyName] === "object") {
			lastComparisonResult = compareSortKeys(a.sortkey[propertyName], b.sortkey[propertyName]);
		} else {
			lastComparisonResult = Math.sign(a.sortkey[propertyName] - b.sortkey[propertyName]);
		}
		
		if (lastComparisonResult != 0) {
			return lastComparisonResult;
		}
	}
	
	return lastComparisonResult;
}

function compareSortKeysReversed(a, b) {
	return compareSortKeys(a, b) * -1;
}

async function openTabsById(tabIds) {
	const openSettings = await settings.openSettings;
	
	const keys = tabIds.map((tabId) => {id: tabId});
	
	const tabs = await sortedQuery(db.tabs.bulkGet(keys).toArray(), compareSortKeys);
	
	const defaultTabsToClose = [];
	if (openSettings.tabOpenPosition == "originalPosition") {
		for (const tab of tabs) {
			await createNewWindowIfNeeded(defaultTabsToClose, tab);
		}
	}
	
	const promises = [];
	
	for (const tab of tabs) {
		promises.push({
			tab: tab,
			promise: openTab(tab)
		});
	}
	
	let successes = [];
	let rejections = [];
	
	promises.forEach(async (promise) => {
		try {
			successes.push({
				tab: promise.tab,
				result: await promise.promise
			});
		} catch (error) {
			rejections.push({
				tab: promise.tab,
				error: error
			});
		}
	});
	
	return new Promise(function(resolve, reject) {	
		if (rejections.length > 0) {
			reject(rejections);
		} else {
			resolve(successes);
		}
	});
}

function openTabForElement(tabElement) {
	let tabId = parseInt(tabElement.closest("[data-tabid]").dataset.tabid);
	openTabById(tabId).then((tab) => {
		setTabActive(tab);
	}).catch((error) => {
		openTabError.textContent = error;
		openTabErrorDialog.showModal();
	});
}

async function setTabActive(tab) {
	return browser.tabs.update(tab.id, {active: true});
}

async function removeTabFromGroup(tabId, groupElement) {
	let groupIdToDelete = undefined;
	let entryToDeleteFromName = undefined;
	const rootGroupElement = groupElement.closest("[data-isgrouplist]")
	if (rootGroupElement.dataset.iscategorieslist) {
		groupIdToDelete = parseInt(groupElement.dataset.categoryid);
		entryToDeleteFromName = "categories";
	} else if (rootGroupElement.dataset.issessionslist) {		
		groupIdToDelete = parseInt(groupElement.dataset.sessionid);
		entryToDeleteFromName = "sessions";
	}
	
	if (groupIdToDelete !== undefined) {
		const tab = await db.tabs.get({id: tabId});
		for (const index in tab[entryToDeleteFromName]) {
			if (tab[entryToDeleteFromName][index] == groupIdToDelete) {
				tab[entryToDeleteFromName].splice(index, 1);
				break;
			}
		}
	
		const returnPromise = db.tabs.update(tabId, tab);
		
		if (entryToDeleteFromName == "sessions") {
			returnPromise.then(() => {
				db.deleteSessionIfNoLongerNeeded(groupIdToDelete);
			});
		}
		
		return returnPromise;
	}
}


document.addEventListener("dragenter", (e) => {
	if (currentDragElement === e.target || currentDragElement === null) {
		return;
	}
	
	if (e.target.dataset.droptargetindex !== undefined) {
		const tabsListForDragAndDrop = e.target.closest(".tabs-list-for-drag-and-drop");
		if (tabsListForDragAndDrop !== null) {
			tabsListForDragAndDrop.insertBefore(currentDragElement, e.target);
		}
	}
});

document.addEventListener("dragstart", (e) => {
	const container = e.target.closest(".group-contents");
	
	if (container !== null) {
		container.dataset.dragparent = true;
		currentDragParent = container;
	}
	
	if (e.target.dataset.droptargetindex !== undefined) {
		const tabsListForDragAndDrop = container.querySelector(".tabs-list-for-drag-and-drop");
		if (tabsListForDragAndDrop !== null) {
			currentDragElement = tabsListForDragAndDrop.querySelector(`[data-droptargetindex="${e.target.dataset.droptargetindex}"]`);
			currentDragElement.dataset.dragtarget = true;
		}
	}
});

async function waitUntilGroupUpToDate(group) {
	while (group.dataset.receivedversion < group.dataset.version) {
		await new Promise(r => setTimeout(r, 25));
	}
}

document.addEventListener("dragend", async (e) => {	
	if (currentDragParent !== null) {		
		if (e.dataTransfer.dropEffect === "none") {
			const tabsList = currentDragParent.querySelector(".tabs-list");
			createTabsListForDragAndDrop(currentDragParent, tabsList);
		} else if (e.dataTransfer.dropEffect == "move") {
			if (currentDragElement !== null) {
				const tabsList = currentDragParent.querySelector(".tabs-list");
				const tabsListForDragAndDrop = currentDragParent.querySelector(".tabs-list-for-drag-and-drop");
	
				const tabsListChildren = tabsList.querySelectorAll("li");
				const tabsListForDragAndDropChildren = tabsListForDragAndDrop.querySelectorAll("li");
				
				// Iterate our tab lists once from the front and once from the back and check for all
				// elements that didn't move (i.e. whose tab ID didn't change). That leaves us with a
				// range within which elements were actually reordered. Only this smaller range needs
				// to be updated in the database, everything else can remain untouched, avoiding
				// unnecessary database write operations.
				let firstNonMatchingIndex = 0;
				let lastNonMatchingIndex = tabsListChildren.length - 1;
				
				for (let index = firstNonMatchingIndex; index <= lastNonMatchingIndex; ++index) {
					firstNonMatchingIndex = index;
					if (tabsListChildren[index].dataset.tabid !== tabsListForDragAndDropChildren[index].dataset.tabid) {
						break;
					}
				}
				
				for (let index = lastNonMatchingIndex; index >= firstNonMatchingIndex; --index) {
					lastNonMatchingIndex = index;
					if (tabsListChildren[index].dataset.tabid !== tabsListForDragAndDropChildren[index].dataset.tabid) {
						break;
					}
				}
				
				const entriesToUpdate = [];
				
				for (let index = firstNonMatchingIndex; index <= lastNonMatchingIndex; ++index) {
					entriesToUpdate.push({
						key: parseInt(tabsListForDragAndDropChildren[index].dataset.tabid),
						changes: {
							sortkey: JSON.parse(tabsListChildren[index].dataset.sortkey)
						}
					});
				}
				
				await db.tabs.bulkUpdate(entriesToUpdate);
				
				// This await keeps the "for drag & drop" list visible until our changes have been
				// commited to the database and then read back to us. This effectively removes any
				// visible popping of list elements while the update is being processed.
				await waitUntilGroupUpToDate(currentDragParent.closest("details"));
			}
		}
		
		currentDragParent.dataset.dragparent = false;
		currentDragParent = null;
	}
	
	if (currentDragElement !== null) {
		currentDragElement.dataset.dragtarget = false;
		currentDragElement = null;
	}
});

document.addEventListener("dragover", (e) => {
	if (currentDragParent !== null) {	
		const rect = currentDragParent.getBoundingClientRect();
	
		const inside =
			e.clientX >= rect.left &&
			e.clientX <= rect.right &&
			e.clientY >= rect.top &&
			e.clientY <= rect.bottom;
	
		if (inside) {
			e.preventDefault();
		}
	}
});


document.addEventListener("click", (e) => {
	if (e.target.tagName !== "BUTTON" && e.target.dataset.action == undefined) {
		return;
	}

	switch (e.target.dataset.action) {
		case "create-category":
			console.log("[Tab Archive] Creating new category.");
			createNewCategory();
			break;
			
		case "edit-category-settings":
			editCategorySettings(e.target.closest("[data-categoryid]"));
			break;
			
		case "delete-category":
			confirmDeleteCategory.setAttribute("data-categoryid", e.target.closest("[data-categoryid]").dataset.categoryid);
			categoryDeletionAlsoDeletesTabs.checked = false;
			confirmDeleteCategory.showModal();
			break;
			
		case "delete-session":
			confirmDeleteSession.setAttribute("data-sessionid", e.target.closest("[data-sessionid]").dataset.sessionid);
			sessionDeletionAlsoDeletesTabs.checked = false;
			confirmDeleteSession.showModal();
			break;
			
		case "confirm-category-deletion":
			confirmCategoryDeletion(parseInt(e.target.closest("[data-categoryid]").dataset.categoryid), categoryDeletionAlsoDeletesTabs.checked);
			break;
			
		case "cancel-category-deletion":
			confirmDeleteCategory.close();
			break;
			
		case "confirm-session-deletion":
			confirmSessionDeletion(parseInt(e.target.closest("[data-sessionid]").dataset.sessionid), sessionDeletionAlsoDeletesTabs.checked);
			break;
			
		case "cancel-session-deletion":
			confirmDeleteSession.close();
			break;
			
		case "confirm-edit-category":
			applyCategorySettings();
			break;
			
		case "cancel-edit-category":
			editCategoryDialog.close();
			break;
			
		case "select-color":
			selectColor(e.target);
			break;
			
		case "confirm-rule-validity-check-failed":
			editCategoryDialog.showModal();
			break;
			
		case "add-category-regex-capture-group":
			e.target.closest("li").insertAdjacentHTML("beforebegin", `
				<li>
					<input class="inline-text"></input> <button type="button" data-action="delete-category-regex-capture-group" class="colorize-button image-button">&#xff0d;</button>
				</li>
			`);
			break;
			
		case "delete-category-regex-capture-group":
			e.target.closest("li").remove();
			break;
			
		case "fill-category-rule-from-template":
			fillCategoryRuleFromTemplate();
			break;
			
		case "category-rule-whats-this":
			ruleExplanationDialog.showModal();
			break;
			
		case "open-tab":
			openTabForElement(e.target.closest("[data-tabid]"));
			break;
			
		case "delete-tab":
			settings.openSettings.then((openSettings) => {
				const tabId = parseInt(e.target.closest("[data-tabid]").dataset.tabid);
				
				if (openSettings.confirmTabDeletion) {
					confirmDeleteTab.setAttribute("data-tabid", tabId);
					confirmDeleteTab.showModal();
				} else {
					db.deleteTabs([tabId]);
				}
			});
			break;
			
		case "remove-tab":
		{
			const tabId = parseInt(e.target.closest("[data-tabid]").dataset.tabid);
			removeTabFromGroup(tabId, e.target.closest("[data-istablist]"));
			break;
		}
			
		case "confirm-tab-deletion":
		{
			const tabId = parseInt(e.target.closest("[data-tabid]").dataset.tabid);
			db.deleteTabs([tabId]);
			break;
		}
			
		case "cancel-tab-deletion":
			confirmDeleteTab.close();
			break;
	}
});