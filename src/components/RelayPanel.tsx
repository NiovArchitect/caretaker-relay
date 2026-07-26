import { useEffect, useRef, useState } from "react";
import type { RelayMessage, VerificationBundle } from "../domain/types";
import { Composer } from "./Composer";
import { VerifyPanel } from "./VerifyPanel";
import type { TranscriptMeta } from "../foundation/careClient";
import {
  fetchCoordination,
  postCoordination,
} from "../foundation/careClient";
import { people } from "../scenario/olivia";
import { resolvePersonName } from "../lib/identity";
import { loadActiveCareRecipientId, resolveCareSpace } from "../lib/careContext";

type RelayMode = "relay" | "messages";

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
  const [coordTo, setCoordTo] = useState(coordFocusPersonId ?? people.maya.id);
  const [coordLoading, setCoordLoading] = useState(false);
  const [coordHasNewWhileUp, setCoordHasNewWhileUp] = useState(false);
  const coordThreadRef = useRef<HTMLDivElement | null>(null);
  const coordLenRef = useRef(0);
  /** Ref so poll/new-msg path never sees stale pinned state. */
  const coordPinnedBottomRef = useRef(true);

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
      setCoordTo(coordFocusPersonId);
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
    setCoordTo(coordFocusPersonId ?? people.maya.id);
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
          <div className="relay-panel-sub">
            {mode === "relay"
              ? correcting
                ? "Correction mode. Prior evidence stays on record."
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
            aria-live="polite"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "bubble bubble-user"
                    : m.role === "system"
                      ? "bubble bubble-system"
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
                onChange={(e) => setCoordTo(e.target.value)}
                className="coord-to-select"
                data-testid="coord-to"
              >
                <option value={people.maya.id}>Maya Bennett</option>
                <option value={people.daniel.id}>Daniel Kim</option>
                <option value={people.marcus.id}>Marcus Carter</option>
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
