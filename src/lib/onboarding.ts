/**
 * Progressive care onboarding state (client-side spine).
 * Role claims are not authorization grants.
 */

export type OnboardingIntent =
  | "sign_in"
  | "create_account"
  | "accept_invite"
  | "set_up_care"
  | "join_circle"
  | "request_access"
  | "add_recipient"
  | "manage_recipients";

export type CaregiverPath =
  | "receiving_care"
  | "family_friend"
  | "paid_dsp"
  | "clinician"
  | "organization"
  | "invited";

export type OnboardingDraft = {
  version: 2;
  intent: OnboardingIntent | null;
  path: CaregiverPath | null;
  /** Required preferred/display name for the account holder */
  accountDisplayName: string;
  /** User-supplied recipient preferred name — never auto-filled from another person's record */
  recipientPreferredName: string;
  relationship: string;
  whatMatters: string;
  helpersNote: string;
  skippedSteps: string[];
  completed: boolean;
  /** True until invitation/approval/assignment succeeds */
  awaitingAuthorization: boolean;
  updatedAt: string;
};

const KEY = "cr.onboarding.v2";
const LEGACY_KEY = "cr.onboarding.v1";

export function emptyOnboardingDraft(): OnboardingDraft {
  return {
    version: 2,
    intent: null,
    path: null,
    accountDisplayName: "",
    recipientPreferredName: "",
    relationship: "",
    whatMatters: "",
    helpersNote: "",
    skippedSteps: [],
    completed: false,
    awaitingAuthorization: false,
    updatedAt: new Date().toISOString(),
  };
}

export function loadOnboardingDraft(): OnboardingDraft {
  try {
    const raw = sessionStorage.getItem(KEY) ?? sessionStorage.getItem(LEGACY_KEY);
    if (!raw) return emptyOnboardingDraft();
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft> & {
      relationship?: string;
      version?: number;
    };
    const base = emptyOnboardingDraft();
    const isV2 = parsed.version === 2;
    return {
      ...base,
      ...parsed,
      version: 2,
      accountDisplayName:
        parsed.accountDisplayName ||
        (!isV2 && typeof parsed.relationship === "string"
          ? parsed.relationship
          : "") ||
        "",
      // Never inherit a seeded recipient name from legacy drafts
      recipientPreferredName: isV2 ? parsed.recipientPreferredName || "" : "",
    };
  } catch {
    return emptyOnboardingDraft();
  }
}

export function saveOnboardingDraft(draft: OnboardingDraft): void {
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ ...draft, version: 2, updatedAt: new Date().toISOString() }),
    );
    sessionStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore quota */
  }
}

export function clearOnboardingDraft(): void {
  try {
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * @deprecated Do not use for create-account.
 * Role selection must never map to a principal with existing recipient memberships.
 * Lab demo sign-in uses explicit principal selection only.
 */
export function labPrincipalForPath(_path: CaregiverPath): null {
  return null;
}

export const PATH_LABELS: Record<CaregiverPath, string> = {
  receiving_care: "I am receiving care",
  family_friend: "I help a family member or friend",
  paid_dsp: "I am a paid caregiver or DSP",
  clinician: "I am a clinician",
  organization: "I represent an organization",
  invited: "I was invited to a care circle",
};

/** Labels for established users (not first-time onboarding). */
export const ESTABLISHED_ACTIONS = [
  {
    id: "add_recipient" as const,
    title: "Add another care recipient",
    detail: "Start a new care circle you are authorized to set up",
  },
  {
    id: "request_access" as const,
    title: "Request access to someone’s care",
    detail: "Send a request for approval — you will not see records until authorized",
  },
  {
    id: "join_circle" as const,
    title: "Join with an invitation code",
    detail: "Use a code from someone already authorized",
  },
  {
    id: "manage_recipients" as const,
    title: "Manage care recipients",
    detail: "Switch or review circles you already have access to",
  },
] as const;
