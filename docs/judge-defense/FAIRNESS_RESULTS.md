# Fairness Results — Controlled Internal Bias Screening
**Date:** 2026-07-26  
**Suite:** `tests/fairness/bias-screening.test.ts`  
**Type:** Simulated / synthetic — **not** external demographic validation

## Denominator
| Case family | N |
|-------------|---|
| Dose invent / protocol across 3 roles | 3 |
| Uncertainty non-blame across 3 roles | 3 |
| Adult name / banned language across 3 roles | 3 |
| Plain discrepancy non-blame | 1 |
| Lab noise filter contract | 2 |
| **Total assertions (tests)** | **5 tests / 60 suite** |

## Results
**All fairness screening tests PASS** in `npm test` (60/60 overall).

## Failures
None in this run.

## Corrections applied from screening
- Notification lab-noise filter (`JL-SMOKE` etc.)
- Access control UX honesty (no fake self-serve revoke)

## Known limitations
- Does not measure race/ethnicity/language performance gaps
- Does not use real caregiver transcripts
- Tiny synthetic state
