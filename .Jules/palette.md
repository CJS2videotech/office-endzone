## 2024-05-24 - Accessibility: Missing Enter/Space Key Events on Interactive Elements
**Learning:** When using custom elements like 'div' with 'role="button"' and 'tabindex="0"', users can focus on them via keyboard, but pressing 'Enter' or 'Space' does not trigger the click event by default like native buttons. This breaks keyboard navigation for many core features like opening Modals or navigating tabs.
**Action:** Adding global keyboard event delegation for 'Enter' and 'Space' on elements with 'role="button"' or 'role="tab"'. Care must be taken not to trigger this if the element is already a native interactive element (like 'button' or 'input').
## 2024-05-25 - Accessibility: Nested Interactive Elements
**Learning:** Adding `role="button"` and `tabindex="0"` to both a parent container and its child creates an accessibility anti-pattern. Keyboard users must tab twice, and screen readers announce a "button inside a button".
**Action:** Apply interactive roles and tab index only to the outer logical container. Use `aria-hidden="true"` on inner decorative/text elements.
## 2025-02-12 - Accessibility: Missing Space Key Event on Link Role Button
**Learning:** Native `<a>` elements activate on 'Enter', but they do not activate on 'Space' (Space just scrolls the page). When using global event delegation to fix 'Enter/Space' for `[role="button"]`, entirely excluding `<a>` tags creates a bug where `<a role="button">` elements fail to activate via 'Space' key.
**Action:** When adding global 'Enter/Space' accessibility polyfills, explicitly handle `<a>` tags by capturing the 'Space' key, calling `e.preventDefault()`, and manually triggering the click event to match native button behavior.
