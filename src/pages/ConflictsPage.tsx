import { useEffect, useState } from "react";
import { getSessionIdentity } from "../foundation/careClient";
import { loadActiveCareRecipientId } from "../lib/careContext";
import { careHttpJson } from "../foundation/careHttpClient";
import {
  formatCareDateTimeRecent,
  humanCareLine,
} from "../lib/humanCopy";

type CareConflict = {
  id: string;
  kind: string;
  status: string;
  title: string;
  summary: string;
  sides: Array<{
    statement: string;
    actor?: string;
    eventAt?: string;
    reportAt?: string;
    confidence?: string;
  }>;
  whyCannotDecide: string;
  availableActions: string[];
  resolution?: string;
};

export function ConflictsPage() {
  const session = getSessionIdentity();
  const rid = loadActiveCareRecipientId();
  const [conflicts, setConflicts] = useState<CareConflict[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function load() {
    try {
      const raw = sessionStorage.getItem("cr_care_session_v1");
      const token = raw
        ? (JSON.parse(raw) as { token?: string }).token
        : null;
      if (!token || !rid || rid === "cr-none") {
        setError("No authorized recipient.");
        return;
      }
      const res = await careHttpJson<{
        ok: boolean;
        conflicts: CareConflict[];
      }>(`/api/v1/care/recipients/${encodeURIComponent(rid)}/conflicts`, {
        token,
      });
      if (!res.ok) {
        setError(res.message || "Could not load conflicts");
        return;
      }
      setConflicts(res.data.conflicts ?? []);
    } catch {
      setError("Could not load conflicts");
    }
  }

  useEffect(() => {
    void load();
  }, [rid, session.carePersonId]);

  async function resolve(id: string, chosen: string) {
    const raw = sessionStorage.getItem("cr_care_session_v1");
    const token = raw ? (JSON.parse(raw) as { token?: string }).token : null;
    if (!token) return;
    const res = await careHttpJson(
      `/api/v1/care/recipients/${encodeURIComponent(rid)}/conflicts/${encodeURIComponent(id)}/resolve`,
      {
        method: "POST",
        token,
        body: {
          resolution: "Authorized human resolution",
          chosen_statement: chosen,
        },
      },
    );
    setStatus(res.ok ? "Conflict resolved. History preserved." : res.message || "Failed");
    await load();
  }

  return (
    <div className="section" data-testid="conflicts-page">
      <div className="greeting">
        <h1>Care conflicts</h1>
        <p className="muted section-lead">
          When reports disagree, Relay keeps both and waits for an authorized
          person. It never silently chooses a medication dose.
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
      <ul className="list-plain">
        {conflicts.length === 0 && (
          <li className="muted">No open conflicts.</li>
        )}
        {conflicts.map((c) => (
          <li key={c.id} className="surface-known" data-testid={`conflict-${c.id}`}>
            <strong>{humanCareLine(c.title)}</strong>
            <div className="badge badge-teal">{humanCareLine(c.kind)}</div>
            <p>{humanCareLine(c.summary)}</p>
            <p className="attention-limit">{humanCareLine(c.whyCannotDecide)}</p>
            <ul className="list-plain">
              {c.sides.map((s, i) => (
                <li key={i}>
                  Side {i + 1}: {humanCareLine(s.statement)}
                  <div className="muted">
                    {s.actor ? humanCareLine(s.actor) : ""}
                    {s.eventAt
                      ? ` · event ${formatCareDateTimeRecent(s.eventAt) || humanCareLine(s.eventAt)}`
                      : ""}
                    {s.reportAt
                      ? ` · reported ${formatCareDateTimeRecent(s.reportAt) || humanCareLine(s.reportAt)}`
                      : ""}
                    {s.confidence ? ` · ${humanCareLine(s.confidence)}` : ""}
                  </div>
                  {c.status === "open" && (
                    <button
                      type="button"
                      className="secondary-btn"
                      data-testid={`resolve-side-${i}`}
                      onClick={() => void resolve(c.id, s.statement)}
                    >
                      Confirm this side
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {c.resolution && (
              <p className="muted">Resolution: {humanCareLine(c.resolution)}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
