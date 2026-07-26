# Worker B — Frontend, Accessibility, Responsive (read-only)

**Runtime cap:** 15 min · **Permission:** read-only · **Stop:** after this artifact

## Selected exact agent files

| Path | Role | Responsibility | Authority | Phase | Output |
|------|------|----------------|-----------|-------|--------|
| `/Users/genghishameha/agency-agents/engineering/engineering-frontend-developer.md` | Frontend Developer | Class extraction, presentation-only TSX | RO/guide write | 5 | Clean components |
| `/Users/genghishameha/agency-agents/engineering/engineering-minimal-change-engineer.md` | Minimal Change | Smallest coherent diff | RO/guide | 5 | Diff discipline |
| `/Users/genghishameha/agency-agents/engineering/engineering-code-reviewer.md` | Code Reviewer | Diff review no logic drift | RO | 6 | APPROVED/REJECTED |
| `/Users/genghishameha/agency-agents/engineering/engineering-section-508-specialist.md` | Section 508 | Focus, contrast, keyboard | RO | 5–6 | A11y gates |
| `/Users/genghishameha/agency-agents/testing/testing-accessibility-auditor.md` | A11y Auditor | WCAG-oriented checks | RO | 6 | A11y PASS/PARTIAL |
| `/Users/genghishameha/agency-agents/engineering/engineering-mobile-app-builder.md` | Mobile Builder | Bottom nav + drawer patterns | RO | 5 | Mobile chrome rules |
| `/Users/genghishameha/agency-agents/testing/testing-performance-benchmarker.md` | Performance | Blur/shadow budget | RO | 6 | PERF note |
| `/Users/genghishameha/agency-agents/engineering/engineering-privacy-engineer.md` | Privacy | No PHI in screenshots labels | RO | 2,7 | Privacy note |
| `/Users/genghishameha/agency-agents/specialized/healthcare-aging-parent-care-companion.md` | Care companion domain | Trust tone for older caregivers | RO | 4 | Trust criteria |
| `/Users/genghishameha/agency-agents/healthcare/healthcare-clinical-evidence-agent.md` | Clinical evidence | Medical seriousness of UI | RO | 4,6 | Trust PASS |

## Implementation constraints

- No jump-latest / coordination / authority logic edits
- Presentation: CSS tokens, classes, layout, skeletons, icons
- Dynamic layout values only may remain inline
- `prefers-reduced-motion` must kill pulses/transitions
- `prefers-contrast: more` solidifies glass

## A11y requirements

- Focus rings visible (tokenized outline)
- Tap targets ≥ 48px primary; 36px secondary close OK with label
- Contrast: ink on glass ≥ AA for body text
- Color never sole status channel

## Responsive requirements

- ≤900px: bottom nav + Relay drawer
- Drawer: rounded leading edge, scrim, open transform
- Status bar hide on mobile already — keep

## Performance risks

- Multiple `backdrop-filter` layers can jank on low-end mobile → keep blur ≤ 48px, avoid nested blur chains on every list row
- Prefer CSS transforms for motion
