import { useEffect, useMemo, useState } from "react";
import type { NavTab, RelayMessage, VerificationBundle } from "./domain/types";
import {
  proposeCareUpdate,
  confirmCareUpdateAsync,
  applyCareCorrection,
  answerCareQuestion,
  getLatestHandoff,
  JUDGE_DEMO_UTTERANCE,
  careRecipient,
  type TranscriptMeta,
  type TodayAttentionItem,
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
  const [correcting, setCorrecting] = useState(false);
  /** Persisted event ids from last confirm — used for real correction lineage. */
  const [lastEventIds, setLastEventIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<RelayMessage[]>([
    {
      id: "m0",
      role: "relay",
      at: nowLabel(),
      text: `I'm here for ${careRecipient.displayName}'s day. Tell me what happened, or ask what still needs attention.`,
    },
  ]);
  const [relayHandled, setRelayHandled] = useState(today.relayHandled);
  const [voiceMeta, setVoiceMeta] = useState<TranscriptMeta | undefined>();
  const [todayRefresh, setTodayRefresh] = useState(0);

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
      // Correction path after a confirmed event exists (domain supersession).
      if (correcting && lastEventIds.length > 0) {
        const targetId = lastEventIds[0]!;
        const result = await applyCareCorrection(targetId, trimmed);
        setCorrecting(false);
        if (result.kind === "persisted") {
          if (result.persisted?.eventIds?.length) {
            setLastEventIds(result.persisted.eventIds);
          }
          setMessages((prev) => [
            ...prev,
            {
              id: `r-${Date.now()}`,
              role: "relay",
              text: "Correction saved. The previous version stays in the record so nothing is silently erased.",
              at: nowLabel(),
            },
          ]);
          setTodayRefresh((n) => n + 1);
          setShowHandoff(true);
          setTab("today");
        } else {
          // Fall through: re-run understand on the corrected statement
          setMessages((prev) => [
            ...prev,
            {
              id: `r-${Date.now()}`,
              role: "relay",
              text: "I'll treat that as a new care update and ask you to verify it.",
              at: nowLabel(),
            },
          ]);
        }
        if (result.kind === "persisted") return;
      } else if (correcting) {
        // Pre-confirm correct: treat as a fresh natural update (no silent overwrite).
        setCorrecting(false);
      }

      // Care-context questions first (no fake chatbot)
      const answer = await answerCareQuestion(trimmed);
      if (answer) {
        setMessages((prev) => [
          ...prev,
          {
            id: `r-${Date.now()}`,
            role: "relay",
            text: answer,
            at: nowLabel(),
          },
        ]);
        setTab("relay");
        return;
      }

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
        const n = result.bundle.items.length;
        const lines = result.bundle.items
          .map((i) => `• ${i.label}`)
          .join("\n");
        setMessages((prev) => [
          ...prev,
          {
            id: `r-${Date.now()}`,
            role: "relay",
            text: `For ${careRecipient.displayName}\n\nI found ${n} thing${n === 1 ? "" : "s"} in that update:\n${lines}\n\nPlease confirm or correct the consequential parts before I save them.`,
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
      setVoiceMeta(undefined);
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
        if (result.persisted?.eventIds?.length) {
          setLastEventIds(result.persisted.eventIds);
        }
        const updates = bundle.understood.communicationRequests;
        const nextHandled = [
          ...updates.map((u) => u.replace("Update ready for ", "Update prepared for ")),
          ...bundle.understood.appointmentChanges.map((a) => `Schedule: ${a}`),
          ...bundle.items
            .filter((i) => !i.discrepancy)
            .slice(0, 3)
            .map((i) => i.label),
        ];
        setRelayHandled((prev) => [...nextHandled, ...prev].slice(0, 8));
        setMessages((prev) => [
          ...prev,
          {
            id: `s-${Date.now()}`,
            role: "system",
            text: "Saved. Olivia's day and Maya's continuity picture are updated.",
            at: nowLabel(),
          },
        ]);
        setBundle(null);
        setShowHandoff(true);
        setTodayRefresh((n) => n + 1);
        setTab("today");
      } else {
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

  function startCorrection() {
    setCorrecting(true);
    setBundle(null);
    setConfirmed(false);
    setMessages((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}`,
        role: "system",
        text:
          lastEventIds.length > 0
            ? "Tell me the corrected care fact in plain language. The previous version stays in the record."
            : "Tell me what should be different. I'll re-read your update and ask you to verify again — nothing was saved as care truth yet.",
        at: nowLabel(),
      },
    ]);
    setTab("relay");
    setDraft("");
  }

  function loadDemo() {
    setDraft(JUDGE_DEMO_UTTERANCE);
    setVoiceMeta(undefined);
    setTab("relay");
  }

  function onReviewAttention(_item: TodayAttentionItem) {
    setTab("relay");
    setDraft(JUDGE_DEMO_UTTERANCE);
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
          <span
            className="muted"
            data-testid="session-caregiver"
            style={{ fontSize: "0.75rem", fontWeight: 600 }}
            title="Signed in as primary caregiver for this evaluation household"
          >
            Sadeil
          </span>
          <button
            type="button"
            className="avatar-btn"
            aria-label="Signed in as Sadeil, primary caregiver for Olivia"
            title="Sadeil · primary caregiver"
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
            onReviewAttention={onReviewAttention}
          />
        )}
        {tab === "care" && <CarePage />}
        {tab === "circle" && <CirclePage />}
        {tab === "relay" && (
          <RelayPage
            messages={messages}
            onUseDemo={() => setDraft(JUDGE_DEMO_UTTERANCE)}
            correcting={correcting}
          />
        )}

        {bundle && !confirmed && (
          <VerifyPanel
            bundle={bundle}
            onConfirm={() => void confirmLooksRight()}
            onCorrect={startCorrection}
          />
        )}

        {showHandoff && (
          <HandoffPanel
            onClose={() => setShowHandoff(false)}
            liveHandoff={liveHandoff}
            status="prepared"
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
                busy
                  ? "Relay is understanding…"
                  : correcting
                    ? "Type the correction…"
                    : "Tell Relay what happened…"
              }
            />
          </div>
        )}
      </main>

      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
