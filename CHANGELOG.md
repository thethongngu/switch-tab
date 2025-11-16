# Changelog

All notable changes to the MRU Tab Switcher extension will be documented in this file.

## [1.2.0] - 2024-12-XX

### Added

- **🪟 Window-Aware MRU Lists** - Each browser window now maintains its own independent MRU tab list
  - Tab switching operations are isolated per window
  - Multi-window workflows fully supported
  - No interference between windows when switching tabs
- **💾 Intelligent Caching System** - Robust caching for reliability and fast recovery
  - Automatic caching of MRU lists to session storage on every update
  - Fast initialization from cache when extension starts
  - Per-window cache keys for complete isolation
- **🛡️ Validation & Auto-Recovery** - Self-healing mechanisms to maintain data integrity
  - Continuous validation that MRU list matches actual open tabs
  - Automatic detection when list gets out of sync
  - Three-tier recovery: current list → cached list → rebuild from scratch
  - Validates tab count, existence, and completeness
- **🎛️ Manual Controls** - New UI controls in popup
  - **Refresh Button** - Manually reload the current MRU list
  - **Rebuild Button** - Force complete rebuild of the list from scratch
  - Window information display showing window ID and tab count
- **📊 Enhanced Event Handling**
  - Tracks tab creation and adds to window's MRU list
  - Handles window creation and initializes new lists
  - Cleans up data and cache when windows are closed
  - Improved tab removal handling with cache updates

### Changed

- Refactored `background.js` to support window-aware architecture
  - Changed from single `mruTabList` to `mruTabLists` object (per-window)
  - All navigation state now tracked per window
  - Updated all functions to accept and use `windowId` parameter
- Updated `popup.js` to request and display window-specific data
  - Shows current window ID and tab count
  - Added refresh and rebuild functionality
  - Better error handling with window context
- Enhanced `popup.html` with new UI elements
  - Window info display area
  - Action buttons for refresh and rebuild
  - Improved layout and styling

### Technical Details

- **Data Structure**: Separate MRU arrays per window ID
- **Cache Storage**: Uses `chrome.storage.session` with keys `mru_cache_{windowId}`
- **Validation Logic**: Three-way validation (count, existence, completeness)
- **Recovery Strategy**: Cached fallback with automatic rebuild
- **Event Listeners**: Window-aware handlers for all tab/window events
- **Performance**: Minimal overhead with async cache operations
- **Memory Management**: Automatic cleanup on window close

### Documentation

- Added comprehensive `WINDOW-AWARE.md` technical documentation
  - Detailed explanation of window-aware architecture
  - Caching and recovery mechanisms
  - API documentation and examples
  - Debugging guide and best practices
- Updated `README.md` with new features overview

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
