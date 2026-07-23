/**
 * Multi-browser three-principal household acceptance (Playwright).
 * Requires VITE_CARE_API_URL pointing at a running care API with seed principals.
 *
 * Run: npx playwright test e2e/household-three-principal.spec.ts
 */
import { test, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";

const API =
  process.env.VITE_CARE_API_URL ??
  process.env.CARE_API_URL ??
  "https://caretaker-relay-care-api.onrender.com";

async function loginAs(
  page: Page,
  carePersonId: string,
  password: string,
) {
  await page.goto("/");
  await expect(page.getByTestId("login-gate")).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("login-principal").selectOption(carePersonId);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("care-recipient-label").first()).toContainText(
    "Evelyn",
    { timeout: 25_000 },
  );
}

async function signOut(page: Page) {
  const btn = page.getByTestId("sign-out");
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await expect(page.getByTestId("login-gate")).toBeVisible({ timeout: 15_000 });
  }
}

test.describe("THREE PRINCIPAL BROWSER HOUSEHOLD", () => {
  test.setTimeout(180_000);

  test("Marcus invite → Maya accept → update → continuity → correction path via UI+API", async ({
    browser,
  }: {
    browser: Browser;
  }) => {
    // Precondition: revoke Maya via API as Marcus so invite can succeed
    const loginRes = await fetch(`${API}/api/v1/care/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        care_person_id: "p-sadeil",
        password: "sadeil-lab-password",
      }),
    });
    const loginJson = (await loginRes.json()) as { token?: string };
    if (!loginJson.token) {
      test.skip(true, "Care API login unavailable");
      return;
    }
    await fetch(`${API}/api/v1/care/recipients/cr-olivia/access/revoke`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${loginJson.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ person_id: "p-maya" }),
    });

    const marcusCtx: BrowserContext = await browser.newContext();
    const mayaCtx: BrowserContext = await browser.newContext();
    const danielCtx: BrowserContext = await browser.newContext();
    const marcus = await marcusCtx.newPage();
    const maya = await mayaCtx.newPage();
    const daniel = await danielCtx.newPage();

    try {
      await loginAs(marcus, "p-sadeil", "sadeil-lab-password");
      await expect(marcus.getByTestId("session-caregiver")).toContainText(
        "Marcus",
      );

      await marcus.getByTestId("nav-people").first().click();
      await marcus.getByTestId("invite-person").selectOption("p-maya");
      await marcus.getByTestId("invite-create").click();
      await expect(marcus.getByTestId("invite-token")).toBeVisible({
        timeout: 20_000,
      });
      const tokenText = await marcus.getByTestId("invite-token").innerText();
      const token = tokenText.replace(/^Token:\s*/i, "").trim();
      expect(token.length).toBeGreaterThan(10);

      await loginAs(maya, "p-maya", "maya-lab-password");
      await maya.getByTestId("nav-people").first().click();
      await maya.getByTestId("invite-accept-token").fill(token);
      await maya.getByTestId("invite-accept").click();
      await expect(maya.getByTestId("invite-status")).toContainText(
        /accepted|active|membership/i,
        { timeout: 20_000 },
      );

      // Marcus care update
      await marcus.getByTestId("try-care-update-top").click();
      const composer = marcus.getByTestId("composer-input");
      await composer.fill(
        "Evelyn was unsteady after lunch and only ate half a sandwich. PT may move again but I'm not sure to when.",
      );
      await marcus.getByTestId("composer-send").click();
      await expect(marcus.getByTestId("verify-panel")).toBeVisible({
        timeout: 45_000,
      });
      await marcus.getByTestId("confirm-looks-right").click();
      await expect(marcus.getByTestId("handoff-panel")).toBeVisible({
        timeout: 30_000,
      });

      // Maya sees continuity — open handoff
      await maya.getByTestId("nav-today").first().click();
      await maya.getByTestId("review-handoff").click();
      await expect(maya.getByTestId("handoff-panel")).toBeVisible({
        timeout: 25_000,
      });

      // Maya asks Relay a grounded question
      await maya.getByTestId("try-care-update-top").click();
      await maya
        .getByTestId("composer-input")
        .fill("What happened since I was last here?");
      await maya.getByTestId("composer-send").click();
      await expect(maya.getByTestId("relay-thread")).toContainText(
        /changed|continuity|event|handoff|care|appointment|meal|observation|unsteady|sandwich/i,
        { timeout: 30_000 },
      );

      // Maya correction via API (durable) then Marcus re-observes in his context
      const readSessionToken = () => {
        try {
          const raw = sessionStorage.getItem("cr_care_session_v1");
          if (!raw) return null;
          const parsed = JSON.parse(raw) as { token?: string };
          return parsed.token ?? null;
        } catch {
          return null;
        }
      };
      let mayaBearer = await maya.evaluate(readSessionToken);
      let marcusBearer = await marcus.evaluate(readSessionToken);
      if (!mayaBearer) {
        const r = await fetch(`${API}/api/v1/care/auth/login`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            care_person_id: "p-maya",
            password: "maya-lab-password",
          }),
        });
        mayaBearer = ((await r.json()) as { token?: string }).token ?? null;
      }
      if (!marcusBearer) {
        const r = await fetch(`${API}/api/v1/care/auth/login`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            care_person_id: "p-sadeil",
            password: "sadeil-lab-password",
          }),
        });
        marcusBearer = ((await r.json()) as { token?: string }).token ?? null;
      }
      expect(mayaBearer).toBeTruthy();
      expect(marcusBearer).toBeTruthy();

      const stateRes = await fetch(
        `${API}/api/v1/care/recipients/cr-olivia/state`,
        { headers: { authorization: `Bearer ${mayaBearer}` } },
      );
      const stateJson = (await stateRes.json()) as {
        state?: { events?: Array<{ id: string; statement: string }> };
      };
      const events = stateJson.state?.events ?? [];
      const target =
        events.find((e) =>
          /unsteady|sandwich|PT|appointment|meal|walk/i.test(e.statement),
        ) ?? events[events.length - 1];
      expect(target?.id).toBeTruthy();

      const corrRes = await fetch(`${API}/api/v1/care/corrections`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${mayaBearer}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          target_event_id: target!.id,
          corrected_value:
            "Physical therapy is Friday at 2:30 PM (Maya correction via browser journey)",
          care_recipient_id: "cr-olivia",
        }),
      });
      expect(corrRes.status).toBe(200);

      const tlRes = await fetch(
        `${API}/api/v1/care/recipients/cr-olivia/timeline`,
        { headers: { authorization: `Bearer ${marcusBearer}` } },
      );
      expect(tlRes.status).toBe(200);
      const tl = (await tlRes.json()) as {
        corrections?: Array<{
          correctedValue: string;
          correctedByPersonId: string;
        }>;
      };
      const corrOk = (tl.corrections ?? []).some(
        (c) =>
          c.correctedByPersonId === "p-maya" ||
          /Friday|Maya correction/i.test(c.correctedValue),
      );
      expect(corrOk).toBe(true);

      // Daniel limited entry
      await loginAs(daniel, "p-walter", "walter-lab-password");
      await expect(daniel.getByTestId("session-caregiver")).toContainText(
        /Daniel|Professional/i,
      );
      await expect(
        daniel.getByTestId("care-recipient-label").first(),
      ).toContainText("Evelyn");

      // Daniel denied invite (direct server proof)
      const danLogin = await fetch(`${API}/api/v1/care/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          care_person_id: "p-walter",
          password: "walter-lab-password",
        }),
      });
      const danTok = ((await danLogin.json()) as { token?: string }).token;
      const denied = await fetch(
        `${API}/api/v1/care/recipients/cr-olivia/invitations`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${danTok}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            invitee_care_person_id: "p-maya",
            role: "family_caregiver",
          }),
        },
      );
      expect(denied.status).toBe(403);
    } finally {
      await marcusCtx.close();
      await mayaCtx.close();
      await danielCtx.close();
    }
  });
});
