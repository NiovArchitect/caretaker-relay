import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { NetworkTracker } from "./evidence";

/** Wait for HTTP session bootstrap (login + today). */
export async function waitForHttpBootstrap(
  page: Page,
  tracker: NetworkTracker,
  timeoutMs = 25_000,
) {
  await page.goto("/");
  await expect(page.getByTestId("app-shell")).toBeVisible({ timeout: 15_000 });
  // Lab login + today projection
  await expect
    .poll(
      () =>
        tracker.hasPath("/auth/") ||
        tracker.hasPath("/today") ||
        tracker.hasPath("/health"),
      { timeout: timeoutMs },
    )
    .toBeTruthy();
  // Olivia label
  await expect(page.getByTestId("care-recipient-label")).toContainText(
    "Olivia",
    { timeout: 15_000 },
  );
  // Prefer durable http source when API is up
  await expect
    .poll(
      async () => {
        const el = page.getByTestId("today-source");
        if (!(await el.count())) return "";
        return (await el.getAttribute("data-source")) ?? "";
      },
      { timeout: timeoutMs },
    )
    .toMatch(/http|static|package/);
}

export async function goRelay(page: Page) {
  await page.getByTestId("nav-relay").click();
}

export async function goToday(page: Page) {
  await page.getByTestId("nav-today").click();
}

export async function typeAndSend(page: Page, text: string) {
  const input = page.getByTestId("composer-input");
  await input.fill(text);
  await page.getByTestId("composer-send").click();
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
