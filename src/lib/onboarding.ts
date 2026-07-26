/**
 * Progressive care onboarding state (client-side spine).
 * Does not invent clinical data. Persist lightly in sessionStorage.
 */

export type OnboardingIntent =
  | "sign_in"
  | "create_account"
  | "accept_invite"
  | "set_up_care"
  | "join_circle";

export type CaregiverPath =
  | "receiving_care"
  | "family_friend"
  | "paid_dsp"
  | "clinician"
  | "organization"
  | "invited";

export type OnboardingDraft = {
  version: 1;
  intent: OnboardingIntent | null;
  path: CaregiverPath | null;
  recipientPreferredName: string;
  relationship: string;
  whatMatters: string;
  helpersNote: string;
  skippedSteps: string[];
  completed: boolean;
  updatedAt: string;
};

const KEY = "cr.onboarding.v1";

export function emptyOnboardingDraft(): OnboardingDraft {
  return {
    version: 1,
    intent: null,
    path: null,
    recipientPreferredName: "",
    relationship: "",
    whatMatters: "",
    helpersNote: "",
    skippedSteps: [],
    completed: false,
    updatedAt: new Date().toISOString(),
  };
}

export function loadOnboardingDraft(): OnboardingDraft {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return emptyOnboardingDraft();
    const parsed = JSON.parse(raw) as OnboardingDraft;
    if (parsed?.version !== 1) return emptyOnboardingDraft();
    return { ...emptyOnboardingDraft(), ...parsed };
  } catch {
    return emptyOnboardingDraft();
  }
}

export function saveOnboardingDraft(draft: OnboardingDraft): void {
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }),
    );
  } catch {
    /* ignore quota */
  }
}

export function clearOnboardingDraft(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Map path to lab principal for demo/lab product entry. */
export function labPrincipalForPath(path: CaregiverPath): string {
  switch (path) {
    case "family_friend":
      return "p-maya";
    case "paid_dsp":
      return "p-walter";
    case "clinician":
      return "p-dr-shah";
    case "receiving_care":
    case "organization":
    case "invited":
    default:
      return "p-sadeil";
  }
}

export const PATH_LABELS: Record<CaregiverPath, string> = {
  receiving_care: "I am receiving care",
  family_friend: "I help a family member or friend",
  paid_dsp: "I am a paid caregiver or DSP",
  clinician: "I am a clinician",
  organization: "I represent an organization",
  invited: "I was invited to a care circle",
};
