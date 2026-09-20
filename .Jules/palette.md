## 2024-05-24 - Interactive Component A11y
**Learning:** When making complex div structures into accessible buttons (e.g., ticker cards), wrapping inner content with `aria-hidden="true"` and applying a unified `aria-label` to the parent prevents screen readers from redundantly announcing disjointed child text nodes. Also, global keyboard delegation must use `e.target.closest` to catch enter/space events properly when a user interacts with a child element inside the custom button.
**Action:** Consolidate screen reader context on the parent container with `aria-label` and `aria-hidden="true"` on children for complex custom buttons, and always use `.closest()` in delegated keyboard event handlers.

## 2024-05-24 - Dynamic Action Button A11y
**Learning:** Buttons dynamically generated via template literals (like `.bracket-pick-btn` mapping over array data) often rely on adjacent text nodes for visual context, leaving screen reader users without sufficient information (e.g., "Pick" instead of "Pick Andrea"). This is a common pattern in complex data grids or bracket trees.
**Action:** Always interpolate the target's specific identifier (e.g., `${m.staff1.name}`) into an explicit `aria-label` attribute on the button element itself when rendering lists of identical action buttons.
