import { CaretakerRelaySymbol } from "./CaretakerRelaySymbol";
import { LogoMicroMark } from "./logoRefinements";
import { logoPalette, type LogoTone } from "../../brand/logoTokens";

export type LogoLayout = "horizontal" | "stacked" | "mark";

/**
 * Production lockup — founder selected Option A (Protected Relay).
 * Horizontal / stacked: A mark + refined wordmark.
 * Mark-only: A at ≥24px; use LogoMicroMark for ≤16–20px contexts.
 */
export function CaretakerRelayLogo({
  layout = "horizontal",
  tone = "color",
  markSize,
  className = "",
  title = "Caretaker Relay",
  showWordmark = true,
  showSymbol = true,
  useMicro = false,
  testId = "caretaker-relay-logo",
}: {
  layout?: LogoLayout;
  tone?: LogoTone;
  markSize?: number;
  className?: string;
  title?: string;
  showWordmark?: boolean;
  showSymbol?: boolean;
  /** Prefer micro-mark geometry (favicon-scale). */
  useMicro?: boolean;
  testId?: string;
}) {
  const c = logoPalette(tone);
  const size =
    markSize ??
    (layout === "mark" ? 28 : layout === "stacked" ? 48 : 36);
  const Mark = useMicro || size <= 20 ? LogoMicroMark : CaretakerRelaySymbol;

  if (layout === "mark" || !showWordmark) {
    return (
      <span
        className={`cr-logo cr-logo-mark ${className}`.trim()}
        data-testid={testId}
        data-logo-layout="mark"
        data-logo-option="A"
      >
        <Mark size={size} tone={tone} title={title} testId={`${testId}-mark`} />
      </span>
    );
  }

  return (
    <span
      className={`cr-logo cr-logo-${layout} ${className}`.trim()}
      data-testid={testId}
      data-logo-layout={layout}
      data-logo-tone={tone}
      data-logo-option="A"
      data-logo-mode="option-a-production"
      role="img"
      aria-label={title}
    >
      {showSymbol && (
        <Mark
          size={size}
          tone={tone}
          decorative
          testId={`${testId}-mark`}
        />
      )}
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
