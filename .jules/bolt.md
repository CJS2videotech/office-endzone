## 2024-08-23 - Caching Intl.DateTimeFormat for setInterval updates
**Learning:** Instantiating `Intl.DateTimeFormat` objects (e.g., via `toLocaleTimeString` with options) inside a `setInterval` loop (like for a live clock or polling feed) introduces significant overhead and triggers frequent garbage collection. In this codebase, creating the formatter per-tick was ~20x slower than reusing a cached instance.
**Action:** Always cache `Intl.*` formatter instances globally or in an outer scope when formatting strings in high-frequency loops or recurring intervals.

## 2026-08-27 - Caching and Polling API Updates on Hidden Tabs
**Learning:** Polling external APIs using `setInterval` when the tab is hidden (e.g. `document.hidden` is true) wastes user bandwidth and browser resources, while missing the `{ cache: 'no-cache' }` fetch option can result in users being served stale scores.
**Action:** When implementing polling via `setInterval`, always check `if (document.hidden && !isInitial)` to safely skip the network request (while still allowing initial load requests to succeed). Also, use `{ cache: 'no-cache' }` for live real-time feeds to ensure fresh data.
## 2024-11-20 - Prevent DOM Thrashing During API Polling
**Learning:** Calling DOM rendering functions unconditionally during API polling (e.g., `setInterval`) causes severe performance bottlenecks (DOM thrashing) because the entire component tree is rebuilt even when the data hasn't changed.
**Action:** Implement a data hash check (e.g., stringifying the array and comparing it with a cached value) at the beginning of the render function to avoid unnecessary DOM manipulations when the state remains identical. Maintain strict parity between the bundle and source files (as this project has no build system), ensuring distinct cache variable names (e.g., `lastTickerRenderHash` in app.js vs `lastGridHash` in app.bundle.js) to avoid state collisions.
