// MRU Tab Switcher Overlay Content Script

let overlayElement = null;
let selectedIndex = 0;
let tabList = [];

// Initialize the overlay
function initOverlay() {
  if (overlayElement) {
    return;
  }

  // Create overlay container
  overlayElement = document.createElement('div');
  overlayElement.id = 'mru-tab-switcher-overlay';

  // Create window
  const windowElement = document.createElement('div');
  windowElement.id = 'mru-tab-switcher-window';

  // Create header
  const header = document.createElement('div');
  header.id = 'mru-tab-switcher-header';

  const title = document.createElement('h2');
  title.id = 'mru-tab-switcher-title';
  title.textContent = '🔄 Switch Tabs';

  const subtitle = document.createElement('p');
  subtitle.id = 'mru-tab-switcher-subtitle';
  subtitle.textContent = 'Most Recently Used Tabs';

  header.appendChild(title);
  header.appendChild(subtitle);

  // Create tab list container
  const listContainer = document.createElement('div');
  listContainer.id = 'mru-tab-switcher-list';

  // Create footer
  const footer = document.createElement('div');
  footer.id = 'mru-tab-switcher-footer';
  footer.innerHTML = `
    <span class="mru-shortcut-key">↑</span><span class="mru-shortcut-key">↓</span> Navigate •
    <span class="mru-shortcut-key">Enter</span> Select •
    <span class="mru-shortcut-key">Esc</span> Close
  `;

  // Assemble the window
  windowElement.appendChild(header);
  windowElement.appendChild(listContainer);
  windowElement.appendChild(footer);
  overlayElement.appendChild(windowElement);

  // Append to body
  document.body.appendChild(overlayElement);

  // Add event listeners
  overlayElement.addEventListener('click', (e) => {
    if (e.target === overlayElement) {
      closeOverlay();
    }
  });

  windowElement.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

// Show the overlay
async function showOverlay() {
  initOverlay();

  // Request tab list from background
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getMruList' });
    tabList = response || [];
    selectedIndex = 0;
    renderTabList();

    // Show overlay
    overlayElement.classList.add('visible');

    // Focus on the overlay to capture keyboard events
    document.addEventListener('keydown', handleKeydown);
  } catch (error) {
    console.error('Error loading tab list:', error);
  }
}

// Close the overlay
function closeOverlay() {
  if (!overlayElement) {
    return;
  }

  overlayElement.classList.remove('visible');
  overlayElement.classList.add('hiding');

  document.removeEventListener('keydown', handleKeydown);

  setTimeout(() => {
    overlayElement.classList.remove('hiding');
  }, 150);
}

// Render the tab list
function renderTabList() {
  const listContainer = document.getElementById('mru-tab-switcher-list');

  if (!listContainer) {
    return;
  }

  if (tabList.length === 0) {
    listContainer.innerHTML = '<div id="mru-tab-switcher-empty">No tabs found</div>';
    return;
  }

  listContainer.innerHTML = '';

  tabList.forEach((tab, index) => {
    const tabItem = document.createElement('div');
    tabItem.className = 'mru-tab-item';

    if (index === selectedIndex) {
      tabItem.classList.add('selected');
    }

    if (tab.active) {
      tabItem.classList.add('active-tab');
    }

    // Tab index
    const tabIndex = document.createElement('div');
    tabIndex.className = 'mru-tab-index';
    tabIndex.textContent = `${index + 1}`;

    // Tab icon
    const tabIcon = document.createElement('img');
    tabIcon.className = 'mru-tab-icon';
    tabIcon.src = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="14" font-size="14">📄</text></svg>';
    tabIcon.onerror = () => {
      tabIcon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="14" font-size="14">📄</text></svg>';
    };

    // Tab info container
    const tabInfo = document.createElement('div');
    tabInfo.className = 'mru-tab-info';

    const tabTitle = document.createElement('div');
    tabTitle.className = 'mru-tab-title';
    tabTitle.textContent = tab.title || 'Untitled';
    tabTitle.title = tab.title;

    const tabUrl = document.createElement('div');
    tabUrl.className = 'mru-tab-url';
    tabUrl.textContent = tab.url;
    tabUrl.title = tab.url;

    tabInfo.appendChild(tabTitle);
    tabInfo.appendChild(tabUrl);

    // Assemble tab item
    tabItem.appendChild(tabIndex);
    tabItem.appendChild(tabIcon);
    tabItem.appendChild(tabInfo);

    // Add active indicator if this is the current tab
    if (tab.active) {
      const indicator = document.createElement('span');
      indicator.className = 'mru-tab-indicator';
      indicator.textContent = 'ACTIVE';
      tabItem.appendChild(indicator);
    }

    // Click handler
    tabItem.addEventListener('click', () => {
      switchToTab(tab.id);
    });

    listContainer.appendChild(tabItem);
  });

  // Scroll selected item into view
  scrollToSelected();
}

// Handle keyboard navigation
function handleKeydown(e) {
  if (!overlayElement || !overlayElement.classList.contains('visible')) {
    return;
  }

  switch (e.key) {
    case 'Escape':
      e.preventDefault();
      closeOverlay();
      break;

    case 'ArrowDown':
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % tabList.length;
      renderTabList();
      break;

    case 'ArrowUp':
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + tabList.length) % tabList.length;
      renderTabList();
      break;

    case 'Enter':
      e.preventDefault();
      if (tabList[selectedIndex]) {
        switchToTab(tabList[selectedIndex].id);
      }
      break;

    case 'Home':
      e.preventDefault();
      selectedIndex = 0;
      renderTabList();
      break;

    case 'End':
      e.preventDefault();
      selectedIndex = tabList.length - 1;
      renderTabList();
      break;

    default:
      // Handle number keys 1-9
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (index < tabList.length) {
          e.preventDefault();
          switchToTab(tabList[index].id);
        }
      }
      break;
  }
}

// Scroll selected item into view
function scrollToSelected() {
  const listContainer = document.getElementById('mru-tab-switcher-list');
  const selectedItem = listContainer?.querySelector('.mru-tab-item.selected');

  if (selectedItem) {
    selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// Switch to a tab
async function switchToTab(tabId) {
  try {
    await chrome.runtime.sendMessage({
      action: 'switchToTab',
      tabId: tabId
    });
    closeOverlay();
  } catch (error) {
    console.error('Error switching to tab:', error);
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showTabSwitcher') {
    showOverlay();
    sendResponse({ success: true });
  } else if (request.action === 'hideTabSwitcher') {
    closeOverlay();
    sendResponse({ success: true });
  }
  return true;
});

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOverlay);
} else {
  initOverlay();
}
