import { useState } from "react";
import {
  bindInviteToken,
  loadAuthorizationState,
  submitAccessRequest,
} from "../lib/authorization";
import { ESTABLISHED_ACTIONS, loadOnboardingDraft, saveOnboardingDraft } from "../lib/onboarding";

/**
 * Shown when authenticated account has zero authorized care recipients.
 * Never lists or assumes existing recipients.
 */
export function AuthorizationGate({
  displayName,
  onInviteReady,
}: {
  displayName: string;
  onInviteReady?: (token: string) => void;
}) {
  const authz = loadAuthorizationState();
  const [mode, setMode] = useState<"home" | "request" | "invite" | "provisional">(
    "home",
  );
  const [recipientName, setRecipientName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [reason, setReason] = useState("");
  const [inviteCode, setInviteCode] = useState(authz.inviteTokenBound ?? "");
  const [status, setStatus] = useState<string | null>(
    authz.accessRequest?.status === "submitted"
      ? "Access request submitted. You will not see care details until approved."
      : authz.inviteTokenBound
        ? "Invitation code saved. Complete join when the care service validates it."
        : null,
  );

  function goRequest() {
    setMode("request");
    const d = loadOnboardingDraft();
    d.intent = "request_access";
    saveOnboardingDraft(d);
  }

  function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientName.trim() || recipientName.trim().length < 2) {
      setStatus("Enter the preferred name of the person you support.");
      return;
    }
    if (!relationship.trim()) {
      setStatus("Describe your relationship or authority basis.");
      return;
    }
    submitAccessRequest({
      recipientPreferredName: recipientName.trim(),
      relationship: relationship.trim(),
      reason: reason.trim(),
    });
    setStatus(
      `Request submitted for “${recipientName.trim()}”. No care record is visible until an authorized person approves. This is not medical access yet.`,
    );
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
        <h1>Connect to care</h1>
        <p className="for-person">Signed in as {displayName}</p>
      </div>
      <p className="muted section-lead" data-testid="authz-zero-recipients">
        Your account is ready. You are not connected to any care recipient yet.
        Selecting a role or typing a name does not open someone’s care record.
      </p>

      {status && (
        <p className="attention-limit" role="status" data-testid="authz-status">
          {status}
        </p>
      )}

      {mode === "home" && (
        <div className="onboarding-choices" role="list">
          {ESTABLISHED_ACTIONS.filter((a) => a.id !== "manage_recipients").map(
            (a) => (
              <button
                key={a.id}
                type="button"
                className="onboarding-choice"
                data-testid={`authz-action-${a.id}`}
                onClick={() => {
                  if (a.id === "request_access") goRequest();
                  else if (a.id === "join_circle") setMode("invite");
                  else if (a.id === "add_recipient") setMode("provisional");
                }}
              >
                <strong>{a.title}</strong>
                <span className="muted" style={{ display: "block", marginTop: 4 }}>
                  {a.detail}
                </span>
              </button>
            ),
          )}
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
            <button type="submit" className="primary-btn" data-testid="access-request-submit">
              Submit request
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

      {mode === "provisional" && (
        <div data-testid="provisional-recipient-panel">
          <h2>Set up a new care circle</h2>
          <p className="muted section-lead">
            Starting a circle for someone requires their consent or lawful
            authority (for example, an authorized representative). A provisional
            draft is not full access and is never linked to an existing person by
            name alone.
          </p>
          <p className="attention-limit" role="note">
            Production: identity matching and consent capture are required before
            any sensitive fields. This lab stores only your intent until authorized.
          </p>
          <div className="btn-row">
            <button type="button" className="ghost-btn" onClick={() => setMode("home")}>
              Back
            </button>
            <button
              type="button"
              className="primary-btn"
              data-testid="provisional-start"
              onClick={() => {
                setStatus(
                  "Provisional setup recorded as intent only. No existing care recipient was opened or assumed.",
                );
                setMode("home");
              }}
            >
              Record setup intent
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
