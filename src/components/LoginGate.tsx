import { useEffect, useState } from "react";
import {
  listLabPrincipals,
  loginAsPrincipal,
  type LabPrincipal,
  type SessionIdentity,
} from "../foundation/careClient";
import { CaretakerRelayLogo } from "./BrandMark";
import { warmCareApi } from "../lib/apiWarm";
import {
  labPrincipalForPath,
  loadOnboardingDraft,
  saveOnboardingDraft,
  type CaregiverPath,
  type OnboardingIntent,
  PATH_LABELS,
} from "../lib/onboarding";

/** Lab passwords are synthetic and bound to seed principals server-side. */
const LAB_PASSWORDS: Record<string, string> = {
  "p-sadeil": "sadeil-lab-password",
  "p-maya": "maya-lab-password",
  "p-walter": "walter-lab-password",
  "p-dr-shah": "drshah-lab-password",
};

type EntryMode = "home" | "sign_in" | "create" | "invite";

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
  const [warmHint, setWarmHint] = useState(false);

  // Instant UI: fallback principals first; warm API in background.
  useEffect(() => {
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
  }

  function rememberIntent(intent: OnboardingIntent, path?: CaregiverPath | null) {
    const d = loadOnboardingDraft();
    d.intent = intent;
    if (path) d.path = path;
    if (intent === "set_up_care" || intent === "create_account") {
      d.completed = false;
    }
    saveOnboardingDraft(d);
  }

  async function doLogin(carePersonId: string, pw: string) {
    setBusy(true);
    setError(null);
    const started = Date.now();
    // Ensure warm completed or race it — reduces pure cold-start pain.
    await warmCareApi();
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
      onAuthenticated(res.session);
    } catch {
      setError(
        "Could not reach the care service. Wait a moment and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitSignIn(e: React.FormEvent) {
    e.preventDefault();
    rememberIntent("sign_in");
    await doLogin(selected, password);
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createPath) {
      setError("Choose how you are connecting.");
      return;
    }
    const pid = labPrincipalForPath(createPath);
    rememberIntent(
      createPath === "invited" ? "accept_invite" : "create_account",
      createPath,
    );
    if (displayName.trim()) {
      const d = loadOnboardingDraft();
      d.relationship = displayName.trim();
      saveOnboardingDraft(d);
    }
    // Lab product: map path → seeded principal (real IdP is external).
    await doLogin(pid, LAB_PASSWORDS[pid] ?? "");
  }

  async function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteToken.trim()) {
      setError("Paste the invitation code you received.");
      return;
    }
    rememberIntent("accept_invite", "invited");
    const d = loadOnboardingDraft();
    d.helpersNote = `Invite code on file: ${inviteToken.trim().slice(0, 12)}…`;
    saveOnboardingDraft(d);
    // Sign in as family helper, then accept on People with the code.
    await doLogin("p-maya", LAB_PASSWORDS["p-maya"]);
  }

  return (
    <div className="cr-login-viewport" data-testid="login-gate">
      <div className="cr-login-ambient" aria-hidden />
      <div className="cr-login-panel" data-testid="login-panel">
        <div className="cr-login-panel-inner">
          <div className="cr-login-brand">
            <CaretakerRelayLogo
              layout="stacked"
              markSize={52}
              testId="login-brand-logo"
            />
            <p className="muted cr-login-tag">Shared care, verified</p>
          </div>

          {mode === "home" && (
            <div data-testid="login-entry-home">
              <h1 className="cr-login-title">Care continuity</h1>
              <p className="cr-login-sub">
                One trusted picture for everyone helping — without re-explaining
                the day.
              </p>
              <div className="login-entry-grid" data-testid="login-entry-paths">
                <button
                  type="button"
                  className="login-entry-card primary-surface"
                  data-testid="entry-sign-in"
                  onClick={() => setMode("sign_in")}
                >
                  <strong>Sign in</strong>
                  <span className="muted">I already have access</span>
                </button>
                <button
                  type="button"
                  className="login-entry-card"
                  data-testid="entry-create"
                  onClick={() => {
                    rememberIntent("create_account");
                    setMode("create");
                  }}
                >
                  <strong>Create account</strong>
                  <span className="muted">Start or join care support</span>
                </button>
                <button
                  type="button"
                  className="login-entry-card"
                  data-testid="entry-invite"
                  onClick={() => setMode("invite")}
                >
                  <strong>Accept invitation</strong>
                  <span className="muted">I received a code</span>
                </button>
                <button
                  type="button"
                  className="login-entry-card"
                  data-testid="entry-setup-care"
                  onClick={() => {
                    rememberIntent("set_up_care", "family_friend");
                    setCreatePath("family_friend");
                    setMode("create");
                  }}
                >
                  <strong>Set up care</strong>
                  <span className="muted">For someone you support</span>
                </button>
              </div>
              {warmHint && (
                <p className="muted cr-login-warm" data-testid="login-warm-ready">
                  Care service is ready.
                </p>
              )}
            </div>
          )}

          {mode === "sign_in" && (
            <form
              onSubmit={(ev) => void submitSignIn(ev)}
              aria-label="Sign in"
              data-testid="login-sign-in-form"
            >
              <button
                type="button"
                className="cr-login-back"
                onClick={goHome}
                data-testid="login-back"
              >
                ← All options
              </button>
              <h1 className="cr-login-title">Sign in</h1>
              <p className="muted cr-login-paths">
                Lab demo: choose a caregiver. Production identity will use your
                organization or email.
              </p>
              <label className="cr-field">
                <span>Caregiver</span>
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
              {busy && (
                <p className="muted cr-login-wait-hint" data-testid="login-wait-hint">
                  Opening your care space. First open after idle can take longer.
                </p>
              )}
            </form>
          )}

          {mode === "create" && (
            <form
              onSubmit={(ev) => void submitCreate(ev)}
              aria-label="Create account"
              data-testid="login-create-form"
            >
              <button
                type="button"
                className="cr-login-back"
                onClick={goHome}
                data-testid="login-back"
              >
                ← All options
              </button>
              <h1 className="cr-login-title">Create account</h1>
              <p className="muted section-lead">
                Tell us how you connect to care — we’ll open the right space.
                Health details come later.
              </p>
              <label className="cr-field">
                <span>Your name (optional)</span>
                <input
                  data-testid="create-display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we address you?"
                  autoComplete="name"
                />
              </label>
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
                disabled={busy || !createPath}
              >
                {busy ? "Setting up…" : "Continue"}
              </button>
              {busy && (
                <p className="muted cr-login-wait-hint" data-testid="login-wait-hint">
                  Preparing your account…
                </p>
              )}
            </form>
          )}

          {mode === "invite" && (
            <form
              onSubmit={(ev) => void submitInvite(ev)}
              aria-label="Accept invitation"
              data-testid="login-invite-form"
            >
              <button
                type="button"
                className="cr-login-back"
                onClick={goHome}
                data-testid="login-back"
              >
                ← All options
              </button>
              <h1 className="cr-login-title">Accept invitation</h1>
              <p className="muted section-lead">
                Paste the code from your invitation. After sign-in, open People
                to finish joining the circle.
              </p>
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
                disabled={busy || !inviteToken.trim()}
              >
                {busy ? "Joining…" : "Continue with code"}
              </button>
              {busy && (
                <p className="muted cr-login-wait-hint" data-testid="login-wait-hint">
                  Connecting…
                </p>
              )}
            </form>
          )}

          {/* Hidden principal fields for e2e when on home (smoke can open sign-in) */}
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
