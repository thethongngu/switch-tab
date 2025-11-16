# MRU Tab Switcher

A Chrome extension that helps you switch between most recently used (MRU) tabs using customizable keyboard shortcuts, similar to Alt+Tab for windows.

## Features

- 🔄 **MRU Tab List**: Automatically tracks your most recently used tabs
- ⌨️ **Keyboard Shortcuts**: Quick tab switching with customizable hotkeys
- 🎯 **Intuitive Navigation**: Cycle forward and backward through your tab history
- 📋 **Visual Tab List**: Click the extension icon to see all tabs in MRU order
- 🪟 **Overlay Tab Switcher**: Beautiful centered overlay to view and select tabs (Alt+R)
- 🎨 **Clean UI**: Modern, user-friendly interface with dark mode support
  </text>

<old_text line=28>

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

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension format)
- **Permissions**: Tabs, Storage, ActiveTab, Host Permissions
- **Background**: Service worker for efficient resource usage
- **Content Scripts**: Injected overlay UI for visual tab switching
- **MRU List**: Maintains up to 100 most recently used tabs

## Development

The extension consists of:

- `manifest.json`: Extension configuration
- `background.js`: Core MRU tracking and tab switching logic
- `popup.html/js`: Extension popup interface
- `options.html/js`: Settings page
- `content.js`: Overlay UI logic and keyboard navigation
- `overlay.css`: Beautiful styling for the tab switcher overlay

## License

MIT License - Feel free to use and modify!
