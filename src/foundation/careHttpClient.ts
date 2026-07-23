/**
 * HTTP client → Caretaker Relay Foundation care API (/api/v1/care/*).
 *
 * Default base URL: http://localhost:3100 (care runtime).
 * Set VITE_CARE_API_URL to override.
 *
 * When API is unreachable, callers may fall back to in-process package path
 * with explicit EvidenceMode labeling — never silent.
 */

const DEFAULT_BASE =
  (import.meta.env?.VITE_CARE_API_URL as string | undefined) ??
  "http://localhost:3100";

export type HttpResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; status: number; code?: string; message: string; body?: unknown };

async function request<T>(
  path: string,
  opts: {
    method?: string;
    token?: string;
    body?: unknown;
    baseUrl?: string;
  } = {},
): Promise<HttpResult<T>> {
  const base = opts.baseUrl ?? DEFAULT_BASE;
  try {
    const res = await fetch(`${base}${path}`, {
      method: opts.method ?? "GET",
      headers: {
        "content-type": "application/json",
        ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok || json.ok === false) {
      return {
        ok: false,
        status: res.status,
        code: typeof json.code === "string" ? json.code : undefined,
        message:
          typeof json.message === "string"
            ? json.message
            : `HTTP ${res.status}`,
        body: json,
      };
    }
    return { ok: true, data: json as T, status: res.status };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      code: "NETWORK_ERROR",
      message: err instanceof Error ? err.message : "Network error",
    };
  }
}

export async function careHealth(baseUrl?: string) {
  return request<{
    ok: boolean;
    product_id: string;
    durable: boolean;
  }>("/api/v1/care/health", { baseUrl });
}

/** Primary: Foundation AuthService login (email or care_person_id mapping). */
export async function careLogin(
  carePersonId: string,
  password: string,
  baseUrl?: string,
) {
  return request<{
    ok: boolean;
    token: string;
    session_id: string;
    care_person_id: string;
    display_name: string;
    auth_mode?: string;
    entity_id?: string;
  }>("/api/v1/care/auth/login", {
    method: "POST",
    body: { care_person_id: carePersonId, password },
    baseUrl,
  });
}

/** Secondary lab JWT path. Prefer careLogin. */
export async function careLabLogin(
  carePersonId: string,
  password: string,
  baseUrl?: string,
) {
  // Prefer foundation login endpoint
  const primary = await careLogin(carePersonId, password, baseUrl);
  if (primary.ok) return primary;
  return request<{
    ok: boolean;
    token: string;
    session_id: string;
    care_person_id: string;
    display_name: string;
  }>("/api/v1/care/auth/lab-login", {
    method: "POST",
    body: { care_person_id: carePersonId, password },
    baseUrl,
  });
}

export async function careUnderstand(
  token: string,
  text: string,
  careRecipientId: string,
  opts?: {
    mode?: "fixture" | "llm";
    baseUrl?: string;
    transcriptMeta?: {
      language?: string;
      confidence?: number;
      source?: "voice_stt" | "text";
      stt_provider?: string;
    };
  },
) {
  const path =
    opts?.transcriptMeta?.source === "voice_stt"
      ? "/api/v1/care/voice/understand"
      : "/api/v1/care/understand";
  const body =
    path.includes("voice")
      ? {
          transcript: text,
          care_recipient_id: careRecipientId,
          mode: opts?.mode ?? "fixture",
          language: opts?.transcriptMeta?.language,
          confidence: opts?.transcriptMeta?.confidence,
          stt_provider: opts?.transcriptMeta?.stt_provider,
          user_edited: true,
        }
      : {
          text,
          care_recipient_id: careRecipientId,
          mode: opts?.mode ?? "fixture",
          transcript_meta: opts?.transcriptMeta,
        };
  return request<{
    ok: boolean;
    kind: string;
    verification_bundle_id?: string;
    bundle?: unknown;
    message?: string;
    evidence_mode?: string;
  }>(path, {
    method: "POST",
    token,
    body,
    baseUrl: opts?.baseUrl,
  });
}

export async function careToday(
  token: string,
  careRecipientId: string,
  baseUrl?: string,
) {
  return request<{
    ok: boolean;
    today: {
      events: Array<{ statement: string; type: string }>;
      tasks: Array<{ title: string; status: string; safetyClass?: string }>;
      appointments: Array<{ title: string; startsAtLabel?: string; status: string }>;
      observations: Array<{ summary: string }>;
      open_safety_reviews: Array<{ reason: string }>;
      latest_handoff: {
        whatChanged: string[];
        stillNeedsAttention: string[];
      } | null;
    };
    store_backend?: string;
  }>(`/api/v1/care/recipients/${careRecipientId}/today`, { token, baseUrl });
}

export async function careConfirm(
  token: string,
  verificationBundleId: string,
  idempotencyKey: string,
  baseUrl?: string,
) {
  return request<{
    ok: boolean;
    kind: string;
    persisted?: unknown;
    current_state?: unknown;
    evidence_mode?: string;
    durable?: boolean;
  }>("/api/v1/care/confirm", {
    method: "POST",
    token,
    body: {
      verification_bundle_id: verificationBundleId,
      idempotency_key: idempotencyKey,
    },
    baseUrl,
  });
}

export async function careCorrect(
  token: string,
  targetEventId: string,
  correctedValue: string,
  careRecipientId: string,
  baseUrl?: string,
) {
  return request<{
    ok: boolean;
    kind: string;
    message?: string;
    persisted?: unknown;
    evidence_mode?: string;
  }>("/api/v1/care/corrections", {
    method: "POST",
    token,
    body: {
      target_event_id: targetEventId,
      corrected_value: correctedValue,
      care_recipient_id: careRecipientId,
    },
    baseUrl,
  });
}

export async function careHandoffs(
  token: string,
  careRecipientId: string,
  baseUrl?: string,
) {
  return request<{ ok: boolean; handoffs: unknown[] }>(
    `/api/v1/care/recipients/${careRecipientId}/handoffs`,
    { token, baseUrl },
  );
}

export function getCareApiBaseUrl(): string {
  return DEFAULT_BASE;
}
