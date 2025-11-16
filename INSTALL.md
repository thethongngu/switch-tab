# Installation Guide - MRU Tab Switcher

## Quick Installation

### Step 1: Load the Extension

1. Open Google Chrome (or any Chromium-based browser like Edge, Brave, etc.)
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** by toggling the switch in the top-right corner
4. Click **"Load unpacked"** button
5. Select the `switch-tab` folder from your file system
6. The extension should now appear in your extensions list!

### Step 2: Pin the Extension (Optional)

1. Click the puzzle piece icon 🧩 in Chrome's toolbar
2. Find "MRU Tab Switcher" in the list
3. Click the pin icon 📌 to keep it visible in your toolbar

### Step 3: Test the Shortcuts

Try the keyboard shortcuts to make sure everything works:

- **Alt+Q** - Switch to previous tab in MRU order
- **Alt+W** - Switch to next tab in MRU order  
- **Alt+R** - Open the tab switcher overlay (NEW!)

## Using the Tab Switcher Overlay

The **Alt+R** shortcut opens a beautiful centered overlay that shows all your tabs:

### Keyboard Navigation

- **↑ / ↓** - Navigate up and down through the tab list
- **Enter** - Switch to the selected tab
- **Esc** - Close the overlay without switching
- **Home** - Jump to the first tab
- **End** - Jump to the last tab
- **1-9** - Instantly switch to tabs 1-9 in the list

### Mouse Navigation

- Click any tab in the list to switch to it
- Click outside the overlay to close it

### Visual Indicators

- **Blue highlight** - Currently selected tab
- **Green "ACTIVE" badge** - Your current tab
- **Yellow background** - Active tab indicator

## Customizing Keyboard Shortcuts

### Change Default Shortcuts

1. Click the extension icon in your toolbar
2. Click **"⚙️ Configure Keyboard Shortcuts"** at the bottom
3. Or directly navigate to `chrome://extensions/shortcuts`
4. Find "MRU Tab Switcher" in the list
5. Click the edit icon ✏️ next to each shortcut
6. Press your desired key combination
7. Click outside to save

### Recommended Shortcuts

If the defaults don't work for you, here are some alternatives:

- **Ctrl+Shift+Q/W** - Similar to default but with Ctrl
- **Cmd+Shift+Q/W** - For Mac users who prefer Cmd
- **Alt+1/2** - Shorter key combinations
- **Ctrl+`** (backtick) - For the overlay switcher

### Mac Users

On macOS:
- **Option** key = Alt key
- **Alt+Q** works the same as **Option+Q**
- You can also use **Cmd** (⌘) combinations

## Troubleshooting

### Extension Not Loading

- Make sure Developer mode is enabled
- Check that you selected the correct folder containing `manifest.json`
- Try reloading the extension from `chrome://extensions/`

### Shortcuts Not Working

1. **Check for conflicts**: Go to `chrome://extensions/shortcuts` and look for red warnings about conflicting shortcuts
2. **Some pages block extensions**: Chrome's internal pages (chrome://, chrome-extension://) and the Chrome Web Store don't allow extension shortcuts
3. **Try a different shortcut**: If Alt+Q/W/R don't work, customize them to something else

### Overlay Not Appearing

- Make sure you're on a regular webpage (not chrome:// pages)
- The overlay requires content script permissions
- Try reloading the page and pressing Alt+R again
- Check the browser console (F12) for any error messages

### Tabs Not Tracking Correctly

- The extension starts tracking tabs after installation
- Close and reopen tabs to rebuild the MRU list
- The list resets when Chrome restarts (by design)

## Features Overview

### Quick Switching (Alt+Q/W)

Perfect for quickly toggling between 2-3 tabs:
- Press repeatedly to cycle through your recently used tabs
- After 1 second of no activity, the selected tab becomes the new "current" tab
- Great for comparing two pages side-by-side

### Visual Overlay (Alt+R)

Best when you have many tabs open:
- See all your tabs at once with titles and URLs
- Visually identify the tab you want
- Keyboard or mouse navigation
- Beautiful, modern interface

### Extension Popup

Click the extension icon to:
- View the full MRU list
- See all your tabs in order
- Click to switch to any tab
- Access settings

## Privacy & Permissions

This extension requires:

- **tabs**: To read tab information and switch between tabs
- **storage**: To remember your preferences (future feature)
- **activeTab**: To inject the overlay UI into the current page
- **host_permissions** (`<all_urls>`): To show the overlay on all websites

**Privacy Note**: All data stays local on your computer. Nothing is sent to any server.

## Updating

To update the extension:

1. Pull the latest code from the repository
2. Go to `chrome://extensions/`
3. Click the refresh icon 🔄 on the MRU Tab Switcher card
4. The extension will reload with the new changes

## Uninstalling

To remove the extension:

1. Go to `chrome://extensions/`
2. Find "MRU Tab Switcher"
3. Click **"Remove"**
4. Confirm the removal

All data will be deleted automatically.

## Getting Help

If you encounter issues:

1. Check this installation guide first
2. Look for error messages in the browser console (F12)
3. Try reloading the extension
4. Try restarting Chrome
5. Report issues on the project's issue tracker

## Tips for Best Experience

1. **Keep your tab count reasonable** - The extension works best with 20-50 tabs
2. **Use different shortcuts for different workflows** - Quick switch for toggling, overlay for finding
3. **Pin frequently used tabs** - This keeps them at the end of the MRU list
4. **Keyboard shortcuts** - Much faster than using the mouse!

Enjoy your improved tab switching experience! 🚀
