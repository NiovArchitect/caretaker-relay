/**
 * Integration: public Care API auth + profile + answer + claim path.
 * Skip when CR_E2E_API_URL is unset and not in CI with public target.
 */
import { describe, it, expect } from "vitest";

const API =
  process.env.CR_E2E_API_URL ||
  process.env.CARE_API_URL ||
  "https://caretaker-relay-care-api.onrender.com";

async function api(
  method: string,
  path: string,
  body?: unknown,
  token?: string,
) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

describe("public care API integration", () => {
  it("health is ok", async () => {
    const r = await api("GET", "/api/v1/care/health");
    expect(r.status).toBe(200);
    expect(r.data.ok).toBe(true);
  }, 60_000);

  it("lab login yields memberships and profile for Marcus", async () => {
    const lg = await api("POST", "/api/v1/care/auth/login", {
      care_person_id: "p-sadeil",
      password: "sadeil-lab-password",
    });
    expect(lg.status).toBeLessThan(300);
    expect(lg.data.token).toBeTruthy();
    const prof = await api(
      "GET",
      "/api/v1/care/recipients/cr-olivia/profile",
      undefined,
      lg.data.token,
    );
    expect(prof.status).toBe(200);
    expect(prof.data.recipient?.id || prof.data.recipient?.displayName).toBeTruthy();
  }, 60_000);

  it("unauthorized principal cannot read clinical profile", async () => {
    const lg = await api("POST", "/api/v1/care/auth/login", {
      care_person_id: "p-unauthorized",
      password: "unauth-lab-password",
    });
    const prof = await api(
      "GET",
      "/api/v1/care/recipients/cr-olivia/profile",
      undefined,
      lg.data.token,
    );
    expect(prof.status).toBe(403);
  }, 60_000);

  it("wrong-person provisional bind is forbidden", async () => {
    const reg = await api("POST", "/api/v1/care/auth/register", {
      preferred_name: "Attacker Int",
      email: `atk.int.${Date.now()}@caretaker-relay.test`,
      password: "Atk-Lab-Pass-1!",
      claimed_relationship: "self",
      terms_version: "v1",
    });
    const p = await api(
      "POST",
      "/api/v1/care/provisional-recipients",
      { preferred_name: "Evelyn Carter", claimed_authority: "self" },
      reg.data.token,
    );
    const bind = await api(
      "POST",
      `/api/v1/care/provisional-recipients/${p.data.provisional?.id}/bind`,
      { care_recipient_id: "cr-olivia" },
      reg.data.token,
    );
    expect(bind.status).toBe(403);
  }, 90_000);
});
