/**
 * HTTP helpers for DSP shift lifecycle (public care API).
 */
import { careHttpJson } from "./careHttpClient";

export type ShiftDto = {
  id: string;
  careRecipientId: string;
  assigneePersonId: string;
  assigneeDisplayName: string;
  assignerPersonId?: string;
  assignerDisplayName?: string;
  status: string;
  shiftStart: string;
  shiftEnd: string;
  timezone?: string;
  scopeNote?: string;
  handoffId?: string;
  dataDomains?: string[];
};

function tokenFromSession(): string | null {
  try {
    const raw = sessionStorage.getItem("cr_care_session_v1");
    if (!raw) return null;
    const p = JSON.parse(raw) as { token?: string };
    return p.token ?? null;
  } catch {
    return null;
  }
}

export async function listShifts(careRecipientId: string) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in", shifts: [] as ShiftDto[] };
  const res = await careHttpJson<{ ok: boolean; shifts?: ShiftDto[] }>(
    `/api/v1/care/recipients/${careRecipientId}/shifts`,
    { token },
  );
  if (!res.ok) return { ok: false as const, message: res.message, shifts: [] as ShiftDto[] };
  return { ok: true as const, shifts: res.data.shifts ?? [] };
}

export async function respondShift(
  careRecipientId: string,
  shiftId: string,
  decision: "accept" | "decline",
) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in" };
  const res = await careHttpJson<{ ok: boolean; assignment?: ShiftDto }>(
    `/api/v1/care/recipients/${careRecipientId}/shifts/${shiftId}/respond`,
    { method: "POST", token, body: { decision } },
  );
  if (!res.ok) return { ok: false as const, message: res.message };
  return { ok: true as const, assignment: res.data.assignment };
}

export async function completeShiftHandoffApi(
  careRecipientId: string,
  shiftId: string,
  whatChanged: string[],
  stillNeedsAttention: string[],
  toPersonId?: string,
) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in" };
  const res = await careHttpJson<{
    ok: boolean;
    handoff_id?: string;
    assignment?: ShiftDto;
  }>(`/api/v1/care/recipients/${careRecipientId}/shifts/${shiftId}/handoff`, {
    method: "POST",
    token,
    body: {
      what_changed: whatChanged,
      still_needs_attention: stillNeedsAttention,
      ...(toPersonId ? { to_person_id: toPersonId } : {}),
    },
  });
  if (!res.ok) return { ok: false as const, message: res.message };
  return {
    ok: true as const,
    handoffId: res.data.handoff_id,
    assignment: res.data.assignment,
  };
}

export async function expireShiftApi(careRecipientId: string, shiftId: string) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in" };
  const res = await careHttpJson<{ ok: boolean; assignment?: ShiftDto }>(
    `/api/v1/care/recipients/${careRecipientId}/shifts/${shiftId}/expire`,
    { method: "POST", token, body: {} },
  );
  if (!res.ok) return { ok: false as const, message: res.message };
  return { ok: true as const, assignment: res.data.assignment };
}

export async function createShiftApi(
  careRecipientId: string,
  body: {
    assignee_person_id: string;
    assignee_display_name?: string;
    shift_start: string;
    shift_end: string;
    scope_note?: string;
  },
) {
  const token = tokenFromSession();
  if (!token) return { ok: false as const, message: "Not signed in" };
  const res = await careHttpJson<{ ok: boolean; assignment?: ShiftDto }>(
    `/api/v1/care/recipients/${careRecipientId}/shifts`,
    { method: "POST", token, body },
  );
  if (!res.ok) return { ok: false as const, message: res.message, code: res.code };
  return { ok: true as const, assignment: res.data.assignment };
}
