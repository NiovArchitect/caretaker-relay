# FINAL PHYSICIAN TEST FAILURE BASELINE

**Captured before repair.** Live product was `37668d2` / `0f455fc` with green public deploy but failing unit suites.

## Commands

- Foundation: `npm run test:care` → **7 failed / 352 passed**
- App: `npm test -- --run` → **5 failed / 93 passed**

## After repair (local)

- Foundation care: **359 passed / 0 failed**
- App: **98 passed / 0 failed**

See `docs/testing/FINAL_PHYSICIAN_TEST_FAILURE_LEDGER.json`.
