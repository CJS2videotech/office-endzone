## 2024-08-23 - Caching Intl.DateTimeFormat for setInterval updates
**Learning:** Instantiating `Intl.DateTimeFormat` objects (e.g., via `toLocaleTimeString` with options) inside a `setInterval` loop (like for a live clock or polling feed) introduces significant overhead and triggers frequent garbage collection. In this codebase, creating the formatter per-tick was ~20x slower than reusing a cached instance.
**Action:** Always cache `Intl.*` formatter instances globally or in an outer scope when formatting strings in high-frequency loops or recurring intervals.

## 2026-08-27 - Caching and Polling API Updates on Hidden Tabs
**Learning:** Polling external APIs using `setInterval` when the tab is hidden (e.g. `document.hidden` is true) wastes user bandwidth and browser resources, while missing the `{ cache: 'no-cache' }` fetch option can result in users being served stale scores.
**Action:** When implementing polling via `setInterval`, always check `if (document.hidden && !isInitial)` to safely skip the network request (while still allowing initial load requests to succeed). Also, use `{ cache: 'no-cache' }` for live real-time feeds to ensure fresh data.

## 2024-10-27 - Preventing DOM Thrashing on Polled API Render Updates
**Learning:** Unconditionally updating DOM elements inside polling loops (e.g., re-rendering an entire carousel every 45s) causes significant layout thrashing, even if the data hasn't changed.
**Action:** When re-rendering components from polled data, compute a data hash (e.g., via `JSON.stringify`) of the state relevant to the render and skip the DOM update if the hash matches the previous render state. Do not bypass the entire method early if other logic depends on it, but wrap the DOM update itself.
