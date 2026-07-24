import { useEffect, useState } from "react";
import {
  listLabPrincipals,
  loginAsPrincipal,
  type LabPrincipal,
  type SessionIdentity,
} from "../foundation/careClient";

/** Lab passwords are synthetic and bound to seed principals server-side. */
const LAB_PASSWORDS: Record<string, string> = {
  "p-sadeil": "sadeil-lab-password",
  "p-maya": "maya-lab-password",
  "p-walter": "walter-lab-password",
  "p-dr-shah": "drshah-lab-password",
};

export function LoginGate({
  onAuthenticated,
}: {
  onAuthenticated: (session: SessionIdentity) => void;
}) {
  const [principals, setPrincipals] = useState<LabPrincipal[]>([]);
  const [selected, setSelected] = useState<string>("p-sadeil");
  const [password, setPassword] = useState(LAB_PASSWORDS["p-sadeil"] ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    void listLabPrincipals().then((rows) => {
      if (rows.length) setPrincipals(rows);
      else {
        setPrincipals([
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
        ]);
      }
    });
  }, []);

  useEffect(() => {
    setPassword(LAB_PASSWORDS[selected] ?? "");
  }, [selected]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await loginAsPrincipal(selected, password);
    setBusy(false);
    if (!res.ok || !res.session) {
      setError(res.message ?? "Sign-in failed");
      return;
    }
    onAuthenticated(res.session);
  }

  return (
    <div className="cr-login-viewport" data-testid="login-gate">
      <div className="cr-login-ambient" aria-hidden />
      <form
        onSubmit={(ev) => void submit(ev)}
        className="cr-login-panel"
        aria-label="Sign in"
      >
        <div className="cr-login-panel-inner">
          <div className="cr-login-brand">
            <span className="brand-mark" aria-hidden />
            <span>Caretaker Relay</span>
          </div>
          <h1 className="cr-login-title">Sign in</h1>
          <p className="cr-login-sub">
            Shared care context for the people helping Evelyn. Ask or update
            without re-explaining.
          </p>

          <label className="cr-field">
            <span>Choose caregiver</span>
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

          <button
            type="button"
            className="cr-login-invite-toggle"
            onClick={() => setShowInvite((v) => !v)}
          >
            {showInvite ? "Hide invitation code" : "Have an invitation code?"}
          </button>

          {showInvite && (
            <label className="cr-field">
              <span>Invitation code</span>
              <input
                data-testid="login-invite-token"
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                placeholder="Paste code, then sign in"
              />
            </label>
          )}
          {/* Keep testid present for e2e when collapsed */}
          {!showInvite && (
            <input
              data-testid="login-invite-token"
              type="hidden"
              value={inviteToken}
              readOnly
            />
          )}
        </div>
      </form>
    </div>
  );
}
