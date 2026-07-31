import { useEffect, useState } from "react";
import {
  bindInviteToken,
  emptyAuthorizationState,
  loadAuthorizationState,
  saveAuthorizationState,
  submitAccessRequest,
} from "../lib/authorization";
import { loadOnboardingDraft, saveOnboardingDraft } from "../lib/onboarding";
import {
  careCreateProvisional,
  careRecipientSelfSetup,
  careSubmitAccessRequest,
} from "../foundation/careHttpClient";
import {
  claimFromPath,
  gateActionsForClaim,
  resolveRoleExperience,
} from "../lib/roleExperience";

/**
 * Shown when authenticated account has zero authorized care recipients.
 * Never lists or assumes existing recipients.
 * Role claim only shapes guidance — never grants access.
 */
export function AuthorizationGate({
  displayName,
  onInviteReady,
}: {
  displayName: string;
  onInviteReady?: (token: string) => void;
}) {
  const authz = loadAuthorizationState();
  const draft = loadOnboardingDraft();
  const claim = claimFromPath(draft.path);
  const roleXp = resolveRoleExperience({
    carePersonId: null,
    authorized: false,
  });
  const wantsNewCare =
    draft.intent === "set_up_care" ||
    (draft.helpersNote ?? "").includes("set_up_care_new_provisional");
  const wantsInvite = claim === "invited" || draft.intent === "accept_invite";
  const isSelfCare = claim === "receiving_care";
  const [mode, setMode] = useState<
    "home" | "request" | "invite" | "provisional" | "privacy_explain" | "section"
  >(wantsNewCare || isSelfCare ? "provisional" : wantsInvite ? "invite" : "home");
  const [section, setSection] = useState<
    "day" | "care" | "helpers" | "privacy" | "documents" | null
  >(null);
  const [recipientName, setRecipientName] = useState(
    isSelfCare ? displayName : "",
  );
  const [relationship, setRelationship] = useState(
    isSelfCare ? "Self — I am the person receiving care" : "",
  );
  const [reason, setReason] = useState("");
  const [inviteCode, setInviteCode] = useState(authz.inviteTokenBound ?? "");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(
    authz.accessRequest?.status === "submitted"
      ? "Access request submitted. You will not see care details until approved."
      : authz.inviteTokenBound
        ? "Invitation code saved. Complete join when the care service validates it."
        : null,
  );

  useEffect(() => {
    const onSetupNav = (ev: Event) => {
      const section = (ev as CustomEvent<{ section?: string }>).detail?.section;
      if (
        section === "day" ||
        section === "care" ||
        section === "helpers" ||
        section === "privacy" ||
        section === "documents"
      ) {
        setSection(section);
        setMode("section");
      }
    };
    window.addEventListener("cr-recipient-setup-nav", onSetupNav);
    return () => window.removeEventListener("cr-recipient-setup-nav", onSetupNav);
  }, []);

  function goRequest() {
    setMode("request");
    const d = loadOnboardingDraft();
    d.intent = "request_access";
    saveOnboardingDraft(d);
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientName.trim() || recipientName.trim().length < 2) {
      setStatus("Enter the preferred name of the person you support.");
      return;
    }
    if (!relationship.trim()) {
      setStatus("Describe your relationship or authority basis.");
      return;
    }
    setBusy(true);
    // Local draft always (offline-safe)
    submitAccessRequest({
      recipientPreferredName: recipientName.trim(),
      relationship: relationship.trim(),
      reason: reason.trim() || "Access needed for care coordination",
    });
    // Durable server record when JWT session exists
    try {
      const raw = sessionStorage.getItem("cr_care_session_v1");
      const parsed = raw
        ? (JSON.parse(raw) as { token?: string | null })
        : null;
      if (parsed?.token) {
        await careSubmitAccessRequest(parsed.token, {
          provisional_recipient_name: recipientName.trim(),
          claimed_relationship: relationship.trim(),
          reason: reason.trim() || "Access needed for care coordination",
        });
      }
    } catch {
      /* local draft remains */
    }
    setStatus(
      `Request submitted for “${recipientName.trim()}”. No care record is visible until an authorized person approves. This is not medical access yet.`,
    );
    setBusy(false);
    setMode("home");
  }

  function saveInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setStatus("Paste an invitation code.");
      return;
    }
    bindInviteToken(inviteCode.trim());
    onInviteReady?.(inviteCode.trim());
    setStatus(
      "Invitation code bound to your account. Open People to complete join when the server validates the code. Recipient identity is not shown until then.",
    );
    setMode("home");
  }

  return (
    <div className="section surface-known" data-testid="authorization-gate">
      <div className="greeting">
        <h1 data-testid="authz-role-title">{roleXp.todayTitle}</h1>
        <p className="for-person">Signed in as {displayName}</p>
        <p className="badge badge-teal" data-testid="authz-role-badge">
          {roleXp.badge}
        </p>
      </div>
      <p className="muted section-lead" data-testid="authz-zero-recipients">
        {roleXp.gateLead} A role claim never opens a care record. Access requires
        invitation, approval, assignment, or provisional activation.
      </p>
      <p className="muted" data-testid="authz-role-orientation">
        {roleXp.orientation}
      </p>

      {status && (
        <p className="attention-limit" role="status" data-testid="authz-status">
          {status}
        </p>
      )}

      {mode === "home" && (
        <div className="onboarding-choices" role="list">
          {gateActionsForClaim(claim).map((a) => (
            <button
              key={`${a.id}-${a.title}`}
              type="button"
              className="onboarding-choice"
              data-testid={`authz-action-${a.id}`}
              disabled={a.mode === null}
              onClick={() => {
                if (a.mode === "request") {
                  if (isSelfCare) {
                    setStatus(
                      "Request access is for helpers joining someone else's care. You are setting up your own care — use “Set up my care profile” or an invitation instead.",
                    );
                    return;
                  }
                  goRequest();
                } else if (a.mode === "invite") setMode("invite");
                else if (a.mode === "provisional") setMode("provisional");
                else if (a.mode === "privacy_explain")
                  setMode("privacy_explain");
              }}
            >
              <strong>{a.title}</strong>
              <span className="muted" style={{ display: "block", marginTop: 4 }}>
                {a.detail}
              </span>
            </button>
          ))}
        </div>
      )}

      {mode === "request" && (
        <form onSubmit={submitRequest} data-testid="access-request-form">
          <h2>Request access</h2>
          <p className="muted section-lead">
            An authorized person must approve. You will not see medications,
            notes, or contacts until then.
          </p>
          <label className="cr-field">
            <span>Preferred name of the person receiving care</span>
            <input
              data-testid="access-request-recipient"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
              minLength={2}
              autoComplete="off"
            />
          </label>
          <label className="cr-field">
            <span>Your relationship or authority</span>
            <input
              data-testid="access-request-relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. adult child, neighbor, DSP"
              required
            />
          </label>
          <label className="cr-field">
            <span>Why do you need access? (optional)</span>
            <textarea
              data-testid="access-request-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </label>
          <div className="btn-row">
            <button type="button" className="ghost-btn" onClick={() => setMode("home")}>
              Back
            </button>
            <button
              type="submit"
              className="primary-btn"
              data-testid="access-request-submit"
              disabled={busy}
            >
              {busy ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </form>
      )}

      {mode === "invite" && (
        <form onSubmit={saveInvite} data-testid="authz-invite-form">
          <h2>Join with invitation code</h2>
          <p className="muted section-lead">
            Codes are validated by the care service. Recipient details appear
            only after a successful accept.
          </p>
          <label className="cr-field">
            <span>Invitation code</span>
            <input
              data-testid="authz-invite-token"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
            />
          </label>
          <div className="btn-row">
            <button type="button" className="ghost-btn" onClick={() => setMode("home")}>
              Back
            </button>
            <button type="submit" className="primary-btn" data-testid="authz-invite-save">
              Save code
            </button>
          </div>
        </form>
      )}

      {mode === "privacy_explain" && (
        <section data-testid="recipient-privacy-explain">
          <h2>Privacy & who can help</h2>
          <ul className="list-plain">
            <li>
              Your care stays private until you invite someone or approve a
              request.
            </li>
            <li>
              You choose what each helper may see (daily support, schedule,
              emergency info, and more).
            </li>
            <li>
              You can revoke access later. Audit history is retained for safety.
            </li>
            <li>
              Caretaker Relay does not sell your care information or decide legal
              capacity for you.
            </li>
          </ul>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setMode("home")}
          >
            Back
          </button>
        </section>
      )}

      {mode === "section" && section && (
        <section data-testid={`recipient-setup-${section}`}>
          <h2>
            {section === "day" && "My day"}
            {section === "care" && "My care"}
            {section === "helpers" && "My helpers"}
            {section === "privacy" && "Privacy"}
            {section === "documents" && "My documents"}
          </h2>
          <p className="muted section-lead">
            {section === "day" &&
              "After your profile is active, My day shows your schedule, helpers, and reminders in plain language."}
            {section === "care" &&
              "My care holds preferences, routines, mobility needs, and emergency information you choose to share."}
            {section === "helpers" &&
              "Invite trusted people one at a time. They see only what you approve — never a public caregiver directory."}
            {section === "privacy" &&
              "Consent, invites, and revocations live here once your profile is active."}
            {section === "documents" &&
              "Care summaries and notes you approve will appear here. Nothing is shared without you."}
          </p>
          <div className="btn-row">
            <button
              type="button"
              className="primary-btn"
              data-testid="recipient-setup-continue-profile"
              onClick={() => setMode("provisional")}
            >
              Continue profile setup
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                setSection(null);
                setMode("home");
              }}
            >
              Back
            </button>
          </div>
        </section>
      )}

      {mode === "provisional" && (
        <form
          data-testid="provisional-recipient-panel"
          onSubmit={async (e) => {
            e.preventDefault();
            if (recipientName.trim().length < 2) {
              setStatus(
                isSelfCare
                  ? "Enter the name you want on your care profile."
                  : "Enter the preferred name for the care draft.",
              );
              return;
            }
            if (!relationship.trim()) {
              setStatus(
                isSelfCare
                  ? "Confirm this profile is for you (self)."
                  : "Describe your claimed authority (not proven access).",
              );
              return;
            }
            setBusy(true);
            try {
              const raw = sessionStorage.getItem("cr_care_session_v1");
              const parsed = raw
                ? (JSON.parse(raw) as {
                    token?: string | null;
                    identity?: { carePersonId?: string; displayName?: string };
                  })
                : null;
              if (parsed?.token && isSelfCare) {
                // Journey 1: create own care-recipient record + self relationship
                const res = await careRecipientSelfSetup(parsed.token, {
                  preferred_name: recipientName.trim(),
                  confirmation:
                    relationship.trim() ||
                    "I am creating a care space for myself",
                });
                if (res.ok) {
                  const memberships =
                    res.data.memberships ||
                    [
                      {
                        careRecipientId: res.data.care_recipient_id,
                        displayName: recipientName.trim(),
                        roleLabel: "Care recipient (self)",
                        status: "active",
                      },
                    ];
                  try {
                    sessionStorage.setItem(
                      "cr_care_session_v1",
                      JSON.stringify({
                        token: parsed.token,
                        identity: parsed.identity,
                        memberships,
                      }),
                    );
                    sessionStorage.setItem(
                      "cr.activeCareRecipientId",
                      res.data.care_recipient_id,
                    );
                    saveAuthorizationState({
                      ...emptyAuthorizationState(),
                      pendingRecipientAccess: false,
                      labPrincipalAuthorized: false,
                      displayName: displayName,
                      pathway: "create_provisional",
                    });
                  } catch {
                    /* ignore */
                  }
                  setStatus(
                    `Your care profile “${recipientName.trim()}” is ready. Opening your care space…`,
                  );
                  window.setTimeout(() => {
                    window.location.reload();
                  }, 400);
                  return;
                }
                setStatus(res.message || "Could not create your care profile.");
              } else if (parsed?.token) {
                const res = await careCreateProvisional(parsed.token, {
                  preferred_name: recipientName.trim(),
                  claimed_authority: relationship.trim(),
                  creator_note: reason.trim() || undefined,
                });
                if (res.ok) {
                  setStatus(
                    `Draft “${res.data.provisional.preferred_name}” saved (${res.data.provisional.status}). No care record opened. Bind/activate only after authorized path.`,
                  );
                } else {
                  setStatus(res.message || "Could not save provisional draft.");
                }
              } else {
                setStatus(
                  "Draft saved locally as intent only. Sign in with a durable account to persist on the care service.",
                );
              }
            } catch {
              setStatus("Could not reach care service for provisional draft.");
            }
            setBusy(false);
            setMode("home");
          }}
        >
          <h2>
            {isSelfCare ? "Set up my care profile" : "Set up a new care circle"}
          </h2>
          <p className="muted section-lead">
            {isSelfCare
              ? "Creates your own care space under the name you choose. Helpers only join when you invite them or approve a request. This never matches an existing person by name alone."
              : "Starting a circle for someone requires their consent or lawful authority (for example, an authorized representative). A provisional draft is not full access and is never linked to an existing person by name alone."}
          </p>
          <label className="cr-field">
            <span>
              {isSelfCare
                ? "Preferred name for your care profile"
                : "Preferred name (draft only)"}
            </span>
            <input
              data-testid="provisional-name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
              minLength={2}
            />
          </label>
          <label className="cr-field">
            <span>
              {isSelfCare
                ? "Confirm this profile is for you"
                : "Claimed authority"}
            </span>
            <input
              data-testid="provisional-authority"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder={
                isSelfCare
                  ? "I am the person receiving care (self)"
                  : "e.g. adult child, personal representative"
              }
              required
            />
          </label>
          <p className="attention-limit" role="note">
            {isSelfCare
              ? "To join an existing care record, use an invitation from an authorized caregiver. Name alone never grants access."
              : "No automatic match to existing people. Provider approval is only used when an organization assignment applies — not for private family circles."}
          </p>
          <div className="btn-row">
            <button type="button" className="ghost-btn" onClick={() => setMode("home")}>
              Back
            </button>
            <button
              type="submit"
              className="primary-btn"
              data-testid="provisional-start"
              disabled={busy}
            >
              {busy ? "Saving…" : "Save provisional draft"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
