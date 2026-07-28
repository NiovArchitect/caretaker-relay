# Mobile care + Relay experience gap matrix

**Date:** 2026-07-28  
**Public runtime tested:** https://care.niovlabs.com (pre-repair deploy `342304e`)  
**Evidence:** `docs/incidents/evidence/relay-anchor-before/`

## A. Care-page category redundancy

| Surface | Present | Notes |
|---------|---------|-------|
| Static role priorities (`today-role-priorities`) | YES | Renders `roleXp.priorities`: What needs you / Appointments / Meals / Who is helping |
| Expandable accordion (`today-command-strip`) | YES | Same four titles with previews + expand |
| Orientation “Who is helping” (`coverage-panel`) | YES | Full coverage dump again |
| Lower “Coming up” / “What changed” | YES | Duplicates accordion appointments / wellbeing facts |

**Measured heading counts (390px, family caregiver):**

| Phrase | Count |
|--------|-------|
| What needs you today | 2 |
| Appointments & transport | 2 |
| Meals, mobility, mood | 2 |
| Who is helping | 3 |

**Required:** one expandable set only; collapsed previews summarize; expanded panels detail once.

## B. Relay response anchor

| Behavior | Current | Required |
|----------|---------|----------|
| On submit | User bubble appended; no thread scroll management | Anchor submitted question near top of thread viewport |
| Assistant reply | Appended after async; no placeholder; no scroll | Placeholder under question; answer starts immediately below |
| Scroll to bottom | Coordination has jump-latest; AI thread does not | Never blind scroll-to-bottom for AI answers |
| User reading older content | N/A for AI thread | “New response” control if user scrolled away |
| Streaming growth | Non-stream replace today | Preserve anchor; soft-follow only if still pinned |

## C. Why it still feels like compressed desktop

- Full orientation card + notification dumps + Coming up + What changed + pair grids still stack under the accordion  
- Mobile uses the same panels as desktop, not a purpose-built primary path  
- Overflow metrics can pass while cognitive load remains desktop-shaped  

## Repair order

1. Remove static category row  
2. Dedupe helping-now + landing duplicates on mobile  
3. Relay submit/answer anchor contract  
4. Public smoke + founder phone recheck  
