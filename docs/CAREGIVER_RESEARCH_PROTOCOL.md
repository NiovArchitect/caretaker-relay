# Caregiver Research Protocol (PREPARE ONLY)

**Status:** Infrastructure / protocol draft  
**Last updated:** 2026-07-22  
**Hard rule:** Do **not** invent caregiver validation results.  
**Slice Q:** Prepare real research — do not claim sessions occurred.

## Purpose

Support ACL Track 1 requirement for active caregiver involvement and real-world usability evidence **when real participants consent**.

## What is prepared (done)

| Artifact | Location | Status |
| --- | --- | --- |
| Traceability tags | `docs/CAREGIVER_RESEARCH_TRACEABILITY.md` | Ready |
| Lab vs validated metric labels | TRL card + BurdenMetrics | Ready |
| Synthetic golden dataset | care-domain golden v1.0.0+ | Ready |
| Protocol document | this file | Ready |
| Recruitment materials | Below templates | Draft |

## What has NOT been done

- No caregiver interviews conducted by this system  
- No care-recipient interviews  
- No usability sessions with humans  
- No `[CAREGIVER INPUT]` or `[VALIDATED]` evidence rows with real participants  

## Planned session types (future)

1. **Kitchen comprehension (15 min)** — Today surface understanding while multitasking  
2. **Care update dictation (20 min)** — speak/type update → verify → handoff  
3. **Access/privacy walkthrough (15 min)** — who can see what  
4. **Correction flow (10 min)** — “that’s wrong”  

## Consent principles (draft)

- Informed consent; voluntary  
- No real PHI in lab builds; use synthetic care recipient names  
- Participants may withdraw  
- Record only with explicit permission  
- Separate founder hypotheses from participant statements in traceability log  

## Recruitment note (template — not sent)

> We are evaluating a care coordination prototype for family and professional caregivers. Sessions last ~45 minutes. You will use synthetic scenarios (not your real care data). Feedback improves design. Participation is voluntary.

## Metrics collected in lab vs human sessions

| Metric | Lab now | Human later |
| --- | --- | --- |
| Steps to record update | Yes `[LAB RESULT]` | Yes → may become `[VALIDATED]` |
| Time to handoff | Yes lab | Yes with caregivers |
| Comprehension of verify panel | Not measured | Required |
| Trust / over-reliance | Not measured | Required |
| Accessibility feedback | Not measured | Required |

## Owner actions before first real session

1. Finalize IRB/ethics or equivalent as applicable  
2. Recruit ≥N caregivers (family + professional mix)  
3. Run sessions; store notes with participant IDs (not in public repo if sensitive)  
4. Update traceability with `[CAREGIVER INPUT]` only from real notes  
5. Never backfill fictional quotes  

## System cannot do this alone

Grok / automated agents prepare infrastructure only.  
Human founders run participant research and feed results back.
