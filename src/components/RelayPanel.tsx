import { useState } from "react";
import type { RelayMessage, VerificationBundle } from "../domain/types";
import { Composer } from "./Composer";
import { VerifyPanel } from "./VerifyPanel";
import type { TranscriptMeta } from "../foundation/careClient";
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
  onUseSample,
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
  onUseSample: () => void;
  onCloseMobile?: () => void;
}) {
  const [mode, setMode] = useState<RelayMode>("relay");

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
            {mode === "relay" ? "Relay" : "Messages"}
          </div>
          <div className="relay-panel-sub">
            {mode === "relay"
              ? correcting
                ? "Correction mode — prior evidence stays on record"
                : "AI · organizes updates · holds uncertainty · asks you to verify"
              : "People · human-to-human only (not AI)"}
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

      <div className="relay-mode-tabs" role="tablist" aria-label="Relay or human messages">
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
          Messages (people)
        </button>
      </div>

      {mode === "relay" ? (
        <>
          <div className="relay-thread" data-testid="relay-thread" aria-live="polite">
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
            <div className="relay-hints">
              <button
                type="button"
                className="chip-btn"
                onClick={onUseSample}
                data-testid="fill-judge-update"
              >
                Sample care update
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => onDraftChange("What still needs attention?")}
              >
                What still needs me?
              </button>
            </div>
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
            Human messages are separate from Relay (AI).
            {"\n"}
            You ↔ another authorized person about {careRecipient.displayName}.
          </div>
          <div className="member-card" style={{ cursor: "default" }}>
            <strong>{people.maya.displayName}</strong>
            <span className="muted">Family / friend caregiver</span>
            <span className="muted">
              Continuity / handoff available — not an AI chat
            </span>
          </div>
          <div className="member-card" style={{ cursor: "default" }}>
            <strong>{people.daniel.displayName}</strong>
            <span className="muted">Professional caregiver</span>
            <span className="muted">
              Recipient-specific updates — not agency workforce chat
            </span>
          </div>
          <p className="muted" style={{ fontSize: "0.8rem", padding: "0 4px" }}>
            Full threaded messaging ships when invitation + identity lifecycle
            is live. Handoffs already prepare lay→lay continuity.
          </p>
        </div>
      )}
    </aside>
  );
}
