import { useMemo, useState } from "react";
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

export function App() {
  const [tab, setTab] = useState<NavTab>("today");
  const [draft, setDraft] = useState("");
  const [bundle, setBundle] = useState<VerificationBundle | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [busy, setBusy] = useState(false);
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
    setBusy(true);

    try {
      // Same pipeline for voice (edited transcript) and text
      const result = await proposeCareUpdate(trimmed, undefined, voiceMeta);
      if (result.kind === "access_denied") {
        setBundle(null);
        setMessages((prev) => [
          ...prev,
          {
            id: `r-${Date.now()}`,
            role: "relay",
            text: result.message ?? "Access denied for this care context.",
            at: nowLabel(),
          },
        ]);
        setTab("relay");
        return;
      }
      if (result.kind === "refusal") {
        setBundle(null);
        setMessages((prev) => [
          ...prev,
          {
            id: `r-${Date.now()}`,
            role: "relay",
            text: result.message ?? "I can't do that safely.",
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
    } finally {
      setBusy(false);
    }
  }

  async function confirmLooksRight() {
    if (!bundle || busy) return;
    setBusy(true);
    try {
      const result = await confirmCareUpdateAsync(bundle);
      setConfirmed(true);

      if (result.kind === "persisted") {
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
      }
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
    <div className="app-shell">
      <header className="app-header">
        <div className="brand" aria-label="Caretaker Relay">
          <span className="brand-mark" aria-hidden />
          <span>Caretaker Relay</span>
        </div>
        <div className="header-right">
          <span
            className="evidence-badge"
            title="How this session is backed"
            aria-label={evidence.label}
          >
            {evidence.mode === "LIVE_FOUNDATION_BACKED" ? "LIVE" : "SYNTHETIC"}
          </span>
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

        {(tab === "today" || tab === "relay") && (
          <div className="composer-dock">
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
