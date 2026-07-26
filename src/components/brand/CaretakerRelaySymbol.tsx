import { logoPalette, type LogoTone } from "../../brand/logoTokens";

/**
 * Production compact symbol — care recipient (gold), supporting hands,
 * open relay ring, clockwise arrow. Flat SVG, no glow/blur filters.
 *
 * Geometry derived from approved Desktop reference PNG concept.
 * viewBox 0 0 64 64 — crisp at 16–96px.
 */
export function CaretakerRelaySymbol({
  size = 32,
  tone = "color",
  className = "",
  title,
  decorative = false,
  testId = "brand-mark",
}: {
  size?: number;
  tone?: LogoTone;
  className?: string;
  title?: string;
  /** When true, hide from AT (parent provides label). */
  decorative?: boolean;
  testId?: string;
}) {
  const c = logoPalette(tone);
  const label = title ?? "Caretaker Relay";
  // Unique gradient-free id prefix for multi-instance pages
  const uid = decorative ? "d" : "m";

  return (
    <svg
      className={`cr-logo-symbol ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
      data-testid={testId}
      data-logo-tone={tone}
      focusable="false"
    >
      {!decorative && <title>{label}</title>}

      {/* Lower ring arc (deep ink) — open structure, not a cage */}
      <path
        d="M14.5 40.5
           C12.2 36.2 11.5 31.2 12.8 26.5
           C14.5 20.2 19.2 15.2 25.5 12.8"
        fill="none"
        stroke={c.ringLower}
        strokeWidth="4.2"
        strokeLinecap="round"
      />

      {/* Upper ring arc (teal) — continuity path */}
      <path
        d="M25.5 12.8
           C32.2 9.8 40.2 10.4 46.2 14.5
           C50.5 17.5 53.2 22.2 54 27.5"
        fill="none"
        stroke={c.ringUpper}
        strokeWidth="4.2"
        strokeLinecap="round"
        id={`cr-ring-upper-${uid}`}
      />

      {/* Clockwise arrow head at upper-right of ring */}
      <path
        d="M50.2 24.8 L55.2 28.2 L49.6 31.4 Z"
        fill={c.arrow}
      />
      {/* Small arc tip into arrow for continuity */}
      <path
        d="M46.5 20.5 C49.2 22.8 51.5 25.8 52.5 28.2"
        fill="none"
        stroke={c.arrow}
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Supporting hands — cupped upward (left + right) */}
      <path
        d="M18 42.5
           C20 36.5 24.5 33 29.5 32.2
           C27.5 35.5 26.8 39.5 27.5 44
           C24.2 43.5 20.8 43.2 18 42.5 Z"
        fill={c.hands}
      />
      <path
        d="M46 42.5
           C44 36.5 39.5 33 34.5 32.2
           C36.5 35.5 37.2 39.5 36.5 44
           C39.8 43.5 43.2 43.2 46 42.5 Z"
        fill={c.hands}
      />
      {/* Palm bases */}
      <path
        d="M22.5 44.5
           C26 46.5 30 47.5 32 47.5
           C34 47.5 38 46.5 41.5 44.5
           C39.5 48.5 35.5 51 32 51
           C28.5 51 24.5 48.5 22.5 44.5 Z"
        fill={c.hands}
      />

      {/* Care recipient — central gold person */}
      <circle cx="32" cy="24.5" r="5.4" fill={c.person} />
      <path
        d="M32 30.2
           L39.2 42.5
           L24.8 42.5
           Z"
        fill={c.person}
      />
    </svg>
  );
}
