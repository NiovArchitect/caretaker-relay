/**
 * Canonical care-event model (client contract + documentation spine).
 * Server remains authoritative for authorization, storage, and audit.
 *
 * SECURITY: Event ingestion must never use role claim alone.
 * Every write requires membership (or provisional draft scope) + purpose.
 */

/** Lifecycle for schedule / action items. */
export type ScheduleState =
  | "proposed"
  | "requested"
  | "tentative"
  | "confirmed"
  | "cancelled"
  | "rescheduled"
  | "completed"
  | "missed";

/** Provenance of a care fact or observation. */
export type CareProvenance = {
  source_system: string;
  source_record_id?: string;
  actor_principal_id: string;
  actor_active_role?: string;
  authority_basis:
    | "membership"
    | "assignment"
    | "invitation"
    | "consent"
    | "provisional_draft"
    | "system";
  /** When the care event happened (or is scheduled). */
  event_time: string;
  /** When it was reported into Relay. */
  report_time: string;
  confidence: "confirmed" | "reported" | "inferred" | "unknown";
  lineage_parent_ids?: string[];
};

export type CareEventType =
  | "observation"
  | "medication_confirmation"
  | "appointment"
  | "task"
  | "incident"
  | "handoff"
  | "message"
  | "document"
  | "consent_change"
  | "access_change"
  | "correction"
  | "schedule_change";

/**
 * Canonical care event — shared across roles after authorization.
 * Role-specific UX projects subsets; AI retrieves only authorized events.
 */
export type CareEvent = {
  id: string;
  care_recipient_id: string;
  type: CareEventType;
  summary: string;
  payload?: Record<string, unknown>;
  schedule_state?: ScheduleState;
  provenance: CareProvenance;
  /** Soft-delete / correction pointer */
  superseded_by?: string;
  conflict_with?: string[];
  created_at: string;
  updated_at: string;
};

/** Consequential actions that require human confirmation before execution. */
export const CONSEQUENTIAL_ACTIONS = [
  "notify_helpers",
  "reschedule_appointment",
  "book_external",
  "change_medication_plan",
  "revoke_access",
  "export_phi",
  "escalate_clinical",
  "complete_shift_handoff",
] as const;

export type ConsequentialAction = (typeof CONSEQUENTIAL_ACTIONS)[number];

export function isConsequentialAction(action: string): boolean {
  return (CONSEQUENTIAL_ACTIONS as readonly string[]).includes(action);
}

/**
 * Distinguish event time from report time for Relay summaries.
 */
export function formatEventVsReport(p: CareProvenance): string {
  if (p.event_time === p.report_time) {
    return `At ${p.event_time} (${p.confidence})`;
  }
  return `Event ${p.event_time}; reported ${p.report_time} (${p.confidence})`;
}

/**
 * Dedupe key: same recipient + type + event_time + source + actor.
 * Server should enforce; client uses for UI merge only.
 */
export function careEventDedupeKey(e: Pick<CareEvent, "care_recipient_id" | "type" | "provenance">): string {
  const p = e.provenance;
  return [
    e.care_recipient_id,
    e.type,
    p.event_time,
    p.source_system,
    p.source_record_id ?? "",
    p.actor_principal_id,
  ].join("|");
}
