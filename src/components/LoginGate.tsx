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
    <div className="app-shell cr-stage" data-testid="login-gate">
      <div className="cr-ambient" aria-hidden />
      <div className="login-scene">
        <div className="login-brand-panel">
          <div className="brand">
            <span className="brand-mark" aria-hidden />
            <span>Caretaker Relay</span>
          </div>
          <h1>Care without re-explaining</h1>
          <p className="lead">
            A quiet place for family and professional caregivers to keep one
            shared picture of care — organized, sourced, and human-verified.
          </p>
          <div className="login-pill-row">
            <span className="login-pill">Home &amp; community care</span>
            <span className="login-pill">Human verifies truth</span>
            <span className="login-pill">Intelligence with restraint</span>
          </div>
        </div>

        <form
          onSubmit={(ev) => void submit(ev)}
          className="login-card"
          aria-label="Sign in"
        >
          <h1>Sign in</h1>
          <p className="muted">
            Choose who you are. Identity is checked by the care service — not by
            switching names on this device.
          </p>
          <label>
            Choose caregiver
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
          <label>
            Password
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
          <div className="btn-row" style={{ marginTop: 20 }}>
            <button
              type="submit"
              className="primary-btn"
              data-testid="login-submit"
              disabled={busy}
            >
              {busy ? "Signing in…" : "Continue"}
            </button>
          </div>
          <p className="muted" style={{ fontSize: "0.85rem", marginTop: 16 }}>
            Evaluation household. Not production identity federation.
          </p>
          <label>
            Invitation code (optional)
            <input
              data-testid="login-invite-token"
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
              placeholder="If invited, paste the code"
            />
          </label>
          {inviteToken.trim() && (
            <p className="muted" style={{ fontSize: "0.82rem" }}>
              After sign-in, open People to accept the invitation.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
