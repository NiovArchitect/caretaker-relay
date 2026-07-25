/**
 * First-class care-recipient context.
 * Authenticated caregiver → authorized care spaces → active recipient.
 * Demo: Evelyn is primary; Robert is a lightweight second recipient.
 */

export type CareSpace = {
  careRecipientId: string;
  displayName: string;
  preferredName: string;
  relationshipHint: string;
  depth: "full" | "lightweight";
};

/** Synthetic multi-recipient lab set (not real patients). */
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

const STORAGE_KEY = "cr.activeCareRecipientId";

export function getDefaultCareSpace(): CareSpace {
  return CARE_SPACES[0]!;
}

/**
 * Lab membership: Marcus (p-sadeil) may access Evelyn + Robert.
 * Maya (p-maya) may access Evelyn only — not Robert.
 * Daniel (p-walter) Evelyn only.
 * Dr Shah Evelyn only. Dr Cole is Robert's physician (server-side).
 */
export function listAuthorizedCareSpaces(
  carePersonId?: string | null,
): CareSpace[] {
  const id = carePersonId ?? "";
  if (id === "p-maya" || id === "p-walter" || id === "p-dr-shah") {
    return CARE_SPACES.filter((s) => s.careRecipientId === "cr-olivia");
  }
  if (id === "p-dr-cole") {
    return CARE_SPACES.filter((s) => s.careRecipientId === "cr-robert");
  }
  // Marcus and lab default: both spaces for multi-recipient proof
  return CARE_SPACES;
}

export function loadActiveCareRecipientId(): string {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && CARE_SPACES.some((s) => s.careRecipientId === stored)) {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return getDefaultCareSpace().careRecipientId;
}

export function saveActiveCareRecipientId(id: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function resolveCareSpace(id: string | null | undefined): CareSpace {
  return (
    CARE_SPACES.find((s) => s.careRecipientId === id) ?? getDefaultCareSpace()
  );
}
