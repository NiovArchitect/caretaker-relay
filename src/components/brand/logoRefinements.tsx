/**
 * Founder comparison refinements — SVG only, no raster generation.
 * NOT production-approved until founder selects A / B / C.
 * Current live product uses wordmark-only temporary fallback.
 */

import type { ReactNode } from "react";
import { LOGO_COLORS, type LogoTone, logoPalette } from "../../brand/logoTokens";

export type LogoOptionId = "rejected" | "A" | "B" | "C";

type MarkProps = {
  size?: number;
  tone?: LogoTone;
  className?: string;
  title?: string;
  decorative?: boolean;
  testId?: string;
};

function frame(
  props: MarkProps,
  option: LogoOptionId,
  children: ReactNode,
) {
  const {
    size = 64,
    className = "",
    title = "Caretaker Relay",
    decorative = false,
    testId = `logo-option-${option}`,
  } = props;
  return (
    <svg
      className={`cr-logo-symbol cr-logo-opt-${option} ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      data-testid={testId}
      data-logo-option={option}
      focusable="false"
    >
      {!decorative && <title>{title}</title>}
      {children}
    </svg>
  );
}

/** CURRENT REJECTED — kept only for comparison. */
export function LogoOptionRejected(props: MarkProps) {
  const c = logoPalette(props.tone ?? "color");
  return frame(
    props,
    "rejected",
    <>
      <path
        d="M14.5 40.5C12.2 36.2 11.5 31.2 12.8 26.5C14.5 20.2 19.2 15.2 25.5 12.8"
        fill="none"
        stroke={c.ringLower}
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M25.5 12.8C32.2 9.8 40.2 10.4 46.2 14.5C50.5 17.5 53.2 22.2 54 27.5"
        fill="none"
        stroke={c.ringUpper}
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path d="M50.2 24.8 L55.2 28.2 L49.6 31.4 Z" fill={c.arrow} />
      <path
        d="M18 42.5C20 36.5 24.5 33 29.5 32.2C27.5 35.5 26.8 39.5 27.5 44C24.2 43.5 20.8 43.2 18 42.5Z"
        fill={c.hands}
      />
      <path
        d="M46 42.5C44 36.5 39.5 33 34.5 32.2C36.5 35.5 37.2 39.5 36.5 44C39.8 43.5 43.2 43.2 46 42.5Z"
        fill={c.hands}
      />
      <path
        d="M22.5 44.5C26 46.5 30 47.5 32 47.5C34 47.5 38 46.5 41.5 44.5C39.5 48.5 35.5 51 32 51C28.5 51 24.5 48.5 22.5 44.5Z"
        fill={c.hands}
      />
      <circle cx="32" cy="24.5" r="5.4" fill={c.person} />
      <path d="M32 30.2 L39.2 42.5 L24.8 42.5 Z" fill={c.person} />
    </>,
  );
}

/**
 * OPTION A — Protected Relay
 * Max 3 shapes: center person-dot, supportive lower curve, open relay arc.
 * No hands, no body triangle, no separate arrowhead.
 */
export function LogoOptionA(props: MarkProps) {
  const tone = props.tone ?? "color";
  const ink = tone === "white" ? LOGO_COLORS.white : LOGO_COLORS.ink;
  const teal =
    tone === "white"
      ? LOGO_COLORS.white
      : tone === "ink"
        ? LOGO_COLORS.ink
        : LOGO_COLORS.teal;
  const accent =
    tone === "color" ? LOGO_COLORS.tealBright : ink;

  return frame(
    props,
    "A",
    <>
      {/* Open relay arc — continuity / handoff */}
      <path
        d="M18 44
           C14 36 15 24 24 17
           C31 11.5 42 12 49 20
           C52 24 53.5 29 53 34"
        fill="none"
        stroke={teal}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Soft terminal notch suggesting motion (not a triangle arrow) */}
      <path
        d="M49 18.5 C51.5 21.5 52.8 25 53 28.5"
        fill="none"
        stroke={accent}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Supportive lower curve — care gesture without anatomy */}
      <path
        d="M20 46
           C26 52 38 52 44 46
           C40 48.5 36 49.5 32 49.5
           C28 49.5 24 48.5 20 46 Z"
        fill={ink}
        opacity={tone === "color" ? 0.92 : 1}
      />
      <path
        d="M21 43.5 C26.5 48 37.5 48 43 43.5"
        fill="none"
        stroke={ink}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Protected center — person as calm point, not pin */}
      <circle cx="32" cy="30" r="6" fill={ink} />
      {tone === "color" && (
        <circle cx="32" cy="30" r="2.4" fill={LOGO_COLORS.tealBright} />
      )}
    </>,
  );
}

/**
 * OPTION B — Human Continuity
 * Soft human figure + two interlocking handoff paths.
 * Relay implied by direction; no arrowhead.
 */
export function LogoOptionB(props: MarkProps) {
  const tone = props.tone ?? "color";
  const ink = tone === "white" ? LOGO_COLORS.white : LOGO_COLORS.ink;
  const teal =
    tone === "white"
      ? LOGO_COLORS.white
      : tone === "ink"
        ? LOGO_COLORS.ink
        : LOGO_COLORS.tealBright;

  return frame(
    props,
    "B",
    <>
      {/* Interlocking handoff paths */}
      <path
        d="M14 38
           C18 22 30 16 40 22
           C46 26 48 34 44 40"
        fill="none"
        stroke={teal}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M50 26
           C46 42 34 48 24 42
           C18 38 16 30 20 24"
        fill="none"
        stroke={ink}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Soft human: head + rounded body (not triangle pin) */}
      <circle cx="32" cy="26" r="4.5" fill={ink} />
      <rect
        x="27.5"
        y="31"
        width="9"
        height="12"
        rx="4.5"
        fill={ink}
      />
    </>,
  );
}

/**
 * OPTION C — Relay Monogram
 * Abstract C opening into protected center; subtle R continuity.
 * Strongest for favicon/app icon.
 */
export function LogoOptionC(props: MarkProps) {
  const tone = props.tone ?? "color";
  const ink = tone === "white" ? LOGO_COLORS.white : LOGO_COLORS.ink;
  const teal =
    tone === "white"
      ? LOGO_COLORS.white
      : tone === "ink"
        ? LOGO_COLORS.ink
        : LOGO_COLORS.tealBright;

  return frame(
    props,
    "C",
    <>
      {/* Outer C / open ring */}
      <path
        d="M46 18
           C38 12 26 12 20 20
           C14 28 14 40 22 48
           C28 53.5 38 54 46 48"
        fill="none"
        stroke={ink}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Inner continuity arc (R bowl suggestion / relay motion) */}
      <path
        d="M34 22
           C42 24 46 30 44 38
           C42 44 36 48 30 46"
        fill="none"
        stroke={teal}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Protected center — recipient space */}
      <circle cx="30" cy="34" r="4" fill={teal} />
    </>,
  );
}

/** Micro-mark for 16–24px (not full emblem). Open ring + protected center. */
export function LogoMicroMark(props: MarkProps) {
  const tone = props.tone ?? "color";
  const ink = tone === "white" ? LOGO_COLORS.white : LOGO_COLORS.ink;
  const teal =
    tone === "white"
      ? LOGO_COLORS.white
      : tone === "ink"
        ? LOGO_COLORS.ink
        : LOGO_COLORS.tealBright;

  return (
    <svg
      className={`cr-logo-symbol cr-logo-micro ${props.className ?? ""}`.trim()}
      width={props.size ?? 32}
      height={props.size ?? 32}
      viewBox="0 0 32 32"
      role={props.decorative ? "presentation" : "img"}
      aria-hidden={props.decorative ? true : undefined}
      aria-label={props.decorative ? undefined : props.title ?? "Caretaker Relay"}
      data-testid={props.testId ?? "logo-micro"}
      focusable="false"
    >
      {!props.decorative && <title>{props.title ?? "Caretaker Relay"}</title>}
      <path
        d="M24 8.5
           C18 5.5 10.5 7 8 13
           C5.5 19 8.5 26 15.5 27.5
           C20 28.5 24 26.5 26 22"
        fill="none"
        stroke={ink}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="3.2" fill={teal} />
    </svg>
  );
}

export const LOGO_OPTION_META: Record<
  Exclude<LogoOptionId, "rejected">,
  { name: string; summary: string }
> = {
  A: {
    name: "Protected Relay",
    summary:
      "Center point, one supportive lower curve, one open relay arc. Three primary shapes.",
  },
  B: {
    name: "Human Continuity",
    summary:
      "Soft human figure with two interlocking handoff paths. No arrowhead.",
  },
  C: {
    name: "Relay Monogram",
    summary:
      "Abstract open C with protected center and continuity arc. Favicon-first.",
  },
};
