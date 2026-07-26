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
  filterPrimaryNotifications,
  kindIcon,
  kindLabel,
  severityClass,
} from "../lib/notifications";
import { resolveCareSpace, loadActiveCareRecipientId } from "../lib/careContext";
import { formatCareDateTimeRecent } from "../lib/humanCopy";
import { OnboardingWizard } from "../components/OnboardingWizard";
import {
  loadOnboardingDraft,
  saveOnboardingDraft,
} from "../lib/onboarding";

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
  const [showAllNotifs, setShowAllNotifs] = useState(false);
  const [profile, setProfile] = useState<RecipientProfilePayload | null>(null);
  const [coverageSummary, setCoverageSummary] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Established users with authorized recipients never see first-time role onboarding.
    // Lightweight second spaces get progressive empty-state paths instead.
    const d = loadOnboardingDraft();
    if (d.completed || d.awaitingAuthorization) return false;
    // Only first-time incomplete drafts for authorized lab users with empty progressive setup
    return (
      !d.completed &&
      space.depth === "lightweight" &&
      (d.intent === "add_recipient" || d.intent === "set_up_care")
    );
  });
  const [shellReady, setShellReady] = useState(false);

  // Shell-first: paint Today chrome immediately; hydrate secondary data next.
  useEffect(() => {
    setShellReady(true);
    let cancelled = false;
    // Critical: orientation projection first
    void fetchTodayProjection().then((p) => {
      if (!cancelled) setProj(p);
    });
    // Secondary: profile, coverage, notifications — progressive
    window.setTimeout(() => {
      if (cancelled) return;
      void fetchRecipientProfile().then((p) => {
        if (!cancelled) setProfile(p);
      });
      void fetchCareCoverage().then((c) => {
        if (!cancelled) setCoverageSummary(c.summary);
      });
      void fetchServerNotifications().then((r) => {
        if (!cancelled && r.ok) {
          setInbox(
            r.notifications.filter(
              (n) =>
                !n.resolved_at &&
                !n.seen_at &&
                String(n.care_recipient_id ?? "") === space.careRecipientId,
            ),
          );
        }
      });
    }, 0);
    const loadInbox = () => {
      void fetchServerNotifications().then((r) => {
        if (!cancelled && r.ok) {
          setInbox(
            r.notifications.filter(
              (n) =>
                !n.resolved_at &&
                !n.seen_at &&
                String(n.care_recipient_id ?? "") === space.careRecipientId,
            ),
          );
        }
      });
    };
    window.addEventListener("cr-notification", loadInbox);
    const iv = window.setInterval(loadInbox, 15000);
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

  const inboxFiltered = useMemo(() => {
    const cap = showAllNotifs ? 40 : 8;
    return filterPrimaryNotifications(inbox, cap);
  }, [inbox, showAllNotifs]);

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

  const isLightweight = space.depth === "lightweight";

  return (
    <>
      <span className="sr-only" data-testid="today-shell-ready">
        {shellReady ? "ready" : "loading"}
      </span>
      {showOnboarding && (
        <OnboardingWizard
          initialPath={loadOnboardingDraft().path}
          onDismiss={() => {
            const d = loadOnboardingDraft();
            d.completed = true;
            saveOnboardingDraft(d);
            setShowOnboarding(false);
          }}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
      {isLightweight && !showOnboarding && (
        <section
          className="section surface-known empty-care-space"
          data-testid="lightweight-empty-state"
          aria-label="Getting started with this care space"
        >
          <h2>Getting started with {recipientName}</h2>
          <p className="muted section-lead">
            You are connected to {recipientName}, but this care record is still
            light. That is intentional — not a copy of another person&apos;s
            file. Coordinate now; enrich facts as you learn them.
          </p>
          <ul className="list-plain">
            <li>
              <strong>People</strong> — authorized helpers and messaging
            </li>
            <li>
              <strong>Care</strong> — About, preferences, emergency snapshot
            </li>
            <li>
              <strong>Relay</strong> — ask, record an update, verify
            </li>
          </ul>
          <div className="btn-row">
            <button
              type="button"
              className="primary-btn"
              data-testid="empty-start-onboarding"
              onClick={() => setShowOnboarding(true)}
            >
              Set up care
            </button>
            <button
              type="button"
              className="secondary-btn"
              data-testid="empty-open-relay"
              onClick={onOpenRelay}
            >
              Add a care update
            </button>
            <button
              type="button"
              className="secondary-btn"
              data-testid="empty-open-handoff"
              onClick={onOpenHandoff}
            >
              Review handoff
            </button>
          </div>
        </section>
      )}

      <section className="today-hero" aria-label="Care context for today">
        <div className="today-hero-kicker">Today</div>
        <h1 data-testid="today-greeting" className="today-hero-recipient">
          <span data-testid="care-recipient-label">{recipientName}</span>
        </h1>
        <p className="muted today-hero-lead">
          {isLightweight
            ? `${recipientName}'s circle is available — enrich Care when you are ready.`
            : "Scan what needs you, what changed, and who is helping."}
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

        {/* AHA 1 — five-second orientation (no hunting) */}
        <div
          className="today-scan-grid"
          data-testid="today-command-strip"
          aria-label="Five-second care scan"
        >
          <div className="today-scan-cell">
            <div className="label">Who</div>
            <div className="value">{recipientName}</div>
          </div>
          <div className="today-scan-cell today-scan-attention">
            <div className="label">Needs you</div>
            <div className="value">
              {notifications.length === 0
                ? "Nothing urgent"
                : notifications[0]?.title ??
                  `${notifications.length} item${notifications.length === 1 ? "" : "s"}`}
            </div>
          </div>
          <div className="today-scan-cell">
            <div className="label">Changed</div>
            <div className="value">
              {whatChanged[0] ??
                (organizedCount
                  ? `${organizedCount} updates on file`
                  : "No new events listed")}
            </div>
          </div>
          <div className="today-scan-cell">
            <div className="label">Already handled</div>
            <div className="value">
              {handled[0] ?? "Nothing marked handled yet"}
            </div>
          </div>
          <div className="today-scan-cell">
            <div className="label">Coming up</div>
            <div className="value">{next[0] ?? "See Care schedule"}</div>
          </div>
          <div className="today-scan-cell">
            <div className="label">Who is helping</div>
            <div className="value">
              {coverageSummary ||
                "Open People for the authorized care circle"}
            </div>
          </div>
        </div>

        {/* Ambient AI — what the system notices without being asked */}
        <section
          className="ambient-watch-strip"
          data-testid="ambient-watch-strip"
          aria-label="What Relay watches for you"
        >
          <h2 className="ambient-watch-title">What Relay watches for you</h2>
          <p className="muted ambient-watch-lead">
            Relay surfaces open medication checks, new care-circle messages,
            recent reports, and upcoming appointments for{" "}
            <strong>{recipientName}</strong> — without you having to ask. It
            never invents a dose or closes a conflict for you.
          </p>
          <ul className="ambient-watch-list" data-testid="ambient-watch-list">
            <li>
              <strong>Why a notification appears:</strong> something is unread,
              unresolved, or needs human judgment for this care recipient only.
            </li>
            <li>
              <strong>What you still decide:</strong> confirmations, corrections,
              and when an item is truly resolved.
            </li>
            <li>
              <strong>Emergency info:</strong> open Care → Essential / emergency
              for contacts and allergies — Relay does not call emergency
              services for you.
            </li>
          </ul>
        </section>

        {/* 60-second orientation — person first, then priorities */}
        <section
          className="section surface-known orientation-card"
          data-testid="orientation-card"
          aria-label="Quick orientation"
        >
          <h2 className="orientation-title">Orient for {recipientName}</h2>
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
                  (profile.profile as {
                    confirmedConditions: Array<{ label: string }>;
                  }).confirmedConditions ?? []
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
              <strong>Medications (plan):</strong>{" "}
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
          <button
            type="button"
            className="btn-verify btn-with-icon"
            data-testid="open-emergency-snapshot"
            data-action-kind="verify"
            onClick={() => {
              window.location.hash = "#care";
              // Navigate via custom event so App can switch tab without product rewrite
              window.dispatchEvent(
                new CustomEvent("cr-navigate", { detail: { tab: "care", focus: "emergency" } }),
              );
            }}
          >
            <span className="btn-glyph" aria-hidden>
              ⚠
            </span>
            Essential / emergency info
          </button>
        </div>
      </section>

      {/* AHA 6 — physician signal, not noise */}
      {/physician|provider|doctor|clinician/i.test(session.roleLabel) && (
        <section
          className="section surface-known physician-signal"
          data-testid="physician-signal-card"
          aria-label="Clinic signal summary"
        >
          <h2>Clinic signal — {recipientName}</h2>
          <p className="muted section-lead">
            Concise picture for clinical review. Caregiver reports stay labeled
            as reported until confirmed. Relay does not order medications.
          </p>
          <div className="pair-grid">
            <div>
              <h3 className="care-panel-title">Open verification</h3>
              <ul className="list-plain">
                {(proj?.needsYou?.length ? proj.needsYou : ["None flagged"])
                  .slice(0, 4)
                  .map((line) => (
                    <li key={line}>{line}</li>
                  ))}
              </ul>
            </div>
            <div>
              <h3 className="care-panel-title">Recent changes (timed)</h3>
              <ul className="list-plain">
                {(whatChanged.length ? whatChanged : ["None listed"])
                  .slice(0, 5)
                  .map((line) => (
                    <li key={line}>{line}</li>
                  ))}
              </ul>
            </div>
          </div>
          <p className="muted meta-time">
            Administration history and caregiver observations are not the same
            as the authorized medication plan. Open Care for full provenance.
          </p>
        </section>
      )}

      {inbox.length > 0 && (
        <section
          className="section surface-verify"
          aria-labelledby="messages-inbox"
          data-testid="coordination-inbox"
        >
          <h2 id="messages-inbox" data-testid="today-notifications">
            Notifications
          </h2>
          <p className="muted section-lead">
            Unread for {recipientName} only. Lab/test markers are hidden from
            this primary list. Seen/resolved items leave the list and no longer
            inflate the top badge.
            {inboxFiltered.noiseDropped > 0
              ? ` (${inboxFiltered.noiseDropped} lab marker${inboxFiltered.noiseDropped === 1 ? "" : "s"} hidden.)`
              : ""}
          </p>
          <div className="btn-row section-actions">
            <button
              type="button"
              className="secondary-btn"
              data-testid="notifications-mark-all-seen"
              onClick={() => {
                void import("../foundation/careClient").then(
                  ({ notificationBulk, fetchServerNotifications: fetchN }) =>
                    notificationBulk("mark_all_seen").then(() =>
                      fetchN().then((r) => {
                        if (r.ok) {
                          setInbox(
                            r.notifications.filter(
                              (x) =>
                                !x.resolved_at &&
                                !x.seen_at &&
                                String(x.care_recipient_id ?? "") ===
                                  space.careRecipientId,
                            ),
                          );
                        }
                      }),
                    ),
                );
              }}
            >
              Mark all read
            </button>
          </div>
          <div className="notify-scroll" data-testid="notifications-scroll">
          {inboxFiltered.visible.map((n) => {
              const urgent =
                n.priority === "urgent" || n.priority === "important";
              const when = n.created_at
                ? formatCareDateTimeRecent(String(n.created_at))
                : "";
              return (
                <article
                  key={String(n.id)}
                  className={`attention-card attention-card-compact cr-notify-attention${urgent ? " cr-notify-pulse" : ""}`}
                  data-testid="server-notification"
                  data-type={String(n.type ?? "")}
                  data-recipient={String(n.care_recipient_id ?? "")}
                >
                  <div className="cr-notify-meta">
                    <span className="badge badge-coral">
                      {String(n.type ?? "update").replace(/_/g, " ")}
                    </span>
                    <span className="muted meta-time">
                      {recipientName}
                      {when ? ` · ${when}` : ""}
                    </span>
                  </div>
                  <h3 className="item-title">{String(n.title)}</h3>
                  <p className="attention-body">{String(n.body)}</p>
                  <p className="muted meta-time">
                    Source: {String(n.source_type ?? "care")} ·{" "}
                    {String(n.actor_display_name ?? "System")}
                  </p>
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
                                      !x.seen_at &&
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
                    <button
                      type="button"
                      className="secondary-btn"
                      data-testid="notification-resolve"
                      onClick={() => {
                        void notificationAction(String(n.id), "resolve").then(
                          () => {
                            void fetchServerNotifications().then((r) => {
                              if (r.ok) {
                                setInbox(
                                  r.notifications.filter(
                                    (x) =>
                                      !x.resolved_at &&
                                      !x.seen_at &&
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
                      Resolve
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {(inboxFiltered.hiddenCount > 0 || !showAllNotifs) &&
            inbox.length > inboxFiltered.visible.length && (
              <div className="btn-row section-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  data-testid="notifications-show-more"
                  onClick={() => setShowAllNotifs((v) => !v)}
                >
                  {showAllNotifs
                    ? "Show fewer notifications"
                    : `Show more (${inboxFiltered.hiddenCount} hidden)`}
                </button>
              </div>
            )}
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
