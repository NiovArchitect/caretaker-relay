# Caretaker Relay — Logo Implementation

## Migration from staged mark

| Before | After |
|--------|--------|
| CSS gradient disc + dual white arcs | Production person+hands+relay SVG |
| Staged `BrandMark` 32 viewBox arcs | `CaretakerRelaySymbol` 64 viewBox |
| Favicon staged arcs | Favicon matches production symbol |
| Competing CSS `.brand-mark` disc | CSS disc suppressed; SVG is sole runtime mark |

Historical docs under `docs/design/*IDENTITY*` retained; runtime uses one system.

## Files

| Path | Role |
|------|------|
| `src/brand/logoTokens.ts` | Colors + tone palettes |
| `src/components/brand/CaretakerRelaySymbol.tsx` | Compact mark |
| `src/components/brand/CaretakerRelayLogo.tsx` | Lockups + wordmark |
| `src/components/BrandMark.tsx` | Re-exports (compat) |
| `public/favicon.svg` | 16–32 favicon |
| `public/app-icon.svg` | Square app icon |
| `docs/design/logo-source/caretaker-relay-logo-approved.png` | Evidence copy of approved PNG |

## Usage

```tsx
import { CaretakerRelayLogo, BrandMark } from "./components/BrandMark";

// Desktop header
<CaretakerRelayLogo layout="horizontal" markSize={28} />

// Login / onboarding
<CaretakerRelayLogo layout="stacked" markSize={52} />

// Compact only
<BrandMark size={24} /> // = CaretakerRelaySymbol
```

## Accessibility

- Default: `role="img"` + `aria-label` / `<title>`  
- Decorative symbol inside lockup: `decorative` → `aria-hidden`  
- No required motion; reduced-motion N/A (static)  
- Person gold vs hands navy: distinguishable without relying on red/green  

## Performance

- Inline SVG only; no base64 raster dependency  
- No filters, blur, or backdrop-filter  
- Negligible paint cost  

## Placement map

| Surface | Layout |
|---------|--------|
| Login | stacked |
| App topbar | horizontal |
| Mobile | same horizontal; wordmark may wrap via CSS later if needed |
| Favicon | symbol only |
| Documents | prefer `tone="ink"` when added to export headers |
