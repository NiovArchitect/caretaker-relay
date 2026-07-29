/**
 * Care continuity HTTP helpers — handoff lifecycle, inbox, pre-shift packet.
 */
import { careHttpJson } from "./careHttpClient";

function tokenFromSession(): string | null {
  try {
    const raw = sessionStorage.getItem("cr_care_session_v1");
    if (!raw) return null;
    return (JSON.parse(raw) as { token?: string }).token ?? null;
  } catch {
    return null;
  }
}

export type HandoffRow = {
  id: string;
  careRecipientId: string;
  fromPersonId?: string;
  toPersonId?: string;
  whatChanged: string[];
  stillNeedsAttention: string[];
  watch?: string[];
  createdAt: string;
};

export type HandoffPacket = {
  handoffId: string;
  careRecipientId: string;
  fromPersonId?: string;
  toPersonId?: string;
  status: string;
  periodLabel?: string;
  whatChanged: string[];
  stillNeedsAttention: string[];
  watch?: string[];
  completedWork?: string[];
  unfinishedWork?: Array<{
    id?: string;
    action: string;
    owner: string;
    ownerPersonId?: string | null;
    status: string;
    dueAt?: string | null;
    handoffId?: string | null;
    declineReason?: string | null;
    acceptedAt?: string | null;
  }>;
  conflicts?: string[];
  corrections?: string[];
  upcoming?: string[];
  acknowledgment?: string;
  acknowledgedAt?: string | null;
  deadlineAt?: string | null;
  sources?: string[];
};

export type HandoffLifecycle = {
  handoffId: string;
  careRecipientId: string;
  status: string;
  fromPersonId?: string;
  toPersonId?: string;
  acknowledgedAt?: string | null;
  acknowledgedByPersonId?: string | null;
  sentAt?: string | null;
  seenAt?: string | null;
};

export type HandoffBuckets = {
  incoming: HandoffRow[];
  sent: HandoffRow[];
  history: HandoffRow[];
  current_draft: HandoffRow[];
  primary_relevant?: HandoffRow[];
};

export async function listHandoffs(careRecipientId: string) {
  const token = tokenFromSession();
  if (!token)
    return {
      ok: false as const,
      handoffs: [] as HandoffRow[],
      buckets: null as HandoffBuckets | null,
      message: "Not signed in",
    };
  const res = await careHttpJson<{
    ok: boolean;
    handoffs?: HandoffRow[];
    buckets?: HandoffBuckets;
  }>(`/api/v1/care/recipients/${careRecipientId}/handoffs`, { token });
  if (!res.ok)
    return {
      ok: false as const,
      handoffs: [] as HandoffRow[],
      buckets: null as HandoffBuckets | null,
      message: res.message,
    };
  return {
    ok: true as const,
    handoffs: res.data.handoffs ?? [],
    buckets: res.data.buckets ?? null,
  };
}

export async function getHandoffLifecyclePacket(
  careRecipientId: string,
  handoffId: string,
) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in" };
  const res = await careHttpJson<{
    ok: boolean;
    lifecycle?: HandoffLifecycle;
    packet?: HandoffPacket;
  }>(
    `/api/v1/care/recipients/${careRecipientId}/handoffs/${handoffId}/lifecycle`,
    { token },
  );
  if (!res.ok) return { ok: false as const, message: res.message };
  return {
    ok: true as const,
    lifecycle: res.data.lifecycle,
    packet: res.data.packet,
  };
}

export async function transitionHandoff(
  careRecipientId: string,
  handoffId: string,
  status: string,
) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in" };
  const res = await careHttpJson<{
    ok: boolean;
    lifecycle?: HandoffLifecycle;
    message?: string;
  }>(
    `/api/v1/care/recipients/${careRecipientId}/handoffs/${handoffId}/lifecycle`,
    { method: "POST", token, body: { status } },
  );
  if (!res.ok) return { ok: false as const, message: res.message };
  return { ok: true as const, lifecycle: res.data.lifecycle };
}

/** Lineage-projected appointments (active + history) — not the raw state flood. */
export type AppointmentLineageRow = {
  id: string;
  title?: string;
  status?: string;
  schedule_state?: string | null;
  starts_at?: string | null;
  starts_at_label?: string | null;
  ends_at?: string | null;
  location?: string | null;
  address?: string | null;
  contact?: string | null;
  navigation_hint?: string | null;
  transport_hint?: string | null;
  lineage_key?: string | null;
  rescheduled_from_id?: string | null;
  bucket?: "active" | "history" | string;
  detail_openable?: boolean;
  phone?: string | null;
  leave_by_label?: string | null;
  travel_minutes?: number | null;
  maps_url?: string | null;
  facility?: string | null;
};

export async function listAppointmentsLineage(careRecipientId: string) {
  const token = tokenFromSession();
  if (!token)
    return {
      ok: false as const,
      active: [] as AppointmentLineageRow[],
      history: [] as AppointmentLineageRow[],
      message: "Not signed in",
    };
  const res = await careHttpJson<{
    ok: boolean;
    active?: AppointmentLineageRow[];
    history?: AppointmentLineageRow[];
  }>(`/api/v1/care/recipients/${careRecipientId}/appointments`, { token });
  if (!res.ok)
    return {
      ok: false as const,
      active: [] as AppointmentLineageRow[],
      history: [] as AppointmentLineageRow[],
      message: res.message,
    };
  return {
    ok: true as const,
    active: res.data.active ?? [],
    history: res.data.history ?? [],
  };
}

export type NotifRow = {
  id: string;
  type?: string;
  title?: string;
  body?: string;
  priority?: string;
  sourceType?: string;
  sourceId?: string;
  actionType?: string;
  actionTarget?: string;
  acknowledged_at?: string | null;
  createdAt?: string;
  created_at?: string;
};

export async function listNotifications(careRecipientId?: string) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, notifications: [] as NotifRow[] };
  const q = careRecipientId
    ? `?care_recipient_id=${encodeURIComponent(careRecipientId)}`
    : "";
  const res = await careHttpJson<{
    ok: boolean;
    notifications?: NotifRow[];
  }>(`/api/v1/care/notifications${q}`, { token });
  if (!res.ok) return { ok: false as const, notifications: [] as NotifRow[] };
  return { ok: true as const, notifications: res.data.notifications ?? [] };
}

export async function ackNotification(id: string) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in" };
  const res = await careHttpJson<{ ok: boolean }>(
    `/api/v1/care/notifications/${id}/acknowledge`,
    { method: "POST", token, body: {} },
  );
  if (!res.ok) {
    // try short action path
    const res2 = await careHttpJson<{ ok: boolean }>(
      `/api/v1/care/notifications/${id}/ack`,
      { method: "POST", token, body: {} },
    );
    if (!res2.ok) return { ok: false as const, message: res2.message };
  }
  return { ok: true as const };
}
