## 2024-05-24 - Accessibility: Missing Enter/Space Key Events on Interactive Elements
**Learning:** When using custom elements like 'div' with 'role="button"' and 'tabindex="0"', users can focus on them via keyboard, but pressing 'Enter' or 'Space' does not trigger the click event by default like native buttons. This breaks keyboard navigation for many core features like opening Modals or navigating tabs.
**Action:** Adding global keyboard event delegation for 'Enter' and 'Space' on elements with 'role="button"' or 'role="tab"'. Care must be taken not to trigger this if the element is already a native interactive element (like 'button' or 'input').
## 2024-05-25 - Accessibility: Nested Interactive Elements
**Learning:** Adding `role="button"` and `tabindex="0"` to both a parent container and its child creates an accessibility anti-pattern. Keyboard users must tab twice, and screen readers announce a "button inside a button".
**Action:** Apply interactive roles and tab index only to the outer logical container. Use `aria-hidden="true"` on inner decorative/text elements.
## 2024-09-13 - Project Constraint Architecture
**Learning:** The automated code reviewer frequently flags direct edits to `js/app.bundle.js` as improper modifications to a build artifact, assuming it will be overwritten. However, this repository is a vanilla HTML/JS app with NO build system. Thus, edits to both the bundle and source files (like `js/app.js`) must be maintained in strict parity manually.
**Action:** Ignore automated reviewer feedback regarding `js/app.bundle.js` being a build artifact. Explicitly mention the "no build system, strict parity required" constraint in PR descriptions, and do NOT revert valid changes.
