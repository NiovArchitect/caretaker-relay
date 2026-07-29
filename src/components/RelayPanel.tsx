import { useEffect, useRef, useState } from "react";
import type { RelayMessage, VerificationBundle } from "../domain/types";
import { Composer } from "./Composer";
import { VerifyPanel } from "./VerifyPanel";
import type { TranscriptMeta } from "../foundation/careClient";
import {
  fetchCoordination,
  getSessionIdentity,
  postCoordination,
} from "../foundation/careClient";
import { people } from "../scenario/olivia";
import { resolvePersonName } from "../lib/identity";
import { loadActiveCareRecipientId, resolveCareSpace } from "../lib/careContext";
import {
  defaultCoordinationTarget,
  isSelfMessageTarget,
} from "../lib/messageTarget";
import type { RoleExperience } from "../lib/roleExperience";

type RelayMode = "relay" | "messages";

/** px — user is still "with" the active exchange if the user bubble is near the top */
const ANCHOR_TOP_SLACK_PX = 96;

const SENDER_ACCENT: Record<string, string> = {
  "Marcus Carter": "coord-accent-marcus",
  "Maya Bennett": "coord-accent-maya",
  "Daniel Kim": "coord-accent-daniel",
  "Dr. Priya Shah": "coord-accent-provider",
};

function isTestPollution(body: string): boolean {
  return /chaos note|smoke test|fixture|debug copy|test note [ab]/i.test(
    body,
  );
}

export function RelayPanel({
  open,
  messages,
  draft,
  onDraftChange,
  onSubmit,
  onVoiceMeta,
  busy,
  correcting,
  bundle,
  confirmed,
  onConfirm,
  onCorrect,
  onCloseMobile,
  coordFocusPersonId,
  coordFocusKey = 0,
  activeRecipientId,
  roleExperience,
}: {
  open: boolean;
  messages: RelayMessage[];
  draft: string;
  onDraftChange: (v: string) => void;
  onSubmit: () => void;
  onVoiceMeta: (m: TranscriptMeta) => void;
  busy: boolean;
  correcting?: boolean;
  bundle: VerificationBundle | null;
  confirmed: boolean;
  onConfirm: () => void;
  onCorrect: () => void;
  onCloseMobile?: () => void;
  /** When messaging from People, target this person. */
  coordFocusPersonId?: string | null;
  /** Increment to re-enter Coordination when the same person is re-selected. */
  coordFocusKey?: number;
  /** Active care recipient — rebinds coordination when switched. */
  activeRecipientId?: string;
  /** Role-aware tone (copy only; server authorizes retrieval). */
  roleExperience?: RoleExperience | null;
}) {
  const rid = activeRecipientId ?? loadActiveCareRecipientId();
  const space = resolveCareSpace(rid);
  const [mode, setMode] = useState<RelayMode>("relay");
  const [coord, setCoord] = useState<
    Array<{ id: string; from: string; body: string; at: string }>
  >([]);
  const [coordDraft, setCoordDraft] = useState("");
  const [coordBusy, setCoordBusy] = useState(false);
  const [coordErr, setCoordErr] = useState<string | null>(null);
  const selfId = getSessionIdentity().carePersonId;
  const [coordTo, setCoordTo] = useState(() => {
    const preferred = coordFocusPersonId ?? people.maya.id;
    return preferred === selfId ? people.daniel.id : preferred;
  });
  const [coordLoading, setCoordLoading] = useState(false);
  const [coordHasNewWhileUp, setCoordHasNewWhileUp] = useState(false);
  const coordThreadRef = useRef<HTMLDivElement | null>(null);
  const coordLenRef = useRef(0);
  /** Ref so poll/new-msg path never sees stale pinned state. */
  const coordPinnedBottomRef = useRef(true);

  // ── AI Relay conversation anchor (not scroll-to-bottom) ──
  const relayThreadRef = useRef<HTMLDivElement | null>(null);
  const lastAnchoredUserIdRef = useRef<string | null>(null);
  /** True while the user has not deliberately scrolled away from the active Q&A. */
  const followActiveExchangeRef = useRef(true);
  /** Ignore scroll events caused by our own anchor positioning. */
  const programmaticScrollRef = useRef(false);
  const [activeUserMessageId, setActiveUserMessageId] = useState<string | null>(
    null,
  );

  function findActiveUserMessage(): RelayMessage | undefined {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === "user") return messages[i];
    }
    return undefined;
  }

  /** Place the submitted user message near the top of the thread viewport. */
  function anchorToUserMessage(userId: string) {
    const thread = relayThreadRef.current;
    if (!thread) return;
    const el = thread.querySelector(
      `[data-message-id="${CSS.escape(userId)}"]`,
    ) as HTMLElement | null;
    if (!el) return;
    // Bubbles are direct children of .relay-thread — offsetTop is authoritative.
    const top = Math.max(0, el.offsetTop - 8);
    programmaticScrollRef.current = true;
    thread.scrollTop = top;
    // Release after layout + any residual scroll events
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        programmaticScrollRef.current = false;
      }, 50);
    });
  }

  function measureUserNearThreadTop(userId: string): boolean {
    const thread = relayThreadRef.current;
    if (!thread) return true;
    const el = thread.querySelector(
      `[data-message-id="${CSS.escape(userId)}"]`,
    ) as HTMLElement | null;
    if (!el) return true;
    const tr = thread.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    // Visible near the top band of the thread
    return er.top >= tr.top - 8 && er.top <= tr.top + ANCHOR_TOP_SLACK_PX;
  }

  function onRelayThreadScroll() {
    if (programmaticScrollRef.current) return;
    const uid = activeUserMessageId ?? lastAnchoredUserIdRef.current;
    if (!uid) return;
    const near = measureUserNearThreadTop(uid);
    followActiveExchangeRef.current = near;
  }

  // New user message → anchor question; keep follow while answer pending/grows
  useEffect(() => {
    const lastUser = findActiveUserMessage();
    if (!lastUser) return;
    if (lastUser.id !== lastAnchoredUserIdRef.current) {
      lastAnchoredUserIdRef.current = lastUser.id;
      setActiveUserMessageId(lastUser.id);
      followActiveExchangeRef.current = true;
      // Double-rAF: wait for pending placeholder to paint under the question
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => anchorToUserMessage(lastUser.id));
      });
      return;
    }
    // Same exchange: answer filled or pending text changed — re-anchor only if following
    if (followActiveExchangeRef.current) {
      window.requestAnimationFrame(() => anchorToUserMessage(lastUser.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberate on message/busy identity
  }, [messages, busy]);

  // Recipient switch clears AI thread pin state
  useEffect(() => {
    lastAnchoredUserIdRef.current = null;
    followActiveExchangeRef.current = true;
    programmaticScrollRef.current = false;
    setActiveUserMessageId(null);
  }, [rid]);

  function scrollCoordToLatest(smooth = true) {
    const el = coordThreadRef.current;
    if (!el) return;
    // Prefer auto for jump-latest reliability (headless + long threads);
    // smooth remains optional for soft follow while already pinned.
    el.scrollTop = el.scrollHeight;
    if (smooth) {
      try {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      } catch {
        /* scrollTop already set */
      }
    }
    coordPinnedBottomRef.current = true;
    setCoordHasNewWhileUp(false);
  }

  /** Stable threshold — not single-pixel sensitive. */
  const NEAR_BOTTOM_PX = 100;

  function measureCoordNearBottom(): boolean {
    const el = coordThreadRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
  }

  /** Sync pin from live DOM so poll/growth never trusts a stale true. */
  function syncCoordPinnedFromDom(): boolean {
    const near = measureCoordNearBottom();
    coordPinnedBottomRef.current = near;
    return near;
  }

  // When a verification bundle arrives, bring it into the visible Relay dock.
  useEffect(() => {
    if (!bundle || confirmed) return;
    window.requestAnimationFrame(() => {
      document
        .querySelector('[data-testid="verify-panel"]')
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }, [bundle, confirmed]);

  useEffect(() => {
    if (coordFocusPersonId) {
      const self = getSessionIdentity().carePersonId;
      const safe =
        coordFocusPersonId === self
          ? defaultCoordinationTarget(self, [
              people.maya.id,
              people.daniel.id,
              people.marcus.id,
            ])
          : coordFocusPersonId;
      if (safe) setCoordTo(safe);
      setMode("messages");
      // Make destination unmistakable: scroll panel + focus composer.
      window.requestAnimationFrame(() => {
        const panel = document.querySelector(
          '[data-testid="relay-panel"]',
        ) as HTMLElement | null;
        panel?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        const input = document.querySelector(
          '[data-testid="coord-input"]',
        ) as HTMLTextAreaElement | null;
        input?.focus();
      });
    }
  }, [coordFocusPersonId, coordFocusKey]);

  // Recipient switch is a transaction boundary: clear immediately, then reload
  useEffect(() => {
    setCoord([]);
    setCoordDraft("");
    setCoordErr(null);
    const self = getSessionIdentity().carePersonId;
    const preferred = coordFocusPersonId ?? people.maya.id;
    const safe =
      preferred === self
        ? defaultCoordinationTarget(self, [
            people.maya.id,
            people.daniel.id,
            people.marcus.id,
          ]) ?? people.daniel.id
        : preferred;
    setCoordTo(safe);
    coordPinnedBottomRef.current = true;
  }, [rid, coordFocusPersonId]);

  useEffect(() => {
    if (mode !== "messages") return;
    let cancelled = false;
    setCoordLoading(true);
    setCoord([]); // never show previous recipient while loading
    coordPinnedBottomRef.current = true;
    setCoordHasNewWhileUp(false);
    coordLenRef.current = 0;
    void fetchCoordination().then((r) => {
      if (cancelled) return;
      setCoordLoading(false);
      if (r.ok) {
        const msgs = r.messages.filter((m) => !isTestPollution(m.body));
        setCoord(msgs);
        coordLenRef.current = msgs.length;
        window.requestAnimationFrame(() => scrollCoordToLatest(false));
      } else {
        setCoord([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mode, rid]);

  // Lightweight poll while Coordination is open so jump-latest can surface
  // when another principal posts while this user is reading history.
  useEffect(() => {
    if (mode !== "messages") return;
    let cancelled = false;
    const tick = () => {
      void fetchCoordination().then((r) => {
        if (cancelled || !r.ok) return;
        const msgs = r.messages.filter((m) => !isTestPollution(m.body));
        // Measure scroll BEFORE setState (old scrollHeight). Growth after paint
        // would make an at-bottom user look "up" and is not used for the decision.
        const el = coordThreadRef.current;
        const nearBottom =
          !el ||
          el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
        setCoord((prev) => {
          if (
            prev.length === msgs.length &&
            prev[prev.length - 1]?.id === msgs[msgs.length - 1]?.id
          ) {
            return prev;
          }
          const growth = prev.length > 0 && msgs.length > prev.length;
          if (growth) {
            coordPinnedBottomRef.current = nearBottom;
            if (nearBottom) {
              queueMicrotask(() => scrollCoordToLatest(false));
            } else {
              queueMicrotask(() => setCoordHasNewWhileUp(true));
            }
          }
          coordLenRef.current = msgs.length;
          return msgs;
        });
      });
    };
    const iv = window.setInterval(tick, 8000);
    const t0 = window.setTimeout(tick, 400);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
      window.clearTimeout(t0);
    };
  }, [mode, rid]);

  async function sendCoord() {
    const text = coordDraft.trim();
    if (!text || coordBusy) return;
    if (isTestPollution(text)) {
      setCoordErr("Please write a real care note for the circle.");
      return;
    }
    setCoordBusy(true);
    setCoordErr(null);
    try {
      const res = await postCoordination(text, coordTo);
      if (!res.ok) {
        setCoordErr(res.message ?? "Could not send");
        return;
      }
      setCoordDraft("");
      const r = await fetchCoordination();
      if (r.ok) {
        setCoord(r.messages.filter((m) => !isTestPollution(m.body)));
        coordPinnedBottomRef.current = true;
        window.requestAnimationFrame(() => scrollCoordToLatest(true));
      }
    } finally {
      setCoordBusy(false);
    }
  }

  const placeholder = busy
    ? "Relay is working…"
    : correcting
      ? "Describe the correction…"
      : `Ask about ${space.preferredName} or share an update…`;

  return (
    <aside
      className={`relay-panel${open ? " is-open" : ""}`}
      data-testid="relay-panel"
      aria-label="Relay intelligence"
    >
      <div className="relay-panel-header">
        <div>
          <div className="relay-panel-title">
            <span className="relay-pulse" aria-hidden />
            {mode === "relay" ? "Relay" : "Coordination"}
          </div>
          <div className="relay-panel-sub" data-testid="relay-role-tone">
            {mode === "relay"
              ? correcting
                ? "Correction mode. Prior evidence stays on record."
                : roleExperience?.relayTone
                  ? roleExperience.relayTone
                  : `Ask or update about ${space.displayName}`
              : `Messages with ${space.displayName}'s care circle`}
          </div>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            className="secondary-btn relay-close-btn"
            onClick={onCloseMobile}
            aria-label="Close panel"
          >
            ✕
          </button>
        )}
      </div>

      <div
        className="relay-mode-tabs"
        role="tablist"
        aria-label="Relay or human coordination"
      >
        <button
          type="button"
          role="tab"
          className={`tab${mode === "relay" ? " is-active" : ""}`}
          aria-selected={mode === "relay"}
          data-testid="relay-mode-ai"
          onClick={() => setMode("relay")}
        >
          Relay
        </button>
        <button
          type="button"
          role="tab"
          className={`tab${mode === "messages" ? " is-active" : ""}`}
          aria-selected={mode === "messages"}
          data-testid="relay-mode-messages"
          onClick={() => setMode("messages")}
        >
          Coordination
        </button>
      </div>

      {mode === "relay" ? (
        <>
          <div
            className="relay-thread"
            data-testid="relay-thread"
            ref={relayThreadRef}
            aria-live="polite"
            onScroll={onRelayThreadScroll}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                data-message-id={m.id}
                data-role={m.role}
                data-pending={m.pending ? "true" : undefined}
                data-testid={
                  m.role === "user"
                    ? "relay-msg-user"
                    : m.pending
                      ? "relay-msg-pending"
                      : m.role === "relay"
                        ? "relay-msg-assistant"
                        : "relay-msg-system"
                }
                className={
                  m.role === "user"
                    ? "bubble bubble-user"
                    : m.role === "system"
                      ? "bubble bubble-system"
                      : m.pending
                        ? "bubble bubble-relay bubble-pending"
                        : "bubble bubble-relay"
                }
              >
                {m.text}
              </div>
            ))}

            {bundle && !confirmed && (
              <VerifyPanel
                bundle={bundle}
                onConfirm={onConfirm}
                onCorrect={onCorrect}
              />
            )}
          </div>

          {/* New response control removed — automatic exchange anchoring + natural scroll. */}

          <div className="relay-composer-wrap" data-testid="composer-dock">
            <p className="muted relay-hint-copy">
              Ask a question or share what you observed. Relay organizes and asks
              you to verify anything consequential.
            </p>
            <Composer
              value={draft}
              onChange={onDraftChange}
              onSubmit={onSubmit}
              onVoiceMeta={onVoiceMeta}
              placeholder={placeholder}
              busy={busy}
            />
          </div>
        </>
      ) : (
        <div
          className="coord-layout"
          data-testid="human-messages"
          data-recipient-id={rid}
        >
          <div
            className="coord-destination-banner"
            data-testid="coord-destination-banner"
            role="status"
          >
            <strong>
              Message{" "}
              {resolvePersonName(coordTo) || "care partner"} about{" "}
              {space.preferredName}
            </strong>
            <span className="muted">
              Stays in {space.displayName}&apos;s circle only — not Relay AI.
            </span>
          </div>
          <div
            className="relay-thread coord-thread"
            ref={coordThreadRef}
            data-testid="coord-thread"
            onScroll={() => {
              const atBottom = syncCoordPinnedFromDom();
              if (atBottom) setCoordHasNewWhileUp(false);
            }}
          >
            <div className="bubble bubble-system" data-testid="coord-context-banner">
              Care-circle messages about <strong>{space.displayName}</strong>.
              Not clinical orders. Not about another person.
            </div>
            {coordLoading && (
              <div className="cr-skeleton-stack coord-loading" aria-busy="true">
                <div className="cr-skeleton cr-skeleton-line" />
                <div className="cr-skeleton cr-skeleton-line cr-skeleton-short" />
                <p className="muted coord-empty-copy">
                  Loading messages for {space.displayName}…
                </p>
              </div>
            )}
            {!coordLoading && coord.length === 0 && (
              <p className="muted cr-empty coord-empty-copy">
                No messages yet for {space.displayName}. Share a practical update
                for the next person helping them.
              </p>
            )}
            {coord.map((m) => {
              const fromName = resolvePersonName(undefined, m.from) || m.from;
              const accent = SENDER_ACCENT[fromName] ?? "coord-accent-default";
              return (
                <div
                  key={m.id}
                  className={`bubble bubble-coord ${accent}`}
                  data-testid="coord-msg"
                  data-recipient-id={rid}
                >
                  <div className="coord-meta">
                    <strong>{fromName}</strong>
                    <span className="muted coord-time">{m.at}</span>
                  </div>
                  <div>{m.body}</div>
                </div>
              );
            })}
          </div>
          {coordHasNewWhileUp && (
            <button
              type="button"
              className="primary-btn coord-jump-latest-btn"
              data-testid="coord-jump-latest"
              onClick={() => scrollCoordToLatest(true)}
            >
              New messages ↓
            </button>
          )}
          <div
            className="relay-composer-wrap coord-composer-sticky"
            data-testid="coord-composer-sticky"
          >
            <label className="muted coord-to-label">
              To (in {space.preferredName}&apos;s circle)
              <select
                value={coordTo}
                onChange={(e) => {
                  const next = e.target.value;
                  if (isSelfMessageTarget(next, getSessionIdentity().carePersonId)) {
                    setCoordErr("Pick someone else — you can’t message yourself here.");
                    return;
                  }
                  setCoordErr(null);
                  setCoordTo(next);
                }}
                className="coord-to-select"
                data-testid="coord-to"
              >
                {[
                  { id: people.maya.id, name: "Maya Bennett" },
                  { id: people.daniel.id, name: "Daniel Kim" },
                  { id: people.marcus.id, name: "Marcus Carter" },
                ]
                  .filter((o) => o.id !== getSessionIdentity().carePersonId)
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
              </select>
            </label>
            {coordErr && (
              <p className="attention-limit" role="alert">
                {coordErr}
              </p>
            )}
            <textarea
              data-testid="coord-input"
              className="coord-input"
              value={coordDraft}
              onChange={(e) => setCoordDraft(e.target.value)}
              placeholder={`Write to ${resolvePersonName(coordTo)} about ${space.preferredName}…`}
              rows={3}
            />
            <button
              type="button"
              className="btn-comm btn-with-icon"
              data-testid="coord-send"
              data-action-kind="communication"
              disabled={coordBusy || !coordDraft.trim()}
              onClick={() => void sendCoord()}
            >
              <span className="btn-glyph" aria-hidden>
                ✉
              </span>
              {coordBusy ? "Sending…" : "Send message"}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
