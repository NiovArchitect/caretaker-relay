# MedixWeb Implementation Drift (public pixels)

**Public URL:** https://care.niovlabs.com  
**App deployed (pre-fix):** `23e2ae0`  
**Inspected:** login/today at 1920 / 1440 / 1366 via Playwright against production

## LOGIN (public 1440)

| Issue | Severity | Status |
|-------|----------|--------|
| Card left-biased (app-shell 3-column grid not reset) | **P0** | **FIXED** in source (grid-template-columns: 1fr) — deploy required |
| “Principal” developer language | P1 | **FIXED** → “Choose caregiver” |
| “Synthetic lab household” harsh eval language | P2 | Softened |
| Invitation field secondary | OK | Kept, copy humanized |
| Glass/teal palette vs MedixWeb | OK | Matches soft blue stage |
| Vertical optical center after grid fix | Pending deploy verify | |

## TODAY (public)

| Observation | Status |
|-------------|--------|
| Caring for Evelyn Carter hero | PASS |
| Marcus Carter · Primary family caregiver | PASS |
| Soft blue hero glass modules | PASS |
| Needs attention / what changed hierarchy | PASS |
| Quiet pair grid | PASS |

## RELAY / CARE / PEOPLE / DOCUMENTS

MedixWeb shell + teal system present on public 23e2ae0. No reversion to orange primary CTAs observed on Today.

## OpenAI / intelligence (not visual)

Live path `llm` + `openai` remains **429 quota** externally blocked.
