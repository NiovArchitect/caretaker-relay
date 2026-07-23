import { useEffect, useState } from "react";
import { today } from "../scenario/olivia";
import {
  fetchTodayProjection,
  getSessionIdentity,
  type TodayAttentionItem,
} from "../foundation/careClient";

export function TodayPage({
  relayHandled,
  onOpenHandoff,
  onOpenRelay,
  refreshKey,
  onReviewAttention,
}: {
  relayHandled: string[];
  onOpenHandoff: () => void;
  /** Open Relay for natural language — empty composer, not a scripted prompt. */
  onOpenRelay: () => void;
  refreshKey?: number;
  onReviewAttention?: (item: TodayAttentionItem) => void;
}) {
  const session = getSessionIdentity();
  const [proj, setProj] = useState<{
    needsYou: string[];
    attention: TodayAttentionItem[];
    whatChanged: string[];
    handled: string[];
    next: string[];
    source: string;
    storeBackend?: string;
    organizedCount?: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchTodayProjection().then((p) => {
      if (!cancelled) setProj(p);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const attention: TodayAttentionItem[] =
    proj && proj.attention.length > 0
      ? proj.attention
      : proj && proj.needsYou.length > 0
        ? proj.needsYou.slice(0, 5).map((line, i) => ({
            id: `need-${i}`,
            title: line,
            whatHappened: line,
            whySurfaced: "This still needs your judgment or action.",
            relayKnows: "Listed on the current care day.",
            relayDoesNotKnow: "Whether it is fully resolved.",
            nextStep: "Review",
            kind: /medication|dose|pill/i.test(line)
              ? ("medication" as const)
              : ("task" as const),
          }))
        : [];

  const whatChanged = proj?.whatChanged?.length
    ? proj.whatChanged
    : today.sinceYesterday;
  const handled =
    proj && proj.handled.length > 0
      ? proj.handled
      : relayHandled.length > 0
        ? relayHandled
        : today.relayHandled;
  const next = proj && proj.next.length > 0 ? proj.next : [];
  const organizedCount = proj?.organizedCount ?? whatChanged.length;

  return (
    <>
      {/* MedixWeb-style dominant hero: one context, not 12 equal cards */}
      <section className="today-hero" aria-label="Care context for today">
        <div className="today-hero-kicker">Today · care without re-explaining</div>
        <h1 data-testid="today-greeting" className="today-hero-recipient">
          Caring for{" "}
          <span data-testid="care-recipient-label">
            {today.careRecipient.displayName}
          </span>
        </h1>
        <div className="today-hero-caregiver">
          <span>
            Current caregiver{" "}
            <strong data-testid="today-caregiver-name">{session.displayName}</strong>
          </span>
          <span className="badge badge-teal">{session.roleLabel}</span>
        </div>
        <div className="today-hero-glass-row">
          <div className="today-hero-glass">
            <div className="label">What this is</div>
            <div className="value">Home &amp; community care picture</div>
          </div>
          <div className="today-hero-glass">
            <div className="label">Relay role</div>
            <div className="value">Organizes · holds uncertainty · asks you</div>
          </div>
        </div>
        {proj && (
          <span
            data-testid="today-source"
            data-source={proj.source}
            data-store={proj.storeBackend ?? ""}
            className="sr-only"
            aria-hidden="true"
          />
        )}
        <div className="btn-row greeting-actions">
          <button
            type="button"
            className="primary-btn"
            data-testid="try-care-update-top"
            onClick={onOpenRelay}
          >
            Tell Relay what happened
          </button>
          <button
            type="button"
            className="secondary-btn"
            data-testid="review-handoff"
            onClick={onOpenHandoff}
          >
            Review latest handoff
          </button>
        </div>
      </section>

      <section
        className="section section-hero surface-verify"
        aria-labelledby="needs-you"
        data-testid="needs-attention-section"
      >
        <h2 id="needs-you">Needs attention</h2>
        {attention.length === 0 ? (
          <p className="muted">Nothing urgent right now.</p>
        ) : (
          attention.map((item, idx) => (
            <article
              key={item.id}
              className={`attention-card${item.kind === "medication" ? " attention-card-med" : ""}`}
              data-testid="attention-card"
              data-kind={item.kind}
              style={idx === 0 ? { transform: "translateZ(0)" } : undefined}
            >
              <div className="badge badge-orange" style={{ marginBottom: 8 }}>
                Needs your judgment
              </div>
              <h3 className="item-title">{item.title}</h3>
              <p className="attention-body">{item.whatHappened}</p>
              {item.whySurfaced && (
                <p className="muted attention-why">{item.whySurfaced}</p>
              )}
              {item.relayDoesNotKnow && (
                <p className="attention-limit" role="status">
                  {item.kind === "medication" ? (
                    <>
                      <strong>Relay did not choose or invent a dose.</strong>{" "}
                      {item.relayDoesNotKnow}
                    </>
                  ) : (
                    item.relayDoesNotKnow
                  )}
                </p>
              )}
              <div className="btn-row">
                <button
                  type="button"
                  className="secondary-btn"
                  data-testid="attention-review"
                  onClick={() => onReviewAttention?.(item)}
                >
                  {item.kind === "medication"
                    ? "Open medication in Care"
                    : "Open in Care"}
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="section surface-reported" aria-labelledby="since">
        <h2 id="since">What changed</h2>
        {organizedCount > 0 && (
          <p className="muted" data-testid="organized-count">
            {organizedCount} update{organizedCount === 1 ? "" : "s"} in recent
            care activity for {today.careRecipient.displayName}
          </p>
        )}
        <div className="timeline" data-testid="what-changed-list">
          {whatChanged.length === 0 ? (
            <p className="muted">No recent changes recorded yet.</p>
          ) : (
            whatChanged.map((line) => (
              <div key={line} className="timeline-item">
                {line}
              </div>
            ))
          )}
        </div>
      </section>

      <div className="pair-grid">
        <section className="section surface-known" aria-labelledby="handled">
          <h2 id="handled">What Relay handled</h2>
          <ul className="list-plain" data-testid="already-handled-list">
            {handled.length === 0 ? (
              <li className="muted">Nothing listed yet</li>
            ) : (
              handled.map((line) => <li key={line}>{line}</li>)
            )}
          </ul>
        </section>

        <section className="section surface-known" aria-labelledby="next">
          <h2 id="next">What happens next</h2>
          <ul className="list-plain" data-testid="next-list">
            {next.length === 0 ? (
              <li className="muted">Nothing listed yet</li>
            ) : (
              next.map((line) => <li key={line}>{line}</li>)
            )}
          </ul>
          <div className="btn-row">
            <button
              type="button"
              className="primary-btn"
              data-testid="try-care-update"
              onClick={onOpenRelay}
            >
              Tell Relay what happened
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
