/**
 * Role claim vs active authorized role.
 * Claims never grant access. Active roles are recipient-specific after membership.
 * SECURITY: Do not map claims to seed principals or memberships here.
 */

import type { CaregiverPath } from "./onboarding";
import { loadOnboardingDraft } from "./onboarding";
import { loadAuthorizationState } from "./authorization";
import type { NavTab } from "../domain/types";

/** Claimed role at account creation (unverified). */
export type RoleClaim =
  | "family_friend"
  | "receiving_care"
  | "paid_dsp"
  | "clinician"
  | "invited"
  | "organization"
  | "unknown";

/**
 * Active role for a specific recipient after server authorization.
 * One principal may hold different active roles for different recipients.
 */
export type ActiveRole =
  | "family_primary"
  | "family_friend"
  | "care_recipient"
  | "dsp"
  | "clinician"
  | "invited_member"
  | "pending"
  | "none";

export type RoleExperience = {
  claim: RoleClaim;
  active: ActiveRole;
  /** Short UI badge */
  badge: string;
  /** Today / home emphasis title */
  todayTitle: string;
  /** One-line orientation */
  orientation: string;
  /** Nav labels by tab */
  navLabels: Partial<Record<NavTab, string>>;
  /** Relay system tone hint (copy only; server still authorizes) */
  relayTone: string;
  /** Zero-access gate emphasis */
  gateLead: string;
  /** Priorities for Today empty/authorized cards */
  priorities: string[];
  /** Whether Access/Privacy is primary for this role */
  prefersAccessControl: boolean;
  /** Whether shift framing is used */
  prefersShift: boolean;
  /** Whether clinical summary framing is used */
  prefersClinical: boolean;
};

const CLAIM_FROM_PATH: Record<CaregiverPath, RoleClaim> = {
  family_friend: "family_friend",
  receiving_care: "receiving_care",
  paid_dsp: "paid_dsp",
  clinician: "clinician",
  invited: "invited",
  organization: "organization",
};

export function claimFromPath(path: CaregiverPath | null | undefined): RoleClaim {
  if (!path) return "unknown";
  return CLAIM_FROM_PATH[path] ?? "unknown";
}

export function claimFromRoles(roles: string[] | undefined): RoleClaim {
  if (!roles?.length) return "unknown";
  const joined = roles.join(" ").toLowerCase();
  if (joined.includes("claim:receiving_care") || joined.includes("care_recipient"))
    return "receiving_care";
  if (joined.includes("claim:paid_dsp") || joined.includes("professional") || joined.includes("paid"))
    return "paid_dsp";
  if (joined.includes("claim:clinician") || joined.includes("physician") || joined.includes("provider"))
    return "clinician";
  if (joined.includes("claim:invited") || joined.includes("invited")) return "invited";
  if (joined.includes("claim:family") || joined.includes("family")) return "family_friend";
  if (joined.includes("claim:organization")) return "organization";
  return "unknown";
}

/**
 * Infer active role from lab principal id or membership role labels.
 * Never invent membership — caller must already know access is authorized.
 */
export function activeRoleForPrincipal(
  carePersonId: string | null | undefined,
  membershipRoleLabel?: string | null,
): ActiveRole {
  const id = carePersonId ?? "";
  if (!id || id.startsWith("pending-local-") || id.startsWith("p-acct-")) {
    return "pending";
  }
  if (id === "p-sadeil") return "family_primary";
  if (id === "p-maya") return "family_friend";
  if (id === "p-walter") return "dsp";
  if (id === "p-dr-shah" || id === "p-dr-cole") return "clinician";

  const lab = membershipRoleLabel?.toLowerCase() ?? "";
  if (/recipient|self/.test(lab)) return "care_recipient";
  if (/dsp|professional|paid|shift/.test(lab)) return "dsp";
  if (/physician|clinician|provider|clinical/.test(lab)) return "clinician";
  if (/primary|family/.test(lab)) return "family_primary";
  if (/friend|neighbor|invited/.test(lab)) return "family_friend";
  return "invited_member";
}

function experienceFor(
  claim: RoleClaim,
  active: ActiveRole,
): RoleExperience {
  const pending = active === "pending" || active === "none";

  if (active === "care_recipient" || (pending && claim === "receiving_care")) {
    return {
      claim,
      active: pending ? "pending" : "care_recipient",
      badge: pending ? "Receiving care · pending access" : "My care",
      todayTitle: pending ? "Your care account" : "Your day",
      orientation: pending
        ? "You control who helps. No one sees your care until you invite or approve them."
        : "Your schedule, helpers, preferences, and privacy — on your terms.",
      navLabels: {
        today: "My day",
        care: "My care",
        people: "My helpers",
        documents: "My documents",
        relay: "Relay",
      },
      relayTone:
        "Speak directly to the care recipient. Confirm before notifying helpers. Honor preferences.",
      gateLead:
        "You said you receive care. Invite helpers, accept only trusted invitations, or set up your own care profile.",
      priorities: [
        "Who is helping today",
        "Upcoming visits",
        "Preferences & routines",
        "Who can see my information",
      ],
      prefersAccessControl: true,
      prefersShift: false,
      prefersClinical: false,
    };
  }

  if (active === "dsp" || (pending && claim === "paid_dsp")) {
    return {
      claim,
      active: pending ? "pending" : "dsp",
      badge: pending ? "DSP · pending assignment" : "Shift / DSP",
      todayTitle: pending ? "Assignment required" : "This shift",
      orientation: pending
        ? "A role claim does not open any recipient. You need an organization assignment or invitation."
        : "Shift priorities, assigned tasks, observations, and handoff — only for assigned recipients.",
      navLabels: {
        today: "Shift",
        care: "Care plan",
        people: "Care team",
        documents: "Notes",
        relay: "Relay",
      },
      relayTone:
        "Shift briefing. Assignment-scoped only. Prompt for required documentation. Prepare handoff. Never change the care plan.",
      gateLead:
        "You said you are a paid caregiver or DSP. Access requires an organization assignment or authorized invitation — not this claim alone.",
      priorities: [
        "Shift start & period",
        "Assigned priorities",
        "Tasks & observations",
        "Handoff to next shift",
      ],
      prefersAccessControl: false,
      prefersShift: true,
      prefersClinical: false,
    };
  }

  if (active === "clinician" || (pending && claim === "clinician")) {
    return {
      claim,
      active: pending ? "pending" : "clinician",
      badge: pending ? "Clinician · pending verification" : "Clinical view",
      todayTitle: pending ? "Verification required" : "Clinical summary",
      orientation: pending
        ? "Clinical access needs professional verification and a valid recipient relationship."
        : "Evidence-linked trends, medications, observations, and provenance — minimum necessary.",
      navLabels: {
        today: "Summary",
        care: "Clinical",
        people: "Care team",
        documents: "Records",
        relay: "Relay",
      },
      relayTone:
        "Concise evidence-linked summary. Separate reported from confirmed. No diagnosis. No care-circle admin.",
      gateLead:
        "You said you are a clinician. Access requires verification and assignment — not this claim alone.",
      priorities: [
        "Recent changes",
        "Medications & adherence signals",
        "Caregiver observations",
        "Open clinical questions",
      ],
      prefersAccessControl: false,
      prefersShift: false,
      prefersClinical: true,
    };
  }

  if (pending && claim === "invited") {
    return {
      claim,
      active: "pending",
      badge: "Invited · pending accept",
      todayTitle: "Accept your invitation",
      orientation:
        "Use your invitation code. You will only see the care circle after a valid accept.",
      navLabels: {
        today: "Today",
        care: "Care",
        people: "People",
        documents: "Documents",
        relay: "Relay",
      },
      relayTone: "Wait for invitation accept before any care context.",
      gateLead:
        "You said you were invited. Enter the secure code from an authorized person — no care data until it validates.",
      priorities: ["Enter invitation code", "Review role & scope", "Accept or decline"],
      prefersAccessControl: false,
      prefersShift: false,
      prefersClinical: false,
    };
  }

  // Family / friend (default caregiver framing)
  const primary = active === "family_primary";
  return {
    claim: claim === "unknown" ? "family_friend" : claim,
    active: pending ? "pending" : primary ? "family_primary" : "family_friend",
    badge: pending
      ? "Family / friend · pending access"
      : primary
        ? "Family caregiver"
        : "Family / friend",
    todayTitle: pending ? "Connect to care" : "Today’s care",
    orientation: pending
      ? "Helping a family member or friend starts with invitation, request, or a new provisional profile — never with this claim alone."
      : "Priorities, what changed, who helps next, and plain-language handoffs.",
    navLabels: {
      today: "Today",
      care: "Care",
      people: "People",
      documents: "Documents",
      relay: "Relay",
    },
    relayTone:
      "Plain language. Event time vs report time. Safe next steps. Confirm before consequential actions.",
    gateLead:
      "You said you help a family member or friend. Use an invitation, request access, or set up care for someone new — no existing record opens from this claim.",
    priorities: [
      "What needs you today",
      "Appointments & transport",
      "Meals, mobility, mood",
      "Who is helping next",
    ],
    prefersAccessControl: primary,
    prefersShift: false,
    prefersClinical: false,
  };
}

/**
 * Resolve experience for current session.
 * @param authorized — whether server/client memberships exist for any recipient
 * @param carePersonId — principal id
 * @param membershipRoleLabel — optional active membership label for current recipient
 */
export function resolveRoleExperience(input: {
  carePersonId?: string | null;
  authorized: boolean;
  membershipRoleLabel?: string | null;
  roles?: string[];
}): RoleExperience {
  const draft = loadOnboardingDraft();
  const authz = loadAuthorizationState();
  const claim =
    claimFromPath(draft.path) !== "unknown"
      ? claimFromPath(draft.path)
      : claimFromRoles(input.roles) !== "unknown"
        ? claimFromRoles(input.roles)
        : claimFromPath(
            (authz.claimedPath as CaregiverPath | null) ?? null,
          );

  if (!input.authorized) {
    return experienceFor(claim, "pending");
  }
  const active = activeRoleForPrincipal(
    input.carePersonId,
    input.membershipRoleLabel,
  );
  return experienceFor(claim, active === "pending" ? "invited_member" : active);
}

/** Gate action ids mapped to ESTABLISHED_ACTIONS / modes. */
export type GateActionId =
  | "join_circle"
  | "request_access"
  | "add_recipient"
  | "privacy_note";

export type GateAction = {
  id: GateActionId;
  title: string;
  detail: string;
  /** Maps to AuthorizationGate mode when actionable */
  mode: "invite" | "request" | "provisional" | null;
};

/**
 * Role-aware AuthorizationGate actions.
 * Order and copy diverge by claim; none grant access.
 */
export function gateActionsForClaim(claim: RoleClaim): GateAction[] {
  const invite: GateAction = {
    id: "join_circle",
    title: "Accept an invitation",
    detail: "Use a secure code from an authorized person — no PHI until accept",
    mode: "invite",
  };
  const request: GateAction = {
    id: "request_access",
    title: "Request access",
    detail:
      "Ask for approval to join someone’s care — you see nothing until approved",
    mode: "request",
  };
  const provisional: GateAction = {
    id: "add_recipient",
    title: "Set up care for someone new",
    detail:
      "Create a provisional care profile only — does not search or open existing people",
    mode: "provisional",
  };
  const myProfile: GateAction = {
    id: "add_recipient",
    title: "Set up my care profile",
    detail:
      "Create your own provisional care profile. Helpers need your invite or approval.",
    mode: "provisional",
  };
  const privacy: GateAction = {
    id: "privacy_note",
    title: "Privacy & who can help",
    detail:
      "After you have a care profile, you control invites, approvals, and revocations.",
    mode: null,
  };
  const orgInvite: GateAction = {
    id: "join_circle",
    title: "Join with assignment or invitation",
    detail:
      "Organization assignment or authorized invitation required — role claim is not enough",
    mode: "invite",
  };

  switch (claim) {
    case "receiving_care":
      return [invite, myProfile, request, privacy];
    case "paid_dsp":
      return [
        orgInvite,
        {
          ...request,
          title: "Request assignment access",
          detail:
            "Request access for an assigned recipient. Access is time-bounded and minimum necessary.",
        },
        provisional,
      ];
    case "clinician":
      return [
        orgInvite,
        {
          ...request,
          title: "Request clinical relationship",
          detail:
            "Clinical access needs verification and a valid recipient relationship — not this claim alone.",
        },
        provisional,
      ];
    case "invited":
      return [
        {
          ...invite,
          title: "Enter invitation code",
          detail:
            "Review inviter, recipient, role, scope, and expiration after the code validates.",
        },
        request,
        provisional,
      ];
    case "family_friend":
    case "organization":
    default:
      return [invite, request, provisional];
  }
}
