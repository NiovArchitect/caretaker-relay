import { useEffect, useState } from "react";
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
}) {
  const space = resolveCareSpace(loadActiveCareRecipientId());
  const [mode, setMode] = useState<RelayMode>("relay");
  const [coord, setCoord] = useState<
    Array<{ id: string; from: string; body: string; at: string }>
  >([]);
  const [coordDraft, setCoordDraft] = useState("");
  const [coordBusy, setCoordBusy] = useState(false);
  const [coordErr, setCoordErr] = useState<string | null>(null);
  const [coordTo, setCoordTo] = useState(coordFocusPersonId ?? people.maya.id);

  useEffect(() => {
    if (coordFocusPersonId) {
      setCoordTo(coordFocusPersonId);
      setMode("messages");
    }
  }, [coordFocusPersonId]);

  useEffect(() => {
    if (mode !== "messages") return;
    void fetchCoordination().then((r) => {
      if (r.ok) {
        setCoord(r.messages.filter((m) => !isTestPollution(m.body)));
      }
    });
  }, [mode]);

  async function sendCoord() {
    const text = coordDraft.trim();
    if (!text || coordBusy) return;
    if (isTestPollution(text)) {
      setCoordErr("Please write a real care note for the circle.");
      return;
    }
    setCoordBusy(true);
    setCoordErr(null);
    const res = await postCoordination(text, coordTo);
    setCoordBusy(false);
    if (!res.ok) {
      setCoordErr(res.message ?? "Could not send");
      return;
    }
    setCoordDraft("");
    const r = await fetchCoordination();
    if (r.ok) {
      setCoord(r.messages.filter((m) => !isTestPollution(m.body)));
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
            className="secondary-btn"
            style={{ minHeight: 36, minWidth: 36, padding: "0 10px" }}
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
            <p
              className="muted"
              style={{ fontSize: "0.75rem", margin: "0 0 8px" }}
            >
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
        <div className="relay-thread" data-testid="human-messages">
          <div className="bubble bubble-system">
            Human coordination for {space.displayName}. Messages are from people
            in the care circle, not AI.
          </div>
          {coord.length === 0 && (
            <p className="muted" style={{ padding: "8px 4px" }}>
              No messages yet. Share a practical update for the next person on
              duty.
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
              >
                <div className="coord-meta">
                  <strong>{fromName}</strong>
                  <span className="muted" style={{ fontSize: "0.75rem" }}>
                    {m.at}
                  </span>
                </div>
                <div>{m.body}</div>
              </div>
            );
          })}
          <div className="relay-composer-wrap">
            <label className="muted" style={{ fontSize: "0.75rem" }}>
              To
              <select
                value={coordTo}
                onChange={(e) => setCoordTo(e.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 4,
                  marginBottom: 8,
                  minHeight: 40,
                }}
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
              value={coordDraft}
              onChange={(e) => setCoordDraft(e.target.value)}
              placeholder={`Write to ${resolvePersonName(coordTo)} about ${space.preferredName}…`}
              rows={3}
              style={{ width: "100%", marginBottom: 8 }}
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
