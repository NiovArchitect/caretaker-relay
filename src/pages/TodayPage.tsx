import { useEffect, useState } from "react";
import { today } from "../scenario/olivia";
import {
  fetchTodayProjection,
  type TodayAttentionItem,
} from "../foundation/careClient";

export function TodayPage({
  relayHandled,
  onOpenHandoff,
  onLoadDemo,
  refreshKey,
  onReviewAttention,
}: {
  relayHandled: string[];
  onOpenHandoff: () => void;
  onLoadDemo: () => void;
  /** Bump after confirm to re-fetch durable Today. */
  refreshKey?: number;
  onReviewAttention?: (item: TodayAttentionItem) => void;
}) {
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
        ? proj.needsYou.map((line, i) => ({
            id: `need-${i}`,
            title: line,
            whatHappened: line,
            whySurfaced: "This still needs your judgment or action.",
            relayKnows: "Listed on Olivia's day.",
            relayDoesNotKnow: "Whether it is fully resolved.",
            nextStep: "Review and update when ready.",
            kind: "task" as const,
          }))
        : today.needsYou.map((t) => ({
            id: t.id,
            title: t.dueLabel ? `${t.dueLabel} — ${t.title}` : t.title,
            whatHappened: t.title,
            whySurfaced: "Still open on Olivia's day.",
            relayKnows: t.dueLabel ? `Due ${t.dueLabel}` : "On today's list",
            relayDoesNotKnow: "Whether it is already handled off-app.",
            nextStep: "Review when you can.",
            kind: "task" as const,
          }));

  const whatChanged =
    proj && proj.whatChanged.length > 0
      ? proj.whatChanged
      : today.sinceYesterday;
  const handled =
    proj && proj.handled.length > 0
      ? proj.handled
      : relayHandled.length > 0
        ? relayHandled
        : today.relayHandled;
  const next =
    proj && proj.next.length > 0
      ? proj.next
      : ["Confirm transportation", "Evening medication at 7 PM"];
  const organizedCount = proj?.organizedCount ?? whatChanged.length;

  return (
    <>
      <div className="greeting">
        <h1 data-testid="today-greeting">
          {today.greeting}, {today.caregiverName}
        </h1>
        <p className="for-person" data-testid="care-recipient-label">
          Here&apos;s {today.careRecipient.displayName}&apos;s day.
        </p>
        {/* Hidden bootstrap marker for E2E — not shown to caregivers/judges */}
        {proj && (
          <span
            data-testid="today-source"
            data-source={proj.source}
            data-store={proj.storeBackend ?? ""}
            className="sr-only"
            aria-hidden
          >
            {proj.source}
          </span>
        )}
      </div>

      <section
        className="section attention-section"
        aria-labelledby="needs-you"
        data-testid="needs-attention-section"
      >
        <h2 id="needs-you">Needs your attention</h2>
        {attention.length === 0 ? (
          <p className="muted">Nothing urgent right now.</p>
        ) : (
          attention.map((item) => (
            <article
              key={item.id}
              className={`attention-card${item.kind === "medication" ? " attention-card-med" : ""}`}
              data-testid="attention-card"
              data-kind={item.kind}
            >
              <h3 className="item-title">{item.title}</h3>
              <p className="attention-body">{item.whatHappened}</p>
              {item.whySurfaced && (
                <p className="muted attention-why">{item.whySurfaced}</p>
              )}
              {item.relayDoesNotKnow && (
                <p className="attention-limit" role="status">
                  <strong>Relay did not choose or invent a dose.</strong>{" "}
                  {item.relayDoesNotKnow}
                </p>
              )}
              <div className="btn-row">
                <button
                  type="button"
                  className="secondary-btn"
                  data-testid="attention-review"
                  onClick={() => onReviewAttention?.(item)}
                >
                  Review
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="section" aria-labelledby="since">
        <h2 id="since">What changed</h2>
        {organizedCount > 0 && (
          <p className="muted" data-testid="organized-count">
            {organizedCount} update{organizedCount === 1 ? "" : "s"} organized
            for {today.careRecipient.displayName}
          </p>
        )}
        <ul className="list-plain" data-testid="what-changed-list">
          {whatChanged.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="handled">
        <h2 id="handled">Already handled</h2>
        <ul className="list-plain" data-testid="already-handled-list">
          {handled.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="next">
        <h2 id="next">What happens next</h2>
        <ul className="list-plain" data-testid="next-list">
          {next.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="btn-row">
          <button
            type="button"
            className="secondary-btn"
            data-testid="review-handoff"
            onClick={onOpenHandoff}
          >
            Review handoff for Maya
          </button>
          <button
            type="button"
            className="primary-btn"
            data-testid="try-care-update"
            onClick={onLoadDemo}
          >
            Tell Relay what happened
          </button>
        </div>
      </section>
    </>
  );
}
