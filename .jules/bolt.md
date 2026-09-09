## 2024-08-23 - Caching Intl.DateTimeFormat for setInterval updates
**Learning:** Instantiating `Intl.DateTimeFormat` objects (e.g., via `toLocaleTimeString` with options) inside a `setInterval` loop (like for a live clock or polling feed) introduces significant overhead and triggers frequent garbage collection. In this codebase, creating the formatter per-tick was ~20x slower than reusing a cached instance.
**Action:** Always cache `Intl.*` formatter instances globally or in an outer scope when formatting strings in high-frequency loops or recurring intervals.

## 2026-08-27 - Caching and Polling API Updates on Hidden Tabs
**Learning:** Polling external APIs using `setInterval` when the tab is hidden (e.g. `document.hidden` is true) wastes user bandwidth and browser resources, while missing the `{ cache: 'no-cache' }` fetch option can result in users being served stale scores.
**Action:** When implementing polling via `setInterval`, always check `if (document.hidden && !isInitial)` to safely skip the network request (while still allowing initial load requests to succeed). Also, use `{ cache: 'no-cache' }` for live real-time feeds to ensure fresh data.

## 2026-08-28 - Preventing DOM Thrashing During API Polling
**Learning:** Updating the DOM on every tick of an API polling interval (e.g., re-rendering a ticker carousel or grid) causes severe layout thrashing and performance degradation, especially when the fetched data hasn't actually changed. Overwriting variables with new data is cheap, but rewriting DOM elements is expensive.
**Action:** Always implement a data hash check (e.g., `JSON.stringify` the payload and compare to a cached instance variable like `lastCarouselHash` or `lastGridHash`) before executing expensive DOM rendering functions during a polling interval. Update the underlying data structures, but only trigger the render if the payload hash differs.
## 2024-05-24 - DOM Cache Hashing with Polled Data
**Learning:** In a vanilla JS app that frequently polls an API and reconstructs data arrays (like `liveGames`), simple reference equality checks fail. Hashing the combined state (e.g., `JSON.stringify({ games: this.liveGames, activeId: this.activeGameId })`) correctly intercepts redundant DOM repaints. Including UI state like `activeGameId` or `currentTickerMode` is crucial; otherwise, interactions that update state without altering polled data will fail to render.
**Action:** Use serialized hashes combining both data payloads and relevant internal UI state variables when caching DOM render passes during polling. Ensure this is applied to both source files and the bundle concurrently to respect the 'no build system, strict parity required' constraint.
