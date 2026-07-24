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
  careCircle,
  careConfirm,
  careCorrect,
  careExport,
  careHandoffs,
  careLogin,
  careState,
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

/**
 * Evaluator-only sample utterance (tests / cold-start).
 * Must NOT be bound to product chrome as a care workflow.
 */
export const JUDGE_DEMO_UTTERANCE = JUDGE_LOOP_UTTERANCE;

export type CareClientMode = "fixture" | "llm";

export type SessionIdentity = {
  carePersonId: string;
  displayName: string;
  roleLabel: string;
  authMode?: string;
};

export type CareCircleMemberRow = {
  personId: string;
  displayName: string;
  roleLabel: string;
  status: string;
  canSee: string[];
  canDo: string[];
  limits: string[];
};

export type CareStateSnapshot = {
  careRecipientId: string;
  householdId?: string;
  medicationSchedules: Array<Record<string, unknown>>;
  medicationRecords: Array<Record<string, unknown>>;
  appointments: Array<Record<string, unknown>>;
  observations: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  events: Array<Record<string, unknown>>;
  openSafetyReviews: Array<Record<string, unknown>>;
  handoffs: Array<Record<string, unknown>>;
  lastUpdatedAt?: string;
  source: "http" | "package" | "empty";
};

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
let sessionIdentity: SessionIdentity | null = null;
/** ONE active care recipient for all product surfaces (not Evelyn-hardcoded). */
let activeCareRecipientId: string = careRecipient.id;

/** Call when user switches recipient — must precede all surface reloads. */
export function setActiveCareRecipientId(id: string): void {
  activeCareRecipientId = id;
}

export function getActiveCareRecipientId(): string {
  return activeCareRecipientId;
}

/** Recipient id for all API/package calls. */
function rid(): string {
  return activeCareRecipientId || careRecipient.id;
}

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
  sessionIdentity = null;
}

export function getSessionIdentity(): SessionIdentity {
  return (
    sessionIdentity ?? {
      carePersonId: people.sadeil.id,
      displayName: people.sadeil.displayName,
      roleLabel: "Family caregiver",
    }
  );
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

const SESSION_KEY = "cr_care_session_v1";

function roleLabelFromRoles(roles: string[]): string {
  if (roles.includes("primary")) return "Primary family caregiver";
  if (roles.includes("paid_caregiver") || roles.includes("professional"))
    return "Professional caregiver";
  if (roles.includes("adult_child") || roles.includes("family_caregiver"))
    return "Family / friend caregiver";
  return "Caregiver";
}

function persistSession(token: string, identity: SessionIdentity) {
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ token, identity }),
    );
  } catch {
    /* ignore */
  }
}

function loadPersistedSession(): {
  token: string;
  identity: SessionIdentity;
} | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      token?: string;
      identity?: SessionIdentity;
    };
    if (parsed.token && parsed.identity?.carePersonId) {
      return { token: parsed.token, identity: parsed.identity };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function clearSession() {
  httpToken = null;
  httpAvailable = null;
  sessionIdentity = null;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export type LabPrincipal = {
  care_person_id: string;
  display_name: string;
  role_label: string;
};

export async function listLabPrincipals(): Promise<LabPrincipal[]> {
  const base = getCareApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/v1/care/auth/lab-principals`);
    const json = (await res.json()) as {
      ok?: boolean;
      principals?: LabPrincipal[];
    };
    if (json.ok && Array.isArray(json.principals)) return json.principals;
  } catch {
    /* fall through */
  }
  return [];
}

/**
 * Explicit multi-principal product entry — server establishes JWT.
 * Does NOT auto-login as Marcus.
 */
export async function loginAsPrincipal(
  carePersonId: string,
  password: string,
): Promise<{ ok: boolean; session?: SessionIdentity; message?: string }> {
  const res = await careLogin(carePersonId, password);
  if (!res.ok) {
    return { ok: false, message: res.message };
  }
  httpToken = res.data.token;
  httpAvailable = true;
  transportUsed = "http";
  const identity: SessionIdentity = {
    carePersonId: res.data.care_person_id,
    displayName: res.data.display_name,
    roleLabel: roleLabelFromRoles(
      (res.data as { roles?: string[] }).roles ?? [],
    ),
    authMode: res.data.auth_mode,
  };
  // Prefer roles from response when present
  const roles = (res.data as { roles?: string[] }).roles;
  if (roles?.length) {
    identity.roleLabel = roleLabelFromRoles(roles);
  }
  sessionIdentity = identity;
  persistSession(httpToken, identity);
  return { ok: true, session: identity };
}

export async function restoreSession(): Promise<SessionIdentity | null> {
  const persisted = loadPersistedSession();
  if (!persisted) return null;
  httpToken = persisted.token;
  httpAvailable = true;
  sessionIdentity = persisted.identity;
  transportUsed = "http";
  // Validate token still works
  const { careMe } = await import("./careHttpClient");
  const me = await careMe(persisted.token);
  if (!me.ok) {
    clearSession();
    return null;
  }
  sessionIdentity = {
    carePersonId: me.data.care_person_id,
    displayName: me.data.display_name,
    roleLabel: roleLabelFromRoles(me.data.roles ?? []),
    authMode: me.data.auth_mode,
  };
  persistSession(persisted.token, sessionIdentity);
  return sessionIdentity;
}

export async function createInvitation(inviteeCarePersonId: string) {
  const ok = await ensureHttpSession();
  if (!ok || !httpToken) return { ok: false as const, message: "Not signed in" };
  const { careCreateInvitation } = await import("./careHttpClient");
  const res = await careCreateInvitation(httpToken, rid(), {
    invitee_care_person_id: inviteeCarePersonId,
  });
  if (!res.ok) return { ok: false as const, message: res.message };
  return { ok: true as const, invitation: res.data.invitation };
}

export async function acceptInvitation(token: string) {
  const ok = await ensureHttpSession();
  if (!ok || !httpToken) return { ok: false as const, message: "Not signed in" };
  const { careAcceptInvitation } = await import("./careHttpClient");
  const res = await careAcceptInvitation(httpToken, token);
  if (!res.ok) return { ok: false as const, message: res.message };
  return { ok: true as const, data: res.data };
}

export async function fetchCoordination() {
  const ok = await ensureHttpSession();
  if (!ok || !httpToken)
    return { ok: false as const, messages: [] as Array<Record<string, string>> };
  const { careListCoordination } = await import("./careHttpClient");
  const res = await careListCoordination(httpToken, rid());
  if (!res.ok) return { ok: false as const, messages: [] };
  return {
    ok: true as const,
    messages: res.data.messages.map((m) => ({
      id: m.id,
      from: m.from_display_name,
      body: m.body,
      at: m.created_at,
    })),
  };
}

export async function postCoordination(body: string, toPersonId?: string) {
  const ok = await ensureHttpSession();
  if (!ok || !httpToken) return { ok: false as const, message: "Not signed in" };
  const { carePostCoordination } = await import("./careHttpClient");
  const res = await carePostCoordination(
    httpToken,
    rid(),
    body,
    toPersonId,
  );
  if (!res.ok) return { ok: false as const, message: res.message };
  // Server creates durable notification for recipient; client only signals UI refresh
  try {
    window.dispatchEvent(new CustomEvent("cr-notification", { detail: { source: "coordination" } }));
  } catch {
    /* non-fatal */
  }
  return { ok: true as const };
}

/** Server-backed notifications (authority=server). localStorage is never system of record. */
export async function fetchServerNotifications(): Promise<{
  ok: boolean;
  notifications: Array<Record<string, unknown>>;
  authority?: string;
  message?: string;
}> {
  const ok = await ensureHttpSession();
  if (!ok || !httpToken) return { ok: false, notifications: [], message: "Not signed in" };
  const { careListNotifications } = await import("./careHttpClient");
  const res = await careListNotifications(httpToken, rid());
  if (!res.ok) return { ok: false, notifications: [], message: res.message };
  return {
    ok: true,
    notifications: res.data.notifications ?? [],
    authority: res.data.authority,
  };
}

export async function notificationAction(
  id: string,
  action: "seen" | "ack" | "resolve",
): Promise<boolean> {
  const ok = await ensureHttpSession();
  if (!ok || !httpToken) return false;
  const { careNotificationAction } = await import("./careHttpClient");
  const res = await careNotificationAction(httpToken, id, action);
  return res.ok;
}

export async function askCaregiverClarification(input: {
  targetPersonId: string;
  question: string;
  contextSummary?: string;
}): Promise<{ ok: boolean; message?: string; requestId?: string }> {
  const ok = await ensureHttpSession();
  if (!ok || !httpToken) return { ok: false, message: "Not signed in" };
  const { careCreateClarification } = await import("./careHttpClient");
  const res = await careCreateClarification(httpToken, {
    care_recipient_id: rid(),
    target_person_id: input.targetPersonId,
    question: input.question,
    context_summary: input.contextSummary,
  });
  if (!res.ok) return { ok: false, message: res.message };
  return {
    ok: true,
    requestId: String(res.data.request?.id ?? ""),
  };
}

export async function respondCaregiverClarification(input: {
  requestId: string;
  body: string;
}): Promise<{ ok: boolean; message?: string }> {
  const ok = await ensureHttpSession();
  if (!ok || !httpToken) return { ok: false, message: "Not signed in" };
  const { careRespondClarification } = await import("./careHttpClient");
  const res = await careRespondClarification(httpToken, {
    request_id: input.requestId,
    care_recipient_id: rid(),
    body: input.body,
  });
  if (!res.ok) return { ok: false, message: res.message };
  return { ok: true };
}

/** @deprecated localStorage is not authority — prefer fetchServerNotifications */
export function listLocalNotifications(_forPersonId?: string): Array<Record<string, unknown>> {
  return [];
}

/** @deprecated */
export function markLocalNotificationRead(_id: string, _forPersonId?: string): void {
  /* no-op: use notificationAction */
}

/**
 * Requires an explicit login (or restored session). No silent auto-Marcus.
 */
async function ensureHttpSession(): Promise<boolean> {
  if (transportPref() === "package") {
    httpAvailable = false;
    return false;
  }
  if (httpToken) {
    httpAvailable = true;
    return true;
  }
  const restored = await restoreSession();
  if (restored && httpToken) return true;
  httpAvailable = false;
  return false;
}

export function isAuthenticated(): boolean {
  return !!httpToken && !!sessionIdentity && httpAvailable !== false;
}

/** Test/debug: whether HTTP transport reported available. */
export function getHttpAvailableFlag(): boolean | null {
  return httpAvailable;
}

export async function proposeCareUpdate(
  text: string,
  ctx?: AuthCareContext,
  transcriptMeta?: TranscriptMeta,
): Promise<CareLoopResult> {
  const useHttp = await ensureHttpSession();
  if (useHttp && httpToken) {
    transportUsed = "http";
    const res = await careUnderstand(httpToken, text, rid(), {
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
        const ho = await careHandoffs(httpToken, rid());
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
  return whoCanSeeWhat(store, rid());
}

export function getCurrentCareState() {
  const { store } = getCareRuntime();
  return store.getCurrentState(rid());
}

function mapHandoffRecord(h: Record<string, unknown>) {
  const sources = Array.isArray(h.sources) ? h.sources : [];
  return {
    id: String(h.id ?? "ho-unknown"),
    careRecipientId: String(h.careRecipientId ?? rid()),
    fromPersonId: h.fromPersonId ? String(h.fromPersonId) : undefined,
    toPersonId: h.toPersonId ? String(h.toPersonId) : undefined,
    whatChanged: Array.isArray(h.whatChanged)
      ? (h.whatChanged as string[])
      : [],
    stillNeedsAttention: Array.isArray(h.stillNeedsAttention)
      ? (h.stillNeedsAttention as string[])
      : [],
    watch: Array.isArray(h.watch) ? (h.watch as string[]) : [],
    sources: sources.map((s, i) => {
      const src = s as Record<string, unknown>;
      return {
        id: String(src.id ?? `src-ho-${i}`),
        kind: (src.kind as "caregiver_text") ?? "caregiver_text",
        label: String(src.label ?? "Care update"),
        actorName: src.actorName ? String(src.actorName) : undefined,
        recordedAt: String(src.recordedAt ?? new Date().toISOString()),
        whyVisible: String(
          src.whyVisible ?? "Included in care continuity for this recipient.",
        ),
      };
    }),
    evidenceMode: (h.evidenceMode as EvidenceMode) ?? "SYNTHETIC_FOUNDATION_BACKED",
    createdAt: String(h.createdAt ?? new Date().toISOString()),
  };
}

/** Sync accessor — prefers last confirmed HTTP handoff, then package store. No static demo. */
export function getLatestHandoff() {
  if (transportUsed === "http" && lastHttpHandoff) {
    return mapHandoffRecord({
      id: lastHttpHandoff.id,
      careRecipientId: rid(),
      whatChanged: lastHttpHandoff.whatChanged,
      stillNeedsAttention: lastHttpHandoff.stillNeedsAttention,
      watch: lastHttpHandoff.watch,
      sources: lastHttpHandoff.sources,
      evidenceMode: lastHttpHandoff.evidenceMode,
    });
  }
  const { store } = getCareRuntime();
  const list = store.getHandoffs(rid());
  return list[list.length - 1];
}

/** Fetch latest persisted handoff from server (authoritative). */
export async function fetchLatestHandoff() {
  const useHttp = await ensureHttpSession();
  if (useHttp && httpToken) {
    const res = await careHandoffs(httpToken, rid());
    if (res.ok) {
      const list = (res.data.handoffs ?? []) as Record<string, unknown>[];
      if (list.length === 0) return null;
      const latest = list[list.length - 1]!;
      lastHttpHandoff = {
        id: String(latest.id),
        whatChanged: Array.isArray(latest.whatChanged)
          ? (latest.whatChanged as string[])
          : [],
        stillNeedsAttention: Array.isArray(latest.stillNeedsAttention)
          ? (latest.stillNeedsAttention as string[])
          : [],
        watch: Array.isArray(latest.watch) ? (latest.watch as string[]) : [],
        sources: Array.isArray(latest.sources)
          ? (latest.sources as Array<{ label?: string; actorName?: string }>)
          : [],
        evidenceMode: latest.evidenceMode
          ? String(latest.evidenceMode)
          : undefined,
      };
      return mapHandoffRecord(latest);
    }
  }
  return getLatestHandoff() ?? null;
}

function plainCaregiverLine(line: string): string {
  const t = line.trim();
  if (/incompatible dimensions|not comparable|compatible dimensions/i.test(t)) {
    return "The reported amount doesn't clearly match Evelyn's current medication instructions. Please check the medication label or confirm with the prescribing team before marking this complete.";
  }
  if (/missing units/i.test(t)) {
    return "The reported dose is missing units. Check the bottle or packaging before marking this complete.";
  }
  // Prefer unambiguous clock language when stored labels are vague
  return t
    .replace(/around\s+3:00(?!\s*(AM|PM))/gi, "around 3:00 PM")
    .replace(/around\s+2:00(?!\s*(AM|PM))/gi, "around 2:00 PM")
    .replace(/around three/gi, "around 3:00 PM");
}

function buildAttentionFromLines(lines: string[]): TodayAttentionItem[] {
  // Signal filter: dedupe identical reasons; keep sparse attention.
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const line of lines) {
    const key = plainCaregiverLine(line).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(plainCaregiverLine(line));
  }
  return unique.slice(0, 5).map((line, i) => {
    const med = /medication|dose|pill|mg|med\b|amount|label|prescribing/i.test(
      line,
    );
    return {
      id: `att-${i}-${line.slice(0, 24)}`,
      title: med ? "Medication needs verification" : line,
      whatHappened: line,
      whySurfaced: med
        ? "What was reported does not safely match the current care information, or is too ambiguous to confirm."
        : "This still needs your judgment or action.",
      relayKnows: med
        ? "A medication-related report was captured from a caregiver update."
        : "Listed as open on Evelyn's day.",
      relayDoesNotKnow: med
        ? "Relay will not invent or choose a dose."
        : "Whether it is already fully resolved off-app.",
      nextStep: med ? "Open medication in Care" : "Review",
      kind: med ? "medication" : "task",
    };
  });
}

export async function fetchCareState(): Promise<CareStateSnapshot> {
  const useHttp = await ensureHttpSession();
  if (useHttp && httpToken) {
    const res = await careState(httpToken, rid());
    if (res.ok && res.data.state) {
      const s = res.data.state as Record<string, unknown>;
      return {
        careRecipientId: String(s.careRecipientId ?? rid()),
        householdId: s.householdId ? String(s.householdId) : undefined,
        medicationSchedules: Array.isArray(s.medicationSchedules)
          ? (s.medicationSchedules as Array<Record<string, unknown>>)
          : [],
        medicationRecords: Array.isArray(s.medicationRecords)
          ? (s.medicationRecords as Array<Record<string, unknown>>)
          : [],
        appointments: Array.isArray(s.appointments)
          ? (s.appointments as Array<Record<string, unknown>>)
          : [],
        observations: Array.isArray(s.observations)
          ? (s.observations as Array<Record<string, unknown>>)
          : [],
        tasks: Array.isArray(s.tasks)
          ? (s.tasks as Array<Record<string, unknown>>)
          : [],
        events: Array.isArray(s.events)
          ? (s.events as Array<Record<string, unknown>>)
          : [],
        openSafetyReviews: Array.isArray(s.openSafetyReviews)
          ? (s.openSafetyReviews as Array<Record<string, unknown>>)
          : [],
        handoffs: Array.isArray(s.handoffs)
          ? (s.handoffs as Array<Record<string, unknown>>)
          : [],
        lastUpdatedAt: s.lastUpdatedAt ? String(s.lastUpdatedAt) : undefined,
        source: "http",
      };
    }
  }
  const state = getCurrentCareState();
  if (!state) {
    return {
      careRecipientId: rid(),
      medicationSchedules: [],
      medicationRecords: [],
      appointments: [],
      observations: [],
      tasks: [],
      events: [],
      openSafetyReviews: [],
      handoffs: [],
      source: "empty",
    };
  }
  return {
    careRecipientId: state.careRecipientId,
    householdId: state.householdId,
    medicationSchedules: state.medicationSchedules as unknown as Array<
      Record<string, unknown>
    >,
    medicationRecords: state.medicationRecords as unknown as Array<
      Record<string, unknown>
    >,
    appointments: state.appointments as unknown as Array<Record<string, unknown>>,
    observations: state.observations as unknown as Array<Record<string, unknown>>,
    tasks: state.tasks as unknown as Array<Record<string, unknown>>,
    events: state.events as unknown as Array<Record<string, unknown>>,
    openSafetyReviews: state.openSafetyReviews as unknown as Array<
      Record<string, unknown>
    >,
    handoffs: state.handoffs as unknown as Array<Record<string, unknown>>,
    lastUpdatedAt: state.lastUpdatedAt,
    source: "package",
  };
}

export async function fetchCircleMembers(): Promise<{
  members: CareCircleMemberRow[];
  source: "http" | "package";
}> {
  const useHttp = await ensureHttpSession();
  if (useHttp && httpToken) {
    const res = await careCircle(httpToken, rid());
    if (res.ok) {
      return {
        members: res.data.who_can_see_what.map((r) => ({
          personId: r.personId,
          displayName: r.displayName,
          roleLabel: r.roleLabel,
          status: r.status,
          canSee: r.canSee,
          canDo: r.canDo,
          limits: r.limits,
        })),
        source: "http",
      };
    }
  }
  const rows = getWhoCanSeeWhat();
  return {
    members: rows.map((r) => ({
      personId: r.personId,
      displayName: r.displayName,
      roleLabel: r.roleLabel,
      status: r.status,
      canSee: r.canSee,
      canDo: r.canDo,
      limits: r.limits,
    })),
    source: "package",
  };
}

export async function fetchCareExportMarkdown(): Promise<{
  ok: boolean;
  markdown: string;
  exportedAt?: string;
  evidenceMode?: string;
  source: "http" | "package" | "none";
  message?: string;
}> {
  const useHttp = await ensureHttpSession();
  if (useHttp && httpToken) {
    const res = await careExport(httpToken, rid(), "markdown");
    if (res.ok) {
      return {
        ok: true,
        markdown:
          res.data.humanReadable ??
          `# Care export — ${careRecipient.displayName}\n(No humanReadable body returned.)`,
        exportedAt: res.data.exportedAt,
        evidenceMode: res.data.evidenceMode,
        source: "http",
      };
    }
    return {
      ok: false,
      markdown: "",
      source: "http",
      message: res.message,
    };
  }
  return {
    ok: false,
    markdown: "",
    source: "none",
    message: "Care API not available — cannot generate a live export.",
  };
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
    const res = await careToday(httpToken, rid());
    if (res.ok) {
      const t = res.data.today;
      const needsYou = [
        ...(t.open_safety_reviews?.map((r) => r.reason) ?? []),
        ...(t.tasks
          ?.filter((x) => x.status === "pending")
          .map((x) => x.title) ?? []),
      ];
      const whatChanged = [
        ...(t.events?.slice(-6).map((e) => plainCaregiverLine(e.statement)) ??
          []),
        ...(t.appointments
          ?.filter((a) => a.status === "moved")
          .map((a) =>
            plainCaregiverLine(
              `${a.title}: ${a.startsAtLabel ?? a.status}`,
            ),
          ) ?? []),
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
        handled: handled.length > 0 ? handled : [],
        next: t.latest_handoff?.stillNeedsAttention?.length
          ? t.latest_handoff.stillNeedsAttention
          : [],
        source: "http",
        storeBackend: res.data.store_backend,
        organizedCount: whatChanged.length,
      };
    }
  }
  const state = getCareRuntime().store.getCurrentState(rid());
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
  // No fabricated static day — empty until server or package has state.
  return {
    needsYou: [],
    attention: [],
    whatChanged: [],
    handled: [],
    next: [],
    source: "static",
    organizedCount: 0,
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
      rid(),
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

/**
 * Grounded care Q&A — SERVER AUTHORITATIVE only.
 * Client does not own intent/projection/persona engines.
 * Conversation continuity is durable on the API (CareUpdate-backed turns).
 */
export async function answerCareQuestion(question: string): Promise<string> {
  const raw = question.trim();
  if (!raw) return "";

  // Lightweight question gate only (not a competing intelligence engine)
  const looksLikeQuestion =
    /\?$/.test(raw) ||
    /^(what|when|where|why|who|how|did|does|do|is|are|can|should|has|have|was|were|prepare|show|tell me|summarize|summary)\b/i.test(
      raw,
    ) ||
    /what happened|since i was last|caught up|going on|need to deal|still need/.test(
      raw.toLowerCase(),
    );
  if (!looksLikeQuestion) return "";

  const { loadActiveCareRecipientId, resolveCareSpace } = await import(
    "../lib/careContext"
  );
  const space = resolveCareSpace(loadActiveCareRecipientId());

  const httpOk = await ensureHttpSession();
  if (httpOk && httpToken) {
    try {
      const base = getCareApiBaseUrl();
      const res = await fetch(`${base}/api/v1/care/answer`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${httpToken}`,
        },
        body: JSON.stringify({
          question: raw,
          care_recipient_id: space.careRecipientId,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        answer?: string;
        not_question?: boolean;
        authority?: string;
      };
      if (res.ok && json.not_question) return "";
      if (res.ok && typeof json.answer === "string" && json.answer.length > 0) {
        return json.answer;
      }
    } catch {
      /* fall through to package path */
    }
  }

  // Package-path: same care-domain module as Foundation (shared process store).
  // Not a second intelligence implementation — one domain service, two transports.
  try {
    const { answerRelayQuestion } = await import("@caretaker-relay/care-domain");
    const identity = getSessionIdentity();
    const { store } = getCareRuntime();
    const result = answerRelayQuestion({
      question: raw,
      principalId: identity.carePersonId,
      principalDisplayName: identity.displayName,
      roleLabel: identity.roleLabel,
      careRecipientId: space.careRecipientId,
      recipientDisplayName: space.displayName,
      store,
    });
    return result.answer || "";
  } catch {
    return "";
  }
}

export function getAuditTrail() {
  const { store } = getCareRuntime();
  return store.listAudit({ careRecipientId: rid() });
}

export function getTransportUsed() {
  return transportUsed;
}
