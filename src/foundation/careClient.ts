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
  careHealth,
  careLabLogin,
  careToday,
  careUnderstand,
  getCareApiBaseUrl,
} from "./careHttpClient";

export type TranscriptMeta = {
  source?: "voice_stt" | "text";
  confidence?: number;
  language?: string;
  stt_provider?: string;
  needsReview?: boolean;
};

export {
  DEMO_UTTERANCE,
  UNSAFE_PROTOCOL_UTTERANCE,
  careRecipient,
  people,
  sadeilContext,
};

export type CareClientMode = "fixture" | "llm";

let runtime: { store: CareStore; service: CareLoopService } | null = null;
let httpToken: string | null = null;
let httpAvailable: boolean | null = null;
let lastBundleId: string | null = null;
let lastHttpBundle: VerificationBundle | null = null;
let transportUsed: "http" | "package" = "package";

function resolveMode(): CareClientMode {
  const env = import.meta.env?.VITE_CARE_MODE as string | undefined;
  if (env === "llm") return "llm";
  return "fixture";
}

function transportPref(): "http" | "package" | "auto" {
  const t = import.meta.env?.VITE_CARE_TRANSPORT as string | undefined;
  if (t === "http" || t === "package") return t;
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
  transportUsed = "package";
}

export function getEvidenceLabel(): {
  mode: EvidenceMode;
  label: string;
} {
  if (transportUsed === "http") {
    return {
      mode: "SYNTHETIC_FOUNDATION_BACKED",
      label: `HTTP FOUNDATION CARE API (${getCareApiBaseUrl()})`,
    };
  }
  const mode = resolveMode();
  if (mode === "fixture") {
    return {
      mode: "SYNTHETIC_FOUNDATION_BACKED",
      label: "PACKAGE FALLBACK (fixture understand)",
    };
  }
  return {
    mode: "LIVE_FOUNDATION_BACKED",
    label: "PACKAGE FALLBACK (LLM understand)",
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
      return {
        kind: "persisted",
        message: "Confirmed via Foundation care API.",
        evidenceMode:
          (res.data.evidence_mode as EvidenceMode) ??
          "SYNTHETIC_FOUNDATION_BACKED",
        auditIds: [],
        persisted: res.data.persisted as CareLoopResult["persisted"],
        currentState: res.data.current_state as CareLoopResult["currentState"],
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
  const { store } = getCareRuntime();
  const list = store.getHandoffs(careRecipient.id);
  return list[list.length - 1];
}

/** Prefer HTTP Today projection; fall back to package store / static seeds. */
export async function fetchTodayProjection(): Promise<{
  needsYou: string[];
  whatChanged: string[];
  handled: string[];
  next: string[];
  source: "http" | "package" | "static";
  storeBackend?: string;
}> {
  const useHttp = await ensureHttpSession();
  if (useHttp && httpToken) {
    const res = await careToday(httpToken, careRecipient.id);
    if (res.ok) {
      const t = res.data.today;
      return {
        needsYou: [
          ...(t.open_safety_reviews?.map((r) => r.reason) ?? []),
          ...(t.tasks
            ?.filter((x) => x.status === "pending")
            .map((x) => x.title) ?? []),
        ],
        whatChanged: [
          ...(t.events?.slice(-6).map((e) => e.statement) ?? []),
          ...(t.appointments
            ?.filter((a) => a.status === "moved")
            .map((a) => `${a.title}: ${a.startsAtLabel ?? a.status}`) ?? []),
        ],
        handled: t.latest_handoff?.whatChanged ?? [],
        next: t.latest_handoff?.stillNeedsAttention ?? [],
        source: "http",
        storeBackend: res.data.store_backend,
      };
    }
  }
  const state = getCareRuntime().store.getCurrentState(careRecipient.id);
  if (state && state.events.length > 0) {
    return {
      needsYou: state.openSafetyReviews.map((r) => r.reason),
      whatChanged: state.events.slice(-6).map((e) => e.statement),
      handled: state.handoffs.at(-1)?.whatChanged ?? [],
      next: state.handoffs.at(-1)?.stillNeedsAttention ?? [],
      source: "package",
    };
  }
  return {
    needsYou: ["Morning medication", "Physical therapy", "Confirm transportation"],
    whatChanged: [
      "Walter noticed more fatigue after lunch",
      "PT moved to 2:30 PM",
      "Maya confirmed tomorrow's visit",
    ],
    handled: ["Updated Maya", "Updated the schedule", "Saved yesterday's care summary"],
    next: ["Confirm transportation", "Evening medication at 7 PM"],
    source: "static",
  };
}

export function getAuditTrail() {
  const { store } = getCareRuntime();
  return store.listAudit({ careRecipientId: careRecipient.id });
}
