/**
 * Lightweight API contract checks against public Care API response shapes.
 */
import { describe, it, expect } from "vitest";

const API =
  process.env.CR_E2E_API_URL ||
  "https://caretaker-relay-care-api.onrender.com";

describe("care API contract", () => {
  it("health contract", async () => {
    const res = await fetch(`${API}/api/v1/care/health`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toMatchObject({ ok: true, product_id: "caretaker-relay" });
    expect(typeof data.timestamp).toBe("string");
  }, 60_000);

  it("login contract fields", async () => {
    const res = await fetch(`${API}/api/v1/care/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        care_person_id: "p-sadeil",
        password: "sadeil-lab-password",
      }),
    });
    const data = await res.json();
    expect(res.ok).toBe(true);
    expect(typeof data.token).toBe("string");
    expect(data.care_person_id || data.entity_id).toBeTruthy();
    expect(Array.isArray(data.memberships) || typeof data.authorized_recipients === "number").toBe(
      true,
    );
  }, 60_000);

  it("answer contract fields", async () => {
    const lg = await fetch(`${API}/api/v1/care/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        care_person_id: "p-sadeil",
        password: "sadeil-lab-password",
      }),
    }).then((r) => r.json());
    const res = await fetch(`${API}/api/v1/care/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lg.token}`,
      },
      body: JSON.stringify({
        care_recipient_id: "cr-olivia",
        question: "What medications is she on?",
      }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(typeof data.answer === "string" || typeof data.message === "string").toBe(true);
  }, 60_000);
});
