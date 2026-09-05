## 2024-08-23 - Caching Intl.DateTimeFormat for setInterval updates
**Learning:** Instantiating `Intl.DateTimeFormat` objects (e.g., via `toLocaleTimeString` with options) inside a `setInterval` loop (like for a live clock or polling feed) introduces significant overhead and triggers frequent garbage collection. In this codebase, creating the formatter per-tick was ~20x slower than reusing a cached instance.
**Action:** Always cache `Intl.*` formatter instances globally or in an outer scope when formatting strings in high-frequency loops or recurring intervals.

## 2026-08-27 - Caching and Polling API Updates on Hidden Tabs
**Learning:** Polling external APIs using `setInterval` when the tab is hidden (e.g. `document.hidden` is true) wastes user bandwidth and browser resources, while missing the `{ cache: 'no-cache' }` fetch option can result in users being served stale scores.
**Action:** When implementing polling via `setInterval`, always check `if (document.hidden && !isInitial)` to safely skip the network request (while still allowing initial load requests to succeed). Also, use `{ cache: 'no-cache' }` for live real-time feeds to ensure fresh data.

## 2024-11-20 - Prevent DOM Thrashing on Interval API Polling
**Learning:** Frequent API polling that blindly updates `innerHTML` for complex elements (like tickers and carousels) causes heavy DOM thrashing, triggering expensive layout recalculations and repaints even when the data hasn't changed.
**Action:** When updating complex UI elements based on an interval or polling data, always implement a hash check (e.g., `JSON.stringify(data)`) to compare the incoming data against the previous state. Only manipulate the DOM if the data has actually changed. Wrap only the specific expensive DOM manipulation to avoid prematurely bypassing other necessary state logic.
