/**
 * Care-space invitation + human coordination helpers (browser-safe, no node:crypto).
 */

import type {
  CareCoordinationMessage,
  CareInvitation,
  CareInvitationStatus,
  CareRelationshipRole,
  CareUpdate,
  SourceRef,
} from "../types.js";
import type { CareStore } from "../store/memory-store.js";

const INVITE_PREFIX = "INVITE_V1:";
const COORD_PREFIX = "COORD_V1:";

export function newInviteToken(): string {
  const a = Math.random().toString(36).slice(2);
  const b = Math.random().toString(36).slice(2);
  const c = Date.now().toString(36);
  return `${a}${b}${c}${a}`.slice(0, 48);
}

function hashToken(token: string): string {
  let h = 0;
  for (let i = 0; i < token.length; i++) {
    h = (Math.imul(31, h) + token.charCodeAt(i)) | 0;
  }
  return `h${Math.abs(h).toString(16)}${token.length.toString(16)}`;
}

export function encodeInvitationUpdate(
  inv: CareInvitation,
  source: SourceRef,
): CareUpdate {
  const payload = {
    kind: "invitation",
    tokenHash: hashToken(inv.token),
    token: inv.token,
    inviterPersonId: inv.inviterPersonId,
    inviteePersonId: inv.inviteePersonId,
    inviteeDisplayName: inv.inviteeDisplayName,
    inviteeEmail: inv.inviteeEmail,
    role: inv.role,
    roleLabel: inv.roleLabel,
    status: inv.status,
    createdAt: inv.createdAt,
    expiresAt: inv.expiresAt,
    acceptedAt: inv.acceptedAt,
  };
  return {
    id: inv.id,
    careRecipientId: inv.careRecipientId,
    toPersonId: inv.inviteePersonId,
    summary: INVITE_PREFIX + JSON.stringify(payload),
    status:
      inv.status === "pending"
        ? "draft"
        : inv.status === "accepted"
          ? "ready"
          : "blocked_pending_verify",
    safetyClass: "low",
    source,
  };
}

export function decodeInvitationFromUpdate(u: CareUpdate): CareInvitation | null {
  if (!u.summary.startsWith(INVITE_PREFIX)) return null;
  try {
    const raw = JSON.parse(u.summary.slice(INVITE_PREFIX.length)) as Record<
      string,
      unknown
    >;
    return {
      id: u.id,
      careRecipientId: u.careRecipientId,
      token: String(raw.token ?? ""),
      inviterPersonId: String(raw.inviterPersonId ?? ""),
      inviteePersonId: String(raw.inviteePersonId ?? u.toPersonId),
      inviteeDisplayName: String(raw.inviteeDisplayName ?? ""),
      inviteeEmail: raw.inviteeEmail ? String(raw.inviteeEmail) : undefined,
      role: (raw.role as CareRelationshipRole) ?? "family_caregiver",
      roleLabel: String(raw.roleLabel ?? "Family caregiver"),
      status: (raw.status as CareInvitationStatus) ?? "pending",
      createdAt: String(raw.createdAt ?? u.source.recordedAt),
      expiresAt: raw.expiresAt ? String(raw.expiresAt) : undefined,
      acceptedAt: raw.acceptedAt ? String(raw.acceptedAt) : undefined,
    };
  } catch {
    return null;
  }
}

export function listInvitations(
  store: CareStore,
  careRecipientId: string,
): CareInvitation[] {
  return store
    .getUpdates(careRecipientId)
    .map(decodeInvitationFromUpdate)
    .filter((x): x is CareInvitation => !!x);
}

export function findInvitationByTokenForRecipient(
  store: CareStore,
  careRecipientId: string,
  token: string,
): CareInvitation | null {
  const th = hashToken(token);
  for (const inv of listInvitations(store, careRecipientId)) {
    if (inv.token === token || hashToken(inv.token) === th) return inv;
  }
  return null;
}

export function findInvitationByTokenGlobal(
  store: CareStore,
  careRecipientIds: string[],
  token: string,
): CareInvitation | null {
  for (const id of careRecipientIds) {
    const found = findInvitationByTokenForRecipient(store, id, token);
    if (found) return found;
  }
  return null;
}

export function encodeCoordinationUpdate(
  msg: CareCoordinationMessage,
  source: SourceRef,
): CareUpdate {
  const payload = {
    kind: "coordination",
    fromPersonId: msg.fromPersonId,
    fromDisplayName: msg.fromDisplayName,
    body: msg.body,
    createdAt: msg.createdAt,
  };
  return {
    id: msg.id,
    careRecipientId: msg.careRecipientId,
    toPersonId: msg.toPersonId ?? msg.careRecipientId,
    summary: COORD_PREFIX + JSON.stringify(payload),
    status: "ready",
    safetyClass: "low",
    source,
  };
}

export function decodeCoordinationFromUpdate(
  u: CareUpdate,
): CareCoordinationMessage | null {
  if (!u.summary.startsWith(COORD_PREFIX)) return null;
  try {
    const raw = JSON.parse(u.summary.slice(COORD_PREFIX.length)) as Record<
      string,
      unknown
    >;
    return {
      id: u.id,
      careRecipientId: u.careRecipientId,
      fromPersonId: String(raw.fromPersonId ?? u.source.actorPersonId ?? ""),
      fromDisplayName: String(
        raw.fromDisplayName ?? u.source.actorName ?? "Caregiver",
      ),
      toPersonId: u.toPersonId,
      body: String(raw.body ?? ""),
      createdAt: String(raw.createdAt ?? u.source.recordedAt),
      kind: "coordination",
    };
  } catch {
    return null;
  }
}

export function listCoordination(
  store: CareStore,
  careRecipientId: string,
): CareCoordinationMessage[] {
  return store
    .getUpdates(careRecipientId)
    .map(decodeCoordinationFromUpdate)
    .filter((x): x is CareCoordinationMessage => !!x)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function defaultInviteAccess(role: CareRelationshipRole) {
  if (role === "paid_caregiver" || role === "direct_support_professional") {
    return {
      informationCategories: [
        "Care tasks",
        "Care instructions",
        "Appointments",
      ],
      allowedActions: [
        "record_observations",
        "complete_tasks",
        "view_schedule",
        "receive_updates",
      ],
      canEscalate: true,
      authorityLimits: ["Cannot share records outside care plan"],
    };
  }
  return {
    informationCategories: ["Daily updates", "Appointments", "Care plan"],
    allowedActions: ["receive_updates", "view_plan", "view_appointments"],
    canEscalate: true,
    authorityLimits: ["Cannot change medication schedule"],
  };
}
