# Login and Setup Entry Performance

Measured on public Care API (warm after health):

| Step | Observed |
|------|----------|
| Health | ~1–3s cold, sub-second warm |
| Register | typically 1–4s after warm |
| State 403 check | <1s |
| Provisional create | <2s |

UI paint not instrumented in this pass; cold Render free-tier variance expected.
