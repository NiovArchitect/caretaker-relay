import { useEffect, useState } from "react";
import {
  listLabPrincipals,
  loginAsPrincipal,
  establishRegisteredSession,
  type LabPrincipal,
  type SessionIdentity,
} from "../foundation/careClient";
import { careRegister } from "../foundation/careHttpClient";
import { CaretakerRelayLogo } from "./BrandMark";
import { warmCareApi } from "../lib/apiWarm";
import {
  loadOnboardingDraft,
  saveOnboardingDraft,
  type CaregiverPath,
  type OnboardingIntent,
  PATH_LABELS,
} from "../lib/onboarding";
import {
  bindInviteToken,
  makePendingPersonId,
  markLabPrincipalAuthorized,
  markPendingAccount,
} from "../lib/authorization";
import { saveActiveCareRecipientId } from "../lib/careContext";

/** Lab passwords are synthetic and bound to seed principals server-side. Demo only. */
const LAB_PASSWORDS: Record<string, string> = {
  "p-sadeil": "sadeil-lab-password",
  "p-maya": "maya-lab-password",
  "p-walter": "walter-lab-password",
  "p-dr-shah": "drshah-lab-password",
};

type EntryMode = "home" | "sign_in" | "create" | "invite" | "setup_new";

const FALLBACK_PRINCIPALS: LabPrincipal[] = [
  {
    care_person_id: "p-sadeil",
    display_name: "Marcus Carter",
    role_label: "Primary family caregiver",
  },
  {
    care_person_id: "p-maya",
    display_name: "Maya Bennett",
    role_label: "Family / friend caregiver",
  },
  {
    care_person_id: "p-walter",
    display_name: "Daniel Kim",
    role_label: "Professional caregiver",
  },
  {
    care_person_id: "p-dr-shah",
    display_name: "Dr. Priya Shah",
    role_label: "Primary care physician",
  },
];

export function LoginGate({
  onAuthenticated,
}: {
  onAuthenticated: (session: SessionIdentity) => void;
}) {
  const [mode, setMode] = useState<EntryMode>("home");
  const [principals, setPrincipals] = useState<LabPrincipal[]>(FALLBACK_PRINCIPALS);
  const [selected, setSelected] = useState<string>("p-sadeil");
  const [password, setPassword] = useState(LAB_PASSWORDS["p-sadeil"] ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState("");
  const [createPath, setCreatePath] = useState<CaregiverPath | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [warmHint, setWarmHint] = useState(false);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  /** True when entry was “Set up care for someone new” (provisional only). */
  const [setupNewCare, setSetupNewCare] = useState(false);

  useEffect(() => {
    // Fire-and-forget warm — never delay first paint of login UI.
    void warmCareApi(true).then(() => setWarmHint(true));
    void listLabPrincipals().then((rows) => {
      if (rows.length) setPrincipals(rows);
    });
  }, []);

  useEffect(() => {
    setPassword(LAB_PASSWORDS[selected] ?? "");
  }, [selected]);

  function goHome() {
    setMode("home");
    setError(null);
    setSetupNewCare(false);
  }

  function rememberIntent(intent: OnboardingIntent, path?: CaregiverPath | null) {
    const d = loadOnboardingDraft();
    d.intent = intent;
    if (path) d.path = path;
    if (intent === "set_up_care" || intent === "create_account") {
      d.completed = false;
      d.awaitingAuthorization = true;
    }
    saveOnboardingDraft(d);
  }

  async function doLabLogin(carePersonId: string, pw: string) {
    setBusy(true);
    setError(null);
    setStatusLine("Signing in…");
    const started = Date.now();
    // Do not await warm — login runs immediately; warm is background only.
    void warmCareApi();
    const wakeHint = window.setTimeout(() => {
      setStatusLine(
        "Secure care service is waking. Your access has not changed.",
      );
    }, 2500);
    try {
      const res = await loginAsPrincipal(carePersonId, pw);
      if (!res.ok || !res.session) {
        const slow = Date.now() - started > 8000;
        setError(
          (res.message ?? "Sign-in failed") +
            (slow ? " The care service may have been waking up — try again." : ""),
        );
        return;
      }
      // Lab demo principals only — authorized via server membership, not role claim
      markLabPrincipalAuthorized(res.session.displayName);
      const d = loadOnboardingDraft();
      d.awaitingAuthorization = false;
      d.completed = true;
      saveOnboardingDraft(d);
      setStatusLine(null);
      onAuthenticated(res.session);
    } catch {
      setError("Could not reach the care service. Wait a moment and try again.");
    } finally {
      window.clearTimeout(wakeHint);
      setBusy(false);
      setStatusLine(null);
    }
  }

  async function submitSignIn(e: React.FormEvent) {
    e.preventDefault();
    rememberIntent("sign_in");
    await doLabLogin(selected, password);
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = displayName.trim();
    if (!name) {
      setError("Your name is required so care actions can be attributed to you.");
      return;
    }
    if (name.length < 2) {
      setError("Enter a preferred name with at least 2 characters.");
      return;
    }
    if (!createPath) {
      setError("Choose how you are connecting. This does not grant care access.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email. You will need to verify it before sensitive access.");
      return;
    }
    if (createPassword.trim().length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }

    setBusy(true);
    setError(null);
    setStatusLine("Creating secure account…");
    void warmCareApi();
    const wakeHint = window.setTimeout(() => {
      setStatusLine(
        "Secure care service is waking. Your access has not changed.",
      );
    }, 2500);

    // Prefer durable server registration (zero memberships). Fall back to
    // local pending shell only if API is unreachable.
    try {
      const reg = await careRegister({
        preferred_name: name,
        email: email.trim().toLowerCase(),
        password: createPassword,
        claimed_relationship: createPath,
      });
      if (reg.ok) {
        markPendingAccount(name, createPath);
        saveActiveCareRecipientId("cr-none");
        const d = loadOnboardingDraft();
        d.intent = setupNewCare
          ? "set_up_care"
          : createPath === "invited"
            ? "accept_invite"
            : "create_account";
        d.path = createPath;
        d.accountDisplayName = name;
        d.recipientPreferredName = "";
        d.awaitingAuthorization = true;
        d.completed = false;
        // Flag provisional-only path for AuthorizationGate
        if (setupNewCare) {
          d.helpersNote =
            "INTENT:set_up_care_new_provisional — create new profile only, never match existing";
        }
        saveOnboardingDraft(d);

        const session: SessionIdentity = {
          carePersonId: reg.data.care_person_id,
          displayName: reg.data.display_name || name,
          roleLabel: setupNewCare
            ? "Account — new care profile pending"
            : "Account pending authorization",
          authMode: (reg.data.auth_mode as SessionIdentity["authMode"]) ?? "http",
        };
        try {
          sessionStorage.setItem(
            "cr_care_session_v1",
            JSON.stringify({
              token: reg.data.token,
              identity: session,
              pending: true,
              email: email.trim().toLowerCase(),
              setupNewCare: setupNewCare || undefined,
            }),
          );
        } catch {
          /* ignore */
        }
        establishRegisteredSession(reg.data.token, session);
        window.clearTimeout(wakeHint);
        setBusy(false);
        setStatusLine(null);
        onAuthenticated(session);
        return;
      }
      // If server rejects (e.g. email in use), show message — do not fake access
      if (reg.status > 0) {
        window.clearTimeout(wakeHint);
        setError(reg.message || "Could not create account");
        setBusy(false);
        setStatusLine(null);
        return;
      }
    } catch {
      /* network — fall through to local pending shell */
    }
    window.clearTimeout(wakeHint);
    setStatusLine(null);

    // Offline / API-down fail-closed local shell (no JWT, no recipients)
    const pendingId = makePendingPersonId();
    markPendingAccount(name, createPath);
    saveActiveCareRecipientId("cr-none");

    const d = loadOnboardingDraft();
    d.intent = createPath === "invited" ? "accept_invite" : "create_account";
    d.path = createPath;
    d.accountDisplayName = name;
    d.recipientPreferredName = "";
    d.awaitingAuthorization = true;
    d.completed = false;
    saveOnboardingDraft(d);

    const session: SessionIdentity = {
      carePersonId: pendingId,
      displayName: name,
      roleLabel: "Account pending authorization",
      authMode: "pending_local",
    };

    try {
      sessionStorage.setItem(
        "cr_care_session_v1",
        JSON.stringify({
          token: null,
          identity: session,
          pending: true,
          email: email.trim().toLowerCase(),
        }),
      );
    } catch {
      /* ignore */
    }

    setBusy(false);
    onAuthenticated(session);
  }

  function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    const token = inviteToken.trim();
    if (!token) {
      setError("Paste the invitation code you received.");
      return;
    }
    if (!displayName.trim()) {
      setError("Your name is required before accepting an invitation.");
      return;
    }

    setBusy(true);
    // Bind token only — do not reveal recipient until accept succeeds server-side.
    bindInviteToken(token);
    markPendingAccount(displayName.trim(), "invited");
    saveActiveCareRecipientId("cr-none");

    const d = loadOnboardingDraft();
    d.intent = "accept_invite";
    d.path = "invited";
    d.accountDisplayName = displayName.trim();
    d.awaitingAuthorization = true;
    d.helpersNote = "Invitation code saved. Open People after you finish account setup to complete join.";
    saveOnboardingDraft(d);

    const session: SessionIdentity = {
      carePersonId: makePendingPersonId(),
      displayName: displayName.trim(),
      roleLabel: "Invitation pending",
      authMode: "pending_local",
    };
    try {
      sessionStorage.setItem(
        "cr_care_session_v1",
        JSON.stringify({
          token: null,
          identity: session,
          pending: true,
          inviteToken: token,
        }),
      );
    } catch {
      /* ignore */
    }
    setBusy(false);
    onAuthenticated(session);
  }

  return (
    <div className="cr-login-viewport" data-testid="login-gate">
      <div className="cr-login-ambient" aria-hidden />
      <div className="cr-login-panel" data-testid="login-panel">
        <div className="cr-login-panel-inner">
          <div className="cr-login-brand">
            <CaretakerRelayLogo layout="stacked" markSize={56} testId="login-brand-logo" />
            <p className="muted cr-login-tag">Shared care, verified</p>
          </div>

          {statusLine && (
            <p
              className="attention-limit"
              role="status"
              data-testid="login-status"
              aria-live="polite"
            >
              {statusLine}
            </p>
          )}
          {warmHint && !busy && mode === "home" && (
            <p className="muted sr-only" data-testid="api-warm-ready">
              Care service warm
            </p>
          )}

          {mode === "home" && (
            <div data-testid="login-entry-home">
              <h1 className="cr-login-title">Care continuity</h1>
              <p className="cr-login-sub">
                Create an account or sign in. Access to someone’s care requires
                an invitation or approval — not a role selection alone.
              </p>
              <div className="login-entry-grid" data-testid="login-entry-paths">
                <button
                  type="button"
                  className="login-entry-card primary-surface"
                  data-testid="entry-sign-in"
                  onClick={() => setMode("sign_in")}
                >
                  <strong>Sign in</strong>
                  <span className="muted">
                    Return to care you already have access to
                  </span>
                </button>
                <button
                  type="button"
                  className="login-entry-card primary-surface"
                  data-testid="entry-create"
                  onClick={() => {
                    setSetupNewCare(false);
                    rememberIntent("create_account");
                    setMode("create");
                  }}
                >
                  <strong>Create account</strong>
                  <span className="muted">
                    Create a private account with no care access
                  </span>
                </button>
              </div>
              <p className="muted cr-login-secondary-label" data-testid="login-secondary-label">
                Secure paths
              </p>
              <div
                className="login-entry-grid login-entry-grid-secondary"
                data-testid="login-entry-paths-secondary"
              >
                <button
                  type="button"
                  className="login-entry-card"
                  data-testid="entry-invite"
                  onClick={() => setMode("invite")}
                >
                  <strong>Accept invitation</strong>
                  <span className="muted">
                    Use a secure invitation from an authorized person
                  </span>
                </button>
                <button
                  type="button"
                  className="login-entry-card"
                  data-testid="entry-setup-care"
                  onClick={() => {
                    setSetupNewCare(true);
                    rememberIntent("set_up_care", "family_friend");
                    setCreatePath("family_friend");
                    setMode("setup_new");
                  }}
                >
                  <strong>Set up care for someone new</strong>
                  <span className="muted">
                    Create a new provisional care profile
                  </span>
                </button>
              </div>
              {warmHint && (
                <p className="muted cr-login-warm" data-testid="login-warm-ready">
                  Care service is ready.
                </p>
              )}
              <p className="muted cr-login-lab-note" data-testid="login-lab-boundary">
                Lab demo sign-in uses seeded principals. Create account never
                opens an existing care record. “Someone new” never searches for
                people already in the system.
              </p>
            </div>
          )}

          {mode === "sign_in" && (
            <form
              onSubmit={(ev) => void submitSignIn(ev)}
              aria-label="Sign in"
              data-testid="login-sign-in-form"
            >
              <button type="button" className="cr-login-back" onClick={goHome} data-testid="login-back">
                ← All options
              </button>
              <h1 className="cr-login-title">Sign in</h1>
              <p className="muted cr-login-paths">
                Lab demo: choose a seeded caregiver with existing memberships.
                Production uses verified identity and invitations.
              </p>
              <label className="cr-field">
                <span>Caregiver (lab)</span>
                <select
                  data-testid="login-principal"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  {principals.map((p) => (
                    <option key={p.care_person_id} value={p.care_person_id}>
                      {p.display_name} · {p.role_label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="cr-field">
                <span>Password</span>
                <input
                  data-testid="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </label>
              {error && (
                <p className="attention-limit" role="alert" data-testid="login-error">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="primary-btn cr-login-submit"
                data-testid="login-submit"
                disabled={busy}
              >
                {busy ? "Signing in…" : "Continue"}
              </button>
            </form>
          )}

          {(mode === "create" || mode === "setup_new") && (
            <form
              onSubmit={(ev) => void submitCreate(ev)}
              aria-label={
                mode === "setup_new"
                  ? "Set up care for someone new"
                  : "Create account"
              }
              data-testid="login-create-form"
            >
              <button type="button" className="cr-login-back" onClick={goHome} data-testid="login-back">
                ← All options
              </button>
              <h1 className="cr-login-title">
                {mode === "setup_new"
                  ? "Set up care for someone new"
                  : "Create account"}
              </h1>
              {mode === "setup_new" ? (
                <p className="muted section-lead" data-testid="setup-new-boundary">
                  This creates <strong>your private account</strong>, then a{" "}
                  <strong>new provisional care profile</strong> only. It does not
                  search for or connect to anyone already in Caretaker Relay.
                  Authority still needs confirmation before full access.
                </p>
              ) : (
                <p className="muted section-lead" data-testid="create-account-boundary">
                  This creates your account only. You will not see anyone’s care
                  record until invited or approved. Selecting a role is not
                  authorization.
                </p>
              )}
              <label className="cr-field">
                <span>Your preferred name (required)</span>
                <input
                  data-testid="create-display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we address you?"
                  autoComplete="name"
                  required
                  minLength={2}
                />
              </label>
              <label className="cr-field">
                <span>Email (required)</span>
                <input
                  data-testid="create-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="cr-field">
                <span>Password (required, min 8)</span>
                <input
                  data-testid="create-password"
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </label>
              <p className="muted" style={{ fontSize: "0.82rem" }}>
                How you connect (claim only — not access):
              </p>
              <div className="onboarding-choices" role="list">
                {(
                  [
                    "family_friend",
                    "receiving_care",
                    "paid_dsp",
                    "clinician",
                    "invited",
                  ] as CaregiverPath[]
                ).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="listitem"
                    className={
                      createPath === key
                        ? "onboarding-choice is-selected"
                        : "onboarding-choice"
                    }
                    data-testid={`create-path-${key}`}
                    onClick={() => setCreatePath(key)}
                  >
                    {PATH_LABELS[key]}
                  </button>
                ))}
              </div>
              {error && (
                <p className="attention-limit" role="alert" data-testid="login-error">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="primary-btn cr-login-submit"
                data-testid="create-submit"
                disabled={
                  busy ||
                  !createPath ||
                  !displayName.trim() ||
                  !email.trim() ||
                  createPassword.trim().length < 8
                }
              >
                {busy ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}

          {mode === "invite" && (
            <form
              onSubmit={(ev) => submitInvite(ev)}
              aria-label="Accept invitation"
              data-testid="login-invite-form"
            >
              <button type="button" className="cr-login-back" onClick={goHome} data-testid="login-back">
                ← All options
              </button>
              <h1 className="cr-login-title">Accept invitation</h1>
              <p className="muted section-lead">
                Enter your name and the code. Care details appear only after the
                invitation is validated — codes do not reveal recipients until
                accepted.
              </p>
              <label className="cr-field">
                <span>Your preferred name (required)</span>
                <input
                  data-testid="invite-display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  minLength={2}
                />
              </label>
              <label className="cr-field">
                <span>Invitation code</span>
                <input
                  data-testid="login-invite-token"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  placeholder="Paste code"
                  autoComplete="one-time-code"
                />
              </label>
              {error && (
                <p className="attention-limit" role="alert" data-testid="login-error">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="primary-btn cr-login-submit"
                data-testid="invite-entry-submit"
                disabled={busy || !inviteToken.trim() || !displayName.trim()}
              >
                {busy ? "Saving…" : "Continue with code"}
              </button>
            </form>
          )}

          {mode === "home" && (
            <>
              <input type="hidden" data-testid="login-principal" value={selected} readOnly />
              <input type="hidden" data-testid="login-password" value={password} readOnly />
              <input type="hidden" data-testid="login-invite-token" value={inviteToken} readOnly />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
