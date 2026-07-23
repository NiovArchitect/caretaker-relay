import { useEffect, useMemo, useState } from "react";
import type { NavTab, RelayMessage, VerificationBundle } from "./domain/types";
import {
  proposeCareUpdate,
  confirmCareUpdateAsync,
  applyCareCorrection,
  answerCareQuestion,
  fetchLatestHandoff,
  restoreSession,
  clearSession,
  careRecipient,
  type TranscriptMeta,
  type TodayAttentionItem,
  type SessionIdentity,
} from "./foundation/careClient";
// session after LoginGate is non-null
import type { CareHandoff } from "./domain/types";
import { today } from "./scenario/olivia";
import { BottomNav } from "./components/BottomNav";
import { SideNav } from "./components/SideNav";
import { RelayPanel } from "./components/RelayPanel";
import { HandoffPanel } from "./components/HandoffPanel";
import { LoginGate } from "./components/LoginGate";
import { TodayPage } from "./pages/TodayPage";
import { CarePage } from "./pages/CarePage";
import { PeoplePage } from "./pages/PeoplePage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { people } from "./scenario/olivia";

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
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<SessionIdentity | null>(null);
  const [tab, setTab] = useState<NavTab>("today");
  const [draft, setDraft] = useState("");
  const [bundle, setBundle] = useState<VerificationBundle | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [correcting, setCorrecting] = useState(false);
  const [lastEventIds, setLastEventIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<RelayMessage[]>([]);
  const [relayHandled, setRelayHandled] = useState(today.relayHandled);
  const [voiceMeta, setVoiceMeta] = useState<TranscriptMeta | undefined>();
  const [todayRefresh, setTodayRefresh] = useState(0);
  const [relayOpen, setRelayOpen] = useState(false);
  const [liveHandoff, setLiveHandoff] = useState<CareHandoff | null | undefined>(
    undefined,
  );
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [careFocus, setCareFocus] = useState<
    "medication" | "task" | "general" | null
  >(null);

  useEffect(() => {
    void restoreSession().then((s) => {
      setSession(s);
      setAuthReady(true);
      if (s) {
        setMessages([
          {
            id: "m0",
            role: "relay",
            at: nowLabel(),
            text: `Signed in as ${s.displayName} (${s.roleLabel}).\n\nI'm here for ${careRecipient.displayName}'s care. Tell me what happened in plain language — I'll organize it and ask you to verify anything consequential.`,
          },
        ]);
      }
    });
  }, []);

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

  // Hooks must run on every render path (including LoginGate) — never after
  // conditional returns, or authenticated shells crash with React #310.
  const pageTitle = useMemo(() => {
    switch (tab) {
      case "today":
        return "Today";
      case "care":
        return "Care";
      case "people":
        return "People";
      case "documents":
        return "Documents";
      case "relay":
        return "Relay";
    }
  }, [tab]);

  if (!authReady) {
    return (
      <div className="app-shell" data-testid="auth-loading">
        <p className="muted" style={{ padding: 24 }}>
          Checking session…
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <LoginGate
        onAuthenticated={(s) => {
          setSession(s);
          setMessages([
            {
              id: "m0",
              role: "relay",
              at: nowLabel(),
              text: `Signed in as ${s.displayName} (${s.roleLabel}).\n\nI'm here for ${careRecipient.displayName}'s care. Tell me what happened in plain language — I'll organize it and ask you to verify anything consequential.`,
            },
          ]);
          setTodayRefresh((n) => n + 1);
        }}
      />
    );
  }

  function signOut() {
    clearSession();
    setSession(null);
    setMessages([]);
    setBundle(null);
    setShowHandoff(false);
  }

  function openRelay() {
    setRelayOpen(true);
  }

  /** Product path: open Relay for natural language — never prefill a demo script. */
  function openRelayForCareUpdate() {
    setDraft("");
    setVoiceMeta(undefined);
    setCorrecting(false);
    openRelay();
  }

  async function openLatestHandoff() {
    setShowHandoff(true);
    setHandoffLoading(true);
    setLiveHandoff(undefined);
    try {
      const h = await fetchLatestHandoff();
      setLiveHandoff(h);
    } finally {
      setHandoffLoading(false);
    }
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
          setTab("today");
          void openLatestHandoff();
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
            text: `Saved. ${careRecipient.displayName}'s care picture is updated, and ${people.maya.displayName} can receive lay→lay continuity from this.`,
            at: nowLabel(),
          },
        ]);
        setBundle(null);
        setTodayRefresh((n) => n + 1);
        setTab("today");
        void openLatestHandoff();
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

  function onReviewAttention(item: TodayAttentionItem) {
    // Care objects open in Care — never inject a prewritten Relay prompt.
    if (item.kind === "medication") {
      setCareFocus("medication");
      setTab("care");
      return;
    }
    setCareFocus(item.kind === "task" ? "task" : "general");
    setTab("care");
  }

  function onNavChange(t: NavTab) {
    setTab(t);
    if (t === "relay") openRelayForCareUpdate();
    if (t !== "care") setCareFocus(null);
  }

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
              E
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--cr-muted)" }}>
                Caring for
              </div>
              <div data-testid="care-recipient-label" style={{ lineHeight: 1.2 }}>
                {careRecipient.displayName}
              </div>
              <div className="muted" style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                Care recipient
              </div>
            </div>
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
            title="Server-authenticated principal"
          >
            {session.displayName}
            <span className="muted" style={{ fontWeight: 500 }}>
              {" "}
              · {session.roleLabel}
            </span>
          </span>
          <button
            type="button"
            className="secondary-btn"
            data-testid="sign-out"
            onClick={signOut}
            style={{ minHeight: 36, fontSize: "0.75rem" }}
          >
            Sign out
          </button>
          <button
            type="button"
            className="avatar-btn"
            aria-label={`Signed in as ${session.displayName}, ${session.roleLabel} for ${careRecipient.displayName}`}
            title={`${session.displayName} · ${session.roleLabel}`}
          >
            {(session.displayName[0] ?? "U").toUpperCase()}
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
              onOpenHandoff={() => void openLatestHandoff()}
              onOpenRelay={openRelayForCareUpdate}
              refreshKey={todayRefresh}
              onReviewAttention={onReviewAttention}
            />
          )}
          {workspaceTab === "care" && <CarePage focusKind={careFocus} />}
          {workspaceTab === "people" && <PeoplePage />}
          {workspaceTab === "documents" && <DocumentsPage />}

          {showHandoff && (
            <HandoffPanel
              onClose={() => setShowHandoff(false)}
              liveHandoff={liveHandoff ?? null}
              status="prepared"
              loading={handoffLoading}
              emptyReason={
                liveHandoff === null
                  ? "No handoff has been persisted for this care recipient yet."
                  : null
              }
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
        onCloseMobile={() => setRelayOpen(false)}
      />

      <BottomNav tab={tab === "relay" ? "relay" : workspaceTab} onChange={onNavChange} />

      <footer className="status-bar">
        <span>
          {session.displayName} · caring for {careRecipient.displayName}
        </span>
        <span>Not medical advice · synthetic household · human verifies truth</span>
      </footer>
    </div>
  );
}
