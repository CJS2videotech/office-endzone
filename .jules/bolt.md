## 2024-08-23 - Caching Intl.DateTimeFormat for setInterval updates
**Learning:** Instantiating `Intl.DateTimeFormat` objects (e.g., via `toLocaleTimeString` with options) inside a `setInterval` loop (like for a live clock or polling feed) introduces significant overhead and triggers frequent garbage collection. In this codebase, creating the formatter per-tick was ~20x slower than reusing a cached instance.
**Action:** Always cache `Intl.*` formatter instances globally or in an outer scope when formatting strings in high-frequency loops or recurring intervals.

## 2026-08-25 - Conditional flags over early returns for polling
**Learning:** When optimizing polling mechanisms (e.g. `fetchLiveEspnFeed`, `fetchEspnScoreboard`) by checking `document.hidden`, using an early return can unintentionally bypass subsequent non-polling state initializations or unrelated logic in the same function block.
**Action:** Use boolean conditional `if` blocks (`if (!document.hidden) { ... }`) to specifically wrap the expensive operations (like `fetch` and JSON parsing), preserving the execution of any other required code in the function.
