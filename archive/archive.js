import debugh from "/shared/debughelper.mjs";
import settings from "../shared/settings.mjs";
import db from "../shared/database.mjs";
import ruleeval from "../shared/rules.mjs";

const minimumSpinnerDisplayTime = 250;
const minimumProcessDialogDisplayTime = 1000;

const activeLiveQuerySubscriptions = {};
const activeLiveQueryCountSubscriptions = {};
const queryCountFunctions = {};
const activeMutationObservers = {};

// NOTE: For more stability, these should probably go into the database.
// But that's a lot of added complexity that I don't feel like bothering with right now.
const windowIdRemaps = {};
const groupIdRemaps = {};

let currentDragParent = null;
let currentlyDraggedElements = [];
let currentlyDraggedGroupElement = null;

let currentTabSelectionParent = null;
let currentlySelectedTabElements = [];

const tooltipData = {
	tooltipTimer: null,
	lastMousePos: null,
	lastMouseTarget: null
}

let filterTimer = null;
let filterPromise = null;
let filterStrings = [];

const openGroups = {};
const previousGroupEntryCounts = {};

let hasBookmarkingPermission = false;
let hasDownloadingPermission = false;
let tabsToBookmark = null;


tooltipLayer.style.opacity = 0;

const groupsRootList = document.querySelector("#groups-root-list");
	
function escapeHTML(unescaped) {
	const div = document.createElement("div");
	div.textContent = unescaped;
	return div.innerHTML;
}

async function updatePermissions() {
	let allPermissions = await browser.permissions.getAll();
	
	hasBookmarkingPermission = allPermissions.permissions.includes("bookmarks");
	hasDownloadingPermission = allPermissions.permissions.includes("downloads");
}

async function requestBookmarkingPermissions() {	
	const permissionsToRequest = {
		permissions: ["bookmarks"]
	}
	
	hasBookmarkingPermission = await browser.permissions.request(permissionsToRequest);
}

async function requestDownloadingPermissions() {	
	const permissionsToRequest = {
		permissions: ["downloads"]
	}
	
	hasDownloadingPermission = await browser.permissions.request(permissionsToRequest);
}

browser.permissions.onAdded.addListener(updatePermissions);
browser.permissions.onRemoved.addListener(updatePermissions);

updatePermissions();

function createGroup(container, className, id, displayName, actionsContent, insertLocation = "beforeend") {
	container.insertAdjacentHTML(insertLocation, `
		<details class="${className}" id="${id}" data-version="1" data-queriedversion="0" data-receivedversion="0">
			<summary data-focuscount="0" data-hasfocus="false">
				<span class="summary-contents">
					<span class="summary-statics">
						<span class="summary-open-marker"></span>
					</span>
					<span class="summary-dynamics">
						<span class="summary-badge has-tooltip" data-tooltiptype="badge">0</span>
						<span class="summary-overlap overlapping-content">
							<span class="summary-title">${displayName}</span>
							<span class="summary-actions">${actionsContent}</span>
						</span>
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
	
	return container.closest(".group-box").querySelector(":scope > .group-content-setup-root > .spinner-root");
}

function updateSpinnerVisibility(spinnerElement, activeQueryCount) {	
	if (activeQueryCount === 0) {
		spinnerElement.hidden = true;
	} else {		
		spinnerElement.hidden = false;
	}
}

function showSpinnerAnimation(container) {
	const spinnerElement = container.closest(".group-box").querySelector(":scope > .group-content-setup-root > .spinner-root");
	
	const activeQueryCount = parseInt(spinnerElement.dataset.activequerycount) + 1;
	spinnerElement.dataset.activequerycount = activeQueryCount;
	
	updateSpinnerVisibility(spinnerElement, activeQueryCount);
}

function hideSpinnerAnimation(container) {
	const spinnerElement = container.closest(".group-box").querySelector(":scope > .group-content-setup-root > .spinner-root");
	
	const activeQueryCount = parseInt(spinnerElement.dataset.activequerycount) - 1;
	spinnerElement.dataset.activequerycount = activeQueryCount;
	
	updateSpinnerVisibility(spinnerElement, activeQueryCount);
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
	
	// If a group with this ID has existed before, fill it with dummy elements
	// so that its size stays stable until its filled with actual content.
	if (previousGroupEntryCounts[group.id]) {
		for (let idx = 0; idx < previousGroupEntryCounts[group.id]; ++idx) {
			tabsList.insertAdjacentHTML("beforeend", `
				<li class="tab-entry colorize-gray">
					<span class="fav-icon-list-item" data-validimage="false"><img src="undefined" class="fav-icon-small"/></span>
					<span class="overlap overlapping-content">
						<span class="title"></span>
					</span>
				</li>
			`);
		}
	}
}

function processGroupsListMutations(mutations) {	
	for (let mutation of mutations) {
		if (mutation.type === "childList") {
			for (let removedNode of mutation.removedNodes) {
				if (removedNode.nodeType == Node.ELEMENT_NODE) {
					const group = removedNode;
					
					if (activeLiveQuerySubscriptions[group.id]) {
						activeLiveQuerySubscriptions[group.id].unsubscribe();
						activeLiveQuerySubscriptions[group.id] = undefined;
					}
					
					if (activeLiveQueryCountSubscriptions[group.id]) {
						activeLiveQueryCountSubscriptions[group.id].unsubscribe();
						activeLiveQueryCountSubscriptions[group.id] = undefined;
						queryCountFunctions[group.id] = undefined;
					}
				}
			}
		}
	}
}

function flushMutationsQueue(group) {
	if (activeMutationObservers[group.id]) {
		processGroupsListMutations(activeMutationObservers[group.id].takeRecords());
	}
}

function createGroupsList(container, groupId) {
	container.insertAdjacentHTML("beforeend", `
		<div class="groups-list">
		</div>
		<div class="groups-list-for-drag-and-drop">
		</div>
	`);
	
	const groupsList = container.querySelector(".groups-list");
	
	activeMutationObservers[groupId] = new MutationObserver((mutations, observer) => {
		processGroupsListMutations(mutations);
	});
	
	activeMutationObservers[groupId].observe(groupsList, { childList: true });
	
	return groupsList;
}

function initializeInnerGroup(outerGroup, groupData, idPrefix, getGroupPropertiesFunction, insertLocation = "beforeend") {
	const groupProperties = getGroupPropertiesFunction(groupData);
	
	const idSuffix = groupProperties.id;

	const innerGroup = createGroup(outerGroup, "group-details group-box colorize-" + groupProperties.color, idPrefix + "-" + idSuffix, groupProperties.name, groupProperties.actions, insertLocation);
	innerGroup.setAttribute("data-" + idPrefix + "id", idSuffix);
	innerGroup.setAttribute("draggable", groupProperties.draggable);
	
	initializeGroupAsTabListContainer(innerGroup, idPrefix);
	
	return innerGroup;
}

function initializeGroupAsChildGroupListContainer(group, type) {
	group.setAttribute("data-isgrouplist", true);
	group.setAttribute(`data-is${type}list`, true);
	
	const groupContentSetupRoot = group.querySelector(".group-content-setup-root");
	const groupContents = group.querySelector(".group-contents");
	
	const spinnerElement = createSpinnerAnimation(groupContentSetupRoot);
	const groupsList = createGroupsList(groupContents, group.id);
}


async function sortedQuery(originalQuery, sortFunction) {
	const queryResult = await originalQuery;
	return queryResult.sort(sortFunction);
}


function applyTabFilter(tab, filterStrings) {
	const lowerCaseUrl = tab.url.toLowerCase();
	const lowerCaseTitle = tab.title.toLowerCase();
	for (const filterString of filterStrings) {
		if (lowerCaseUrl.includes(filterString) || lowerCaseTitle.includes(filterString)) {
			continue;
		}
		
		return false;
	}
	
	return true;
}	
	
function filterTabs(tabPrimitive, queryArgument, filterStrings) {
	const queryPrimitive = tabPrimitive(queryArgument).filter((tab) => {
		return applyTabFilter(tab, filterStrings);
	});
	
	return queryPrimitive;
}

function filterSessions(groupPrimitive, tabPrimitive, filterStrings) {
	async function runQuery() {
		const matchingTabs = await filterTabs(tabPrimitive, undefined, filterStrings).toArray();
		
		const uniqueSessionDates = [];
		
		for (const tab of matchingTabs) {
			for (const sessionDate of tab.sessions) {
				if (!uniqueSessionDates.includes(sessionDate)) {
					uniqueSessionDates.push(sessionDate);
				}
			}
		}
		
		return await groupPrimitive().where("creationdate").anyOf(uniqueSessionDates).toArray();
	}
	
	// Pretend we're a Dexie collection, for compatibility.
	return {
		async toArray() {
			return await runQuery();
		},
		
		async count() {
			return (await runQuery()).length;
		}
	};
}

function filterCategories(groupPrimitive, tabPrimitive, filterStrings) {
	async function runQuery() {
		const matchingTabs = await filterTabs(tabPrimitive, undefined, filterStrings).toArray();
		
		const uniqueCategoryIds = [];
		
		for (const tab of matchingTabs) {
			for (const categoryId of tab.categories) {
				if (!uniqueCategoryIds.includes(categoryId)) {
					uniqueCategoryIds.push(categoryId);
				}
			}
		}
		
		return await groupPrimitive().where("id").anyOf(uniqueCategoryIds).toArray();
	}
	
	// Pretend we're a Dexie collection, for compatibility.
	return {
		async toArray() {
			return await runQuery();
		},
		
		async count() {
			return (await runQuery()).length;
		}
	};
}

function areFilterStringsSet() {
	return (filterStrings.length !== 0);
}

function clearFilterStrings() {
	filterStrings = [];
	filterText.value = "";
	updateSearchByFilter();
}

const groupFunctionPrimitives = {
	sessions: () => {
		return db.sessions;
	},
	
	categories: () => {
		return db.categories;
	},
	
	unsortedTabs: (_) => {
		return db.tabs.toCollection();
	},
	
	tabsInSession: (creationdate) => {
		return db.tabs.where("sessions").equals(creationdate);
	},
	
	tabsInCategory: (id) => {
		return db.tabs.where("categories").equals(id);
	},
}

const groupFunctionPrimitivesWithFilters = {
	sessions: () => {
		if (!areFilterStringsSet()) {
			return groupFunctionPrimitives.sessions();
		}
		
		return filterSessions(groupFunctionPrimitives.sessions, groupFunctionPrimitives.unsortedTabs, filterStrings);
	},
	
	categories: () => {
		if (!areFilterStringsSet()) {
			return groupFunctionPrimitives.categories();
		}
		
		return filterCategories(groupFunctionPrimitives.categories, groupFunctionPrimitives.unsortedTabs, filterStrings);
	},
	
	unsortedTabs: (_) => {
		if (!areFilterStringsSet()) {
			return groupFunctionPrimitives.unsortedTabs(_);
		}
		
		return filterTabs(groupFunctionPrimitives.unsortedTabs, _, filterStrings);
	},
	
	tabsInSession: (creationdate) => {
		if (!areFilterStringsSet()) {
			return groupFunctionPrimitives.tabsInSession(creationdate);
		}
		
		return filterTabs(groupFunctionPrimitives.tabsInSession, creationdate, filterStrings);
	},
	
	tabsInCategory: (id) => {
		if (!areFilterStringsSet()) {
			return groupFunctionPrimitives.tabsInCategory(id);
		}
		
		return filterTabs(groupFunctionPrimitives.tabsInCategory, id, filterStrings);
	},
}

const groupFunctionLookup = {
	sessions: {
		query: async () => {
			return sortedQuery(groupFunctionPrimitivesWithFilters.sessions().toArray(), compareSortKeysReversed);
		},
		queryTabCount: async () => {
			const isFilteredResult = areFilterStringsSet();
			const sessions = await groupFunctionPrimitivesWithFilters.sessions().toArray();
			const sessionCreationDates = sessions.map((session) => {return session.creationdate});
			const uniqueTabCount = await db.tabs.where("sessions").anyOf(sessionCreationDates).count();
			return {
				groupCount: sessions.length,
				uniqueTabCount: uniqueTabCount,
				isFilteredResult: isFilteredResult
			};
		},
	},
	
	categories: {
		query: async () => {
			return sortedQuery(groupFunctionPrimitivesWithFilters.categories().toArray(), compareSortKeysReversed);
		},
		queryTabCount: async () => {
			const isFilteredResult = areFilterStringsSet();
			const categories = await groupFunctionPrimitivesWithFilters.categories().toArray();
			const categoryIds = categories.map((category) => {return category.id});
			const uniqueTabCount = await db.tabs.where("categories").anyOf(categoryIds).count();
			return {
				groupCount: categories.length,
				uniqueTabCount: uniqueTabCount,
				isFilteredResult: isFilteredResult
			};
		},
	},
	
	unsortedTabs: {
		query: async (_) => {
			return sortedQuery(groupFunctionPrimitivesWithFilters.unsortedTabs().toArray(), compareSortKeys);
		},
		queryTabCount: async (_) => {
			const isFilteredResult = areFilterStringsSet();
			const uniqueTabCount = await groupFunctionPrimitivesWithFilters.unsortedTabs().count();
			return {
				uniqueTabCount: uniqueTabCount,
				isFilteredResult: isFilteredResult
			};
		},
	},
	
	tabsInSession: {
		query: async (creationdate) => {
			return sortedQuery(groupFunctionPrimitivesWithFilters.tabsInSession(creationdate).toArray(), compareSortKeys);
		},
		queryTabCount: async (creationdate) => {
			const isFilteredResult = areFilterStringsSet();
			const uniqueTabCount = await groupFunctionPrimitivesWithFilters.tabsInSession(creationdate).count();
			return {
				uniqueTabCount: uniqueTabCount,
				isFilteredResult: isFilteredResult
			};
		},
	},
	
	tabsInCategory: {
		query: async (id) => {
			return sortedQuery(groupFunctionPrimitivesWithFilters.tabsInCategory(id).toArray(), compareSortKeys);
		},
		queryTabCount: async (id) => {
			const isFilteredResult = areFilterStringsSet();
			const uniqueTabCount = await groupFunctionPrimitivesWithFilters.tabsInCategory(id).count();
			return {
				uniqueTabCount: uniqueTabCount,
				isFilteredResult: isFilteredResult
			};
		},
	},
}


function updateBadge(group, badgeData) {
	const badgeSummaryElement = group.querySelector(":scope > summary .summary-badge");
		
	badgeSummaryElement.dataset.hasgroups = false;
	badgeSummaryElement.dataset.hasuniquetabs = false;
	
	let newBadgeText = "";
	
	if (badgeData.groupCount !== undefined) {
		newBadgeText += `${badgeData.groupCount}`;
		badgeSummaryElement.dataset.hasgroups = true;
		badgeSummaryElement.dataset.groupcount = badgeData.groupCount;
	}
	
	if (badgeData.uniqueTabCount !== undefined) {
		if (newBadgeText !== "") {
			newBadgeText += "|";
		}
		newBadgeText += `${badgeData.uniqueTabCount}`;
		badgeSummaryElement.dataset.hasuniquetabs = true;
		badgeSummaryElement.dataset.uniquetabcount = badgeData.uniqueTabCount;
	}
	
	badgeSummaryElement.dataset.isfiltered = badgeData.isFilteredResult;
	
	badgeSummaryElement.textContent = newBadgeText;
}

function initializeEntryCountLiveQuery(group, groupFunctions, queryCountArgument) {
	function queryCountFunctionWithArgument() {
		return groupFunctions.queryTabCount(queryCountArgument);
	}
		
	if (!activeLiveQueryCountSubscriptions[group.id]) {
		const observable = db.newLiveQuery(queryCountFunctionWithArgument);
		activeLiveQueryCountSubscriptions[group.id] = observable.subscribe({
			next: (result) => { updateBadge(group, result); },
			error: (error) => debugh.error(`Live query for group ${group.id} entry count failed: ${error}`)
		});
	
		function runQuery() {
			queryCountFunctionWithArgument().then((result) => { updateBadge(group, result); });
		}
		
		// This allows us to manually re-run tab count queries if needed, which is
		// necessary whenever the search filter changes, because that won't usually
		// trigger live queries.
		queryCountFunctions[group.id] = runQuery;
	
		// Sometimes, the live query automatically fires after initialization,
		// but it seems that's not always the case, so we also start a manual
		// query here.	
		runQuery();
	}
}

const rootGroups = {
	categories: createGroup(groupsRootList, "root-details group-box colorize-cyan", "categoriesGroup", "Categories", ""),
	sessions: createGroup(groupsRootList, "root-details group-box colorize-cyan", "sessionsGroup", "Sessions", ""),
	unsortedTabs: createGroup(groupsRootList, "root-details group-box colorize-cyan", "unsortedTabsGroup", "Unsorted Tabs", ""),
}

function getCategoryProperties(category) {
	let properties = {
		name: category.name,
		id: category.id,
		color: category.color,
		draggable: true,
		actions: `
			<button data-action="edit-category-settings" data-tooltiptype="button" class="colorize-button image-button action-button has-tooltip"><img src="../icons/iconoir/edits/settings-solid-fixed-light.svg" class="only-in-light-theme" style="height: 32px;" /><img src="../icons/iconoir/edits/settings-solid-fixed-dark.svg" class="only-in-dark-theme" style="height: 32px;" /></button>
			<button data-action="convert-group-to-bookmarks" data-tooltiptype="button" class="colorize-button image-button action-button has-tooltip"><img src="../icons/iconoir/edits/bookmark-light.svg" class="only-in-light-theme" style="height: 32px;" /><img src="../icons/iconoir/edits/bookmark-dark.svg" class="only-in-dark-theme" style="height: 32px;" /></button>
			<button data-action="delete-category" data-tooltiptype="button" class="colorize-button image-button action-button has-tooltip"><img src="../icons/iconoir/edits/trash-solid.svg" style="height: 32px;" /></button>
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
		id: session.creationdate,
		color: "gray",
		draggable: false,
		actions: `
			<button data-action="convert-group-to-bookmarks" data-tooltiptype="button" class="colorize-button image-button action-button has-tooltip"><img src="../icons/iconoir/edits/bookmark-light.svg" class="only-in-light-theme" style="height: 32px;" /><img src="../icons/iconoir/edits/bookmark-dark.svg" class="only-in-dark-theme" style="height: 32px;" /></button>
			<button data-action="delete-session" data-tooltiptype="button" class="colorize-button image-button action-button has-tooltip"><img src="../icons/iconoir/edits/trash-solid.svg" style="height: 32px;" /></button>
		`
	}
	
	return properties;
}

initializeGroupAsTabListContainer(rootGroups.unsortedTabs, "unsortedtabs");
initializeGroupAsChildGroupListContainer(rootGroups.sessions, "sessions");
initializeGroupAsChildGroupListContainer(rootGroups.categories, "categories");

initializeEntryCountLiveQuery(rootGroups.unsortedTabs, groupFunctionLookup.unsortedTabs, undefined);
initializeEntryCountLiveQuery(rootGroups.sessions, groupFunctionLookup.sessions, undefined);
initializeEntryCountLiveQuery(rootGroups.categories, groupFunctionLookup.categories, undefined);

rootGroups.categories.querySelector(".group-contents").insertAdjacentHTML("afterbegin", `
	<button data-action="create-category" data-tooltiptype="button" class="colorize-button has-tooltip">&#xff0b;</button>
`);


async function createNewCategory() {
	clearFilterStrings();
	
	const newCategory = await db.createNewCategory();

	incrementGroupVersion(document.querySelector("[data-iscategorieslist]"));
}


function repositionTooltipLayer() {
	if (tooltipData.lastMousePos === null) {
		return;
	}
		
	const tooltipWidth = tooltipLayer.offsetWidth;
	const tooltipHeight = tooltipLayer.offsetHeight;
	
	const xOffset = 0;
	const yOffset = 20;
	
	let xPos = tooltipData.lastMousePos.clientX + xOffset;
	let yPos = tooltipData.lastMousePos.clientY + yOffset;
	
	if (tooltipWidth + xPos > window.innerWidth) {
		xPos = window.innerWidth - tooltipWidth;
	}
	
	if (tooltipHeight + yPos > window.innerHeight) {
		yPos = tooltipData.lastMousePos.clientY - yOffset - tooltipHeight;
	}
	
	tooltipLayer.style.left = `${xPos}px`;
	tooltipLayer.style.top = `${yPos}px`;
}

function updateShowTooltip(mousePos, mouseTarget) {	
	tooltipData.lastMousePos = mousePos;
	tooltipData.lastMouseTarget = mouseTarget;

	clearTimeout(tooltipData.tooltipTimer);

	tooltipData.tooltipTimer = setTimeout(async () => {	
		const tooltipElement = tooltipData.lastMouseTarget.closest(".has-tooltip");
		if (!tooltipElement) {
			tooltipLayer.style.opacity = 0;
			return;
		}
		
		tooltipLayer.textContent = "";
		
		switch (tooltipElement.dataset.tooltiptype) {
			case "tab":
				try {
					const tab = await db.tabs.get({id: parseInt(tooltipElement.dataset.tabid)});
					tooltipLayer.insertAdjacentHTML("afterbegin", `
						<div>
							<span class="fav-icon-list-item" data-validimage="${tab.metadata.favIconUrl !== undefined}"><img src="${tab.metadata.favIconUrl}" class="fav-icon-small" /></span><span class="tooltip-title">${tab.title}</span>
						</div>
						<div><a href="${tab.url}" class="colorize-link">${tab.url}</a></div>
						<div>
							<span class="metadata-entry"><img src="../icons/iconoir/edits/web-window-solid-dark.svg" class="only-in-dark-theme" /><img src="../icons/iconoir/edits/web-window-solid-light.svg" class="only-in-light-theme" /> Window Id: ${tab.metadata.windowId}</span>
							<span class="metadata-entry"><img src="../icons/iconoir/edits/window-tabs-solid-dark.svg" class="only-in-dark-theme" /><img src="../icons/iconoir/edits/window-tabs-solid-light.svg" class="only-in-light-theme" /> Tab Id: ${tab.metadata.id}</span>
							<span class="metadata-entry" data-show="${tab.metadata.pinned}"><img src="../icons/iconoir/edits/pin-solid.svg" /> Pinned</span>
							<span class="metadata-entry" data-show="${tab.metadata.hidden}"><img src="../icons/iconoir/edits/eye-closed-dark.svg" class="only-in-dark-theme" /><img src="../icons/iconoir/edits/eye-closed-light.svg" class="only-in-light-theme" /> Hidden</span>
						</div>
						<div class="tooltip-tab-preview-image" data-show="${Boolean(tab.previewimageurl)}">
							<center><img src="${tab.previewimageurl}" /></center>
						</div>
					`);
				} catch {}
				break;
				
			case "badge":
				let tooltipText = "";
				
				if (tooltipElement.dataset.hasgroups === "true") {
					tooltipText += `
						<div>
							${tooltipElement.dataset.groupcount} groups
						</div>
					`;
				}
				
				if (tooltipElement.dataset.hasuniquetabs === "true") {
					tooltipText += `
						<div>
							${tooltipElement.dataset.uniquetabcount} unique tabs
						</div>
					`;
				}
				
				tooltipLayer.insertAdjacentHTML("afterbegin", tooltipText);
				break;
				
			case "button":
				switch (tooltipElement.dataset.action)
				{
					case "edit-category-settings":
						tooltipLayer.insertAdjacentHTML("afterbegin", "Edit category settings");
						break;
						
					case "convert-group-to-bookmarks":
						tooltipLayer.insertAdjacentHTML("afterbegin", "Convert to bookmarks");
						break;
						
					case "delete-category":
						tooltipLayer.insertAdjacentHTML("afterbegin", "Delete category");
						break;
						
					case "delete-session":
						tooltipLayer.insertAdjacentHTML("afterbegin", "Delete session");
						break;
						
					case "create-category":
						tooltipLayer.insertAdjacentHTML("afterbegin", "Create new category");
						break;
						
					case "copy-tab-url":
						tooltipLayer.insertAdjacentHTML("afterbegin", "Copy URL");
						break;
						
					case "open-tab":
						tooltipLayer.insertAdjacentHTML("afterbegin", "Open tab");
						break;
						
					case "convert-tab-to-bookmark":
						tooltipLayer.insertAdjacentHTML("afterbegin", "Convert to bookmark");
						break;
						
					case "delete-tab":
						tooltipLayer.insertAdjacentHTML("afterbegin", "Delete tab");
						break;
						
					case "remove-tab":
						tooltipLayer.insertAdjacentHTML("afterbegin", "Remove tab from this group");
						break;
						
					case "toggle-menu":
						tooltipLayer.insertAdjacentHTML("afterbegin", "Toggle menu");
						break;
						
					case "clear-filter":
						tooltipLayer.insertAdjacentHTML("afterbegin", "Clear");
						break;
						
					default:
						tooltipLayer.textContent = tooltipElement.dataset.action;
						break;
				}
				break;
				
			default:
				tooltipLayer.textContent = tooltipElement.dataset.tooltip;
				break;
		}
		
		repositionTooltipLayer();
		tooltipLayer.style.opacity = 1;
	}, 500);
}

const tooltipResizeObserver = new ResizeObserver(() => {
	if (parseFloat(tooltipLayer.style.opacity) === 0) {
		return;
	}
	
	repositionTooltipLayer();
}).observe(tooltipLayer);


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
		debugh.error("Auto-catch rule validity check failed: " + error);
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


async function confirmSessionDeletion(sessionDate, deleteContainedTabs) {
	if (deleteContainedTabs) {
		const tabsToDelete = await db.tabs.where("sessions").equals(sessionDate).toArray();
		
		const justKeys = tabsToDelete.map((tab) => tab.id);
		await db.deleteTabs(justKeys);
	}
	
	await db.deleteSession(sessionDate);
	
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


async function applySearchFilter() {
	filterSpinnerRoot.hidden = false;
	
	if (!/\S/.test(filterText.value)) {
		// Filter text is all whitespace.
		filterStrings = [];
	} else {
		filterStrings = filterText.value.split(" ").map((filterString) => { return filterString.toLowerCase()});
	}
	
	for (const groupKey in rootGroups) {
		const group = rootGroups[groupKey];
		incrementGroupVersion(group);
		queryCountFunctions[group.id]();
	}
		
	await new Promise(r => setTimeout(r, minimumSpinnerDisplayTime));
	
	filterSpinnerRoot.hidden = true;
	
	filterPromise = null;
}

function updateSearchByFilter() {
	const previousFilterText = filterText.value;
	
	filterClearButton.hidden = (filterText.value === "");
	
	clearTimeout(filterTimer);	
	filterTimer = setTimeout(async () => {	
		if (filterPromise != null) {
			await filterPromise;
			filterPromise = null;
		}
		
		// This probably means we've changed the filter string before this
		// filter had the chance to be applied. Just cancel this one.
		if (previousFilterText != filterText.value) {
			return;
		}
		
		filterPromise = applySearchFilter();
	}, 500);
}


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


async function getSessionForDate(date) {
	return db.sessions.get({creationdate: date});
}

async function getCategoryForId(id) {
	return db.categories.get({id: id});
}


function checkTooltipMouseMove(e) {	
	if (tooltipData.lastMousePos === null) {
		tooltipData.lastMousePos = {
			clientX: e.clientX,
			clientY: e.clientY
		};
	}
	
	if (parseFloat(tooltipLayer.style.opacity) === 0) {
		const movementThreshold = 1.0;
		
		if (Math.abs(e.clientX - tooltipData.lastMousePos.clientX) >= movementThreshold
			|| Math.abs(e.clientY - tooltipData.lastMousePos.clientY) >= movementThreshold
		) {
			const mousePos = {
				clientX: e.clientX,
				clientY: e.clientY
			};
			
			updateShowTooltip(mousePos, e.target);
		}
	} else {
		const movementThreshold = 1.5;
		
		if (Math.abs(e.clientX - tooltipData.lastMousePos.clientX) >= movementThreshold
			|| Math.abs(e.clientY - tooltipData.lastMousePos.clientY) >= movementThreshold
		) {
			clearTimeout(tooltipData.tooltipTimer);
			tooltipLayer.style.opacity = 0;
		}
	}
}

document.addEventListener("mouseover", (e) => {
	checkTooltipMouseMove(e);
});

document.addEventListener("mousemove", (e) => {
	checkTooltipMouseMove(e);
});

document.addEventListener("scroll", (e) => {
	// Hide existing tooltip, but also check if the cursor has scrolled over a new element
	// that might have a tooltip that we want to display once the cooldown expires again.
	clearTimeout(tooltipData.tooltipTimer);
	tooltipLayer.style.opacity = 0;
	if (tooltipData.lastMousePos !== null) {
		tooltipData.lastMouseTarget = document.elementFromPoint(tooltipData.lastMousePos.clientX, tooltipData.lastMousePos.clientY);
		updateShowTooltip(tooltipData.lastMousePos, tooltipData.lastMouseTarget);
	}
});

document.addEventListener("load", (e) => {
	if (e.target.closest("#tooltipLayer") === tooltipLayer && parseFloat(tooltipLayer.style.opacity) !== 0) {
		repositionTooltipLayer();
	}
}, true);

document.addEventListener("change", (e) => {
	if (e.target.tagName == "SELECT") {
		if (e.target.id == "categoryTemplateType") {
			const optionsUsingTextField = ["equal-to", "contains", "doesnt-contain", "starts-with", "ends-with", "matches-regex"];
			const optionsUsingCaptureGrous = ["matches-regex"];
			
			categoryRuleStringRoot.hidden = !optionsUsingTextField.includes(e.target.value);
			categoryRegexRuleCaptureGroupsRoot.hidden = !optionsUsingCaptureGrous.includes(e.target.value);
		}
	} else if (e.target.tagName == "INPUT") {
		if (e.target == bookmarkConversionCreateDirectory) {
			bookmarkConversionCreateDirectoryName.disabled = !bookmarkConversionCreateDirectory.checked;
		}
	} else if (e.target === filterText) {
		// We'll only do this on input, so that exiting the search filter doesn't activate this.
		//updateSearchByFilter();
	}
});

document.addEventListener("input", (e) => {
	if (e.target === filterText) {
		updateSearchByFilter();
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
		<li class="drop-footer" data-tabid="-1" tabindex="0" data-focuscount="0" data-hasfocus="false" data-droptargetindex="${dropTargetIndex}">
		</li>
	`);
}

async function populateTabListGroup(group) {	
	const currentVersion = parseInt(group.dataset.version);
	let queriedVersion = parseInt(group.dataset.queriedversion);
	if (currentVersion > queriedVersion) {
		queriedVersion = currentVersion;
		group.dataset.queriedversion = queriedVersion;
	
		let queryArgument = undefined;
		let canRemove = false;
		let accessor = undefined;
	
		if (group.dataset.iscategory) {
			// This is a category
			accessor = "tabsInCategory";
			queryArgument = parseInt(group.dataset.categoryid);
			canRemove = true;
		} else if (group.dataset.issession) {
			// This is a session
			accessor = "tabsInSession";
			queryArgument = parseInt(group.dataset.sessionid);
			canRemove = true;
		} else if (group.dataset.isunsortedtabs) {
			// This is an unsorted tab list
			accessor = "unsortedTabs";
		} else {
			debugh.error("The following tab list is of an unknown type: " + group);
		}
		
		const groupFunctions = groupFunctionLookup[accessor];
		
		if (!activeLiveQuerySubscriptions[group.id]) {
			function queryFunctionWithArgument() {
				return groupFunctions.query(queryArgument);
			}
			
			const observable = db.newLiveQuery(queryFunctionWithArgument);
			activeLiveQuerySubscriptions[group.id] = observable.subscribe({
				next: (result) => incrementGroupVersion(group),
				error: (error) => debugh.error(`Live query for group ${group.id} failed: ${error}`)
			});
			
			// It seems creating the live query itself always results in it firing the callback once,
			// so we return here to prevent the spinner animation from showing up twice as long.
			return;
		}
		
		showSpinnerAnimation(group);
		
		groupFunctions.query(queryArgument).then((tabs) => {					
			// Additional brief timer to prevent the spinner from ever
			// disappearing so quickly that the UI just appears glitchy.
			new Promise(r => setTimeout(r, minimumSpinnerDisplayTime)).then(() => {
				hideSpinnerAnimation(group);
				
				let receivedVersion = parseInt(group.dataset.receivedversion);
				
				if (queriedVersion <= receivedVersion) {
					// We got the result of a query that's older than our current contents.
					// An unlikely scenario, but could potentially happen when two groupFunctions
					// are simultaneously in flight and the older one takes longer to complete
					// than the newer one. If this ever happens, just discard the result and abort.
					return;
				}
				
				receivedVersion = queriedVersion;
				group.dataset.receivedversion = receivedVersion;
				
				const tabsList = group.querySelector(".tabs-list");
				tabsList.textContent = "";
				flushMutationsQueue(group);
				
				let dropTargetIndex = 0;
				for (const tab of tabs) {
					tabsList.insertAdjacentHTML("beforeend", `
						<li class="tab-entry has-tooltip colorize-gray" data-tabid="${tab.id}" tabindex="0" data-focuscount="0" data-hasfocus="false" data-droptargetindex="${dropTargetIndex}" draggable="true">
							<span class="fav-icon-list-item" data-validimage="${tab.metadata.favIconUrl !== undefined}"><img src="${tab.metadata.favIconUrl}" class="fav-icon-small"/></span>
							<span class="overlap overlapping-content">
								<span class="title">${escapeHTML(tab.title)}</span>
								<span class="actions">
									<button class="colorize-button has-tooltip image-button action-button" data-tooltiptype="button" data-action="copy-tab-url"><img src="../icons/iconoir/edits/copy-dark.svg" class="only-in-dark-theme" style="height: 24px;" /><img src="../icons/iconoir/edits/copy-light.svg" class="only-in-light-theme" style="height: 24px;" /></button>
									<button class="colorize-button has-tooltip image-button action-button" data-tooltiptype="button" data-action="open-tab"><img src="../icons/iconoir/edits/open-in-browser-dark.svg" class="only-in-dark-theme" style="height: 24px;" /><img src="../icons/iconoir/edits/open-in-browser-light.svg" class="only-in-light-theme" style="height: 24px;" /></button>
									<button class="colorize-button has-tooltip image-button action-button" data-tooltiptype="button" data-action="convert-tab-to-bookmark"><img src="../icons/iconoir/edits/bookmark-dark.svg" class="only-in-dark-theme" style="height: 24px;" /><img src="../icons/iconoir/edits/bookmark-light.svg" class="only-in-light-theme" style="height: 24px;" /></button>
									<button class="colorize-button has-tooltip image-button action-button" data-tooltiptype="button" data-action="delete-tab"><img src="../icons/iconoir/edits/trash-solid.svg" style="height: 24px;"/></button>
									<button class="colorize-button has-tooltip image-button action-button" data-tooltiptype="button" data-action="remove-tab"><img src="../icons/iconoir/edits/xmark.svg" style="height: 24px; ${canRemove ? "" : "display: none;"}"/></button>
								</span>
							</span>
						</li>
					`);
					
					const newElement = tabsList.querySelector(`[data-tabid="${tab.id}"]`);
					newElement.setAttribute("data-tooltiptype", "tab");
					newElement.setAttribute("data-sortkey", JSON.stringify(tab.sortkey));
					
					++dropTargetIndex;
				}
				
				previousGroupEntryCounts[group.id] = tabs.length;
				
				createTabsListForDragAndDrop(group, tabsList);
			});
		});
	}
}

function createGroupsListForDragAndDrop(group, groupsList) {
	const groupsListForDragAndDrop = group.querySelector(".groups-list-for-drag-and-drop");
	groupsListForDragAndDrop.textContent = "";
	
	const groupsListChildren = groupsList.querySelectorAll("details");
	
	let dropTargetIndex = 0;
	for (const groupsListChild of groupsListChildren) {
		const clonedNode = groupsListChild.cloneNode(true);
		clonedNode.setAttribute("id", clonedNode.getAttribute("id") + "-for-drag-and-drop");
		
		// Should prevent the respective group from trying to populate automatically or show a spinner.
		if (clonedNode.hasAttribute("data-istablist")) {
			clonedNode.removeAttribute("data-istablist");
		}
		if (clonedNode.hasAttribute("data-isgrouplist")) {
			clonedNode.removeAttribute("data-isgrouplist");
		}
		
		const spinnerElement = clonedNode.querySelector(":scope > .group-content-setup-root > .spinner-root");
		updateSpinnerVisibility(spinnerElement, parseInt(spinnerElement.dataset.activequerycount));
		
		groupsListForDragAndDrop.appendChild(clonedNode);
		++dropTargetIndex;
	}
	
	groupsListForDragAndDrop.insertAdjacentHTML("beforeend", `
		<details class="drop-footer" data-groupid="-1" tabindex="0" data-focuscount="0" data-hasfocus="false" data-droptargetindex="${dropTargetIndex}">
		</details>
	`);
}

async function populateGroupListGroup(group) {
	const currentVersion = parseInt(group.dataset.version);
	let queriedVersion = parseInt(group.dataset.queriedversion);
	if (currentVersion > queriedVersion) {
		queriedVersion = currentVersion;
		group.dataset.queriedversion = queriedVersion;			
		
		let idPrefix = undefined;
		let accessor = undefined;
		let innerAccessor = undefined;
		let queryCountIdAccessor = undefined;
		let getGroupPropertiesFunction = undefined;
		
		if (group.dataset.iscategorieslist) {
			idPrefix = "category";
			accessor = "categories";
			innerAccessor = "tabsInCategory";
			queryCountIdAccessor = "categoryid";
			getGroupPropertiesFunction = getCategoryProperties;
		} else if (group.dataset.issessionslist) {
			idPrefix = "session";
			accessor = "sessions";
			innerAccessor = "tabsInSession";
			queryCountIdAccessor = "sessionid";
			getGroupPropertiesFunction = getSessionProperties;
		} else {
			debugh.error("The following group list is of an unknown type: " + group);
		}
		
		const groupFunctions = groupFunctionLookup[accessor];
		const innerGroupFunctions = groupFunctionLookup[innerAccessor];
		
		if (!activeLiveQuerySubscriptions[group.id]) {
			const observable = db.newLiveQuery(groupFunctions.query);
			activeLiveQuerySubscriptions[group.id] = observable.subscribe({
				next: (result) => incrementGroupVersion(group),
				error: (error) => debugh.error(`Live query for group ${group.id} failed: ${error}`)
			});
			
			// It seems creating the live query itself always results in it firing the callback once,
			// so we return here to prevent the spinner animation from showing up twice as long.
			return;
		}
		
		showSpinnerAnimation(group);
		
		groupFunctions.query().then((innerGroupDatas) => {
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
				flushMutationsQueue(group);
				
				let dropTargetIndex = 0;
				for (const innerGroupData of innerGroupDatas) {
					const innerGroup = initializeInnerGroup(innerGroupsList, innerGroupData, idPrefix, getGroupPropertiesFunction);
					innerGroup.dataset.droptargetindex = dropTargetIndex;
					innerGroup.dataset.sortkey = JSON.stringify(innerGroupData.sortkey);
					
					const queryCountArgument = parseInt(innerGroup.dataset[queryCountIdAccessor]);
					initializeEntryCountLiveQuery(innerGroup, innerGroupFunctions, queryCountArgument);
					
					if (openGroups[innerGroup.id]) {
						innerGroup.open = true;
					}
					
					++dropTargetIndex;
				}
				
				createGroupsListForDragAndDrop(group, innerGroupsList);
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
		const group = e.target;
		
		openGroups[group.id] = group.open;
		if (!openGroups[group.id]) {
			delete openGroups[group.id];
		}
		
		populateGroup(group);
	}
}, true);

async function openTab(tab) {
	const openSettings = await settings.openSettings;
		
	const legalProperties = [
		"cookieStoreId",
		"index",
		"muted",
		"openInReaderMode",
		"pinned",
		"selected",
		"url",
		"windowId",
	];
	
	// Should this set "openerTabId", and if so, how? The original openerTabId might no longer
	// be valid - the respective tab might've already been closed. Setting the ID of the archive tab
	// (aka the currently active tab) also won't always work, since the openerTabId needs to be
	// in the same window as the opened tab.
	
	const createProperties = {
		active: false,
		discarded: openSettings.openTabsUnloaded,
	};
	
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
	
	const restoreAsHidden = openSettings.restoreHiddenTabsAsHidden && tab.metadata.hidden;
	
	const openPromise = async function() {
		const tab = await browser.tabs.create(createProperties);
		// So that calling code can immediately query this...
		tab.hidden = restoreAsHidden;
		return tab;
	}();
	
	openPromise.then(async (openedTab) => {
		if (tab.metadata.groupId != -1) {
			const groupProperties = {
				groupId: tab.metadata.groupId,
				tabIds: [ openedTab.id ],
			};
			
			while (groupIdRemaps[groupProperties.groupId] && groupProperties.groupId != groupIdRemaps[groupProperties.groupId]) {
				groupProperties.groupId = groupIdRemaps[groupProperties.groupId];
			}
			
			const previousGroupId = groupProperties.groupId;
			
			try {
				await browser.tabGroups.get(groupProperties.groupId);
			} catch (error) {
				// The most likely reason of failure here would be the group not existing,
				// so we try to create a new one.
				debugh.error(error);
				
				delete groupProperties.groupId;
					
				groupProperties.createProperties = {
					windowId: createProperties.windowId,
				};
			}
			
			try {			
				const newGroupId = await browser.tabs.group(groupProperties);
				
				if (newGroupId != tab.metadata.groupId) {
					groupIdRemaps[previousGroupId] = newGroupId;
				}
			} catch (error) {
				// Do we bother displaying this error to the user?
				debugh.error(error);
			}
		}
		
		if (restoreAsHidden) {
			try {
				await browser.tabs.hide(openedTab.id);
			} catch(error) {
				// Do we bother displaying this error to the user?
				debugh.error(error);
			}
		}
		
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

function compareElementSortKeys(a, b) {
	// TODO: Oh no, this is bound to be incredibly slow!
	// I don't have a great solution for this yet...
	const dummyA = {
		sortkey: JSON.parse(a.dataset.sortkey)
	};
	const dummyB = {
		sortkey: JSON.parse(b.dataset.sortkey)
	};
	
	return compareSortKeys(dummyA, dummyB);
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
	const openSettings = await settings.openSettings;
	
	if (!openSettings.jumpToOpenedTab || tab.hidden) {
		return false;
	}
	
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


document.addEventListener("dragstart", (e) => {
	const container = e.target.closest(".group-contents");
	
	if (container !== null) {
		container.dataset.dragparent = true;
		currentDragParent = container;
	}
	
	const selectedTabElements = currentlySelectedTabElements.map((tabElement) => {return tabElement;});
	
	deselectAllSelectedTabElements();
	currentlyDraggedGroupElement = null;
	
	if (e.target.dataset.droptargetindex !== undefined) {
		const tabsListForDragAndDrop = container.querySelector(":scope > .tabs-list-for-drag-and-drop");
		if (tabsListForDragAndDrop !== null) {
			const elementsToDrag = [];
			if (selectedTabElements.includes(e.target)) {
				for (const currentlySelectedTabElement of selectedTabElements) {
					elementsToDrag.push(currentlySelectedTabElement);
				}
			} else {
				elementsToDrag.push(e.target);
			}
			
			elementsToDrag.sort(compareElementSortKeys);
			
			currentlyDraggedElements.length = 0;
			for (const elementToDrag of elementsToDrag) {
				const currentlyDraggedElement = tabsListForDragAndDrop.querySelector(`[data-droptargetindex="${elementToDrag.dataset.droptargetindex}"]`);
				currentlyDraggedElement.dataset.dragtarget = true;
				currentlyDraggedElements.push(currentlyDraggedElement);
			}
		}
		
		const groupsListForDragAndDrop = container.querySelector(":scope > .groups-list-for-drag-and-drop");
		if (groupsListForDragAndDrop !== null) {
			// Match the "open" states between the two groups so that sizes don't change when we start a drag & drop.
			// This currently assumes both lists are in the same order, which SHOULD be true as long as we don't already
			// have a bug elsewhere.
			const groupsList = container.querySelector(":scope > .groups-list");
			
			const groupsListChildren = groupsList.querySelectorAll("details");
			const groupsListForDragAndDropChildren = groupsListForDragAndDrop.querySelectorAll("details");
			
			for (let childIdx = 0; childIdx < groupsListChildren.length; ++childIdx) {
				const sourceGroup = groupsListChildren[childIdx];
				const targetGroup = groupsListForDragAndDropChildren[childIdx];
				
				// Prevent the target group from starting queries - instead fill it with dummy elements.
				if (sourceGroup.open) {
					targetGroup.dataset.version = sourceGroup.dataset.version;
					targetGroup.dataset.queriedversion = sourceGroup.dataset.version;
					targetGroup.dataset.receivedversion = sourceGroup.dataset.version;
					
					if (targetGroup.dataset.receivedversion === targetGroup.dataset.queriedversion) {
						const sourceTabsList = sourceGroup.querySelector(".tabs-list");
						const targetTabsList = targetGroup.querySelector(".tabs-list");
						
						const sourceTabsListChildren = sourceTabsList.children;
						
						targetTabsList.textContent = "";
						
						for (const sourceTab of sourceTabsListChildren) {
							targetTabsList.insertAdjacentHTML("beforeend", `
								<li class="tab-entry colorize-gray">
									<span class="fav-icon-list-item" data-validimage="false"><img src="undefined" class="fav-icon-small"/></span>
									<span class="overlap overlapping-content">
										<span class="title"></span>
									</span>
								</li>
							`);
						}
					}
				}
				
				// Feels better when we close those groups after all. Makes dragging easier.
				//targetGroup.open = sourceGroup.open;
				targetGroup.open = false;
			}
			
			const currentlyDraggedElement = groupsListForDragAndDrop.querySelector(`[data-droptargetindex="${e.target.dataset.droptargetindex}"]`);
			currentlyDraggedElement.dataset.dragtarget = true;
			currentlyDraggedGroupElement = currentlyDraggedElement;
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
			const tabsList = currentDragParent.querySelector(":scope > .tabs-list");
			if (tabsList !== null) {
				createTabsListForDragAndDrop(currentDragParent, tabsList);
			}
			
			const groupsList = currentDragParent.querySelector(":scope > .groups-list");
			if (groupsList !== null) {
				createGroupsListForDragAndDrop(currentDragParent, groupsList);
			}
		} else if (e.dataTransfer.dropEffect == "move") {
			const tabsList = currentDragParent.querySelector(":scope > .tabs-list");
			if (tabsList !== null) {
				if (currentlyDraggedElements.length !== 0) {
					const tabsListForDragAndDrop = currentDragParent.querySelector(":scope > .tabs-list-for-drag-and-drop");
		
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
			
			const groupsList = currentDragParent.querySelector(":scope > .groups-list");
			if (groupsList !== null) {
				// This is pretty much the same logic as above, just for groups instead of tabs.
				if (currentlyDraggedGroupElement !== null) {
					const groupsListForDragAndDrop = currentDragParent.querySelector(":scope > .groups-list-for-drag-and-drop");
		
					const groupsListChildren = groupsList.querySelectorAll("details");
					const groupsListForDragAndDropChildren = groupsListForDragAndDrop.querySelectorAll("details");
					
					let idAccessor = undefined;
					let dbAccessor = undefined;
					
					const containingGroup = currentDragParent.closest("details");
					
					if (containingGroup.dataset.iscategorieslist == "true") {
						idAccessor = "categoryid";
						dbAccessor = "categories";
					} else if (containingGroup.dataset.issessionslist == "true") {
						idAccessor = "sessionid";
						dbAccessor = "sessions";
					}
					
					let firstNonMatchingIndex = 0;
					let lastNonMatchingIndex = groupsListChildren.length - 1;
					
					for (let index = firstNonMatchingIndex; index <= lastNonMatchingIndex; ++index) {
						firstNonMatchingIndex = index;
						if (groupsListChildren[index].dataset[idAccessor] !== groupsListForDragAndDropChildren[index].dataset[idAccessor]) {
							break;
						}
					}
					
					for (let index = lastNonMatchingIndex; index >= firstNonMatchingIndex; --index) {
						lastNonMatchingIndex = index;
						if (groupsListChildren[index].dataset[idAccessor] !== groupsListForDragAndDropChildren[index].dataset[idAccessor]) {
							break;
						}
					}
					
					const entriesToUpdate = [];
					
					for (let index = firstNonMatchingIndex; index <= lastNonMatchingIndex; ++index) {
						entriesToUpdate.push({
							key: parseInt(groupsListForDragAndDropChildren[index].dataset[idAccessor]),
							changes: {
								sortkey: JSON.parse(groupsListChildren[index].dataset.sortkey)
							}
						});
					}
					
					await db[dbAccessor].bulkUpdate(entriesToUpdate);
					
					// This await keeps the "for drag & drop" list visible until our changes have been
					// commited to the database and then read back to us. This effectively removes any
					// visible popping of list elements while the update is being processed.
					await waitUntilGroupUpToDate(currentDragParent.closest("details"));
				}
			}
		}
		
		currentDragParent.dataset.dragparent = false;
		currentDragParent = null;
	}
	
	for (const currentlyDraggedElement of currentlyDraggedElements) {
		currentlyDraggedElement.dataset.dragtarget = false;
	}
	
	currentlyDraggedElements.length = 0;
});

document.addEventListener("dragover", (e) => {
	if (currentDragParent !== null) {
		const rect = currentDragParent.getBoundingClientRect();
	
		const insideParent =
			e.clientX >= rect.left &&
			e.clientX <= rect.right &&
			e.clientY >= rect.top &&
			e.clientY <= rect.bottom;
	
		if (insideParent) {
			e.preventDefault();
			
			if (e.target.dataset.droptargetindex !== undefined)	{				
				if (currentlyDraggedElements.length !== 0) {
					const tabsListForDragAndDrop = e.target.closest(".tabs-list-for-drag-and-drop");
					if (tabsListForDragAndDrop !== null && !currentlyDraggedElements.includes(e.target)) {
						const targetRect = e.target.getBoundingClientRect();
						
						const overlapsTargetTop =
							e.clientX >= targetRect.left &&
							e.clientX < targetRect.right &&
							e.clientY >= targetRect.top &&
							e.clientY <= targetRect.top + (targetRect.height * 0.5);
	
						const overlapsTargetBottom =
							e.clientX >= targetRect.left &&
							e.clientX <= targetRect.right &&
							e.clientY >= targetRect.top + (targetRect.height * 0.5) &&
							e.clientY <= targetRect.bottom;
							
						let nextSibling = e.target.nextSibling;
						
						while (currentlyDraggedElements.includes(nextSibling)) {
							nextSibling = nextSibling.nextSibling;
						}
							
						for (const currentlyDraggedElement of currentlyDraggedElements) {
							if (overlapsTargetTop) {
								tabsListForDragAndDrop.insertBefore(currentlyDraggedElement, e.target);
							} else if (overlapsTargetBottom) {
								tabsListForDragAndDrop.insertBefore(currentlyDraggedElement, nextSibling);
							}
						}
					}
				} else if (currentlyDraggedGroupElement !== null && e.target !== currentlyDraggedGroupElement) {
					const groupsListForDragAndDrop = e.target.closest(".groups-list-for-drag-and-drop");
					if (groupsListForDragAndDrop !== null && e.target != currentlyDraggedGroupElement) {
						const targetRect = e.target.getBoundingClientRect();
	
						const overlapsTargetLeft =
							e.clientX >= targetRect.left &&
							e.clientX < targetRect.left + (targetRect.width * 0.5) &&
							e.clientY >= targetRect.top &&
							e.clientY <= targetRect.bottom;
	
						const overlapsTargetRight =
							e.clientX >= targetRect.left + (targetRect.width * 0.5) &&
							e.clientX <= targetRect.right &&
							e.clientY >= targetRect.top &&
							e.clientY <= targetRect.bottom;

						if (overlapsTargetLeft) {
							groupsListForDragAndDrop.insertBefore(currentlyDraggedGroupElement, e.target);
						} else if (overlapsTargetRight) {
							groupsListForDragAndDrop.insertBefore(currentlyDraggedGroupElement, e.target.nextSibling);
						}
					}
				}
			}
		}
	}
});

document.addEventListener("focusin", (e) => {
	let actionContainer = e.target.closest(".tab-entry");
	
	if (actionContainer === null) {
		actionContainer = e.target.closest("summary");
	}
	
	if (actionContainer != null) {
		// The counter here might be overkill, but just in case focusin and focusout events arrive
		// in an unexpected order...
		actionContainer.dataset.focuscount = parseInt(actionContainer.dataset.focuscount) + 1;
		if (parseInt(actionContainer.dataset.focuscount) > 0) {
			actionContainer.dataset.hasfocus = true;
		}
	}
});

document.addEventListener("focusout", (e) => {
	let actionContainer = e.target.closest(".tab-entry");
	
	if (actionContainer === null) {
		actionContainer = e.target.closest("summary");
	}
	
	if (actionContainer != null) {
		actionContainer.dataset.focuscount = parseInt(actionContainer.dataset.focuscount) - 1;
		if (parseInt(actionContainer.dataset.focuscount) <= 0) {
			actionContainer.dataset.hasfocus = false;
		}
	}
});

document.addEventListener("keydown", (e) => {
	if (e.code == "Space" || e.code == "Enter") {
		if (document.activeElement != null && document.activeElement.hasAttribute("tabindex")) {
			// This won't do, because it won't trasmit the status of our modifier keys.
			//document.activeElement.click(e);
			
			const simulatedMouseEvent = new MouseEvent("click", {
				bubbles: true,
				cancelable: true,
				view: window,
				shiftKey: e.shiftKey,
				ctrlKey: e.ctrlKey,
				altKey: e.altKey,
				metaKey: e.metaKey
			});

			document.activeElement.dispatchEvent(simulatedMouseEvent);
			
			e.preventDefault();
		}
	}
});

function deselectAllSelectedTabElements() {
	for (const tabElement of currentlySelectedTabElements) {
		tabElement.dataset.isselected = false;
	}
	
	currentTabSelectionParent = null;
	currentlySelectedTabElements = [];
}

function getElementsBetween(a, b) {
	if (a.parentElement !== b.parentElement || a === b) return [];

	if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING) {
		[a, b] = [b, a];
	}

	const result = [];
	let current = a.nextElementSibling;

	while (current && current !== b) {
		if (current.tagName === "LI") {
			result.push(current);
		}
		current = current.nextElementSibling;
	}

	return result;
}

function getBookmarkDirectoriesRecursive(bookmarkNodes, directories, path) {
	for (const bookmarkNode of bookmarkNodes) {
		if (bookmarkNode.type == "folder" && bookmarkNode.parentId) {
			directories.push({
				id: bookmarkNode.id,
				title: path + bookmarkNode.title,
				rawTitle: bookmarkNode.title
			});
		}
		
		if (bookmarkNode.children) {
			let subPath = path;
			if (bookmarkNode.parentId) {
				subPath += "&#x21B3;";
			}
			getBookmarkDirectoriesRecursive(bookmarkNode.children, directories, subPath);
		}
	}
}

async function convertTabsToBookmarks(tabs, defaultDirectoryName) {
	debugh.log("Coverting", tabs.length, "tabs to bookmarks.");
	debugh.logVerbose("Tab details:", tabs);
	
	if (tabs.length === 0) {
		convertToBookmarksNoSelectionDialog.showModal();
		return;
	}
	
	const bookmarkNodes = await browser.bookmarks.getTree();
	
	const bookmarkDirectories = [];
	getBookmarkDirectoriesRecursive(bookmarkNodes, bookmarkDirectories, "");
	
	let defaultCreateDirectory = true;
	convertToBookmarksTargetDirectory.textContent = "";
	for (const bookmarkDirectory of bookmarkDirectories) {
		const directoryMatchesDefaultName = (defaultDirectoryName == bookmarkDirectory.rawTitle);
		if (directoryMatchesDefaultName) {
			defaultCreateDirectory = false;
		}
		const selectedString = (directoryMatchesDefaultName ? " selected" : "");
		convertToBookmarksTargetDirectory.insertAdjacentHTML("beforeend", `
			<option value="${bookmarkDirectory.id}"${selectedString}>${bookmarkDirectory.title}</option>
		`);
	}
	
	convertToBookmarksTabCount.textContent = tabs.length;
	bookmarkConversionCreateDirectory.checked = defaultCreateDirectory;
	bookmarkConversionCreateDirectoryName.disabled = !defaultCreateDirectory;
	bookmarkConversionCreateDirectoryName.value = defaultDirectoryName;
	bookmarkConversionAlsoDeletesTabs.checked = false;
	tabsToBookmark = tabs;
	
	convertToBookmarksDialog.showModal();
}

async function confirmConvertTabsToBookmarks(tabs) {
	const uniqueErrors = new Set();
	const successfullyConvertedTabIds = [];
		
	try {
		let parentDirectoryId = convertToBookmarksTargetDirectory.value;
		
		if (bookmarkConversionCreateDirectory.checked) {
			const parentDirectoryNodeChildren = await browser.bookmarks.getChildren(parentDirectoryId);
			
			parentDirectoryId = (await browser.bookmarks.create({
				index: parentDirectoryNodeChildren.length,
				parentId: parentDirectoryId,
				title: bookmarkConversionCreateDirectoryName.value,
				type: "folder"
			})).id;
		}
		
		// This code is not particularly performant right now. We could parallelize all those
		// Creation calls and only have a single wait at the end, but whatever. This solution is
		// slightly simpler and probably good enough.
		for (const tab of tabs) {
			try {
				const parentDirectoryNodeChildren = await browser.bookmarks.getChildren(parentDirectoryId);
			
				await browser.bookmarks.create({
					index: parentDirectoryNodeChildren.length,
					parentId: parentDirectoryId,
					title: tab.title,
					type: "bookmark",
					url: tab.url
				});
				
				successfullyConvertedTabIds.push(tab.id);
			} catch (error) {
				uniqueErrors.add(error.toString());
			}
		}
		
		if (successfullyConvertedTabIds.length > 0 && bookmarkConversionAlsoDeletesTabs.checked) {
			try {
				db.deleteTabs(successfullyConvertedTabIds);
			} catch(error) {
				uniqueErrors.add(error.toString());
			}
		}
		
		if (uniqueErrors.size > 0) {
			convertToBookmarksError.textContent = Array.from(uniqueErrors).join("\n");
			successfullyConvertedBookmarksDespiteErrorCount.textContent = successfullyConvertedTabIds.length;
			successfullyConvertedBookmarksDespiteErrorRoot.hidden = (successfullyConvertedTabIds.length === 0);
			convertToBookmarksErrorDialog.showModal();
		} else {
			successfullyConvertedBookmarksCount.textContent = successfullyConvertedTabIds.length;
			convertToBookmarksSuccessDialog.showModal();
		}
	} catch (error) {
		uniqueErrors.add(error);
		convertToBookmarksError.textContent = Array.from(uniqueErrors).join("\n");
		successfullyConvertedBookmarksDespiteErrorCount.textContent = successfullyConvertedTabIds.length;
		successfullyConvertedBookmarksDespiteErrorRoot.hidden = (successfullyConvertedTabIds.length === 0);
		convertToBookmarksErrorDialog.showModal();
	}
}

async function convertTabElementToBookmark(tabElement) {
	await requestBookmarkingPermissions();
	
	if (!hasBookmarkingPermission) {
		return;
	}
	
	const defaultDirectoryName = tabElement.closest("details").querySelector("summary .summary-title").textContent;
	
	const tabs = [ await db.tabs.get({id: parseInt(tabElement.dataset.tabid)}) ];
	convertTabsToBookmarks(tabs, defaultDirectoryName);
}

async function convertGroupElementToBookmarks(groupElement) {
	await requestBookmarkingPermissions();
	
	if (!hasBookmarkingPermission) {
		return;
	}
	
	const defaultDirectoryName = groupElement.closest("details").querySelector("summary .summary-title").textContent;
	
	if (groupElement.dataset.categoryid) {
		const tabs = await groupFunctionLookup.tabsInCategory.query(parseInt(groupElement.dataset.categoryid));
		convertTabsToBookmarks(tabs, defaultDirectoryName);
	} else if (groupElement.dataset.sessionid) {
		const tabs = await groupFunctionLookup.tabsInSession.query(parseInt(groupElement.dataset.sessionid));
		convertTabsToBookmarks(tabs, defaultDirectoryName);
	}
}

function openMenu() {
	mainMenu.hidden = false;
	toggleMenuButton.dataset.open = true;
}

function hideMenu() {
	mainMenu.hidden = true;
	toggleMenuButton.dataset.open = false;
}

function toggleMenu() {
	if (mainMenu.hidden) {
		openMenu();
	} else {
		hideMenu();
	}
}

async function rerunCategoryAutoCatch() {
	waitingForCompletionDialog.showModal();
	
	let caughtError = null;
	
	try {
		const autoCatchCategories = await db.getCategoriesWithAutoCatchRules();
		const tabs = await groupFunctionPrimitives.unsortedTabs().toArray();
		
		const tabsToUpdate = [];
		const uniqueErrors = new Set();
		
		for (const tab of tabs) {
			let needsUpdate = false;
			
			for (const autoCatchCategory of autoCatchCategories) {
				try {
					if (!tab.categories.includes(autoCatchCategory.id) && await ruleeval.matchesRule(tab, autoCatchCategory.rule)) {
						tab.categories.push(autoCatchCategory.id);
						needsUpdate = true;
					}
				} catch(error) {
					uniqueErrors.add(error.toString());
				}
			}
			
			if (needsUpdate) {
				tabsToUpdate.push(tab);
			}
		}
		
		if (tabsToUpdate.length > 0) {
			try {
				const entriesToUpdate = tabsToUpdate.map((tab) => {
					return {
						key: tab.id,
						changes: {
							categories: tab.categories,
						}
					};
				});
				
				await db.tabs.bulkUpdate(entriesToUpdate);
			} catch(error) {
				uniqueErrors.add(error.toString());
			}
		}
		
		if (uniqueErrors.size > 0) {
			throw Array.from(uniqueErrors).join("\n");
		}
	} catch(error) {
		caughtError = error;
	}
	
	await new Promise(r => setTimeout(r, minimumProcessDialogDisplayTime));
	
	waitingForCompletionDialog.close();
	
	if (caughtError) {
		rerunCategoryAutoCatchError.textContent = caughtError;
		
		rerunCategoryAutoCatchErrorDialog.showModal();
	}
}

async function exportArchive() {
	await requestDownloadingPermissions();
	
	if (!hasDownloadingPermission) {
		return;
	}
	
	importOrExportLabel.textContent = "Export";
	importExportErrorTypeLabel.textContent = "export";
	importOrExportProgressLabel.textContent = "0";
	
	importExportDialog.showModal();
	
	try {
		const exportOptions = {
			noTransaction: false,
			numRowsPerChunk: 5,
			prettyJson: true,
			filter: null,
			progressCallback: (progress) => {
				importOrExportProgressLabel.textContent = ((progress.completedRows/progress.totalRows) * 100).toFixed(0);
				return true;
			}
		};
	
		const archiveBlob = await db.export(exportOptions);
			
		await new Promise(r => setTimeout(r, minimumProcessDialogDisplayTime));

		const currentDate = new Date();
		
		const day = String(currentDate.getDate()).padStart(2, '0');
		const month = String(currentDate.getMonth() + 1).padStart(2, '0');
		const year = currentDate.getFullYear();
		
		const hours = String(currentDate.getHours()).padStart(2, '0');
		const minutes = String(currentDate.getMinutes()).padStart(2, '0');
		const seconds = String(currentDate.getSeconds()).padStart(2, '0');
		
		const dateTimeStamp = `${year}-${month}-${day}--${hours}-${minutes}-${seconds}`;
		
		await browser.downloads.download({
			filename: `Phantabular-Archive--${dateTimeStamp}.json`,
			url: URL.createObjectURL(archiveBlob)
		});
	} catch(error) {
		importExportError.textContent = error;
		importExportErrorDialog.showModal();
	}
	
	importExportDialog.close();
}

async function importArchive() {
	if (fileToImport.files.length == 0) {
		noImportFileSelectedDialog.showModal();
		return;
	}
	
	importOrExportLabel.textContent = "Import";
	importExportErrorTypeLabel.textContent = "import";
	importOrExportProgressLabel.textContent = "0";
	
	try {		
		const importOptions = {			
			acceptMissingTables: true,
			acceptVersionDiff: true,
			acceptNameDiff: true,
			acceptChangedPrimaryKey: true,
			overwriteValues: true,
			clearTablesBeforeImport: importOverwritesEntireArchive.checked,
			noTransaction: false,
			//chunkSizeBytes: 100000,
			filter: null,
			transform: null,	// Probably needs to be provided once we actually have versions to migrate?
			progressCallback: (progress) => {
				importOrExportProgressLabel.textContent = ((progress.completedRows/progress.totalRows) * 100).toFixed(0);
				return true;
			}
		};
	
		await db.import(fileToImport.files[0], importOptions);
	} catch(error) {
		importExportError.textContent = error;
		importExportErrorDialog.showModal();
	}
	
	importExportDialog.close();
}

async function openImportArchiveSelector() {
	fileToImport.value = "";
	importOverwritesEntireArchive.checked = false;
	
	importFileSelectDialog.showModal();
}

document.addEventListener("click", (e) => {
	if (e.target.classList.contains("tab-entry")) {
		const container = e.target.closest(".tabs-list");
		
		const isRangeSelect = e.shiftKey;
		const isMultiSelect = e.ctrlKey;
		
		if (container != currentTabSelectionParent || (!isRangeSelect && !isMultiSelect)) {
			deselectAllSelectedTabElements();
		}
		
		currentTabSelectionParent = container;
		
		if (currentTabSelectionParent != null) {
			if (isRangeSelect) {
				if (currentlySelectedTabElements.length === 0) {
					e.target.dataset.isselected = true;
					currentlySelectedTabElements.push(e.target);
				} else {
					const first = currentlySelectedTabElements.at(-1);
					const last = e.target;
					
					const elementsBetween = getElementsBetween(first, last);
					elementsBetween.push(last);
					
					for (const element of elementsBetween) {
						if (!currentlySelectedTabElements.includes(element)) {
							element.dataset.isselected = true;
							currentlySelectedTabElements.push(element);
						}
					}
				}
			} else if (isMultiSelect) {
				const existingIndex = currentlySelectedTabElements.indexOf(e.target);
				if (existingIndex != -1) {
					e.target.dataset.isselected = false;
					currentlySelectedTabElements.splice(existingIndex, 1);
				} else {
					e.target.dataset.isselected = true;
					currentlySelectedTabElements.push(e.target);
				}
			} else {
				e.target.dataset.isselected = true;
				currentlySelectedTabElements.push(e.target);
			}
		}
	} else {
		deselectAllSelectedTabElements();
	}
});

document.addEventListener("click", (e) => {
	if (!mainMenu.hidden && e.target != toggleMenuButton) {
		const rect = mainMenu.getBoundingClientRect();
	
		const inside =
			e.clientX >= rect.left &&
			e.clientX <= rect.right &&
			e.clientY >= rect.top &&
			e.clientY <= rect.bottom;
			
		if (!inside) {
			hideMenu();
		}
	}
	
	if (e.target.tagName !== "BUTTON" && e.target.dataset.action == undefined) {
		return;
	}

	switch (e.target.dataset.action) {
		case "create-category":
			debugh.log("Creating new category.");
			createNewCategory();
			break;
			
		case "edit-category-settings":
			editCategorySettings(e.target.closest("[data-categoryid]"));
			break;
			
		case "convert-group-to-bookmarks":
			convertGroupElementToBookmarks(e.target.closest(".group-details"));
			break;
			
		case "confirm-bookmark-conversion":
			const directoryNameIsJustWhitespace = (bookmarkConversionCreateDirectoryName.value.replace(/\s/g, "").length === 0);
			if (bookmarkConversionCreateDirectory.checked && directoryNameIsJustWhitespace) {
				convertToBookmarksEmptyDirectoryNameDialog.showModal();
			} else {
				confirmConvertTabsToBookmarks(tabsToBookmark);	
				tabsToBookmark = null;
				convertToBookmarksDialog.close();
			}
			break;
			
		case "cancel-bookmark-conversion":	
			tabsToBookmark = null;
			convertToBookmarksDialog.close();
			break;
			
		case "convert-to-bookmarks-empty-directory-name-confirmed":
			convertToBookmarksDialog.showModal();
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
					<input class="inline-text"></input> <button type="button" data-action="delete-category-regex-capture-group" data-tooltiptype="button" class="colorize-button image-button has-tooltip">&#xff0d;</button>
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
			
		case "copy-tab-url":
		{
			const tabId = parseInt(e.target.closest("[data-tabid]").dataset.tabid);	
			db.tabs.get({id: tabId}).then((tab) => {
				navigator.clipboard.writeText(tab.url);
			});
			break;
		}
			
		case "open-tab":
			openTabForElement(e.target.closest("[data-tabid]"));
			break;
			
		case "convert-tab-to-bookmark":
			convertTabElementToBookmark(e.target.closest("[data-tabid]"));
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
			
		case "toggle-menu":
			toggleMenu();
			break;
			
		case "re-run-category-auto-catch":
			hideMenu();
			rerunCategoryAutoCatch();
			break;
			
		case "export-archive":
			hideMenu();
			exportArchive();
			break;
			
		case "import-archive":
			hideMenu();
			openImportArchiveSelector();
			break;
			
		case "confirm-import":
			importFileSelectDialog.close();
			importArchive();
			break;
			
		case "cancel-import":
			importFileSelectDialog.close();
			break;
			
		case "no-import-file-selected-confirmed":
			importFileSelectDialog.showModal();
			break;
			
		case "clear-filter":
			clearFilterStrings();
			break;
	}
});
