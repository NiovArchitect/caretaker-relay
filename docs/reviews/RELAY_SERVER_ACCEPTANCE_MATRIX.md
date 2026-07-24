# Relay Server Acceptance Matrix

| Scenario | Expected | Status |
|----------|----------|--------|
| Server owns /answer | `authority: server`, domain `answerRelayQuestion` | Implemented |
| Client no competing engine | `answerCareQuestion` only HTTP/domain service | Implemented |
| Durable turns | CareUpdate RELAY_TURN_V1 | Implemented |
| Follow-up "it" | Focus from prior turn | Unit tested |
| Same question / new truth | Different answer after MAR change | Unit tested |
| Multi-recipient isolation | Robert ≠ Metformin/Evelyn | Unit + public |
| Cross-principal privacy | Marcus turns ≠ Maya list | Unit tested |
| Topic switch | Med after PT; "it" = med | Unit tested |
| Role-conditioned | family/dsp/physician differ | Unit tested |
| Deterministic fast-path | canDeterministic true for structured | Implemented |
| LLM synthesis | Bounded path; quota may block | Partial / blocked quota |
| Public E2E family multi-turn | After deploy | Required |
