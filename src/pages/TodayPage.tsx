import { useEffect, useMemo, useState } from "react";
import { today } from "../scenario/olivia";
import {
  fetchTodayProjection,
  getSessionIdentity,
  fetchServerNotifications,
  notificationAction,
  fetchRecipientProfile,
  fetchCareCoverage,
  type TodayAttentionItem,
  type RecipientProfilePayload,
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
  const [inbox, setInbox] = useState<Array<Record<string, unknown>>>([]);
  const [profile, setProfile] = useState<RecipientProfilePayload | null>(null);
  const [coverageSummary, setCoverageSummary] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchTodayProjection().then((p) => {
      if (!cancelled) setProj(p);
    });
    void fetchRecipientProfile().then((p) => {
      if (!cancelled) setProfile(p);
    });
    void fetchCareCoverage().then((c) => {
      if (!cancelled) setCoverageSummary(c.summary);
    });
    const loadInbox = () => {
      void fetchServerNotifications().then((r) => {
        if (!cancelled && r.ok) {
          setInbox(
            r.notifications.filter(
              (n) =>
                !n.resolved_at &&
                String(n.care_recipient_id ?? "") === space.careRecipientId,
            ),
          );
        }
      });
    };
    loadInbox();
    window.addEventListener("cr-notification", loadInbox);
    // Lightweight poll as SSE backup (4s) for multi-tab coherence
    const iv = window.setInterval(loadInbox, 4000);
    return () => {
      cancelled = true;
      window.removeEventListener("cr-notification", loadInbox);
      window.clearInterval(iv);
    };
  }, [refreshKey, session.carePersonId, space.careRecipientId]);

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

  // Never fall back to Evelyn static seed when another recipient is active
  const whatChanged = proj?.whatChanged?.length
    ? proj.whatChanged
    : space.careRecipientId === "cr-olivia"
      ? today.sinceYesterday
      : [];
  const handled =
    proj && proj.handled.length > 0
      ? proj.handled
      : relayHandled.length > 0
        ? relayHandled
        : space.careRecipientId === "cr-olivia"
          ? today.relayHandled
          : [];
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
        <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>
          Open <strong>Care → About</strong> for age, conditions, and essential
          care context — not only today&apos;s tasks.
        </p>
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

        {/* 60-second orientation — person first, then priorities */}
        <section
          className="section surface-known"
          style={{ marginTop: 16 }}
          data-testid="orientation-card"
          aria-label="Quick orientation"
        >
          <h2 style={{ fontSize: "1.05rem", marginBottom: 8 }}>
            Orient for {recipientName}
          </h2>
          <ul className="list-plain" data-testid="orientation-list">
            <li>
              <strong>You:</strong> {session.displayName} · {session.roleLabel}
            </li>
            {profile?.profile &&
            Array.isArray(
              (profile.profile as { confirmedConditions?: unknown[] })
                .confirmedConditions,
            ) ? (
              <li>
                <strong>Conditions on file:</strong>{" "}
                {(
                  (profile.profile as { confirmedConditions: Array<{ label: string }> })
                    .confirmedConditions ?? []
                )
                  .map((c) => c.label)
                  .join("; ") || "none listed"}
              </li>
            ) : (
              <li>
                <strong>Conditions:</strong> open Care → About
              </li>
            )}
            <li>
              <strong>Medications:</strong>{" "}
              {(profile?.medications ?? [])
                .map((m) => `${String(m.name)} ${String(m.dose ?? "")}`)
                .join("; ") || "see Care"}
            </li>
            <li>
              <strong>Next:</strong> {next[0] ?? "Nothing scheduled on Today"}
            </li>
            <li>
              <strong>Attention:</strong>{" "}
              {notifications.length === 0
                ? "Nothing urgent"
                : notifications[0]?.title}
            </li>
          </ul>
          {coverageSummary ? (
            <div
              className="surface-reported"
              style={{ padding: 12, marginTop: 12 }}
              data-testid="coverage-panel"
            >
              <strong>Who is helping</strong>
              <pre
                style={{
                  margin: "8px 0 0",
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                }}
              >
                {coverageSummary}
              </pre>
              {/maya|next/i.test(coverageSummary) && (
                <p className="muted" style={{ marginBottom: 0, fontSize: "0.85rem" }}>
                  When the next helper is due, open handoff so they orient without
                  re-explaining.
                </p>
              )}
            </div>
          ) : null}
        </section>

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
            className="primary-btn btn-with-icon"
            data-testid="try-care-update-top"
            data-action-kind="primary"
            onClick={onOpenRelay}
          >
            <span className="btn-glyph" aria-hidden>
              ✦
            </span>
            Ask or update Relay
          </button>
          <button
            type="button"
            className="secondary-btn btn-with-icon"
            data-testid="review-handoff"
            data-action-kind="secondary"
            onClick={onOpenHandoff}
          >
            <span className="btn-glyph" aria-hidden>
              ☰
            </span>
            Review care handoff
          </button>
        </div>
      </section>

      {inbox.filter((n) => !n.seen_at).length > 0 && (
        <section
          className="section surface-verify"
          aria-labelledby="messages-inbox"
          data-testid="coordination-inbox"
        >
          <h2 id="messages-inbox">Notifications</h2>
          {inbox
            .filter((n) => !n.seen_at)
            .slice(0, 8)
            .map((n) => {
              const urgent =
                n.priority === "urgent" || n.priority === "important";
              return (
                <article
                  key={String(n.id)}
                  className={`attention-card cr-notify-attention${urgent ? " cr-notify-pulse" : ""}`}
                  data-testid="server-notification"
                  data-type={String(n.type ?? "")}
                >
                  <div className="cr-notify-meta">
                    <span className="badge badge-coral">
                      {String(n.type ?? "update").replace(/_/g, " ")}
                    </span>
                  </div>
                  <h3 className="item-title">{String(n.title)}</h3>
                  <p className="attention-body">{String(n.body)}</p>
                  <div className="btn-row">
                    <button
                      type="button"
                      className="btn-success btn-with-icon"
                      data-testid="notification-seen"
                      data-action-kind="success"
                      onClick={() => {
                        void notificationAction(String(n.id), "seen").then(
                          () => {
                            void fetchServerNotifications().then((r) => {
                              if (r.ok) {
                                setInbox(
                                  r.notifications.filter(
                                    (x) =>
                                      !x.resolved_at &&
                                      String(x.care_recipient_id ?? "") ===
                                        space.careRecipientId,
                                  ),
                                );
                              }
                            });
                          },
                        );
                      }}
                    >
                      <span className="btn-glyph" aria-hidden>
                        ✓
                      </span>
                      Mark seen
                    </button>
                  </div>
                </article>
              );
            })}
        </section>
      )}

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
                    className="btn-verify btn-with-icon"
                    data-testid="attention-review"
                    data-action-kind="verify"
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
                    <span className="btn-glyph" aria-hidden>
                      ◎
                    </span>
                    {n.actionLabel}
                  </button>
                  <button
                    type="button"
                    className="btn-success btn-with-icon"
                    data-testid="attention-ack"
                    data-action-kind="success"
                    onClick={() =>
                      setAcked((prev) => new Set(prev).add(n.id))
                    }
                  >
                    <span className="btn-glyph" aria-hidden>
                      ✓
                    </span>
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
              className="primary-btn btn-with-icon"
              data-testid="try-care-update"
              data-action-kind="primary"
              onClick={onOpenRelay}
            >
              <span className="btn-glyph" aria-hidden>
                ✦
              </span>
              Ask or update Relay
            </button>
            <button
              type="button"
              className="secondary-btn btn-with-icon"
              data-action-kind="secondary"
              onClick={onOpenHandoff}
            >
              <span className="btn-glyph" aria-hidden>
                ⇄
              </span>
              Care handoff
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
