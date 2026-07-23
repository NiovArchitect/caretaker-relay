import { useState } from "react";
import { careRecipient, people } from "../scenario/olivia";

type DocDraft = {
  id: string;
  title: string;
  audience: string;
  status: "draft" | "needs_check" | "ready";
  body: string;
  safetyNote: string;
};

const SEED_DOCS: DocDraft[] = [
  {
    id: "doc-handoff-maya",
    title: "Continuity note for Maya Bennett",
    audience: "Family / friend caregiver",
    status: "ready",
    body: `Prepared for Maya Bennett\nCaring for: ${careRecipient.displayName}\n\nWhat changed:\n• Fatigue noted after lunch\n• Physical therapy moved to Thursday 2:30 PM\n• Medication report may need checking\n\nStill needs attention:\n• Confirm transportation\n• Evening medication at 7 PM\n\nPrepared by ${people.marcus.displayName} with Relay assistance.`,
    safetyNote:
      "Readable continuity for another caregiver — not a clinical order and not professionally authoritative.",
  },
  {
    id: "doc-provider-update",
    title: "Provider update draft",
    audience: "Health professional (export)",
    status: "needs_check",
    body: `Care recipient: ${careRecipient.displayName}\nReporter: ${people.marcus.displayName} (family caregiver)\n\nSummary of recent home observations (caregiver-reported):\n• Dizziness after rising was mentioned\n• Meal timing around morning hours\n• Medication report is incomplete / needs verification\n\nThis draft organizes lay caregiver notes for professional readability.\nIt is not a diagnosis, not a medication order, and not clinical certification.`,
    safetyNote:
      "AI may make a lay report professionally readable. It must never make it professionally authoritative. Human review required before share.",
  },
];

export function DocumentsPage() {
  const [selected, setSelected] = useState<DocDraft | null>(SEED_DOCS[0]!);

  return (
    <>
      <div className="greeting">
        <h1>Documents</h1>
        <p className="for-person">
          Prepared from {careRecipient.displayName}&apos;s care context
        </p>
        <p className="muted" style={{ marginTop: 8, maxWidth: 560 }}>
          Documentation is caregiver work. Relay can organize clarity — humans
          remain responsible for what is shared.
        </p>
      </div>

      <section className="section surface-verify" aria-label="Document safety">
        <h2>Safety model</h2>
        <ul className="list-plain">
          <li>
            <strong>Readable</strong> — AI may clean up structure for another
            human.
          </li>
          <li>
            <strong>Not authoritative</strong> — AI does not create clinical
            orders, diagnoses, or certified assessments.
          </li>
          <li>
            <strong>Human gate</strong> — consequential shares stay under
            caregiver control.
          </li>
        </ul>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(200px, 280px) 1fr",
          gap: 14,
        }}
        className="docs-grid"
      >
        <section className="section" aria-label="Document list">
          <h2>Prepared drafts</h2>
          {SEED_DOCS.map((d) => (
            <button
              key={d.id}
              type="button"
              className="member-card"
              data-testid={`doc-${d.id}`}
              onClick={() => setSelected(d)}
              style={{
                borderColor:
                  selected?.id === d.id ? "var(--cr-cyan)" : undefined,
              }}
            >
              <strong>{d.title}</strong>
              <span className="muted">{d.audience}</span>
              <span
                className={
                  d.status === "needs_check"
                    ? "badge badge-amber"
                    : "badge badge-teal"
                }
              >
                {d.status === "needs_check"
                  ? "Needs checking"
                  : d.status === "ready"
                    ? "Ready to review"
                    : "Draft"}
              </span>
            </button>
          ))}
        </section>

        {selected && (
          <section
            className={
              selected.status === "needs_check"
                ? "section surface-verify"
                : "section surface-reported"
            }
            aria-label={selected.title}
          >
            <h2
              style={{
                textTransform: "none",
                letterSpacing: "-0.02em",
                fontSize: "1.1rem",
                color: "var(--cr-graphite)",
              }}
            >
              {selected.title}
            </h2>
            <p className="muted">Audience: {selected.audience}</p>
            <p className="attention-limit" role="status">
              {selected.safetyNote}
            </p>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "var(--cr-font)",
                fontSize: "0.9rem",
                background: "var(--cr-clinical)",
                padding: 14,
                borderRadius: 12,
                border: "1px solid var(--cr-border-soft)",
                marginTop: 12,
              }}
            >
              {selected.body}
            </pre>
            <div className="btn-row">
              <button type="button" className="secondary-btn" disabled title="Share requires human confirmation in a later slice">
                Share (human confirms)
              </button>
              <button type="button" className="secondary-btn" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            <p className="muted" style={{ fontSize: "0.8rem", marginTop: 8 }}>
              Share stays gated — no automatic external send in this build.
            </p>
          </section>
        )}
      </div>
    </>
  );
}
