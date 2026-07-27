import { useEffect, useState } from "react";
import { getSessionIdentity } from "../foundation/careClient";
import { loadActiveCareRecipientId } from "../lib/careContext";
import { careHttpJson } from "../foundation/careHttpClient";

type ClinicalSummary = {
  recipientName: string;
  recentChanges: Array<{
    statement: string;
    truth: string;
    eventAt?: string;
    reportAt?: string;
    source?: string;
    confidence?: string;
  }>;
  trends: string[];
  medicationPlan: Array<{ name: string; dose: string; schedule: string }>;
  medicationAdministrations: Array<{
    name: string;
    dose: string;
    at: string;
    status: string;
  }>;
  uncertainOrMissed: string[];
  appointments: Array<{ title: string; when: string; status: string }>;
  unresolvedQuestions: string[];
  corrections: Array<{ previous: string; corrected: string; at: string }>;
  careTeamQuestions: string[];
  openConflicts: number;
  boundaries: string[];
};

export function ClinicalSummaryPage() {
  const session = getSessionIdentity();
  const rid = loadActiveCareRecipientId();
  const [summary, setSummary] = useState<ClinicalSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const raw = sessionStorage.getItem("cr_care_session_v1");
        const token = raw
          ? (JSON.parse(raw) as { token?: string }).token
          : null;
        if (!token || !rid || rid === "cr-none") {
          setError("No authorized clinical relationship.");
          return;
        }
        const res = await careHttpJson<{
          ok: boolean;
          summary: ClinicalSummary;
          message?: string;
        }>(
          `/api/v1/care/recipients/${encodeURIComponent(rid)}/clinical-summary`,
          { token },
        );
        if (!res.ok) {
          setError(res.message || "Clinical summary not available for this role");
          return;
        }
        setSummary(res.data.summary);
      } catch {
        setError("Could not load clinical summary");
      }
    })();
  }, [rid, session.carePersonId]);

  return (
    <div className="section" data-testid="clinical-summary">
      <div className="greeting">
        <h1>Clinical summary</h1>
        <p className="muted section-lead">
          Evidence-linked view for {summary?.recipientName ?? "this person"}. Not
          a diagnosis. Signed in as {session.displayName}.
        </p>
      </div>
      {error && (
        <p className="attention-limit" role="alert">
          {error}
        </p>
      )}
      {summary && (
        <>
          <section className="surface-known">
            <h2>Boundaries</h2>
            <ul className="list-plain">
              {summary.boundaries.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>
          <section className="surface-known">
            <h2>Recent changes (with provenance)</h2>
            <ul className="list-plain" data-testid="clinical-recent">
              {summary.recentChanges.map((c, i) => (
                <li key={`${c.statement}-${i}`}>
                  <strong>{c.statement}</strong>
                  <div className="muted">
                    {c.truth}
                    {c.eventAt ? ` · event ${c.eventAt}` : ""}
                    {c.reportAt ? ` · reported ${c.reportAt}` : ""}
                    {c.source ? ` · ${c.source}` : ""}
                    {c.confidence ? ` · ${c.confidence}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="surface-known">
            <h2>Medications</h2>
            <ul className="list-plain">
              {summary.medicationPlan.map((m) => (
                <li key={m.name}>
                  Plan: {m.name} {m.dose} — {m.schedule}
                </li>
              ))}
              {summary.medicationAdministrations.map((m, i) => (
                <li key={`${m.name}-a-${i}`}>
                  Admin: {m.name} {m.dose} · {m.at} · {m.status}
                </li>
              ))}
            </ul>
          </section>
          <section className="surface-known">
            <h2>Unresolved / uncertain</h2>
            <ul className="list-plain">
              {summary.uncertainOrMissed.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
            {summary.openConflicts > 0 && (
              <p className="attention-limit">
                {summary.openConflicts} open conflict(s) need human resolution.
              </p>
            )}
          </section>
          <section className="surface-known">
            <h2>Care-team questions</h2>
            <ul className="list-plain">
              {summary.careTeamQuestions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
