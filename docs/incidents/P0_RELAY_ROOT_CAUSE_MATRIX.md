# P0 Relay root-cause matrix

| Domain | Finding | Severity |
|--------|---------|----------|
| A UI mount | Panel always mounts (`data-testid=relay-panel`) | OK |
| A CSS mobile | Closed drawer: `visibility:hidden`, `translateX(100%)` | **P0 UX** — appears missing |
| A Navigation | Bottom-nav Relay + topbar toggle present on phone | OK after open |
| A Desktop | Composer visible without open class | OK |
| B Auth | Authorized roles load shell | OK |
| C API | Send path returns care answer | OK |
| D Deploy | App `67da9ee` live; parity with product source | OK at repro |
| E AI mode | LLM mode does not unmount Relay | OK |

**Conclusion:** Availability defect is **closed-by-default mobile drawer + mid-width discoverability**, not data loss or API death.
