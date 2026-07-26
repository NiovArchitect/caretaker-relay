# Competitive Care Product Patterns (2026-07-26)

Research is pattern-level (public product positioning), not scraped private UIs.

| Product / class | Patterns worth learning | Boundaries for Relay |
|-----------------|-------------------------|----------------------|
| CaringBridge / care update journals | Simple updates to circle; invitation model | Not clinical truth; Relay needs provenance |
| Lotsa Helping Hands / meal trains | Task signup, coverage calendar for private circles | Private coverage yes; no public marketplace |
| Apple Health / emergency Medical ID | Blood type, contacts, conditions with user control | Provenance + verified-only for clinical-ish fields |
| CareZone / Medisafe class | Med lists, reminders | Relay confirms human-verified; no auto-prescribe |
| EHR patient portals | Role hierarchy, break-glass rare | Too heavy for family UX; avoid portal jargon |
| Home health agency software | Shift accept/decline, qualifications | Org-managed workforce = future; not Phase 1 |
| HIPAA messaging (TigerConnect class) | Role-scoped messaging | Coordination mode separate from Relay AI |

## Adopted for Phase 1

1. **Private care-circle coverage request** (Lotsa-like) without marketplace claims  
2. **Primary-only invite authority** with join-by-code  
3. **Emergency snapshot with disclaimer + provenance**  
4. **Empty/lightweight space as intentional progressive onboarding**  
5. **Unmistakable person-destination messaging** (“Message Maya about Evelyn”)

## Explicitly rejected

- Public caregiver marketplace  
- Dispatch / “we’ll find someone now”  
- Inferring blood type or diagnoses  
- Developer/compliance prose on every screen  
