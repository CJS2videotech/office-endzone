## 2026-08-17 - DOM Reflow Bottlenecks
**Learning:** The codebase has multiple duplicate scripts (e.g., app.js and js/app.js) with synchronous loops performing dozens of independent DOM insertions (appendChild in loops), causing significant reflow overhead on the main thread during animations and rapid state updates.
**Action:** Always batch DOM updates using DocumentFragment for node appends or map arrays to a single string for innerHTML assignment, ensuring both copies of duplicated files are optimized.
