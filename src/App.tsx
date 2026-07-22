import { useEffect, useMemo, useState } from "react";
import type { NavTab, RelayMessage, VerificationBundle } from "./domain/types";
import {
  proposeCareUpdate,
  confirmCareUpdateAsync,
  getEvidenceLabel,
  getLatestHandoff,
  DEMO_UTTERANCE,
  careRecipient,
  type TranscriptMeta,
} from "./foundation/careClient";
import { today } from "./scenario/olivia";
import { BottomNav } from "./components/BottomNav";
import { Composer } from "./components/Composer";
import { TodayPage } from "./pages/TodayPage";
import { CarePage } from "./pages/CarePage";
import { CirclePage } from "./pages/CirclePage";
import { RelayPage } from "./pages/RelayPage";
import { VerifyPanel } from "./components/VerifyPanel";
import { HandoffPanel } from "./components/HandoffPanel";

function nowLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

declare global {
  interface Window {
    /** E2E-only: inject post-STT transcript into composer + voice meta (no physical mic). */
    __crE2E?: {
      injectTranscript: (
        text: string,
        meta?: TranscriptMeta,
      ) => void;
      setDraft: (text: string) => void;
      getCareRecipientId: () => string;
    };
  }
}

export function App() {
  const [tab, setTab] = useState<NavTab>("today");
  const [draft, setDraft] = useState("");
  const [bundle, setBundle] = useState<VerificationBundle | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [messages, setMessages] = useState<RelayMessage[]>([
    {
      id: "m0",
      role: "relay",
      at: nowLabel(),
      text: "I'm here. Tell me what happened with Olivia, or ask what still needs to happen.",
    },
  ]);
  const [relayHandled, setRelayHandled] = useState(today.relayHandled);
  const [voiceMeta, setVoiceMeta] = useState<TranscriptMeta | undefined>();
  const [todayRefresh, setTodayRefresh] = useState(0);
  const evidence = getEvidenceLabel();

  useEffect(() => {
    window.__crE2E = {
      injectTranscript: (text, meta) => {
        setDraft(text);
        setVoiceMeta(
          meta ?? {
            source: "voice_stt",
            confidence: 0.92,
            language: "en-US",
            stt_provider: "e2e-injected",
            needsReview: true,
          },
        );
        setTab("relay");
      },
      setDraft: (text) => {
        setDraft(text);
        setVoiceMeta({ source: "text" });
      },
      getCareRecipientId: () => careRecipient.id,
    };
    return () => {
      delete window.__crE2E;
    };
  }, []);

  const pageTitle = useMemo(() => {
    switch (tab) {
      case "today":
        return "Today";
      case "care":
        return "Care";
      case "circle":
        return "Care Circle";
      case "relay":
        return "Relay";
    }
  }, [tab]);

  async function submitText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: trimmed, at: nowLabel() },
    ]);
    setDraft("");
    setConfirmed(false);
    setLastError(null);
    setBusy(true);

    try {
      // Same pipeline for voice (edited transcript) and text
      const result = await proposeCareUpdate(trimmed, undefined, voiceMeta);
      if (result.kind === "access_denied") {
        setBundle(null);
        const msg = result.message ?? "Access denied for this care context.";
        setLastError(msg);
        setMessages((prev) => [
          ...prev,
          {
            id: `r-${Date.now()}`,
            role: "relay",
            text: msg,
            at: nowLabel(),
          },
        ]);
        setTab("relay");
        return;
      }
      if (result.kind === "refusal") {
        setBundle(null);
        const msg = result.message ?? "I can't do that safely.";
        setLastError(msg);
        setMessages((prev) => [
          ...prev,
          {
            id: `r-${Date.now()}`,
            role: "relay",
            text: msg,
            at: nowLabel(),
          },
        ]);
        setTab("relay");
        return;
      }

      if (result.kind === "verify" && result.bundle) {
        setBundle(result.bundle);
        const lines = result.bundle.items.map((i) => `• ${i.label}`).join("\n");
        const modeNote = `Evidence: ${result.evidenceMode}`;
        setMessages((prev) => [
          ...prev,
          {
            id: `r-${Date.now()}`,
            role: "relay",
            text: `For ${careRecipient.displayName}\n\nI got this:\n${lines}\n\nPlease confirm or correct before I relay.\n(${modeNote})`,
            at: nowLabel(),
          },
        ]);
        setTab("relay");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Request failed — nothing was saved.";
      setLastError(msg);
      setBundle(null);
      setMessages((prev) => [
        ...prev,
        {
          id: `r-${Date.now()}`,
          role: "relay",
          text: `Could not reach care services. ${msg} Nothing was saved as care truth.`,
          at: nowLabel(),
        },
      ]);
      setTab("relay");
    } finally {
      setBusy(false);
    }
  }

  async function confirmLooksRight() {
    if (!bundle || busy) return;
    setBusy(true);
    setLastError(null);
    try {
      const result = await confirmCareUpdateAsync(bundle);

      if (result.kind === "persisted") {
        setConfirmed(true);
        const updates = bundle.understood.communicationRequests;
        const nextHandled = [
          ...updates.map((u) => u.replace("Update ready for ", "Updated ")),
          "Saved today's care notes (Foundation care runtime)",
          ...bundle.understood.appointmentChanges.map((a) => `Schedule: ${a}`),
        ];
        setRelayHandled((prev) => [...nextHandled, ...prev].slice(0, 8));
        setMessages((prev) => [
          ...prev,
          {
            id: `s-${Date.now()}`,
            role: "system",
            text: `${result.message ?? "Confirmed."} Events: ${result.persisted?.eventIds.length ?? 0}. Handoff: ${result.persisted?.handoffId ?? "n/a"}. Mode: ${result.evidenceMode}.`,
            at: nowLabel(),
          },
        ]);
        setShowHandoff(true);
        setTodayRefresh((n) => n + 1);
      } else {
        // Fail closed: do not mark confirmed / success on non-persist
        const msg =
          result.message ??
          "Confirmation did not persist. Care state was not updated.";
        setLastError(msg);
        setMessages((prev) => [
          ...prev,
          {
            id: `s-${Date.now()}`,
            role: "system",
            text: msg,
            at: nowLabel(),
          },
        ]);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Confirm failed — care truth was not updated.";
      setLastError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `s-${Date.now()}`,
          role: "system",
          text: `Confirm failed. ${msg}`,
          at: nowLabel(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function loadDemo() {
    setDraft(DEMO_UTTERANCE);
    setVoiceMeta(undefined);
    setTab("relay");
  }

  const liveHandoff = getLatestHandoff();

  return (
    <div className="app-shell" data-testid="app-shell">
      <header className="app-header">
        <div className="brand" aria-label="Caretaker Relay">
          <span className="brand-mark" aria-hidden />
          <span>Caretaker Relay</span>
        </div>
        <div className="header-right">
          <span
            className="evidence-badge"
            data-testid="evidence-badge"
            title="How this session is backed"
            aria-label={evidence.label}
          >
            {evidence.mode === "LIVE_FOUNDATION_BACKED" ? "LIVE" : "SYNTHETIC"}
          </span>
          {lastError && (
            <span
              className="muted"
              data-testid="app-error"
              role="alert"
              style={{ fontSize: "0.7rem", maxWidth: 120 }}
              title={lastError}
            >
              Error
            </span>
          )}
          <button
            type="button"
            className="avatar-btn"
            aria-label="Profile and settings"
            title="Profile"
          >
            S
          </button>
        </div>
      </header>

      <main className="main" aria-label={pageTitle}>
        {tab === "today" && (
          <TodayPage
            relayHandled={relayHandled}
            onOpenHandoff={() => setShowHandoff(true)}
            onLoadDemo={loadDemo}
            refreshKey={todayRefresh}
          />
        )}
        {tab === "care" && <CarePage />}
        {tab === "circle" && <CirclePage />}
        {tab === "relay" && (
          <RelayPage
            messages={messages}
            onUseDemo={() => setDraft(DEMO_UTTERANCE)}
          />
        )}

        {bundle && !confirmed && (
          <VerifyPanel
            bundle={bundle}
            onConfirm={() => void confirmLooksRight()}
            onCorrect={() => {
              setMessages((prev) => [
                ...prev,
                {
                  id: `s-${Date.now()}`,
                  role: "system",
                  text: "Tell me what to correct. Previous notes stay in the record (foundation correction path).",
                  at: nowLabel(),
                },
              ]);
              setTab("relay");
            }}
          />
        )}

        {showHandoff && (
          <HandoffPanel
            onClose={() => setShowHandoff(false)}
            liveHandoff={liveHandoff}
          />
        )}

        {(tab === "today" || tab === "relay") &&
          !(bundle && !confirmed) &&
          !showHandoff && (
          <div className="composer-dock" data-testid="composer-dock">
            <Composer
              value={draft}
              onChange={setDraft}
              onSubmit={() => void submitText(draft)}
              onVoiceMeta={setVoiceMeta}
              placeholder={
                busy ? "Relay is understanding…" : "Tell Relay what happened…"
              }
            />
          </div>
        )}
      </main>

      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
