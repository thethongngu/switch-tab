# Testing Guide for Window-Aware MRU Tab Switcher

This guide provides comprehensive test cases to verify the window-aware functionality and caching mechanisms.

## Prerequisites

1. Load the extension in Chrome (chrome://extensions/)
2. Enable Developer Mode
3. Open the Chrome DevTools console for the background service worker
4. Have at least 5-10 tabs open for meaningful testing

## Test Categories

### 1. Window-Aware Functionality

#### Test 1.1: Independent Window Lists
**Objective**: Verify each window maintains its own MRU list

**Steps**:
1. Open Window A with 3-4 tabs
2. Switch between tabs using Alt+Q several times
3. Note the order of tabs in Window A's MRU list (click extension icon)
4. Open a new Window B (Ctrl+N or Cmd+N)
5. Open 3-4 different tabs in Window B
6. Switch between tabs in Window B using Alt+Q
7. Open the extension popup in Window B
8. Return to Window A and open the extension popup

**Expected Result**:
- Each window shows different MRU lists
- Window A's order is unchanged after Window B operations
- Both windows display their own window ID in the popup

#### Test 1.2: Cross-Window Isolation
**Objective**: Ensure tab switching doesn't affect other windows

**Steps**:
1. Open two windows with multiple tabs each
2. Focus Window 1
3. Press Alt+Q multiple times to cycle through tabs
4. Switch to Window 2 (don't click inside, just focus the window)
5. Check which tab is active in Window 2

**Expected Result**:
- Window 2's active tab remains unchanged
- Alt+Q only affects the focused window

### 2. Caching and Recovery

#### Test 2.1: Cache Persistence
**Objective**: Verify cache saves and loads correctly

**Steps**:
1. Open a window with 5 tabs
2. Switch between tabs to establish an MRU order
3. Open DevTools console for background service worker
4. Look for "Saved cache for window X" messages
5. Note the current MRU order from the popup
6. Reload the extension (chrome://extensions/ → reload button)
7. Wait for initialization messages in console
8. Open the popup again

**Expected Result**:
- Console shows "Saved cache for window X" after each tab switch
- Console shows "Loaded MRU list from cache for window X" after reload
- MRU order is preserved after extension reload

#### Test 2.2: Recovery from Cache
**Objective**: Test automatic recovery when list is out of sync

**Steps**:
1. Open DevTools console for background service worker
2. Open a window with 3 tabs
3. In the console, manually corrupt the MRU list:
   ```javascript
   // Find the windowId first
   Object.keys(mruTabLists)
   // Then corrupt it
   mruTabLists[WINDOW_ID] = [99999, 88888, 77777]
   ```
4. Try to switch tabs using Alt+Q
5. Watch the console for recovery messages

**Expected Result**:
- Console shows "MRU list validation failed"
- Console shows "Recovered from cache" or "Rebuilding MRU list"
- Tab switching continues to work after recovery

#### Test 2.3: Full Rebuild
**Objective**: Test rebuild when both current list and cache are invalid

**Steps**:
1. Open a window with 4 tabs (A, B, C, D)
2. Switch to make a specific order (e.g., B → C → A → D)
3. Open extension popup, note the order
4. Click "Rebuild List" button
5. Check the new order

**Expected Result**:
- List is rebuilt with current active tab first
- Console shows "Manually rebuilding MRU list for window X"
- Other tabs appear in their original order after the active tab

### 3. Tab and Window Events

#### Test 3.1: New Tab Creation
**Objective**: Verify new tabs are added to the MRU list

**Steps**:
1. Open a window with 3 tabs
2. Note the MRU list order
3. Create a new tab (Ctrl+T / Cmd+T)
4. Open the extension popup

**Expected Result**:
- New tab appears in the MRU list
- New tab is at the front (position 1) if you switched to it
- Console shows "Added new tab X to MRU list for window Y"

#### Test 3.2: Tab Closure
**Objective**: Verify closed tabs are removed from MRU list

**Steps**:
1. Open a window with 5 tabs
2. Note tab IDs from the popup
3. Close the middle tab
4. Open the popup again

**Expected Result**:
- Closed tab is removed from the list
- List count matches actual tab count
- Console shows "Removed tab X from MRU list for window Y"

#### Test 3.3: Window Creation
**Objective**: Verify new windows get initialized properly

**Steps**:
1. Open DevTools console
2. Create a new window (Ctrl+N / Cmd+N)
3. Watch console messages
4. Open extension popup in the new window

**Expected Result**:
- Console shows "Window created: X"
- Console shows "Initialized MRU list for window X"
- Popup displays correct window ID and tab count

#### Test 3.4: Window Closure
**Objective**: Verify cleanup when windows are closed

**Steps**:
1. Open two windows
2. Note both window IDs from popups
3. Open DevTools console
4. Close one window
5. Watch console messages

**Expected Result**:
- Console shows "Window removed: X"
- Console shows "Cleared cache for window X"
- No memory leaks or orphaned data structures

### 4. Edge Cases

#### Test 4.1: Empty Window
**Objective**: Handle windows with only one tab

**Steps**:
1. Open a new window (only has "New Tab")
2. Try Alt+Q
3. Open popup

**Expected Result**:
- No errors occur
- Popup shows one tab
- Console shows "Not enough tabs to switch in window X"

#### Test 4.2: Rapid Tab Switching
**Objective**: Handle rapid keyboard input

**Steps**:
1. Open a window with 10 tabs
2. Rapidly press Alt+Q 20+ times
3. Stop and wait 1 second
4. Check which tab is active

**Expected Result**:
- Extension handles all keystrokes smoothly
- Final tab selection is correct
- No errors in console

#### Test 4.3: Tab Closed During Navigation
**Objective**: Handle tab closure while cycling through MRU list

**Steps**:
1. Open a window with 5 tabs
2. Press Alt+Q to start cycling
3. While in navigation mode, quickly close the target tab
4. Continue pressing Alt+Q

**Expected Result**:
- Extension removes the closed tab from list
- Continues to next valid tab
- No errors or crashes

#### Test 4.4: List Count Mismatch
**Objective**: Verify recovery when counts don't match

**Steps**:
1. Open a window with 3 tabs
2. In DevTools console, add a fake tab to the list:
   ```javascript
   mruTabLists[WINDOW_ID].push(99999)
   ```
3. Try to switch tabs or activate a tab
4. Watch for validation and recovery

**Expected Result**:
- Validation fails (count mismatch)
- Extension recovers automatically
- List is corrected to match actual tabs

### 5. UI Testing

#### Test 5.1: Popup Display
**Objective**: Verify popup shows correct information

**Steps**:
1. Open a window with 5 tabs
2. Click extension icon to open popup

**Expected Result**:
- Window info shows correct window ID and "5 tabs"
- All 5 tabs are listed with icons, titles, URLs
- Active tab is highlighted
- Tabs are in MRU order (most recent first)

#### Test 5.2: Refresh Button
**Objective**: Verify refresh button works

**Steps**:
1. Open popup
2. In another browser window, rearrange tabs
3. Click "🔄 Refresh" button in popup

**Expected Result**:
- List updates to show current state
- Window info updates if tab count changed
- No errors occur

#### Test 5.3: Rebuild Button
**Objective**: Verify manual rebuild works

**Steps**:
1. Open popup
2. Click "🔧 Rebuild List" button
3. Check console for messages
4. Verify the list updates

**Expected Result**:
- Console shows "Manually rebuilding MRU list"
- List is rebuilt with active tab first
- Popup refreshes with new order

### 6. Performance Testing

#### Test 6.1: Many Tabs
**Objective**: Verify performance with many tabs

**Steps**:
1. Open 50+ tabs in one window
2. Switch between tabs using Alt+Q
3. Monitor console for performance issues
4. Open popup to view list

**Expected Result**:
- Tab switching remains responsive
- Popup loads quickly (< 1 second)
- No lag or freezing
- List is limited to 100 tabs max

#### Test 6.2: Many Windows
**Objective**: Verify performance with multiple windows

**Steps**:
1. Open 5+ windows with 10 tabs each
2. Switch between windows and tabs
3. Check memory usage in Chrome Task Manager

**Expected Result**:
- Each window operates independently
- No significant memory leaks
- All operations remain smooth

### 7. Console Logging

**What to Look For**:

Good log messages:
- "Initialized MRU list for window X: [...]"
- "Saved cache for window X"
- "Loaded MRU list from cache for window X"
- "Updated MRU list for window X: [...]"

Recovery log messages:
- "MRU list validation failed for window X, attempting recovery"
- "Recovered from cache for window X"
- "Rebuilding MRU list for window X"

Error handling:
- "Tab X no longer exists in window Y"
- "Validation failed: [reason]"

## Automated Testing Checklist

- [ ] Each window maintains independent MRU lists
- [ ] Cache saves on every list update
- [ ] Cache loads correctly on extension reload
- [ ] Validation detects list corruption
- [ ] Recovery from cache works
- [ ] Rebuild from scratch works
- [ ] New tabs are added to the list
- [ ] Closed tabs are removed from the list
- [ ] New windows are initialized properly
- [ ] Closed windows are cleaned up
- [ ] Popup displays correct window info
- [ ] Refresh button updates the list
- [ ] Rebuild button reconstructs the list
- [ ] Tab switching works in navigation mode
- [ ] Rapid tab switching is handled smoothly
- [ ] Edge cases don't cause crashes

## Known Limitations

1. Session storage is cleared when browser closes (by design)
2. Maximum 100 tabs tracked per window
3. Extension must be installed to work (no guest mode)

## Reporting Issues

When reporting bugs, include:

1. Chrome version
2. Extension version
3. Number of windows and tabs
4. Steps to reproduce
5. Console log output
6. Expected vs actual behavior
