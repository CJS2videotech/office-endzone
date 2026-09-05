## 2024-05-24 - Accessibility: Missing Enter/Space Key Events on Interactive Elements
**Learning:** When using custom elements like 'div' with 'role="button"' and 'tabindex="0"', users can focus on them via keyboard, but pressing 'Enter' or 'Space' does not trigger the click event by default like native buttons. This breaks keyboard navigation for many core features like opening Modals or navigating tabs.
**Action:** Adding global keyboard event delegation for 'Enter' and 'Space' on elements with 'role="button"' or 'role="tab"'. Care must be taken not to trigger this if the element is already a native interactive element (like 'button' or 'input').

## 2024-05-24 - Accessibility: Redundant Screen Reader Announcements in Custom Buttons
**Learning:** When turning a complex container element into a custom button via `role="button"` and `aria-label`, screen readers may announce both the container's label and the inner text content, leading to a confusing, duplicate readout for users.
**Action:** Always apply `aria-hidden="true"` to the inner textual components of a custom button if a clear and comprehensive `aria-label` is provided on the parent element to avoid redundant announcements.
