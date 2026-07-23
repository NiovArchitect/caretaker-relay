import { useState } from "react";
import type { RelayMessage, VerificationBundle } from "../domain/types";
import { Composer } from "./Composer";
import { VerifyPanel } from "./VerifyPanel";
import type { TranscriptMeta } from "../foundation/careClient";
import { careRecipient } from "../scenario/olivia";

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
              : "People messaging — only when real threads exist"}
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
        aria-label="Relay or human messages"
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
          Messages
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
              Type what happened in your own words. No prewritten care workflow
              buttons.
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
          <div className="bubble bubble-system" data-testid="messages-not-available">
            Human messaging is <strong>not available</strong> in this build.
            {"\n\n"}
            There is no message thread model (sender, recipient, care recipient,
            body, status) wired end-to-end yet.
            {"\n\n"}
            For continuity today, use a <strong>real handoff</strong> derived
            from confirmed care truth for {careRecipient.displayName}.
            {"\n\n"}
            We will not show fake chats or fake delivery states.
          </div>
        </div>
      )}
    </aside>
  );
}
