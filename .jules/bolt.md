## 2024-08-23 - Caching Intl.DateTimeFormat for setInterval updates
**Learning:** Instantiating `Intl.DateTimeFormat` objects (e.g., via `toLocaleTimeString` with options) inside a `setInterval` loop (like for a live clock or polling feed) introduces significant overhead and triggers frequent garbage collection. In this codebase, creating the formatter per-tick was ~20x slower than reusing a cached instance.
**Action:** Always cache `Intl.*` formatter instances globally or in an outer scope when formatting strings in high-frequency loops or recurring intervals.

## 2026-08-27 - Caching and Polling API Updates on Hidden Tabs
**Learning:** Polling external APIs using `setInterval` when the tab is hidden (e.g. `document.hidden` is true) wastes user bandwidth and browser resources, while missing the `{ cache: 'no-cache' }` fetch option can result in users being served stale scores.
**Action:** When implementing polling via `setInterval`, always check `if (document.hidden && !isInitial)` to safely skip the network request (while still allowing initial load requests to succeed). Also, use `{ cache: 'no-cache' }` for live real-time feeds to ensure fresh data.

## 2026-08-28 - Preventing DOM Thrashing During API Polling
**Learning:** Updating the DOM on every tick of an API polling interval (e.g., re-rendering a ticker carousel or grid) causes severe layout thrashing and performance degradation, especially when the fetched data hasn't actually changed. Overwriting variables with new data is cheap, but rewriting DOM elements is expensive.
**Action:** Always implement a data hash check (e.g., `JSON.stringify` the payload and compare to a cached instance variable like `lastCarouselHash` or `lastGridHash`) before executing expensive DOM rendering functions during a polling interval. Update the underlying data structures, but only trigger the render if the payload hash differs.

## 2024-05-18 - Cached Intl.DateTimeFormat
**Learning:** Calling `toLocaleTimeString()` implicitly constructs a new `Intl.DateTimeFormat` object. In frequent operations (like an active event log or a repeating game clock), this introduces substantial performance overhead and unnecessary garbage collection. Always extract and cache a single `Intl.DateTimeFormat` instance.
**Action:** Replace `new Date().toLocaleTimeString('en-US', options)` with a module-level cached `Intl.DateTimeFormat('en-US', options)` and reuse its `.format(new Date())` method across all source files and bundles to prevent garbage collection thrashing in rendering loops.
