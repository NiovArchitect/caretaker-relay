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
  const res = await careCreateInvitation(httpToken, careRecipient.id, {
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
  const res = await careListCoordination(httpToken, careRecipient.id);
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
    careRecipient.id,
    body,
    toPersonId,
  );
  if (!res.ok) return { ok: false as const, message: res.message };
  return { ok: true as const };
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

function mapHandoffRecord(h: Record<string, unknown>) {
  const sources = Array.isArray(h.sources) ? h.sources : [];
  return {
    id: String(h.id ?? "ho-unknown"),
    careRecipientId: String(h.careRecipientId ?? careRecipient.id),
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
      careRecipientId: careRecipient.id,
      whatChanged: lastHttpHandoff.whatChanged,
      stillNeedsAttention: lastHttpHandoff.stillNeedsAttention,
      watch: lastHttpHandoff.watch,
      sources: lastHttpHandoff.sources,
      evidenceMode: lastHttpHandoff.evidenceMode,
    });
  }
  const { store } = getCareRuntime();
  const list = store.getHandoffs(careRecipient.id);
  return list[list.length - 1];
}

/** Fetch latest persisted handoff from server (authoritative). */
export async function fetchLatestHandoff() {
  const useHttp = await ensureHttpSession();
  if (useHttp && httpToken) {
    const res = await careHandoffs(httpToken, careRecipient.id);
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

function buildAttentionFromLines(lines: string[]): TodayAttentionItem[] {
  // Signal filter: dedupe identical reasons; keep sparse attention.
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const line of lines) {
    const key = line.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(line);
  }
  return unique.slice(0, 5).map((line, i) => {
    const med = /medication|dose|pill|mg|med\b|incompatible/i.test(line);
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
      nextStep: med ? "Open medication in Care" : "Review",
      kind: med ? "medication" : "task",
    };
  });
}

export async function fetchCareState(): Promise<CareStateSnapshot> {
  const useHttp = await ensureHttpSession();
  if (useHttp && httpToken) {
    const res = await careState(httpToken, careRecipient.id);
    if (res.ok && res.data.state) {
      const s = res.data.state as Record<string, unknown>;
      return {
        careRecipientId: String(s.careRecipientId ?? careRecipient.id),
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
      careRecipientId: careRecipient.id,
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
    const res = await careCircle(httpToken, careRecipient.id);
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
    const res = await careExport(httpToken, careRecipient.id, "markdown");
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

/** Grounded care Q&A — prefer server /answer from durable truth. */
export async function answerCareQuestion(question: string): Promise<string> {
  const raw = question.trim();
  const q = raw.toLowerCase();
  const looksLikeQuestion =
    /\?$/.test(raw) ||
    /^(what|when|where|why|who|how|summarize|summary)\b/i.test(raw) ||
    /^(can you )?(tell me |show me )?(what|when|where|why|who|how)\b/i.test(
      raw,
    ) ||
    /what happened since|since i was last|caught up/.test(q);
  if (!looksLikeQuestion) return "";

  // Prefer server-grounded answer when authenticated over HTTP
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
          care_recipient_id: careRecipient.id,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        answer?: string;
      };
      if (res.ok && json.answer) return json.answer;
    } catch {
      /* fall through to local projection */
    }
  }

  const proj = await fetchTodayProjection();
  const name = careRecipient.displayName;
  const state = await fetchCareState();

  if (/what changed|since this morning|since yesterday|what happened|since i was last|caught up|going on|changed this week|since maya/.test(q)) {
    if (proj.whatChanged.length === 0) {
      return `I don't have new confirmed changes for ${name} yet. Share an update and I'll organize it.`;
    }
    return `Here's what changed for ${name}:\n${proj.whatChanged.map((l) => `• ${l}`).join("\n")}`;
  }
  if (/still need|outstanding|left to do|needs me|need to happen|waiting for me|need to verify/.test(q)) {
    const lines =
      proj.attention.length > 0
        ? proj.attention.map((a) => a.title)
        : proj.needsYou;
    if (lines.length === 0) {
      return "Nothing is flagged as needing your attention right now.";
    }
    return `Still needs attention:\n${lines.map((l) => `• ${l}`).join("\n")}`;
  }
  if (/what should (i )?(tell )?daniel|for daniel|daniel before/.test(q)) {
    const handoff = getLatestHandoff();
    const bits = [
      ...(handoff?.whatChanged ?? []).slice(0, 3),
      ...proj.whatChanged.slice(0, 2),
    ];
    if (bits.length === 0) {
      return `I don't have a prepared brief for Daniel yet. Share what happened during your time with ${name}, and I can organize it.`;
    }
    return `What to tell Daniel before he arrives:\n${bits.map((l) => `• ${l}`).join("\n")}\n\nThis is for your review, not automatically sent.`;
  }
  if (/what should maya|tell maya|for maya|maya know|prepare.*handoff|update for maya/.test(q)) {
    const handoff = getLatestHandoff();
    if (handoff?.whatChanged?.length) {
      return `Update for Maya (care handoff):\n${handoff.whatChanged.map((l) => `• ${l}`).join("\n")}\n\nPrepared for review, not automatically sent as a message.`;
    }
    return "I can prepare an update for Maya after you confirm a care update. Share what happened today.";
  }
  if (/dr\.?\s*shah|provider|clinic update|prepare an update for dr/.test(q)) {
    const meds = state.medicationSchedules
      .map((m) => `${String(m.name ?? "Medication")}: ${String(m.dose ?? "")} ${String(m.scheduleLabel ?? "")}`.trim())
      .filter(Boolean);
    const open = proj.attention.map((a) => a.title);
    return [
      `Clinic-oriented picture for ${name} (for Dr. Shah):`,
      meds.length ? `Medications on file:\n${meds.map((m) => `• ${m}`).join("\n")}` : "• No medication schedule on file",
      open.length ? `Open items needing human check:\n${open.map((l) => `• ${l}`).join("\n")}` : "• No open attention items",
      `Recent changes:\n${(proj.whatChanged.slice(0, 4).map((l) => `• ${l}`).join("\n") || "• none listed")}`,
      "This is a caregiver-prepared summary, not a clinical order. Review before sharing.",
    ].join("\n");
  }
  if (/medication|meds|metformin|dose|lunch medication|already give|gave her/.test(q)) {
    const schedules = state.medicationSchedules;
    if (!schedules.length) {
      return `I don't have a medication schedule on file for ${name} yet.`;
    }
    const lines = schedules.map((m) => {
      const nameMed = String(m.name ?? "Medication");
      const dose = String(m.dose ?? "");
      const when =
        String(m.scheduleTime ?? m.nextDueLabel ?? m.scheduleLabel ?? "");
      const window =
        m.windowStart && m.windowEnd
          ? ` Window ${String(m.windowStart)} – ${String(m.windowEnd)}.`
          : "";
      const meal = m.mealRelation ? ` ${String(m.mealRelation)}.` : "";
      const by = m.authorizedBy ? ` Authorized by ${String(m.authorizedBy)}.` : "";
      return `• ${nameMed}${dose ? ` ${dose}` : ""}${when ? ` · ${when}` : ""}.${meal}${window}${by}`;
    });
    const last = state.medicationRecords.slice(-1)[0];
    const lastLine = last
      ? `\nLast reported administration: ${String(last.recordedDose ?? last.doseRecorded ?? "recorded")} at ${String(last.occurredAt ?? last.administeredAt ?? "unknown time")}.`
      : "";
    return `Medications for ${name} today:\n${lines.join("\n")}${lastLine}`;
  }
  if (/appointment|pt|physical therapy|next appointment/.test(q)) {
    const apts = state.appointments;
    if (apts.length) {
      return apts
        .map((a) => {
          const title = String(a.title ?? "Appointment");
          const when = String(a.startsAtLabel ?? a.startsAt ?? "");
          const loc = a.location ? ` · ${String(a.location)}` : "";
          const st = a.status ? ` · ${String(a.status)}` : "";
          const prev = a.previousStartsAtLabel
            ? `\n  Changed from: ${String(a.previousStartsAtLabel)}`
            : "";
          return `• ${title}\n  ${when}${loc}${st}${prev}`;
        })
        .join("\n");
    }
    const hit = proj.whatChanged.find((l) =>
      /pt|therapy|appointment|maya visit|2:30|3:00/i.test(l),
    );
    return hit
      ? `Schedule note: ${hit}`
      : "I don't have a confirmed appointment on file yet. You can tell me if something moved.";
  }
  if (/summarize|summary|the day|prepare an update/.test(q)) {
    return [
      `Day picture for ${name}:`,
      proj.attention[0]
        ? `Needs you: ${proj.attention[0].title}`
        : "Needs you: nothing urgent flagged",
      `Changed: ${proj.whatChanged.slice(0, 3).join("; ") || "none yet"}`,
      `Handled: ${proj.handled.slice(0, 2).join("; ") || "none yet"}`,
    ].join("\n");
  }
  if (/why.*(confirm|check|verify)|where did this/.test(q)) {
    return "I ask you to confirm when something is consequential, especially medication, so we don't turn a guess into care truth. Sources stay attached to what we save.";
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
