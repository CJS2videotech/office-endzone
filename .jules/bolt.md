## 2024-08-23 - Caching Intl.DateTimeFormat for setInterval updates
**Learning:** Instantiating `Intl.DateTimeFormat` objects (e.g., via `toLocaleTimeString` with options) inside a `setInterval` loop (like for a live clock or polling feed) introduces significant overhead and triggers frequent garbage collection. In this codebase, creating the formatter per-tick was ~20x slower than reusing a cached instance.
**Action:** Always cache `Intl.*` formatter instances globally or in an outer scope when formatting strings in high-frequency loops or recurring intervals.

## 2026-08-27 - Caching and Polling API Updates on Hidden Tabs
**Learning:** Polling external APIs using `setInterval` when the tab is hidden (e.g. `document.hidden` is true) wastes user bandwidth and browser resources, while missing the `{ cache: 'no-cache' }` fetch option can result in users being served stale scores.
**Action:** When implementing polling via `setInterval`, always check `if (document.hidden && !isInitial)` to safely skip the network request (while still allowing initial load requests to succeed). Also, use `{ cache: 'no-cache' }` for live real-time feeds to ensure fresh data.

## 2026-08-29 - Prevent DOM Thrashing in Polling without Early Returns
**Learning:** In a codebase that explicitly forbids early returns in API polling (to avoid bypassing subsequent state logic like active game selection), attempting to optimize performance by unconditionally early-returning on `document.hidden` causes regressions (e.g., active game doesn't get set).
**Action:** Optimize by wrapping *only* the specific expensive DOM manipulation (e.g., `renderTickerCarousel`) in a conditional block based on a data hash check (`lastTickerRenderHash`). This safely prevents unnecessary repaints every 45 seconds while allowing unrelated logic to continue executing.
