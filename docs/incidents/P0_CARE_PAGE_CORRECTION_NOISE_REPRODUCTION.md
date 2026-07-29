# P0 Care page correction noise — reproduction

**Date:** 2026-07-29  
**Principal:** Marcus Carter  
**Recipient:** Evelyn Carter (`cr-olivia`)  
**Evidence:** `docs/incidents/evidence/p0-relay-canned-before/{today,history,projection,state}.json`

## Findings (public GET projections)

| Surface | “Correction: medication was not administered…” matches | Unique forms | Smoke/run markers |
|---------|----------------------------------------------------------|--------------|-------------------|
| projection | 35 | 17 | 158 |
| today | 38 | 11 | 92 |
| state | 44 | 17 | 155 |

Markers include patterns like `[AZms…]`, `[HOLms…]`, `[FMH…]` embedded in observation / correction display strings from synthetic smoke runs.

## Product failure

Primary Care surfaces treat each smoke-tagged correction instance as an independent current card, so the Corrections section looks like a harness log rather than one current corrected truth with expandable history.

## Required repair direction

- Projection filter: exclude / collapse synthetic smoke lineage from primary views.
- Correction supersession: one current card per semantic correction.
- Keep audit records; do not bulk-delete history.
- Defense-in-depth human-copy sanitizer for remaining markers.
