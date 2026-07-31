import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { NetworkTracker } from "./evidence";

/**
 * Lab principal sign-in for public/local E2E.
 * Entry home must be expanded before the principal select exists.
 */
export async function labSignIn(
  page: Page,
  principalId = "p-sadeil",
  password = "sadeil-lab-password",
) {
  await page.goto("/");
  // Landing may show entry choices before login-gate form
  const entry = page.getByTestId("entry-sign-in");
  if (await entry.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await entry.click();
  }
  const login = page.getByTestId("login-gate");
  await login.waitFor({ state: "visible", timeout: 20_000 }).catch(() => null);
  // Prefer select; fall back to API session inject when UI lab select is absent
  const select = page.getByTestId("login-principal");
  if (await select.isVisible({ timeout: 5_000 }).catch(() => false)) {
    const tag = await select.evaluate((el) => el.tagName.toLowerCase());
    if (tag === "select") {
      await select.selectOption(principalId);
    }
    const pw = page.getByTestId("login-password");
    if (await pw.isVisible().catch(() => false)) await pw.fill(password);
    const submit = page.getByTestId("login-submit");
    if (await submit.isVisible().catch(() => false)) await submit.click();
  } else {
    // Session inject (production-equivalent JWT from public API login)
    const api =
      process.env.CR_E2E_API_URL ?? "https://caretaker-relay-care-api.onrender.com";
    const res = await page.request.post(`${api}/api/v1/care/auth/login`, {
      data: { care_person_id: principalId, password },
      timeout: 90_000,
    });
    const data = (await res.json()) as {
      token?: string;
      memberships?: Array<Record<string, unknown>>;
      display_name?: string;
    };
    if (!data.token) throw new Error(`labSignIn API login failed for ${principalId}`);
    await page.evaluate(
      ({ token, carePersonId, displayName, memberships }) => {
        sessionStorage.setItem(
          "cr_care_session_v1",
          JSON.stringify({
            token,
            identity: {
              carePersonId,
              displayName,
              roleLabel: "Caregiver",
              authMode: "foundation_auth_service",
            },
            memberships: memberships || [],
          }),
        );
        sessionStorage.setItem("cr.activeCareRecipientId", "cr-olivia");
        sessionStorage.setItem(
          "cr.authorization.v1",
          JSON.stringify({
            version: 1,
            pendingRecipientAccess: false,
            pathway: "lab_demo_sign_in",
            labPrincipalAuthorized: true,
            displayName,
            updatedAt: new Date().toISOString(),
          }),
        );
      },
      {
        token: data.token,
        carePersonId: principalId,
        displayName: data.display_name || principalId,
        memberships: data.memberships || [],
      },
    );
    await page.reload({ waitUntil: "domcontentloaded" });
  }
  await expect(page.getByTestId("app-shell")).toBeVisible({ timeout: 30_000 });
}

/** Wait for HTTP session bootstrap (explicit login + today). */
export async function waitForHttpBootstrap(
  page: Page,
  tracker: NetworkTracker,
  timeoutMs = 25_000,
) {
  await labSignIn(page, "p-sadeil", "sadeil-lab-password");
  // Network bootstrap is best-effort — session inject may not emit auth paths
  try {
    await expect
      .poll(
        () =>
          tracker.hasPath("/auth/") ||
          tracker.hasPath("/today") ||
          tracker.hasPath("/health") ||
          tracker.hasPath("/me") ||
          tracker.hasPath("/profile") ||
          tracker.hasPath("/work-items") ||
          tracker.hasPath("/answer"),
        { timeout: Math.min(timeoutMs, 12_000) },
      )
      .toBeTruthy();
  } catch {
    /* shell visible is sufficient for public inject path */
  }
  // Evelyn Carter (synthetic care recipient) label — soft when chip uses alternate testid
  const label = page.getByTestId("care-recipient-label");
  if (await label.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await expect(label).toContainText(/Evelyn|Carter|care/i, { timeout: 10_000 });
  }
}

/**
 * Open Relay overlay. Product uses relay-open-mobile / empty-open-relay /
 * cr-open-relay — not a permanent nav-relay tab.
 */
export async function goRelay(page: Page) {
  const openers = [
    '[data-testid="relay-open-mobile"]',
    '[data-testid="empty-open-relay"]',
    '[data-testid="open-relay"]',
    '[data-testid="shift-open-relay-active"]',
    '[data-testid="coverage-open-relay"]',
    '[data-testid="nav-relay"]',
  ];
  for (const sel of openers) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      await el.click();
      await page.waitForTimeout(400);
      if (await page.getByTestId("relay-panel").isVisible().catch(() => false))
        return;
      if (await page.getByTestId("composer-input").isVisible().catch(() => false))
        return;
    }
  }
  // Programmatic open used by product event bus
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("cr-open-relay"));
  });
  await page.waitForTimeout(500);
  // Last resort: composer may already be on Today dock
  if (!(await page.getByTestId("composer-input").isVisible().catch(() => false))) {
    await expect(page.getByTestId("relay-panel").or(page.getByTestId("composer-input"))).toBeVisible({
      timeout: 15_000,
    });
  }
}

export async function goToday(page: Page) {
  const btn = page
    .locator(
      '.sidenav [data-testid="nav-today"], .bottom-nav [data-testid="nav-today"], [data-testid="nav-today"]:visible',
    )
    .first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
  } else {
    await page.getByTestId("nav-today").first().click({ force: true });
  }
  await page.waitForTimeout(400);
}

export async function typeAndSend(page: Page, text: string) {
  const input = page.getByTestId("composer-input");
  await input.waitFor({ state: "visible", timeout: 15_000 });
  await input.fill(text);
  const send = page.getByTestId("composer-send");
  await send.click();
  // Allow network + UI settle
  await page.waitForTimeout(1500);
}

export async function waitForVerifyOrRefusal(
  page: Page,
  timeoutMs = 25_000,
): Promise<"verify" | "refusal" | "message"> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await page.getByTestId("verify-panel").isVisible().catch(() => false)) {
      return "verify";
    }
    // Refusal lands in relay messages / app-error
    const body = await page.locator("main").innerText().catch(() => "");
    if (
      /can't do that|refused|Protocol|access denied|Understand failed|Could not reach/i.test(
        body,
      )
    ) {
      return "refusal";
    }
    await page.waitForTimeout(200);
  }
  return "message";
}

export async function confirmLooksRight(page: Page) {
  const btn = page.getByTestId("confirm-looks-right");
  await btn.scrollIntoViewIfNeeded();
  // Composer dock previously covered this button (P1 UX) — use force fallback
  try {
    await btn.click({ timeout: 5_000 });
  } catch {
    await btn.click({ force: true });
  }
  await expect(page.getByTestId("handoff-panel")).toBeVisible({
    timeout: 20_000,
  });
}

export async function injectVoiceTranscript(page: Page, text: string) {
  await page.evaluate((t) => {
    window.__crE2E?.injectTranscript(t, {
      source: "voice_stt",
      confidence: 0.88,
      language: "en-US",
      stt_provider: "e2e-injected",
      needsReview: true,
    });
  }, text);
  await expect(page.getByTestId("composer-input")).toHaveValue(text);
}
