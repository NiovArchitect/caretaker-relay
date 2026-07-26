import { CaretakerRelaySymbol } from "./CaretakerRelaySymbol";
import { logoPalette, type LogoTone } from "../../brand/logoTokens";

export type LogoLayout = "horizontal" | "stacked" | "mark";

/**
 * Full brand lockup: symbol + optional wordmark.
 * Wordmark is exact: "Caretaker Relay" (no glow; color weight distinguishes Relay).
 */
export function CaretakerRelayLogo({
  layout = "horizontal",
  tone = "color",
  markSize,
  className = "",
  title = "Caretaker Relay",
  showWordmark = true,
  testId = "caretaker-relay-logo",
}: {
  layout?: LogoLayout;
  tone?: LogoTone;
  /** Symbol pixel size; defaults by layout */
  markSize?: number;
  className?: string;
  title?: string;
  showWordmark?: boolean;
  testId?: string;
}) {
  const c = logoPalette(tone);
  const size =
    markSize ??
    (layout === "mark" ? 28 : layout === "stacked" ? 48 : 36);
  const markOnly = layout === "mark" || !showWordmark;

  if (markOnly) {
    return (
      <span
        className={`cr-logo cr-logo-mark ${className}`.trim()}
        data-testid={testId}
        data-logo-layout="mark"
      >
        <CaretakerRelaySymbol size={size} tone={tone} title={title} />
      </span>
    );
  }

  const stacked = layout === "stacked";

  return (
    <span
      className={`cr-logo cr-logo-${layout} ${className}`.trim()}
      data-testid={testId}
      data-logo-layout={layout}
      data-logo-tone={tone}
      role="img"
      aria-label={title}
    >
      <CaretakerRelaySymbol
        size={size}
        tone={tone}
        decorative
        testId={`${testId}-mark`}
      />
      <span className="cr-logo-wordmark" aria-hidden>
        <span className="cr-logo-caretaker" style={{ color: c.caretaker }}>
          Caretaker
        </span>
        <span className="cr-logo-space"> </span>
        <span className="cr-logo-relay" style={{ color: c.relay }}>
          Relay
        </span>
      </span>
      {stacked ? null : null}
    </span>
  );
}

/** Back-compat thin alias used by App / Login. */
export function BrandWordmark({
  tone = "color",
  className = "",
}: {
  tone?: LogoTone;
  className?: string;
}) {
  const c = logoPalette(tone);
  return (
    <span className={`cr-logo-wordmark ${className}`.trim()} aria-hidden>
      <span className="cr-logo-caretaker" style={{ color: c.caretaker }}>
        Caretaker
      </span>{" "}
      <span className="cr-logo-relay" style={{ color: c.relay }}>
        Relay
      </span>
    </span>
  );
}
