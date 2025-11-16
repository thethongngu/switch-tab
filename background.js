// MRU (Most Recently Used) tab list
let mruTabList = [];
let isNavigating = false;
let currentMruIndex = 0;
let navigationTimer = null;

// Initialize the extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log("MRU Tab Switcher installed");
  await initializeMruList();
});

// Initialize MRU list when the extension starts
chrome.runtime.onStartup.addListener(async () => {
  await initializeMruList();
});

// Initialize MRU list with current tabs
async function initializeMruList() {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const activeTabs = tabs.filter((tab) => tab.active);

    if (activeTabs.length > 0) {
      mruTabList = [activeTabs[0].id];
    }

    // Add other tabs to the list
    tabs.forEach((tab) => {
      if (!tab.active && !mruTabList.includes(tab.id)) {
        mruTabList.push(tab.id);
      }
    });

    console.log("Initialized MRU list:", mruTabList);
  } catch (error) {
    console.error("Error initializing MRU list:", error);
  }
}

// Track tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (isNavigating) {
    return; // Don't update MRU list while navigating
  }

  updateMruList(activeInfo.tabId);
});

// Update MRU list when a tab is activated
function updateMruList(tabId) {
  // Remove the tab if it's already in the list
  const index = mruTabList.indexOf(tabId);
  if (index > -1) {
    mruTabList.splice(index, 1);
  }

  // Add the tab to the front of the list
  mruTabList.unshift(tabId);

  // Keep the list size reasonable (max 100 tabs)
  if (mruTabList.length > 100) {
    mruTabList = mruTabList.slice(0, 100);
  }

  console.log("Updated MRU list:", mruTabList);
}

// Remove closed tabs from MRU list
chrome.tabs.onRemoved.addListener((tabId) => {
  const index = mruTabList.indexOf(tabId);
  if (index > -1) {
    mruTabList.splice(index, 1);
    console.log("Removed tab from MRU list:", tabId);
  }
});

// Handle tab switching commands
// Handle tab switching commands
chrome.commands.onCommand.addListener(async (command) => {
  console.log("Command received:", command);

  if (command === "switch-to-previous-tab") {
    await switchTab("previous");
  } else if (command === "switch-to-next-tab") {
    await switchTab("next");
  } else if (command === "switch-to-last-tab") {
    await switchToLastTab();
  } else if (command === "open-tab-switcher") {
    await openTabSwitcher();
  }
});

// Switch to the next/previous tab in MRU list
async function switchTab(direction) {
  try {
    if (mruTabList.length < 2) {
      console.log("Not enough tabs to switch");
      return;
    }

    // Start navigation mode
    if (!isNavigating) {
      isNavigating = true;
      currentMruIndex = 0;
    }

    // Clear the existing timer
    if (navigationTimer) {
      clearTimeout(navigationTimer);
    }

    // Move to next/previous tab in MRU list
    if (direction === "previous") {
      currentMruIndex++;
      if (currentMruIndex >= mruTabList.length) {
        currentMruIndex = 0;
      }
    } else if (direction === "next") {
      currentMruIndex--;
      if (currentMruIndex < 0) {
        currentMruIndex = mruTabList.length - 1;
      }
    }

    const targetTabId = mruTabList[currentMruIndex];

    // Check if the tab still exists
    try {
      const tab = await chrome.tabs.get(targetTabId);
      await chrome.tabs.update(targetTabId, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });

      console.log(
        `Switched to tab ${targetTabId} at MRU index ${currentMruIndex}`,
      );
    } catch (error) {
      // Tab doesn't exist anymore, remove it from the list
      console.log("Tab no longer exists:", targetTabId);
      mruTabList.splice(currentMruIndex, 1);

      // Try again with the next tab
      if (mruTabList.length > 1) {
        currentMruIndex = Math.min(currentMruIndex, mruTabList.length - 1);
        await switchTab(direction);
      }
      return;
    }

    // Set a timer to end navigation mode
    navigationTimer = setTimeout(() => {
      finishNavigation();
    }, 1000); // 1 second delay
  } catch (error) {
    console.error("Error switching tab:", error);
    isNavigating = false;
  }
}

// Switch to the last used tab (second in MRU list)
async function switchToLastTab() {
  try {
    if (mruTabList.length < 2) {
      console.log("Not enough tabs to switch to last used tab");
      return;
    }

    // The last used tab is at index 1 (second position)
    const lastUsedTabId = mruTabList[1];

    // Check if the tab still exists
    try {
      const tab = await chrome.tabs.get(lastUsedTabId);
      await chrome.tabs.update(lastUsedTabId, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
      console.log(`Switched to last used tab ${lastUsedTabId}`);
    } catch (error) {
      // Tab doesn't exist anymore, remove it from the list and try the next one
      console.log("Last used tab no longer exists:", lastUsedTabId);
      mruTabList.splice(1, 1);

      // Try again with the new second tab
      if (mruTabList.length >= 2) {
        await switchToLastTab();
      }
    }
  } catch (error) {
    console.error("Error switching to last used tab:", error);
  }
}

// Get MRU list for popup

// Finish navigation and update MRU list
function finishNavigation() {
  if (!isNavigating) return;

  console.log("Finishing navigation");

  // Move the selected tab to the front of the MRU list
  if (currentMruIndex > 0 && currentMruIndex < mruTabList.length) {
    const selectedTab = mruTabList[currentMruIndex];
    mruTabList.splice(currentMruIndex, 1);
    mruTabList.unshift(selectedTab);
  }

  isNavigating = false;
  currentMruIndex = 0;
  navigationTimer = null;

  console.log("Final MRU list:", mruTabList);
}

// Get MRU list for popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getMruList") {
    getMruListWithDetails().then(sendResponse);
    return true; // Will respond asynchronously
  } else if (request.action === "switchToTab") {
    switchToTabById(request.tabId).then(sendResponse);
    return true; // Will respond asynchronously
  }
});

// Get MRU list with tab details
async function getMruListWithDetails() {
  const tabDetails = [];

  for (const tabId of mruTabList) {
    try {
      const tab = await chrome.tabs.get(tabId);
      tabDetails.push({
        id: tab.id,
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl,
        active: tab.active,
      });
    } catch (error) {
      // Tab no longer exists, skip it
      console.log("Tab no longer exists in MRU list:", tabId);
    }
  }

  return tabDetails;
}

// Open tab switcher overlay
async function openTabSwitcher() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab) {
      await chrome.tabs.sendMessage(tab.id, { action: "showTabSwitcher" });
    }
  } catch (error) {
    console.error("Error opening tab switcher:", error);
  }
}

// Switch to tab by ID
async function switchToTabById(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    await chrome.tabs.update(tabId, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
    return { success: true };
  } catch (error) {
    console.error("Error switching to tab:", error);
    return { success: false, error: error.message };
  }
}
