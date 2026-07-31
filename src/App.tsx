import { useEffect, useMemo, useRef, useState } from "react";
import type { NavTab, RelayMessage, VerificationBundle } from "./domain/types";
import {
  proposeCareUpdate,
  confirmCareUpdateAsync,
  applyCareCorrection,
  answerCareQuestion,
  askCaregiverClarification,
  fetchLatestHandoff,
  restoreSession,
  clearSession,
  installMultiTabSessionGuard,
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
import { CaretakerRelayLogo } from "./components/BrandMark";
import { AuthorizationGate } from "./components/AuthorizationGate";
import {
  claimFromPath,
  resolveRoleExperience,
} from "./lib/roleExperience";
import { loadOnboardingDraft } from "./lib/onboarding";
import { TodayPage } from "./pages/TodayPage";
import { CarePage } from "./pages/CarePage";
import { PeoplePage } from "./pages/PeoplePage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { ClinicalSummaryPage } from "./pages/ClinicalSummaryPage";
import { ConflictsPage } from "./pages/ConflictsPage";
import { people } from "./scenario/olivia";
import {
  hasAuthorizedRecipient,
  listAuthorizedCareSpaces,
  loadActiveCareRecipientId,
  NO_RECIPIENT_SPACE,
  resolveCareSpace,
  saveActiveCareRecipientId,
} from "./lib/careContext";
import { setActiveCareRecipientId } from "./foundation/careClient";
import { warmCareApi } from "./lib/apiWarm";
import { isSelfMessageTarget } from "./lib/messageTarget";
import { clearAuthorizationState } from "./lib/authorization";
import {
  beginScopedRequest,
  getRecipientContextVersion,
  invalidateScopedRequests,
  isScopedRequestCurrent,
  isStaleRecipientContext,
} from "./lib/activeRecipientContext";
import {
  answerInformationQuery,
  buildOperationalPreview,
  classifyRequestClass,
  executePendingOperational,
  type PendingOperationalAction,
} from "./lib/relay/requestClass";
import { humanCareLine } from "./lib/humanCopy";

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

function claimFromPathForGreeting(): boolean {
  try {
    const d = loadOnboardingDraft();
    return claimFromPath(d.path) === "receiving_care";
  } catch {
    return false;
  }
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
  /** Partitioned Relay threads by recipient — never merge across care spaces. */
  const messagesByRecipientRef = useRef<Record<string, RelayMessage[]>>({});
  const [relayHandled, setRelayHandled] = useState(today.relayHandled);
  const [voiceMeta, setVoiceMeta] = useState<TranscriptMeta | undefined>();
  const [todayRefresh, setTodayRefresh] = useState(0);
  /** Open by default so desktop rail and compact drawer are available after sign-in. */
  const [relayOpen, setRelayOpen] = useState(true);
  const [liveHandoff, setLiveHandoff] = useState<CareHandoff | null | undefined>(
    undefined,
  );
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [careFocus, setCareFocus] = useState<
    "medication" | "task" | "general" | null
  >(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeRecipientId, setActiveRecipientId] = useState(() => {
    const id = loadActiveCareRecipientId(null);
    setActiveCareRecipientId(id);
    return id;
  });
  /** Live recipient id for async gates (React state is stale inside long awaits). */
  const activeRecipientRef = useRef(activeRecipientId);
  useEffect(() => {
    activeRecipientRef.current = activeRecipientId;
  }, [activeRecipientId]);
  const [coordFocusPersonId, setCoordFocusPersonId] = useState<string | null>(
    null,
  );
  /** Bumps so re-clicking the same person re-enters Coordination mode. */
  const [coordFocusKey, setCoordFocusKey] = useState(0);
  const [recipientSwitching, setRecipientSwitching] = useState(false);
  const [notifConnected, setNotifConnected] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  /** Operational action draft (message / schedule) awaiting Looks right or Cancel */
  const [pendingOp, setPendingOp] = useState<PendingOperationalAction | null>(
    null,
  );
  const activeSpace = resolveCareSpace(
    activeRecipientId,
    session?.carePersonId,
  );
  const hasCareAccess =
    !!session && hasAuthorizedRecipient(session.carePersonId);
  const roleXp = session
    ? resolveRoleExperience({
        carePersonId: session.carePersonId,
        authorized: hasCareAccess,
        membershipRoleLabel: session.roleLabel,
      })
    : null;

  // Server notification transport health (poll — EventSource cannot send Bearer)
  // Count is recipient-scoped when possible to avoid cross-person "726 new" noise.
  useEffect(() => {
    if (!session || !hasCareAccess) return;
    let stopped = false;
    const tick = () => {
      void import("./foundation/careClient").then(({ fetchServerNotifications }) =>
        fetchServerNotifications().then((r) => {
          if (stopped) return;
          setNotifConnected(r.ok);
          if (r.ok) {
            // Single source of truth: server badge_count === attention_groups.length
            // Do not re-group client-side (zero-tolerance exact match).
            const badge =
              typeof r.badgeCount === "number"
                ? r.badgeCount
                : typeof r.unreadCount === "number"
                  ? r.unreadCount
                  : 0;
            setUnreadCount(Math.min(Math.max(0, badge), 99));
          }
        }),
      );
    };
    tick();
    // Was 5s — too aggressive with Today 4s + Relay 2s polls; reduces main-thread load.
    const iv = window.setInterval(tick, 15000);
    return () => {
      stopped = true;
      window.clearInterval(iv);
    };
  }, [session, activeRecipientId, hasCareAccess]);

  useEffect(() => {
    setActiveCareRecipientId(activeRecipientId);
  }, [activeRecipientId]);

  // Warm API ASAP; session restore must not block login paint more than needed.
  useEffect(() => {
    void warmCareApi(true);
  }, []);

  // Care → Shift workspace can request Relay without hard navigation.
  useEffect(() => {
    const onOpen = () => {
      setDraft("");
      setVoiceMeta(undefined);
      setCorrecting(false);
      setCoordFocusPersonId(null);
      setRelayOpen(true);
      window.setTimeout(() => {
        const el = document.querySelector(
          '[data-testid="composer-input"]',
        ) as HTMLTextAreaElement | null;
        el?.focus();
      }, 80);
    };
    window.addEventListener("cr-open-relay", onOpen);
    return () => window.removeEventListener("cr-open-relay", onOpen);
  }, []);

  // Multi-tab shared-device: logout in one tab wipes protected state in others.
  useEffect(() => {
    installMultiTabSessionGuard(() => {
      clearAuthorizationState();
      saveActiveCareRecipientId(NO_RECIPIENT_SPACE.careRecipientId);
      setSession(null);
      setMessages([]);
      setBundle(null);
      setShowHandoff(false);
      setLiveHandoff(undefined);
      setActiveRecipientId(NO_RECIPIENT_SPACE.careRecipientId);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const persistedFast = (() => {
      try {
        return !!sessionStorage.getItem("cr_care_session_v1");
      } catch {
        return false;
      }
    })();
    // Shell-first: if no persisted session, show LoginGate immediately.
    if (!persistedFast) {
      setAuthReady(true);
      setSession(null);
      return;
    }
    void restoreSession().then((s) => {
      if (cancelled) return;
      setSession(s);
      setAuthReady(true);
      if (s) {
        const id = loadActiveCareRecipientId(s.carePersonId);
        setActiveCareRecipientId(id);
        setActiveRecipientId(id);
        const space = resolveCareSpace(id, s.carePersonId);
        const authorized = hasAuthorizedRecipient(s.carePersonId);
        setMessages([
          {
            id: "m0",
            role: "relay",
            at: nowLabel(),
            text: authorized
              ? `Signed in as ${s.displayName} (${s.roleLabel}).\n\nI'm here for ${space.displayName}'s care. Ask me a question or share an update. I'll organize it and ask you to verify anything consequential.`
              : `Signed in as ${s.displayName}.\n\nYou are not connected to a care recipient yet. Use an invitation or request access — I will not open anyone's care record based on a role alone.`,
          },
        ]);
        // P0: compact layouts must surface Relay without hunting for a toggle
        ensureRelayAvailableOnCompactLayout();
      }
    });
    return () => {
      cancelled = true;
    };
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
      getCareRecipientId: () => activeRecipientId,
    };
    return () => {
      delete window.__crE2E;
    };
  }, []);

  // Hooks must run on every render path (including LoginGate) — never after
  // conditional returns, or authenticated shells crash with React #310.
  // Document-level Escape so avatar menu closes without requiring menu focus.
  useEffect(() => {
    if (!profileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [profileOpen]);

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

  // Deep-link navigation (Today → emergency, etc.) — must stay above early returns.
  useEffect(() => {
    const onNav = (ev: Event) => {
      const detail = (ev as CustomEvent<{ tab?: NavTab; focus?: string }>).detail;
      if (!detail?.tab || detail.tab === "relay") return;
      setTab(detail.tab);
      setRelayOpen(false);
      if (detail.focus === "emergency") {
        window.setTimeout(() => {
          document
            .getElementById("emergency-snapshot")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 160);
      }
      if (detail.focus === "shift") {
        window.setTimeout(() => {
          document
            .querySelector('[data-testid="care-section-shift"]')
            ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          window.setTimeout(() => {
            document
              .querySelector('[data-testid="incoming-handoff-inbox"]')
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 200);
        }, 160);
      }
    };
    window.addEventListener("cr-navigate", onNav);
    return () => window.removeEventListener("cr-navigate", onNav);
  }, []);

  /**
   * Compact ↔ desktop breakpoint: re-open Relay so drawer hide / rail minimize
   * cannot leave chat inaccessible after a resize. Must stay above early returns.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1100px)");
    const onChange = () => {
      setRelayOpen(true);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (!authReady) {
    return (
      <div className="app-shell cr-stage" data-testid="auth-loading">
        <div className="cr-ambient" aria-hidden />
        <p className="muted auth-loading-label">Checking session…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <LoginGate
        onAuthenticated={(s) => {
          setSession(s);
          const id = loadActiveCareRecipientId(s.carePersonId);
          setActiveCareRecipientId(id);
          setActiveRecipientId(id);
          const space = resolveCareSpace(id, s.carePersonId);
          const authorized = hasAuthorizedRecipient(s.carePersonId);
          setMessages([
            {
              id: "m0",
              role: "relay",
              at: nowLabel(),
              text: authorized
                ? `Signed in as ${s.displayName} (${s.roleLabel}).\n\nI'm here for ${space.displayName}'s care. Ask me a question or share an update. I'll organize it and ask you to verify anything consequential.`
                : claimFromPathForGreeting()
                  ? `Hi ${s.displayName}. This is your care account.\n\nYou can set up your own care profile, invite trusted helpers, or enter an invitation. I will not open anyone else's care without permission.`
                  : `Signed in as ${s.displayName}.\n\nYou are not linked to a care space yet. Use an invitation, request access to someone you support, or set up care for a person you help — I will not open a care record from a role claim alone.`,
            },
          ]);
          setTodayRefresh((n) => n + 1);
          // P0: open Relay drawer immediately on compact layouts after sign-in
          window.setTimeout(() => ensureRelayAvailableOnCompactLayout(), 0);
        }}
      />
    );
  }

  function signOut() {
    // Wipe UI immediately for shared-device safety; server revoke in background.
    clearAuthorizationState();
    saveActiveCareRecipientId(NO_RECIPIENT_SPACE.careRecipientId);
    setSession(null);
    setMessages([]);
    setBundle(null);
    setShowHandoff(false);
    setProfileOpen(false);
    setLiveHandoff(undefined);
    setActiveRecipientId(NO_RECIPIENT_SPACE.careRecipientId);
    void clearSession({ revokeServer: true });
  }

  function openRelay() {
    setRelayOpen(true);
    // Focus composer after panel opens
    window.setTimeout(() => {
      const el = document.querySelector(
        '[data-testid="composer-input"]',
      ) as HTMLTextAreaElement | null;
      el?.focus();
    }, 80);
  }

  /**
   * P0 availability:
   * - Compact (≤1100): open drawer so conversation is not off-screen.
   * - Desktop (>1100): keep rail open (not minimized) so chat stays in viewport.
   */
  function ensureRelayAvailableOnCompactLayout() {
    try {
      if (typeof window === "undefined") return;
      // Always surface Relay after auth/session restore — founder cannot hunt for it.
      setRelayOpen(true);
    } catch {
      /* ignore */
    }
  }

  /** Product path: open Relay for ask/tell — never prefill a demo script. */
  function openRelayForCareUpdate() {
    setDraft("");
    setVoiceMeta(undefined);
    setCorrecting(false);
    setCoordFocusPersonId(null);
    openRelay();
  }

  function switchRecipient(id: string) {
    if (id === activeRecipientId) {
      setProfileOpen(false);
      return;
    }
    const nextSpace = resolveCareSpace(id, session?.carePersonId);
    // Soft confirm for multi-recipient caregivers (shared-device / mix-up safety)
    const spaces = listAuthorizedCareSpaces(session?.carePersonId);
    if (spaces.length > 1) {
      const ok = window.confirm(
        `Switch care context to ${nextSpace.displayName}?\n\nToday, Relay, tasks, and documents will show only ${nextSpace.displayName}'s care. Unsaved Relay drafts for the current recipient stay with that recipient.`,
      );
      if (!ok) {
        setProfileOpen(false);
        return;
      }
    }

    // BEGIN RECIPIENT SWITCH — disable consequential controls first
    setRecipientSwitching(true);
    setBusy(true);
    setProfileOpen(false);
    setShowHandoff(false);
    setBundle(null);
    setConfirmed(false);
    setCorrecting(false);
    setLastEventIds([]);
    setDraft("");
    setVoiceMeta(undefined);
    setCoordFocusPersonId(null);
    setLiveHandoff(undefined);
    setCareFocus(null);
    setLastError(null);
    // Drop collaboration pending targets tied to previous space
    try {
      (window as unknown as { __crPendingAsk?: string }).__crPendingAsk =
        undefined;
    } catch {
      /* ignore */
    }

    // Partition current Relay thread under previous recipient (do not delete)
    messagesByRecipientRef.current[activeRecipientId] = messages;

    // Default UX: NEW PERSON → ORIENT ME (Today, not stale subpage)
    setTab("today");
    setRelayOpen(false);

    // Atomic: bind API client + context_version, persist, then React state
    setActiveCareRecipientId(id);
    saveActiveCareRecipientId(id);
    setActiveRecipientId(id);
    invalidateScopedRequests();

    const space = resolveCareSpace(id, session?.carePersonId);
    setTodayRefresh((n) => n + 1);
    setUnreadCount(0);

    const priorThread = messagesByRecipientRef.current[id];
    if (priorThread && priorThread.length > 0) {
      setMessages([
        {
          id: `sys-switch-back-${Date.now()}`,
          role: "system",
          at: nowLabel(),
          text: `Back to ${space.displayName}'s care. Showing only this recipient's Relay thread.`,
        },
        ...priorThread.filter((m) => m.role !== "system" || !/Now caring for|Back to /.test(m.text)),
      ]);
    } else {
      setMessages([
        {
          id: `sys-switch-${Date.now()}`,
          role: "system",
          at: nowLabel(),
          text: `Now caring for ${space.displayName}. Everything on this screen is for them only.`,
        },
      ]);
    }

    // Canonical top of orientation surface
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      document
        .querySelector("[data-testid=app-shell] main, .main-stage, .workspace")
        ?.scrollTo?.({ top: 0 });
    });
    // END SWITCH — brief gate so stale paint cannot land under new header
    window.setTimeout(() => {
      setRecipientSwitching(false);
      setBusy(false);
    }, 400);
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
    if (!trimmed || busy || recipientSwitching) return;

    openRelay();
    // Capture active context before any await — reject if user switches mid-flight
    const scoped = beginScopedRequest("relay-answer");
    const startedRecipient = activeRecipientId;
    const startedVersion = scoped.version;
    // Stable IDs for conversation anchor contract: user question + answer placeholder
    // stay paired so RelayPanel can keep the question at the top of the viewport
    // and the start of the answer immediately below it.
    const userId = `u-${Date.now()}`;
    const replyId = `r-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", text: trimmed, at: nowLabel() },
      {
        id: replyId,
        role: "relay",
        text: "Relay is preparing an answer…",
        at: nowLabel(),
        pending: true,
      },
    ]);
    setDraft("");
    setConfirmed(false);
    setLastError(null);
    setBusy(true);

    const stillCurrent = () =>
      isScopedRequestCurrent("relay-answer", startedVersion, scoped.token) &&
      !isStaleRecipientContext(startedVersion) &&
      activeRecipientRef.current === startedRecipient;

    const fillReply = (textOut: string, extra?: RelayMessage[]) => {
      if (!stillCurrent()) {
        // Stale response: never paint under a different recipient header
        return;
      }
      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === replyId
            ? { ...m, text: textOut, pending: false, at: nowLabel() }
            : m,
        );
        return extra?.length ? [...next, ...extra] : next;
      });
    };

    try {
      // ── Request-class router (before domain extraction) ───────────────
      const classified = classifyRequestClass(trimmed);

      // Cancel / dismiss pending care-update or operational draft
      if (classified.requestClass === "CANCELLATION_RESPONSE") {
        setBundle(null);
        setPendingOp(null);
        setConfirmed(false);
        setCorrecting(false);
        fillReply(
          "Cancelled. That draft was not saved and nothing was executed. What would you like to do next?",
        );
        return;
      }

      // Confirm pending operational action (message / schedule)
      if (
        classified.requestClass === "CONFIRMATION_RESPONSE" &&
        pendingOp &&
        !bundle
      ) {
        const receipt = await executePendingOperational(pendingOp);
        setPendingOp(null);
        fillReply(humanCareLine(receipt));
        setTodayRefresh((n) => n + 1);
        return;
      }

      if (correcting && lastEventIds.length > 0) {
        const targetId = lastEventIds[0]!;
        const result = await applyCareCorrection(targetId, trimmed);
        setCorrecting(false);
        if (result.kind === "persisted") {
          if (result.persisted?.eventIds?.length) {
            setLastEventIds(result.persisted.eventIds);
          }
          fillReply(
            "Correction saved. The previous version stays in the record so nothing is silently erased.",
          );
          setTodayRefresh((n) => n + 1);
          setTab("today");
          void openLatestHandoff();
        } else {
          fillReply(
            "I'll treat that as a new care update and ask you to verify it.",
          );
        }
        if (result.kind === "persisted") return;
      } else if (correcting) {
        setCorrecting(false);
      }

      // Collaboration confirm (next turn after Relay offers "Want me to ask …")
      if (
        /^yes[,.]?\s*(please\s*)?ask/i.test(trimmed) ||
        (/^yes$/i.test(trimmed.trim()) &&
          (window as unknown as { __crPendingAsk?: string }).__crPendingAsk)
      ) {
        const target =
          (window as unknown as { __crPendingAsk?: string }).__crPendingAsk ??
          "p-maya";
        const isProvider = target === "p-dr-shah";
        const r = await askCaregiverClarification({
          targetPersonId: target,
          question: isProvider
            ? "Could the recent dizziness require a medication review? Please provide guidance for the care team."
            : `Can you confirm whether you gave ${activeSpace.displayName} the scheduled medication yesterday?`,
          contextSummary: isProvider
            ? "Provider collaboration — high-signal timeline only (in-app)"
            : "Requested via Relay collaboration offer",
        });
        (window as unknown as { __crPendingAsk?: string }).__crPendingAsk =
          undefined;
        fillReply(
          r.ok
            ? isProvider
              ? "Question prepared for Dr. Shah. They will see it as an in-app notification."
              : "Request sent. They will get a notification on their account. I'll help you verify anything consequential when they reply."
            : `Could not send request: ${r.message ?? "error"}`,
        );
        return;
      }

      // Operational actions — never route to medication/meal extraction
      if (classified.requestClass === "OPERATIONAL_ACTION") {
        setBundle(null);
        const { preview, pending } = buildOperationalPreview(classified);
        if (pending) setPendingOp(pending);
        else setPendingOp(null);
        fillReply(
          humanCareLine(preview) ||
            "I understood an action request, but need a clearer person or appointment name.",
        );
        return;
      }

      // Information queries — answer path with local projection fallback
      if (
        classified.requestClass === "INFORMATION_QUERY" ||
        classified.requestClass === "META_CONVERSATION"
      ) {
        setPendingOp(null);
        let answer = await answerCareQuestion(trimmed);
        if (
          !answer ||
          /no matching record|don.?t have a matching|generic domain|What domain should we check/i.test(
            answer,
          )
        ) {
          const local = await answerInformationQuery(trimmed);
          if (local) answer = local;
        }
        if (answer) {
          fillReply(humanCareLine(answer));
          return;
        }
        // Fall through only if truly empty
      }

      const answer = await answerCareQuestion(trimmed);
      if (answer) {
        // Collaboration offer — parse display name; map known lab principals by data id when possible
        const askMatch = answer.match(/Want me to ask ([^?]+)\?/i);
        let collabExtra: RelayMessage[] | undefined;
        if (askMatch) {
          const askedName = askMatch[1]!.trim();
          const lower = askedName.toLowerCase();
          let target = "p-maya";
          if (/shah|priya|physician|dr\./i.test(lower)) target = "p-dr-shah";
          else if (/daniel|walter|dsp|professional/i.test(lower))
            target = "p-walter";
          else if (/maya/i.test(lower)) target = "p-maya";
          (window as unknown as { __crPendingAsk?: string }).__crPendingAsk =
            target;
          collabExtra = [
            {
              id: `sys-collab-${Date.now()}`,
              role: "system",
              text: `Reply "Yes, please ask ${askedName}" to send a real request to their account.`,
              at: nowLabel(),
            },
          ];
        }
        // If server returned generic no-match, try local operating-day answer
        if (
          /no matching record|don.?t have a matching|What domain should we check/i.test(
            answer,
          )
        ) {
          const local = await answerInformationQuery(trimmed);
          if (local) {
            fillReply(humanCareLine(local));
            return;
          }
        }
        fillReply(humanCareLine(answer), collabExtra);
        return;
      }

      // Only CARE_REPORT / UNKNOWN go to extract→verify
      // Guard: never extract meals from message/schedule verbs
      if (
        /\b(send|message|text|tell|notify|reschedul|change meeting|change.*appointment)\b/i.test(
          trimmed,
        )
      ) {
        fillReply(
          "I treated that as an action request, not a care observation. Try: “Send a message to Maya saying …” or “Change Personal Training tomorrow to 2pm.”",
        );
        return;
      }

      const result = await proposeCareUpdate(trimmed, undefined, voiceMeta);
      if (result.kind === "access_denied") {
        setBundle(null);
        const msg = result.message ?? "Access denied for this care context.";
        setLastError(msg);
        fillReply(msg);
        return;
      }
      if (result.kind === "refusal") {
        setBundle(null);
        const msg = result.message ?? "I can't do that safely.";
        setLastError(msg);
        fillReply(msg);
        return;
      }

      if (result.kind === "verify" && result.bundle) {
        setBundle(result.bundle);
        const items = result.bundle.items.filter(
          (i) => i.candidateId !== "uncertainty",
        );
        const unc = result.bundle.items.filter(
          (i) => i.candidateId === "uncertainty",
        );
        const n = items.length;
        const lines = items.map((i) => `• ${i.label}`).join("\n");
        const planChange = items.some((i) =>
          /medication change needs verification/i.test(i.label),
        );
        const onlyUncertain =
          n === 0 && unc.length > 0 && !planChange;
        const allSoftObs =
          n > 0 &&
          items.every(
            (i) =>
              /observation|wellbeing|feels|tired|ate|slept/i.test(i.label) &&
              !i.discrepancy &&
              i.safetyClass !== "high",
          );
        if (onlyUncertain) {
          // Doctor validation: retrieval-like phrases must not look like medication entry
          const looksLikeRetrieve =
            /\b(vital|oxygen|therap|surger|comorbid|orientation|diagnos|history|status|what|when|who|how|is |are |any |last )\b/i.test(
              trimmed,
            ) &&
            !/\b(gave|took|administered|refused|missed|withheld|chart)\b/i.test(
              trimmed,
            );
          if (looksLikeRetrieve) {
            fillReply(
              `I treated that as a question about ${activeSpace.displayName}'s care record, not a new medication or plan update.\n\n` +
                `Nothing verified matches that request on file yet. That is an information gap — not a charting action.\n\n` +
                `An authorized person can add verified details, or you can rephrase (for example: “What are her last vital signs?” or “Is she on oxygen?”).`,
            );
          } else {
            fillReply(
              `I heard you, but I could not form a durable care item yet for ${activeSpace.displayName}.\n\n${unc.map((u) => `• ${u.label}`).join("\n")}\n\nPlease restate with the medication name, dose, and whether this is something already given or a change to the medication plan. Nothing has been added to the active plan.`,
            );
          }
        } else if (planChange) {
          fillReply(
            `I heard a possible medication change for ${activeSpace.displayName}:\n${lines}${unc.length ? `\n\nAlso note:\n${unc.map((u) => `• ${u.label}`).join("\n")}` : ""}\n\nI can save this as a medication-change report that needs verification. It will NOT be added to the active medication plan until an authorized reviewer confirms.\n\nUse Confirm my report to save the pending request (not “confirm medication order”).`,
          );
        } else if (allSoftObs) {
          fillReply(
            `I captured ${n} caregiver-reported observation${n === 1 ? "" : "s"} for ${activeSpace.displayName}:\n${lines}\n\nSource: you (caregiver-reported). Confirm with Looks right to save on their care timeline — this is observation evidence, not a clinical diagnosis.`,
          );
        } else {
          fillReply(
            `I organized that into ${n} care item${n === 1 ? "" : "s"} for ${activeSpace.displayName}:\n${lines}\n\nPlease verify the consequential parts before I save them as care truth. This does not create a clinical order by itself.`,
          );
        }
      } else {
        // Unexpected empty path — clear pending placeholder
        fillReply("I could not form an answer from the care context. Try rephrasing.");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Request failed — nothing was saved.";
      setLastError(msg);
      setBundle(null);
      fillReply(
        `Could not reach care services. ${msg} Nothing was saved as care truth.`,
      );
    } finally {
      setBusy(false);
      setVoiceMeta(undefined);
    }
  }

  async function confirmLooksRight() {
    if (!bundle || busy || recipientSwitching) return;
    const startedRecipient = activeRecipientRef.current;
    const startedVersion = getRecipientContextVersion();
    setBusy(true);
    setLastError(null);
    try {
      const result = await confirmCareUpdateAsync(bundle);
      if (
        isStaleRecipientContext(startedVersion) ||
        activeRecipientRef.current !== startedRecipient
      ) {
        // Confirmation completed under previous recipient binding; do not mutate new UI
        return;
      }

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
        // Receipt destinations → open dedicated product routes when appropriate
        const dests = (
          result as {
            executionReceipt?: { screenDestinations?: string[] };
          }
        ).executionReceipt?.screenDestinations;
        if (dests?.includes("people_privacy")) {
          // Seamless handoff to People for invitation / access review
          setTimeout(() => {
            try {
              (
                document.querySelector(
                  '[data-testid="nav-people"]',
                ) as HTMLElement | null
              )?.click();
            } catch {
              /* non-fatal */
            }
          }, 400);
        } else if (dests?.includes("documents")) {
          setTimeout(() => {
            try {
              (
                document.querySelector(
                  '[data-testid="nav-documents"], [data-testid="nav-docs"]',
                ) as HTMLElement | null
              )?.click();
            } catch {
              /* non-fatal */
            }
          }, 400);
        }
        const careNoteBody =
          (result.persisted as { careNoteBody?: string } | undefined)
            ?.careNoteBody;
        setMessages((prev) => [
          ...prev,
          {
            id: `s-${Date.now()}`,
            role: "system",
            text:
              result.message ??
              `Saved. ${activeSpace.displayName}'s care picture is updated. A care handoff is ready for ${people.maya.displayName} to review.`,
            at: nowLabel(),
          },
          ...(careNoteBody
            ? [
                {
                  id: `note-${Date.now()}`,
                  role: "relay" as const,
                  text: careNoteBody,
                  at: nowLabel(),
                },
              ]
            : []),
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
    setConfirmed(false);
    openRelay();
    const currentItems =
      bundle?.items
        ?.map((i) => i.label)
        .filter(Boolean)
        .join("; ") ?? "";
    const priorRaw = bundle?.understood?.rawText?.trim() ?? "";
    setMessages((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}`,
        role: "system",
        text:
          lastEventIds.length > 0
            ? `Correction mode. Current items on the pending/saved update:\n${currentItems || "(prior care fact)"}\n\nType what should be different in plain language. The previous version stays in the record with provenance.`
            : `Correction mode — nothing was saved as care truth yet.\n\nCurrent interpretation:\n${currentItems || priorRaw || "(none)"}\n\nEdit the draft below or type a full correction. I'll re-interpret and ask you to verify again.`,
        at: nowLabel(),
      },
    ]);
    // Prefill draft with prior wording so user can edit (not a dead button)
    setDraft(priorRaw || currentItems || "");
    setBundle(null);
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
    // Zero-access: recipient setup nav maps to guided setup sections (not dead controls)
    if (!hasCareAccess) {
      const sectionMap: Partial<
        Record<NavTab, "day" | "care" | "helpers" | "privacy" | "documents">
      > = {
        today: "day",
        care: "care",
        people: "helpers",
        documents: "documents",
        privacy: "privacy",
      };
      const section = sectionMap[t];
      if (section) {
        window.dispatchEvent(
          new CustomEvent("cr-recipient-setup-nav", { detail: { section } }),
        );
        setTab("today");
        setRelayOpen(false);
        return;
      }
      if (t === "relay") {
        // Recipient may open Relay for companion help — no coordination directory
        setCoordFocusPersonId(null);
        openRelay();
        return;
      }
    }
    setTab(t);
    if (t === "relay") openRelayForCareUpdate();
    if (t !== "care") setCareFocus(null);
    // Canonical entry for primary surfaces (not stale deep-scroll)
    if (t === "today" || t === "care" || t === "people" || t === "documents") {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      });
    }
  }

  function openNotifications() {
    // Notifications live on Today as the care attention inbox
    setTab("today");
    setProfileOpen(false);
    // Opening the inbox marks active-recipient items seen (unread → read)
    void import("./foundation/careClient").then(({ notificationBulk }) =>
      notificationBulk("mark_all_seen").then((r) => {
        if (r.ok) setUnreadCount(r.unreadCount ?? 0);
      }),
    );
    window.requestAnimationFrame(() => {
      document
        .querySelector(
          '[data-testid="server-notifications"], [data-testid="today-notifications"], [data-testid="coordination-inbox"]',
        )
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const workspaceTab = tab === "relay" ? "today" : tab;

  return (
    <div
      className={`app-shell cr-stage${!relayOpen ? " relay-desktop-closed" : ""}`}
      data-testid="app-shell"
      data-relay-open={relayOpen ? "true" : "false"}
      data-active-recipient={activeRecipientId}
      data-context-version={String(getRecipientContextVersion())}
      data-recipient-switching={recipientSwitching ? "true" : "false"}
    >
      <div className="cr-ambient" aria-hidden />
      <header className="topbar">
        <div className="brand">
          <CaretakerRelayLogo
            layout="horizontal"
            markSize={30}
            testId="app-brand-logo"
          />
        </div>
        <div className="topbar-center">
          <div className="recipient-chip" data-testid="care-recipient-chip">
            <span className="avatar-3d" aria-hidden>
              {hasCareAccess ? activeSpace.preferredName.charAt(0) : "?"}
            </span>
            <div className="recipient-chip-text">
              <div className="recipient-chip-kicker">
                {hasCareAccess
                  ? `${activeSpace.displayName}'s care`
                  : roleXp?.claim === "receiving_care"
                    ? "Your care"
                    : "Access"}
              </div>
              <div
                data-testid="care-recipient-label"
                className="recipient-chip-name"
              >
                {hasCareAccess
                  ? activeSpace.displayName
                  : roleXp?.claim === "receiving_care"
                    ? session.displayName
                    : "No care profile yet"}
              </div>
              {hasCareAccess && (
                <div
                  className="sr-only"
                  data-testid="care-context-banner"
                  aria-live="polite"
                >
                  {`Care for ${activeSpace.displayName}. You are ${session.displayName}, ${session.roleLabel}.`}
                </div>
              )}
              <div
                className="muted recipient-chip-role"
                data-testid="role-experience-badge"
              >
                {roleXp?.badge ??
                  (hasCareAccess ? "Care recipient" : "Authorization required")}
              </div>
            </div>
          </div>
          <span className="topbar-date">{todayDateLabel()}</span>
        </div>
        <div className="topbar-right">
          {lastError && (
            <span
              className="muted app-error-chip"
              data-testid="app-error"
              role="alert"
              title={lastError}
            >
              Connection issue
            </span>
          )}
          <button
            type="button"
            className="relay-drawer-toggle"
            data-testid="relay-open-mobile"
            aria-label={
              relayOpen ? "Focus Relay chat" : "Open Relay chat"
            }
            aria-expanded={relayOpen}
            onClick={() => openRelayForCareUpdate()}
          >
            <span className="relay-pulse" aria-hidden />
            Relay
          </button>
          <span
            className="session-label"
            data-testid="session-caregiver"
            title="Signed-in caregiver"
          >
            {session.displayName}
            <span className="muted session-role-sep">
              {" "}
              · {session.roleLabel}
            </span>
          </span>
          <div className="profile-menu-wrap">
            <button
              type="button"
              className="account-menu-trigger"
              data-testid="profile-menu-btn"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label={`Account menu for ${session.displayName}. Open to switch recipient or sign out.`}
              title={`${session.displayName} · ${session.roleLabel} · Account`}
              onClick={() => setProfileOpen((v) => !v)}
              onBlur={(e) => {
                // Dismiss when focus leaves menu
                if (
                  !e.currentTarget.parentElement?.contains(
                    e.relatedTarget as Node,
                  )
                ) {
                  window.setTimeout(() => setProfileOpen(false), 120);
                }
              }}
            >
              <span className="avatar-btn" aria-hidden>
                {(session.displayName[0] ?? "U").toUpperCase()}
              </span>
              <span
                className="account-menu-label"
                data-testid="account-menu-label"
              >
                Account
              </span>
            </button>
            {profileOpen && (
              <div
                className="profile-menu"
                role="menu"
                data-testid="profile-menu"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setProfileOpen(false);
                }}
              >
                <div className="profile-menu-head">
                  <strong>{session.displayName}</strong>
                  <span className="muted">{session.roleLabel}</span>
                  <span className="muted" data-testid="account-active-recipient">
                    Caring for {activeSpace.displayName}
                  </span>
                </div>
                <div className="profile-menu-section">
                  <div className="profile-menu-label">
                    {listAuthorizedCareSpaces(session.carePersonId).length > 0
                      ? "Switch care recipient"
                      : "Care access"}
                  </div>
                  {listAuthorizedCareSpaces(session.carePersonId).length ===
                    0 && (
                    <div
                      className="profile-menu-item muted"
                      data-testid="no-recipient-menu"
                    >
                      No authorized care recipients — use invitation or request
                      access
                    </div>
                  )}
                  {listAuthorizedCareSpaces(session.carePersonId).map((s) => (
                    <button
                      key={s.careRecipientId}
                      type="button"
                      role="menuitem"
                      className={
                        s.careRecipientId === activeRecipientId
                          ? "profile-menu-item is-active"
                          : "profile-menu-item"
                      }
                      data-testid={`switch-recipient-${s.careRecipientId}`}
                      onClick={() => switchRecipient(s.careRecipientId)}
                    >
                      {s.displayName}
                      {s.depth === "lightweight" ? " (demo)" : ""}
                    </button>
                  ))}
                  {listAuthorizedCareSpaces(session.carePersonId).length > 0 && (
                    <button
                      type="button"
                      role="menuitem"
                      className="profile-menu-item"
                      data-testid="manage-access-menu"
                      onClick={() => {
                        setProfileOpen(false);
                        setTab("people");
                      }}
                    >
                      Manage access
                    </button>
                  )}
                </div>
                {/* Privacy Center nav removed from caregiver shell until UX is coherent.
                    Server access-control / revoke / consent enforcement remains active. */}
                <button
                  type="button"
                  role="menuitem"
                  className="profile-menu-item profile-menu-item-danger"
                  data-testid="sign-out"
                  data-action-kind="destructive"
                  onClick={signOut}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              className="badge badge-coral"
              data-testid="unread-count"
              title="Open unread care notifications for this recipient"
              onClick={openNotifications}
              style={{
                border: "none",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              {unreadCount >= 99 ? "99+" : unreadCount} new
            </button>
          )}
          <span
            className={`connection-status${notifConnected ? "" : " is-offline"}`}
            title={
              notifConnected
                ? "Notification service reachable"
                : "Notification service reconnecting"
            }
            data-testid="connection-status"
            data-connected={notifConnected ? "true" : "false"}
          >
            <span className="connection-dot" aria-hidden />
            <span className="connection-label">
              {notifConnected ? "Connected" : "Reconnecting"}
            </span>
          </span>
        </div>
      </header>

      <SideNav
        tab={workspaceTab}
        onChange={onNavChange}
        roleExperience={roleXp}
      />

      <main className="workspace" aria-label={pageTitle}>
        <div className="workspace-inner" key={activeRecipientId} data-testid="active-recipient-surface" data-recipient={activeRecipientId}>
          {recipientSwitching && (
            <p className="muted" role="status" data-testid="recipient-switching">
              Switching care context to {activeSpace.displayName}…
            </p>
          )}
          {!hasCareAccess && (
            <AuthorizationGate displayName={session.displayName} />
          )}
          {hasCareAccess && workspaceTab === "today" && (
            <TodayPage
              relayHandled={relayHandled}
              onOpenHandoff={() => void openLatestHandoff()}
              onOpenRelay={openRelayForCareUpdate}
              refreshKey={todayRefresh}
              onReviewAttention={onReviewAttention}
            />
          )}
          {hasCareAccess && workspaceTab === "care" && (
            <CarePage focusKind={careFocus} />
          )}
          {hasCareAccess && workspaceTab === "people" && (
            <PeoplePage
              onMessagePerson={(personId) => {
                if (isSelfMessageTarget(personId, session.carePersonId)) {
                  // PeoplePage should already exclude self; hard guard.
                  return;
                }
                setCoordFocusPersonId(personId);
                setCoordFocusKey((k) => k + 1);
                setRelayOpen(true);
                // Scroll coordination into view (desktop rail / mobile drawer).
                window.requestAnimationFrame(() => {
                  document
                    .querySelector('[data-testid="relay-panel"]')
                    ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
                });
              }}
              onPrepareHandoff={() => void openLatestHandoff()}
              onOpenRelayForProvider={() => {
                setDraft("");
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `sys-provider-${Date.now()}`,
                    role: "system",
                    at: nowLabel(),
                    text: `Ask Relay to prepare a clinic update for Dr. Shah, or type what you want included about ${activeSpace.displayName}.`,
                  },
                ]);
                openRelay();
              }}
            />
          )}
          {hasCareAccess && workspaceTab === "documents" && <DocumentsPage />}
          {/* PrivacyCenterPage route intentionally not mounted in caregiver shell */}
          {hasCareAccess &&
            workspaceTab === "today" &&
            roleXp?.prefersClinical && <ClinicalSummaryPage />}
          {hasCareAccess && workspaceTab === "care" && <ConflictsPage />}

          {showHandoff && (
            <HandoffPanel
              onClose={() => setShowHandoff(false)}
              liveHandoff={liveHandoff ?? null}
              status="prepared"
              loading={handoffLoading}
              emptyReason={
                liveHandoff === null
                  ? `No care handoff has been saved for ${activeSpace.displayName} yet.`
                  : null
              }
            />
          )}
        </div>
      </main>

      {/*
        Relay scrim is visual-only on mobile (pointer-events: none in CSS).
        Must not intercept Mark seen / care actions (D-DURABLE-001).
        Profile scrim remains interactive modal dismiss.
      */}
      {relayOpen && (
        <div
          className="overlay-scrim"
          data-testid="relay-scrim"
          aria-hidden="true"
        />
      )}
      {profileOpen && (
        <div
          className="overlay-scrim profile-scrim"
          data-testid="profile-scrim"
          aria-hidden
          onClick={() => setProfileOpen(false)}
        />
      )}

      <RelayPanel
        open={relayOpen}
        messages={messages}
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={() => {
          if (recipientSwitching) return;
          void submitText(draft);
        }}
        onVoiceMeta={setVoiceMeta}
        busy={busy || recipientSwitching}
        correcting={correcting}
        bundle={bundle}
        confirmed={confirmed}
        onConfirm={() => {
          if (recipientSwitching) return;
          if (pendingOp && !bundle) {
            void executePendingOperational(pendingOp).then((msg) => {
              setPendingOp(null);
              setMessages((prev) => [
                ...prev,
                {
                  id: `sys-op-${Date.now()}`,
                  role: "relay",
                  text: humanCareLine(msg),
                  at: nowLabel(),
                },
              ]);
              setTodayRefresh((n) => n + 1);
            });
            return;
          }
          void confirmLooksRight();
        }}
        onCorrect={startCorrection}
        onCancelVerify={() => {
          setBundle(null);
          setPendingOp(null);
          setConfirmed(false);
          setCorrecting(false);
          setMessages((prev) => [
            ...prev,
            {
              id: `sys-cancel-${Date.now()}`,
              role: "system",
              text: "Draft cancelled. Nothing was saved or sent.",
              at: nowLabel(),
            },
          ]);
        }}
        onCloseMobile={() => setRelayOpen(false)}
        coordFocusPersonId={coordFocusPersonId}
        coordFocusKey={coordFocusKey}
        activeRecipientId={activeRecipientId}
        roleExperience={roleXp}
      />

      <BottomNav
        tab={tab === "relay" ? "relay" : workspaceTab}
        onChange={onNavChange}
        roleExperience={roleXp}
      />

      <footer className="status-bar">
        <span>
          {hasCareAccess
            ? `${session.displayName} · caring for ${activeSpace.displayName}`
            : `${session.displayName} · no care recipient connected`}
        </span>
        <span>Not medical advice · you verify care truth</span>
      </footer>
    </div>
  );
}
