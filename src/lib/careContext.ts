/**
 * First-class care-recipient context.
 * Authenticated account → authorized care spaces only → active recipient.
 * Never invent memberships from role claims.
 */

import {
  isPendingPersonId,
  loadAuthorizationState,
} from "./authorization";

export type CareSpace = {
  careRecipientId: string;
  displayName: string;
  preferredName: string;
  relationshipHint: string;
  depth: "full" | "lightweight" | "pending" | "none";
};

/** Synthetic multi-recipient lab set (not real patients). Membership is principal-gated. */
export const CARE_SPACES: CareSpace[] = [
  {
    careRecipientId: "cr-olivia",
    displayName: "Evelyn Carter",
    preferredName: "Evelyn",
    relationshipHint: "Primary care context",
    depth: "full",
  },
  {
    careRecipientId: "cr-robert",
    displayName: "Robert Hale",
    preferredName: "Robert",
    relationshipHint: "Secondary authorized space (demo)",
    depth: "lightweight",
  },
];

/** Empty space when account has no authorized recipient. */
export const NO_RECIPIENT_SPACE: CareSpace = {
  careRecipientId: "cr-none",
  displayName: "No care recipient connected",
  preferredName: "—",
  relationshipHint: "Authorization required before care access",
  depth: "none",
};

const STORAGE_KEY = "cr.activeCareRecipientId";

/**
 * Lab membership table (seeded principals only).
 * Pending / new accounts: empty — role selection grants nothing.
 */
export function listAuthorizedCareSpaces(
  carePersonId?: string | null,
): CareSpace[] {
  let id = carePersonId;
  if (id === undefined) {
    try {
      const raw = sessionStorage.getItem("cr_care_session_v1");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          identity?: { carePersonId?: string };
        };
        id = parsed.identity?.carePersonId ?? null;
      } else {
        id = null;
      }
    } catch {
      id = null;
    }
  }
  id = id ?? "";

  // Unverified create-account / pending local sessions: zero recipients
  if (!id || isPendingPersonId(id)) {
    return [];
  }

  const authz = loadAuthorizationState();
  if (authz.pendingRecipientAccess && !authz.labPrincipalAuthorized) {
    return [];
  }

  if (id === "p-maya" || id === "p-walter" || id === "p-dr-shah") {
    return CARE_SPACES.filter((s) => s.careRecipientId === "cr-olivia");
  }
  if (id === "p-dr-cole") {
    return CARE_SPACES.filter((s) => s.careRecipientId === "cr-robert");
  }
  // Known lab primary with multi-recipient membership
  if (id === "p-sadeil") {
    return CARE_SPACES;
  }

  // Unknown principal: deny by default (fail closed)
  return [];
}

export function loadActiveCareRecipientId(carePersonId?: string | null): string {
  // Prefer explicit principal; else try session when available without importing careClient cycles
  let pid = carePersonId;
  if (pid === undefined) {
    try {
      const raw = sessionStorage.getItem("cr_care_session_v1");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          identity?: { carePersonId?: string };
        };
        pid = parsed.identity?.carePersonId ?? null;
      }
    } catch {
      pid = null;
    }
  }
  const spaces = listAuthorizedCareSpaces(pid);
  if (spaces.length === 0) {
    return NO_RECIPIENT_SPACE.careRecipientId;
  }
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && spaces.some((s) => s.careRecipientId === stored)) {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return spaces[0]!.careRecipientId;
}

export function saveActiveCareRecipientId(id: string): void {
  if (id === NO_RECIPIENT_SPACE.careRecipientId) {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function resolveCareSpace(
  id: string | null | undefined,
  carePersonId?: string | null,
): CareSpace {
  if (!id || id === NO_RECIPIENT_SPACE.careRecipientId) {
    return NO_RECIPIENT_SPACE;
  }
  let pid = carePersonId;
  if (pid === undefined) {
    try {
      const raw = sessionStorage.getItem("cr_care_session_v1");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          identity?: { carePersonId?: string };
        };
        pid = parsed.identity?.carePersonId ?? null;
      }
    } catch {
      pid = null;
    }
  }
  const spaces = listAuthorizedCareSpaces(pid);
  const found = spaces.find((s) => s.careRecipientId === id);
  if (found) return found;
  // Do not fall back to Evelyn for unauthorized users
  if (spaces.length === 0) return NO_RECIPIENT_SPACE;
  return spaces[0]!;
}

export function getDefaultCareSpace(carePersonId?: string | null): CareSpace {
  const spaces = listAuthorizedCareSpaces(carePersonId);
  return spaces[0] ?? NO_RECIPIENT_SPACE;
}

export function hasAuthorizedRecipient(carePersonId?: string | null): boolean {
  return listAuthorizedCareSpaces(carePersonId).length > 0;
}
