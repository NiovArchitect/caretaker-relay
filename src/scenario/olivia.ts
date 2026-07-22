/**
 * Canonical controlled lab scenario — UI presentation layer.
 * Substrate seed lives in @caretaker-relay/care-domain scenario module.
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

export const people: Record<string, Person> = {
  sadeil: foundationPeople.sadeil,
  maya: foundationPeople.maya,
  walter: foundationPeople.walter,
  drShah: foundationPeople.drShah,
  pt: foundationPeople.pt,
};

export const circle: CareCircleMember[] = [
  {
    id: "m-maya",
    person: people.maya,
    roleLabel: "Daughter",
    relationshipRole: "adult_child",
    nextInvolvement: "Next visit tomorrow",
    lastUpdate: "Confirmed tomorrow's visit",
    helpsWith: ["Daily updates", "Appointments", "Care plan"],
    access: {
      informationCategories: ["Daily updates", "Appointments", "Care plan"],
      allowedActions: ["receive_updates", "view_plan", "view_appointments"],
      canEscalate: true,
      authorityLimits: ["Cannot change medication schedule"],
    },
  },
  {
    id: "m-walter",
    person: people.walter,
    roleLabel: "Home caregiver",
    relationshipRole: "paid_caregiver",
    nextInvolvement: "Visit today at 4 PM",
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
    roleLabel: "Primary care",
    relationshipRole: "physician",
    lastUpdate: "Last update July 19",
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
    title: "Maya visit",
    whenLabel: "Tomorrow",
    status: "scheduled",
  },
];

export const observations: ObservationItem[] = [
  {
    id: "obs-fatigue",
    summary: "More fatigue after lunch",
    whenLabel: "Today",
    source: {
      id: "src-walter-fatigue",
      kind: "professional_note",
      label: "Walter visit note",
      actorName: "Walter",
      recordedAt: "2026-07-22T13:30:00Z",
      whyVisible:
        "Walter mentioned increased fatigue during today's visit.",
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
  caregiverName: people.sadeil.displayName,
  careRecipient,
  needsYou,
  sinceYesterday: [
    "Walter noticed more fatigue after lunch",
    "PT moved to 2:30 PM",
    "Maya confirmed tomorrow's visit",
  ],
  relayHandled: [
    "Updated Maya",
    "Updated the schedule",
    "Saved yesterday's care summary",
  ],
};

/** Static demo handoff — DEMO_ONLY until a live foundation handoff exists. */
export const handoff: CareHandoff = {
  id: "ho-demo-static",
  careRecipientId: careRecipient.id,
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
