import { useState } from "react";
import type { CareHandoff } from "../domain/types";
import { resolvePersonName } from "../lib/identity";
import { loadActiveCareRecipientId, resolveCareSpace } from "../lib/careContext";
import { getCareApiBaseUrl } from "../foundation/careHttpClient";

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
  status?: "prepared" | "reviewed" | "ready" | "shared" | "acknowledged" | "sent";
  loading?: boolean;
  /** When no server handoff exists. */
  emptyReason?: string | null;
}) {
  const space = resolveCareSpace(loadActiveCareRecipientId());
  const h = liveHandoff ?? null;
  const [lcStatus, setLcStatus] = useState<string | null>(null);
  const [lcBusy, setLcBusy] = useState(false);
  const [lcError, setLcError] = useState<string | null>(null);

  async function transitionLifecycle(next: string) {
    if (!h) return;
    setLcBusy(true);
    setLcError(null);
    try {
      const raw = sessionStorage.getItem("cr_care_session_v1");
      const token = raw
        ? (JSON.parse(raw) as { token?: string }).token
        : undefined;
      if (!token) {
        setLcError("Not signed in");
        setLcBusy(false);
        return;
      }
      const base = getCareApiBaseUrl();
      const res = await fetch(
        `${base}/api/v1/care/recipients/${encodeURIComponent(h.careRecipientId)}/handoffs/${encodeURIComponent(h.id)}/lifecycle`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: next }),
        },
      );
      const json = (await res.json()) as {
        ok?: boolean;
        lifecycle?: { status?: string };
        message?: string;
      };
      if (!res.ok || !json.ok) {
        setLcError(json.message ?? `HTTP ${res.status}`);
      } else {
        setLcStatus(json.lifecycle?.status ?? next);
      }
    } catch (e) {
      setLcError(e instanceof Error ? e.message : "Network error");
    }
    setLcBusy(false);
  }
  const fromName = resolvePersonName(h?.fromPersonId, "Marcus Carter");
  const toName = resolvePersonName(h?.toPersonId, "Maya Bennett");
  const sourceLine =
    h && h.sources.length > 0
      ? h.sources
          .map((s) => s.actorName ?? s.label)
          .filter(Boolean)
          .join(" · ")
      : "Derived from confirmed care activity";

  const effectiveStatus = lcStatus ?? status;
  const statusLabel =
    effectiveStatus === "acknowledged"
      ? "Acknowledged by the incoming caregiver. Unfinished work remains open until completed."
      : effectiveStatus === "sent" || effectiveStatus === "shared"
        ? "Sent / available to the authorized next caregiver in this care space."
        : effectiveStatus === "reviewed"
          ? "You reviewed this care handoff."
          : effectiveStatus === "ready"
            ? "Ready for the next caregiver. Still under your control."
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

      <div className="btn-row" data-testid="handoff-lifecycle-actions">
        <button
          type="button"
          className="primary-btn"
          data-testid="handoff-mark-sent"
          disabled={lcBusy || effectiveStatus === "sent" || effectiveStatus === "acknowledged"}
          onClick={() => void transitionLifecycle("sent")}
        >
          {effectiveStatus === "sent" || effectiveStatus === "shared"
            ? "Sent to next caregiver"
            : `Send to ${toName}`}
        </button>
        <button
          type="button"
          className="secondary-btn"
          data-testid="handoff-acknowledge"
          disabled={lcBusy || effectiveStatus === "acknowledged"}
          onClick={() => void transitionLifecycle("acknowledged")}
        >
          {effectiveStatus === "acknowledged"
            ? "Acknowledged"
            : "Acknowledge handoff"}
        </button>
        <button
          type="button"
          className="secondary-btn"
          data-testid="handoff-amend"
          disabled={lcBusy}
          onClick={() => void transitionLifecycle("correction_required")}
        >
          Correct after send
        </button>
        <button type="button" className="secondary-btn" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="muted" data-testid="handoff-lifecycle-hint">
        Send makes this handoff available to {toName}. Acknowledgment is separate
        from accepting open tasks. Correct after send records an amendment —
        prior versions stay in history.
      </p>
      {lcError && (
        <p className="error" data-testid="handoff-lifecycle-error" role="alert">
          {lcError}
        </p>
      )}
      {lcStatus && (
        <p className="muted" data-testid="handoff-lifecycle-status">
          Status: {lcStatus}
        </p>
      )}
    </section>
  );
}
