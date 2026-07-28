/**
 * Plain-language caregiver copy helpers.
 * No architecture jargon, no engineering discrepancy phrasing.
 */

import {
  formatCareInstant,
  formatCareInstantLayered,
  shiftBucketLabel,
  type FormatOpts,
} from "./dateTime";

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

/** Format ISO or label into unambiguous caregiver datetime (full weekday form). */
export function formatCareDateTime(
  isoOrLabel: string | null | undefined,
  opts?: { timeZone?: string },
): string {
  return formatCareInstant(isoOrLabel, "full", opts);
}

/** Standard compact: Jul 23, 2026 · 3:04 PM PDT */
export function formatCareDateTimeStandard(
  isoOrLabel: string | null | undefined,
  opts?: FormatOpts,
): string {
  return formatCareInstant(isoOrLabel, "standard", opts);
}

/** Recent-aware: Today at 3:04 PM (with standard in parentheses when recent). */
export function formatCareDateTimeRecent(
  isoOrLabel: string | null | undefined,
  opts?: FormatOpts,
): string {
  return formatCareInstantLayered(isoOrLabel, opts);
}

export function formatTimeOnly(
  iso: string | null | undefined,
  timeZone = "America/Los_Angeles",
): string {
  return formatCareInstant(iso, "compact", { timeZone });
}

export { shiftBucketLabel, formatCareInstant, formatCareInstantLayered };

export function stripEmDashes(text: string): string {
  return text
    .replace(/[—–]/g, " - ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Strip lab/smoke run tags and probe markers from ordinary product copy. */
export function stripLabResidue(text: string): string {
  return String(text ?? "")
    .replace(/\[[\s]*?(HOL|FMH|JL|AZ|PROBE|SEED|SMOKE)[^\]]*\]/gi, "")
    .replace(/\b(HOLms|FMHms|JLms|AZms)\w*\b/gi, "")
    .replace(/\bPROBESEED\b/gi, "")
    .replace(/\b(JL-SMOKE|PROBE|SEED|SMOKE)[-_]?\w*/gi, "")
    .replace(/\bTransport\s+PROBE\w*/gi, "Transportation")
    .replace(/\bavailable_to_claim\b/gi, "Needs an owner")
    .replace(/\bwork_item\b/gi, "open work")
    .replace(/\bcare_event\b/gi, "care event")
    .replace(/\bsource_type\b/gi, "source")
    // Raw ISO timestamps embedded in free text
    .replace(
      /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?\b/g,
      (iso) => {
        try {
          return formatCareInstantLayered(iso) || "recently";
        } catch {
          return "recently";
        }
      },
    )
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

/** Map internal work-item status enums to plain care language. */
export function workStatusLabel(status: unknown): string {
  switch (String(status ?? "").toLowerCase()) {
    case "available_to_claim":
    case "unassigned":
      return "Needs an owner";
    case "claimed":
    case "assigned":
      return "Assigned";
    case "accepted":
      return "Accepted";
    case "in_progress":
      return "In progress";
    case "declined":
      return "Declined — still needs an owner";
    case "blocked":
    case "clarification_required":
    case "correction_required":
      return "Needs clarification";
    case "escalated":
      return "Escalating";
    case "completed":
      return "Completed";
    case "cancelled":
    case "canceled":
      return "Cancelled";
    case "awaiting_approval":
    case "awaiting_external_confirmation":
    case "provider_confirmation_pending":
      return "Waiting for provider confirmation";
    case "expired":
    case "missed":
      return "Past due";
    default:
      return status ? String(status).replace(/_/g, " ") : "Open";
  }
}

/** Map notification / event source_type to human labels. */
export function sourceTypeLabel(raw: unknown): string {
  const s = String(raw ?? "").toLowerCase();
  if (!s || s === "care") return "Care update";
  if (s === "work_item") return "Open work";
  if (s === "care_event" || s === "event") return "Care event";
  if (s === "handoff") return "Handoff";
  if (s === "correction") return "Correction";
  if (s === "schedule_proposal" || s === "schedule") return "Schedule";
  if (s === "notification") return "Notification";
  return s.replace(/_/g, " ");
}

/** Format any free-text care line for ordinary UI (no enums, no smoke tags). */
export function humanCareLine(text: unknown): string {
  return stripLabResidue(String(text ?? ""));
}

