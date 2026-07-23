# Research Data Handling Protocol

**Type:** Operational project policy (not a legal compliance certification)  
**Updated:** 2026-07-22 (founder gate resolution)  
**Applies to:** First caregiver research cycle / Session 1+

See also: `FOUNDER_DECISIONS_SESSION_1.md`

## Cycle 1 recording policy (RESOLVED)

| Medium | Decision |
| --- | --- |
| Audio | **OFF** |
| Video | **OFF** |
| Screen | **OFF** |

Capture: moderator observation notes · task timing · interaction counts · task success/failure · navigation/confusion · optional short quotes **only with explicit quote permission**.

## What MAY go in Git

- Blank templates  
- De-identified synthesized findings  
- Design decisions  
- Aggregate / non-identifying metrics  
- Participant **codes** (e.g. CG-001)  
- Research traceability / retest evidence  
- Recruitment **templates** (not filled with contacts)

## What MUST NOT go in Git

- Real names  
- Phone numbers / emails  
- Real PHI  
- Raw identifying moderator notes  
- Recordings  
- Signed consent forms  
- Identifying recruitment/contact lists  

## Participant codes

`CG-001`, `CG-002`, … (family) · `SC-00N` · `PC-00N` · `CR-00N`  
**Do not** encode identity into codes.

## Private research storage (RESOLVED for Cycle 1)

| Field | Value |
| --- | --- |
| Decision | **A — local storage outside Git** |
| Path | `/Users/genghishameha/CaretakerRelayResearch` |
| Subfolders | `consent/` · `session-notes/` · `recruitment-private/` · `archive/` |
| Description | **PRIVATE LOCAL RESEARCH STORAGE OUTSIDE GIT** |
| OS note at setup | macOS **FileVault: On** (full-disk encryption reported by OS) |
| Not claimed | HIPAA · certified vault · institutional approval · legal sufficiency |

**Founder still should confirm:** FileVault remains enabled; account access limited to research personnel.

### After Session 1 — where notes go

1. Complete observation sheet during/immediately after session.  
2. Store completed sheet + consent record under the private path (by participant code folders if useful).  
3. Git may later hold **de-identified** findings only under codes.  
4. Never commit private folder contents into any NIOV repo.

## Retention (RESOLVED formative project policy)

| Data | Policy |
| --- | --- |
| Identifying recruitment contact | Keep only while needed for recruitment/follow-up; delete when no longer operationally necessary |
| Raw moderator notes | Through Cycle 1 synthesis/clarification; then de-identify/synthesize and remove identifying raw material when no longer necessary |
| Consent record | Outside Git for duration needed to support research record; no invented statutory period |
| De-identified findings | May remain durable project evidence |
| Aggregate metrics | May remain durable project evidence |
| Design decisions / traceability | Remain durable project artifacts |

If an organization later imposes calendar statutory retention: **FOUNDER / ORGANIZATIONAL POLICY REVIEW REQUIRED** for override.

## Consent operational record (outside Git)

Capture privately:

- participant code  
- information reviewed  
- participation consent YES/NO  
- quote permission YES/NO  
- date  
- moderator/founder acknowledgment  

## Ethics / IRB honesty

If under institution, university, health system, funded program, or organization with human-research review requirements, **confirm applicable policy before beginning**.  
Do **not** claim exemption or IRB approval without that confirmation.

## Product failure notes

Record as research data under participant code in private notes; de-identified summary may enter findings register.
