/**
 * Caretaker Relay production logo color tokens.
 * Source concept: Desktop approved PNG (transparent, person + hands + relay ring).
 * Flat fills only — no glow/bloom/blur in runtime SVG.
 */

export const LOGO_COLORS = {
  /** Deep ink / navy — Caretaker word, lower ring, hands structure */
  ink: "#0B2430",
  inkNavy: "#0A2F5C",
  /** Primary signal teal — ring, Relay word */
  teal: "#0C5C6A",
  tealBright: "#1F8A9A",
  /** Warm human gold — care recipient figure + arrow accent */
  gold: "#D4A017",
  goldWarm: "#C9893A",
  /** On-dark monochrome */
  white: "#F5FAFC",
} as const;

export type LogoTone = "color" | "ink" | "white";

export function logoPalette(tone: LogoTone = "color") {
  if (tone === "ink") {
    return {
      person: LOGO_COLORS.ink,
      hands: LOGO_COLORS.ink,
      ringUpper: LOGO_COLORS.ink,
      ringLower: LOGO_COLORS.ink,
      arrow: LOGO_COLORS.ink,
      caretaker: LOGO_COLORS.ink,
      relay: LOGO_COLORS.ink,
    };
  }
  if (tone === "white") {
    return {
      person: LOGO_COLORS.white,
      hands: LOGO_COLORS.white,
      ringUpper: LOGO_COLORS.white,
      ringLower: LOGO_COLORS.white,
      arrow: LOGO_COLORS.white,
      caretaker: LOGO_COLORS.white,
      relay: LOGO_COLORS.white,
    };
  }
  return {
    person: LOGO_COLORS.gold,
    hands: LOGO_COLORS.inkNavy,
    ringUpper: LOGO_COLORS.tealBright,
    ringLower: LOGO_COLORS.inkNavy,
    arrow: LOGO_COLORS.gold,
    caretaker: LOGO_COLORS.ink,
    relay: LOGO_COLORS.tealBright,
  };
}
