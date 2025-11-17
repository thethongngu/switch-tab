// Window-aware MRU (Most Recently Used) tab lists
let mruTabLists = {}; // { windowId: [tabIds] }
let isNavigating = {}; // { windowId: boolean }
let currentMruIndex = {}; // { windowId: number }
let navigationTimer = {}; // { windowId: timer }

const CACHE_KEY_PREFIX = "mru_cache_";
const NAV_STATE_KEY = "navigation_state";
const NAVIGATION_TIMEOUT = 1000; // 1 second
const KEEPALIVE_INTERVAL = 20000; // 20 seconds

let keepAliveInterval = null;

// Initialize the extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log("MRU Tab Switcher installed");
  await restoreStateFromStorage();
  await initializeAllWindows();
  startKeepalive();
});

// Initialize MRU lists when the extension starts
chrome.runtime.onStartup.addListener(async () => {
  await restoreStateFromStorage();
  await initializeAllWindows();
  startKeepalive();
});

// Restore state when service worker wakes up from inactivity
async function restoreStateFromStorage() {
  try {
    console.log("Restoring state from storage...");

    // Restore navigation state
    const navState = await chrome.storage.session.get(NAV_STATE_KEY);
    if (navState && navState[NAV_STATE_KEY]) {
      const state = navState[NAV_STATE_KEY];
      isNavigating = state.isNavigating || {};
      currentMruIndex = state.currentMruIndex || {};
      console.log("Restored navigation state:", state);
    }

    // Restore MRU lists from cache
    const allStorage = await chrome.storage.session.get(null);
    for (const key in allStorage) {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        const windowId = parseInt(key.replace(CACHE_KEY_PREFIX, ""));
        mruTabLists[windowId] = allStorage[key];
        console.log(`Restored MRU list for window ${windowId}`);
      }
    }

    console.log("State restoration complete");
  } catch (error) {
    console.error("Error restoring state:", error);
  }
}

// Save navigation state to storage
async function saveNavigationState() {
  try {
    await chrome.storage.session.set({
      [NAV_STATE_KEY]: {
        isNavigating,
        currentMruIndex,
      },
    });
  } catch (error) {
    console.error("Error saving navigation state:", error);
  }
}

// Keepalive to prevent service worker from shutting down during active use
function startKeepalive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }

  // Keep the service worker alive by periodically checking windows
  keepAliveInterval = setInterval(async () => {
    try {
      // This lightweight operation keeps the service worker active
      await chrome.windows.getAll({ populate: false });
    } catch (error) {
      console.error("Keepalive error:", error);
    }
  }, KEEPALIVE_INTERVAL);

  console.log("Keepalive started");
}

// Initialize MRU lists for all windows
async function initializeAllWindows() {
  try {
    const windows = await chrome.windows.getAll({ populate: true });

    for (const window of windows) {
      await initializeMruListForWindow(window.id, window.tabs);
    }

    console.log("Initialized all window MRU lists:", mruTabLists);
  } catch (error) {
    console.error("Error initializing all windows:", error);
  }
}

// Initialize MRU list for a specific window
async function initializeMruListForWindow(windowId, tabs = null) {
  try {
    // Try to load from cache first
    const cachedList = await loadCacheForWindow(windowId);

    // Get current tabs if not provided
    if (!tabs) {
      tabs = await chrome.tabs.query({ windowId: windowId });
    }

    const currentTabIds = tabs.map((tab) => tab.id);

    // Validate cached list
    if (cachedList && validateMruList(cachedList, currentTabIds)) {
      console.log(`Loaded MRU list from cache for window ${windowId}`);
      mruTabLists[windowId] = cachedList;
    } else {
      // Build list from scratch
      console.log(`Building MRU list from scratch for window ${windowId}`);
      const activeTabs = tabs.filter((tab) => tab.active);
      const mruList = [];

      // Add active tab first
      if (activeTabs.length > 0) {
        mruList.push(activeTabs[0].id);
      }

      // Add other tabs
      tabs.forEach((tab) => {
        if (!tab.active && !mruList.includes(tab.id)) {
          mruList.push(tab.id);
        }
      });

      mruTabLists[windowId] = mruList;
      await saveCacheForWindow(windowId, mruList);
    }

    console.log(
      `Initialized MRU list for window ${windowId}:`,
      mruTabLists[windowId],
    );
  } catch (error) {
    console.error(`Error initializing MRU list for window ${windowId}:`, error);
  }
}

// Validate MRU list against actual tabs
function validateMruList(mruList, currentTabIds) {
  if (!mruList || !Array.isArray(mruList) || mruList.length === 0) {
    return false;
  }

  // Check if the counts match
  if (mruList.length !== currentTabIds.length) {
    console.log(
      `Validation failed: list length ${mruList.length} != tab count ${currentTabIds.length}`,
    );
    return false;
  }

  // Check if all tabs in the list exist
  const currentTabIdSet = new Set(currentTabIds);
  for (const tabId of mruList) {
    if (!currentTabIdSet.has(tabId)) {
      console.log(
        `Validation failed: tab ${tabId} in list but not in current tabs`,
      );
      return false;
    }
  }

  // Check if all current tabs are in the list
  const mruListSet = new Set(mruList);
  for (const tabId of currentTabIds) {
    if (!mruListSet.has(tabId)) {
      console.log(`Validation failed: tab ${tabId} exists but not in MRU list`);
      return false;
    }
  }

  return true;
}

// Save MRU list to cache
async function saveCacheForWindow(windowId, mruList) {
  try {
    const key = `${CACHE_KEY_PREFIX}${windowId}`;
    await chrome.storage.session.set({ [key]: mruList });
    console.log(`Saved cache for window ${windowId}`);
  } catch (error) {
    console.error(`Error saving cache for window ${windowId}:`, error);
  }
}

// Load MRU list from cache
async function loadCacheForWindow(windowId) {
  try {
    const key = `${CACHE_KEY_PREFIX}${windowId}`;
    const result = await chrome.storage.session.get(key);
    return result[key] || null;
  } catch (error) {
    console.error(`Error loading cache for window ${windowId}:`, error);
    return null;
  }
}

// Clear cache for a window
async function clearCacheForWindow(windowId) {
  try {
    const key = `${CACHE_KEY_PREFIX}${windowId}`;
    await chrome.storage.session.remove(key);
    console.log(`Cleared cache for window ${windowId}`);
  } catch (error) {
    console.error(`Error clearing cache for window ${windowId}:`, error);
  }
}

// Track tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Ensure state is restored if service worker just woke up
  if (Object.keys(mruTabLists).length === 0) {
    await restoreStateFromStorage();
  }

  const windowId = activeInfo.windowId;

  if (isNavigating[windowId]) {
    return; // Don't update MRU list while navigating
  }

  await updateMruList(windowId, activeInfo.tabId);
});

// Update MRU list when a tab is activated
async function updateMruList(windowId, tabId) {
  try {
    // Ensure window list exists
    if (!mruTabLists[windowId]) {
      await initializeMruListForWindow(windowId);
      return;
    }

    // Verify the list integrity periodically
    const tabs = await chrome.tabs.query({ windowId: windowId });
    const currentTabIds = tabs.map((tab) => tab.id);

    if (!validateMruList(mruTabLists[windowId], currentTabIds)) {
      console.log(
        `MRU list validation failed for window ${windowId}, attempting recovery`,
      );

      // Try to recover from cache
      const cachedList = await loadCacheForWindow(windowId);
      if (cachedList && validateMruList(cachedList, currentTabIds)) {
        console.log(`Recovered from cache for window ${windowId}`);
        mruTabLists[windowId] = cachedList;
      } else {
        // Rebuild from scratch
        console.log(`Rebuilding MRU list for window ${windowId}`);
        await initializeMruListForWindow(windowId, tabs);
        return;
      }
    }

    // Remove the tab if it's already in the list
    const index = mruTabLists[windowId].indexOf(tabId);
    if (index > -1) {
      mruTabLists[windowId].splice(index, 1);
    }

    // Add the tab to the front of the list
    mruTabLists[windowId].unshift(tabId);

    // Keep the list size reasonable (max 100 tabs)
    if (mruTabLists[windowId].length > 100) {
      mruTabLists[windowId] = mruTabLists[windowId].slice(0, 100);
    }

    // Save to cache
    await saveCacheForWindow(windowId, mruTabLists[windowId]);

    console.log(
      `Updated MRU list for window ${windowId}:`,
      mruTabLists[windowId],
    );
  } catch (error) {
    console.error(`Error updating MRU list for window ${windowId}:`, error);
  }
}

// Remove closed tabs from MRU list
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  const windowId = removeInfo.windowId;

  if (mruTabLists[windowId]) {
    const index = mruTabLists[windowId].indexOf(tabId);
    if (index > -1) {
      mruTabLists[windowId].splice(index, 1);
      await saveCacheForWindow(windowId, mruTabLists[windowId]);
      console.log(`Removed tab ${tabId} from MRU list for window ${windowId}`);
    }
  }
});

// Handle new tab creation
chrome.tabs.onCreated.addListener(async (tab) => {
  const windowId = tab.windowId;

  if (!mruTabLists[windowId]) {
    await initializeMruListForWindow(windowId);
  } else {
    // Add the new tab to the end of the list if not already there
    if (!mruTabLists[windowId].includes(tab.id)) {
      mruTabLists[windowId].push(tab.id);
      await saveCacheForWindow(windowId, mruTabLists[windowId]);
      console.log(`Added new tab ${tab.id} to MRU list for window ${windowId}`);
    }
  }
});

// Handle window creation
chrome.windows.onCreated.addListener(async (window) => {
  console.log(`Window created: ${window.id}`);
  await initializeMruListForWindow(window.id);
});

// Handle window removal
chrome.windows.onRemoved.addListener(async (windowId) => {
  console.log(`Window removed: ${windowId}`);

  // Clean up window data
  delete mruTabLists[windowId];
  delete isNavigating[windowId];
  delete currentMruIndex[windowId];

  if (navigationTimer[windowId]) {
    clearTimeout(navigationTimer[windowId]);
    delete navigationTimer[windowId];
  }

  await clearCacheForWindow(windowId);
});

// Handle tab switching commands
chrome.commands.onCommand.addListener(async (command) => {
  console.log("Command received:", command);

  // Ensure state is restored if service worker just woke up
  if (Object.keys(mruTabLists).length === 0) {
    console.log("Service worker was inactive, restoring state...");
    await restoreStateFromStorage();

    // If still empty, initialize
    if (Object.keys(mruTabLists).length === 0) {
      await initializeAllWindows();
    }
  }

  // Get the current window
  const window = await chrome.windows.getCurrent();
  const windowId = window.id;

  if (command === "switch-to-previous-tab") {
    await switchTab(windowId, "previous");
  } else if (command === "switch-to-next-tab") {
    await switchTab(windowId, "next");
  } else if (command === "switch-to-last-tab") {
    await switchToLastTab(windowId);
  }
});

// Switch to the next/previous tab in MRU list
async function switchTab(windowId, direction) {
  try {
    if (!mruTabLists[windowId] || mruTabLists[windowId].length < 2) {
      console.log(`Not enough tabs to switch in window ${windowId}`);
      return;
    }

    // Start navigation mode
    if (!isNavigating[windowId]) {
      isNavigating[windowId] = true;
      currentMruIndex[windowId] = 0;
      await saveNavigationState();
    }

    // Clear the existing timer
    if (navigationTimer[windowId]) {
      clearTimeout(navigationTimer[windowId]);
    }

    // Move to next/previous tab in MRU list
    if (direction === "previous") {
      currentMruIndex[windowId]++;
      if (currentMruIndex[windowId] >= mruTabLists[windowId].length) {
        currentMruIndex[windowId] = 0;
      }
    } else if (direction === "next") {
      currentMruIndex[windowId]--;
      if (currentMruIndex[windowId] < 0) {
        currentMruIndex[windowId] = mruTabLists[windowId].length - 1;
      }
    }

    const targetTabId = mruTabLists[windowId][currentMruIndex[windowId]];

    // Check if the tab still exists
    try {
      const tab = await chrome.tabs.get(targetTabId);
      await chrome.tabs.update(targetTabId, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });

      console.log(
        `Switched to tab ${targetTabId} at MRU index ${currentMruIndex[windowId]} in window ${windowId}`,
      );
    } catch (error) {
      // Tab doesn't exist anymore, remove it from the list
      console.log(`Tab ${targetTabId} no longer exists in window ${windowId}`);
      mruTabLists[windowId].splice(currentMruIndex[windowId], 1);
      await saveCacheForWindow(windowId, mruTabLists[windowId]);

      // Try again with the next tab
      if (mruTabLists[windowId].length > 1) {
        currentMruIndex[windowId] = Math.min(
          currentMruIndex[windowId],
          mruTabLists[windowId].length - 1,
        );
        await switchTab(windowId, direction);
      }
      return;
    }

    // Set a timer to end navigation mode
    navigationTimer[windowId] = setTimeout(() => {
      finishNavigation(windowId);
    }, NAVIGATION_TIMEOUT);

    // Save navigation state
    await saveNavigationState();
  } catch (error) {
    console.error(`Error switching tab in window ${windowId}:`, error);
    isNavigating[windowId] = false;
    await saveNavigationState();
  }
}

// Switch to the last used tab (second in MRU list)
async function switchToLastTab(windowId) {
  try {
    if (!mruTabLists[windowId] || mruTabLists[windowId].length < 2) {
      console.log(
        `Not enough tabs to switch to last used tab in window ${windowId}`,
      );
      return;
    }

    // The last used tab is at index 1 (second position)
    const lastUsedTabId = mruTabLists[windowId][1];

    // Check if the tab still exists
    try {
      const tab = await chrome.tabs.get(lastUsedTabId);
      await chrome.tabs.update(lastUsedTabId, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
      console.log(
        `Switched to last used tab ${lastUsedTabId} in window ${windowId}`,
      );
    } catch (error) {
      // Tab doesn't exist anymore, remove it from the list and try the next one
      console.log(
        `Last used tab ${lastUsedTabId} no longer exists in window ${windowId}`,
      );
      mruTabLists[windowId].splice(1, 1);
      await saveCacheForWindow(windowId, mruTabLists[windowId]);

      // Try again with the new second tab
      if (mruTabLists[windowId].length >= 2) {
        await switchToLastTab(windowId);
      }
    }
  } catch (error) {
    console.error(
      `Error switching to last used tab in window ${windowId}:`,
      error,
    );
  }
}

// Finish navigation and update MRU list
async function finishNavigation(windowId) {
  if (!isNavigating[windowId]) return;

  console.log(`Finishing navigation for window ${windowId}`);

  // Move the selected tab to the front of the MRU list
  if (
    currentMruIndex[windowId] > 0 &&
    currentMruIndex[windowId] < mruTabLists[windowId].length
  ) {
    const selectedTab = mruTabLists[windowId][currentMruIndex[windowId]];
    mruTabLists[windowId].splice(currentMruIndex[windowId], 1);
    mruTabLists[windowId].unshift(selectedTab);
    await saveCacheForWindow(windowId, mruTabLists[windowId]);
  }

  isNavigating[windowId] = false;
  currentMruIndex[windowId] = 0;
  navigationTimer[windowId] = null;

  // Save navigation state
  await saveNavigationState();

  console.log(`Final MRU list for window ${windowId}:`, mruTabLists[windowId]);
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Ensure state is restored if service worker just woke up
  const handleRequest = async () => {
    if (Object.keys(mruTabLists).length === 0) {
      await restoreStateFromStorage();
    }

    if (request.action === "getMruList") {
      return await getMruListWithDetails(request.windowId);
    } else if (request.action === "switchToTab") {
      return await switchToTabById(request.tabId);
    } else if (request.action === "rebuildMruList") {
      return await rebuildMruListForWindow(request.windowId);
    }
  };

  handleRequest().then(sendResponse);
  return true; // Will respond asynchronously
});

// Get MRU list with tab details for a specific window
async function getMruListWithDetails(windowId) {
  try {
    // Get current window if not specified
    if (!windowId) {
      const window = await chrome.windows.getCurrent();
      windowId = window.id;
    }

    // Ensure MRU list exists for this window
    if (!mruTabLists[windowId]) {
      await initializeMruListForWindow(windowId);
    }

    const tabDetails = [];
    const validTabIds = [];

    for (const tabId of mruTabLists[windowId]) {
      try {
        const tab = await chrome.tabs.get(tabId);
        if (tab.windowId === windowId) {
          tabDetails.push({
            id: tab.id,
            title: tab.title,
            url: tab.url,
            favIconUrl: tab.favIconUrl,
            active: tab.active,
          });
          validTabIds.push(tabId);
        }
      } catch (error) {
        // Tab no longer exists, skip it
        console.log(`Tab ${tabId} no longer exists in window ${windowId}`);
      }
    }

    // Update the list if we found invalid tabs
    if (validTabIds.length !== mruTabLists[windowId].length) {
      mruTabLists[windowId] = validTabIds;
      await saveCacheForWindow(windowId, mruTabLists[windowId]);
    }

    return { windowId, tabs: tabDetails };
  } catch (error) {
    console.error(`Error getting MRU list for window ${windowId}:`, error);
    return { windowId, tabs: [], error: error.message };
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

// Manually rebuild MRU list for a window
async function rebuildMruListForWindow(windowId) {
  try {
    console.log(`Manually rebuilding MRU list for window ${windowId}`);
    await initializeMruListForWindow(windowId);
    return { success: true, list: mruTabLists[windowId] };
  } catch (error) {
    console.error(`Error rebuilding MRU list for window ${windowId}:`, error);
    return { success: false, error: error.message };
  }
}
