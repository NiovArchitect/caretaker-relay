/**
 * Open-work ownership + governed schedule proposals.
 * Handoff acknowledgment is never task acceptance.
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

export type OpenWorkItem = {
  id: string;
  action: string;
  reason?: string;
  status: string;
  ownerPersonId?: string | null;
  ownerDisplayName?: string | null;
  dueAt?: string | null;
  handoffId?: string | null;
  acceptedAt?: string | null;
  declineReason?: string | null;
  priority?: string;
};

export async function listOpenWork(careRecipientId: string) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, work_items: [] as OpenWorkItem[], needs_owner: [] as OpenWorkItem[], message: "Not signed in" };
  const res = await careHttpJson<{
    ok: boolean;
    work_items?: OpenWorkItem[];
    needs_owner?: OpenWorkItem[];
  }>(`/api/v1/care/recipients/${encodeURIComponent(careRecipientId)}/work-items`, { token });
  if (!res.ok) return { ok: false as const, work_items: [] as OpenWorkItem[], needs_owner: [] as OpenWorkItem[], message: res.message };
  return {
    ok: true as const,
    work_items: res.data.work_items ?? [],
    needs_owner: res.data.needs_owner ?? [],
  };
}

export async function acceptOpenWork(careRecipientId: string, workId: string) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in" };
  const res = await careHttpJson<{
    ok: boolean;
    work_item?: OpenWorkItem;
    message?: string;
    code?: string;
  }>(
    `/api/v1/care/recipients/${encodeURIComponent(careRecipientId)}/work-items/${encodeURIComponent(workId)}/accept`,
    { method: "POST", token, body: {} },
  );
  if (!res.ok) return { ok: false as const, message: res.message, code: res.code };
  return { ok: true as const, work_item: res.data.work_item, message: res.data.message };
}

export async function declineOpenWork(
  careRecipientId: string,
  workId: string,
  reason?: string,
) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in" };
  const res = await careHttpJson<{
    ok: boolean;
    work_item?: OpenWorkItem;
    message?: string;
    code?: string;
  }>(
    `/api/v1/care/recipients/${encodeURIComponent(careRecipientId)}/work-items/${encodeURIComponent(workId)}/decline`,
    { method: "POST", token, body: { reason } },
  );
  if (!res.ok) return { ok: false as const, message: res.message, code: res.code };
  return { ok: true as const, work_item: res.data.work_item, message: res.data.message };
}

export async function reassignOpenWork(
  careRecipientId: string,
  workId: string,
  input: {
    new_owner_person_id: string;
    new_owner_display_name?: string;
    note?: string;
  },
) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in" };
  const res = await careHttpJson<{
    ok: boolean;
    work_item?: OpenWorkItem;
    message?: string;
    code?: string;
  }>(
    `/api/v1/care/recipients/${encodeURIComponent(careRecipientId)}/work-items/${encodeURIComponent(workId)}/reassign`,
    { method: "POST", token, body: input },
  );
  if (!res.ok) return { ok: false as const, message: res.message, code: res.code };
  return { ok: true as const, work_item: res.data.work_item, message: res.data.message };
}

export async function escalateOpenWork(
  careRecipientId: string,
  workId: string,
  input?: {
    reason?: string;
    alternate_person_id?: string;
    alternate_display_name?: string;
  },
) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in" };
  const res = await careHttpJson<{
    ok: boolean;
    work_item?: OpenWorkItem;
    message?: string;
    code?: string;
  }>(
    `/api/v1/care/recipients/${encodeURIComponent(careRecipientId)}/work-items/${encodeURIComponent(workId)}/escalate`,
    { method: "POST", token, body: input ?? {} },
  );
  if (!res.ok) return { ok: false as const, message: res.message, code: res.code };
  return { ok: true as const, work_item: res.data.work_item, message: res.data.message };
}

export async function clarifyOpenWork(
  careRecipientId: string,
  workId: string,
  note: string,
) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in" };
  const res = await careHttpJson<{
    ok: boolean;
    work_item?: OpenWorkItem;
    message?: string;
    code?: string;
  }>(
    `/api/v1/care/recipients/${encodeURIComponent(careRecipientId)}/work-items/${encodeURIComponent(workId)}/transition`,
    {
      method: "POST",
      token,
      body: { status: "blocked", blocking_reason: note },
    },
  );
  if (!res.ok) return { ok: false as const, message: res.message, code: res.code };
  return { ok: true as const, work_item: res.data.work_item };
}

export type ScheduleProposal = {
  id: string;
  sourceText: string;
  proposedTitle: string;
  proposedStartsAtLabel: string;
  status: string;
  handoffId?: string | null;
};

export async function listScheduleProposals(careRecipientId: string) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, open: [] as ScheduleProposal[], message: "Not signed in" };
  const res = await careHttpJson<{
    ok: boolean;
    proposals?: ScheduleProposal[];
    open?: ScheduleProposal[];
  }>(
    `/api/v1/care/recipients/${encodeURIComponent(careRecipientId)}/schedule-proposals`,
    { token },
  );
  if (!res.ok) return { ok: false as const, open: [] as ScheduleProposal[], message: res.message };
  return {
    ok: true as const,
    open: res.data.open ?? res.data.proposals?.filter((p) => p.status === "proposed") ?? [],
    proposals: res.data.proposals ?? [],
  };
}

export async function confirmScheduleProposal(
  careRecipientId: string,
  proposalId: string,
  input?: { confirmed_starts_at?: string; confirmed_starts_at_label?: string },
) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in" };
  const res = await careHttpJson<{
    ok: boolean;
    proposal?: ScheduleProposal;
    appointment_id?: string;
    message?: string;
    code?: string;
  }>(
    `/api/v1/care/recipients/${encodeURIComponent(careRecipientId)}/schedule-proposals/${encodeURIComponent(proposalId)}/confirm`,
    { method: "POST", token, body: input ?? {} },
  );
  if (!res.ok) return { ok: false as const, message: res.message, code: res.code };
  return {
    ok: true as const,
    proposal: res.data.proposal,
    appointment_id: res.data.appointment_id,
  };
}

export async function rejectScheduleProposal(
  careRecipientId: string,
  proposalId: string,
  reason?: string,
) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in" };
  const res = await careHttpJson<{
    ok: boolean;
    proposal?: ScheduleProposal;
    message?: string;
    code?: string;
  }>(
    `/api/v1/care/recipients/${encodeURIComponent(careRecipientId)}/schedule-proposals/${encodeURIComponent(proposalId)}/reject`,
    { method: "POST", token, body: { reason } },
  );
  if (!res.ok) return { ok: false as const, message: res.message, code: res.code };
  return { ok: true as const, proposal: res.data.proposal };
}
