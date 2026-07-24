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

export function listAuthorizedCareSpaces(
  _carePersonId?: string | null,
): CareSpace[] {
  // Lab principals can see both spaces for architecture proof.
  // Production would filter by real membership.
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
