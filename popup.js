// Load and display the MRU tab list
async function loadMruList() {
  try {
    // Get current window
    const currentWindow = await chrome.windows.getCurrent();
    const windowId = currentWindow.id;

    // Request MRU list for current window
    const response = await chrome.runtime.sendMessage({
      action: "getMruList",
      windowId: windowId,
    });

    const tabListElement = document.getElementById("tabList");

    if (!response || !response.tabs || response.tabs.length === 0) {
      tabListElement.innerHTML =
        '<div class="empty-state">No tabs found in this window</div>';
      return;
    }

    // Display window info
    displayWindowInfo(response.windowId, response.tabs.length);

    tabListElement.innerHTML = "";

    response.tabs.forEach((tab, index) => {
      const tabItem = document.createElement("div");
      tabItem.className = "tab-item" + (tab.active ? " active" : "");

      const tabIndex = document.createElement("div");
      tabIndex.className = "tab-index";
      tabIndex.textContent = `${index + 1}.`;

      const tabIcon = document.createElement("img");
      tabIcon.className = "tab-icon";
      tabIcon.src =
        tab.favIconUrl ||
        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="14" font-size="14">📄</text></svg>';
      tabIcon.onerror = () => {
        tabIcon.src =
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="14" font-size="14">📄</text></svg>';
      };

      const tabInfo = document.createElement("div");
      tabInfo.className = "tab-info";

      const tabTitle = document.createElement("div");
      tabTitle.className = "tab-title";
      tabTitle.textContent = tab.title || "Untitled";
      tabTitle.title = tab.title;

      const tabUrl = document.createElement("div");
      tabUrl.className = "tab-url";
      tabUrl.textContent = tab.url;
      tabUrl.title = tab.url;

      tabInfo.appendChild(tabTitle);
      tabInfo.appendChild(tabUrl);

      tabItem.appendChild(tabIndex);
      tabItem.appendChild(tabIcon);
      tabItem.appendChild(tabInfo);

      // Click to switch to tab
      tabItem.addEventListener("click", async () => {
        await chrome.runtime.sendMessage({
          action: "switchToTab",
          tabId: tab.id,
        });
        window.close();
      });

      tabListElement.appendChild(tabItem);
    });
  } catch (error) {
    console.error("Error loading MRU list:", error);
    document.getElementById("tabList").innerHTML =
      '<div class="empty-state">Error loading tabs</div>';
  }
}

// Display window information
function displayWindowInfo(windowId, tabCount) {
  const windowInfoElement = document.getElementById("windowInfo");
  if (windowInfoElement) {
    windowInfoElement.textContent = `Window ${windowId} - ${tabCount} tab${tabCount !== 1 ? "s" : ""}`;
  }
}

// Rebuild MRU list manually
async function rebuildMruList() {
  try {
    const currentWindow = await chrome.windows.getCurrent();
    const response = await chrome.runtime.sendMessage({
      action: "rebuildMruList",
      windowId: currentWindow.id,
    });

    if (response.success) {
      console.log("MRU list rebuilt successfully");
      await loadMruList();
    } else {
      console.error("Failed to rebuild MRU list:", response.error);
    }
  } catch (error) {
    console.error("Error rebuilding MRU list:", error);
  }
}

// Add refresh button listener
const refreshButton = document.getElementById("refreshButton");
if (refreshButton) {
  refreshButton.addEventListener("click", async (e) => {
    e.preventDefault();
    await loadMruList();
  });
}

// Add rebuild button listener (if exists)
const rebuildButton = document.getElementById("rebuildButton");
if (rebuildButton) {
  rebuildButton.addEventListener("click", async (e) => {
    e.preventDefault();
    await rebuildMruList();
  });
}

// Open keyboard shortcuts settings
const settingsLink = document.getElementById("settingsLink");
if (settingsLink) {
  settingsLink.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    window.close();
  });
}

// Load the list when popup opens
loadMruList();
