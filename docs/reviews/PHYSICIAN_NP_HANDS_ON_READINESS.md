# Physician / NP Hands-On Readiness

**Updated:** 2026-07-25 (post crash recovery)  
**Public:** https://care.niovlabs.com  
**API SHA:** `327d543` · **APP SHA:** `dcadd81`

## Purpose

Physicians and NPs must not experience “caregiver UI with a doctor login.”  
Same underlying care-truth model; different framing, note kinds, and authority.

## Lab principals

| Principal | Roles | Care access |
|-----------|-------|-------------|
| Dr. Priya Shah (`p-dr-shah`) | `provider`, `physician` | Evelyn (`cr-olivia`) care team |
| (NP) | Use physician/provider role labels for lab; noteKind maps provider/NP/nurse → `provider_update` | Same membership rules |

There is no separate synthetic NP account. NP/clinical staff are covered by role-label mapping:

- `noteKindForRole`: physician | provider | doctor | clinician | **np** | **nurse** → `provider_update`
- Manual Care documentation panel surfaces role as “Provider update”
- Relay `STATUS_SYNTHESIS` returns **clinical-facing** framing for provider personas (provenance, REPORTED vs diagnosis, unresolved review)

## Hands-on checklist (public API proven)

| Journey | Expected | Evidence |
|---------|----------|----------|
| Login as Dr. Shah | Role provider/physician | lab-login + `/api/v1/care/me` |
| “How is Evelyn doing?” | Clinical-facing synthesis, not identical family paragraph | Public answer (role branch) |
| Caregiver wellbeing | REPORTED observation, not diagnosis | understand + confirm path |
| Medication regimen | Authorized instruction + provenance (Dr. Shah for Evelyn) | answer / Care med surfaces |
| Robert | Not authorized unless on Robert’s team | membership |
| Documentation | Manual path → Preview → Save → CARE_NOTE_V1 `provider_update` | CarePage ManualCareNotePanel |
| Correct something | Correction mode + re-verify; original preserved | App startCorrection + `/api/v1/care/corrections` |
| Authority | Domain-specific REPORT/AUTHOR/CONFIRM | `docs/architecture/CARE_INFORMATION_AUTHORITY_MATRIX.md` |

## What is intentionally not claimed

- Live EHR import (care packet **request** only — honest empty/onboarding)
- Live OpenAI synthesis when quota exhausted (structured fallback used)
- Separate branded NP product shell (same product; role-aware copy + note kinds)

## Readiness verdict

**READY for lab physician/NP hands-on** with:

1. Role-aware Relay framing  
2. Provider documentation path on same care record model  
3. Provenance-preserving corrections  
4. Membership isolation  

**Not ready to claim:** full clinical EHR write-back or multi-org NP roster beyond lab seed.
