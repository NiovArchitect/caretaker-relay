import type { CareHandoff } from "../domain/types";
import { resolvePersonName } from "../lib/identity";
import { loadActiveCareRecipientId, resolveCareSpace } from "../lib/careContext";

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
  const space = resolveCareSpace(loadActiveCareRecipientId());
  const h = liveHandoff ?? null;
  const fromName = resolvePersonName(h?.fromPersonId, "Marcus Carter");
  const toName = resolvePersonName(h?.toPersonId, "Maya Bennett");
  const sourceLine =
    h && h.sources.length > 0
      ? h.sources
          .map((s) => s.actorName ?? s.label)
          .filter(Boolean)
          .join(" · ")
      : "Derived from confirmed care activity";

  const statusLabel =
    status === "reviewed"
      ? "You reviewed this care handoff."
      : status === "ready"
        ? "Ready for the next caregiver. Still under your control."
        : status === "shared"
          ? "Available to the authorized next caregiver in this care space."
          : "Prepared from current care context. Not automatically sent as a message.";

  if (loading) {
    return (
      <section className="section handoff-hero" data-testid="handoff-panel">
        <div className="cr-skeleton-stack" aria-busy="true" aria-live="polite">
          <div className="cr-skeleton cr-skeleton-title" />
          <div className="cr-skeleton cr-skeleton-line" />
          <div className="cr-skeleton cr-skeleton-line cr-skeleton-short" />
        </div>
        <p className="muted cr-empty">Loading latest care handoff…</p>
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
        <h2 className="handoff-title">No care handoff yet</h2>
        <p className="muted cr-empty" data-testid="handoff-empty">
          {emptyReason ??
            `No handoff is saved for ${space.displayName} yet. Confirm a care update (with continuity for the next caregiver) to create one.`}
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
      <div className="handoff-head">
        <div>
          <p className="handoff-kicker">
            Care handoff · {space.displayName}
          </p>
          <h2 className="handoff-title" data-testid="handoff-title">
            Update for {toName}
          </h2>
          <p className="handoff-sub">
            From {fromName} · what {toName} needs to know
          </p>
        </div>
        <button type="button" className="secondary-btn" onClick={onClose}>
          Close
        </button>
      </div>

      <p className="handoff-status" data-testid="handoff-status">
        {statusLabel}
      </p>

      <h3 className="handoff-section-label">What changed</h3>
      <ul className="list-plain" data-testid="handoff-what-changed">
        {h.whatChanged.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>

      <h3 className="handoff-section-label">Still needs attention</h3>
      <ul className="list-plain">
        {h.stillNeedsAttention.length === 0 ? (
          <li className="muted">Nothing listed</li>
        ) : (
          h.stillNeedsAttention.map((x) => <li key={x}>{x}</li>)
        )}
      </ul>

      <h3 className="handoff-section-label">Watch</h3>
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
        <button type="button" className="secondary-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </section>
  );
}
