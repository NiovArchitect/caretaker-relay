/**
 * Client-side shift phase labels — mirrors server shift-relay-access windows.
 * Display language is caregiving, not technical.
 */

export type ShiftAssignmentLite = {
  id: string;
  careRecipientId: string;
  assigneePersonId: string;
  assigneeDisplayName: string;
  status: string;
  shiftStart: string;
  shiftEnd: string;
  timezone?: string;
  scopeNote?: string;
  handoffId?: string;
  dataDomains?: string[];
};

export type ShiftUiPhase =
  | "invited"
  | "scheduled"
  | "pre_shift"
  | "active"
  | "ending"
  | "documentation_window"
  | "completed"
  | "expired"
  | "revoked"
  | "replaced"
  | "declined"
  | "other";

export const PRE_SHIFT_WINDOW_MS = 2 * 60 * 60 * 1000;
export const DOC_WINDOW_MS = 2 * 60 * 60 * 1000;
export const ENDING_WINDOW_MS = 15 * 60 * 1000;

export function deriveShiftUiPhase(
  a: ShiftAssignmentLite,
  nowMs = Date.now(),
): ShiftUiPhase {
  const st = a.status;
  if (st === "invited") return "invited";
  if (st === "declined") return "declined";
  if (st === "revoked") return "revoked";
  if (st === "replaced") return "replaced";
  if (st === "expired") return "expired";
  if (st === "cancelled" || st === "missed") return "other";

  const start = Date.parse(a.shiftStart);
  const end = Date.parse(a.shiftEnd);
  if (Number.isNaN(start) || Number.isNaN(end)) {
    if (st === "active") return "active";
    if (st === "completed") return "completed";
    if (st === "accepted" || st === "scheduled") return "scheduled";
    return "other";
  }

  if (st === "completed") {
    if (nowMs <= end + DOC_WINDOW_MS) return "documentation_window";
    return "completed";
  }

  if (nowMs < start - PRE_SHIFT_WINDOW_MS) return "scheduled";
  if (nowMs < start) return "pre_shift";
  if (nowMs <= end) {
    if (nowMs >= end - ENDING_WINDOW_MS) return "ending";
    return "active";
  }
  if (nowMs <= end + DOC_WINDOW_MS) return "documentation_window";
  return "expired";
}

export function formatShiftTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function phaseHeadline(phase: ShiftUiPhase): string {
  switch (phase) {
    case "invited":
      return "Shift invitation";
    case "scheduled":
      return "Your assignment is confirmed";
    case "pre_shift":
      return "Pre-shift briefing";
    case "active":
      return "Active shift";
    case "ending":
      return "Shift ending soon";
    case "documentation_window":
      return "Your shift has ended";
    case "completed":
    case "expired":
      return "This assignment has ended";
    case "revoked":
      return "This assignment was ended";
    case "replaced":
      return "Another caregiver has this shift";
    case "declined":
      return "Shift declined";
    default:
      return "Shift";
  }
}

export function phaseGuidance(phase: ShiftUiPhase, endLabel?: string): string {
  switch (phase) {
    case "invited":
      return "Accept only if you can cover this shift. Care details stay closed until you accept.";
    case "scheduled":
      return "Your care briefing becomes available closer to the shift start time.";
    case "pre_shift":
      return "Review the handoff, tasks, and schedule for this visit only.";
    case "active":
      return "Record what you do and observe. Save as you go.";
    case "ending":
      return "Finish open tasks and prepare a handoff before you leave.";
    case "documentation_window":
      return endLabel
        ? `You can finish your handoff or correct your own notes until ${endLabel}. Broad care browsing is closed.`
        : "You can finish your handoff or correct your own notes for a short time. Broad care browsing is closed.";
    case "expired":
    case "completed":
      return "You no longer have access to this care space for this assignment.";
    case "revoked":
      return "Access for this assignment is no longer active.";
    default:
      return "";
  }
}

export function allowsGeneralRelay(phase: ShiftUiPhase): boolean {
  return phase === "pre_shift" || phase === "active" || phase === "ending";
}

export function allowsDocumentationOnly(phase: ShiftUiPhase): boolean {
  return phase === "documentation_window";
}
