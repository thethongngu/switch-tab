# MRU Tab Switcher

A Chrome extension that helps you switch between most recently used (MRU) tabs using customizable keyboard shortcuts, similar to Alt+Tab for windows.

## Features

- 🔄 **MRU Tab List**: Automatically tracks your most recently used tabs
- 🪟 **Window-Aware**: Each browser window maintains its own independent MRU list
- 💾 **Intelligent Caching**: Automatically caches tab lists for reliability and fast recovery
- 🔄 **Service Worker Persistence**: Automatic state restoration after inactivity - works immediately even after long idle periods
- ⌨️ **Keyboard Shortcuts**: Quick tab switching with customizable hotkeys
- 🎯 **Intuitive Navigation**: Cycle forward and backward through your tab history
- 📋 **Visual Tab List**: Click the extension icon to see all tabs in MRU order
- 🛡️ **Self-Healing**: Automatic validation and recovery when tab lists get out of sync
- 🎨 **Clean UI**: Modern, user-friendly interface with window information display

### Default Keyboard Shortcuts

- **Alt+Q**: Switch to the previous tab in MRU order
- **Alt+W**: Switch to the next tab in MRU order

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked"
5. Select the `switch-tab` folder
6. The extension is now installed!

### Creating Icons

You'll need to create icon files (icon16.png, icon48.png, icon128.png) or use placeholder icons. You can create simple icons or use any icon generator online.

## Usage

### Default Keyboard Shortcuts

- **Alt+Q**: Switch to the previous tab in MRU order
- **Alt+W**: Switch to the next tab in MRU order

### Customizing Shortcuts

1. Click the extension icon and select "⚙️ Configure Keyboard Shortcuts"
2. Or go to `chrome://extensions/shortcuts` directly
3. Find "MRU Tab Switcher" and set your preferred key combinations

### Tab Switcher Overlay

Press **Alt+R** to open a beautiful centered overlay showing all your tabs:

- Navigate with **↑** and **↓** arrow keys
- Press **Enter** to switch to the selected tab
- Press **Esc** to close the overlay
- Click any tab to switch to it instantly
- Press **1-9** to quickly jump to tabs by number
- Supports both light and dark modes

### How It Works

1. The extension tracks every tab you visit
2. Tabs are ordered by recency - the most recently used tab is first
3. Press your shortcut key repeatedly to cycle through tabs
4. After 1 second of inactivity, the selected tab becomes the new "most recent"

### Visual Interface

Click the extension icon to:

- View all tabs in MRU order
- See tab titles, URLs, and favicons
- Click any tab to switch to it directly
- Access keyboard shortcut configuration

## Window-Aware Functionality

The extension now maintains **separate MRU lists for each browser window**:

- Each window has its own independent tab history
- Tab switching operations are isolated per window
- Multi-window workflows are fully supported
- Window information is displayed in the popup

### Intelligent Caching & Recovery

The extension includes robust reliability features:

- **Automatic Caching**: Every MRU list update is saved to session storage
- **Validation**: Continuously checks that the list matches actual open tabs
- **Auto-Recovery**: Automatically fixes issues by recovering from cache or rebuilding
- **Manual Controls**: Refresh and rebuild buttons in the popup for manual intervention

When the number of tabs doesn't match the list, the extension:

1. First tries to recover from the cached list
2. If cache is also invalid, rebuilds the list from scratch
3. Saves the corrected list back to cache

See [WINDOW-AWARE.md](WINDOW-AWARE.md) for detailed technical documentation.

## Service Worker Persistence

The extension uses Manifest V3 service workers, which automatically shut down after ~30 seconds of inactivity to save resources. We've implemented robust solutions to ensure the extension **works immediately** after any period of inactivity:

### Key Features

- **Automatic State Restoration**: When you press a shortcut after inactivity, the extension instantly restores its state from session storage (<50ms)
- **No Multiple Presses Needed**: Works on the first shortcut press, every time
- **Keepalive Mechanism**: During active use, the service worker stays alive to provide instant responses
- **Graceful Fallbacks**: If cache is invalid, automatically rebuilds from current browser state

### What This Means For You

- ✅ Press shortcuts after hours of inactivity - works immediately
- ✅ No need to reload pages or press shortcuts multiple times
- ✅ Seamless experience whether actively switching or returning after a break
- ✅ Zero configuration required - it just works

### Technical Details

For developers interested in the implementation:

- State persisted to `chrome.storage.session` on every change
- Automatic restoration at all entry points (commands, events, messages)
- Keepalive interval maintains service worker during active use (20s)
- Multi-tier recovery: cache → rebuild → initialize from scratch

See [SERVICE-WORKER-GUIDE.md](SERVICE-WORKER-GUIDE.md) for comprehensive technical documentation and [TESTING-INACTIVITY.md](TESTING-INACTIVITY.md) for testing procedures.

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension format)
- **Permissions**: Tabs, Storage, ActiveTab, Host Permissions
- **Background**: Service worker for efficient resource usage
- **Storage**: Session storage for per-window MRU list caching
- **MRU Lists**: Maintains up to 100 most recently used tabs per window
- **Validation**: Automatic integrity checks with recovery mechanisms

## Development

The extension consists of:

- `manifest.json`: Extension configuration
- `background.js`: Window-aware MRU tracking, caching, and recovery logic
- `popup.html/js`: Extension popup interface with window info and controls
- `options.html/js`: Settings page
- `WINDOW-AWARE.md`: Detailed technical documentation

## License

MIT License - Feel free to use and modify!
