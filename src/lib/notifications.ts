/**
 * In-app care attention / notification model.
 * Color is never the sole signal; labels + icons + optional slow pulse.
 */

export type NotificationKind =
  | "medication_due"
  | "appointment_soon"
  | "verification_needed"
  | "care_update"
  | "handoff_ready"
  | "provider_update"
  | "access_invitation"
  | "important_change";

export type NotificationSeverity = "info" | "attention" | "urgent";

export type CareNotification = {
  id: string;
  careRecipientId: string;
  careRecipientName: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  description: string;
  source: string;
  createdAt: string;
  dueAt?: string;
  acknowledged: boolean;
  actionLabel: string;
  actionTarget: "care" | "relay" | "people" | "handoff" | "documents";
};

export function kindLabel(kind: NotificationKind): string {
  switch (kind) {
    case "medication_due":
      return "Medication";
    case "appointment_soon":
      return "Appointment";
    case "verification_needed":
      return "Needs verification";
    case "care_update":
      return "Care update";
    case "handoff_ready":
      return "Handoff ready";
    case "provider_update":
      return "Provider update";
    case "access_invitation":
      return "Invitation";
    case "important_change":
      return "Important change";
  }
}

export function kindIcon(kind: NotificationKind): string {
  switch (kind) {
    case "medication_due":
      return "💊";
    case "appointment_soon":
      return "📅";
    case "verification_needed":
      return "✓";
    case "care_update":
      return "↺";
    case "handoff_ready":
      return "→";
    case "provider_update":
      return "⚕";
    case "access_invitation":
      return "👤";
    case "important_change":
      return "!";
  }
}

export function severityClass(severity: NotificationSeverity): string {
  switch (severity) {
    case "urgent":
      return "cr-notify-urgent";
    case "attention":
      return "cr-notify-attention";
    default:
      return "cr-notify-info";
  }
}

/** Build demo/proactive notifications from today projection + meds. */
export function buildAttentionNotifications(input: {
  careRecipientId: string;
  careRecipientName: string;
  attention: Array<{
    id: string;
    title: string;
    whatHappened: string;
    kind: string;
  }>;
  next: string[];
}): CareNotification[] {
  const now = new Date().toISOString();
  const out: CareNotification[] = [];

  for (const a of input.attention) {
    const isMed = a.kind === "medication" || /med|dose|pill/i.test(a.title);
    out.push({
      id: a.id,
      careRecipientId: input.careRecipientId,
      careRecipientName: input.careRecipientName,
      kind: isMed ? "medication_due" : "verification_needed",
      severity: isMed ? "urgent" : "attention",
      title: a.title,
      description: a.whatHappened,
      source: "Care activity",
      createdAt: now,
      acknowledged: false,
      actionLabel: isMed ? "Open medication" : "Review in Care",
      actionTarget: "care",
    });
  }

  for (const line of input.next.slice(0, 3)) {
    if (/appoint|therapy|pt|visit/i.test(line)) {
      out.push({
        id: `next-apt-${line.slice(0, 24)}`,
        careRecipientId: input.careRecipientId,
        careRecipientName: input.careRecipientName,
        kind: "appointment_soon",
        severity: "attention",
        title: "Upcoming appointment",
        description: line,
        source: "Schedule",
        createdAt: now,
        acknowledged: false,
        actionLabel: "View appointments",
        actionTarget: "care",
      });
    } else if (/med|dose|lunch|morning/i.test(line)) {
      out.push({
        id: `next-med-${line.slice(0, 24)}`,
        careRecipientId: input.careRecipientId,
        careRecipientName: input.careRecipientName,
        kind: "medication_due",
        severity: "urgent",
        title: "Medication coming up",
        description: line,
        source: "Medication schedule",
        createdAt: now,
        acknowledged: false,
        actionLabel: "Open medication",
        actionTarget: "care",
      });
    }
  }

  // Dedupe by title
  const seen = new Set<string>();
  return out.filter((n) => {
    const k = n.title + n.description;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
