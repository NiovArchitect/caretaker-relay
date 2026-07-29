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
    // Isolation / campaign markers never belong in caregiver UI
    .replace(/\bALPHA-ONLY:\s*/gi, "")
    .replace(/\bBETA-ONLY:\s*/gi, "")
    .replace(/\bALPHA\s+Podiatry[^\n·]*·?\s*/gi, "Podiatry appointment · ")
    .replace(/\bRobert Hale only\b/gi, "")
    .replace(/\bHarbor Foot Clinic ALPHA\b/gi, "Harbor Foot Clinic")
    .replace(/\bPROBE_[A-Z0-9_]+\b/gi, "")
    .replace(/\bTransport\s+PROBE\w*/gi, "Transportation")
    .replace(/\bCampaign\s+ID[A-Za-z0-9]+\b/gi, "")
    .replace(/\bFlagship continuous transport check\b/gi, "Transportation check")
    .replace(/\bPublic smoke ownership task\b/gi, "Care task")
    .replace(/\bPublic ownership task\b/gi, "Care task")
    .replace(/\bPublic (PreShift|Doc) DSP\b/gi, "a support professional")
    .replace(/\bp-[a-z0-9-]+\b/gi, "a care helper")
    .replace(/\bcr-[a-z0-9-]+\b/gi, "this care recipient")
    .replace(/\bwork-[a-z0-9-]+\b/gi, "a care task")
    .replace(/\bho-[a-z0-9-]+\b/gi, "a care handoff")
    .replace(/\bapt-[a-z0-9-]+\b/gi, "an appointment")
    .replace(/\bavailable_to_claim\b/gi, "Needs a helper")
    .replace(/\bwork_item\b/gi, "open work")
    .replace(/\bcare_event\b/gi, "care event")
    .replace(/\bsource_type\b/gi, "source")
    .replace(/\bresponse_received\b/gi, "response received")
    .replace(/\bunassigned\b/gi, "needs a helper")
    // Adjudication / harness language must never reach lay caregivers
    .replace(/\bJudge\s+demo\s*PT\b/gi, "Physical therapy appointment")
    .replace(/\bJudge\s+PT\b/gi, "Physical therapy appointment")
    .replace(/\bFast\s+PT\b/gi, "Physical therapy appointment")
    .replace(/\bSide\s*[12]\b/gi, "another care report")
    .replace(/\bSchedule\s*\/\s*report conflict\b/gi, "Schedule disagreement")
    .replace(
      /\bMultiple authorized reports disagree\.?\s*Relay will not silently pick one\.?/gi,
      "Two care notes do not match. Open this item to choose which schedule note is correct.",
    )
    .replace(/\bconfirm_side_[ab]\b/gi, "confirm this report")
    .replace(/\bmark_both_reported\b/gi, "keep both notes on file")
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
    .replace(/\s+·\s+·/g, " ·")
    .trim();
}

/** Map internal work-item status enums to plain care language. */
export function workStatusLabel(status: unknown): string {
  switch (String(status ?? "").toLowerCase()) {
    case "available_to_claim":
    case "unassigned":
      return "Needs a helper";
    case "claimed":
    case "assigned":
      return "Someone is handling this";
    case "accepted":
      return "Accepted";
    case "in_progress":
      return "In progress";
    case "declined":
      return "Declined — still needs a helper";
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

/**
 * Visible role clarity for open work cards (product language).
 * Only four primary labels for caregivers — no internal status enums.
 */
export type WorkClarityLabel =
  | "Your care task"
  | "Help needed"
  | "Review required"
  | "Someone else is handling this";

export function workClarityLabel(input: {
  status?: unknown;
  ownerPersonId?: string | null;
  sessionPersonId?: string | null;
  action?: string | null;
}): WorkClarityLabel {
  const status = String(input.status ?? "").toLowerCase();
  const owner = input.ownerPersonId ?? null;
  const me = input.sessionPersonId ?? null;
  const action = String(input.action ?? "").toLowerCase();

  if (owner && me && owner === me) return "Your care task";
  if (
    status === "accepted" ||
    status === "claimed" ||
    status === "in_progress"
  ) {
    if (owner && me && owner === me) return "Your care task";
  }

  const needsReview =
    /review|verification|verify|mismatch|conflict|access|owner|authorization|confirm/i.test(
      action,
    ) ||
    status === "awaiting_approval" ||
    status === "provider_confirmation_pending" ||
    status === "clarification_required" ||
    status === "correction_required";

  if (
    !owner ||
    status === "available_to_claim" ||
    status === "unassigned" ||
    status === "declined"
  ) {
    return needsReview ? "Review required" : "Help needed";
  }

  if (owner && me && owner !== me) return "Someone else is handling this";
  if (status === "assigned" || status === "claimed" || status === "in_progress") {
    return "Someone else is handling this";
  }
  return needsReview ? "Review required" : "Help needed";
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

