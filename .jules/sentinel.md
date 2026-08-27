## 2024-05-15 - [innerHTML XSS Vulnerability]
**Vulnerability:** Unsanitized event history text (`item.text`) was directly injected into the DOM using `innerHTML` in both `app.js` and `js/app.js`.
**Learning:** Duplicate rendering logic across multiple script entry points means XSS patches must be applied consistently to all instances.
**Prevention:** Use `document.createElement()` and `textContent` instead of template literals with `innerHTML` when dynamically building UI elements that display data derived from application state or external sources.
