# Changelog

All notable changes to the MRU Tab Switcher extension will be documented in this file.

## [1.1.0] - 2024-11-16

### Added

- **🎯 Tab Switcher Overlay** - New centered overlay window showing all MRU tabs
  - Press **Alt+R** (Option+R on Mac) to open the overlay
  - Beautiful, modern UI with smooth animations
  - Shows tab icons, titles, and URLs in a clean list
  - Dark mode support that respects system preferences
  
- **Keyboard Navigation in Overlay**
  - **↑/↓ Arrow Keys** - Navigate through the tab list
  - **Enter** - Switch to the selected tab
  - **Esc** - Close the overlay
  - **Home/End** - Jump to first/last tab
  - **1-9 Number Keys** - Quick jump to tabs by position
  
- **Visual Indicators**
  - Blue highlight for currently selected tab
  - Green "ACTIVE" badge for your current tab
  - Yellow background for active tab
  - Smooth scrolling to keep selected item in view
  
- **Mouse Support**
  - Click any tab in the overlay to switch to it
  - Click outside overlay to close it
  - Hover effects for better visual feedback

- **Content Script Integration**
  - New `content.js` for overlay functionality
  - New `overlay.css` with comprehensive styling
  - Injected into all pages for instant access

### Changed

- Updated `manifest.json` to version 1.1.0
- Added new permissions: `activeTab` and `host_permissions` for overlay
- Added new command `open-tab-switcher` with Alt+R shortcut
- Updated `background.js` with overlay message handlers
- Updated `popup.html` to display the new Alt+R shortcut
- Enhanced `README.md` with overlay documentation

### Technical Details

- Content scripts now run on all URLs to enable overlay
- Message passing between background and content scripts
- Efficient event handling with proper cleanup
- CSS animations for smooth user experience
- Responsive design that adapts to screen size

## [1.0.0] - 2024-11-16

### Initial Release

- **MRU Tab Tracking** - Automatic tracking of most recently used tabs
- **Keyboard Shortcuts**
  - Alt+Q - Switch to previous tab in MRU order
  - Alt+W - Switch to next tab in MRU order
  - Ctrl+Tab - Switch to last used tab
- **Extension Popup** - Visual list of all tabs in MRU order
- **Click to Switch** - Click any tab in popup to switch to it
- **Service Worker** - Efficient background processing
- **Customizable Shortcuts** - Configure via chrome://extensions/shortcuts
- **Tab Management**
  - Tracks up to 100 most recently used tabs
  - Automatically removes closed tabs from list
  - Smart navigation mode with 1-second timeout
- **Modern UI** - Clean, user-friendly interface with favicons
