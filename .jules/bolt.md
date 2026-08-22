## 2024-05-19 - DOM Memoization in Vanilla JS
**Learning:** Frequent polling (e.g., every 45s) combined with naive `innerHTML` updates causes unnecessary layout thrashing, DOM destruction, and repaints even if the underlying data hasn't changed.
**Action:** When working in vanilla JS applications without a Virtual DOM, cache the stringified HTML output (or data fingerprint) of list components. Before updating `innerHTML`, check if the new HTML string matches the cached string, and skip the DOM update entirely if they match.
