## 2026-08-20 - XSS in innerHTML Rendering
**Vulnerability:** Found direct injection of unescaped variables into DOM using innerHTML for event logs.
**Learning:** The usage of template literals with innerHTML is widespread for creating UI elements in this vanilla JS app, introducing high XSS risks.
**Prevention:** Use DOM manipulation methods like document.createElement() and textContent, or create a global escapeHTML utility for safer template literal usage.
