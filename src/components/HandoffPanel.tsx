import type { CareHandoff } from "../domain/types";
import { careRecipient, people } from "../scenario/olivia";

export function HandoffPanel({
  onClose,
  liveHandoff,
  status = "prepared",
  loading = false,
  emptyReason,
}: {
  onClose: () => void;
  liveHandoff?: CareHandoff | null;
  /** Honest delivery state — never claim sent unless system actually sent. */
  status?: "prepared" | "reviewed" | "ready" | "shared";
  loading?: boolean;
  /** When no server handoff exists. */
  emptyReason?: string | null;
}) {
  const h = liveHandoff ?? null;
  const fromName =
    h?.fromPersonId === people.maya.id
      ? people.maya.displayName
      : h?.fromPersonId === people.daniel.id
        ? people.daniel.displayName
        : people.marcus.displayName;
  const toName =
    h?.toPersonId === people.marcus.id
      ? people.marcus.displayName
      : h?.toPersonId === people.daniel.id
        ? people.daniel.displayName
        : people.maya.displayName;
  const sourceLine =
    h && h.sources.length > 0
      ? h.sources
          .map((s) => s.actorName ?? s.label)
          .filter(Boolean)
          .join(" · ")
      : "Derived from confirmed care activity";

  const statusLabel =
    status === "reviewed"
      ? "You reviewed this continuity summary."
      : status === "ready"
        ? "Ready for the next caregiver — still under your control."
        : status === "shared"
          ? "Available to the authorized next caregiver in this care space."
          : "Prepared from current care context — not automatically sent as a message.";

  if (loading) {
    return (
      <section className="section handoff-hero" data-testid="handoff-panel">
        <p className="muted">Loading latest handoff from care API…</p>
        <button type="button" className="secondary-btn" onClick={onClose}>
          Close
        </button>
      </section>
    );
  }

  if (!h) {
    return (
      <section
        className="section handoff-hero"
        aria-label="Care handoff"
        data-testid="handoff-panel"
      >
        <h2
          style={{
            margin: "4px 0 0",
            color: "var(--cr-teal)",
            fontSize: "1.2rem",
            textTransform: "none",
            letterSpacing: "-0.02em",
          }}
        >
          No handoff yet
        </h2>
        <p className="muted" data-testid="handoff-empty">
          {emptyReason ??
            `No persisted handoff for ${careRecipient.displayName}. Confirm a care update (with continuity for the next caregiver) to create one. Static demo handoffs are not used.`}
        </p>
        <button type="button" className="secondary-btn" onClick={onClose}>
          Close
        </button>
      </section>
    );
  }

  return (
    <section
      className="section handoff-hero"
      aria-label="Care handoff"
      data-testid="handoff-panel"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div>
          <p
            className="muted"
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Lay → lay continuity · {careRecipient.displayName}
          </p>
          <h2
            style={{
              margin: "4px 0 0",
              color: "var(--cr-teal)",
              fontSize: "1.2rem",
              textTransform: "none",
              letterSpacing: "-0.02em",
            }}
            data-testid="handoff-title"
          >
            {toName} — here&apos;s what changed
          </h2>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
            From {fromName} · handoff id {h.id}
          </p>
        </div>
        <button type="button" className="secondary-btn" onClick={onClose}>
          Close
        </button>
      </div>

      <p
        className="muted"
        style={{ marginTop: 10, fontSize: "0.85rem" }}
        data-testid="handoff-status"
      >
        {statusLabel}
      </p>

      <h3 className="muted" style={{ marginBottom: 6 }}>
        What changed
      </h3>
      <ul className="list-plain" data-testid="handoff-what-changed">
        {h.whatChanged.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>

      <h3 className="muted" style={{ marginBottom: 6 }}>
        Still needs attention
      </h3>
      <ul className="list-plain">
        {h.stillNeedsAttention.length === 0 ? (
          <li className="muted">Nothing listed</li>
        ) : (
          h.stillNeedsAttention.map((x) => <li key={x}>{x}</li>)
        )}
      </ul>

      <h3 className="muted" style={{ marginBottom: 6 }}>
        Watch
      </h3>
      <ul className="list-plain">
        {h.watch.length === 0 ? (
          <li className="muted">Nothing listed</li>
        ) : (
          h.watch.map((x) => <li key={x}>{x}</li>)
        )}
      </ul>

      <p className="source-line" data-testid="handoff-sources">
        Where this came from: {sourceLine}
      </p>

      <div className="btn-row">
        <button
          type="button"
          className="primary-btn"
          data-testid="handoff-caught-up"
          onClick={onClose}
        >
          Continuity looks right
        </button>
        <button type="button" className="secondary-btn" onClick={onClose}>
          Keep reviewing
        </button>
      </div>
      <p className="muted" style={{ fontSize: "0.78rem", marginTop: 8 }}>
        Family → family handoff is first-class. This panel only shows handoffs
        that were persisted for this care recipient.
      </p>
    </section>
  );
}
