import { useId } from "react";

export type OrbTone = "color" | "ink" | "white";

/**
 * Production Soft Translucent orb (founder-selected Material 3).
 * Static SVG gradients only — no blur, filters, animation, or internal icons.
 */
export function SoftTranslucentOrb({
  size = 32,
  tone = "color",
  className = "",
  title = "Caretaker Relay",
  decorative = false,
  testId = "brand-mark",
}: {
  size?: number;
  tone?: OrbTone;
  className?: string;
  title?: string;
  decorative?: boolean;
  testId?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const bodyId = `st-body-${uid}`;
  const hiId = `st-hi-${uid}`;
  const coreId = `st-core-${uid}`;
  const monoId = `st-mono-${uid}`;

  if (tone === "ink" || tone === "white") {
    const fill = tone === "white" ? "#F5FAFC" : "#0B2430";
    const hi = tone === "white" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.22)";
    return (
      <svg
        className={`cr-logo-orb ${className}`.trim()}
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role={decorative ? "presentation" : "img"}
        aria-hidden={decorative ? true : undefined}
        aria-label={decorative ? undefined : title}
        data-testid={testId}
        data-logo-orb="soft-translucent"
        data-logo-tone={tone}
        focusable="false"
      >
        {!decorative && <title>{title}</title>}
        <defs>
          <radialGradient id={monoId} cx="36%" cy="32%" r="68%">
            <stop offset="0%" stopColor={tone === "white" ? "#FFFFFF" : "#4A6270"} />
            <stop offset="55%" stopColor={tone === "white" ? "#D0E8EC" : "#163F4E"} />
            <stop offset="100%" stopColor={fill} />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="28" fill={`url(#${monoId})`} />
        <ellipse cx="24" cy="22" rx="10" ry="7" fill={hi} />
      </svg>
    );
  }

  return (
    <svg
      className={`cr-logo-orb ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 128 128"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      data-testid={testId}
      data-logo-orb="soft-translucent"
      data-logo-tone={tone}
      focusable="false"
    >
      {!decorative && <title>{title}</title>}
      <defs>
        <radialGradient id={bodyId} cx="40%" cy="36%" r="66%">
          <stop offset="0%" stopColor="#E8F8F7" />
          <stop offset="20%" stopColor="#8DD8D6" />
          <stop offset="48%" stopColor="#3AA8B5" />
          <stop offset="75%" stopColor="#0C5C6A" />
          <stop offset="100%" stopColor="#0B2430" />
        </radialGradient>
        <radialGradient id={hiId} cx="34%" cy="30%" r="48%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={coreId} cx="55%" cy="58%" r="40%">
          <stop offset="0%" stopColor="#C9893A" stopOpacity="0.14" />
          <stop offset="55%" stopColor="#1F8A9A" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1F8A9A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="56" fill={`url(#${bodyId})`} />
      <circle cx="64" cy="64" r="56" fill={`url(#${coreId})`} />
      <ellipse cx="50" cy="46" rx="24" ry="18" fill={`url(#${hiId})`} />
      <circle
        cx="64"
        cy="64"
        r="55"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />
    </svg>
  );
}
