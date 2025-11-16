// Load and display the MRU tab list
async function loadMruList() {
  try {
    const tabList = await chrome.runtime.sendMessage({ action: 'getMruList' });
    const tabListElement = document.getElementById('tabList');
    
    if (tabList.length === 0) {
      tabListElement.innerHTML = '<div class="empty-state">No tabs found</div>';
      return;
    }
    
    tabListElement.innerHTML = '';
    
    tabList.forEach((tab, index) => {
      const tabItem = document.createElement('div');
      tabItem.className = 'tab-item' + (tab.active ? ' active' : '');
      
      const tabIndex = document.createElement('div');
      tabIndex.className = 'tab-index';
      tabIndex.textContent = `${index + 1}.`;
      
      const tabIcon = document.createElement('img');
      tabIcon.className = 'tab-icon';
      tabIcon.src = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="14" font-size="14">📄</text></svg>';
      tabIcon.onerror = () => {
        tabIcon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="14" font-size="14">📄</text></svg>';
      };
      
      const tabInfo = document.createElement('div');
      tabInfo.className = 'tab-info';
      
      const tabTitle = document.createElement('div');
      tabTitle.className = 'tab-title';
      tabTitle.textContent = tab.title || 'Untitled';
      tabTitle.title = tab.title;
      
      const tabUrl = document.createElement('div');
      tabUrl.className = 'tab-url';
      tabUrl.textContent = tab.url;
      tabUrl.title = tab.url;
      
      tabInfo.appendChild(tabTitle);
      tabInfo.appendChild(tabUrl);
      
      tabItem.appendChild(tabIndex);
      tabItem.appendChild(tabIcon);
      tabItem.appendChild(tabInfo);
      
      // Click to switch to tab
      tabItem.addEventListener('click', async () => {
        await chrome.tabs.update(tab.id, { active: true });
        const tabDetails = await chrome.tabs.get(tab.id);
        await chrome.windows.update(tabDetails.windowId, { focused: true });
        window.close();
      });
      
      tabListElement.appendChild(tabItem);
    });
  } catch (error) {
    console.error('Error loading MRU list:', error);
    document.getElementById('tabList').innerHTML = '<div class="empty-state">Error loading tabs</div>';
  }
}

// Open keyboard shortcuts settings
document.getElementById('settingsLink').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  window.close();
});

// Load the list when popup opens
loadMruList();
