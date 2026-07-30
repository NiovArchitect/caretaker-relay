/**
 * Top-level request-class router — runs before care-update extraction.
 * Prevents messaging / scheduling / meta chat from becoming Meal/med cards.
 */

import {
  fetchTodayProjection,
  fetchCareCoverage,
  fetchWorkItems,
  fetchSinceLastVisit,
  getSessionIdentity,
} from "../../foundation/careClient";
import { loadActiveCareRecipientId, resolveCareSpace } from "../careContext";
import { humanCareLine } from "../humanCopy";
import { listAppointmentsLineage } from "../../foundation/careContinuity";

export type RequestClass =
  | "INFORMATION_QUERY"
  | "CARE_REPORT"
  | "OPERATIONAL_ACTION"
  | "META_CONVERSATION"
  | "CANCELLATION_RESPONSE"
  | "CONFIRMATION_RESPONSE"
  | "CLARIFICATION_RESPONSE"
  | "UNKNOWN";

export type ActionFamily =
  | "CARE_TEAM_MESSAGE"
  | "APPOINTMENT_UPDATE"
  | "APPOINTMENT_CANCEL"
  | "TASK_CLAIM"
  | "HANDOFF_PREP"
  | "NONE";

export type ClassifiedRequest = {
  requestClass: RequestClass;
  actionFamily: ActionFamily;
  personHint?: string;
  messageBody?: string;
  appointmentHint?: string;
  timeHint?: string;
  dayHint?: "today" | "tomorrow" | "yesterday";
};

const CANCEL_RE =
  /^(cancel( that| this| it)?|dismiss( that| this| it)?|start over|ignore (that|this|my last)|remove (this|that)( card)?|never ?mind|forget it)\.?$/i;

export function classifyRequestClass(raw: string): ClassifiedRequest {
  const text = raw.trim();
  const q = text.toLowerCase();

  if (CANCEL_RE.test(text)) {
    return { requestClass: "CANCELLATION_RESPONSE", actionFamily: "NONE" };
  }

  // Ordinal / list selection is conversation state — never a care report or confirm
  if (
    /^(the )?(first|second|third|fourth|fifth|last|1st|2nd|3rd|4th|5th)( one)?\.?$/i.test(
      text,
    ) ||
    /^what about the (first|second|third|last)( one)?\.?$/i.test(text)
  ) {
    return { requestClass: "INFORMATION_QUERY", actionFamily: "NONE" };
  }

  if (
    /^(yes|looks right|confirm|confirm my report|do it|send it|apply that)\b/i.test(
      text,
    )
  ) {
    return { requestClass: "CONFIRMATION_RESPONSE", actionFamily: "NONE" };
  }

  // Operational: messaging
  const msg =
    text.match(
      /\b(?:send|text|message|tell|ping|notify)\s+(?:a\s+message\s+to\s+)?([a-z][a-z.'-]*(?:\s+[a-z][a-z.']*)?)\s+(?:saying|that|to say|:)\s+(.+)/i,
    ) ||
    text.match(
      /\b(?:send|text|message|tell)\s+([a-z][a-z.'-]*)\s+["“](.+)["”]/i,
    ) ||
    text.match(/\bmessage\s+([a-z][a-z.'-]*)\s*:\s*(.+)/i);
  if (msg) {
    return {
      requestClass: "OPERATIONAL_ACTION",
      actionFamily: "CARE_TEAM_MESSAGE",
      personHint: msg[1],
      messageBody: msg[2]?.trim(),
    };
  }
  if (
    /\b(send|text|message|tell|notify)\b.+\b(hello|hi|hey|please|that)\b/i.test(
      q,
    ) &&
    !/\b(med|dose|pill|gave|ate|dizzy)\b/i.test(q)
  ) {
    const who = q.match(
      /\b(?:to|tell|message|text|notify)\s+(may|maya|daniel|marcus|dr\.?\s*shah|shah)\b/i,
    );
    const body =
      text.match(/\b(?:saying|that|:)\s+(.+)/i)?.[1]?.trim() || "hello";
    return {
      requestClass: "OPERATIONAL_ACTION",
      actionFamily: "CARE_TEAM_MESSAGE",
      personHint: who?.[1] || "Maya",
      messageBody: body,
    };
  }

  // Operational: appointment change / reschedule
  if (
    /\b(change|move|reschedul|update|set)\b.+\b(time|meeting|appointment|training|pt|therapy|visit)\b/i.test(
      q,
    ) ||
    /\b(meeting|appointment|training|pt|therapy)\b.+\b(to|at)\s+\d/i.test(q)
  ) {
    const time =
      text.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i)?.[1] ||
      text.match(/\b(\d{1,2})\s*(am|pm)\b/i)?.[0];
    const apt =
      text.match(
        /\b(personal training|physical therapy|\bpt\b|therapy|clinic|meeting|appointment)\b/i,
      )?.[1] || "appointment";
    const day = /\btomorrow\b/i.test(q)
      ? "tomorrow"
      : /\btoday\b/i.test(q)
        ? "today"
        : undefined;
    return {
      requestClass: "OPERATIONAL_ACTION",
      actionFamily: "APPOINTMENT_UPDATE",
      appointmentHint: apt,
      timeHint: time,
      dayHint: day,
    };
  }

  if (
    /\b(cancel|call off)\b.+\b(appointment|meeting|training|pt|therapy|visit)\b/i.test(
      q,
    )
  ) {
    return {
      requestClass: "OPERATIONAL_ACTION",
      actionFamily: "APPOINTMENT_CANCEL",
      appointmentHint:
        text.match(
          /\b(personal training|physical therapy|\bpt\b|therapy|clinic|meeting)\b/i,
        )?.[1] || "appointment",
    };
  }

  // Meta conversation
  if (
    /\b(why are you|same response|make (it|that) shorter|not what i meant|you (are|keep) (asking|saying)|canned|be more concise)\b/i.test(
      q,
    )
  ) {
    return { requestClass: "META_CONVERSATION", actionFamily: "NONE" };
  }

  // Information queries (including without ?)
  const info =
    /\?$/.test(text) ||
    /^(what|when|where|who|how|why|did|does|do|is|are|am|was|were|can|should|has|have|show|tell|summarize|give)\b/i.test(
      text,
    ) ||
    /\b(what am i (doing|handling)|on my (shift|plate)|doing today|need to (do|handle)|happened (during|on) the last|last shift|previous (shift|caregiver)|who (is|works|takes)|coming up|still need|need me)\b/i.test(
      q,
    );

  if (info) {
    return { requestClass: "INFORMATION_QUERY", actionFamily: "NONE" };
  }

  // Care report cues
  if (
    /\b(gave|took|seemed|noticed|ate|eaten|dizzy|tired|slept|refused|fell|observed|reported)\b/i.test(
      q,
    )
  ) {
    return { requestClass: "CARE_REPORT", actionFamily: "NONE" };
  }

  return { requestClass: "UNKNOWN", actionFamily: "NONE" };
}

function resolveCareTeamPerson(hint: string | undefined): {
  id: string;
  name: string;
} | null {
  const h = (hint || "").toLowerCase().replace(/\./g, "");
  if (/^may$|maya/.test(h)) return { id: "p-maya", name: "Maya Bennett" };
  if (/daniel|walter|dsp/.test(h))
    return { id: "p-walter", name: "Daniel Kim" };
  if (/marcus|sadeil/.test(h))
    return { id: "p-sadeil", name: "Marcus Carter" };
  if (/shah|priya|doctor|dr\b/.test(h))
    return { id: "p-dr-shah", name: "Dr. Priya Shah" };
  return null;
}

/** Information answers from client projections when server generic-falls-through. */
export async function answerInformationQuery(question: string): Promise<string> {
  const q = question.toLowerCase();
  const space = resolveCareSpace(loadActiveCareRecipientId());
  const name = space.displayName;

  const today = await fetchTodayProjection();
  const work = await fetchWorkItems();
  const coverage = await fetchCareCoverage();
  const since = await fetchSinceLastVisit();
  const apts = await listAppointmentsLineage(space.careRecipientId);

  const priorities: string[] = [];
  if (today.needsYou?.length) {
    priorities.push(...today.needsYou.slice(0, 3).map((x) => humanCareLine(x)));
  } else if (work.ok) {
    const items = [...(work.needsOwner || []), ...(work.workItems || [])].slice(
      0,
      3,
    );
    for (const w of items) {
      priorities.push(humanCareLine(String(w.action ?? "Care task")));
    }
  }

  const isTodayPlan =
    /\b(what am i (doing|handling)|on my plate|doing today|need to (do|handle|focus)|today'?s plan|priorit|what needs me|handle today)\b/i.test(
      q,
    );
  const isShiftPlan =
    /\b(on my shift|this shift|my shift|during (my )?shift|assigned to me|shift today)\b/i.test(
      q,
    );
  const isPrevShift =
    /\b(last shift|previous shift|previous caregiver|before i (got|arrived|came)|happened during)\b/i.test(
      q,
    );

  if (isTodayPlan || isShiftPlan) {
    const lines: string[] = [];
    lines.push(
      isShiftPlan
        ? `For your current coverage with ${name}:`
        : `Here is what matters for ${name} today:`,
    );
    if (priorities.length) {
      lines.push(priorities.map((p) => `• ${p}`).join("\n"));
    } else {
      lines.push("• No urgent open priorities are listed right now.");
    }
    if (today.next?.length) {
      lines.push(
        `Coming up:\n${today.next
          .slice(0, 3)
          .map((x) => `• ${humanCareLine(x)}`)
          .join("\n")}`,
      );
    }
    if (apts.ok && apts.active.length) {
      const a = apts.active[0]!;
      lines.push(
        `Current appointment: ${humanCareLine(a.title || "Appointment")}${
          a.starts_at_label ? ` · ${humanCareLine(String(a.starts_at_label))}` : ""
        }${a.location ? ` · ${humanCareLine(String(a.location))}` : ""}`,
      );
    }
    if (coverage.summary) {
      lines.push(`Coverage: ${humanCareLine(coverage.summary)}`);
    }
    lines.push("Open Today for the full compact plan, or Care for details.");
    return lines.join("\n\n");
  }

  if (isPrevShift) {
    const lines: string[] = [];
    lines.push(`From the previous coverage for ${name}:`);
    if (since.ok && since.briefing?.handoffSummary) {
      lines.push(humanCareLine(since.briefing.handoffSummary));
    }
    if (since.ok && since.briefing?.whatChanged?.length) {
      lines.push(
        since.briefing.whatChanged
          .slice(0, 4)
          .map((c) => `• ${humanCareLine(c.text)}`)
          .join("\n"),
      );
    } else if (today.whatChanged?.length) {
      lines.push(
        today.whatChanged
          .slice(0, 4)
          .map((c) => `• ${humanCareLine(c)}`)
          .join("\n"),
      );
    } else {
      lines.push(
        "• No previous-shift summary is on file yet. Open Care → My shift for the handoff.",
      );
    }
    return lines.join("\n\n");
  }

  // Generic status
  if (/\bhow is\b|\bhow'?s\b|\bstatus\b/i.test(q)) {
    const bits = [
      priorities[0] ? `Needs attention: ${priorities[0]}` : "No urgent item flagged.",
      today.whatChanged?.[0]
        ? `Recent: ${humanCareLine(today.whatChanged[0])}`
        : null,
      coverage.summary ? `Coverage: ${humanCareLine(coverage.summary)}` : null,
    ].filter(Boolean);
    return `For ${name} right now:\n${bits.map((b) => `• ${b}`).join("\n")}`;
  }

  return "";
}

export function buildOperationalPreview(
  classified: ClassifiedRequest,
): { preview: string; pending: PendingOperationalAction | null } {
  const space = resolveCareSpace(loadActiveCareRecipientId());
  const session = getSessionIdentity();

  if (classified.actionFamily === "CARE_TEAM_MESSAGE") {
    const person = resolveCareTeamPerson(classified.personHint);
    if (!person) {
      return {
        preview: `I could not find an authorized care-team member named "${classified.personHint}" for ${space.displayName}. Check People for who is connected.`,
        pending: null,
      };
    }
    const body = classified.messageBody || "hello";
    return {
      preview:
        `I can send an **in-app care-team message** to **${person.name}** about ${space.displayName}:\n\n` +
        `“${body}”\n\n` +
        `This creates an in-app notification for them in this care space. ` +
        `It does **not** send SMS or email unless that is separately configured.\n\n` +
        `Confirm with **Looks right** to send, or **Cancel** to discard.`,
      pending: {
        kind: "CARE_TEAM_MESSAGE",
        toPersonId: person.id,
        toName: person.name,
        body,
        careRecipientId: space.careRecipientId,
        fromPersonId: session.carePersonId,
      },
    };
  }

  if (classified.actionFamily === "APPOINTMENT_UPDATE") {
    const when = classified.timeHint || "the time you said";
    const day =
      classified.dayHint === "tomorrow"
        ? "tomorrow"
        : classified.dayHint === "today"
          ? "today"
          : "the day you mentioned";
    const apt = classified.appointmentHint || "appointment";
    return {
      preview:
        `I can update **${space.displayName}'s internal care schedule** so **${apt}** is at **${when} ${day}**.\n\n` +
        `This changes the care record only — it is **not** an external clinic booking system.\n\n` +
        `Confirm with **Looks right** to apply, or **Cancel** to discard.`,
      pending: {
        kind: "APPOINTMENT_UPDATE",
        title: apt,
        timeLabel: when,
        dayHint: classified.dayHint,
        careRecipientId: space.careRecipientId,
      },
    };
  }

  if (classified.actionFamily === "APPOINTMENT_CANCEL") {
    return {
      preview:
        `I can mark **${classified.appointmentHint || "that appointment"}** as cancelled on ${space.displayName}'s internal schedule (history preserved).\n\n` +
        `Confirm with **Looks right**, or **Cancel** to discard.`,
      pending: {
        kind: "APPOINTMENT_CANCEL",
        title: classified.appointmentHint || "appointment",
        careRecipientId: space.careRecipientId,
      },
    };
  }

  return { preview: "", pending: null };
}

export type PendingOperationalAction =
  | {
      kind: "CARE_TEAM_MESSAGE";
      toPersonId: string;
      toName: string;
      body: string;
      careRecipientId: string;
      fromPersonId: string;
    }
  | {
      kind: "APPOINTMENT_UPDATE";
      title: string;
      timeLabel: string;
      dayHint?: "today" | "tomorrow" | "yesterday";
      careRecipientId: string;
    }
  | {
      kind: "APPOINTMENT_CANCEL";
      title: string;
      careRecipientId: string;
    };

function tokenFromSession(): string | undefined {
  try {
    const raw = sessionStorage.getItem("cr_care_session_v1");
    if (!raw) return undefined;
    return (JSON.parse(raw) as { token?: string }).token;
  } catch {
    return undefined;
  }
}

export async function executePendingOperational(
  pending: PendingOperationalAction,
): Promise<string> {
  if (pending.kind === "CARE_TEAM_MESSAGE") {
    // Durable care-space coordination + target notification (not SMS/email).
    // Prefer coordination over clarification so Maya can list the thread later.
    const token = tokenFromSession();
    if (!token) {
      return "You need to be signed in to send an in-app message. Nothing was delivered.";
    }
    const { carePostCoordination } = await import(
      "../../foundation/careHttpClient"
    );
    const idem =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `coord-${Date.now()}`;
    const r = await carePostCoordination(
      token,
      pending.careRecipientId,
      pending.body,
      pending.toPersonId,
    );
    // carePostCoordination does not take idempotency in signature — server still
    // accepts body key via raw path when available; delivery proof is message id.
    if (r.ok && r.data?.message) {
      void idem;
      return (
        `Sent in-app to **${pending.toName}**: “${pending.body}”.\n\n` +
        `They will see it in their account notifications for this care space. ` +
        `External SMS/email was not claimed.`
      );
    }
    // Fallback: clarification path still creates a durable request + notification
    const { askCaregiverClarification } = await import(
      "../../foundation/careClient"
    );
    const fb = await askCaregiverClarification({
      targetPersonId: pending.toPersonId,
      question: pending.body,
      contextSummary: `In-app care-team message from Relay (not SMS/email)`,
    });
    if (fb.ok) {
      return (
        `Sent in-app to **${pending.toName}**: “${pending.body}”.\n\n` +
        `They will see it in their account notifications for this care space. ` +
        `External SMS/email was not claimed.`
      );
    }
    return `Could not send the in-app message: ${r.ok === false ? r.message : fb.message ?? "error"}. Nothing was delivered.`;
  }

  if (pending.kind === "APPOINTMENT_UPDATE") {
    const token = tokenFromSession();
    if (!token) {
      return "You need to be signed in to update the schedule. Nothing was changed.";
    }
    const starts = buildStartsAt(pending.timeLabel, pending.dayHint);
    const title = /personal training/i.test(pending.title)
      ? "Personal Training"
      : pending.title;
    const { careCreateSchedule, careHttpJson } = await import(
      "../../foundation/careHttpClient"
    );
    // Prefer lineage reschedule when an active matching appointment exists
    const lineage = await careHttpJson<{
      ok: boolean;
      active?: Array<{ id?: string; title?: string }>;
      appointments?: Array<{ id?: string; title?: string }>;
    }>(
      `/api/v1/care/recipients/${encodeURIComponent(pending.careRecipientId)}/appointments`,
      { token },
    );
    let existingId: string | undefined;
    if (lineage.ok) {
      const pool = [
        ...(lineage.data.active ?? []),
        ...(lineage.data.appointments ?? []),
      ];
      const hit = pool.find((a) =>
        new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(
          String(a.title ?? ""),
        ),
      );
      existingId = hit?.id;
    }
    if (existingId) {
      const resch = await careHttpJson<{
        ok: boolean;
        appointment?: { previous_starts_at_label?: string };
      }>(
        `/api/v1/care/recipients/${encodeURIComponent(pending.careRecipientId)}/appointments/reschedule`,
        {
          method: "POST",
          token,
          body: {
            appointment_id: existingId,
            new_starts_at: starts.iso,
            new_starts_at_label: starts.label,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
      );
      if (resch.ok) {
        const prev = resch.data.appointment?.previous_starts_at_label;
        return (
          `Updated the **internal care schedule**: ${humanCareLine(title)} → ${starts.label}.\n\n` +
          (prev ? `Previous time on file: ${prev}.\n\n` : "") +
          `This is on the care record only — not an external booking confirmation.`
        );
      }
    }
    const res = await careCreateSchedule(token, pending.careRecipientId, {
      title,
      starts_at: starts.iso,
      starts_at_label: starts.label,
      schedule_state: "confirmed",
    });
    if (res.ok) {
      return (
        `Updated the **internal care schedule**: ${humanCareLine(title)} → ${starts.label}.\n\n` +
        `This is on the care record only — not an external booking confirmation.`
      );
    }
    return `Could not update the schedule: ${res.message ?? "error"}. Nothing was changed.`;
  }

  if (pending.kind === "APPOINTMENT_CANCEL") {
    return (
      `I cannot silently delete appointment history. Open **Care → Appointments**, select the visit, and use the care record flow to mark it cancelled so history is preserved.\n\n` +
      `No cancel was applied from this chat step.`
    );
  }

  return "Nothing was executed.";
}

function buildStartsAt(
  timeLabel: string,
  dayHint?: "today" | "tomorrow" | "yesterday",
): { iso: string; label: string } {
  const base = new Date();
  if (dayHint === "tomorrow") base.setDate(base.getDate() + 1);
  if (dayHint === "yesterday") base.setDate(base.getDate() - 1);
  const m = timeLabel.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  let h = 14;
  let min = 0;
  if (m) {
    h = parseInt(m[1]!, 10);
    min = m[2] ? parseInt(m[2], 10) : 0;
    const ap = (m[3] || "").toLowerCase();
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    if (!ap && h <= 7) h += 12; // bare "2" → 2pm heuristic for caregiver speech
  }
  base.setHours(h, min, 0, 0);
  const label = base.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return { iso: base.toISOString(), label };
}
