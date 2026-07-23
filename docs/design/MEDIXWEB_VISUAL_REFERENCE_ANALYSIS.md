# MedixWeb Visual Reference Analysis

**Authority:** Dribbble shot [MedixWeb — Modern Healthcare Website Design](https://dribbble.com/shots/26751165-MedixWeb-Modern-Healthcare-Website-Design-Medical-SaaS-Web)  
**Local refs:** `docs/design/medixweb-refs/medixweb-{1..7}.png`  
**Method:** Direct download + multimodal visual inspection of all seven frames.  
**Rule:** Pixels win over published copy and over published Dribbble color chips when they conflict.

## Palette reconciliation (critical)

Dribbble project color chips listed:

| Chip | Hex | Visible in the seven frames as UI chrome? |
|------|-----|-------------------------------------------|
| Bright yellow | `#FAF05A` | **No** |
| Yellow | `#F8EA2F` | **No** |
| Pale yellow | `#FCF69B` | **No** |
| Near-black green | `#0A1715` | **No** (ink is deep teal-navy, not olive-black) |
| Olive family | `#4C5D2C` `#A2A841` `#B4BD85` `#78863F` | **No** as surfaces/buttons |

**What the pixels actually use (dominant):**

| Role | Approx hex from frames | Usage |
|------|------------------------|--------|
| Page canvas | `#E8F1F8` → `#F4F8FC` | Soft powder-blue / off-white field behind floating shell |
| Hero / sky fill | `#5BA3D0` → `#7EB8D9` → white horizon | Full-bleed photographic blue sky |
| Deep teal ink | `#0B3A4A` → `#0D4A5C` | Headlines, active nav, dark cards, footer |
| Mid teal surface | `#1A6B7C` → `#2A8A9A` | Solid quote / commitment cards |
| White solid | `#FFFFFF` | App shell, content cards, CTAs on hero |
| Frosted glass | `rgba(255,255,255,0.18–0.42)` + soft blue tint | Stats, value chips, hero overlays |
| Glass border | `rgba(255,255,255,0.45–0.65)` | 1px light edge on floating glass |
| Muted body | `#5A6B75` → `#6B7C86` | Supporting copy on light fields |
| Soft blue border | `#D0E0EC` → `#C5D8E6` | Content-card outlines on white |

**Conclusion for Caretaker Relay:** Implement the **pixel-observed soft-blue medical glass system**. Do not force yellow/olive as primary chrome solely because Dribbble listed those chips. Document chips as non-dominant project metadata only.

---

## IMAGE 1 — Full marketing page (desktop board, 1905×1429)

| Field | Observation |
|-------|-------------|
| **PAGE/SECTION TYPE** | Multi-section marketing homepage: hero + about + values + total-care + testimonials + blog strip + deep-teal footer |
| **OVERALL COMPOSITION** | Floating white browser-frame card (~88–92% width) centered on powder-blue page; sections stack vertically with large white breathing room |
| **CONTENT WIDTH** | Inner content ~1100–1200px visual; hero full-bleed inside rounded frame |
| **OUTER GUTTERS** | ~4–6% page margin left/right of floating frame; soft blue shows as outer “stage” |
| **COLUMN STRUCTURE** | Hero: asymmetric L text / R photo. About: L particle DNA art + portrait / R copy + 2 feature cards. Values: L list / C photo / R solid teal quote. Testimonials: 3 equal cards. Blog: 3 equal cards |
| **CARD ARRANGEMENT** | 2-up feature cards; 3-up testimonials; 3-up blog; never equal-weight “dashboard grid” of 8+ |
| **VERTICAL RHYTHM** | Section gaps ≈ 64–96px; card internal padding ≈ 20–28px; headline → body gap ≈ 12–16px |
| **GLASS SURFACES** | Hero bottom-right: frosted white-blue panels over photo; opacity ~25–40%; not solid white |
| **BACKGROUND** | Stage: flat powder blue. Hero: photographic sky. Content: pure white. Footer: solid deep teal |
| **COLOR RELATIONSHIPS** | Deep teal text on white; white type on hero photo; teal solid cards for emphasis; no yellow chrome |
| **BORDER TREATMENT** | Soft 1px `#D0E0EC`-like on light cards; white rim on glass; no heavy 2px admin borders |
| **SHADOWS** | Soft multi-layer under floating shell: large diffuse y=20–40, low opacity (~8–12% black/blue); cards get lighter y=8–12 |
| **BLUR** | Hero glass reads as backdrop blur + desaturated blue fill; DNA particle is soft blur scatter |
| **CORNER RADII** | Shell ~20–24px; cards ~14–18px; pills ~999px; small chips ~12px |
| **BUTTON SHAPE** | Pill capsules; white fill + dark text on hero; white fill + teal circle arrow badge on primary CTA |
| **TYPOGRAPHY SCALE** | Hero H1 ~42–48px visual weight; section H2 ~28–32px; body ~15–16px; meta ~12–13px |
| **HEADLINE STYLE** | Semibold–bold, tight tracking (−0.02em), deep teal on white / white on hero |
| **BODY STYLE** | Regular weight, ~1.55–1.65 line-height, muted slate-blue-gray |
| **IMAGE POSITIONING** | Hero photo right 55%; clinical photos full-bleed inside rounded frames |
| **FLOATING ELEMENTS** | Entire page as floating card stack; glass stats float on photo; avatar stack over hero |
| **DEPTH/LAYERING** | Stage → shell shadow → white sections → elevated glass on photo → solid teal inserts |
| **WHITE SPACE** | Generous; never cramped admin density |
| **NAVIGATION** | Horizontal text links + active teal underline; right pill CTA |
| **CTA POSITIONING** | Nav right; hero mid-left under H1; secondary in values block |
| **LIGHT/DARK BALANCE** | ~80% light field; ~15% photo/blue; ~5% deep teal (footer/solid cards) |
| **RESPONSIVE CLUES** | Single column stack on mobile ref (image 7) |
| **PREMIUM FEEL** | Floating stage, restrained teal, glass over lifestyle photo, large type, sparse cards |

---

## IMAGE 2 — Two-column site board (1600×1720)

| Field | Observation |
|-------|-------------|
| **PAGE/SECTION TYPE** | Left: continuous homepage scroll. Right: cropped mid-page modules (values, total care, testimonials, blog, footer) |
| **OVERALL COMPOSITION** | Side-by-side editorial presentation of same system; reinforces floating white shell on powder blue |
| **CONTENT WIDTH** | Same shell language as image 1 |
| **OUTER GUTTERS** | Visible powder-blue frame around both columns |
| **COLUMN STRUCTURE** | Values: vertical list + photo + solid teal quote (3-zone). Footer: newsletter left + link columns |
| **CARD ARRANGEMENT** | 2-up about features; 3-up testimonials; 3-up blog thumbnails |
| **VERTICAL RHYTHM** | Large section titles centered; subcopy under H2 at ~14–15px muted |
| **GLASS SURFACES** | Same frosted hero stats; light cards nearly solid white with soft blue border |
| **BACKGROUND** | Powder blue stage continuous |
| **COLOR RELATIONSHIPS** | Deep teal H1 “Comprehensive Medical Care”; teal underline on active nav |
| **BORDER TREATMENT** | Values list rows: hairline separators, not boxes |
| **SHADOWS** | Soft under photo frames and cards |
| **BLUR** | Hero glass only |
| **CORNER RADII** | Consistent 16–20px photo frames |
| **BUTTON SHAPE** | Pill “Book Appointment” with circular arrow insert |
| **TYPOGRAPHY SCALE** | Section titles larger than app UI defaults (~1.8–2rem) |
| **HEADLINE STYLE** | Bold teal, sentence case, multi-line |
| **BODY STYLE** | Short paragraphs, muted, never dense paragraphs |
| **IMAGE POSITIONING** | Clinical photos edge-to-edge in rounded containers |
| **FLOATING ELEMENTS** | Portrait avatar floats over DNA particle field |
| **DEPTH/LAYERING** | Particle field behind portrait = depth without chrome |
| **WHITE SPACE** | Wide margins under section heads |
| **NAVIGATION** | Top of left column only |
| **CTA POSITIONING** | Bottom of values list |
| **LIGHT/DARK BALANCE** | Footer is the only large dark band |
| **RESPONSIVE CLUES** | Right column shows mid-scroll modules for reuse |
| **PREMIUM FEEL** | Editorial whitespace + one solid teal accent block per section |

---

## IMAGE 3 — Hero close-up floating shell (1905×1429)

| Field | Observation |
|-------|-------------|
| **PAGE/SECTION TYPE** | Isolated hero device mock on powder-blue studio field |
| **OVERALL COMPOSITION** | Single large white rounded rectangle (~80% width) with heavy soft shadow; background layers peek behind |
| **CONTENT WIDTH** | Hero fills the shell; content padded ~28–36px |
| **OUTER GUTTERS** | Large studio margin; other page fragments peek at edges (depth of site) |
| **COLUMN STRUCTURE** | Nav full width; body ~45% text / ~55% photo |
| **CARD ARRANGEMENT** | Two glass modules bottom-right (stat + 2×2 value grid) |
| **VERTICAL RHYTHM** | Logo row → trust row → H1 → CTA → bottom meta row |
| **GLASS SURFACES** | Stat card: translucent white-blue, readable white type; value grid: softer glass; selected chip solid white |
| **BACKGROUND** | Sky photo fills shell; outer stage powder blue |
| **COLOR RELATIONSHIPS** | White H1 on sky; dark slate “Comprehensive Care” title over blue gradient base |
| **BORDER TREATMENT** | Glass borders ~1px white/40%; shell outer border none (shadow only) |
| **SHADOWS** | Shell: very soft, large radius; glass: subtle inner rim highlight |
| **BLUR** | True frosted look on glass (photo bleeds through) |
| **CORNER RADII** | Shell ~22px; glass ~14–16px; CTA pill full |
| **BUTTON SHAPE** | White pill + dark circular arrow badge overlapping right edge |
| **TYPOGRAPHY SCALE** | H1 ~48px; trust line ~13px; meta ~12–13px; 97% metric ~36–40px bold |
| **HEADLINE STYLE** | White, weight ~600–700, 3 lines, tight leading |
| **BODY STYLE** | Meta under Comprehensive Care: smaller, white/80% |
| **IMAGE POSITIONING** | Father/child right; faces clear of glass |
| **FLOATING ELEMENTS** | Glass cards float above photo; avatar stack top-left of H1 |
| **DEPTH/LAYERING** | Photo base → blue gradient veil bottom → glass → white solid chips |
| **WHITE SPACE** | Left text column has large empty sky above trust row |
| **NAVIGATION** | Logo left; 6 text links; right CTA |
| **CTA POSITIONING** | Left under H1; secondary in nav |
| **LIGHT/DARK BALANCE** | Bright sky; soft darkening only at bottom third for type |
| **RESPONSIVE CLUES** | Carousel progress bar (white segment) under hero |
| **PREMIUM FEEL** | One object, deep soft shadow, glass over lifestyle photo, minimal chrome |

---

## IMAGE 4 — Compact dual board (752×564)

| Field | Observation |
|-------|-------------|
| **PAGE/SECTION TYPE** | Thumbnail of full system (hero + mid sections) |
| **OVERALL COMPOSITION** | Confirms same floating shell language at reduced size |
| **CONTENT WIDTH** | Proportionally identical to image 1 |
| **OUTER GUTTERS** | Powder blue frame still visible |
| **COLUMN STRUCTURE** | Same as image 1 at smaller resolution |
| **CARD ARRANGEMENT** | 2-up features remain readable |
| **VERTICAL RHYTHM** | Section spacing still large relative to type |
| **GLASS SURFACES** | Hero glass still distinguishable at small size |
| **BACKGROUND** | Soft blue |
| **COLOR RELATIONSHIPS** | Teal ink + sky blue only |
| **BORDER TREATMENT** | Soft blue card edges |
| **SHADOWS** | Soft shell shadow still present |
| **BLUR** | Glass still soft |
| **CORNER RADII** | Rounded shell |
| **BUTTON SHAPE** | Pills remain |
| **TYPOGRAPHY SCALE** | Hierarchy survives downscale (H1 still dominant) |
| **HEADLINE STYLE** | Bold white on hero |
| **BODY STYLE** | Collapsed but not black-on-gray admin |
| **IMAGE POSITIONING** | Hero photo dominant |
| **FLOATING ELEMENTS** | Glass modules |
| **DEPTH/LAYERING** | Stage → shell → content |
| **WHITE SPACE** | Maintained |
| **NAVIGATION** | Top of shell |
| **CTA POSITIONING** | Hero left |
| **LIGHT/DARK BALANCE** | Light-dominant |
| **RESPONSIVE CLUES** | System remains legible when scaled |
| **PREMIUM FEEL** | Hierarchy works even small |

---

## IMAGE 5 — Hero detail with stacked depth (2048×1536)

| Field | Observation |
|-------|-------------|
| **PAGE/SECTION TYPE** | Hero focus with partial pages above/below (layered portfolio presentation) |
| **OVERALL COMPOSITION** | Center shell dominates; background layers at ~40–50% opacity create depth |
| **CONTENT WIDTH** | Shell ~70–75% of frame |
| **OUTER GUTTERS** | Soft blue everywhere |
| **COLUMN STRUCTURE** | Same hero split |
| **CARD ARRANGEMENT** | Glass pair bottom-right only |
| **VERTICAL RHYTHM** | Spacious left column |
| **GLASS SURFACES** | Highest-fidelity glass: edge highlight, translucent fill, photo bleed, selected solid white “Personalized” chip |
| **BACKGROUND** | Sky photo + powder blue studio |
| **COLOR RELATIONSHIPS** | White type; teal accents only in logo mark and selected state |
| **BORDER TREATMENT** | Glass: bright thin rim; solid chips: none or soft |
| **SHADOWS** | Shell float shadow very soft and wide |
| **BLUR** | Backdrop blur ~16–24px visual equivalent |
| **CORNER RADII** | Shell ~24px |
| **BUTTON SHAPE** | White pill CTA |
| **TYPOGRAPHY SCALE** | H1 largest element after photo subject |
| **HEADLINE STYLE** | White, calm, not condensed |
| **BODY STYLE** | Small white meta |
| **IMAGE POSITIONING** | Child/adult center-right |
| **FLOATING ELEMENTS** | Avatar cluster; glass stats; progress bar |
| **DEPTH/LAYERING** | 3–4 stacked page planes |
| **WHITE SPACE** | Large left sky void |
| **NAVIGATION** | Minimal, light-weight |
| **CTA POSITIONING** | Mid-left |
| **LIGHT/DARK BALANCE** | High key |
| **RESPONSIVE CLUES** | Progress indicators for multi-slide hero |
| **PREMIUM FEEL** | Architectural glass + human photography + one primary action |

---

## IMAGE 6 — Hero with surrounding fragments (1905×1429)

| Field | Observation |
|-------|-------------|
| **PAGE/SECTION TYPE** | Same hero system in editorial collage |
| **OVERALL COMPOSITION** | Confirms floating white device as primary product container |
| **CONTENT WIDTH** | Shell-centric |
| **OUTER GUTTERS** | Large powder blue |
| **COLUMN STRUCTURE** | Unchanged hero |
| **CARD ARRANGEMENT** | Glass modules only in hero |
| **VERTICAL RHYTHM** | Same |
| **GLASS SURFACES** | Two modules: metric panel + 2×2 soft grid |
| **BACKGROUND** | Sky + powder blue |
| **COLOR RELATIONSHIPS** | Teal logo wordmark on white nav bar strip |
| **BORDER TREATMENT** | Nav bar is transparent-on-photo, not solid dark |
| **SHADOWS** | Soft shell |
| **BLUR** | Glass over photo |
| **CORNER RADII** | Large shell radius |
| **BUTTON SHAPE** | Pills with circular arrow |
| **TYPOGRAPHY SCALE** | Hero H1 >> body |
| **HEADLINE STYLE** | White multi-line |
| **BODY STYLE** | Sparse |
| **IMAGE POSITIONING** | Lifestyle, not medical equipment chrome |
| **FLOATING ELEMENTS** | Glass + avatars |
| **DEPTH/LAYERING** | Collage of other sections peeks |
| **WHITE SPACE** | High |
| **NAVIGATION** | Horizontal, quiet |
| **CTA POSITIONING** | Nav + hero |
| **LIGHT/DARK BALANCE** | Light |
| **RESPONSIVE CLUES** | Same system |
| **PREMIUM FEEL** | Calm confidence; not dashboard |

---

## IMAGE 7 — Full mobile long-scroll (640×2589)

| Field | Observation |
|-------|-------------|
| **PAGE/SECTION TYPE** | Complete mobile homepage in phone chrome |
| **OVERALL COMPOSITION** | Single column; same section order as desktop |
| **CONTENT WIDTH** | ~100% of phone content area; ~16–20px side padding |
| **OUTER GUTTERS** | Phone bezel only |
| **COLUMN STRUCTURE** | Stack: hero → about → values (list then photo then teal card) → total care photo → testimonials stack → blog stack → teal footer |
| **CARD ARRANGEMENT** | Full-width cards; testimonials full width with portrait; blog full width |
| **VERTICAL RHYTHM** | Large gaps between sections (~40–56px) |
| **GLASS SURFACES** | Hero glass stacks under photo on mobile (stat then value grid) |
| **BACKGROUND** | White content; teal footer; sky hero |
| **COLOR RELATIONSHIPS** | Same teal ink / white / sky |
| **BORDER TREATMENT** | Soft blue card borders |
| **SHADOWS** | Lighter on mobile cards |
| **BLUR** | Hero glass retained |
| **CORNER RADII** | ~14–16px cards |
| **BUTTON SHAPE** | Full-width-ish pills still rounded |
| **TYPOGRAPHY SCALE** | H1 still large (~32px); body ~15px |
| **HEADLINE STYLE** | Bold teal section titles |
| **BODY STYLE** | Comfortable for older eyes |
| **IMAGE POSITIONING** | Full-bleed rounded photos |
| **FLOATING ELEMENTS** | Glass on hero; avatars |
| **DEPTH/LAYERING** | Simpler stack |
| **WHITE SPACE** | Still generous |
| **NAVIGATION** | Top of hero |
| **CTA POSITIONING** | Hero + values + footer subscribe |
| **LIGHT/DARK BALANCE** | Footer dark band only |
| **RESPONSIVE CLUES** | **Primary mobile pattern:** single column, large type, full-width cards, glass hero preserved |
| **PREMIUM FEEL** | Not a hamburger-dense app chrome; still marketing calm |

---

## Cross-image system constants (for implementation)

1. **Stage color:** soft powder blue, not pure gray clinical.
2. **Product container:** white (or near-white) floating shell with large radius + soft multi-layer shadow.
3. **Ink:** deep teal-navy, not pure black, not olive.
4. **Primary CTA:** pill, white or solid teal depending on surface; circular arrow accent allowed.
5. **Glass:** frosted white-blue over imagery/gradients; selected chip becomes **solid white**; not generic `rgba(255,255,255,.1) blur(10px)` alone.
6. **Hierarchy:** one hero context + one priority layer + quiet supporting pairs — never 12 equal cards.
7. **Nav:** quiet horizontal or quiet side list; not enterprise dense.
8. **Type:** large calm headings; body ≥15px; muted slate-blue supporting text.
9. **Dark:** reserved for footer / solid commitment cards — not the whole chrome.
10. **Human first:** avatars, names, roles — not technical IDs.

## Accessibility notes from reference

- High contrast white-on-sky hero type with soft gradient veil.
- Deep teal on white for section titles (strong).
- Large tap pills.
- Avoid tiny 12px-only UI for primary content when translating to caregiver app (bump body to 16px+).
