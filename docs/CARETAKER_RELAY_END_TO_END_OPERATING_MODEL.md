# Caretaker Relay — End-to-End Operating Model

**Status:** Authoritative product architecture (founder contract 2026-07-23)  
**Competition:** ACL Caregiver AI Challenge · **Track 1** · Phase 1 Design  
**Canonical URL:** https://care.niovlabs.com

## Non-negotiable principle

Caretaker Relay must feel like **the confusion disappeared** — not like another care-management app.

**All signal. No noise.**

Sequence:

```text
CAREGIVER NEED → USER EXPERIENCE → INFORMATION ARCHITECTURE
→ AI BEHAVIOR → SAFETY / HUMAN CONTROL → DATA / AUTHORITY → CODE
```

## Fundamental model

| Element | Meaning |
| --- | --- |
| One **care recipient** | Human being receiving support |
| One **governed care space** | Shared continuity for that person |
| Multiple **authorized people** | Family, friends, professional caregivers, health contacts |
| One **current care picture** | Today / Care truth |
| **Relay** | AI intelligence (not a human) |
| Multiple **safe outputs** | Handoffs, messages, documents |

## Synthetic household (only)

| Role | Name | Kind |
| --- | --- | --- |
| Care recipient | **Evelyn Carter** | care_recipient |
| Primary family caregiver | **Marcus Carter** | family_caregiver |
| Additional lay caregiver | **Maya Bennett** | family_caregiver / friend |
| Professional caregiver | **Daniel Kim** | paid / direct-care |
| Health professional | **Dr. Priya Shah** | provider |

Do **not** use Olivia, Olivia Lewis, or the founder’s family names in product, fixtures, docs, or screenshots.

## Four always-answerable questions

1. Who am I?  
2. Who am I helping?  
3. What matters now?  
4. What happens next?

## Identity triad

Always distinguish:

- **Current user** (e.g. Marcus · Family caregiver)  
- **Care recipient** (Evelyn Carter)  
- **Other people helping** (Maya, Daniel, Dr. Shah)

## Continuity flows (all first-class)

Family → family · Friend → family · Spouse → adult child · Family → professional · Professional → family · Professional → professional.

**Not Track 1:** staffing, shift coverage, overtime, utilization, HR, payroll.

## Truth states (plain language)

CONFIRMED · REPORTED · NEEDS CHECKING · CORRECTED · UNKNOWN  

No internal epistemic jargon in UI.

## Handoff lifecycle

PREPARED → NEEDS REVIEW → READY → SHARED / AVAILABLE → READ (only when proven).

Never claim SENT/DELIVERED/READ without proof.

## Documents safety

AI may make a lay report **professionally readable**.  
AI must never make it **professionally authoritative**.

Layers: human source · AI-assisted clarity · human verification · audience-appropriate export.

## Magic loop

Natural multi-event speech → structured care items → human verifies consequential parts → durable care truth → downstream handoff/docs/messages update.

## Recruitment

**PAUSED** until founder approves this full experience live.
