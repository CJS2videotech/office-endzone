## 2024-08-23 - Caching Intl.DateTimeFormat for setInterval updates
**Learning:** Instantiating `Intl.DateTimeFormat` objects (e.g., via `toLocaleTimeString` with options) inside a `setInterval` loop (like for a live clock or polling feed) introduces significant overhead and triggers frequent garbage collection. In this codebase, creating the formatter per-tick was ~20x slower than reusing a cached instance.
**Action:** Always cache `Intl.*` formatter instances globally or in an outer scope when formatting strings in high-frequency loops or recurring intervals.

## 2024-08-24 - Prevent redundant DOM rebuilds when polling APIs
**Learning:** The application polls ESPN APIs every 45 seconds to update the UI. However, blindly calling `.innerHTML` to rewrite DOM trees when the polled data hasn't changed causes unnecessary layout thrashing, image re-decoding, and browser repaints. In a vanilla JS architecture, this can severely impact UI responsiveness.
**Action:** When implementing API polling mechanisms, always stringify and cache the response data. Before triggering UI updates, compare the stringified response to the cache. Early return if they match to avoid redundant DOM tearing and rebuilding.
