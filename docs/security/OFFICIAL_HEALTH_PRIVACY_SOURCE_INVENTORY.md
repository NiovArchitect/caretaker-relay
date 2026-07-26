# Official Health Privacy Source Inventory

**Retrieval date:** 2026-07-26  
**Product:** Caretaker Relay  
**Claim language:** HIPAA-READY TECHNICAL AND OPERATIONAL CONTROLS (not “HIPAA compliant”)

## Binding / statutory (US federal — counsel must confirm applicability)

| Source | Authority | Topic | URL pattern |
|--------|-----------|-------|-------------|
| HIPAA Privacy Rule | 45 CFR Part 160 & 164 Subpart E | Uses/disclosures, minimum necessary, personal representatives | hhs.gov/hipaa |
| HIPAA Security Rule | 45 CFR Part 164 Subpart C | Administrative, physical, technical safeguards | hhs.gov/hipaa |
| HIPAA Breach Notification Rule | 45 CFR Part 164 Subpart D | Breach notification to individuals/HHS/media | hhs.gov/hipaa |
| HITECH Act | Pub. L. 111-5 | Strengthened HIPAA enforcement, BA liability | hhs.gov |
| FTC Health Breach Notification Rule | 16 CFR Part 318 | Non-HIPAA health apps / PHR vendors | ftc.gov |
| ONC patient matching guidance | HHS ONC | Patient matching accuracy principles | healthit.gov |

## Official guidance (not substitute for legal determination)

| Source | Topic | Notes |
|--------|-------|-------|
| HHS OCR — Business Associates | Cloud / BA contracts | BAA required when acting as BA |
| HHS — Personal representatives | Family/friend access | Authority under state law + Privacy Rule |
| HHS — Minimum necessary | Access scope | Limit PHI to needed purpose |
| HHS — Audit controls | Security Rule §164.312(b) | Record and examine activity |
| NIST SP 800-63 | Digital identity | Authenticator AAL, identity proofing IAL |
| NIST Cybersecurity Framework | Risk management | Organize controls; not HIPAA cert |
| ACL Caregiver AI Challenge | Judging criteria / AI principles | Product/judging expectation, not law |

## Vendor-primary (BAA / AI)

| Vendor | Concern | Status in product |
|--------|---------|-------------------|
| Anthropic | LLM inference | Key present in care API deploy; **BAA EXTERNAL** |
| OpenAI | LLM fallback | Key optional; **BAA EXTERNAL** |
| Render | Hosting | Subprocessor; **BAA/DPA EXTERNAL** |
| Postgres host (current DATABASE_URL) | ePHI at rest | Encryption/ops **EXTERNAL verification** |
| Email/SMS provider | Verification delivery | **Not integrated** — contract pending |

## Classification key

- **Binding requirement** — statute/regulation if covered entity/BA status applies  
- **Official guidance** — HHS/NIST/ONC interpretive materials  
- **Security best practice** — NIST CSF, zero-trust patterns  
- **ACL judging expectation** — competition rubric  
- **Product decision** — Caretaker Relay design choices  
- **Legal interpretation requiring counsel** — CE/BA determination, state law  
- **Customer-contract requirement** — future BAAs with orgs  
- **External certification** — SOC 2, HITRUST, pentest — not claimed
