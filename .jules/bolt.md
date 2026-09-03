## 2024-08-23 - Caching Intl.DateTimeFormat for setInterval updates
**Learning:** Instantiating `Intl.DateTimeFormat` objects (e.g., via `toLocaleTimeString` with options) inside a `setInterval` loop (like for a live clock or polling feed) introduces significant overhead and triggers frequent garbage collection. In this codebase, creating the formatter per-tick was ~20x slower than reusing a cached instance.
**Action:** Always cache `Intl.*` formatter instances globally or in an outer scope when formatting strings in high-frequency loops or recurring intervals.

## 2026-08-27 - Caching and Polling API Updates on Hidden Tabs
**Learning:** Polling external APIs using `setInterval` when the tab is hidden (e.g. `document.hidden` is true) wastes user bandwidth and browser resources, while missing the `{ cache: 'no-cache' }` fetch option can result in users being served stale scores.
**Action:** When implementing polling via `setInterval`, always check `if (document.hidden && !isInitial)` to safely skip the network request (while still allowing initial load requests to succeed). Also, use `{ cache: 'no-cache' }` for live real-time feeds to ensure fresh data.

## 2026-08-28 - Preventing DOM Thrashing During API Polling
**Learning:** In vanilla JS applications without virtual DOMs, calling render functions unconditionally within `setInterval` polling loops causes severe DOM thrashing, wiping state and draining performance. However, removing essential logic (like early returns or fallback conditions) breaks the application.
**Action:** When optimizing polling updates in vanilla JS, implement a lightweight object hash check (e.g., `JSON.stringify(data) !== lastHash`) to skip expensive DOM rendering if the data hasn't changed. Ensure distinct caching variables are used for duplicated implementations (e.g., `lastTickerRenderHash` in `app.js` and `lastGridHash` in `app.bundle.js`).
