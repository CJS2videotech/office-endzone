## 2024-08-23 - Caching Intl.DateTimeFormat for setInterval updates
**Learning:** Instantiating `Intl.DateTimeFormat` objects (e.g., via `toLocaleTimeString` with options) inside a `setInterval` loop (like for a live clock or polling feed) introduces significant overhead and triggers frequent garbage collection. In this codebase, creating the formatter per-tick was ~20x slower than reusing a cached instance.
**Action:** Always cache `Intl.*` formatter instances globally or in an outer scope when formatting strings in high-frequency loops or recurring intervals.

## 2026-08-27 - Caching and Polling API Updates on Hidden Tabs
**Learning:** Polling external APIs using `setInterval` when the tab is hidden (e.g. `document.hidden` is true) wastes user bandwidth and browser resources, while missing the `{ cache: 'no-cache' }` fetch option can result in users being served stale scores.
**Action:** When implementing polling via `setInterval`, always check `if (document.hidden && !isInitial)` to safely skip the network request (while still allowing initial load requests to succeed). Also, use `{ cache: 'no-cache' }` for live real-time feeds to ensure fresh data.

## 2026-09-01 - Prevent DOM Thrashing on Polling UI Updates
**Learning:** Repainting the DOM every time a polling interval completes, even when the data hasn't changed, causes unnecessary rendering overhead and layout thrashing. This is especially problematic with list or grid components (like a live game ticker) where only specific properties (e.g. scores, time) change.
**Action:** When updating the UI based on polling, generate a hash (e.g., via JSON.stringify) of the specific data properties necessary for the render function. Compare this new hash with the previous render's hash, and early return if they match, bypassing the DOM manipulation entirely.
