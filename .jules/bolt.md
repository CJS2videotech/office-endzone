## 2024-11-20 - O(n^2) Array Traversal in Vanilla JS Renders
**Learning:** In vanilla JS without React memoization, placing `Array.prototype.find()` inside `Array.prototype.map()` for rendering lists creates O(n^2) rendering bottlenecks. This is especially problematic in `.innerHTML` interpolations that run on intervals (like the live ticker).
**Action:** Always pre-compute O(1) lookup objects (e.g., using `reduce` to map IDs to items) outside the render loop before `.map()` iterates to generate HTML.
