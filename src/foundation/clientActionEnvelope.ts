/**
 * ClientActionEnvelope — stable idempotency for consequential care actions.
 *
 * Keys are generated once per intended user action (not per network attempt).
 * Retries, refresh, and offline restore reuse the same key until completion or
 * material correction (new effect, dose, recipient, order).
 */

const STORE_KEY = "cr_client_action_envelopes_v1";

export type ClientActionLifecycle =
  | "created"
  | "pending"
  | "unknown_result"
  | "succeeded"
  | "failed"
  | "cancelled";

export type ClientActionEnvelope = {
  action_id: string;
  idempotency_key: string;
  tenant_id?: string;
  care_space_id?: string;
  recipient_id: string;
  principal_id?: string;
  conversation_id?: string;
  object_type: "prn_confirm" | "prn_reassess" | "care_confirm" | string;
  canonical_object_id?: string;
  order_id?: string;
  episode_id?: string;
  /** Material fingerprint — if this changes, allocate a new key */
  intent_fingerprint: string;
  created_at: string;
  confirmed_at?: string;
  last_attempt_at?: string;
  attempt_count: number;
  network_state?: "online" | "offline" | "unknown";
  lifecycle: ClientActionLifecycle;
  authoritative_result_id?: string;
  final_receipt?: string;
  last_message?: string;
};

function loadAll(): ClientActionEnvelope[] {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as ClientActionEnvelope[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveAll(list: ClientActionEnvelope[]): void {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(list.slice(-80)));
  } catch {
    /* quota */
  }
}

export function newIdempotencyKey(prefix = "act"): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix}-${rand}`;
}

/**
 * Get or create envelope for an intended action.
 * Same recipient + object_type + intent_fingerprint → same key.
 */
export function getOrCreateActionEnvelope(input: {
  recipient_id: string;
  object_type: ClientActionEnvelope["object_type"];
  intent_fingerprint: string;
  principal_id?: string;
  order_id?: string;
  episode_id?: string;
  canonical_object_id?: string;
}): ClientActionEnvelope {
  const all = loadAll();
  const existing = all.find(
    (e) =>
      e.recipient_id === input.recipient_id &&
      e.object_type === input.object_type &&
      e.intent_fingerprint === input.intent_fingerprint &&
      e.lifecycle !== "cancelled" &&
      e.lifecycle !== "failed",
  );
  if (existing) {
    // Prefer open / unknown over already succeeded for same fingerprint
    if (
      existing.lifecycle === "succeeded" &&
      existing.authoritative_result_id
    ) {
      return existing;
    }
    return existing;
  }
  const env: ClientActionEnvelope = {
    action_id: newIdempotencyKey("aid"),
    idempotency_key: newIdempotencyKey("idem"),
    recipient_id: input.recipient_id,
    principal_id: input.principal_id,
    object_type: input.object_type,
    order_id: input.order_id,
    episode_id: input.episode_id,
    canonical_object_id: input.canonical_object_id,
    intent_fingerprint: input.intent_fingerprint,
    created_at: new Date().toISOString(),
    attempt_count: 0,
    lifecycle: "created",
  };
  all.push(env);
  saveAll(all);
  return env;
}

export function markActionAttempt(
  idempotencyKey: string,
  network: ClientActionEnvelope["network_state"] = "online",
): ClientActionEnvelope | null {
  const all = loadAll();
  const e = all.find((x) => x.idempotency_key === idempotencyKey);
  if (!e) return null;
  e.attempt_count += 1;
  e.last_attempt_at = new Date().toISOString();
  e.network_state = network;
  e.lifecycle =
    network === "offline" ? "unknown_result" : e.lifecycle === "created"
      ? "pending"
      : e.lifecycle;
  saveAll(all);
  return e;
}

export function markActionUnknown(
  idempotencyKey: string,
  message?: string,
): void {
  const all = loadAll();
  const e = all.find((x) => x.idempotency_key === idempotencyKey);
  if (!e) return;
  e.lifecycle = "unknown_result";
  e.last_message =
    message ||
    "Could not confirm whether this was saved. Do not chart again — retry will use the same action key.";
  e.network_state = "unknown";
  saveAll(all);
}

export function markActionSucceeded(
  idempotencyKey: string,
  resultId?: string,
  receipt?: string,
): void {
  const all = loadAll();
  const e = all.find((x) => x.idempotency_key === idempotencyKey);
  if (!e) return;
  e.lifecycle = "succeeded";
  e.confirmed_at = new Date().toISOString();
  e.authoritative_result_id = resultId;
  e.final_receipt = receipt;
  e.last_message = receipt;
  saveAll(all);
}

export function markActionFailed(
  idempotencyKey: string,
  message: string,
): void {
  const all = loadAll();
  const e = all.find((x) => x.idempotency_key === idempotencyKey);
  if (!e) return;
  // Definite server rejection (not network) — allow new key on next intent
  e.lifecycle = "failed";
  e.last_message = message;
  saveAll(all);
}

export function listPendingUnknownActions(): ClientActionEnvelope[] {
  return loadAll().filter(
    (e) =>
      e.lifecycle === "unknown_result" ||
      e.lifecycle === "pending" ||
      e.lifecycle === "created",
  );
}

/** Human copy when result is unknown — never claim success or failure. */
export function unknownResultUserMessage(): string {
  return "We could not confirm whether this as-needed charting was saved. Do not enter it again. Tap retry — the same secure action key will be used so a duplicate dose is not created.";
}
