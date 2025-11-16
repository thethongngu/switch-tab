# Window-Aware MRU Tab Switching

This document explains the window-aware functionality and caching mechanisms implemented in the MRU Tab Switcher extension.

## Overview

The extension now maintains **separate MRU (Most Recently Used) lists for each browser window**, ensuring that tab switching operations are isolated per window and more reliable through intelligent caching and recovery mechanisms.

## Key Features

### 1. Window-Aware Tab Lists

Each browser window maintains its own independent MRU tab list:

- **Isolated Navigation**: Switching tabs with `Alt+Q` or `Alt+W` only affects tabs within the current window
- **Window Context**: Each window's tab history is tracked separately
- **Multi-Window Support**: Work with multiple browser windows simultaneously without interference

### 2. Intelligent Caching

The extension caches the MRU list for each window using Chrome's session storage:

- **Automatic Saving**: Every time the MRU list is updated, it's automatically saved to the cache
- **Fast Recovery**: When the extension starts or a window is reopened, the cached list is loaded
- **Session Persistence**: Cache persists throughout the browser session (until browser is closed)

#### Cache Storage Location

```javascript
// Cache key format
chrome.storage.session: "mru_cache_{windowId}" → [tabId1, tabId2, ...]
```

### 3. List Validation & Recovery

The extension includes robust validation to ensure data integrity:

#### Validation Checks

1. **Count Validation**: Ensures the number of items in the MRU list matches the actual number of open tabs
2. **Tab Existence**: Verifies all tab IDs in the list correspond to actual tabs
3. **Completeness**: Confirms all open tabs are present in the MRU list

#### Recovery Process

When validation fails, the extension attempts recovery in this order:

```
1. Check current MRU list → Invalid?
2. Try loading from cache → Valid?
   ✓ Yes: Use cached list
   ✗ No: Rebuild from scratch
3. Rebuild: Query current tabs and construct new list
4. Save new list to cache
```

### 4. Automatic List Maintenance

The extension automatically handles various tab and window events:

- **Tab Activation**: Updates MRU order when switching tabs
- **Tab Creation**: Adds new tabs to the list
- **Tab Removal**: Removes closed tabs from the list
- **Window Creation**: Initializes MRU list for new windows
- **Window Removal**: Cleans up cache for closed windows

## User Interface

### Popup Window

The popup now displays:

- **Window Information**: Shows the current window ID and tab count
- **Refresh Button**: Manually reload the MRU list
- **Rebuild Button**: Force rebuild the MRU list from scratch
- **Tab List**: Visual representation of tabs in MRU order

## Technical Details

### Data Structures

```javascript
// Main data structures
mruTabLists = {
  windowId1: [tabId1, tabId2, tabId3, ...],
  windowId2: [tabId4, tabId5, tabId6, ...],
  ...
}

isNavigating = { windowId: boolean }
currentMruIndex = { windowId: number }
navigationTimer = { windowId: timer }
```

### Key Functions

#### `initializeMruListForWindow(windowId, tabs?)`
Initializes the MRU list for a specific window:
1. Attempts to load from cache
2. Validates cached data against actual tabs
3. Rebuilds if validation fails
4. Saves the final list to cache

#### `validateMruList(mruList, currentTabIds)`
Validates an MRU list:
- Checks length matches
- Verifies all tab IDs exist
- Ensures no tabs are missing

#### `updateMruList(windowId, tabId)`
Updates the MRU list when a tab is activated:
1. Validates current list integrity
2. Attempts cache recovery if validation fails
3. Moves activated tab to front of list
4. Saves updated list to cache

#### `saveCacheForWindow(windowId, mruList)`
Saves the MRU list to session storage:
```javascript
await chrome.storage.session.set({ 
  [`mru_cache_${windowId}`]: mruList 
});
```

#### `loadCacheForWindow(windowId)`
Loads the MRU list from session storage:
```javascript
const result = await chrome.storage.session.get(`mru_cache_${windowId}`);
return result[`mru_cache_${windowId}`] || null;
```

### Event Handlers

| Event | Action |
|-------|--------|
| `chrome.tabs.onActivated` | Update MRU list for the window |
| `chrome.tabs.onCreated` | Add new tab to window's list |
| `chrome.tabs.onRemoved` | Remove tab from window's list |
| `chrome.windows.onCreated` | Initialize MRU list for new window |
| `chrome.windows.onRemoved` | Clean up window data and cache |

## Error Handling

The extension handles various error scenarios:

### Tab No Longer Exists
When switching to a tab that was closed:
1. Remove the tab from the MRU list
2. Update cache
3. Try the next tab in the list
4. Continue until a valid tab is found

### Window Not Found
When a window is closed:
1. Remove window from all tracking objects
2. Clear navigation timers
3. Delete cache entry
4. Log cleanup for debugging

### Cache Corruption
When cached data is invalid:
1. Log validation failure
2. Attempt to rebuild from current state
3. Save new valid list to cache
4. Continue normal operation

## Performance Considerations

### Memory Usage
- Each window maintains one array of tab IDs (~100 tabs max per window)
- Session storage is used (cleared on browser close)
- Automatic cleanup when windows are closed

### Cache Updates
- Cache is updated on every MRU list change
- Session storage operations are asynchronous
- Minimal performance impact due to small data size

### Validation Frequency
- Validation occurs when:
  - Tabs are activated (but not during navigation mode)
  - Popup requests the MRU list
  - Extension initializes or recovers from error

## Debugging

Enable console logging to see:
- MRU list initialization per window
- Cache save/load operations
- Validation successes and failures
- Recovery attempts
- Tab switching operations

Example log messages:
```
Initialized MRU list for window 1: [101, 102, 103]
Saved cache for window 1
MRU list validation failed for window 1, attempting recovery
Recovered from cache for window 1
Rebuilding MRU list for window 1
```

## API

### Message Handlers

The extension responds to the following messages:

#### `getMruList`
Request the MRU list for a window:
```javascript
chrome.runtime.sendMessage({
  action: "getMruList",
  windowId: 123
});

// Response: { windowId: 123, tabs: [...] }
```

#### `switchToTab`
Switch to a specific tab:
```javascript
chrome.runtime.sendMessage({
  action: "switchToTab",
  tabId: 456
});

// Response: { success: true }
```

#### `rebuildMruList`
Force rebuild the MRU list:
```javascript
chrome.runtime.sendMessage({
  action: "rebuildMruList",
  windowId: 123
});

// Response: { success: true, list: [...] }
```

## Best Practices

1. **Let Auto-Recovery Work**: The extension will automatically detect and fix issues
2. **Use Rebuild Sparingly**: Only rebuild if you notice persistent issues
3. **Check Console Logs**: Enable developer mode to see what's happening
4. **Report Issues**: If validation keeps failing, there may be a bug to fix

## Future Enhancements

Potential improvements:
- Persistent storage across browser sessions (optional)
- Cross-window tab switching
- Window group support
- Enhanced validation with checksums
- Performance metrics and monitoring
- Export/import MRU lists
