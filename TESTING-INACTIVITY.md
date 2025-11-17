# Testing Service Worker Inactivity Fixes

This guide helps you verify that the extension works correctly after periods of inactivity and that the service worker state restoration is functioning properly.

## Quick Test (5 minutes)

### Test 1: Basic Inactivity Recovery

1. **Install/Reload the Extension**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Reload" on MRU Tab Switcher
   - Click "Service worker" to open the console

2. **Verify Initial State**
   - Open several tabs (at least 5)
   - Press `Alt+Q` or `Alt+W` to switch between tabs
   - In the console, you should see logs like:
     ```
     Keepalive started
     Updated MRU list for window X: [tab ids]
     ```

3. **Wait for Inactivity**
   - Do NOT interact with the browser for 35-40 seconds
   - Watch the service worker console
   - The console will disconnect when the worker shuts down
   - This is normal and expected!

4. **Test Wake-Up**
   - Press `Alt+Q` (or any configured shortcut)
   - The console should reconnect and show:
     ```
     Restoring state from storage...
     Restored MRU list for window X
     State restoration complete
     ```
   - **EXPECTED**: Tab switches immediately without delay
   - **EXPECTED**: Works on first try (no need to press multiple times)

### Test 2: Rapid Switching After Inactivity

1. Wait for service worker to shut down (40 seconds)
2. Rapidly press `Alt+Q` multiple times
3. **EXPECTED**: All shortcuts work immediately
4. **EXPECTED**: Tab cycling through MRU order works correctly

### Test 3: Keepalive During Active Use

1. Reload the extension
2. Open service worker console
3. Press `Alt+Q` every 15 seconds for 2 minutes
4. **EXPECTED**: Service worker stays alive (console remains connected)
5. **EXPECTED**: No state restoration logs between switches
6. **EXPECTED**: Instant response to all commands

## Comprehensive Test Suite

### Test 4: Cache Validation

1. **Setup**
   - Open 10 tabs in one window
   - Switch between tabs using `Alt+Q` several times
   - Open service worker console

2. **Check Storage**
   ```javascript
   // In service worker console:
   chrome.storage.session.get(null).then(console.log)
   ```
   - Should see keys like `mru_cache_<windowId>` with arrays of tab IDs
   - Should see `navigation_state` with isNavigating and currentMruIndex

3. **Force Restart**
   ```javascript
   // In service worker console:
   chrome.runtime.reload()
   ```

4. **Verify Restoration**
   - Press `Alt+Q`
   - Console should show "Restoring state from storage..."
   - Tab should switch immediately

### Test 5: Multi-Window Behavior

1. **Setup**
   - Open 2 browser windows with 5 tabs each
   - Switch tabs in Window 1 using shortcuts
   - Switch tabs in Window 2 using shortcuts

2. **Wait for Inactivity**
   - Wait 40 seconds without interaction

3. **Test Each Window**
   - Focus Window 1, press `Alt+Q`
   - **EXPECTED**: Switches to correct tab in Window 1
   - Focus Window 2, press `Alt+Q`
   - **EXPECTED**: Switches to correct tab in Window 2
   - **EXPECTED**: No cross-window interference

### Test 6: Cache Invalidation Handling

1. **Setup**
   - Open 5 tabs
   - Switch between them to build MRU list
   - Wait for service worker shutdown (40 seconds)

2. **Modify Tabs While Asleep**
   - Close 2 tabs
   - Open 3 new tabs
   - Rearrange tabs

3. **Test Recovery**
   - Press `Alt+Q`
   - Console should show:
     ```
     Validation failed: list length X != tab count Y
     Building MRU list from scratch for window Z
     ```
   - **EXPECTED**: Extension rebuilds list and works correctly
   - **EXPECTED**: No errors or crashes

### Test 7: Navigation State Persistence

1. **Start Navigation**
   - Press `Alt+Q` three times quickly (don't wait for timeout)
   - You're now in the middle of navigating the MRU list

2. **Force Shutdown**
   ```javascript
   // In service worker console (before it times out):
   chrome.runtime.reload()
   ```

3. **Continue Navigation**
   - Immediately press `Alt+Q` again
   - **EXPECTED**: Navigation state is preserved
   - **EXPECTED**: Continues from where you left off

### Test 8: Long-Term Stability

1. **Setup**
   - Install extension and use normally
   - Open many tabs (20+)
   - Use shortcuts regularly

2. **Simulate Real Usage**
   - Switch tabs actively for 5 minutes
   - Go idle for 10 minutes
   - Switch tabs again
   - Repeat 3-4 times

3. **Verify**
   - **EXPECTED**: Works reliably after each idle period
   - **EXPECTED**: No memory leaks (check `chrome://system`)
   - **EXPECTED**: No error accumulation in console

## Expected Behaviors

### ✅ What Should Work

- Extension responds immediately after any length of inactivity
- First shortcut press works (no need to press twice)
- State is restored within 50ms from cache
- Keepalive prevents shutdown during active use (every 20 seconds)
- Invalid cache triggers automatic rebuild
- Multi-window setups maintain separate state per window
- Console shows clear restoration logs

### ❌ What Should NOT Happen

- ~~Need to press shortcuts multiple times after inactivity~~
- ~~Delays of 1+ seconds after wake-up~~
- ~~Extension context invalidated errors~~
- ~~Need to reload pages to make extension work~~
- ~~Service worker crashing or restarting in loops~~
- ~~State corruption or missing tabs~~

## Debugging Failed Tests

### Issue: Extension doesn't respond after inactivity

**Check:**
```javascript
// In service worker console after pressing shortcut:
console.log("MRU Lists:", mruTabLists);
console.log("Is Navigating:", isNavigating);
```

**Expected**: Should show populated objects
**If empty**: State restoration didn't trigger

**Fix**: Verify `restoreStateFromStorage()` is called in command handler

### Issue: Delayed response (>500ms)

**Check:**
```javascript
// In service worker console:
chrome.storage.session.get(null).then(data => {
  console.log("Cache size:", Object.keys(data).length);
  console.log("Cache data:", data);
});
```

**Expected**: Should have cached data
**If empty**: Cache isn't being saved

**Fix**: Check that `saveCacheForWindow()` is called after MRU updates

### Issue: Service worker crashes

**Check Extension Console:**
- Go to `chrome://extensions/`
- Click "Errors" button on the extension
- Look for stack traces

**Common Causes:**
- Async/await errors
- Storage quota exceeded
- Invalid tab IDs in cache

### Issue: Keepalive not working

**Test:**
```javascript
// In service worker console:
console.log("Keepalive interval:", keepAliveInterval);
```

**Expected**: Should show an interval ID (number)
**If null**: Keepalive didn't start

**Fix**: Verify `startKeepalive()` is called in `onInstalled` and `onStartup`

## Performance Verification

### Test Memory Usage

1. **Before Active Use**
   - Go to `chrome://system`
   - Click "Expand" on memory details
   - Note baseline memory usage

2. **After Active Use**
   - Use extension for 10 minutes
   - Check memory again
   - **EXPECTED**: <5 MB increase

3. **After Idle Period**
   - Wait 5 minutes
   - Check memory
   - **EXPECTED**: Memory returns to near baseline

### Test Latency

```javascript
// In service worker console, test restoration speed:
console.time('restoration');
await restoreStateFromStorage();
console.timeEnd('restoration');
```

**Expected**: <50ms with valid cache

## Automated Testing (Optional)

### Console Test Script

Paste this in the service worker console:

```javascript
(async function testStateRestoration() {
  console.log('🧪 Testing state restoration...');
  
  // Clear state
  mruTabLists = {};
  isNavigating = {};
  currentMruIndex = {};
  
  console.log('✅ Cleared in-memory state');
  
  // Restore from storage
  console.time('Restoration time');
  await restoreStateFromStorage();
  console.timeEnd('Restoration time');
  
  // Verify restoration
  const windowCount = Object.keys(mruTabLists).length;
  console.log(`✅ Restored ${windowCount} window(s)`);
  
  for (const [windowId, tabs] of Object.entries(mruTabLists)) {
    console.log(`   Window ${windowId}: ${tabs.length} tabs`);
  }
  
  if (windowCount > 0) {
    console.log('✅ Test PASSED - State restored successfully');
  } else {
    console.log('❌ Test FAILED - No state restored');
  }
})();
```

## Success Criteria

The fix is successful if:

- [x] Extension works on first shortcut press after any idle period
- [x] State restoration completes in <50ms with valid cache
- [x] Keepalive keeps worker alive during active use (20s intervals)
- [x] Invalid cache triggers automatic rebuild without errors
- [x] Multi-window state is properly isolated and restored
- [x] No "Extension context invalidated" errors
- [x] Memory usage remains stable over time
- [x] Console shows clear logging of lifecycle events

## Reporting Issues

If tests fail, please provide:

1. **Browser Version**: `chrome://version`
2. **Extension Version**: Check `manifest.json` or popup
3. **Console Logs**: Full service worker console output
4. **Storage State**: Output of `chrome.storage.session.get(null)`
5. **Steps to Reproduce**: Exact sequence that triggers the issue
6. **Expected vs Actual**: What you expected vs what happened

## Additional Resources

- See `SERVICE-WORKER-GUIDE.md` for technical details
- See `WINDOW-AWARE.md` for window-specific behaviors
- See `DEVELOPERS.md` for architecture overview
