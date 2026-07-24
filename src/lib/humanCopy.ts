/**
 * Plain-language caregiver copy helpers.
 * No architecture jargon, no engineering discrepancy phrasing.
 */

export function plainDiscrepancyMessage(
  technical: string | undefined,
  recipientName = "the care recipient",
): string {
  const t = (technical ?? "").toLowerCase();
  if (
    /incompatible dimensions|not comparable|compatible dimensions|unit/.test(t)
  ) {
    return `The reported amount doesn't clearly match ${recipientName}'s current medication instructions. Please check the medication label or confirm with the prescribing team before marking this complete.`;
  }
  if (/missing unit/.test(t)) {
    return `The reported dose is missing units. Check the bottle or packaging, then confirm the amount with the care team if needed.`;
  }
  if (/ambiguous/.test(t)) {
    return `The reported dose wording is unclear. Please restate the amount from the label before completing this.`;
  }
  if (/requires human review|human review/.test(t)) {
    return `This needs a human check before it becomes care truth. Review the details and confirm what actually happened.`;
  }
  if (technical && !/dimension|compatib|unit conversion|protocol/i.test(technical)) {
    return technical;
  }
  return `Something about this report needs your review before it is marked complete.`;
}

export function careTypeLabel(raw: unknown): string {
  const s = String(raw ?? "").toLowerCase();
  if (/med/.test(s)) return "Medication";
  if (/appoint/.test(s)) return "Appointment";
  if (/observ/.test(s)) return "Observation";
  if (/instruct|provider/.test(s)) return "Provider instruction";
  if (/handoff|continuity/.test(s)) return "Care handoff";
  if (/task/.test(s)) return "Care task";
  if (/event|update|note/.test(s)) return "Care update";
  if (/review|safety|discrep/.test(s)) return "Needs review";
  return "Care item";
}

export function certaintyLabel(status: unknown): string {
  switch (String(status ?? "").toUpperCase()) {
    case "CONFIRMED":
      return "Confirmed";
    case "REPORTED":
      return "Reported";
    case "INFERRED":
      return "Inferred";
    case "UNCERTAIN":
      return "Uncertain";
    case "CONFLICTED":
      return "Needs checking";
    case "SUPERSEDED":
      return "Superseded";
    default:
      return status ? String(status) : "Reported";
  }
}

export function priorityLabel(safety: unknown): string {
  switch (String(safety ?? "").toLowerCase()) {
    case "high":
      return "High priority";
    case "moderate":
      return "Moderate priority";
    case "low":
      return "Low priority";
    default:
      return "";
  }
}

/** Format ISO or label into unambiguous caregiver datetime. */
export function formatCareDateTime(
  isoOrLabel: string | null | undefined,
  opts?: { timeZone?: string },
): string {
  if (!isoOrLabel) return "";
  const raw = String(isoOrLabel).trim();
  // Already human label without ISO shape
  if (!/^\d{4}-\d{2}-\d{2}/.test(raw) && !raw.includes("T")) {
    // Enrich vague "around 3" style if present
    if (/around\s+(\d{1,2})\b/i.test(raw) && !/\b(am|pm)\b/i.test(raw)) {
      return raw.replace(
        /around\s+(\d{1,2})\b/i,
        (_m, h) => {
          const hour = Number(h);
          if (hour >= 1 && hour <= 11) return `around ${hour}:00 PM`;
          if (hour === 12) return "around 12:00 PM";
          return `around ${hour}:00`;
        },
      );
    }
    return raw;
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  const tz = opts?.timeZone ?? "America/Los_Angeles";
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: tz,
      timeZoneName: "short",
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

export function formatTimeOnly(
  iso: string | null | undefined,
  timeZone = "America/Los_Angeles",
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(d);
}

export function stripEmDashes(text: string): string {
  return text
    .replace(/[—–]/g, " - ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
