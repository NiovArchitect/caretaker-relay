# FINAL COMPLETE MATRIX BASELINE

**Captured:** 2026-07-31T07:25:00Z  
**Controller:** Agent Zero

## Public runtime
- App: https://care.niovlabs.com · bundle `index-DNKXOTHH.js`
- API: https://caretaker-relay-care-api.onrender.com · health PASS
- App product SHA: `3af981bcec0cad5c45641f3539f9103268db90b6` (live product)
- App repo HEAD (docs): `f283bc709c62bc3431318b32d76b2e9a539d780e`
- API SHA: `c0b159e362ea79eaf6889945cce808b969157784`
- Deploys: app `dep-d9m495nlk1mc739o1n00` · API `dep-d9m4958ae00c73bdhc10`
- Deployment parity: YES
- Background workers: 0

## Units (required preserve)
- App: 98/98 PASS
- Care: 363/363 PASS

## Locked
Care-recipient self, 8 role fixtures, claim body repair, clinical retrieval, identity/H&P implementation, shift/med/clinical API banks.

## Canonical browser
- Command: `npm run test:e2e` → `playwright test --config=playwright.config.ts`
- Public override: `CR_E2E_BASE_URL=https://care.niovlabs.com CR_E2E_API_URL=https://caretaker-relay-care-api.onrender.com`
- Suite dir: `e2e/`
- Workers: 1 (serial, stateful)
