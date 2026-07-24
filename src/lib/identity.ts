/**
 * Presentation-layer identity resolution.
 * Technical person/recipient IDs must never appear in ordinary caregiver UI.
 */

const PERSON_NAMES: Record<string, string> = {
  "p-sadeil": "Marcus Carter",
  "p-maya": "Maya Bennett",
  "p-walter": "Daniel Kim",
  "p-dr-shah": "Dr. Priya Shah",
  "p-pt": "Physical Therapy",
  "p-unauthorized": "Unauthorized person",
  "p-other-hh": "Other household caregiver",
  system: "System",
};

const RECIPIENT_NAMES: Record<string, string> = {
  "cr-olivia": "Evelyn Carter",
  "cr-robert": "Robert Hale",
  "cr-maya-as-recipient": "Other care recipient",
};

/** Forbidden patterns for automated UI scans (ordinary caregiver surfaces). */
export const FORBIDDEN_ID_PATTERNS = [
  /\bcr-olivia\b/i,
  /\bcr-robert\b/i,
  /\bp-sadeil\b/i,
  /\bp-maya\b/i,
  /\bp-walter\b/i,
  /\bp-dr-shah\b/i,
  /\bcare object\b/i,
  /\blay continuity\b/i,
  /\blay\s*[→\-–—]\s*lay\b/i,
  /\bcompatible dimensions\b/i,
  /\binvite lifecycle\b/i,
  /\bcreate token\b/i,
];

export function resolvePersonName(
  id: string | null | undefined,
  fallback?: string,
): string {
  if (!id) return fallback ?? "Someone in the care circle";
  const known = PERSON_NAMES[id];
  if (known) return known;
  if (/^p-|^cr-/.test(id)) {
    return fallback ?? "Care team member";
  }
  return id;
}

export function resolveRecipientName(
  id: string | null | undefined,
  fallback?: string,
): string {
  if (!id) return fallback ?? "Care recipient";
  return RECIPIENT_NAMES[id] ?? fallback ?? "Care recipient";
}

export function humanizeKey(key: string): string {
  const map: Record<string, string> = {
    id: "Reference",
    name: "Name",
    dose: "Dose",
    scheduleLabel: "Schedule",
    authorizedBy: "Authorized by",
    authorizedAt: "Effective",
    authorizedAtLabel: "Effective",
    administeredByPersonId: "Given by",
    careRecipientId: "Care recipient",
    personId: "Person",
    actorPersonId: "Recorded by",
    fromPersonId: "From",
    toPersonId: "To",
    recordedDose: "Reported amount",
    doseRecorded: "Reported amount",
    administeredAt: "Given at",
    occurredAt: "When",
    observedAt: "When",
    startsAt: "Starts",
    startsAtLabel: "When",
    endsAt: "Ends",
    location: "Location",
    status: "Status",
    epistemicStatus: "Certainty",
    safetyClass: "Priority",
    summary: "Summary",
    statement: "What happened",
    title: "Title",
    reason: "Why",
    message: "Message",
    scheduleTime: "Take at",
    windowStart: "Window starts",
    windowEnd: "Window ends",
    mealRelation: "With food / meal",
    route: "Route",
    strength: "Strength",
    specialInstructions: "Special instructions",
    lastAdministeredAt: "Last recorded",
    lastAdministeredBy: "Last given by",
    nextDueLabel: "Next due",
    phone: "Phone",
    email: "Email",
    preferredContact: "Preferred contact",
    roleLabel: "Role",
  };
  if (map[key]) return map[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

/** Fields that are technical and should not render in caregiver detail views. */
export const HIDDEN_TECHNICAL_KEYS = new Set([
  "id",
  "careRecipientId",
  "householdId",
  "scheduleId",
  "source",
  "evidenceMode",
  "supersededById",
  "intendedRecipientPersonId",
  "actorPersonId",
  "personId",
  "fromPersonId",
  "toPersonId",
  "administeredByPersonId",
  "assigneePersonId",
  "rawExcerpt",
  "kind",
  "type",
  "tags",
  "confidence",
  "dimension",
  "recorded",
  "authorized",
]);

export function isTechnicalIdValue(value: string): boolean {
  return /^(cr-|p-|hh-|med-|apt-|obs-|ho-|src-|rel-|consent-|sess-)/i.test(
    value.trim(),
  );
}

export type ContactCard = {
  personId: string;
  displayName: string;
  roleLabel: string;
  relationship: string;
  phone?: string;
  email?: string;
  preferredContact?: string;
  availability?: string;
  helpsWith: string[];
  accessPlain: string;
};

/** Synthetic safe contact data (reserved example range style). */
export const SYNTHETIC_CONTACTS: Record<string, ContactCard> = {
  "p-maya": {
    personId: "p-maya",
    displayName: "Maya Bennett",
    roleLabel: "Family / friend caregiver",
    relationship: "Adult child",
    phone: "+1-555-0102",
    email: "maya.bennett@example.com",
    preferredContact: "Text or call",
    availability: "Usually available after 3:00 PM weekdays",
    helpsWith: ["Afternoon coverage", "Appointments", "Daily updates"],
    accessPlain: "Sees daily updates, appointments, and the care plan.",
  },
  "p-walter": {
    personId: "p-walter",
    displayName: "Daniel Kim",
    roleLabel: "Professional caregiver",
    relationship: "In-home professional caregiver",
    phone: "+1-555-0103",
    email: "daniel.kim@example.com",
    preferredContact: "Call during visit windows",
    availability: "Scheduled in-home visits",
    helpsWith: ["Care tasks", "Mobility support", "Visit notes"],
    accessPlain: "Sees care tasks, instructions, and appointments for visits.",
  },
  "p-dr-shah": {
    personId: "p-dr-shah",
    displayName: "Dr. Priya Shah",
    roleLabel: "Primary care physician",
    relationship: "Prescribing clinician",
    phone: "+1-555-0199",
    email: "priya.shah.clinic@example.com",
    preferredContact: "Clinic phone during business hours",
    availability: "Clinic hours weekdays 9:00 AM – 4:00 PM",
    helpsWith: ["Medication instructions", "Clinical guidance"],
    accessPlain:
      "Sees health observations and medication record relevant to care. Does not see private family social chatter.",
  },
  "p-sadeil": {
    personId: "p-sadeil",
    displayName: "Marcus Carter",
    roleLabel: "Primary family caregiver",
    relationship: "Spouse / primary family",
    phone: "+1-555-0101",
    preferredContact: "Call or in-app message",
    availability: "Primary daytime coverage",
    helpsWith: ["Daily care", "Coordination", "Medication recording"],
    accessPlain: "Full care-circle access for this recipient.",
  },
  "p-pt": {
    personId: "p-pt",
    displayName: "North County Physical Therapy",
    roleLabel: "Therapy service",
    relationship: "Therapy clinic",
    phone: "+1-555-0140",
    preferredContact: "Clinic phone",
    availability: "By appointment",
    helpsWith: ["Mobility sessions", "Therapy schedule"],
    accessPlain: "Sees appointments and mobility-related notes.",
  },
};
