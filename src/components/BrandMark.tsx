/**
 * Provisional BrandMark — wordmark initials only while original 3D identity is under founder review.
 * No Option A / ring-dot / person-hand geometry.
 */
export function BrandMark({
  size = 28,
  className = "",
  title = "Caretaker Relay",
}: {
  size?: number;
  className?: string;
  title?: string;
  tone?: string;
  decorative?: boolean;
  testId?: string;
}) {
  const fontSize = Math.max(11, Math.round(size * 0.42));
  return (
    <span
      className={`cr-logo-provisional-mark ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        fontSize,
        fontWeight: 700,
        letterSpacing: "-0.04em",
        color: "var(--cr-ink, #0B2430)",
        lineHeight: 1,
      }}
      role="img"
      aria-label={title}
      data-testid="brand-mark"
      data-logo-mode="provisional-cr-monogram"
    >
      CR
    </span>
  );
}

export { CaretakerRelayLogo, BrandWordmark } from "./brand/CaretakerRelayLogo";
export type { LogoLayout } from "./brand/CaretakerRelayLogo";
export type { LogoTone } from "../brand/logoTokens";
