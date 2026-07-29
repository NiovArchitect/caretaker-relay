import { chromium } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const BASE = "https://care.niovlabs.com";
const API = "https://caretaker-relay-care-api.onrender.com";
const OUT = "docs/incidents/evidence/final-intent-signal-after";

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  for (const [w, h, name] of [
    [1366, 768, "desktop-1366"],
    [390, 844, "mobile-390"],
    [768, 1024, "tablet-768"],
  ] as const) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const login = (await (
      await page.request.post(`${API}/api/v1/care/auth/login`, {
        data: {
          care_person_id: "p-sadeil",
          password: "sadeil-lab-password",
        },
      })
    ).json()) as { token?: string };
    await page.goto(BASE + "/");
    await page.evaluate((token) => {
      sessionStorage.setItem(
        "cr_care_session_v1",
        JSON.stringify({
          token,
          identity: {
            carePersonId: "p-sadeil",
            displayName: "Marcus Carter",
            roleLabel: "Primary family caregiver",
            authMode: "foundation_auth_service",
          },
          pending: false,
        }),
      );
      sessionStorage.setItem(
        "cr.authorization.v1",
        JSON.stringify({
          version: 1,
          pendingRecipientAccess: false,
          claimedPath: null,
          displayName: "Marcus Carter",
          pathway: "lab_demo_sign_in",
          accessRequest: null,
          inviteTokenBound: null,
          labPrincipalAuthorized: true,
          updatedAt: new Date().toISOString(),
        }),
      );
      localStorage.setItem(
        "cr.activeCareRecipient.v1",
        JSON.stringify({ careRecipientId: "cr-olivia", at: Date.now() }),
      );
    }, login.token);
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector('[data-testid="app-shell"]', { timeout: 45_000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT, `${name}-today.png`) });
    const care = page.getByTestId("nav-care");
    if (await care.isVisible().catch(() => false)) {
      await care.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: path.join(OUT, `${name}-care.png`) });
    // Do not click open if Relay is already open (auto-open compact layouts).
    const panel = page.getByTestId("relay-panel");
    const alreadyOpen =
      (await panel.evaluate((el) => el.classList.contains("is-open")).catch(() => false)) ||
      (await page.getByTestId("composer-input").isVisible().catch(() => false));
    if (!alreadyOpen) {
      const open = page.getByTestId("relay-open-mobile");
      if (await open.isVisible().catch(() => false)) {
        await open.click({ force: true }).catch(() => {});
        await page.waitForTimeout(400);
      }
    }
    const input = page.getByTestId("composer-input");
    if (await input.isVisible().catch(() => false)) {
      await input.click({ force: true }).catch(() => {});
      await input.fill("How is Evelyn today?");
      await page
        .getByTestId("composer-send")
        .click({ force: true })
        .catch(async () => input.press("Enter"));
      await page.waitForTimeout(4500);
      await page.screenshot({
        path: path.join(OUT, `${name}-relay-today.png`),
      });
    } else {
      await page.screenshot({
        path: path.join(OUT, `${name}-relay-unavailable.png`),
      });
    }
    await ctx.close();
  }
  await browser.close();
  console.log("census ok");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
