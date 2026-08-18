## 2024-05-14 - Optimize Intl.DateTimeFormat
**Learning:** Found an expensive optimization bottleneck where `new Intl.DateTimeFormat()` was being called every second via an interval and on multiple data renders when using `Date.toLocaleTimeString()`.
**Action:** Always cache `Intl.DateTimeFormat` or `Intl.NumberFormat` instances when formatting inside loops or rapid periodic calls (like clock tickers) as creating new instances is extremely slow (~25x performance improvement when cached).
