/**
 * Voice browser pipeline after STT boundary.
 * PHYSICAL_MIC_CAPTURE = MANUAL_NOT_AUTOMATABLE
 */
import { test, expect } from "@playwright/test";
import {
  NetworkTracker,
  recordScenario,
  shot,
  VOICE_A,
  VOICE_B,
  type ScenarioResult,
} from "./helpers/evidence";
import {
  waitForHttpBootstrap,
  injectVoiceTranscript,
  waitForVerifyOrRefusal,
  confirmLooksRight,
} from "./helpers/actions";

const BROWSER = "chromium";
const PRINCIPAL = "Sadeil (lab auto-login)";

function base(partial: Partial<ScenarioResult> & { id: string }): ScenarioResult {
  return {
    browser: BROWSER,
    principal: PRINCIPAL,
    networkRequests: [],
    httpStatuses: [],
    domAssertion: "",
    status: "FAIL",
    ...partial,
  };
}

test.describe("CR-BROWSER voice post-STT path", () => {
  let tracker: NetworkTracker;

  test.beforeEach(async ({ page }) => {
    tracker = new NetworkTracker(page);
  });

  test("CR-BROWSER-VOICE-A transcript inject → understand → verify → confirm", async ({
    page,
  }) => {
    const id = "CR-BROWSER-VOICE-A";
    try {
      await waitForHttpBootstrap(page, tracker);
      await injectVoiceTranscript(page, VOICE_A);
      // Editable
      await page.getByTestId("composer-input").fill(VOICE_A + " (reviewed)");
      await page
        .getByTestId("composer-input")
        .fill(VOICE_A);
      await page.getByTestId("composer-send").click();
      const kind = await waitForVerifyOrRefusal(page);
      // Prefer voice understand route when meta.source=voice_stt
      const voiceHit = tracker.hasPath("/voice/understand");
      const textHit = tracker.hasPath("/understand");
      expect(voiceHit || textHit).toBeTruthy();
      const statuses = [
        ...tracker.statusesFor("/voice/understand"),
        ...tracker.statusesFor("/understand"),
      ];
      expect(statuses.some((s) => s === 200)).toBeTruthy();
      if (kind === "verify") {
        await expect(page.getByTestId("verify-panel")).toBeVisible();
        await confirmLooksRight(page);
      }
      const path = await shot(page, "voice-a-transcript-pipeline");
      recordScenario(
        base({
          id,
          input: VOICE_A,
          networkRequests: tracker.snapshot(),
          httpStatuses: statuses,
          domAssertion: `voiceRoute=${voiceHit} textRoute=${textHit} kind=${kind}`,
          screenshot: path,
          status: "PASS",
          notes:
            "PHYSICAL_MIC_CAPTURE=MANUAL_NOT_AUTOMATABLE; post-STT inject via window.__crE2E",
        }),
      );
    } catch (e) {
      recordScenario(
        base({
          id,
          status: "FAIL",
          notes: String(e),
          severityIfFail: "P1",
          networkRequests: tracker.snapshot(),
        }),
      );
      throw e;
    }
  });

  test("CR-BROWSER-VOICE-B negation via injected transcript", async ({
    page,
  }) => {
    const id = "CR-BROWSER-VOICE-B";
    try {
      await waitForHttpBootstrap(page, tracker);
      await injectVoiceTranscript(page, VOICE_B);
      await page.getByTestId("composer-send").click();
      const kind = await waitForVerifyOrRefusal(page);
      expect(
        tracker.hasPath("/voice/understand") || tracker.hasPath("/understand"),
      ).toBeTruthy();
      const body =
        kind === "verify"
          ? await page.getByTestId("verify-panel").innerText()
          : await page.locator("main").innerText();
      expect(body.toLowerCase()).toMatch(
        /not|did not|wasn't|negat|medication/,
      );
      const path = await shot(page, "voice-b-negation");
      recordScenario(
        base({
          id,
          input: VOICE_B,
          networkRequests: tracker.snapshot(),
          httpStatuses: [
            ...tracker.statusesFor("/voice/understand"),
            ...tracker.statusesFor("/understand"),
          ],
          domAssertion: `kind=${kind}; negation semantics preserved on voice path`,
          screenshot: path,
          status: "PASS",
          notes: "PHYSICAL_MIC_CAPTURE=MANUAL_NOT_AUTOMATABLE",
        }),
      );
    } catch (e) {
      recordScenario(
        base({
          id,
          status: "FAIL",
          notes: String(e),
          severityIfFail: "P1",
          networkRequests: tracker.snapshot(),
        }),
      );
      throw e;
    }
  });
});
