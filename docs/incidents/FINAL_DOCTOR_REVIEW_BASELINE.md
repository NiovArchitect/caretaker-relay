# FINAL DOCTOR REVIEW BASELINE

**At:** 2026-07-30 / 2026-07-31 UTC  
**Controller:** Agent Zero  
**Public app:** https://care.niovlabs.com  
**Public API:** https://caretaker-relay-care-api.onrender.com  

## Deploy targets (campaign)

| Layer | Expected SHA (campaign) | Observed pre-repair |
|-------|-------------------------|---------------------|
| App source/deploy | `eb3262b08e62c291c8f6e0bbe1346dfa4af2b008` | Bundle `index-BoPQZ519.js` (last-modified ~2026-07-31 00:36 UTC) — exact SHA not embedded in HTML |
| API source/deploy | `7d648374a2c4e89f8f441b5384487d4b509daf4e` | Health OK; lab-login route 404 (regulated_restricted); no public version endpoint |

## Public health (API)

```json
{"ok":true,"service":"caretaker-relay-care-api","product_id":"caretaker-relay","care":{"durable":true,"store_backend":"prisma"},"deployment_config":{"deployment_mode":"regulated_restricted","lab_login_enabled":false}}
```

## Known defects at baseline (physician-observed classes)

1. Clinical retrieve → medication-entry clarification language  
2. Oxygen question can steal appointment path  
3. I can help may surface JSON / opaque claim errors  
4. Identity/safety strip incomplete on Today  
5. H&P progressive disclosure missing  

## Local repair stack (not yet public)

| Repo | Changes |
|------|---------|
| caretaker-relay | requestClass clinical retrieve; App.tsx retrieve gap copy; claimCareWorkItem humanize; Today identity strip + H&P; claim next-step |
| caretaker-relay-foundation | intents clinical retrieve; answerClinicalRetrieve; relay-answer short-circuit |

## Auth for live browser bank

`lab_login_enabled: false` on public → dual-org / full live Relay bank remains **EXTERNAL_BLOCKED_OR_NOT_SEEDED** for automated public login in this session unless founder provides authorized session.
