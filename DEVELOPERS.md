# Developer Guide - MRU Tab Switcher

## Welcome Contributors! 🎉

This guide helps developers understand, modify, and contribute to the MRU Tab Switcher extension.

## Project Structure

```
switch-tab/
├── manifest.json           # Extension configuration
├── background.js           # Core logic (service worker)
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic
├── options.html           # Settings page UI
├── options.js             # Settings page logic
├── README.md              # User documentation
├── CHANGELOG.md           # Version history
├── WINDOW-AWARE.md        # Technical architecture docs
├── TESTING.md             # Testing guide
├── MIGRATION.md           # Upgrade guide
├── IMPLEMENTATION-SUMMARY.md  # Implementation details
└── DEVELOPERS.md          # This file
```

## Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────────────────┐
│                   Chrome Browser                     │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Window 1 │  │ Window 2 │  │ Window 3 │         │
│  │  Tabs    │  │  Tabs    │  │  Tabs    │         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│       │             │              │                │
│       └─────────────┼──────────────┘                │
│                     │                               │
│              ┌──────▼──────┐                        │
│              │  Tab Events  │                       │
│              └──────┬───────┘                       │
│                     │                               │
│       ┌─────────────▼────────────────┐              │
│       │   background.js              │              │
│       │   (Service Worker)           │              │
│       │                              │              │
│       │  ┌─────────────────────┐    │              │
│       │  │  mruTabLists        │    │              │
│       │  │  {                  │    │              │
│       │  │    win1: [tabs],    │    │              │
│       │  │    win2: [tabs]     │    │              │
│       │  │  }                  │    │              │
│       │  └─────────┬───────────┘    │              │
│       │            │                │              │
│       │            ▼                │              │
│       │  ┌─────────────────────┐   │              │
│       │  │  Session Storage    │   │              │
│       │  │  (Cache)            │   │              │
│       │  └─────────────────────┘   │              │
│       └─────────────┬────────────────┘             │
│                     │                               │
│       ┌─────────────▼────────────────┐              │
│       │   popup.js / popup.html      │              │
│       │   (User Interface)           │              │
│       └──────────────────────────────┘              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Core Components

#### 1. background.js (Service Worker)

**Responsibilities:**
- Track tab activations per window
- Maintain MRU lists for each window
- Handle keyboard shortcuts
- Manage cache (save/load)
- Validate and recover data
- Respond to popup requests

**Key Data Structures:**
```javascript
mruTabLists = {
  windowId1: [tabId1, tabId2, ...],
  windowId2: [tabId3, tabId4, ...]
}

isNavigating = { windowId: boolean }
currentMruIndex = { windowId: number }
navigationTimer = { windowId: timeoutId }
```

**Main Functions:**
- `initializeAllWindows()` - Startup initialization
- `initializeMruListForWindow(windowId)` - Per-window init
- `updateMruList(windowId, tabId)` - Update on activation
- `validateMruList(mruList, currentTabIds)` - Data validation
- `switchTab(windowId, direction)` - Keyboard navigation
- `saveCacheForWindow(windowId, list)` - Cache persistence
- `loadCacheForWindow(windowId)` - Cache retrieval

#### 2. popup.js / popup.html

**Responsibilities:**
- Display MRU list for current window
- Show window information
- Provide manual controls (refresh/rebuild)
- Handle tab clicks for switching

**Message Flow:**
```javascript
// Request MRU list
chrome.runtime.sendMessage({
  action: "getMruList",
  windowId: currentWindowId
});

// Response
{
  windowId: 123,
  tabs: [
    { id, title, url, favIconUrl, active },
    ...
  ]
}
```

#### 3. Cache System

**Storage:** `chrome.storage.session`

**Keys:** `mru_cache_{windowId}`

**Lifecycle:**
- Save: On every MRU list update
- Load: On extension start, recovery
- Clear: On window close

**Advantages:**
- Fast access (<5ms)
- Automatic cleanup on browser close
- No quota concerns (session-scoped)

## Development Setup

### Prerequisites

- Google Chrome (latest version)
- Text editor (VS Code recommended)
- Basic understanding of JavaScript, Chrome Extensions API

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd switch-tab
   ```

2. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top-right toggle)
   - Click "Load unpacked"
   - Select the `switch-tab` folder

3. **Enable debugging:**
   - Click "service worker" link to open DevTools for background.js
   - Right-click extension icon → "Inspect popup" for popup debugging

### Development Workflow

1. Make changes to files
2. Go to `chrome://extensions/`
3. Click the reload icon (circular arrow) for the extension
4. Test your changes
5. Check console logs in both:
   - Service worker DevTools
   - Popup DevTools (if popup changes)

## Making Changes

### Adding a New Feature

1. **Update background.js** if it involves:
   - Tab/window tracking
   - Keyboard shortcuts
   - Data management

2. **Update popup.html/popup.js** if it involves:
   - User interface
   - Display changes
   - New controls

3. **Update manifest.json** if it involves:
   - New permissions
   - New commands
   - Version bump

4. **Document your changes:**
   - Add to CHANGELOG.md
   - Update README.md if user-facing
   - Add inline code comments

### Example: Adding a New Keyboard Shortcut

**Step 1: Update manifest.json**
```json
{
  "commands": {
    "my-new-command": {
      "suggested_key": {
        "default": "Alt+X"
      },
      "description": "My new feature"
    }
  }
}
```

**Step 2: Add handler in background.js**
```javascript
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "my-new-command") {
    const window = await chrome.windows.getCurrent();
    await myNewFeature(window.id);
  }
});

async function myNewFeature(windowId) {
  // Your implementation
  console.log(`Feature executed for window ${windowId}`);
}
```

**Step 3: Test**
- Reload extension
- Use Alt+X
- Check console for logs

### Example: Adding UI Element to Popup

**Step 1: Update popup.html**
```html
<button id="myNewButton" class="action-button">
  🚀 New Feature
</button>
```

**Step 2: Add handler in popup.js**
```javascript
const myNewButton = document.getElementById("myNewButton");
if (myNewButton) {
  myNewButton.addEventListener("click", async (e) => {
    e.preventDefault();
    await handleMyNewFeature();
  });
}

async function handleMyNewFeature() {
  const response = await chrome.runtime.sendMessage({
    action: "myNewAction"
  });
  console.log("Response:", response);
}
```

**Step 3: Add message handler in background.js**
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "myNewAction") {
    myNewAction().then(sendResponse);
    return true; // Will respond asynchronously
  }
});

async function myNewAction() {
  // Your implementation
  return { success: true, data: "..." };
}
```

## Key Concepts

### Window-Aware Design

**Principle:** Each window operates independently.

**Implementation Pattern:**
```javascript
// Always pass windowId as first parameter
async function operateOnWindow(windowId, ...params) {
  // Get window-specific data
  const list = mruTabLists[windowId];
  
  // Operate on that data
  // ...
  
  // Save window-specific cache
  await saveCacheForWindow(windowId, list);
}
```

### Validation-First Approach

**Principle:** Always validate before operating on data.

**Pattern:**
```javascript
async function updateData(windowId, newData) {
  // Get current state
  const tabs = await chrome.tabs.query({ windowId });
  const currentTabIds = tabs.map(t => t.id);
  
  // Validate
  if (!validateMruList(mruTabLists[windowId], currentTabIds)) {
    // Attempt recovery
    const cached = await loadCacheForWindow(windowId);
    if (cached && validateMruList(cached, currentTabIds)) {
      mruTabLists[windowId] = cached;
    } else {
      await initializeMruListForWindow(windowId, tabs);
      return; // Start fresh
    }
  }
  
  // Now safe to update
  // ...
}
```

### Navigation Mode

**Concept:** Temporary mode while user cycles through tabs.

**Behavior:**
- Entered on first Alt+Q/W press
- Exits after 1 second of inactivity
- Prevents MRU list updates during navigation
- Finalizes selection on exit

**Implementation:**
```javascript
async function switchTab(windowId, direction) {
  // Enter navigation mode
  if (!isNavigating[windowId]) {
    isNavigating[windowId] = true;
    currentMruIndex[windowId] = 0;
  }
  
  // Navigate
  // ...
  
  // Reset timer
  if (navigationTimer[windowId]) {
    clearTimeout(navigationTimer[windowId]);
  }
  
  navigationTimer[windowId] = setTimeout(() => {
    finishNavigation(windowId);
  }, 1000);
}
```

## Testing

### Manual Testing

See [TESTING.md](TESTING.md) for comprehensive test cases.

**Quick Smoke Test:**
1. Open 2 windows with 3+ tabs each
2. Switch tabs in Window 1 with Alt+Q
3. Open popup in Window 1 (check list)
4. Switch to Window 2
5. Switch tabs in Window 2 with Alt+Q
6. Open popup in Window 2 (check different list)
7. Reload extension
8. Verify lists are preserved

### Console Logging

**Enable detailed logging:**
```javascript
// In background.js, all operations log to console
// View via chrome://extensions/ → service worker link
```

**What to look for:**
- Initialization messages
- Cache save/load operations
- Validation results
- Recovery attempts
- Error messages

### Debugging Tips

**Background Service Worker:**
```javascript
// Add breakpoints in Chrome DevTools
// Or add console.log statements
console.log("Debug:", { windowId, mruList: mruTabLists[windowId] });
```

**Popup:**
```javascript
// Right-click extension icon → Inspect popup
// Console is available
console.log("Current window:", currentWindow.id);
```

**Inspecting Cache:**
```javascript
// In service worker console
chrome.storage.session.get(null, (data) => {
  console.log("All cached data:", data);
});
```

**Manually Testing Recovery:**
```javascript
// In service worker console
// Corrupt the list
mruTabLists[WINDOW_ID] = [99999, 88888];

// Then try to switch tabs or activate a tab
// Watch recovery in action
```

## Code Style

### JavaScript Conventions

- **Functions:** Use `async/await` for asynchronous operations
- **Naming:** camelCase for variables and functions
- **Constants:** UPPER_SNAKE_CASE for true constants
- **Comments:** Explain "why", not "what"

### Good Practices

```javascript
// ✅ Good: Descriptive names
async function initializeMruListForWindow(windowId, tabs) {
  // ...
}

// ❌ Bad: Unclear names
async function init(w, t) {
  // ...
}

// ✅ Good: Error handling
try {
  await chrome.tabs.update(tabId, { active: true });
} catch (error) {
  console.error("Error switching tab:", error);
  return { success: false, error: error.message };
}

// ❌ Bad: No error handling
await chrome.tabs.update(tabId, { active: true });

// ✅ Good: Validation before operation
if (!mruTabLists[windowId]) {
  await initializeMruListForWindow(windowId);
}

// ❌ Bad: Assuming data exists
mruTabLists[windowId].push(tabId);
```

## Common Tasks

### Adding Validation Check

```javascript
function validateMruList(mruList, currentTabIds) {
  // Existing checks
  // ...
  
  // Add your new check
  if (myNewCondition) {
    console.log("Validation failed: my reason");
    return false;
  }
  
  return true;
}
```

### Adding Cache Field

```javascript
async function saveCacheForWindow(windowId, mruList) {
  const cacheData = {
    list: mruList,
    timestamp: Date.now(), // New field
    version: "1.2.0"       // New field
  };
  
  const key = `${CACHE_KEY_PREFIX}${windowId}`;
  await chrome.storage.session.set({ [key]: cacheData });
}

async function loadCacheForWindow(windowId) {
  const key = `${CACHE_KEY_PREFIX}${windowId}`;
  const result = await chrome.storage.session.get(key);
  const cacheData = result[key];
  
  // Validate new fields
  if (cacheData && cacheData.version === "1.2.0") {
    return cacheData.list;
  }
  
  return null;
}
```

### Adding New Message Action

```javascript
// In background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "myNewAction") {
    handleMyNewAction(request.param1, request.param2)
      .then(sendResponse);
    return true;
  }
  // ... existing actions
});

async function handleMyNewAction(param1, param2) {
  // Implementation
  return { success: true, result: "..." };
}

// In popup.js
async function callMyNewAction() {
  const response = await chrome.runtime.sendMessage({
    action: "myNewAction",
    param1: "value1",
    param2: "value2"
  });
  
  if (response.success) {
    console.log("Success:", response.result);
  }
}
```

## Performance Considerations

### Efficient Data Structures

```javascript
// ✅ Good: Use Set for lookups
const tabIdSet = new Set(currentTabIds);
if (tabIdSet.has(tabId)) { /* ... */ }

// ❌ Bad: Linear search
if (currentTabIds.includes(tabId)) { /* ... */ }
```

### Minimize Chrome API Calls

```javascript
// ✅ Good: Query once, reuse
const tabs = await chrome.tabs.query({ windowId });
tabs.forEach(tab => { /* ... */ });

// ❌ Bad: Query for each tab
for (const tabId of tabIds) {
  const tab = await chrome.tabs.get(tabId); // Slow!
}
```

### Batch Operations

```javascript
// ✅ Good: Update all at once
await saveCacheForWindow(windowId, mruTabLists[windowId]);

// ❌ Bad: Multiple cache updates
for (const tabId of tabIds) {
  await saveCacheForWindow(windowId, [tabId]); // Slow!
}
```

## Troubleshooting

### Extension Won't Load

- Check manifest.json syntax (use JSON validator)
- Verify all files referenced in manifest exist
- Check Chrome version compatibility

### Service Worker Crashes

- Check for infinite loops
- Verify all async functions are properly awaited
- Look for unhandled promise rejections

### Cache Not Working

- Verify `storage` permission in manifest
- Check if session storage is available (not in incognito without flag)
- Validate cache key format

### Tests Failing

- Reload extension completely
- Clear all cache: `chrome.storage.session.clear()`
- Check Chrome DevTools console for errors

## Contributing

### Before Submitting

1. ✅ Test your changes thoroughly
2. ✅ Update documentation (README, CHANGELOG)
3. ✅ Add comments for complex logic
4. ✅ Ensure no console errors
5. ✅ Test in multiple windows
6. ✅ Verify cache persistence

### Pull Request Guidelines

- Clear description of changes
- Reference any related issues
- Include test cases if applicable
- Follow existing code style

## Resources

### Chrome Extension APIs

- [chrome.tabs API](https://developer.chrome.com/docs/extensions/reference/tabs/)
- [chrome.windows API](https://developer.chrome.com/docs/extensions/reference/windows/)
- [chrome.storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [chrome.commands API](https://developer.chrome.com/docs/extensions/reference/commands/)

### Related Documentation

- [WINDOW-AWARE.md](WINDOW-AWARE.md) - Architecture details
- [TESTING.md](TESTING.md) - Testing guide
- [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md) - Implementation overview

## Contact

For questions or discussions:
- Open an issue on GitHub
- Check existing documentation
- Review code comments

---

Happy coding! 🚀
