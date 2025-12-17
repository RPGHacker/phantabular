import db from "../shared/database.mjs";
import ruleeval from "../shared/rules.mjs";
import settings from "../shared/settings.mjs";

document.addEventListener("click", (e) => {
	if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
		return;
	}
	
	function setNodeState(node, active) {
		node.disabled = !active;
		for(let childNode of node.children) {
			setNodeState(childNode, active);
		}
	}

	async function archiveTabs(tabs) {
		const oldButtonText = e.target.innerHTML;
		e.target.innerHTML = 'Working...';
		
		const popupRootNode = document.getElementById('popup-content');
		setNodeState(popupRootNode, false);
		
		const archiveSettings = await settings.archiveSettings;

		let tabsToArchive = [];

		// Sort out tabs that are part of the selection, but we don't want to archive.
		for (const tab of tabs){
			if ((tab.hidden && !archiveSettings.archiveHiddenTabs)
				|| (tab.pinned && !archiveSettings.archivePinnedTabs))
			{
				continue;
			}

			console.log("[TabArchive] Archiving: " + tab.url);
			tabsToArchive.push(tab);
		};

		if (tabsToArchive.length === 0) {
			return;
		}

		// Retrieve all categories that have auto-catch rules, so that we can check if
		// any of them need to be applied to the tab's we're about to archive.
		const autoCatchCategories = await db.getCategoriesWithAutoCatchRules();

		// Retrieve or create the session that our tabs will go into.
		let currentSession = await db.getCurrentSession();

		if (!currentSession) {
			currentSession = await db.createNewSession();
		}

		console.log("[TabArchive] Session: " + currentSession.id + " -> " + currentSession.creationdate);

		// Transform our list of tabs into the format that our DB helper expects.
		let tabsToArchiveWithCategories = [];

		for (const tab of tabsToArchive) {
			let categoriesToAdd = [];
			
			// Check, which categories match, and add them to our list of categories for this tab.
			for (const category of autoCatchCategories) {
				if (await ruleeval.matchesRule(tab, category.rule)) {
					categoriesToAdd.push(category.id);
				}
			}

			tabsToArchiveWithCategories.push({tab: tab, categories: categoriesToAdd})
		}

		await db.addTabsToArchive(tabsToArchiveWithCategories, currentSession.id);
		
		setNodeState(popupRootNode, true);
		
		// Doing this after re-enabling the button runs the risk of the user
		// immediately clicking the button again and its caption permanently
		// changing into "Done!", but it's a risk I'm willing to take just
		// to prevent the UI from blocking. It's not a critical bug, anyways.
		e.target.innerHTML = 'Done!';		
		await new Promise(r => setTimeout(r, 1000));		
		e.target.innerHTML = oldButtonText;
	}

	switch (e.target.dataset.action) {
		case "archive-current-tab":
			console.log("[Tab Archive] Archiving active tab.");
			browser.tabs
				.query({ active: true, currentWindow: true })
				.then(archiveTabs);
			break;
		case "archive-tabs-in-current-window":
			console.log("[Tab Archive] Archiving tabs in current window.");
			browser.tabs
				.query({ currentWindow: true })
				.then(archiveTabs);
			break;
		case "archive-tabs-in-all-windows":
			console.log("[Tab Archive] Archiving tabs in all windows.");
			browser.tabs
				.query({ })
				.then(archiveTabs);
			break;
		case "view-archive":
			console.log("[Tab Archive] Viewing archive.");
			browser.tabs.create({
			  url: '../archive/archive.html'
			});
			window.close();
			break;
		case "view-settings":
			console.log("[Tab Archive] Viewing settings.");
			browser.tabs.create({
			  url: '../settings/settings.html'
			});
			window.close();
			break;
	}
});
