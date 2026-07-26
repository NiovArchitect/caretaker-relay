# Distributed Session & Configuration Audit

| Item | Status |
|------|--------|
| Process-local denylist | Retained as cache |
| Shared memory Map | Multi-instance test / single process |
| Redis adapter | Used when REDIS_URL and not test |
| Fail multi-instance w/o Redis | Production config error |
| Lab login production | Disabled unless CARE_LAB_LOGIN_ENABLED=1 and non-regulated |
| AI regulated | Fail closed / fixture fallback |
