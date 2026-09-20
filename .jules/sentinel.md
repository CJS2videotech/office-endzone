## 2025-01-08 - Fix DOM-based XSS in event history rendering
**Vulnerability:** The application was vulnerable to DOM-based Cross-Site Scripting (XSS) because it used `innerHTML` to render unescaped user-controlled or dynamically generated text (`item.text`) in the play-by-play event log feed (`app.js` and `js/app.js`).
**Learning:** Even internal event feeds or simulated game logs can be a vector for XSS if the data source is eventually influenced by user input or external API data (like team names or player names) without proper sanitization. The use of template literals with `innerHTML` is inherently unsafe for dynamic text content.
**Prevention:** Always use safe DOM APIs like `document.createElement` combined with `textContent` (or `innerText`) when rendering dynamic text data into the DOM to prevent arbitrary script execution. Avoid `innerHTML` unless rendering explicitly trusted and sanitized HTML.

## 2026-09-07 - Fix DOM-based XSS in event banner
**Vulnerability:** The `showEventBanner` function in `characterController.js` (and `js/characterController.js`) was vulnerable to DOM-based XSS. It used `innerHTML` to render event banners with dynamic content (`title`, `subtitle`), some of which contain unescaped team names or external text.
**Learning:** Similar to the event history feed, UI components that pop up or show transient text (like banners and toasts) must sanitize input. External data strings (such as team names passed from API via `triggerTouchdownHome` etc.) can introduce script execution if appended directly via template literals into `innerHTML`.
**Prevention:** Apply safe text rendering practices uniformly across all UI components. Replace `innerHTML` with `document.createElement` and `textContent` (or `innerText`) to handle unescaped dynamic strings securely.

## 2026-10-14 - Fix DOM-based XSS in department labels
**Vulnerability:** The department labels in `js/app.js` (`deptHome` and `deptAway`) were vulnerable to DOM-based XSS because they used `innerHTML` to render unescaped team department strings.
**Learning:** Even strings like department names that are mostly internal or sourced from static JSON files can become XSS vectors if they are ever controlled or modified by user input or external APIs without proper escaping. `innerHTML` is inherently unsafe for appending any potentially dynamic strings.
**Prevention:** As with previous XSS fixes in this application, use safe DOM APIs like `document.createElement` and `document.createTextNode` with `textContent` instead of `innerHTML` to securely render text and create elements.
