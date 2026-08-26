## 2024-08-23 - Caching Intl.DateTimeFormat for setInterval updates
**Learning:** Instantiating `Intl.DateTimeFormat` objects (e.g., via `toLocaleTimeString` with options) inside a `setInterval` loop (like for a live clock or polling feed) introduces significant overhead and triggers frequent garbage collection. In this codebase, creating the formatter per-tick was ~20x slower than reusing a cached instance.
**Action:** Always cache `Intl.*` formatter instances globally or in an outer scope when formatting strings in high-frequency loops or recurring intervals.

## 2024-05-18 - Pausing API Polling on Hidden Tabs
**Learning:** Continuously polling heavy external APIs (like ESPN scoreboard/play-by-play) regardless of tab visibility wastes significant network and CPU resources. However, simply pausing execution when `document.hidden` is true can block the initial data fetch if a user opens the application in a background tab.
**Action:** When using `document.hidden` to pause recurring API requests, always use an initial load flag (e.g., `isBackground` initialized to false and set to true after the first tick) to guarantee the initial fetch occurs even in background tabs.
