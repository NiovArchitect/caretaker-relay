# FINAL PHYSICIAN REPAIR DIFF REVIEW

**Controller:** Agent Zero  
**At:** 2026-07-31  
**Rule:** Only physician-validation product files enter the commit. Unrelated working-tree noise is excluded.

## Included in physician repair commit (app)

| Path | Purpose | Finding IDs | Canonical object | API | UI | AuthZ | Privacy | A11y | Migration | Tests | Risk | Final? |
|------|---------|-------------|------------------|-----|----|-------|---------|------|-----------|-------|------|--------|
| `src/lib/relay/requestClass.ts` | Clinical retrieve classification; shift-plan shape; new-fact CARE_REPORT | DR1-F19, F16, F21, F27 | Request class | No | Relay path | No | No | N/A | No | local unit | Med | Yes |
| `src/App.tsx` | Retrieve must not use med-entry gap copy | DR1-F19, F20 | Client understand fallthrough | No | Relay copy | No | No | N/A | No | local | Low | Yes |
| `src/foundation/careClient.ts` | claimCareWorkItem humanize / no JSON | DR1-F22, F30, F31 | Work item claim | Uses claim API | Error text | No | No | Error alert | No | pending public | Med | Yes |
| `src/pages/TodayPage.tsx` | Identity/safety strip + H&P + claim next step + code provenance | DR1-F02–F06, DR2-F01–F05, F30 | Profile projection | Read profile | Today | Label by role | Field visibility partial | aria-expanded | No | pending | Med | Yes |
| `src/styles/global.css` | Identity strip styles | DR2-F01 | UI | No | Yes | No | No | Contrast partial | No | build | Low | Yes |
| `vendor/care-domain/**` (intents, recipient-profile, relay-answer, answer-engine, types) | Server-owned clinical retrieve + med completeness + advance-care model | DR1-F19–F23, F11, F07, F28 | Care domain | Answer API when deployed | Indirect | No | Code-status provenance | N/A | Additive profile fields | unit templates | Med | Yes |
| `docs/clinical/**` | Verbatim + register | Process | Docs | No | No | No | No | No | No | N/A | Low | Yes |
| `docs/product/FINAL_*` physician contracts | Acceptance | Process | Docs | No | No | No | No | No | No | N/A | Low | Yes |
| `docs/testing/FINAL_*` physician banks | Evidence | Process | Docs | No | No | No | No | No | No | N/A | Low | Yes |
| `docs/reviews/*PHYSICIAN*` / clinical freeze | Freeze decision | Process | Docs | No | No | No | No | No | No | N/A | Low | Yes |
| `docs/research/*` physician | Reference stack | DR1-F24 | Docs | No | No | No | No | No | No | N/A | Low | Yes |
| `docs/incidents/FINAL_DOCTOR_*` | Baseline/repro | Process | Docs | No | No | No | No | No | No | N/A | Low | Yes |

## Foundation repo included

| Path | Purpose | Findings |
|------|---------|----------|
| `packages/care-domain/src/types.ts` | advanceCareDocuments provenance model | DR1-F07, F28, F36 |
| `packages/care-domain/src/services/recipient-profile.ts` | answerClinicalRetrieve + code status | DR1-F19–F21, F23 |
| `packages/care-domain/src/services/relay-answer.ts` | Server short-circuit clinical retrieve | DR1-F19, F23 |
| `packages/care-domain/src/relay/intents.ts` | Clinical retrieve intents | DR1-F19 |
| `packages/care-domain/src/relay/answer-engine.ts` | Complete medication answer block | DR1-F11, F12, F34 |

## Explicitly excluded from this commit

- `docs/design/screenshots/**` mass PNG dumps  
- Unrelated freeze scorecards / e2e torture / holistic smoke edits  
- `AGENTS.md` incidental edits  
- Otzar / niov-foundation noise outside caretaker repos  
- Historical July 26 freeze records (keep as history only)

## Commit criteria

- UNEXPLAINED FILE CHANGES: 0 (in commit set)  
- UNRELATED CHANGES INCLUDED: 0  
- DIRTY PRODUCT FILES AFTER COMMIT: expected only for non-physician residual tree  

## Deploy gate

Render API unauthorized in this session (`render login` expired; `RENDER_API_KEY` rejected).  
Push to GitHub may succeed; **public deploy requires founder/Render access**.
