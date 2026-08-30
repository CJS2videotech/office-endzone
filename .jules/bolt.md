## 2024-08-23 - Caching Intl.DateTimeFormat for setInterval updates
**Learning:** Instantiating `Intl.DateTimeFormat` objects (e.g., via `toLocaleTimeString` with options) inside a `setInterval` loop (like for a live clock or polling feed) introduces significant overhead and triggers frequent garbage collection. In this codebase, creating the formatter per-tick was ~20x slower than reusing a cached instance.
**Action:** Always cache `Intl.*` formatter instances globally or in an outer scope when formatting strings in high-frequency loops or recurring intervals.

## 2026-08-27 - Caching and Polling API Updates on Hidden Tabs
**Learning:** Polling external APIs using `setInterval` when the tab is hidden (e.g. `document.hidden` is true) wastes user bandwidth and browser resources, while missing the `{ cache: 'no-cache' }` fetch option can result in users being served stale scores.
**Action:** When implementing polling via `setInterval`, always check `if (document.hidden && !isInitial)` to safely skip the network request (while still allowing initial load requests to succeed). Also, use `{ cache: 'no-cache' }` for live real-time feeds to ensure fresh data.

## 2026-08-30 - Prevent DOM Thrashing on Unchanged API Data
**Learning:** In vanilla JS apps, re-rendering large lists or carousels on every API poll causes unnecessary DOM thrashing and CPU drain, even if the data hasn't changed. The previously added `if (document.hidden)` early return is helpful for background tabs but doesn't prevent thrashing when the tab is active.
**Action:** Compare incoming API data against a cached hash (e.g., `JSON.stringify(liveGames)`) and only update the DOM when the hash changes. Be careful to only wrap the specific expensive DOM manipulation so you don't inadvertently block subsequent state logic (like active game selection).
