## 2026-08-24 - Custom Elements Keyboard Accessibility
**Learning:** Custom interactive elements (e.g., div with role="button" and tabindex="0") require explicit keydown event listeners to trigger a click on 'Enter' or 'Space', unlike native buttons.
**Action:** Implement global or element-specific keydown listeners that map 'Enter' and 'Space' to trigger the element's click event when converting non-interactive elements into custom interactive ones.
