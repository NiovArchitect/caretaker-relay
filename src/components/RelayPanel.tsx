import type { RelayMessage, VerificationBundle } from "../domain/types";
import { Composer } from "./Composer";
import { VerifyPanel } from "./VerifyPanel";
import type { TranscriptMeta } from "../foundation/careClient";

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
            Relay
          </div>
          <div className="relay-panel-sub">
            {correcting
              ? "Correction mode — prior evidence stays on record"
              : "Understands updates · holds uncertainty · asks you to verify"}
          </div>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            className="secondary-btn"
            style={{ minHeight: 36, minWidth: 36, padding: "0 10px" }}
            onClick={onCloseMobile}
            aria-label="Close Relay panel"
          >
            ✕
          </button>
        )}
      </div>

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
          <button type="button" className="chip-btn" onClick={onUseSample} data-testid="fill-judge-update">
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
    </aside>
  );
}
