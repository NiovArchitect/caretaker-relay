import { useCallback, useRef, useState } from "react";

/** Browser Web Speech API shape (Chrome/Safari). */
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>>;
}

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function isConsequentialTranscript(text: string): boolean {
  return /medication|meds|dose|mg|appointment|pt|physical therapy|dr\.|doctor|protocol|maya|tell|let .* know/i.test(
    text,
  );
}

export function Composer({
  value,
  onChange,
  onSubmit,
  placeholder,
  onVoiceMeta,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  onVoiceMeta?: (meta: {
    source: "voice_stt" | "text";
    confidence?: number;
    language?: string;
    stt_provider?: string;
    needsReview?: boolean;
  }) => void;
}) {
  const [listening, setListening] = useState(false);
  const [sttNote, setSttNote] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  const stopVoice = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
  }, []);

  const startVoice = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setSttNote(
        "Speech recognition not available in this browser. Type instead, or use Chrome/Safari.",
      );
      onVoiceMeta?.({ source: "text" });
      return;
    }
    setSttNote(null);
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (ev) => {
      const last = ev.results[ev.results.length - 1];
      const piece = last?.[0];
      if (!piece) return;
      const transcript = piece.transcript;
      const confidence =
        typeof piece.confidence === "number" ? piece.confidence : undefined;
      // Visible + editable: write into the same text field as typing
      onChange(transcript);
      const consequential = isConsequentialTranscript(transcript);
      const low =
        typeof confidence === "number" && confidence < 0.7 && consequential;
      onVoiceMeta?.({
        source: "voice_stt",
        confidence,
        language: "en-US",
        stt_provider: "browser-web-speech-api",
        needsReview: low || consequential,
      });
      if (low) {
        setSttNote(
          `Low speech confidence (${confidence.toFixed(2)}). Review the transcript before sending — especially medication/schedule wording.`,
        );
      } else if (consequential) {
        setSttNote(
          "Consequential care content detected. Please review the transcript, then Send.",
        );
      } else {
        setSttNote("Transcript ready — edit if needed, then Send.");
      }
    };
    rec.onerror = (ev) => {
      setSttNote(`Voice error: ${ev.error}. You can still type.`);
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
      setSttNote("Listening… speak, then pause. Edit the text before Send.");
    } catch {
      setSttNote("Could not start microphone. Check browser permissions.");
      setListening(false);
    }
  }, [onChange, onVoiceMeta]);

  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        stopVoice();
        onSubmit();
      }}
    >
      {sttNote && (
        <p
          className="muted"
          style={{
            margin: "0 0 6px",
            fontSize: "0.8rem",
            width: "100%",
            gridColumn: "1 / -1",
          }}
          role="status"
        >
          {sttNote}
        </p>
      )}
      <textarea
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
            stopVoice();
            onSubmit();
          }
        }}
      />
      <button
        type="button"
        className="icon-btn"
        aria-label={listening ? "Stop listening" : "Start voice input"}
        aria-pressed={listening}
        title={listening ? "Stop" : "Voice"}
        onClick={() => {
          if (listening) stopVoice();
          else startVoice();
        }}
      >
        {listening ? "stop" : "mic"}
      </button>
      <button type="submit" className="primary-btn" disabled={!value.trim()}>
        Send
      </button>
    </form>
  );
}
