import { useEffect, useMemo, useState } from "react";
import { today } from "../scenario/olivia";
import {
  fetchTodayProjection,
  getSessionIdentity,
  type TodayAttentionItem,
} from "../foundation/careClient";
import {
  buildAttentionNotifications,
  kindIcon,
  kindLabel,
  severityClass,
} from "../lib/notifications";
import { resolveCareSpace, loadActiveCareRecipientId } from "../lib/careContext";

export function TodayPage({
  relayHandled,
  onOpenHandoff,
  onOpenRelay,
  refreshKey,
  onReviewAttention,
}: {
  relayHandled: string[];
  onOpenHandoff: () => void;
  /** Focus Relay composer for ask or tell — never prefill scripted text. */
  onOpenRelay: () => void;
  refreshKey?: number;
  onReviewAttention?: (item: TodayAttentionItem) => void;
}) {
  const session = getSessionIdentity();
  const space = resolveCareSpace(loadActiveCareRecipientId());
  const recipientName = space.displayName;
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
  const [acked, setAcked] = useState<Set<string>>(new Set());

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

  const notifications = useMemo(
    () =>
      buildAttentionNotifications({
        careRecipientId: space.careRecipientId,
        careRecipientName: recipientName,
        attention,
        next,
      }).filter((n) => !acked.has(n.id)),
    [attention, next, space.careRecipientId, recipientName, acked],
  );

  return (
    <>
      <section className="today-hero" aria-label="Care context for today">
        <div className="today-hero-kicker">Today</div>
        <h1 data-testid="today-greeting" className="today-hero-recipient">
          <span data-testid="care-recipient-label">{recipientName}</span>
        </h1>
        <div className="today-hero-caregiver">
          <span>
            You are{" "}
            <strong data-testid="today-caregiver-name">
              {session.displayName}
            </strong>
          </span>
          <span className="badge badge-teal">{session.roleLabel}</span>
        </div>

        <div className="today-command-strip" data-testid="today-command-strip">
          <div className="today-command-cell">
            <div className="label">Who</div>
            <div className="value">{recipientName}</div>
          </div>
          <div className="today-command-cell">
            <div className="label">Attention</div>
            <div className="value">
              {notifications.length === 0
                ? "Nothing urgent"
                : `${notifications.length} item${notifications.length === 1 ? "" : "s"}`}
            </div>
          </div>
          <div className="today-command-cell">
            <div className="label">Coming up</div>
            <div className="value">
              {next[0] ?? "See schedule in Care"}
            </div>
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
            Ask or update Relay
          </button>
          <button
            type="button"
            className="secondary-btn"
            data-testid="review-handoff"
            onClick={onOpenHandoff}
          >
            Review care handoff
          </button>
        </div>
      </section>

      <section
        className="section section-hero surface-verify"
        aria-labelledby="needs-you"
        data-testid="needs-attention-section"
      >
        <h2 id="needs-you">Needs attention</h2>
        {notifications.length === 0 ? (
          <p className="muted">Nothing urgent right now.</p>
        ) : (
          notifications.map((n, idx) => {
            const item = attention.find((a) => a.id === n.id);
            return (
              <article
                key={n.id}
                className={`attention-card ${severityClass(n.severity)}${
                  n.severity === "urgent" && !n.acknowledged
                    ? " cr-notify-pulse"
                    : ""
                }`}
                data-testid="attention-card"
                data-kind={n.kind}
                data-severity={n.severity}
                style={idx === 0 ? { transform: "translateZ(0)" } : undefined}
              >
                <div className="cr-notify-meta">
                  <span className="cr-notify-icon" aria-hidden>
                    {kindIcon(n.kind)}
                  </span>
                  <span className={`badge ${n.severity === "urgent" ? "badge-rose" : "badge-coral"}`}>
                    {kindLabel(n.kind)}
                  </span>
                  <span className="sr-only">
                    {n.severity === "urgent"
                      ? "Urgent care attention"
                      : "Needs attention"}
                  </span>
                </div>
                <h3 className="item-title">{n.title}</h3>
                <p className="attention-body">{n.description}</p>
                {item?.whySurfaced && (
                  <p className="muted attention-why">{item.whySurfaced}</p>
                )}
                {item?.relayDoesNotKnow && (
                  <p className="attention-limit" role="status">
                    {item.kind === "medication" ? (
                      <>
                        <strong>Relay did not choose a dose.</strong>{" "}
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
                    onClick={() => {
                      setAcked((prev) => new Set(prev).add(n.id));
                      if (item) onReviewAttention?.(item);
                      else onReviewAttention?.({
                        id: n.id,
                        title: n.title,
                        whatHappened: n.description,
                        whySurfaced: "",
                        relayKnows: "",
                        relayDoesNotKnow: "",
                        nextStep: n.actionLabel,
                        kind:
                          n.kind === "medication_due" ? "medication" : "general",
                      });
                    }}
                  >
                    {n.actionLabel}
                  </button>
                  <button
                    type="button"
                    className="ghost-btn"
                    data-testid="attention-ack"
                    onClick={() =>
                      setAcked((prev) => new Set(prev).add(n.id))
                    }
                  >
                    Mark seen
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>

      <section className="section surface-reported" aria-labelledby="coming-up">
        <h2 id="coming-up">Coming up</h2>
        <ul className="list-plain" data-testid="next-list">
          {next.length === 0 ? (
            <li className="muted">
              Open Care for medications and appointments, or ask Relay.
            </li>
          ) : (
            next.map((line) => <li key={line}>{line}</li>)
          )}
        </ul>
      </section>

      <section className="section surface-reported" aria-labelledby="since">
        <h2 id="since">What changed</h2>
        {organizedCount > 0 && (
          <p className="muted" data-testid="organized-count">
            {organizedCount} update{organizedCount === 1 ? "" : "s"} in recent
            care activity for {recipientName}
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
          <h2 id="handled">What Relay organized</h2>
          <ul className="list-plain" data-testid="already-handled-list">
            {handled.length === 0 ? (
              <li className="muted">Nothing listed yet</li>
            ) : (
              handled.map((line) => <li key={line}>{line}</li>)
            )}
          </ul>
        </section>

        <section className="section surface-known" aria-labelledby="relay-cta">
          <h2 id="relay-cta">Need help?</h2>
          <p className="muted" style={{ marginBottom: 12 }}>
            Ask about {recipientName}&apos;s care or share what you observed.
          </p>
          <div className="btn-row">
            <button
              type="button"
              className="primary-btn"
              data-testid="try-care-update"
              onClick={onOpenRelay}
            >
              Ask or update Relay
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={onOpenHandoff}
            >
              Care handoff
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
