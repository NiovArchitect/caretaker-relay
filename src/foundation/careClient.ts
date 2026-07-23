/**
 * App → caretaker-relay-foundation care boundary.
 *
 * Preferred path: HTTP → Foundation care API (/api/v1/care/*).
 * Fallback: in-process @caretaker-relay/care-domain (explicitly labeled).
 *
 * VITE_CARE_TRANSPORT=http|package (default: try http then package)
 * VITE_CARE_API_URL=http://localhost:3100
 */

import {
  createCareRuntime,
  runCanonicalCareLoop,
  sadeilContext,
  DEMO_UTTERANCE,
  JUDGE_LOOP_UTTERANCE,
  UNSAFE_PROTOCOL_UTTERANCE,
  careRecipient,
  people,
  whoCanSeeWhat,
  type CareLoopResult,
  type CareLoopService,
  type CareStore,
  type EvidenceMode,
  type VerificationBundle,
  type BurdenMetrics,
  type AuthCareContext,
} from "@caretaker-relay/care-domain";
import {
  careConfirm,
  careCorrect,
  careHealth,
  careHandoffs,
  careLabLogin,
  careToday,
  careUnderstand,
} from "./careHttpClient";

export type TranscriptMeta = {
  source?: "voice_stt" | "text";
  confidence?: number;
  language?: string;
  stt_provider?: string;
  needsReview?: boolean;
};

export type TodayAttentionItem = {
  id: string;
  title: string;
  whatHappened: string;
  whySurfaced: string;
  relayKnows: string;
  relayDoesNotKnow: string;
  nextStep: string;
  kind: "medication" | "task" | "conflict" | "general";
};

export {
  DEMO_UTTERANCE,
  JUDGE_LOOP_UTTERANCE,
  UNSAFE_PROTOCOL_UTTERANCE,
  careRecipient,
  people,
  sadeilContext,
};

/** Canonical messy update for Track 1 judge loop demo affordance. */
export const JUDGE_DEMO_UTTERANCE = JUDGE_LOOP_UTTERANCE;

export type CareClientMode = "fixture" | "llm";

let runtime: { store: CareStore; service: CareLoopService } | null = null;
let httpToken: string | null = null;
let httpAvailable: boolean | null = null;
let lastBundleId: string | null = null;
let lastHttpBundle: VerificationBundle | null = null;
/** Last handoff id / payload from HTTP confirm (package store is not the HTTP store). */
let lastHttpHandoff: {
  id: string;
  whatChanged: string[];
  stillNeedsAttention: string[];
  watch: string[];
  sources: Array<{ label?: string; actorName?: string }>;
  evidenceMode?: string;
} | null = null;
let transportUsed: "http" | "package" = "package";

function resolveMode(): CareClientMode {
  const env = import.meta.env?.VITE_CARE_MODE as string | undefined;
  if (env === "llm") return "llm";
  return "fixture";
}

function transportPref(): "http" | "package" | "auto" {
  const t = import.meta.env?.VITE_CARE_TRANSPORT as string | undefined;
  if (t === "http" || t === "package") return t;
  // Vitest sets MODE=test — keep unit tests on in-process package path.
  if (import.meta.env?.MODE === "test") return "package";
  return "auto";
}

export function getCareRuntime() {
  if (!runtime) {
    runtime = createCareRuntime({
      mode: resolveMode(),
      seedOlivia: true,
    });
  }
  return runtime;
}

export function resetCareRuntimeForTests() {
  runtime = null;
  httpToken = null;
  httpAvailable = null;
  lastBundleId = null;
  lastHttpBundle = null;
  lastHttpHandoff = null;
  transportUsed = "package";
}

/**
 * Internal evidence label for tests/dev — do not surface raw strings in judge UI.
 */
export function getEvidenceLabel(): {
  mode: EvidenceMode;
  label: string;
  connected: boolean;
} {
  if (transportUsed === "http") {
    return {
      mode: "SYNTHETIC_FOUNDATION_BACKED",
      label: "connected",
      connected: true,
    };
  }
  const mode = resolveMode();
  if (mode === "fixture") {
    return {
      mode: "SYNTHETIC_FOUNDATION_BACKED",
      label: "local",
      connected: false,
    };
  }
  return {
    mode: "LIVE_FOUNDATION_BACKED",
    label: "connected",
    connected: true,
  };
}

async function ensureHttpSession(): Promise<boolean> {
  if (transportPref() === "package") {
    httpAvailable = false;
    return false;
  }
  if (httpAvailable === false) return false;
  if (httpToken) return true;
  const health = await careHealth();
  if (!health.ok) {
    httpAvailable = transportPref() === "http" ? false : false;
    return false;
  }
  const login = await careLabLogin(people.sadeil.id, "sadeil-lab-password");
  if (!login.ok) {
    httpAvailable = false;
    return false;
  }
  httpToken = login.data.token;
  httpAvailable = true;
  return true;
}

export async function proposeCareUpdate(
  text: string,
  ctx?: AuthCareContext,
  transcriptMeta?: TranscriptMeta,
): Promise<CareLoopResult> {
  const useHttp = await ensureHttpSession();
  if (useHttp && httpToken) {
    transportUsed = "http";
    const res = await careUnderstand(httpToken, text, careRecipient.id, {
      mode: resolveMode(),
      transcriptMeta,
    });
    if (res.ok && res.data.kind === "refusal") {
      return {
        kind: "refusal",
        message: res.data.message ?? "Refused",
        evidenceMode: (res.data.evidence_mode as EvidenceMode) ?? "FIXTURE",
        auditIds: [],
      };
    }
    if (res.ok && res.data.kind === "verify" && res.data.bundle) {
      lastBundleId = res.data.verification_bundle_id ?? null;
      lastHttpBundle = res.data.bundle as VerificationBundle;
      return {
        kind: "verify",
        bundle: lastHttpBundle,
        evidenceMode: (res.data.evidence_mode as EvidenceMode) ?? "FIXTURE",
        auditIds: [],
      };
    }
    if (transportPref() === "http") {
      return {
        kind: "refusal",
        message: res.ok === false ? res.message : "Understand failed over HTTP",
        evidenceMode: "SYNTHETIC_FOUNDATION_BACKED",
        auditIds: [],
      };
    }
    // fall through to package
  }

  transportUsed = "package";
  const { service } = getCareRuntime();
  return service.proposeFromInput(text, ctx ?? sadeilContext());
}

export function confirmCareUpdate(
  bundle: VerificationBundle,
  ctx?: AuthCareContext,
): CareLoopResult {
  // Sync API kept for existing UI; prefer confirmCareUpdateAsync when HTTP.
  const { service } = getCareRuntime();
  return service.confirmAndPersist(bundle, ctx ?? sadeilContext(), {
    prepareHandoffForPersonId: people.maya.id,
  });
}

/** Prefer this for HTTP path (idempotent durable confirm). */
export async function confirmCareUpdateAsync(
  bundle: VerificationBundle,
  ctx?: AuthCareContext,
): Promise<CareLoopResult> {
  if (
    transportUsed === "http" &&
    httpToken &&
    lastBundleId &&
    lastHttpBundle === bundle
  ) {
    const key = `ui-confirm-${lastBundleId}`;
    const res = await careConfirm(httpToken, lastBundleId, key);
    if (res.ok && res.data.kind === "persisted") {
      const persisted = res.data.persisted as CareLoopResult["persisted"];
      const currentState = res.data.current_state as CareLoopResult["currentState"];
      // Capture handoff for UI (HTTP store ≠ package MemoryCareStore).
      const handoffs = (
        currentState as { handoffs?: Array<Record<string, unknown>> } | undefined
      )?.handoffs;
      const last = handoffs?.[handoffs.length - 1];
      if (last && typeof last.id === "string") {
        lastHttpHandoff = {
          id: last.id,
          whatChanged: (last.whatChanged as string[]) ?? [],
          stillNeedsAttention: (last.stillNeedsAttention as string[]) ?? [],
          watch: (last.watch as string[]) ?? [],
          sources: (last.sources as Array<{ label?: string; actorName?: string }>) ?? [],
          evidenceMode:
            typeof last.evidenceMode === "string"
              ? last.evidenceMode
              : "SYNTHETIC_FOUNDATION_BACKED",
        };
      } else if (persisted?.handoffId && httpToken) {
        const ho = await careHandoffs(httpToken, careRecipient.id);
        if (ho.ok) {
          const list = (ho.data as { handoffs?: Array<Record<string, unknown>> })
            .handoffs;
          const found = list?.find((h) => h.id === persisted.handoffId) ?? list?.at(-1);
          if (found) {
            lastHttpHandoff = {
              id: String(found.id),
              whatChanged: (found.whatChanged as string[]) ?? [],
              stillNeedsAttention: (found.stillNeedsAttention as string[]) ?? [],
              watch: (found.watch as string[]) ?? [],
              sources:
                (found.sources as Array<{ label?: string; actorName?: string }>) ??
                [],
              evidenceMode:
                typeof found.evidenceMode === "string"
                  ? found.evidenceMode
                  : "SYNTHETIC_FOUNDATION_BACKED",
            };
          }
        }
      }
      return {
        kind: "persisted",
        message: "Confirmed via Foundation care API.",
        evidenceMode:
          (res.data.evidence_mode as EvidenceMode) ??
          "SYNTHETIC_FOUNDATION_BACKED",
        auditIds: [],
        persisted,
        currentState,
      };
    }
  }
  return confirmCareUpdate(bundle, ctx);
}

export async function runDemoCanonicalLoop(): Promise<{
  propose: CareLoopResult;
  persist?: CareLoopResult;
  burden?: BurdenMetrics;
}> {
  const { service } = getCareRuntime();
  return runCanonicalCareLoop(service, DEMO_UTTERANCE, sadeilContext());
}

export function getWhoCanSeeWhat() {
  const { store } = getCareRuntime();
  return whoCanSeeWhat(store, careRecipient.id);
}

export function getCurrentCareState() {
  const { store } = getCareRuntime();
  return store.getCurrentState(careRecipient.id);
}

export function getLatestHandoff() {
  if (transportUsed === "http" && lastHttpHandoff) {
    return {
      id: lastHttpHandoff.id,
      careRecipientId: careRecipient.id,
      whatChanged: lastHttpHandoff.whatChanged,
      stillNeedsAttention: lastHttpHandoff.stillNeedsAttention,
      watch: lastHttpHandoff.watch.length
        ? lastHttpHandoff.watch
        : ["No new watch items"],
      sources: lastHttpHandoff.sources.map((s, i) => ({
        id: `src-http-${i}`,
        kind: "caregiver_text" as const,
        label: s.label ?? "Care update",
        actorName: s.actorName,
        recordedAt: new Date().toISOString(),
        whyVisible: "Shared in today's care continuity picture.",
      })),
      evidenceMode:
        (lastHttpHandoff.evidenceMode as EvidenceMode) ??
        "SYNTHETIC_FOUNDATION_BACKED",
      createdAt: new Date().toISOString(),
    };
  }
  const { store } = getCareRuntime();
  const list = store.getHandoffs(careRecipient.id);
  return list[list.length - 1];
}

function buildAttentionFromLines(lines: string[]): TodayAttentionItem[] {
  return lines.map((line, i) => {
    const med = /medication|dose|pill|mg|med\b/i.test(line);
    return {
      id: `att-${i}-${line.slice(0, 24)}`,
      title: med ? "Medication needs verification" : line,
      whatHappened: line,
      whySurfaced: med
        ? "What was reported does not safely match the current care information — or is too ambiguous to confirm."
        : "This still needs your judgment or action.",
      relayKnows: med
        ? "A medication-related report was captured from a caregiver update."
        : "Listed as open on Evelyn's day.",
      relayDoesNotKnow: med
        ? "Relay will not invent or choose a dose."
        : "Whether it is already fully resolved off-app.",
      nextStep: "Review",
      kind: med ? "medication" : "task",
    };
  });
}

/** Prefer HTTP Today projection; fall back to package store / static seeds. */
export async function fetchTodayProjection(): Promise<{
  needsYou: string[];
  attention: TodayAttentionItem[];
  whatChanged: string[];
  handled: string[];
  next: string[];
  source: "http" | "package" | "static";
  storeBackend?: string;
  organizedCount?: number;
}> {
  const useHttp = await ensureHttpSession();
  if (useHttp && httpToken) {
    const res = await careToday(httpToken, careRecipient.id);
    if (res.ok) {
      const t = res.data.today;
      const needsYou = [
        ...(t.open_safety_reviews?.map((r) => r.reason) ?? []),
        ...(t.tasks
          ?.filter((x) => x.status === "pending")
          .map((x) => x.title) ?? []),
      ];
      const whatChanged = [
        ...(t.events?.slice(-6).map((e) => e.statement) ?? []),
        ...(t.appointments
          ?.filter((a) => a.status === "moved")
          .map((a) => `${a.title}: ${a.startsAtLabel ?? a.status}`) ?? []),
      ];
      const handled =
        t.latest_handoff?.whatChanged ??
        t.events
          ?.filter((e) => /maya|meal|breakfast|blood pressure/i.test(e.statement))
          .slice(-4)
          .map((e) => e.statement) ??
        [];
      return {
        needsYou,
        attention: buildAttentionFromLines(needsYou),
        whatChanged,
        handled:
          handled.length > 0
            ? handled
            : ["Maya can be kept in the loop when you confirm updates"],
        next:
          t.latest_handoff?.stillNeedsAttention?.length
            ? t.latest_handoff.stillNeedsAttention
            : ["Evening medication at 7 PM", "Confirm transportation if needed"],
        source: "http",
        storeBackend: res.data.store_backend,
        organizedCount: whatChanged.length,
      };
    }
  }
  const state = getCareRuntime().store.getCurrentState(careRecipient.id);
  if (state && state.events.length > 0) {
    const needsYou = state.openSafetyReviews.map((r) => r.reason);
    const whatChanged = state.events.slice(-6).map((e) => e.statement);
    return {
      needsYou,
      attention: buildAttentionFromLines(needsYou),
      whatChanged,
      handled: state.handoffs.at(-1)?.whatChanged ?? [],
      next: state.handoffs.at(-1)?.stillNeedsAttention ?? [],
      source: "package",
      organizedCount: whatChanged.length,
    };
  }
  const seedNeeds = [
    "Medication needs verification — morning report may not match care instructions",
    "Confirm transportation for therapy",
  ];
  return {
    needsYou: seedNeeds,
    attention: [
      {
        id: "seed-med",
        title: "Medication needs verification",
        whatHappened:
          "A medication report is on Evelyn's day that may not safely match current care instructions.",
        whySurfaced:
          "Medication amounts must be checked by a person. Relay does not choose doses.",
        relayKnows: "There is an authorized lunch medication on file from Dr. Shah.",
        relayDoesNotKnow:
          "Whether a reported amount matches that instruction until you review.",
        nextStep: "Review",
        kind: "medication",
      },
      {
        id: "seed-transport",
        title: "Confirm transportation",
        whatHappened: "Transportation for therapy is still open.",
        whySurfaced: "It still needs a decision or update from you.",
        relayKnows: "It is on today's list.",
        relayDoesNotKnow: "Whether someone already arranged it off-app.",
        nextStep: "Review when you can.",
        kind: "task",
      },
    ],
    whatChanged: [
      "Evelyn slept poorly and reported dizziness this morning",
      "Physical therapy was moved to 2:30 PM",
      "Maya confirmed she can help later",
    ],
    handled: [
      "Maya knows about the appointment change (prepared update)",
      "Breakfast and morning notes can be logged when you confirm",
    ],
    next: ["Confirm transportation", "Evening medication at 7 PM"],
    source: "static",
    organizedCount: 3,
  };
}

/** Apply correction using HTTP or package domain path. */
export async function applyCareCorrection(
  targetEventId: string,
  correctedValue: string,
  ctx?: AuthCareContext,
): Promise<CareLoopResult> {
  const auth = ctx ?? sadeilContext();
  if (transportUsed === "http" && httpToken) {
    const res = await careCorrect(
      httpToken,
      targetEventId,
      correctedValue,
      careRecipient.id,
    );
    if (res.ok) {
      return {
        kind: (res.data.kind as CareLoopResult["kind"]) ?? "persisted",
        message:
          res.data.message ??
          "Correction saved. Previous evidence was preserved.",
        evidenceMode:
          (res.data.evidence_mode as EvidenceMode) ??
          "SYNTHETIC_FOUNDATION_BACKED",
        auditIds: [],
        persisted: res.data.persisted as CareLoopResult["persisted"],
      };
    }
    return {
      kind: "refusal",
      message: res.message ?? "Correction failed",
      evidenceMode: "SYNTHETIC_FOUNDATION_BACKED",
      auditIds: [],
    };
  }
  const { service } = getCareRuntime();
  return service.applyCorrection(targetEventId, correctedValue, auth);
}

/** Simple care-context Q&A over current projection (no chat bot fiction). */
export async function answerCareQuestion(question: string): Promise<string> {
  const raw = question.trim();
  const q = raw.toLowerCase();
  // Only clear interrogatives — never intercept multi-fact care updates
  // (e.g. "Let Maya know" inside a care statement must still hit understand).
  const looksLikeQuestion =
    /\?$/.test(raw) ||
    /^(what|when|where|why|who|how|summarize|summary)\b/i.test(raw) ||
    /^(can you )?(tell me |show me )?(what|when|where|why|who|how)\b/i.test(
      raw,
    );
  if (!looksLikeQuestion) return "";

  const proj = await fetchTodayProjection();
  if (/what changed|since this morning|since yesterday/.test(q)) {
    if (proj.whatChanged.length === 0) {
      return `I don't have new confirmed changes for ${careRecipient.displayName} yet. Tell me what happened and I'll organize it.`;
    }
    return `Here's what changed for ${careRecipient.displayName}:\n${proj.whatChanged.map((l) => `• ${l}`).join("\n")}`;
  }
  if (/still need|outstanding|left to do|needs me|need to happen/.test(q)) {
    const lines =
      proj.attention.length > 0
        ? proj.attention.map((a) => a.title)
        : proj.needsYou;
    if (lines.length === 0) {
      return "Nothing is flagged as needing your attention right now.";
    }
    return `Still needs attention:\n${lines.map((l) => `• ${l}`).join("\n")}`;
  }
  if (/what should maya|tell maya|for maya|maya know/.test(q)) {
    const handoff = getLatestHandoff();
    if (handoff?.whatChanged?.length) {
      return `For Maya, here's the continuity picture:\n${handoff.whatChanged.map((l) => `• ${l}`).join("\n")}\n\nThis is prepared for review — not automatically sent as a message.`;
    }
    return "I can prepare an update for Maya after you confirm a care update. Tell me what happened today.";
  }
  if (/appointment|pt|physical therapy|next appointment/.test(q)) {
    const hit = proj.whatChanged.find((l) =>
      /pt|therapy|appointment|maya visit|2:30|3:00/i.test(l),
    );
    return hit
      ? `Schedule note: ${hit}`
      : "I don't have a confirmed appointment change on file yet. You can tell me if something moved.";
  }
  if (/summarize|summary|the day/.test(q)) {
    return [
      `Day picture for ${careRecipient.displayName}:`,
      proj.attention[0]
        ? `Needs you: ${proj.attention[0].title}`
        : "Needs you: nothing urgent flagged",
      `Changed: ${proj.whatChanged.slice(0, 3).join("; ") || "none yet"}`,
      `Handled: ${proj.handled.slice(0, 2).join("; ") || "none yet"}`,
    ].join("\n");
  }
  if (/why.*(confirm|check|verify)|where did this/.test(q)) {
    return "I ask you to confirm when something is consequential — especially medication — so we don't turn a guess into care truth. Sources stay attached to what we save.";
  }
  // Not a known question shape — return empty so caller can run understand path
  return "";
}

export function getAuditTrail() {
  const { store } = getCareRuntime();
  return store.listAudit({ careRecipientId: careRecipient.id });
}

export function getTransportUsed() {
  return transportUsed;
}
