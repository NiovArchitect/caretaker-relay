/**
 * App-layer types.
 * Core care domain types come from foundation; UI presentation may add display fields.
 */

export type {
  SafetyClass,
  SourceKind,
  SourceRef,
  CareRecipient,
  Person,
  AccessScope,
  UnderstoodCareSlice,
  MedicationDiscrepancy,
  VerificationItem,
  VerificationBundle,
  EvidenceMode,
  EpistemicStatus,
  CareCandidate,
  CurrentCareState,
  CareHandoff,
} from "@caretaker-relay/care-domain";

export interface CareTask {
  id: string;
  title: string;
  dueLabel?: string;
  status: "pending" | "done" | "in_progress" | "cancelled";
  safetyClass: import("@caretaker-relay/care-domain").SafetyClass;
  careRecipientId?: string;
  epistemicStatus?: import("@caretaker-relay/care-domain").EpistemicStatus;
}

export interface Appointment {
  id: string;
  title: string;
  whenLabel: string;
  status: "scheduled" | "moved" | "completed" | "cancelled";
}

export interface MedicationSchedule {
  id: string;
  name: string;
  dose: string;
  scheduleLabel: string;
  authorizedBy: string;
  authorizedAtLabel: string;
  source: import("@caretaker-relay/care-domain").SourceRef;
}

export interface ObservationItem {
  id: string;
  summary: string;
  whenLabel: string;
  source: import("@caretaker-relay/care-domain").SourceRef;
}

export interface CareCircleMember {
  id: string;
  person: import("@caretaker-relay/care-domain").Person;
  roleLabel: string;
  relationshipRole: string;
  nextInvolvement?: string;
  lastUpdate?: string;
  access: import("@caretaker-relay/care-domain").AccessScope;
  helpsWith: string[];
}

export interface RelayMessage {
  id: string;
  role: "user" | "relay" | "system";
  text: string;
  at: string;
}

export interface TodayModel {
  greeting: string;
  caregiverName: string;
  careRecipient: import("@caretaker-relay/care-domain").CareRecipient;
  needsYou: CareTask[];
  sinceYesterday: string[];
  relayHandled: string[];
}

/** Desktop primary nav; Relay is a persistent panel (also mobile destination). */
export type NavTab = "today" | "care" | "people" | "documents" | "relay";
