## 2024-06-11 - Custom Element Interactions
**Learning:** Interactive elements functioning as buttons (like custom div cards) frequently lack keyboard event listeners, preventing 'Enter' or 'Space' from triggering clicks, a critical a11y gap.
**Action:** When adding click event listeners to custom interactive elements, always accompany them with corresponding 'keydown' event handlers (for Enter/Space) and ensure they have visible focus outlines.
