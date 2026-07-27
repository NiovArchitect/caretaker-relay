/**
 * Recipient privacy / access control center.
 */
import { useEffect, useState } from "react";
import { getSessionIdentity } from "../foundation/careClient";
import { loadActiveCareRecipientId } from "../lib/careContext";
import { careHttpJson } from "../foundation/careHttpClient";

type PrivacyCenter = {
  recipientName: string;
  canManage: boolean;
  people: Array<{
    personId: string;
    displayName: string;
    relationship: string;
    activeRole: string;
    authorizationSource: string;
    grantedAt: string | null;
    expiresAt: string | null;
    status: string;
    dataDomains: string[];
    actionsAllowed: string[];
    lastAccessSummary: string;
  }>;
  pendingRequests: Array<{
    id: string;
    requesterName: string;
    relationship: string;
    status: string;
    reason: string;
  }>;
  outstandingInvitations: Array<{
    id: string;
    inviteeDisplayName: string;
    roleLabel: string;
    status: string;
    expiresAt?: string;
  }>;
  connectedCalendar: { status: string; message: string };
  aiUseExplanation: string;
  notificationPreferencesNote: string;
};

export function PrivacyCenterPage({
  refreshKey,
}: {
  refreshKey?: number;
}) {
  const session = getSessionIdentity();
  const rid = loadActiveCareRecipientId();
  const [center, setCenter] = useState<PrivacyCenter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const raw = sessionStorage.getItem("cr_care_session_v1");
      const token = raw
        ? (JSON.parse(raw) as { token?: string }).token
        : null;
      if (!token || !rid || rid === "cr-none") {
        setError("No authorized care recipient for privacy center.");
        return;
      }
      const res = await careHttpJson<{
        ok: boolean;
        privacy: PrivacyCenter;
        message?: string;
      }>(`/api/v1/care/recipients/${encodeURIComponent(rid)}/privacy`, {
        token,
      });
      if (!res.ok) {
        setError(res.message || "Could not load privacy center");
        return;
      }
      setCenter(res.data.privacy);
    } catch {
      setError("Could not reach privacy center");
    }
  }

  useEffect(() => {
    void load();
  }, [rid, refreshKey, session.carePersonId]);

  async function revoke(personId: string) {
    setBusy(true);
    setStatus(null);
    try {
      const raw = sessionStorage.getItem("cr_care_session_v1");
      const token = raw
        ? (JSON.parse(raw) as { token?: string }).token
        : null;
      if (!token) return;
      const res = await careHttpJson(
        `/api/v1/care/recipients/${encodeURIComponent(rid)}/privacy/revoke`,
        {
          method: "POST",
          token,
          body: { target_person_id: personId },
        },
      );
      setStatus(res.ok ? "Access revoked. Their next request will be denied." : res.message || "Revoke failed");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function narrow(personId: string) {
    setBusy(true);
    try {
      const raw = sessionStorage.getItem("cr_care_session_v1");
      const token = raw
        ? (JSON.parse(raw) as { token?: string }).token
        : null;
      if (!token) return;
      await careHttpJson(
        `/api/v1/care/recipients/${encodeURIComponent(rid)}/privacy/scope`,
        {
          method: "POST",
          token,
          body: {
            target_person_id: personId,
            information_categories: ["daily", "observation"],
            allowed_actions: ["view", "record"],
          },
        },
      );
      setStatus("Scope narrowed to daily care and observations.");
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="section" data-testid="privacy-center">
      <div className="greeting">
        <h1>Privacy & access</h1>
        <p className="muted section-lead">
          Who can help with {center?.recipientName ?? "care"}, what they can see,
          and how to change it. Signed in as {session.displayName}.
        </p>
      </div>
      {error && (
        <p className="attention-limit" role="alert">
          {error}
        </p>
      )}
      {status && (
        <p className="attention-limit" role="status">
          {status}
        </p>
      )}
      {center && (
        <>
          <section className="surface-known" aria-label="AI use">
            <h2>How Relay uses information</h2>
            <p>{center.aiUseExplanation}</p>
            <p className="muted">{center.notificationPreferencesNote}</p>
            <p className="muted">
              Calendar: {center.connectedCalendar.status} —{" "}
              {center.connectedCalendar.message}
            </p>
          </section>

          <section className="surface-known" aria-label="People with access">
            <h2>People with access</h2>
            <ul className="list-plain" data-testid="privacy-people">
              {center.people.map((p) => (
                <li key={p.personId} className="card-row">
                  <strong>{p.displayName}</strong>
                  <span className="muted">
                    {" "}
                    · {p.relationship} · {p.status}
                  </span>
                  <div className="muted" style={{ marginTop: 4 }}>
                    Domains: {p.dataDomains.join(", ")}
                  </div>
                  <div className="muted">Actions: {p.actionsAllowed.join(", ")}</div>
                  <div className="muted">{p.lastAccessSummary}</div>
                  <div className="muted">
                    Source: {p.authorizationSource}
                    {p.grantedAt ? ` · since ${p.grantedAt}` : ""}
                    {p.expiresAt ? ` · ends ${p.expiresAt}` : ""}
                  </div>
                  {center.canManage && p.personId !== session.carePersonId && (
                    <div className="btn-row" style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        className="secondary-btn"
                        disabled={busy}
                        data-testid={`privacy-narrow-${p.personId}`}
                        onClick={() => void narrow(p.personId)}
                      >
                        Narrow scope
                      </button>
                      <button
                        type="button"
                        className="ghost-btn"
                        disabled={busy}
                        data-testid={`privacy-revoke-${p.personId}`}
                        onClick={() => void revoke(p.personId)}
                      >
                        Revoke access
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section
            className="surface-reported"
            data-testid="leave-circle-panel"
            aria-label="Leave this care circle"
          >
            <h2>Leave this care circle</h2>
            <p className="muted">
              You can remove your own access. Audit history is retained. This
              does not delete {session.displayName === "" ? "the" : ""} care
              recipient&apos;s record.
            </p>
            <button
              type="button"
              className="ghost-btn"
              data-testid="leave-circle-submit"
              disabled={busy}
              onClick={() => {
                void (async () => {
                  setBusy(true);
                  try {
                    const raw = sessionStorage.getItem("cr_care_session_v1");
                    const token = raw
                      ? (JSON.parse(raw) as { token?: string }).token
                      : undefined;
                    if (!token) return;
                    const { getCareApiBaseUrl } = await import(
                      "../foundation/careHttpClient"
                    );
                    const base = getCareApiBaseUrl();
                    const rid = loadActiveCareRecipientId();
                    await fetch(
                      `${base}/api/v1/care/recipients/${encodeURIComponent(rid)}/leave`,
                      {
                        method: "POST",
                        headers: {
                          "content-type": "application/json",
                          authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ reason: "Self leave from Privacy" }),
                      },
                    );
                    setStatus(
                      "Leave requested. Your access should be removed; re-login if still shown.",
                    );
                  } finally {
                    setBusy(false);
                  }
                })();
              }}
            >
              Leave care circle
            </button>
          </section>

          {center.pendingRequests.length > 0 && (
            <section className="surface-known">
              <h2>Pending access requests</h2>
              <ul className="list-plain">
                {center.pendingRequests.map((r) => (
                  <li key={r.id}>
                    {r.requesterName} · {r.relationship} · {r.status}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {center.outstandingInvitations.length > 0 && (
            <section className="surface-known">
              <h2>Outstanding invitations</h2>
              <ul className="list-plain">
                {center.outstandingInvitations.map((i) => (
                  <li key={i.id}>
                    {i.inviteeDisplayName} · {i.roleLabel} · {i.status}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
