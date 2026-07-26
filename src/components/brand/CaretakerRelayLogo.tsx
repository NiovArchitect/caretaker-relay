import { logoPalette, type LogoTone } from "../../brand/logoTokens";

export type LogoLayout = "horizontal" | "stacked" | "mark";

/**
 * TEMPORARY LIVE IDENTITY (Option A rejected; original 3D concepts pending founder selection).
 * Wordmark-only — no symbol geometry of any prior mark.
 */
export function CaretakerRelayLogo({
  layout = "horizontal",
  tone = "color",
  className = "",
  title = "Caretaker Relay",
  testId = "caretaker-relay-logo",
}: {
  layout?: LogoLayout;
  tone?: LogoTone;
  markSize?: number;
  className?: string;
  title?: string;
  showWordmark?: boolean;
  showSymbol?: boolean;
  useMicro?: boolean;
  testId?: string;
}) {
  const c = logoPalette(tone);
  // Mark-only contexts still show refined wordmark initials style, not a rejected mark
  if (layout === "mark") {
    return (
      <span
        className={`cr-logo cr-logo-mark cr-logo-wordmark-temporary ${className}`.trim()}
        data-testid={testId}
        data-logo-layout="mark"
        data-logo-mode="wordmark-only-provisional"
        role="img"
        aria-label={title}
      >
        <span className="cr-logo-wordmark cr-logo-wordmark-refined" aria-hidden>
          <span className="cr-logo-caretaker" style={{ color: c.caretaker }}>
            CR
          </span>
        </span>
      </span>
    );
  }

  return (
    <span
      className={`cr-logo cr-logo-${layout} cr-logo-wordmark-temporary ${className}`.trim()}
      data-testid={testId}
      data-logo-layout={layout}
      data-logo-tone={tone}
      data-logo-mode="wordmark-only-provisional"
      role="img"
      aria-label={title}
    >
      <span className="cr-logo-wordmark cr-logo-wordmark-refined" aria-hidden>
        <span className="cr-logo-caretaker" style={{ color: c.caretaker }}>
          Caretaker
        </span>
        <span className="cr-logo-space"> </span>
        <span className="cr-logo-relay" style={{ color: c.relay }}>
          Relay
        </span>
      </span>
    </span>
  );
}

export function BrandWordmark({
  tone = "color",
  className = "",
}: {
  tone?: LogoTone;
  className?: string;
}) {
  const c = logoPalette(tone);
  return (
    <span
      className={`cr-logo-wordmark cr-logo-wordmark-refined ${className}`.trim()}
      aria-hidden
    >
      <span className="cr-logo-caretaker" style={{ color: c.caretaker }}>
        Caretaker
      </span>{" "}
      <span className="cr-logo-relay" style={{ color: c.relay }}>
        Relay
      </span>
    </span>
  );
}
