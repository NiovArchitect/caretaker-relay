/**
 * Canonical controlled lab scenario — UI presentation layer.
 * Synthetic household: Evelyn Carter (care recipient) + Marcus Carter (primary).
 * Substrate seed: @caretaker-relay/care-domain (technical IDs retained for API).
 */

import type {
  Appointment,
  CareCircleMember,
  CareHandoff,
  CareRecipient,
  CareTask,
  MedicationSchedule,
  ObservationItem,
  Person,
  TodayModel,
} from "../domain/types";
import {
  careRecipient as foundationRecipient,
  people as foundationPeople,
  medicationSchedule as foundationMed,
  oracle as foundationOracle,
  DEMO_UTTERANCE as FOUNDATION_DEMO,
  UNSAFE_PROTOCOL_UTTERANCE as FOUNDATION_UNSAFE,
} from "@caretaker-relay/care-domain";

export const PRODUCT = {
  id: "caretaker-relay",
  name: "Caretaker Relay",
} as const;

export const careRecipient: CareRecipient = foundationRecipient;

/** Technical keys map to stable lab IDs; display names are synthetic. */
export const people: Record<string, Person> = {
  marcus: foundationPeople.sadeil,
  sadeil: foundationPeople.sadeil, // alias for lab login path
  maya: foundationPeople.maya,
  daniel: foundationPeople.walter,
  walter: foundationPeople.walter, // alias
  drShah: foundationPeople.drShah,
  pt: foundationPeople.pt,
};

export const circle: CareCircleMember[] = [
  {
    id: "m-maya",
    person: people.maya,
    roleLabel: "Family / friend caregiver",
    relationshipRole: "adult_child",
    nextInvolvement: "Arriving later today",
    lastUpdate: "Will cover the afternoon",
    helpsWith: ["Daily updates", "Appointments", "Care plan"],
    access: {
      informationCategories: ["Daily updates", "Appointments", "Care plan"],
      allowedActions: ["receive_updates", "view_plan", "view_appointments"],
      canEscalate: true,
      authorityLimits: ["Cannot change medication schedule"],
    },
  },
  {
    id: "m-daniel",
    person: people.daniel,
    roleLabel: "Professional caregiver",
    relationshipRole: "paid_caregiver",
    nextInvolvement: "In-home visit today",
    lastUpdate: "Noted fatigue after lunch",
    helpsWith: ["Care tasks", "Care instructions", "Appointments"],
    access: {
      informationCategories: [
        "Care tasks",
        "Care instructions",
        "Appointments",
      ],
      allowedActions: ["record_observations", "complete_tasks", "view_schedule"],
      canEscalate: true,
      authorityLimits: ["Cannot share records outside care plan"],
    },
  },
  {
    id: "m-dr-shah",
    person: people.drShah,
    roleLabel: "Health professional",
    relationshipRole: "physician",
    lastUpdate: "Last instruction update July 19",
    helpsWith: ["Health observations", "Medication record"],
    access: {
      informationCategories: ["Health observations", "Medication record"],
      allowedActions: ["view_health", "update_instructions"],
      canEscalate: true,
      authorityLimits: ["Clinical authority via instructions only"],
    },
  },
  {
    id: "m-pt",
    person: people.pt,
    roleLabel: "Therapy",
    relationshipRole: "therapist",
    nextInvolvement: "Thursday at 2:30 PM",
    helpsWith: ["Mobility", "Appointments"],
    access: {
      informationCategories: ["Appointments", "Mobility observations"],
      allowedActions: ["view_appointments", "receive_relevant_notes"],
      canEscalate: false,
      authorityLimits: ["Session-scoped"],
    },
  },
];

export const medicationSchedule: MedicationSchedule = {
  id: foundationMed.id,
  name: foundationMed.name,
  dose: foundationMed.dose,
  scheduleLabel: foundationMed.scheduleLabel,
  authorizedBy: foundationMed.authorizedBy,
  authorizedAtLabel: foundationMed.authorizedAt,
  source: foundationMed.source,
};

export const appointments: Appointment[] = [
  {
    id: "apt-pt",
    title: "Physical therapy",
    whenLabel: "Thursday 2:30 PM (moved)",
    status: "moved",
  },
  {
    id: "apt-maya",
    title: "Maya Bennett visit",
    whenLabel: "Later today (~4 PM)",
    status: "scheduled",
  },
];

export const observations: ObservationItem[] = [
  {
    id: "obs-fatigue",
    summary: "More fatigue after lunch",
    whenLabel: "Today",
    source: {
      id: "src-daniel-fatigue",
      kind: "professional_note",
      label: "Daniel Kim visit note",
      actorName: "Daniel Kim",
      recordedAt: "2026-07-22T13:30:00Z",
      whyVisible:
        "Daniel mentioned increased fatigue during today's visit.",
    },
  },
];

export const needsYou: CareTask[] = [
  {
    id: "task-med-morning",
    title: "Morning medication",
    dueLabel: "10:00 AM",
    status: "pending",
    safetyClass: "high",
  },
  {
    id: "task-pt",
    title: "Physical therapy",
    dueLabel: "2:30 PM",
    status: "pending",
    safetyClass: "moderate",
  },
  {
    id: "task-transport",
    title: "Confirm transportation",
    status: "pending",
    safetyClass: "moderate",
  },
];

export const today: TodayModel = {
  greeting: "Good morning",
  caregiverName: people.marcus.displayName,
  careRecipient,
  needsYou,
  sinceYesterday: [
    "Daniel noticed more fatigue after lunch",
    "PT moved to 2:30 PM",
    "Maya confirmed she can cover later today",
  ],
  relayHandled: [
    "Prepared continuity for Maya",
    "Updated the schedule",
    "Saved yesterday's care summary",
  ],
};

/** Static demo handoff — lay→lay continuity (Marcus → Maya). */
export const handoff: CareHandoff = {
  id: "ho-demo-static",
  careRecipientId: careRecipient.id,
  fromPersonId: people.marcus.id,
  toPersonId: people.maya.id,
  whatChanged: [
    "PT moved to Thursday at 2:30 PM",
    "More fatigue was noted after lunch",
    "Lunch medication was recorded",
  ],
  stillNeedsAttention: [
    "Confirm transportation",
    "Evening medication at 7 PM",
  ],
  watch: ["Fatigue was mentioned twice today"],
  sources: [],
  createdAt: "2026-07-22T12:00:00Z",
  evidenceMode: "DEMO_ONLY",
};

export const oracle = foundationOracle;

export const DEMO_UTTERANCE = FOUNDATION_DEMO;
export const UNSAFE_PROTOCOL_UTTERANCE = FOUNDATION_UNSAFE;
