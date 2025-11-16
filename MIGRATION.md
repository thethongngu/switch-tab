# Migration Guide - Upgrading to v1.2.0

This guide helps users upgrade from earlier versions of MRU Tab Switcher to version 1.2.0, which introduces window-aware functionality and intelligent caching.

## What's New in v1.2.0

Version 1.2.0 is a major update that fundamentally changes how the extension tracks your tabs:

- **Window-Aware**: Each browser window now has its own independent MRU tab list
- **Intelligent Caching**: Your tab lists are automatically cached for reliability
- **Auto-Recovery**: The extension can detect and fix issues automatically
- **Enhanced UI**: New controls and window information in the popup

## Breaking Changes

### ⚠️ Important: Understanding the Change

**Before v1.2.0**: There was one global MRU list shared across all windows.

**After v1.2.0**: Each window has its own separate MRU list.

### What This Means for You

#### If You Use One Window
**Impact**: ✅ **None** - Everything works exactly as before.

Your workflow remains unchanged. The extension will feel identical.

#### If You Use Multiple Windows
**Impact**: ⚠️ **Behavior Change** - Tab switching is now per-window.

**Old Behavior**: Pressing `Alt+Q` could switch to a tab in *any* window.

**New Behavior**: Pressing `Alt+Q` only switches between tabs in the *current* window.

**Why This Change?**
- More predictable behavior (you know which window will be affected)
- Better multi-window workflow support
- Aligns with how most users expect tab switching to work
- Similar to how Alt+Tab switches windows, not all applications globally

## Upgrading from v1.0.0 or v1.1.0

### Step 1: Install the Update

1. Go to `chrome://extensions/`
2. Find "MRU Tab Switcher"
3. Click "Update" or reload the extension
4. Verify the version shows "1.2.0"

### Step 2: First Launch

When you first load v1.2.0:

1. The extension will initialize MRU lists for each open window
2. Your currently active tab in each window becomes the "most recent"
3. Other tabs are added in their natural order

**Note**: Your previous global MRU history is **not** preserved. Each window starts fresh.

### Step 3: Verify It's Working

1. Open the extension popup (click the icon)
2. You should see: "Window {id} - {n} tabs" at the top
3. The tab list shows only tabs from the current window
4. Switch windows and open the popup again - you'll see different tabs

## New Features You Can Use

### 1. Window Information

The popup now shows which window you're viewing:

```
Window 12345 - 5 tabs
```

This helps when working with multiple windows.

### 2. Refresh Button

If the tab list looks wrong, click **🔄 Refresh** to reload it.

### 3. Rebuild Button

If tabs are missing or the order seems off, click **🔧 Rebuild List** to reconstruct it from scratch.

### 4. Automatic Recovery

If something goes wrong (e.g., extension restart, corrupted data), the extension will:

1. Try to load from cache
2. If cache is bad, rebuild automatically
3. Continue working without interruption

You'll see recovery messages in the console if you have DevTools open.

## Adjusting Your Workflow

### For Single-Window Users

**No Changes Needed** ✅

Your keyboard shortcuts work exactly as before.

### For Multi-Window Users

#### Before: Global Tab Switching

You might have used `Alt+Q` to switch between tabs across all windows.

#### After: Per-Window Tab Switching

Now you need to:

1. **Focus the window** you want to work in (click on it or use Alt+Tab)
2. **Then use** `Alt+Q` to switch tabs within that window

#### Tips for Multi-Window Workflows

1. **Use Alt+Tab** to switch between windows
2. **Use Alt+Q/W** to switch between tabs *within* the current window
3. **Click tabs** in the popup if you need quick access to a specific tab

This two-level approach (window → tab) is more predictable and aligns with standard OS behavior.

## Troubleshooting

### Issue: "I can't switch to tabs in other windows anymore"

**This is expected behavior.** Tab switching is now per-window.

**Solution**: Switch to the target window first (Alt+Tab or click), then use tab switching commands.

### Issue: "My tab order looks wrong"

**Cause**: First launch builds lists from current state, not previous history.

**Solution**:
1. Click the **🔧 Rebuild List** button in the popup, or
2. Just use your tabs normally - the list will rebuild in MRU order as you work

### Issue: "Tabs are missing from the list"

**Possible Causes**:
- Tabs might be in a different window (check the window ID)
- Extension might need to rebuild

**Solution**:
1. Verify you're looking at the right window's popup
2. Click **🔄 Refresh** to reload the list
3. If still missing, click **🔧 Rebuild List**

### Issue: "Extension seems slow"

**Cause**: Rare initialization issue or cache corruption.

**Solution**:
1. Open `chrome://extensions/`
2. Remove and reinstall the extension
3. Or just reload it (circular arrow icon)

## Data and Privacy

### What's Stored

- **Session Storage**: MRU lists cached per window (cleared when browser closes)
- **No Persistent Data**: Tab history is not saved between browser sessions

### What's Lost When Upgrading

- Your previous global MRU list is **not** carried over
- Each window starts with a fresh list based on current tabs

This is intentional - the old global list doesn't translate well to the new per-window model.

## Reverting to an Older Version

If you need to revert (not recommended):

1. Download the old version files from the repository
2. Go to `chrome://extensions/`
3. Remove the current extension
4. Enable "Developer mode"
5. Click "Load unpacked" and select the old version folder

**Note**: Reverting loses the new features and reliability improvements.

## Getting Help

### Check the Console

Open DevTools for the extension background service worker:

1. Go to `chrome://extensions/`
2. Find "MRU Tab Switcher"
3. Click "service worker" or "background page"
4. Look for error messages or validation failures

### Report Issues

If you find bugs or have questions:

1. Check the console logs (as above)
2. Note your Chrome version and number of windows/tabs
3. Report on GitHub or wherever the extension is hosted
4. Include steps to reproduce the issue

## Frequently Asked Questions

### Q: Why can't I switch to tabs in other windows anymore?

**A**: This is by design. Per-window switching is more predictable and aligns with user expectations. Use Alt+Tab to switch windows first.

### Q: Will my tab history be preserved?

**A**: No, the old global history doesn't carry over. Each window starts fresh. Just use your tabs normally and the list rebuilds in MRU order.

### Q: Can I get the old global behavior back?

**A**: Not in v1.2.0. The architecture changed fundamentally. If this is a dealbreaker, you can revert to v1.1.0, but you'll lose reliability features.

### Q: What happens if I close and reopen the browser?

**A**: MRU lists are stored in session storage, so they're cleared when the browser closes. When you reopen, each window starts fresh.

### Q: Does this work with Chrome profiles?

**A**: Yes! Each Chrome profile runs its own instance of the extension with separate window tracking.

### Q: What about incognito windows?

**A**: Incognito windows are treated as separate windows with their own MRU lists (if the extension is enabled in incognito mode).

## Summary

**Version 1.2.0** brings significant architectural improvements:

✅ More reliable tab tracking
✅ Better multi-window support  
✅ Automatic recovery from errors
✅ Enhanced UI with controls

The main change is per-window behavior, which may require a small workflow adjustment for multi-window users but provides a more predictable and robust experience overall.

Welcome to the new version! 🎉
