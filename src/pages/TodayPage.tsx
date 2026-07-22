import { useEffect, useState } from "react";
import { today } from "../scenario/olivia";
import { fetchTodayProjection } from "../foundation/careClient";

export function TodayPage({
  relayHandled,
  onOpenHandoff,
  onLoadDemo,
  refreshKey,
}: {
  relayHandled: string[];
  onOpenHandoff: () => void;
  onLoadDemo: () => void;
  /** Bump after confirm to re-fetch durable Today. */
  refreshKey?: number;
}) {
  const [proj, setProj] = useState<{
    needsYou: string[];
    whatChanged: string[];
    handled: string[];
    next: string[];
    source: string;
    storeBackend?: string;
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

  const needsYou =
    proj && proj.needsYou.length > 0
      ? proj.needsYou
      : today.needsYou.map((t) =>
          t.dueLabel ? `${t.dueLabel} — ${t.title}` : t.title,
        );
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

  return (
    <>
      <div className="greeting">
        <h1>
          {today.greeting}, {today.caregiverName}
        </h1>
        <p className="for-person" data-testid="care-recipient-label">
          For {today.careRecipient.displayName}
        </p>
        {proj && (
          <p
            className="muted"
            style={{ fontSize: "0.75rem", marginTop: 4 }}
            data-testid="today-source"
            data-source={proj.source}
            data-store={proj.storeBackend ?? ""}
          >
            Today data: {proj.source}
            {proj.storeBackend ? ` · ${proj.storeBackend}` : ""}
            {proj.source === "static" ? " (seed until first durable update)" : ""}
          </p>
        )}
      </div>

      <section className="section" aria-labelledby="needs-you">
        <h2 id="needs-you">Needs you</h2>
        {needsYou.length === 0 ? (
          <p className="muted">Nothing urgent right now.</p>
        ) : (
          needsYou.map((line) => (
            <div key={line} className="item-row">
              <span className="item-time" aria-hidden>
                ·
              </span>
              <div className="item-title">{line}</div>
            </div>
          ))
        )}
      </section>

      <section className="section" aria-labelledby="since">
        <h2 id="since">What changed</h2>
        <ul className="list-plain">
          {whatChanged.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="handled">
        <h2 id="handled">Already handled</h2>
        <ul className="list-plain">
          {handled.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="next">
        <h2 id="next">What happens next</h2>
        <ul className="list-plain">
          {next.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="btn-row">
          <button type="button" className="secondary-btn" onClick={onOpenHandoff}>
            Review handoff
          </button>
          <button type="button" className="secondary-btn" onClick={onLoadDemo}>
            Try care update
          </button>
        </div>
      </section>
    </>
  );
}
