/**
 * Authorization state — separate from authentication.
 * Account creation ≠ recipient access.
 * Role claims are unverified until invitation, approval, or org assignment.
 */

export type AccessPathway =
  | "invitation"
  | "access_request"
  | "create_provisional"
  | "lab_demo_sign_in";

export type AccessRequestDraft = {
  recipientPreferredName: string;
  relationship: string;
  reason: string;
  status: "draft" | "submitted" | "pending_approval" | "denied";
  submittedAt?: string;
};

export type AuthorizationState = {
  version: 1;
  /** True when account exists but has zero authorized recipients */
  pendingRecipientAccess: boolean;
  claimedPath: string | null;
  displayName: string;
  pathway: AccessPathway | null;
  accessRequest: AccessRequestDraft | null;
  inviteTokenBound: string | null;
  /** Lab only: true if user signed in as a seeded principal with memberships */
  labPrincipalAuthorized: boolean;
  updatedAt: string;
};

const KEY = "cr.authorization.v1";

export function emptyAuthorizationState(): AuthorizationState {
  return {
    version: 1,
    pendingRecipientAccess: false,
    claimedPath: null,
    displayName: "",
    pathway: null,
    accessRequest: null,
    inviteTokenBound: null,
    labPrincipalAuthorized: false,
    updatedAt: new Date().toISOString(),
  };
}

export function loadAuthorizationState(): AuthorizationState {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return emptyAuthorizationState();
    const parsed = JSON.parse(raw) as AuthorizationState;
    if (parsed?.version !== 1) return emptyAuthorizationState();
    return { ...emptyAuthorizationState(), ...parsed };
  } catch {
    return emptyAuthorizationState();
  }
}

export function saveAuthorizationState(state: AuthorizationState): void {
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ ...state, updatedAt: new Date().toISOString() }),
    );
  } catch {
    /* ignore */
  }
}

export function clearAuthorizationState(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** New accounts start with zero recipient access. */
export function markPendingAccount(displayName: string, claimedPath: string | null) {
  saveAuthorizationState({
    ...emptyAuthorizationState(),
    pendingRecipientAccess: true,
    labPrincipalAuthorized: false,
    displayName: displayName.trim(),
    claimedPath,
    pathway: null,
    accessRequest: null,
  });
}

/** Lab demo principals that have server memberships — never use for create-account. */
export function markLabPrincipalAuthorized(displayName: string) {
  saveAuthorizationState({
    ...emptyAuthorizationState(),
    pendingRecipientAccess: false,
    labPrincipalAuthorized: true,
    displayName,
  });
}

export function submitAccessRequest(req: Omit<AccessRequestDraft, "status" | "submittedAt">) {
  const cur = loadAuthorizationState();
  saveAuthorizationState({
    ...cur,
    pathway: "access_request",
    accessRequest: {
      ...req,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    },
    pendingRecipientAccess: true,
  });
}

export function bindInviteToken(token: string) {
  const cur = loadAuthorizationState();
  saveAuthorizationState({
    ...cur,
    pathway: "invitation",
    inviteTokenBound: token.trim(),
    pendingRecipientAccess: true,
  });
}

/** Synthetic care-person id prefix for pending local accounts (no server memberships). */
export const PENDING_PERSON_PREFIX = "pending-local-";

export function isPendingPersonId(carePersonId: string | null | undefined): boolean {
  return !!carePersonId && carePersonId.startsWith(PENDING_PERSON_PREFIX);
}

export function makePendingPersonId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : String(Date.now());
  return `${PENDING_PERSON_PREFIX}${rand}`;
}
