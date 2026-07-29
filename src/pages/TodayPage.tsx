import { useEffect, useMemo, useState, type ReactNode } from "react";
import { today } from "../scenario/olivia";
import {
  fetchTodayProjection,
  fetchRoleProjection,
  getSessionIdentity,
  fetchServerNotifications,
  notificationAction,
  fetchRecipientProfile,
  fetchCareCoverage,
  fetchWorkItems,
  claimCareWorkItem,
  createCareWorkItem,
  transitionCareWorkItem,
  fetchSinceLastVisit,
  fetchNotificationOps,
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
import {
  formatCareDateTimeRecent,
  humanCareLine,
  sourceTypeLabel,
  workStatusLabel,
} from "../lib/humanCopy";
import { OnboardingWizard } from "../components/OnboardingWizard";
import {
  loadOnboardingDraft,
  saveOnboardingDraft,
} from "../lib/onboarding";
import { resolveRoleExperience } from "../lib/roleExperience";
import { hasAuthorizedRecipient } from "../lib/careContext";

/** Collapsed helpers preview — short names only, never the full dump. */
function helpersPreview(coverage: string): string {
  const raw = humanCareLine(coverage);
  if (!raw) return "Open People for the authorized care circle";
  // Prefer "Name now · Name next" when lines look like Helping now / Next
  const nowM = raw.match(
    /(?:helping now|now)[:\s]+([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.']+){0,2})/i,
  );
  const nextM = raw.match(
    /(?:next)[:\s]+([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.']+){0,2})/i,
  );
  if (nowM || nextM) {
    const now = nowM?.[1]?.replace(/\s+·.*$/, "").trim();
    const next = nextM?.[1]?.replace(/\s+·.*$/, "").trim();
    if (now && next) return `${now} now · ${next} next`;
    if (now) return `${now} now`;
    if (next) return `${next} next`;
  }
  // First non-empty line, truncated
  const first = raw.split(/\n/).map((l) => l.trim()).find(Boolean) ?? raw;
  return first.length > 72 ? `${first.slice(0, 69)}…` : first;
}

/** Expanded helpers detail — structured once (not repeating collapsed line). */
function helpersExpanded(coverage: string): ReactNode {
  const raw = humanCareLine(coverage);
  if (!raw) {
    return (
      <p className="muted">
        No coverage summary yet. Open People to see authorized helpers.
      </p>
    );
  }
  const lines = raw.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const nowLine = lines.find((l) => /helping now|^now\b/i.test(l));
  const nextLine = lines.find((l) => /^next\b|next:/i.test(l));
  const rest = lines.filter((l) => l !== nowLine && l !== nextLine);
  return (
    <div className="helpers-detail">
      {nowLine ? (
        <div className="helpers-block" data-testid="helpers-now">
          <strong>Helping now</strong>
          <p style={{ margin: "4px 0 0" }}>
            {nowLine.replace(/^helping now[:\s]*/i, "").replace(/^now[:\s]*/i, "")}
          </p>
        </div>
      ) : null}
      {nextLine ? (
        <div className="helpers-block" style={{ marginTop: 10 }} data-testid="helpers-next">
          <strong>Next</strong>
          <p style={{ margin: "4px 0 0" }}>
            {nextLine.replace(/^next[:\s]*/i, "")}
          </p>
        </div>
      ) : null}
      {rest.length > 0 ? (
        <ul className="list-plain" style={{ marginTop: 10 }}>
          {rest.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      ) : null}
      {!nowLine && !nextLine && rest.length === 0 ? (
        <p style={{ margin: 0 }}>{raw}</p>
      ) : null}
    </div>
  );
}

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
  const authorized = hasAuthorizedRecipient(session.carePersonId);
  const roleXp = resolveRoleExperience({
    carePersonId: session.carePersonId,
    authorized,
    membershipRoleLabel: session.roleLabel,
  });
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
  const [serverProjection, setServerProjection] = useState<{
    orientation?: string;
    priorities?: string[];
    today?: {
      whatChanged?: string[];
      unresolved?: string[];
      upcoming?: string[];
      whoHelping?: string[];
      overdue?: string[];
    };
    shift?: { briefing?: string[]; roleLabel?: string };
    clinical?: { trends?: string[]; openQuestions?: string[] };
  } | null>(null);
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
  const [workItems, setWorkItems] = useState<Array<Record<string, unknown>>>([]);
  const [needsOwner, setNeedsOwner] = useState<Array<Record<string, unknown>>>([]);
  const [sinceVisit, setSinceVisit] = useState<{
    plainSummary: string;
    whatChanged: Array<{ text: string; evidence: string; at?: string }>;
    needsOwner: Array<{ id: string; action: string; priority: string }>;
    handoffSummary: string | null;
    upcoming: Array<{ title: string; when: string; calendarTruth: string }>;
    conflicts: number;
  } | null>(null);
  const [notifOps, setNotifOps] = useState<
    Array<{
      id: string;
      title: string;
      plainStatus: string;
      noResponse: boolean;
    }>
  >([]);
  const [syncLabel, setSyncLabel] = useState("Saved");
  const [workBusy, setWorkBusy] = useState<string | null>(null);
  const [workError, setWorkError] = useState<string | null>(null);
  const [newWorkAction, setNewWorkAction] = useState("");
  const [confirmRecipient, setConfirmRecipient] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("needs");

  const reloadWork = () => {
    void fetchWorkItems().then((r) => {
      if (r.ok) {
        setWorkItems(r.workItems);
        setNeedsOwner(r.needsOwner);
      }
    });
    void fetchSinceLastVisit().then((r) => {
      if (r.ok && r.briefing) {
        setSinceVisit({
          plainSummary: r.briefing.plainSummary,
          whatChanged: r.briefing.whatChanged,
          needsOwner: r.briefing.needsOwner,
          handoffSummary: r.briefing.handoffSummary,
          upcoming: r.briefing.upcoming,
          conflicts: r.briefing.conflicts,
        });
      }
    });
    void fetchNotificationOps().then((r) => {
      if (r.ok) setNotifOps(r.notifications.slice(0, 8));
    });
  };

  // Shell-first: paint Today chrome immediately; hydrate critical + secondary in parallel.
  useEffect(() => {
    setShellReady(true);
    let cancelled = false;
    setSyncLabel(
      typeof navigator !== "undefined" && navigator.onLine
        ? "Saved"
        : "Pending sync — do not assume saved",
    );
    const onOnline = () => setSyncLabel("Saved");
    const onOffline = () =>
      setSyncLabel("Pending sync — do not assume saved");
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    // Critical: Today projection (does not block shell paint)
    void fetchTodayProjection().then((p) => {
      if (!cancelled) setProj(p);
    });
    // Parallel secondary domains — independent after recipient scope is known
    void Promise.all([
      fetchRoleProjection().then((r) => {
        if (!cancelled && r.ok && r.projection) setServerProjection(r.projection);
      }),
      fetchRecipientProfile().then((p) => {
        if (!cancelled) setProfile(p);
      }),
      fetchCareCoverage().then((c) => {
        if (!cancelled) setCoverageSummary(c.summary);
      }),
      fetchServerNotifications().then((r) => {
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
      }),
      fetchWorkItems().then((r) => {
        if (!cancelled && r.ok) {
          setWorkItems(r.workItems);
          setNeedsOwner(r.needsOwner);
        }
      }),
      fetchSinceLastVisit().then((r) => {
        if (!cancelled && r.ok && r.briefing) {
          setSinceVisit({
            plainSummary: r.briefing.plainSummary,
            whatChanged: r.briefing.whatChanged,
            needsOwner: r.briefing.needsOwner,
            handoffSummary: r.briefing.handoffSummary,
            upcoming: r.briefing.upcoming,
            conflicts: r.briefing.conflicts,
          });
        }
      }),
      fetchNotificationOps().then((r) => {
        if (!cancelled && r.ok) setNotifOps(r.notifications.slice(0, 8));
      }),
    ]);
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
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
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
              Complete care setup
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
        <div className="today-hero-kicker" data-testid="today-role-kicker">
          {roleXp.todayTitle}
        </div>
        <h1 data-testid="today-greeting" className="today-hero-recipient">
          <span data-testid="care-recipient-label">{recipientName}</span>
        </h1>
        <p
          className="muted today-hero-lead"
          data-testid="today-role-orientation"
          data-page-purpose="today"
        >
          {isLightweight
            ? `${recipientName}'s circle is available — enrich Care when you are ready.`
            : (serverProjection?.orientation ?? roleXp.orientation) ||
              "What matters now for this person — not the full history."}
        </p>
        <div className="today-hero-caregiver">
          <span>
            You are{" "}
            <strong data-testid="today-caregiver-name">
              {session.displayName}
            </strong>
          </span>
          <span className="badge badge-teal" data-testid="today-role-badge">
            {roleXp.badge}
          </span>
        </div>
        {/* Role priority labels used to dump the same four category titles as a
            static list above the expandable sections — removed so mobile has
            one representation only (today-command-strip accordions). */}
        {serverProjection?.shift?.briefing && serverProjection.shift.briefing.length > 0 && (
          <div className="section surface-known" data-testid="today-shift-briefing">
            <h2>Shift briefing</h2>
            <ul className="list-plain">
              {serverProjection.shift.briefing.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        )}
        {serverProjection?.clinical?.trends && serverProjection.clinical.trends.length > 0 && (
          <div className="section surface-known" data-testid="today-clinical-trends">
            <h2>Clinical trends (evidence-linked)</h2>
            <ul className="list-plain">
              {serverProjection.clinical.trends.map((b) => (
                <li key={b}>{humanCareLine(b)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* AHA 1 — accessible click/tap accordions (not hover-only) */}
        <div
          className="today-accordion-list"
          data-testid="today-command-strip"
          aria-label="Care quick view"
        >
          <p className="muted" style={{ marginBottom: 8 }}>
            <strong>{recipientName}&apos;s care</strong> · tap a section to expand
          </p>
          {(
            [
              {
                id: "needs",
                title: "What needs you today",
                count: notifications.length,
                summary: humanCareLine(
                  notifications.length === 0
                    ? "Nothing urgent"
                    : notifications[0]?.title ??
                      `${notifications.length} item(s)`,
                ),
                body: (
                  <ul className="list-plain">
                    {notifications.length === 0 ? (
                      <li className="muted">No urgent items right now.</li>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <li key={n.id}>
                          <strong>{humanCareLine(n.title)}</strong>
                          {n.description ? (
                            <span className="muted">
                              {" "}
                              — {humanCareLine(n.description)}
                            </span>
                          ) : null}
                        </li>
                      ))
                    )}
                  </ul>
                ),
              },
              {
                id: "appointments",
                title: "Appointments & transport",
                count: next.length,
                summary: humanCareLine(
                  next[0] ?? "Nothing scheduled on Today",
                ),
                body: (
                  <ul className="list-plain">
                    {next.length === 0 ? (
                      <li className="muted">
                        No upcoming items listed. Open Care for the full schedule.
                      </li>
                    ) : (
                      next.map((line) => (
                        <li key={line}>{humanCareLine(line)}</li>
                      ))
                    )}
                    {sinceVisit?.upcoming?.slice(0, 3).map((u) => (
                      <li key={`${u.title}-${u.when}`}>
                        {humanCareLine(u.title)} ·{" "}
                        {formatCareDateTimeRecent(u.when) || humanCareLine(u.when)}
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                id: "wellbeing",
                title: "Meals, mobility, mood",
                count: whatChanged.length,
                summary: humanCareLine(
                  whatChanged[0] ??
                    (organizedCount
                      ? `${organizedCount} updates on file`
                      : "No new wellbeing notes"),
                ),
                body: (
                  <ul className="list-plain">
                    {whatChanged.length === 0 ? (
                      <li className="muted">
                        No new meal, mobility, or mood notes on Today.
                      </li>
                    ) : (
                      whatChanged.slice(0, 5).map((line) => (
                        <li key={line}>{humanCareLine(line)}</li>
                      ))
                    )}
                    {handled.length > 0 && (
                      <li className="muted">
                        Already handled: {humanCareLine(handled[0])}
                      </li>
                    )}
                  </ul>
                ),
              },
              {
                id: "helpers",
                title: "Who is helping next",
                count: coverageSummary ? 1 : 0,
                // Collapsed: short preview only — not the full “Helping now” sentence.
                summary: helpersPreview(coverageSummary),
                body: (
                  <div data-testid="helpers-expanded-detail">
                    {helpersExpanded(coverageSummary)}
                  </div>
                ),
              },
            ] as const
          ).map((panel) => {
            const expanded = openAccordion === panel.id;
            return (
              <div
                key={panel.id}
                className={`today-accordion ${expanded ? "is-open" : ""}`}
                data-testid={`today-accordion-${panel.id}`}
              >
                <button
                  type="button"
                  className="today-accordion-trigger"
                  aria-expanded={expanded}
                  aria-controls={`today-panel-${panel.id}`}
                  id={`today-trigger-${panel.id}`}
                  data-testid={`today-accordion-trigger-${panel.id}`}
                  onClick={() =>
                    setOpenAccordion(expanded ? null : panel.id)
                  }
                >
                  <span className="today-accordion-title">
                    {panel.title}
                    <span className="muted"> · {panel.count}</span>
                  </span>
                  <span className="today-accordion-summary muted">
                    {panel.summary}
                  </span>
                  <span className="today-accordion-chevron" aria-hidden>
                    {expanded ? "▾" : "▸"}
                  </span>
                </button>
                {expanded && (
                  <div
                    className="today-accordion-panel"
                    id={`today-panel-${panel.id}`}
                    role="region"
                    aria-labelledby={`today-trigger-${panel.id}`}
                  >
                    {panel.body}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p
          className="muted"
          data-testid="sync-state-label"
          style={{ fontSize: "0.85rem", marginTop: 8 }}
        >
          Sync: {syncLabel}
        </p>

        {/* Since last visit — catch-up without re-explaining */}
        {sinceVisit && (
          <section
            className="section surface-known"
            data-testid="since-last-visit"
            aria-label="Since your last visit"
          >
            <h2>Since you were last here</h2>
            <p className="muted" data-testid="since-last-visit-summary">
              {humanCareLine(sinceVisit.plainSummary)}
            </p>
            {sinceVisit.whatChanged.length > 0 && (
              <ul className="list-plain" data-testid="since-last-visit-changes">
                {sinceVisit.whatChanged.slice(0, 6).map((c, i) => (
                  <li key={`${c.text}-${i}`}>
                    <span className="badge badge-teal" data-testid="evidence-label">
                      {humanCareLine(c.evidence)}
                    </span>{" "}
                    {humanCareLine(c.text)}
                  </li>
                ))}
              </ul>
            )}
            {sinceVisit.handoffSummary && (
              <p className="muted" data-testid="since-last-visit-handoff">
                {humanCareLine(sinceVisit.handoffSummary)}
              </p>
            )}
            {sinceVisit.upcoming.length > 0 && (
              <ul className="list-plain" data-testid="calendar-truth-list">
                {sinceVisit.upcoming.slice(0, 4).map((u) => (
                  <li key={`${u.title}-${u.when}`}>
                    {humanCareLine(u.title)} ·{" "}
                    {formatCareDateTimeRecent(u.when) || humanCareLine(u.when)}{" "}
                    <span className="muted">
                      ({humanCareLine(u.calendarTruth)})
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {sinceVisit.conflicts > 0 && (
              <p data-testid="since-last-visit-conflicts">
                {sinceVisit.conflicts} open conflict(s) need review
              </p>
            )}
          </section>
        )}

        {/* Work ownership — claim, next action, unassigned */}
        <section
          className="section surface-known"
          data-testid="work-ownership-panel"
          aria-label="Work ownership"
        >
          <h2>Open care work</h2>
          <p className="muted section-lead">
            Each care issue appears once. Take it when you can help—ownership is
            explicit, never silent.
          </p>
          {needsOwner.length === 0 && workItems.length === 0 ? (
            <p className="muted cr-empty" data-testid="work-empty-state">
              No open work items for {recipientName}. Create one when something
              needs a named helper.
            </p>
          ) : (
            <ul className="list-plain" data-testid="work-items-list">
              {[...needsOwner, ...workItems.filter((w) => w.ownerPersonId)]
                .filter(
                  (w, i, arr) =>
                    arr.findIndex((x) => x.id === w.id) === i,
                )
                // Semantic reconcile: one card per care issue family
                .filter((w, _i, arr) => {
                  const action = String(w.action ?? "").toLowerCase();
                  let key = action.replace(/[^a-z0-9]+/g, " ").trim().slice(0, 48);
                  if (/allegra/.test(action)) key = "sem:allegra";
                  else if (/metformin|with.?lunch/.test(action)) key = "sem:metformin";
                  else if (/dose|amount mismatch|incompatible|ambiguous/.test(action))
                    key = "sem:dose_unit";
                  else if (/pharmacy|pickup/.test(action)) key = "sem:pharmacy";
                  const first = arr.find((x) => {
                    const a = String(x.action ?? "").toLowerCase();
                    let k = a.replace(/[^a-z0-9]+/g, " ").trim().slice(0, 48);
                    if (/allegra/.test(a)) k = "sem:allegra";
                    else if (/metformin|with.?lunch/.test(a)) k = "sem:metformin";
                    else if (/dose|amount mismatch|incompatible|ambiguous/.test(a))
                      k = "sem:dose_unit";
                    else if (/pharmacy|pickup/.test(a)) k = "sem:pharmacy";
                    return k === key;
                  });
                  return first === w;
                })
                .slice(0, 6)
                .map((w) => {
                  const id = String(w.id ?? "");
                  const rawAction = String(w.action ?? "Care task");
                  const action = /allegra/i.test(rawAction)
                    ? "Review Allegra medication-plan request"
                    : /metformin|with.?lunch/i.test(rawAction)
                      ? "Confirm Metformin-with-lunch report"
                      : /dose|amount mismatch|incompatible|ambiguous/i.test(rawAction)
                        ? "Review dose unit mismatch"
                        : humanCareLine(rawAction);
                  const status = String(w.status ?? "");
                  const owner =
                    String(w.ownerDisplayName ?? "") ||
                    (w.ownerPersonId ? "A helper is on it" : "Needs a helper");
                  const claimable =
                    !w.ownerPersonId ||
                    status === "available_to_claim" ||
                    status === "unassigned";
                  return (
                    <li
                      key={id}
                      data-testid={`work-item-${id}`}
                      className="work-item-row"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <span>
                        <strong>{action}</strong>{" "}
                        <span className="muted">
                          · {owner} · {workStatusLabel(status)}
                          {w.priority && String(w.priority) === "urgent"
                            ? " · needs attention soon"
                            : ""}
                        </span>
                      </span>
                      {claimable && (
                        <button
                          type="button"
                          className="secondary-btn"
                          data-testid={`claim-work-${id}`}
                          disabled={workBusy === id}
                          onClick={() => {
                            setWorkBusy(id);
                            setWorkError(null);
                            void claimCareWorkItem(id).then((r) => {
                              setWorkBusy(null);
                              if (!r.ok) {
                                setWorkError(r.message ?? "Could not take this work");
                                return;
                              }
                              reloadWork();
                            });
                          }}
                        >
                          I can help
                        </button>
                      )}
                      {status === "claimed" || status === "in_progress" || status === "assigned" ? (
                        <button
                          type="button"
                          className="secondary-btn"
                          data-testid={`complete-work-${id}`}
                          disabled={workBusy === id}
                          onClick={() => {
                            setWorkBusy(id);
                            void transitionCareWorkItem(id, "completed", {
                              completion_evidence: "Marked complete by owner",
                            }).then((r) => {
                              setWorkBusy(null);
                              if (!r.ok) setWorkError(r.message ?? "Update failed");
                              else reloadWork();
                            });
                          }}
                        >
                          Complete
                        </button>
                      ) : null}
                      {(status === "claimed" || status === "assigned") && (
                        <button
                          type="button"
                          className="secondary-btn"
                          data-testid={`escalate-work-${id}`}
                          disabled={workBusy === id}
                          onClick={() => {
                            setWorkBusy(id);
                            void transitionCareWorkItem(id, "escalated", {
                              blocking_reason: "No response / needs backup owner",
                            }).then((r) => {
                              setWorkBusy(null);
                              if (!r.ok) setWorkError(r.message ?? "Escalate failed");
                              else reloadWork();
                            });
                          }}
                        >
                          Escalate
                        </button>
                      )}
                    </li>
                  );
                })}
            </ul>
          )}
          <div
            className="btn-row"
            style={{ marginTop: 12, flexWrap: "wrap", gap: 8 }}
            data-testid="create-work-form"
          >
            <input
              type="text"
              data-testid="new-work-action"
              placeholder={`Next action for ${recipientName}`}
              value={newWorkAction}
              onChange={(e) => setNewWorkAction(e.target.value)}
              aria-label="New work action"
              style={{ flex: "1 1 200px", minWidth: 160 }}
            />
            <label
              style={{ display: "flex", alignItems: "center", gap: 6 }}
              data-testid="confirm-recipient-label"
            >
              <input
                type="checkbox"
                data-testid="confirm-recipient-checkbox"
                checked={confirmRecipient}
                onChange={(e) => setConfirmRecipient(e.target.checked)}
              />
              Confirm: {recipientName}
            </label>
            <button
              type="button"
              className="primary-btn"
              data-testid="create-work-submit"
              disabled={!newWorkAction.trim() || workBusy === "create"}
              onClick={() => {
                if (!confirmRecipient) {
                  setWorkError(
                    "Confirm the care recipient before creating work (shared-device / multi-recipient safety).",
                  );
                  return;
                }
                setWorkBusy("create");
                setWorkError(null);
                void createCareWorkItem({
                  action: newWorkAction.trim(),
                  reason: "Created from Today ownership panel",
                  priority: "normal",
                  confirm_recipient_id: space.careRecipientId,
                }).then((r) => {
                  setWorkBusy(null);
                  if (!r.ok) {
                    setWorkError(r.message ?? r.code ?? "Create failed");
                    return;
                  }
                  setNewWorkAction("");
                  setConfirmRecipient(false);
                  reloadWork();
                });
              }}
            >
              Create unassigned work
            </button>
          </div>
          {workError && (
            <p className="error" data-testid="work-error" role="alert">
              {workError}
            </p>
          )}
        </section>

        {notifOps.length > 0 && (
          <section
            className="section surface-reported"
            data-testid="notification-ops-panel"
            aria-label="Notification delivery status"
          >
            <h2>Notification status</h2>
            <p className="muted section-lead">
              In-app inbox delivery is recorded. External SMS/email is not claimed
              unless configured.
            </p>
            <ul className="list-plain" data-testid="notification-ops-list">
              {notifOps.slice(0, 5).map((n) => (
                <li key={n.id}>
                  <strong>{humanCareLine(n.title)}</strong>{" "}
                  <span className="muted">
                    {humanCareLine(n.plainStatus)}
                  </span>
                  {n.noResponse ? (
                    <span className="badge" data-testid="notif-no-response">
                      {" "}
                      awaiting response
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )}

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
            {/* Next / Attention / Who is helping live only in expandable sections above —
                orientation keeps stable identity context, not a second category dump. */}
          </ul>
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
                    <li key={line}>{humanCareLine(line)}</li>
                  ))}
              </ul>
            </div>
            <div>
              <h3 className="care-panel-title">Recent changes (timed)</h3>
              <ul className="list-plain">
                {(whatChanged.length ? whatChanged : ["None listed"])
                  .slice(0, 5)
                  .map((line) => (
                    <li key={line}>{humanCareLine(line)}</li>
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
                  <h3 className="item-title">
                    {humanCareLine(n.title)}
                  </h3>
                  <p className="attention-body">
                    {humanCareLine(n.body)}
                  </p>
                  <p className="muted meta-time">
                    From {sourceTypeLabel(n.source_type)} ·{" "}
                    {String(n.actor_display_name ?? "Care team")}
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

      {/* Desktop-only secondary dumps — mobile primary path is the accordion strip. */}
      <section
        className="section surface-reported cr-desktop-only"
        aria-labelledby="coming-up"
      >
        <h2 id="coming-up">Coming up</h2>
        <ul className="list-plain" data-testid="next-list">
          {next.length === 0 ? (
            <li className="muted">
              Open Care for medications and appointments, or ask Relay.
            </li>
          ) : (
            next.slice(0, 5).map((line) => (
              <li key={line}>{humanCareLine(line)}</li>
            ))
          )}
        </ul>
      </section>

      <section
        className="section surface-reported cr-desktop-only"
        aria-labelledby="since"
      >
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
            whatChanged.slice(0, 6).map((line) => (
              <div key={line} className="timeline-item">
                {humanCareLine(line)}
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
              handled.slice(0, 5).map((line) => (
                <li key={line}>{humanCareLine(line)}</li>
              ))
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
