/**
 * Claim vs active role + zero-access gate ordering.
 * Claims never invent memberships or recipients.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  claimFromPath,
  claimFromRoles,
  activeRoleForPrincipal,
  resolveRoleExperience,
  gateActionsForClaim,
} from "../src/lib/roleExperience";
import { saveOnboardingDraft, emptyOnboardingDraft } from "../src/lib/onboarding";

describe("roleExperience — claim model", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("maps all five connection paths to distinct claims", () => {
    expect(claimFromPath("family_friend")).toBe("family_friend");
    expect(claimFromPath("receiving_care")).toBe("receiving_care");
    expect(claimFromPath("paid_dsp")).toBe("paid_dsp");
    expect(claimFromPath("clinician")).toBe("clinician");
    expect(claimFromPath("invited")).toBe("invited");
    expect(claimFromPath(null)).toBe("unknown");
  });

  it("parses claim tags from roles without granting active role", () => {
    expect(claimFromRoles(["claim:paid_dsp"])).toBe("paid_dsp");
    expect(claimFromRoles(["claim:clinician"])).toBe("clinician");
    expect(claimFromRoles(["claim:receiving_care"])).toBe("receiving_care");
    expect(claimFromRoles([])).toBe("unknown");
  });

  it("p-acct and pending principals stay pending (no active role)", () => {
    expect(activeRoleForPrincipal("p-acct-abc")).toBe("pending");
    expect(activeRoleForPrincipal("pending-local-1")).toBe("pending");
    expect(activeRoleForPrincipal(null)).toBe("pending");
  });

  it("lab principals map only when already known (not from claim)", () => {
    expect(activeRoleForPrincipal("p-sadeil")).toBe("family_primary");
    expect(activeRoleForPrincipal("p-walter")).toBe("dsp");
    expect(activeRoleForPrincipal("p-dr-shah")).toBe("clinician");
  });
});

describe("roleExperience — unauthorized diverges by claim, zero access", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("family claim: pending badge and family gate lead", () => {
    saveOnboardingDraft({
      ...emptyOnboardingDraft(),
      path: "family_friend",
      accountDisplayName: "Test",
    });
    const xp = resolveRoleExperience({
      carePersonId: "p-acct-x",
      authorized: false,
    });
    expect(xp.active).toBe("pending");
    expect(xp.claim).toBe("family_friend");
    expect(xp.badge.toLowerCase()).toMatch(/family|friend|pending/);
    expect(xp.gateLead.toLowerCase()).toMatch(/invitation|request|provisional|claim/);
  });

  it("receiving_care claim: recipient-oriented, prefers access control", () => {
    saveOnboardingDraft({
      ...emptyOnboardingDraft(),
      path: "receiving_care",
      accountDisplayName: "Self",
    });
    const xp = resolveRoleExperience({
      carePersonId: "p-acct-y",
      authorized: false,
    });
    expect(xp.claim).toBe("receiving_care");
    expect(xp.prefersAccessControl).toBe(true);
    expect(xp.todayTitle.toLowerCase()).toMatch(/care|your/);
    expect(xp.navLabels.people).toMatch(/helper/i);
  });

  it("DSP claim: shift framing, no access", () => {
    saveOnboardingDraft({
      ...emptyOnboardingDraft(),
      path: "paid_dsp",
      accountDisplayName: "DSP",
    });
    const xp = resolveRoleExperience({
      carePersonId: "p-acct-z",
      authorized: false,
    });
    expect(xp.prefersShift).toBe(true);
    expect(xp.badge.toLowerCase()).toMatch(/dsp|assignment|pending/);
    expect(xp.gateLead.toLowerCase()).toMatch(/assignment|invitation|claim/);
  });

  it("clinician claim: clinical framing, no access", () => {
    saveOnboardingDraft({
      ...emptyOnboardingDraft(),
      path: "clinician",
      accountDisplayName: "Doc",
    });
    const xp = resolveRoleExperience({
      carePersonId: "p-acct-c",
      authorized: false,
    });
    expect(xp.prefersClinical).toBe(true);
    expect(xp.badge.toLowerCase()).toMatch(/clinician|verification|pending/);
  });

  it("invited claim: invite-first gate actions", () => {
    saveOnboardingDraft({
      ...emptyOnboardingDraft(),
      path: "invited",
      accountDisplayName: "Guest",
    });
    const xp = resolveRoleExperience({
      carePersonId: "p-acct-i",
      authorized: false,
    });
    expect(xp.claim).toBe("invited");
    const actions = gateActionsForClaim(xp.claim);
    expect(actions[0].mode).toBe("invite");
    expect(actions[0].title.toLowerCase()).toMatch(/invitation|code/);
  });
});

describe("gateActionsForClaim — order diverges, never grants access", () => {
  it("family default: invite, request, provisional", () => {
    const ids = gateActionsForClaim("family_friend").map((a) => a.id);
    expect(ids).toEqual(["join_circle", "request_access", "add_recipient"]);
  });

  it("receiving_care prioritizes invite and own profile", () => {
    const acts = gateActionsForClaim("receiving_care");
    expect(acts[0].mode).toBe("invite");
    expect(acts.some((a) => a.title.toLowerCase().includes("my care"))).toBe(
      true,
    );
    expect(acts.some((a) => a.id === "privacy_note")).toBe(true);
  });

  it("DSP and clinician lead with org/assignment invite", () => {
    for (const c of ["paid_dsp", "clinician"] as const) {
      const first = gateActionsForClaim(c)[0];
      expect(first.mode).toBe("invite");
      expect(first.detail.toLowerCase()).toMatch(
        /assignment|organization|verification|claim/,
      );
    }
  });

  it("privacy_note does not grant access (explain-only, not invite/request)", () => {
    const privacy = gateActionsForClaim("receiving_care").find(
      (a) => a.id === "privacy_note",
    );
    // privacy_explain navigates to privacy education only — never access grant
    expect(privacy?.mode === null || privacy?.mode === "privacy_explain").toBe(
      true,
    );
    expect(privacy?.mode).not.toBe("invite");
    expect(privacy?.mode).not.toBe("request");
    expect(privacy?.mode).not.toBe("provisional");
  });
});

describe("roleExperience — authorized active roles", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("authorized DSP principal uses shift experience", () => {
    const xp = resolveRoleExperience({
      carePersonId: "p-walter",
      authorized: true,
      membershipRoleLabel: "DSP",
    });
    expect(xp.active).toBe("dsp");
    expect(xp.prefersShift).toBe(true);
    expect(xp.navLabels.today).toMatch(/shift/i);
  });

  it("authorized clinician uses clinical experience", () => {
    const xp = resolveRoleExperience({
      carePersonId: "p-dr-shah",
      authorized: true,
    });
    expect(xp.active).toBe("clinician");
    expect(xp.prefersClinical).toBe(true);
  });
});
