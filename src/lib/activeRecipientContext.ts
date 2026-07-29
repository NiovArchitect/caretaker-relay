/**
 * Canonical ActiveRecipientContext — one source of truth for multi-recipient UI.
 * Every recipient-scoped operation must read this context (or careClient rid()
 * which is kept in sync) and gate async results with context_version.
 */

import {
  listAuthorizedCareSpaces,
  loadActiveCareRecipientId,
  resolveCareSpace,
  type CareSpace,
} from "./careContext";

export type ActiveRecipientContext = {
  tenant_id: string;
  care_space_id: string;
  recipient_id: string;
  recipient_display_name: string;
  recipient_timezone: string;
  principal_id: string;
  relationship_id: string;
  role: string;
  domain_scopes: string[];
  context_version: number;
  selected_at: string;
  source: "session" | "switch" | "restore" | "default";
  route: string;
  session_id: string;
};

let contextVersion = 0;
let current: ActiveRecipientContext | null = null;

/** Monotonic version bumped on every switch/bind. */
export function getRecipientContextVersion(): number {
  return contextVersion;
}

export function getActiveRecipientContext(): ActiveRecipientContext | null {
  return current;
}

export function isStaleRecipientContext(version: number): boolean {
  return version !== contextVersion;
}

export function buildActiveRecipientContext(input: {
  recipientId: string;
  principalId: string;
  role?: string;
  sessionId?: string;
  source: ActiveRecipientContext["source"];
  route?: string;
  timezone?: string;
}): ActiveRecipientContext {
  const space: CareSpace = resolveCareSpace(input.recipientId, input.principalId);
  contextVersion += 1;
  current = {
    tenant_id: "tenant-care-lab",
    care_space_id: space.careRecipientId,
    recipient_id: space.careRecipientId,
    recipient_display_name: space.displayName,
    recipient_timezone: input.timezone ?? "America/Los_Angeles",
    principal_id: input.principalId,
    relationship_id: `${input.principalId}::${space.careRecipientId}`,
    role: input.role ?? "caregiver",
    domain_scopes: ["care", "relay", "handoff", "schedule", "work"],
    context_version: contextVersion,
    selected_at: new Date().toISOString(),
    source: input.source,
    route: input.route ?? "today",
    session_id: input.sessionId ?? "",
  };
  return current;
}

/** Sync context from storage without bumping when already matching (restore path). */
export function ensureActiveRecipientContext(input: {
  principalId: string;
  role?: string;
  sessionId?: string;
  source?: ActiveRecipientContext["source"];
}): ActiveRecipientContext {
  const rid = loadActiveCareRecipientId(input.principalId);
  if (
    current &&
    current.principal_id === input.principalId &&
    current.recipient_id === rid
  ) {
    return current;
  }
  return buildActiveRecipientContext({
    recipientId: rid,
    principalId: input.principalId,
    role: input.role,
    sessionId: input.sessionId,
    source: input.source ?? "restore",
  });
}

export function authorizedRecipientIds(principalId: string): string[] {
  return listAuthorizedCareSpaces(principalId).map((s) => s.careRecipientId);
}

/** In-flight registry: abort-friendly generation tokens per request class. */
const inflight = new Map<string, number>();

export function beginScopedRequest(kind: string): {
  version: number;
  token: number;
} {
  const token = (inflight.get(kind) ?? 0) + 1;
  inflight.set(kind, token);
  return { version: contextVersion, token };
}

export function isScopedRequestCurrent(
  kind: string,
  version: number,
  token: number,
): boolean {
  if (version !== contextVersion) return false;
  return inflight.get(kind) === token;
}

export function invalidateScopedRequests(): void {
  for (const k of [...inflight.keys()]) {
    inflight.set(k, (inflight.get(k) ?? 0) + 1);
  }
}
