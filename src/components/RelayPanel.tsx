import { useEffect, useState } from "react";
import type { RelayMessage, VerificationBundle } from "../domain/types";
import { Composer } from "./Composer";
import { VerifyPanel } from "./VerifyPanel";
import type { TranscriptMeta } from "../foundation/careClient";
import {
  fetchCoordination,
  postCoordination,
} from "../foundation/careClient";
import { careRecipient, people } from "../scenario/olivia";

type RelayMode = "relay" | "messages";

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
}) {
  const [mode, setMode] = useState<RelayMode>("relay");
  const [coord, setCoord] = useState<
    Array<{ id: string; from: string; body: string; at: string }>
  >([]);
  const [coordDraft, setCoordDraft] = useState("");
  const [coordBusy, setCoordBusy] = useState(false);
  const [coordErr, setCoordErr] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "messages") return;
    void fetchCoordination().then((r) => {
      if (r.ok) setCoord(r.messages);
    });
  }, [mode]);

  async function sendCoord() {
    const text = coordDraft.trim();
    if (!text || coordBusy) return;
    setCoordBusy(true);
    setCoordErr(null);
    const res = await postCoordination(text, people.maya.id);
    setCoordBusy(false);
    if (!res.ok) {
      setCoordErr(res.message ?? "Failed to post");
      return;
    }
    setCoordDraft("");
    const r = await fetchCoordination();
    if (r.ok) setCoord(r.messages);
  }

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
                ? "Correction mode — prior evidence stays on record"
                : "AI · organizes updates · holds uncertainty · asks you to verify"
              : "Human coordination · principal-attributed · care-scoped"}
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
          Relay (AI)
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
            <p className="muted" style={{ fontSize: "0.75rem", margin: "0 0 8px" }}>
              Type what happened in your own words.
            </p>
            <Composer
              value={draft}
              onChange={onDraftChange}
              onSubmit={onSubmit}
              onVoiceMeta={onVoiceMeta}
              placeholder={
                busy
                  ? "Relay is organizing what you said…"
                  : correcting
                    ? "Type the correction…"
                    : "Tell Relay what happened…"
              }
            />
          </div>
        </>
      ) : (
        <div className="relay-thread" data-testid="human-messages">
          <div className="bubble bubble-system">
            Human coordination for {careRecipient.displayName}. Not AI. Messages
            are attributed to the signed-in principal and persisted server-side.
          </div>
          {coord.map((m) => (
            <div key={m.id} className="bubble bubble-user" data-testid="coord-msg">
              <strong>{m.from}</strong>
              {"\n"}
              {m.body}
              {"\n"}
              <span className="muted" style={{ fontSize: "0.75rem" }}>
                {m.at}
              </span>
            </div>
          ))}
          {coordErr && (
            <p className="attention-limit" role="alert">
              {coordErr}
            </p>
          )}
          <div className="relay-composer-wrap">
            <textarea
              data-testid="coord-input"
              value={coordDraft}
              onChange={(e) => setCoordDraft(e.target.value)}
              rows={3}
              placeholder="Write a coordination note for the care circle…"
              style={{ width: "100%", fontFamily: "var(--cr-font)" }}
            />
            <button
              type="button"
              className="primary-btn"
              data-testid="coord-send"
              disabled={coordBusy || !coordDraft.trim()}
              onClick={() => void sendCoord()}
            >
              {coordBusy ? "Posting…" : "Post coordination"}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
