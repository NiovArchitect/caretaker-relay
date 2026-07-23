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
    <div className="app-shell" data-testid="login-gate">
      <form
        onSubmit={(ev) => void submit(ev)}
        className="login-card"
        aria-label="Sign in"
      >
        <div className="brand" style={{ marginBottom: 12 }}>
          <span className="brand-mark" aria-hidden />
          <span>Caretaker Relay</span>
        </div>
        <h1>Sign in</h1>
        <p className="muted">
          Sign in as an authorized caregiver. Identity is established by the
          care API — not by client-side switching.
        </p>
        <label>
          Principal
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
        <div className="btn-row" style={{ marginTop: 18 }}>
          <button
            type="submit"
            className="primary-btn"
            data-testid="login-submit"
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </div>
        <p className="muted" style={{ fontSize: "0.85rem", marginTop: 14 }}>
          Synthetic lab household for evaluation. Not production identity
          federation.
        </p>
        <label>
          Invitation token (optional — paste after invite)
          <input
            data-testid="login-invite-token"
            value={inviteToken}
            onChange={(e) => setInviteToken(e.target.value)}
            placeholder="Accept after sign-in via People"
          />
        </label>
        {inviteToken.trim() && (
          <p className="muted" style={{ fontSize: "0.82rem" }}>
            After sign-in as the invitee, open People → Accept invitation.
          </p>
        )}
      </form>
    </div>
  );
}
