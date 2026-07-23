# Caretaker Relay — agent instructions

## CARETAKER RELAY UI VISUAL AUTHORITY

MedixWeb reference analysis under `docs/design/`.

**Read before changing application UI:**

- `docs/design/MEDIXWEB_VISUAL_REFERENCE_ANALYSIS.md`
- `docs/design/CARETAKER_RELAY_MEDIXWEB_MAPPING.md`
- `docs/design/CARETAKER_RELAY_MEDIXWEB_FIDELITY_REVIEW.md`

Pixel-inspected MedixWeb frames (not generic healthcare blue guesses) govern composition, glass, spacing, and palette. Do not invent a competing visual system.

Local image refs: `docs/design/medixweb-refs/medixweb-{1..7}.png`.

## PERMANENT CHATGPT HANDOFF RULE

After **every** substantial Caretaker Relay engineering campaign, audit, deployment, closure run, redesign, or test campaign, automatically regenerate:

`/Users/genghishameha/Downloads/CARETAKER_RELAY_CHATGPT_REVIEW.txt`

The founder must **not** need to ask for this again.

### When

Generate the export **after** actual work/test/deployment state is finalized — from repository, filesystem, test, and deployment evidence — not from conversational memory alone.

### Required sections

- CURRENT STATE  
- CURRENT GIT HEADS  
- DEPLOYED SHAs  
- EXACT CHANGES  
- TEST RESULTS  
- LIVE PRODUCT EVIDENCE  
- CURRENT GAPS  
- P0 / P1 / P2 / P3  
- RECRUITMENT STATE  
- FOUNDER WALKTHROUGH STATUS  

When applicable also include:

- LIVE MODEL EVIDENCE  
- MULTI-BROWSER EVIDENCE  
- INVITATION EVIDENCE  
- CORRECTION / SUPERSESSION EVIDENCE  
- AUTHORIZATION RED TEAM  
- CHAOS / FAILURE  
- PRISMA DURABILITY  
- UI/UX SCREENSHOT INDEX  
- DESIGN MAPPING  

### Automatic verification

Confirm before finishing:

- file exists  
- line count  
- byte count  
- SHA256  
- required sections present  
- secrets / PHI scan clean  

### Terminal output only

Never dump the full report into the terminal. Final output should be:

```
CHATGPT REVIEW:
READY

FILE:
/Users/genghishameha/Downloads/CARETAKER_RELAY_CHATGPT_REVIEW.txt

LINES:
<count>

BYTES:
<count>

SHA256:
<hash>

SECRETS/PHI:
PASS
```

This rule applies permanently unless the founder explicitly revokes it.

## Track / product constraints (summary)

- Track 1 caregiver AI only; Track 2 out of scope unless re-authorized.  
- Do not touch `niov-foundation`, `otzar-*`, Otzar Render, or Otzar Postgres.  
- No secrets in commits or terminal dumps.  
- Recruitment remains PAUSED unless founder authorizes.  
- Caregiver / care-recipient research input stays NONE until authorized.  
