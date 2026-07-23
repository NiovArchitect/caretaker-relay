# Research Data Handling Protocol

**Type:** Operational project policy (not a legal compliance certification)  
**Date:** 2026-07-22  
**Applies to:** First caregiver research cycle / Session 1+

## Cycle 1 recording policy (default)

| Medium | Default |
| --- | --- |
| Audio | **OFF** |
| Video | **OFF** |
| Screen | **OFF** |

Session 1 uses: **moderator observation notes**, **task timing**, **task counts**, **optional quotes with permission**.

Founders may change this only explicitly for later sessions with updated consent.

## What MAY go in Git

- Blank templates  
- De-identified synthesized findings  
- Design decisions  
- Aggregate / non-identifying metrics  
- Participant **codes** (e.g. CG-001)  
- Recruitment **templates** (not filled with contacts)

## What MUST NOT go in Git

- Real names  
- Phone numbers / emails  
- Real PHI / health details of real people  
- Raw identifying moderator notes  
- Recordings  
- Signed consent forms  
- Identifying recruitment/contact lists  

## Participant codes

Use sequential codes such as:

- `CG-001`, `CG-002` — family caregivers  
- `SC-001` — secondary caregivers  
- `PC-001` — professional home caregivers  
- `CR-001` — care recipients  

**Do not** encode identity, clinic, or location into codes.

## PRIVATE RESEARCH STORAGE — MUST BE SELECTED BEFORE SESSION 1

**FOUNDER / ORGANIZATIONAL DECISION REQUIRED.**  
Do not invent a cloud provider or claim one exists.

### Choose one (or describe equivalent)

| Option | Description |
| --- | --- |
| **A** | Encrypted local folder **outside** this Git repository |
| **B** | Access-controlled organizational drive (org-managed) |
| **C** | Approved research repository (if your organization provides one) |

### Minimum requirements for the chosen location

- Not public  
- Not the Caretaker Relay Git repo  
- Access limited to research personnel only  
- Device/account protection (login, encryption where feasible)  
- Deletion/retention procedure documented (see below)

### Founder decision record (fill before Session 1)

```text
SELECTED OPTION: A / B / C / OTHER: ________
PATH OR SYSTEM NAME (private, not for public docs if sensitive): ________
ACCESS LIMITED TO: ________
ENCRYPTION / PROTECTION NOTES: ________
DATE DECIDED: ________
DECIDED BY: ________
```

### After Session 1 — where the observation sheet goes

1. Complete observation sheet during/immediately after session.  
2. Store the **completed** sheet (and any paper consent) in the **private storage location above**.  
3. In Git-tracked `PARTICIPANT_TRACKING_TEMPLATE` / findings, store only **codes** and de-identified content.  
4. Reference private storage with a non-identifying pointer if needed (e.g. “notes in private research folder CG-001”).

## Retention decisions — FOUNDER / ORGANIZATIONAL DECISION REQUIRED

Do **not** invent legal retention periods. Fill before Session 1:

```text
RAW MODERATOR NOTES RETENTION: ________ (e.g. keep until cycle synthesis complete / date TBD)
CONSENT RECORD RETENTION: ________
DE-IDENTIFIED FINDINGS RETENTION: ________ (often longer; design history)
PARTICIPANT CONTACT INFORMATION RETENTION: ________ (minimize; store outside Git only)
DELETION METHOD WHEN RETENTION ENDS: ________
```

## Ethics / IRB honesty

If this work is under an institution, health system, university, funded program, or organization with human-research review requirements, **confirm applicable policy before beginning**.  

- Do **not** claim regulatory exemption without that confirmation.  
- Do **not** claim IRB approval unless granted.

## Product failure notes

Prototype failures are research data. Record under participant code in private notes; de-identified summary may enter findings register.
