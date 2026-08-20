## 2024-05-24 - Cached Intl.DateTimeFormat
**Learning:** Creating a new `Intl.DateTimeFormat` instance is surprisingly expensive and caused performance overhead in high-frequency operations like the `setInterval` clock and rapid API data processing.
**Action:** Always cache `Intl.DateTimeFormat` (and other Intl formatters) in a persistent variable rather than re-instantiating them inside functions called frequently.
