import { logoPalette, type LogoTone } from "../../brand/logoTokens";
import { LogoMicroMark } from "./logoRefinements";

export type LogoLayout = "horizontal" | "stacked" | "mark";

/**
 * TEMPORARY LIVE POLICY (founder rejected emblem 3645fd2):
 * Default is refined wordmark-only. No permanent A/B/C symbol until founder selects.
 * Optional micro-mark only when layout==="mark" and showMicro is true (favicon-scale contexts).
 */
export function CaretakerRelayLogo({
  layout = "horizontal",
  tone = "color",
  markSize,
  className = "",
  title = "Caretaker Relay",
  showWordmark = true,
  /** Temporary: hide rejected emblem; do not show A/B/C until founder selects. */
  showSymbol = false,
  showMicro = false,
  testId = "caretaker-relay-logo",
}: {
  layout?: LogoLayout;
  tone?: LogoTone;
  markSize?: number;
  className?: string;
  title?: string;
  showWordmark?: boolean;
  showSymbol?: boolean;
  showMicro?: boolean;
  testId?: string;
}) {
  const c = logoPalette(tone);
  const size =
    markSize ??
    (layout === "mark" ? 28 : layout === "stacked" ? 48 : 36);

  // Mark-only temporary: micro-mark if requested, else wordmark text
  if (layout === "mark" && !showWordmark) {
    if (showMicro) {
      return (
        <span
          className={`cr-logo cr-logo-mark ${className}`.trim()}
          data-testid={testId}
          data-logo-layout="mark"
          data-logo-mode="micro-temporary"
        >
          <LogoMicroMark size={size} tone={tone} title={title} />
        </span>
      );
    }
    return (
      <span
        className={`cr-logo cr-logo-wordmark-only ${className}`.trim()}
        data-testid={testId}
        data-logo-layout="mark"
        data-logo-mode="wordmark-temporary"
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

  return (
    <span
      className={`cr-logo cr-logo-${layout} cr-logo-wordmark-temporary ${className}`.trim()}
      data-testid={testId}
      data-logo-layout={layout}
      data-logo-tone={tone}
      data-logo-mode="wordmark-temporary"
      data-show-symbol={showSymbol ? "true" : "false"}
      role="img"
      aria-label={title}
    >
      {/* Symbol intentionally omitted until founder selects A/B/C */}
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
