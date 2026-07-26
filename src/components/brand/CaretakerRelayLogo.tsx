import { SoftTranslucentOrb, type OrbTone } from "./SoftTranslucentOrb";
import { logoPalette, type LogoTone } from "../../brand/logoTokens";

export type LogoLayout = "horizontal" | "stacked" | "mark";

function toOrbTone(tone: LogoTone): OrbTone {
  if (tone === "ink" || tone === "white") return tone;
  return "color";
}

/**
 * Production identity — Soft Translucent orb + Caretaker Relay wordmark.
 * Founder-selected Material 3. No provisional monogram. No rejected marks.
 */
export function CaretakerRelayLogo({
  layout = "horizontal",
  tone = "color",
  markSize,
  className = "",
  title = "Caretaker Relay",
  showWordmark = true,
  showSymbol = true,
  testId = "caretaker-relay-logo",
}: {
  layout?: LogoLayout;
  tone?: LogoTone;
  markSize?: number;
  className?: string;
  title?: string;
  showWordmark?: boolean;
  showSymbol?: boolean;
  testId?: string;
}) {
  const c = logoPalette(tone);
  const size =
    markSize ??
    (layout === "mark" ? 28 : layout === "stacked" ? 52 : 32);
  const orbTone = toOrbTone(tone);

  if (layout === "mark" || !showWordmark) {
    return (
      <span
        className={`cr-logo cr-logo-mark ${className}`.trim()}
        data-testid={testId}
        data-logo-layout="mark"
        data-logo-mode="soft-translucent-production"
      >
        <SoftTranslucentOrb
          size={size}
          tone={orbTone}
          title={title}
          testId={`${testId}-mark`}
        />
      </span>
    );
  }

  return (
    <span
      className={`cr-logo cr-logo-${layout} ${className}`.trim()}
      data-testid={testId}
      data-logo-layout={layout}
      data-logo-tone={tone}
      data-logo-mode="soft-translucent-production"
      role="img"
      aria-label={title}
    >
      {showSymbol && (
        <SoftTranslucentOrb
          size={size}
          tone={orbTone}
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
