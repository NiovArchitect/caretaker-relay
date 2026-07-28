/**
 * Relay text composer.
 * Microphone control intentionally not shown (expanded Relay layout contract).
 */
export function Composer({
  value,
  onChange,
  onSubmit,
  placeholder,
  onVoiceMeta,
  busy = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  /** When true, Send is disabled so in-flight answers are not silently dropped. */
  busy?: boolean;
  onVoiceMeta?: (meta: {
    source: "voice_stt" | "text";
    confidence?: number;
    language?: string;
    stt_provider?: string;
    needsReview?: boolean;
  }) => void;
}) {
  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <textarea
        data-testid="composer-input"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onVoiceMeta?.({ source: "text" });
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        rows={2}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
      <button
        type="submit"
        className="primary-btn btn-with-icon"
        data-testid="composer-send"
        data-action-kind="primary"
        disabled={!value.trim() || busy}
        aria-busy={busy || undefined}
      >
        <span className="btn-glyph" aria-hidden>
          {busy ? "…" : "↑"}
        </span>
        {busy ? "Working…" : "Send"}
      </button>
    </form>
  );
}
