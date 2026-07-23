# Caretaker Relay ← MedixWeb Mapping

Maps MedixWeb **composition system** (from the seven inspected frames) onto Caretaker Relay **application surfaces**.  
Does **not** copy MedixWeb brand, logo, copy, or photography.

## Token mapping (pixel-derived)

| Token | Value | MedixWeb source |
|-------|-------|-----------------|
| `--cr-page` | `#E8F1F8` | Powder-blue stage behind floating shell |
| `--cr-page-deep` | `#D6E8F4` | Cooler stage gradient stop |
| `--cr-surface` | `#FFFFFF` | Content cards / shell |
| `--cr-surface-soft` | `#F4F9FC` | Soft content wash |
| `--cr-surface-glass` | `rgba(255,255,255,0.55)` | Light frosted panels |
| `--cr-surface-glass-strong` | `rgba(255,255,255,0.78)` | Stronger frosted nav/top |
| `--cr-surface-glass-hero` | `rgba(230,242,250,0.38)` | Hero glass over blue |
| `--cr-ink` | `#0B3A4A` | Deep teal headlines |
| `--cr-ink-secondary` | `#1A4A5A` | Strong body |
| `--cr-ink-muted` | `#5A6B75` | Meta / supporting |
| `--cr-accent` | `#1A7A8C` | Primary interactive teal |
| `--cr-accent-strong` | `#0D5A68` | Active / solid teal |
| `--cr-accent-soft` | `rgba(26,122,140,0.10)` | Hover / selected wash |
| `--cr-border` | `#C5D8E6` | Soft blue card border |
| `--cr-border-glass` | `rgba(255,255,255,0.55)` | Glass rim |
| `--cr-shadow` | soft blue-black multi-layer | Floating shell |
| `--cr-shadow-card` | lighter y=8–12 | Content cards |
| `--cr-success` | `#1B7A6A` | Calm clinical success |
| `--cr-warning` | `#C47B1A` | Needs attention (product safety; not MedixWeb yellow chips) |
| `--cr-radius` | `18px` | Card radius ≈ ref |
| `--cr-radius-lg` | `24px` | Shell / hero |
| `--cr-radius-pill` | `999px` | CTAs |
| `--cr-font-size-body` | `16px` | Caregiver accessibility (≥ ref body) |
| `--cr-font-size-h1` | `clamp(1.6rem, 2.2vw, 2rem)` | Calm large heading |

Published Dribbble yellow/olive chips are **not** mapped into primary chrome (not visible in frames).

## Surface mapping

| MedixWeb pattern | Caretaker Relay application |
|------------------|------------------------------|
| Powder-blue stage | `body` / page behind app shell |
| Floating white shell | `.app-shell` with large radius + soft shadow |
| Hero with lifestyle + glass stats | **Today** hero: Caring for Evelyn + caregiver identity + priority glass |
| Solid teal commitment card | Needs-attention / verify emphasis (warning tint for safety, teal chrome) |
| 2-up feature cards | What changed / What happens next pair |
| 3-up human cards | **People** member cards (names + roles only) |
| Quiet top nav + pill CTA | Topbar + Relay open as primary CTA |
| Values list | Care progressive disclosure sections |
| Frosted glass panel | **Relay** panel (intelligence floating over truth) |
| Deep teal footer | Status bar quieter; not heavy admin footer |
| Mobile single column | Bottom nav + stacked Today |

## Today hierarchy (required)

1. **Hero context (dominant)**  
   - Caring for **Evelyn Carter**  
   - Current caregiver **Marcus Carter** · Primary family caregiver  
2. **Priority layer** — Needs attention (elevated glass / verify surface)  
3. **Supporting quiet** — What changed | What Relay handled | What’s next | Who is helping (People link)

## Relay hierarchy

| Zone | Visual |
|------|--------|
| User input | Solid light composer on glass footer |
| Understood | White bubble with soft border |
| Known context | Quiet teal-tinted system notes |
| Uncertainty | Warning-tint limit text (not red panic) |
| Verification | Elevated verify panel with clear CTA |
| Result | System bubble after confirm |

## What we deliberately do **not** copy

- MedixWeb wordmark / logo mark  
- “Book Appointment” product CTA semantics  
- Hero photography of father/child  
- DNA particle illustration assets  
- Marketing blog grid as product nav  

## Accessibility deviations from pure marketing

| MedixWeb | Caretaker Relay choice |
|----------|------------------------|
| ~14px secondary type | Body 16px minimum |
| Decorative glass only | Glass + solid fallbacks for contrast |
| Marketing density low | Same, but touch targets ≥ 44px |
| No “needs attention” orange | Keep amber/orange affordance for consequential verify (documented product safety) |
