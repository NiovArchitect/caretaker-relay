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
import { SideNav } from "./components/SideNav";
import { RelayPanel } from "./components/RelayPanel";
import { HandoffPanel } from "./components/HandoffPanel";
import { TodayPage } from "./pages/TodayPage";
import { CarePage } from "./pages/CarePage";
import { PeoplePage } from "./pages/PeoplePage";

function nowLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function todayDateLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

declare global {
  interface Window {
    __crE2E?: {
      injectTranscript: (text: string, meta?: TranscriptMeta) => void;
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
  const [lastEventIds, setLastEventIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<RelayMessage[]>([
    {
      id: "m0",
      role: "relay",
      at: nowLabel(),
      text: `Good morning. I'm here for ${careRecipient.displayName}'s care today.\n\nTell me what happened in plain language — I'll organize it and ask you to verify anything consequential.`,
    },
  ]);
  const [relayHandled, setRelayHandled] = useState(today.relayHandled);
  const [voiceMeta, setVoiceMeta] = useState<TranscriptMeta | undefined>();
  const [todayRefresh, setTodayRefresh] = useState(0);
  const [relayOpen, setRelayOpen] = useState(false);

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
        setRelayOpen(true);
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
      case "people":
        return "People";
      case "relay":
        return "Relay";
    }
  }, [tab]);

  function openRelay() {
    setRelayOpen(true);
  }

  async function submitText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    openRelay();
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: trimmed, at: nowLabel() },
    ]);
    setDraft("");
    setConfirmed(false);
    setLastError(null);
    setBusy(true);

    try {
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
        setCorrecting(false);
      }

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
        return;
      }

      const result = await proposeCareUpdate(trimmed, undefined, voiceMeta);
      if (result.kind === "access_denied") {
        setBundle(null);
        const msg = result.message ?? "Access denied for this care context.";
        setLastError(msg);
        setMessages((prev) => [
          ...prev,
          { id: `r-${Date.now()}`, role: "relay", text: msg, at: nowLabel() },
        ]);
        return;
      }
      if (result.kind === "refusal") {
        setBundle(null);
        const msg = result.message ?? "I can't do that safely.";
        setLastError(msg);
        setMessages((prev) => [
          ...prev,
          { id: `r-${Date.now()}`, role: "relay", text: msg, at: nowLabel() },
        ]);
        return;
      }

      if (result.kind === "verify" && result.bundle) {
        setBundle(result.bundle);
        const n = result.bundle.items.length;
        const lines = result.bundle.items.map((i) => `• ${i.label}`).join("\n");
        setMessages((prev) => [
          ...prev,
          {
            id: `r-${Date.now()}`,
            role: "relay",
            text: `I organized that into ${n} care item${n === 1 ? "" : "s"} for ${careRecipient.displayName}:\n${lines}\n\nPlease verify the consequential parts before I save them as care truth.`,
            at: nowLabel(),
          },
        ]);
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
          ...updates.map((u) =>
            u.replace("Update ready for ", "Update prepared for "),
          ),
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
            text: "Saved. Olivia's day is updated, and Maya's continuity picture can include this.",
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
          { id: `s-${Date.now()}`, role: "system", text: msg, at: nowLabel() },
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
    openRelay();
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
    setDraft("");
  }

  function loadDemo() {
    setDraft(JUDGE_DEMO_UTTERANCE);
    setVoiceMeta(undefined);
    openRelay();
  }

  function onReviewAttention(_item: TodayAttentionItem) {
    openRelay();
    setDraft(JUDGE_DEMO_UTTERANCE);
  }

  function onNavChange(t: NavTab) {
    setTab(t);
    if (t === "relay") openRelay();
  }

  const liveHandoff = getLatestHandoff();
  const workspaceTab = tab === "relay" ? "today" : tab;

  return (
    <div className="app-shell" data-testid="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="Caretaker Relay">
          <span className="brand-mark" aria-hidden />
          <span>Caretaker Relay</span>
        </div>
        <div className="topbar-center">
          <div className="recipient-chip" data-testid="care-recipient-chip">
            <span className="avatar-3d" aria-hidden>
              O
            </span>
            {careRecipient.displayName}
          </div>
          <span className="topbar-date">{todayDateLabel()}</span>
        </div>
        <div className="topbar-right">
          {lastError && (
            <span
              className="muted"
              data-testid="app-error"
              role="alert"
              title={lastError}
              style={{ fontSize: "0.72rem", maxWidth: 140 }}
            >
              Connection issue
            </span>
          )}
          <button
            type="button"
            className="relay-drawer-toggle"
            data-testid="relay-open-mobile"
            onClick={() => setRelayOpen(true)}
          >
            <span className="relay-pulse" aria-hidden />
            Relay
          </button>
          <span
            className="session-label"
            data-testid="session-caregiver"
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
          <span className="live-dot" title="Connected" aria-hidden />
        </div>
      </header>

      <SideNav tab={workspaceTab} onChange={onNavChange} />

      <main className="workspace" aria-label={pageTitle}>
        <div className="workspace-inner">
          {workspaceTab === "today" && (
            <TodayPage
              relayHandled={relayHandled}
              onOpenHandoff={() => setShowHandoff(true)}
              onLoadDemo={loadDemo}
              refreshKey={todayRefresh}
              onReviewAttention={onReviewAttention}
            />
          )}
          {workspaceTab === "care" && <CarePage />}
          {workspaceTab === "people" && <PeoplePage />}

          {showHandoff && (
            <HandoffPanel
              onClose={() => setShowHandoff(false)}
              liveHandoff={liveHandoff}
              status="prepared"
            />
          )}
        </div>
      </main>

      {relayOpen && (
        <div
          className="overlay-scrim"
          aria-hidden
          onClick={() => setRelayOpen(false)}
        />
      )}

      <RelayPanel
        open={relayOpen}
        messages={messages}
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={() => void submitText(draft)}
        onVoiceMeta={setVoiceMeta}
        busy={busy}
        correcting={correcting}
        bundle={bundle}
        confirmed={confirmed}
        onConfirm={() => void confirmLooksRight()}
        onCorrect={startCorrection}
        onUseSample={loadDemo}
        onCloseMobile={() => setRelayOpen(false)}
      />

      <BottomNav tab={tab === "relay" ? "relay" : workspaceTab} onChange={onNavChange} />

      <footer className="status-bar">
        <span>Care workspace · human verifies consequential truth</span>
        <span>Not medical advice · synthetic evaluation household</span>
      </footer>
    </div>
  );
}
