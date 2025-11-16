// Open keyboard shortcuts configuration
document.getElementById('configureShortcuts').addEventListener('click', () => {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});
