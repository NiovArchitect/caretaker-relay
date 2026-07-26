/**
 * Decision-ready care projections — built from authorized care state.
 * LLM must not reconstruct the full longitudinal record each turn.
 */

import { resolvePersonName } from "../identity";
import {
  formatCareDateTimeRecent,
  plainDiscrepancyMessage,
  shiftBucketLabel,
} from "../humanCopy";
import { clusterObservations } from "../observations";
import type { CareStateSnapshot } from "../../foundation/careClient";

export type RecentChangeLine = {
  text: string;
  at?: string;
  whenLabel: string;
  bucket: string;
  who?: string;
  status?: string;
  type?: string;
};

export type CareProjections = {
  recipientId: string;
  recipientName: string;
  CURRENT_MEDICATIONS: Array<Record<string, unknown>>;
  NEXT_24H_TASKS: string[];
  NEXT_APPOINTMENT: Record<string, unknown> | null;
  OPEN_UNCERTAINTIES: string[];
  /** Actionable open-item cards with safe next steps (no clinical invent). */
  OPEN_ITEM_ACTIONS: Array<{
    summary: string;
    nextSteps: string[];
  }>;
  LATEST_PROVIDER_INSTRUCTIONS: string[];
  RECENT_CHANGES: string[];
  RECENT_CHANGE_LINES: RecentChangeLine[];
  CARE_TEAM_NOW: Array<{ name: string; role: string; phone?: string }>;
  LAST_MEDICATION_ADMINISTRATIONS: Array<Record<string, unknown>>;
  RECENT_OBSERVATION_CLUSTERS: Array<{
    theme: string;
    count: number;
    sources: string[];
    mostRecentLabel: string;
  }>;
  ACTIVE_HANDOFF: {
    whatChanged: string[];
    stillNeedsAttention: string[];
    toName?: string;
  } | null;
  REMINDERS: Array<{
    id: string;
    kind: "medication" | "appointment";
    title: string;
    whenLabel: string;
    phase: "day_before" | "hours_before" | "due" | "overdue" | "upcoming";
    leaveByLabel?: string;
    location?: string;
    mapsUrl?: string;
  }>;
  FACILITY_CONTEXT: Array<{
    name: string;
    address: string;
    phone: string;
    mapsUrl: string;
    note: string;
  }>;
  DEMENTIA_WATCH: string[];
  DSP_SUPPORT_NOTES: string[];
};

/** Synthetic public facility for evaluation — not a real patient relationship. */
export const SYNTHETIC_FACILITIES = {
  pt: {
    name: "North County Physical Therapy (synthetic evaluation location)",
    address: "1234 Coastal Care Way, Oceanside, CA 92054",
    phone: "+1-555-0140",
    mapsUrl: "https://maps.google.com/?q=Oceanside+CA+physical+therapy",
    note: "Public facility information used with a synthetic appointment for product evaluation. Not a real patient relationship.",
    travelMinutes: 18,
  },
  clinic: {
    name: "Coastal Family Medicine (synthetic evaluation location)",
    address: "880 Harbor Medical Blvd, Carlsbad, CA 92008",
    phone: "+1-555-0199",
    mapsUrl: "https://maps.google.com/?q=Carlsbad+CA+family+medicine",
    note: "Public facility information used with a synthetic care relationship for evaluation only.",
    travelMinutes: 22,
  },
} as const;

function str(v: unknown): string {
  return v == null ? "" : String(v);
}

export function buildProjections(input: {
  state: CareStateSnapshot;
  recipientName: string;
  recipientId: string;
  attentionLines?: string[];
  handoff?: {
    whatChanged: string[];
    stillNeedsAttention: string[];
    toPersonId?: string;
  } | null;
  now?: Date;
}): CareProjections {
  const now = input.now ?? new Date();
  const meds = input.state.medicationSchedules ?? [];
  const apts = input.state.appointments ?? [];
  const obs = input.state.observations ?? [];
  const reviews = input.state.openSafetyReviews ?? [];
  const events = input.state.events ?? [];
  const records = input.state.medicationRecords ?? [];

  const OPEN_UNCERTAINTIES = [
    ...reviews.map((r) =>
      plainDiscrepancyMessage(str(r.reason ?? r.message), input.recipientName),
    ),
    ...(input.attentionLines ?? []).map((l) =>
      plainDiscrepancyMessage(l, input.recipientName),
    ),
  ].filter(Boolean);

  const LATEST_PROVIDER_INSTRUCTIONS = meds.map((m) => {
    const name = str(m.name);
    const dose = str(m.dose);
    const when = str(m.scheduleTime ?? m.scheduleLabel);
    const by = str(m.authorizedBy);
    const meal = str(m.mealRelation);
    return [name, dose, when, meal, by ? `Authorized by ${by}` : ""]
      .filter(Boolean)
      .join(" · ");
  });

  // Chronological recent changes with human times — skip superseded
  const changeSource = events
    .slice()
    .filter((e) => {
      const st = str(e.epistemicStatus).toUpperCase();
      return st !== "SUPERSEDED" && !str(e.supersededById);
    })
    .sort((a, b) =>
      str(b.occurredAt ?? b.recordedAt ?? "").localeCompare(
        str(a.occurredAt ?? a.recordedAt ?? ""),
      ),
    );

  // Collapse exact same-minute duplicate statements for Relay view
  const seenKeys = new Set<string>();
  const RECENT_CHANGE_LINES: RecentChangeLine[] = [];
  for (const e of changeSource) {
    const at = str(e.occurredAt ?? e.recordedAt ?? "");
    const statement = str(e.statement ?? e.title).trim();
    const minute = at.slice(0, 16);
    const key = `${str(e.type)}|${statement.toLowerCase()}|${minute}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    const who =
      e.source && typeof e.source === "object"
        ? str((e.source as { actorName?: string }).actorName)
        : "";
    const whenLabel = at
      ? formatCareDateTimeRecent(at)
      : "Time not on file";
    const bucket = shiftBucketLabel(at || null);
    const status = str(e.epistemicStatus);
    RECENT_CHANGE_LINES.push({
      text: statement,
      at: at || undefined,
      whenLabel,
      bucket,
      who: who || undefined,
      status: status || undefined,
      type: str(e.type) || undefined,
    });
    if (RECENT_CHANGE_LINES.length >= 10) break;
  }

  const RECENT_CHANGES = RECENT_CHANGE_LINES.map((line) => {
    const who = line.who ? ` · ${line.who}` : "";
    const st = line.status ? ` [${line.status}]` : "";
    return `${line.text}${st} · ${line.whenLabel}${who}`;
  });

  const OPEN_ITEM_ACTIONS = OPEN_UNCERTAINTIES.slice(0, 4).map((summary) => ({
    summary,
    nextSteps: [
      "Review the medication label or packaging against the authorized care plan.",
      "If still unclear, confirm with an authorized care-team member (do not invent a dose).",
      "Record who confirmed, when, and what was verified before marking resolved.",
      "Keep the original report on file — closing does not erase prior evidence.",
    ],
  }));

  const clusters = clusterObservations(obs as never[]).map((c) => ({
    theme: c.theme,
    count: c.count,
    sources: c.sources,
    mostRecentLabel: c.mostRecentLabel,
  }));

  // Next appointment: prefer soonest with label
  let NEXT_APPOINTMENT: Record<string, unknown> | null = null;
  if (apts.length) {
    const sorted = [...apts].sort((a, b) =>
      str(a.startsAt).localeCompare(str(b.startsAt)),
    );
    NEXT_APPOINTMENT = sorted[0] ?? null;
  }

  const REMINDERS = buildReminders(meds, apts, now);
  const FACILITY_CONTEXT = [
    {
      name: SYNTHETIC_FACILITIES.pt.name,
      address: SYNTHETIC_FACILITIES.pt.address,
      phone: SYNTHETIC_FACILITIES.pt.phone,
      mapsUrl: SYNTHETIC_FACILITIES.pt.mapsUrl,
      note: SYNTHETIC_FACILITIES.pt.note,
    },
    {
      name: SYNTHETIC_FACILITIES.clinic.name,
      address: SYNTHETIC_FACILITIES.clinic.address,
      phone: SYNTHETIC_FACILITIES.clinic.phone,
      mapsUrl: SYNTHETIC_FACILITIES.clinic.mapsUrl,
      note: SYNTHETIC_FACILITIES.clinic.note,
    },
  ];

  return {
    recipientId: input.recipientId,
    recipientName: input.recipientName,
    CURRENT_MEDICATIONS: meds,
    NEXT_24H_TASKS: [
      ...meds.map((m) => {
        const t = str(m.nextDueLabel ?? m.scheduleTime ?? m.scheduleLabel);
        return `${str(m.name)} ${str(m.dose)}${t ? ` · ${t}` : ""}`.trim();
      }),
      ...(NEXT_APPOINTMENT
        ? [
            `${str(NEXT_APPOINTMENT.title)} · ${str(NEXT_APPOINTMENT.startsAtLabel ?? NEXT_APPOINTMENT.startsAt)}`,
          ]
        : []),
    ],
    NEXT_APPOINTMENT,
    OPEN_UNCERTAINTIES: [...new Set(OPEN_UNCERTAINTIES)].slice(0, 6),
    OPEN_ITEM_ACTIONS,
    LATEST_PROVIDER_INSTRUCTIONS,
    RECENT_CHANGES,
    RECENT_CHANGE_LINES,
    CARE_TEAM_NOW: [
      { name: "Marcus Carter", role: "Primary family caregiver", phone: "+1-555-0101" },
      { name: "Maya Bennett", role: "Family / friend caregiver", phone: "+1-555-0102" },
      {
        name: "Daniel Kim",
        role: "Professional caregiver / DSP support",
        phone: "+1-555-0103",
      },
      {
        name: "Dr. Priya Shah",
        role: "Primary care physician",
        phone: "+1-555-0199",
      },
    ],
    LAST_MEDICATION_ADMINISTRATIONS: records.slice(-5),
    RECENT_OBSERVATION_CLUSTERS: clusters,
    ACTIVE_HANDOFF: input.handoff
      ? {
          whatChanged: input.handoff.whatChanged,
          stillNeedsAttention: input.handoff.stillNeedsAttention,
          toName: resolvePersonName(input.handoff.toPersonId),
        }
      : null,
    REMINDERS,
    FACILITY_CONTEXT,
    DEMENTIA_WATCH: [
      "Medication timing and with-food instructions",
      "Dizziness or balance changes after meals",
      "Fatigue after lunch compared with baseline",
      "Hydration and meal completion",
      "Mobility safety around transfers",
    ],
    DSP_SUPPORT_NOTES: [
      "Person-centered: respect Evelyn's pace and preferred routine around lunch",
      "Document observations before leaving; do not invent clinical conclusions",
      "Medication assist only per current authorized care plan",
      "Escalate unresolved medication mismatch to family primary + clinic",
      "Share only role-authorized information with the next caregiver",
    ],
  };
}

function buildReminders(
  meds: Array<Record<string, unknown>>,
  apts: Array<Record<string, unknown>>,
  now: Date,
): CareProjections["REMINDERS"] {
  const out: CareProjections["REMINDERS"] = [];

  for (const m of meds) {
    const name = str(m.name) || "Medication";
    const time = str(m.scheduleTime ?? "12:00 PM");
    const window = [str(m.windowStart), str(m.windowEnd)]
      .filter(Boolean)
      .join(" – ");
    out.push({
      id: `rem-med-${str(m.id) || name}`,
      kind: "medication",
      title: `${name} ${str(m.dose)}`.trim(),
      whenLabel: window ? `${time} (window ${window})` : time,
      phase: "upcoming",
    });
  }

  for (const a of apts) {
    const title = str(a.title) || "Appointment";
    const when = str(a.startsAtLabel ?? a.startsAt);
    const loc = str(a.location);
    const isPt = /physical therapy|pt/i.test(title);
    const fac = isPt ? SYNTHETIC_FACILITIES.pt : SYNTHETIC_FACILITIES.clinic;
    const leaveBy = isPt
      ? "Leave by about 2:30 PM for a 3:00 PM session (about 18 min travel + park)"
      : "Leave with extra time for parking";
    out.push({
      id: `rem-apt-${str(a.id) || title}`,
      kind: "appointment",
      title,
      whenLabel: when,
      phase: /moved|reschedul/i.test(str(a.status)) ? "upcoming" : "hours_before",
      leaveByLabel: leaveBy,
      location: loc || fac.address,
      mapsUrl: fac.mapsUrl,
    });
    // Day-before style advisory always present for evaluation
    out.push({
      id: `rem-apt-day-${str(a.id) || title}`,
      kind: "appointment",
      title: `${title} (day-before reminder)`,
      whenLabel: `Reminder before ${when}`,
      phase: "day_before",
      location: loc || fac.address,
    });
  }

  void now;
  return out;
}

export function formatReminderDigest(p: CareProjections): string {
  if (!p.REMINDERS.length) return "No upcoming medication or appointment reminders.";
  return p.REMINDERS.slice(0, 6)
    .map((r) => {
      const bits = [
        r.kind === "medication" ? "Medication" : "Appointment",
        r.title,
        r.whenLabel,
        r.leaveByLabel,
        r.location,
      ].filter(Boolean);
      return `• ${bits.join(" · ")}`;
    })
    .join("\n");
}
