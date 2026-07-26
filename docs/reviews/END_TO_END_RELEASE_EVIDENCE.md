# End-to-End Care Operating Experience — Release Evidence

**Date:** 2026-07-26  
**Campaign:** Complete Care Operating Experience  

## Source baseline (pre-campaign public)

| Component | SHA |
|-----------|-----|
| App public / recovered (P0) | `eea3d2cd0c16b7e1c0272e205f591467ab3656db` |
| API | `d8e4cd136e589a789439777a1b9a534096c49d6a` |

## Released SHAs (this campaign)

| Component | SHA | Notes |
|-----------|-----|-------|
| App source + deploy | `c5d346e813c3145bdc2d301c80b42b4ead8bb671` | Render `dep-d9j2u2l8nd3s73anqgi0` **live** |
| API source + deploy | `d8e4cd136e589a789439777a1b9a534096c49d6a` | unchanged this slice |

### Public smoke (2026-07-26)

URL: https://care.niovlabs.com  
Evidence: `docs/design/screenshots/public-e2e-experience/results.json`  
Result: **12 / 12 PASS** (login shell, invite authority, coverage, no technical-delivery copy, coord banner, Robert lightweight empty, blood type never guessed, care light banner).

## Implementation summary

### App changes
- People: permission-aware invite; coverage request; governance copy; Message → Coordination
- RelayPanel: destination banner “Message X about Y”; focus + scroll
- App: scroll relay panel on message person
- Today: Robert/lightweight empty-state paths
- Care: lightweight banner; emergency blood type policy; shorter emergency disclaimer; provenance
- Login: clearer entry paths; human product subcopy
- global.css: destination banner, empty space, staged brand-mark, form fields — no new scroll blur

### Docs
- `docs/architecture/CARE_OPERATING_MODEL.md`
- `docs/design/EXPERIENCE_OVERHAUL_CONTRACT.md`
- `docs/design/CARETAKER_RELAY_IDENTITY_REVIEW.md`
- `docs/research/ACL_CARE_OPERATING_RESEARCH.md`
- `docs/research/COMPETITIVE_CARE_PRODUCT_PATTERNS.md`
- `docs/reviews/ACL_END_TO_END_EXPERIENCE_MATRIX.md`
- this file

### API changes
None required for this experience slice (governance already server-enforced).

## Tests
See commit message / CI local run after ship.

## External remaining
- Real household field sessions
- Partner agency dispatch
- Full registration product
- Self-serve revoke UI
- Shift marketplace (intentionally out of scope)
