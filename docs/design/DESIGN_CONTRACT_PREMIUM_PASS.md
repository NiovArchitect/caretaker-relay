# Caretaker Relay — Design Contract (Premium UI/UX Unfreeze)

**Authority:** Design Division + Agent Zero orchestration  
**Scope:** Frontend presentation only (`src/styles/global.css` primary)  
**Brand DNA:** MedixWeb powder sky / deep teal ink / clinical glass — preserved  
**North star:** Apple-level surface polish meets premium medical intelligence  

---

## 1. Overall aesthetic

- Calm, sterile light stage with soft sky radial depth
- Floating glass product shell; content planes layered by purpose
- Luxury restraint: no rainbow, no gimmick motion, no generic SaaS purple
- Trust first: clarity of action, honest empty states, consequential verify warmth

## 2. Color application principles

| Role | Token family | Rule |
|------|--------------|------|
| Stage | `--cr-stage-*`, sky | Ambient only; never on body text |
| Ink | `--cr-ink` → `--cr-ink-4` | Hierarchy by opacity of teal-ink, not gray neutral SaaS |
| Accent | `--cr-accent`, `--cr-accent-2` | Primary actions, focus, active nav |
| Warm / verify | `--cr-warm`, `--cr-warn` | Attention and confirmation only |
| Comm | `--cr-comm` | Person-to-person messaging |
| Danger | `--cr-danger` | Destructive only |
| OK | `--cr-ok` | Live/connected/success |

Never use accent color alone for meaning — pair with label, icon, or shape.

## 3. Glass / frost rules

| Level | Use | Opacity / blur |
|-------|-----|----------------|
| Stage glass | Shell, login panel | Strong blur (28–48px), white 0.42–0.78 |
| Float glass | Cards, chips, menus | Blur 16–24px, white ≥0.55 |
| Panel glass | Relay rail, topbar | Blur 20–40px, subtle edge |
| Solid | Forms focus, high-read | Near-opaque white for long text |

Rules:
- Always pair frost with **1px glass edge** + **inset top highlight**
- Never pure white slabs without edge definition
- Prefer readable ink over maximum translucency

## 4. Shadow rules

- Stage / shell: multi-layer soft teal-blue depth (`--cr-shadow-shell`)
- Cards: tight + medium (`--cr-shadow-card`)
- Float menus / hero: elevated (`--cr-shadow-float`)
- Active / verify: accent-tinted (`--cr-shadow-active`)
- No harsh pure black shadows

## 5. Border rules

- Default line: `--cr-line` (teal-ink at low alpha)
- Strong: `--cr-line-strong` for inputs / secondary CTAs
- Glass edge: white alpha for frosted edges
- Semantic left rail (3px) for notify / verify / coord accent — not color alone

## 6. Blur rules

- Shell: `--cr-blur-strong` (40px)
- Cards/panels: 16–28px
- Scrims: light blur only (4–8px)
- Respect `prefers-reduced-motion` (no animated orbs if reduced)

## 7. Corner radius strategy

| Token | Size | Use |
|-------|------|-----|
| `--cr-r-xs` | 10px | Badges, small blocks |
| `--cr-r-sm` | 14px | Nested cards |
| `--cr-r-md` | 20px | Sections, inputs |
| `--cr-r-lg` | 28px | Heroes, drawers |
| `--cr-r-xl` | 36px | Shell |
| `--cr-r-pill` | 999px | Buttons, chips, tabs |

## 8. Spacing system

4pt base: `--s-1`…`--s-11`. Prefer multiples of 4. Section padding `--s-6`; workspace `--s-7`.

## 9. Typography hierarchy

- Display / hero recipient: large, weight 700, tracking −0.035em
- Title (h1): `--t-title`
- Section (h2): `--t-section`, no all-caps section titles in content
- Body: 1rem / 1.5
- Meta / kickers: uppercase micro labels only for system chrome

Font: SF Pro / Inter / system-ui stack.

## 10. Button hierarchy

1. **Primary** — teal gradient, white label (main progressive action)
2. **Secondary** — glass light, teal text
3. **Verify** — warm amber (consequential confirm)
4. **Comm** — clinical blue-teal (message/call)
5. **Success / Danger** — semantic only
6. **Ghost** — text-only accent

Min tap: 48px. Hover: −1px lift. Active: settle. Disabled: 0.45 opacity.

## 11. Card hierarchy

1. Hero environment (today sky glass)
2. Section plane (primary content)
3. Nested attention / verify item
4. List rows / bubbles

## 12. Navigation

- Desktop: icon rail, solid active pill with shadow
- Mobile: bottom nav, soft active fill
- Topbar: sticky frost, recipient chip as primary context

## 13. Motion philosophy

- Duration 160–240ms; ease `cubic-bezier(0.22, 1, 0.36, 1)` for entrances
- Lift on hover; no bounce; no endless decorative animation except subtle live/notify pulses
- `prefers-reduced-motion: reduce` disables animation/transition

## 14. Icon treatment

Soft rounded icon wells; active nav wells use accent-soft fill. Icons support meaning; never sole indicator of urgency.

## 15. Form styling

Frosted field fills, 16px radius, focus ring via accent-soft halo (4px). Labels 0.8rem semi-bold ink-3.

## 16. Table / list styling

Hairline separators (`--cr-line`); generous row padding; no dense spreadsheet chrome.

## 17. Trust and safety tone

- Honest empties (“no handoff yet”)
- Verify path visually distinct from chat
- Connection status visible
- No playful error copy that undermines care seriousness

## 18. Inclusive visual rules

- No stock-photo dependency for product chrome
- Avatar initials, not stereotyped imagery
- Color never sole channel; contrast AA for text/actions
- Coord accents are secondary to name labels

## 19. Anti-generic rules

**Prohibited:** purple SaaS gradients, Inter-only “AI dashboard” look, random card grids without hierarchy, neon glass, bouncing loaders, dark-mode cosplay on medical light stage, decorative charts without care meaning.

**Required:** MedixWeb sky stage, teal ink, floating shell, verify warmth, Relay as elevated intelligence plane, recipient always in chrome.

## 20. What makes it feel premium / medical / branded

- **Premium:** multi-layer shadows, glass edges, gloss insets, disciplined type tracking  
- **Medical:** calm powder stage, clear hierarchy, restrained semantics  
- **Branded:** teal + sky DNA, Caretaker shell, Relay pulse  
- **Coherent:** one token system, one radius/spacing language  
- **Distinct:** care recipient chip + verify plane + coordination accents — not a generic admin template  

---

*Implementation vehicle: Presentation System v2 elevated (premium unfreeze pass).*

---

## 21. Finish-pass addenda (reconciled 2026-07-26)

### Glass forbidden when
- Long body text blocks requiring AA contrast on translucent wash (use solid-quiet / opaque white)
- Status critical alerts (prefer solid soft semantic fill)
- Nested glass > 2 levels deep on mobile (performance)

### Icon system (testable)
- Primary nav uses stroke SVG geometry only (`NavIcons.tsx`)
- No emoji as navigation glyphs
- Button glyphs may remain single-character with `.btn-glyph` for status actions

### Skeleton loaders (testable)
- Classes: `.cr-skeleton`, `.cr-skeleton-stack`, `.cr-skeleton-title|line|short`
- Shimmer disabled under `prefers-reduced-motion`

### Long-list density (testable)
- Notifications: `.notify-scroll` max-height ≤ 48vh with internal scroll
- Compact cards: `.attention-card-compact`
- Care panels: `.care-panel` with standardized padding/title

### Mobile drawer (testable)
- Closed: `pointer-events: none` + `visibility: hidden`
- Open: `.is-open` restores interaction; enhanced shadow + header frost

### Status bar
- Letter-spacing 0.01em; glass foot; hide ≤900px

### Anti-generic finish standard (PASS criteria)
1. Exact-build screenshot matrix exists (baseline + final)
2. No presentation-critical inline styles on Handoff/Relay/recipient chip
3. Geometric nav icons
4. Skeleton present on handoff/coord loading
5. Notification region scroll-contained
6. Mobile drawer does not intercept closed
7. Build + unit tests green
8. Product logic unchanged (jump-latest logic frozen)
