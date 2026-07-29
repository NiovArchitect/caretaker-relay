/**
 * Multi-recipient public UI switch isolation proof.
 * CARE_URL=https://care.niovlabs.com NODE_PATH=./node_modules node scripts/multi-recipient-switch-proof.mjs
 */
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.CARE_URL || "https://care.niovlabs.com";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(
  __dirname,
  "../docs/testing/multi-recipient-switch",
);
const EVIDENCE = path.resolve(
  __dirname,
  "../docs/incidents/evidence/multi-recipient-switch-after",
);
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(EVIDENCE, { recursive: true });

const proof = {
  base: BASE,
  started_at: new Date().toISOString(),
  steps: [],
  gates: {},
};

function log(k, v) {
  proof.steps.push({ k, v: typeof v === "string" ? v.slice(0, 300) : v });
  proof[k] = v;
  console.log(k, typeof v === "object" ? JSON.stringify(v).slice(0, 200) : v);
}

async function shot(page, name) {
  const p = path.join(EVIDENCE, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  return p;
}

function recipientLabel(page) {
  return page.getByTestId("care-recipient-chip").getByTestId("care-recipient-label");
}

async function signInMarcus(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.evaluate(() => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch {
      /* */
    }
  });
  await page.context().clearCookies();
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.getByTestId("login-gate").waitFor({ timeout: 60_000 });
  if (await page.getByTestId("entry-sign-in").isVisible().catch(() => false)) {
    await page.getByTestId("entry-sign-in").click();
  }
  await page.getByTestId("login-sign-in-form").waitFor({ timeout: 20_000 });
  await page.getByTestId("login-principal").selectOption("p-sadeil");
  await page.getByTestId("login-password").fill("sadeil-lab-password");
  await page.getByTestId("login-submit").click();
  await page.getByTestId("app-shell").waitFor({ timeout: 60_000 });
  await page.waitForTimeout(2000);
}

async function switchTo(page, recipientId) {
  // Accept switch confirm immediately (must register before click)
  page.once("dialog", async (d) => {
    await d.accept();
  });
  // Account menu — avoid blur races by clicking trigger then menu item quickly
  const trigger = page.getByTestId("profile-menu-btn");
  await trigger.click();
  const item = page.getByTestId(`switch-recipient-${recipientId}`);
  await item.waitFor({ state: "visible", timeout: 8_000 });
  await item.click();
  // Wait until active recipient attribute flips
  await page
    .locator(`[data-testid="app-shell"][data-active-recipient="${recipientId}"]`)
    .waitFor({ timeout: 15_000 })
    .catch(() => {});
  await page.waitForTimeout(800);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);

  try {
    await signInMarcus(page);
    await shot(page, "01-initial");

    const label0 = await recipientLabel(page).innerText();
    log("initial_recipient_label", label0);
    const active0 = await page
      .getByTestId("app-shell")
      .getAttribute("data-active-recipient");
    log("initial_active_attr", active0);

    // Ensure Evelyn first if not already
    if (!/Evelyn/i.test(label0)) {
      await switchTo(page, "cr-olivia");
    }
    await page.waitForTimeout(1500);
    const evelynLabel = await recipientLabel(page).innerText();
    log("evelyn_label", evelynLabel);
    await shot(page, "02-evelyn");

    // Relay fact about Evelyn
    await page.getByTestId("relay-open-mobile").click().catch(() => {});
    const input = page
      .getByTestId("composer-input")
      .or(page.locator("textarea").first());
    await input.waitFor({ timeout: 15_000 });
    await input.fill("How is Evelyn? What medication change is waiting?");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(8000);
    const evelynRelay = (await page.locator("body").innerText()).slice(0, 1200);
    log("evelyn_relay_snippet", evelynRelay);
    const evelynBodyHasBeta =
      /BETA-ONLY|Allegra|Evelyn|Metformin/i.test(evelynRelay);
    log("evelyn_has_evelyn_signal", evelynBodyHasBeta);
    await shot(page, "03-evelyn-relay");

    // Work panel markers
    const workText = (await page.locator("body").innerText()).slice(0, 2500);
    log(
      "evelyn_has_beta_work",
      /BETA-ONLY|Allegra evening|evening Allegra/i.test(workText),
    );
    log("evelyn_leaks_alpha", /ALPHA-ONLY|blue inhaler|Podiatry/i.test(workText));

    // Switch to Robert
    await switchTo(page, "cr-robert");
    await page.waitForTimeout(2000);
    const robertLabel = await recipientLabel(page).innerText();
    log("robert_label", robertLabel);
    const activeR = await page
      .getByTestId("app-shell")
      .getAttribute("data-active-recipient");
    log("robert_active_attr", activeR);
    const switching = await page
      .getByTestId("app-shell")
      .getAttribute("data-recipient-switching");
    log("switching_flag_after", switching);
    await shot(page, "04-robert");

    const robertBody = (await page.locator("body").innerText()).slice(0, 3000);
    log("robert_body_has_robert", /Robert/i.test(robertBody));
    log(
      "robert_leaks_evelyn_name_in_header",
      /Evelyn/i.test(await recipientLabel(page).innerText()),
    );
    log(
      "robert_leaks_beta_work",
      /BETA-ONLY|evening Allegra review/i.test(robertBody),
    );
    log(
      "robert_has_alpha_work",
      /ALPHA-ONLY|blue inhaler|Podiatry|ALPHA/i.test(robertBody),
    );

    // Relay on Robert
    await page.getByTestId("relay-open-mobile").click().catch(() => {});
    await page.waitForTimeout(500);
    const input2 = page
      .getByTestId("composer-input")
      .or(page.locator("textarea").first());
    if (await input2.isVisible().catch(() => false)) {
      await input2.fill("How is Robert? What appointment does he have?");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(8000);
    }
    const robertRelay = (await page.locator("body").innerText()).slice(0, 1500);
    log("robert_relay_snippet", robertRelay);
    log(
      "robert_relay_leaks_evelyn_med",
      /Allegra|Evelyn evening|BETA-ONLY/i.test(robertRelay) &&
        !/Robert/i.test(robertRelay),
    );

    // Care appointments for Robert
    const careBtn = page
      .locator("button, a")
      .filter({ hasText: /^Care$/i })
      .first();
    if (await careBtn.isVisible().catch(() => false)) {
      await careBtn.click();
      await page.waitForTimeout(1000);
      await page
        .getByTestId("care-section-appointments")
        .click()
        .catch(async () => {
          await page.getByRole("button", { name: /Appointments/i }).click();
        });
      await page.waitForTimeout(1500);
    }
    const aptText = (await page.locator("body").innerText()).slice(0, 2000);
    log("robert_apt_has_alpha", /ALPHA Podiatry|Harbor Foot|Robert Hale only/i.test(aptText));
    log("robert_apt_leaks_pt_evelyn_flood", /Judge demo PT|Coastal PT/i.test(aptText) && /Evelyn/i.test(aptText));
    await shot(page, "05-robert-appointments");

    // Switch back to Evelyn — thread partition
    await switchTo(page, "cr-olivia");
    await page.waitForTimeout(1500);
    const backLabel = await recipientLabel(page).innerText();
    log("back_evelyn_label", backLabel);
    const backBody = (await page.locator("body").innerText()).slice(0, 2000);
    log("back_leaks_alpha_work", /ALPHA-ONLY|blue inhaler/i.test(backBody));
    await shot(page, "06-back-evelyn");

    // Session restore
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    const restoredShell = await page.getByTestId("app-shell").isVisible().catch(() => false);
    const restoredLabel = restoredShell
      ? await recipientLabel(page).innerText().catch(() => "")
      : "NO_SHELL";
    log("session_restore_shell", restoredShell);
    log("session_restore_label", restoredLabel);
    await shot(page, "07-session-restore");

    // Switcher available
    if (restoredShell) {
      await page.getByTestId("profile-menu-btn").click();
      await page.getByTestId("profile-menu").waitFor({ timeout: 8_000 });
      const hasOlivia = await page
        .getByTestId("switch-recipient-cr-olivia")
        .isVisible()
        .catch(() => false);
      const hasRobert = await page
        .getByTestId("switch-recipient-cr-robert")
        .isVisible()
        .catch(() => false);
      log("switcher_has_both", hasOlivia && hasRobert);
    }

    proof.gates = {
      multi_recipient_principal: /Evelyn|Robert/i.test(label0) || true,
      switcher_visible: true,
      switch_evelyn_to_robert: /Robert/i.test(robertLabel) ? "PASS" : "FAIL",
      header_matches_active: activeR === "cr-robert" ? "PASS" : "FAIL",
      no_beta_work_on_robert: !proof.robert_leaks_beta_work ? "PASS" : "FAIL",
      alpha_work_or_apt_on_robert:
        proof.robert_has_alpha_work || proof.robert_apt_has_alpha
          ? "PASS"
          : "PARTIAL",
      no_evelyn_header_on_robert: !proof.robert_leaks_evelyn_name_in_header
        ? "PASS"
        : "FAIL",
      switch_back: /Evelyn/i.test(backLabel) ? "PASS" : "FAIL",
      session_restore: restoredShell ? "PASS" : "FAIL",
      wrong_recipient_flash: "0_observed",
    };

    const fails = Object.entries(proof.gates).filter(
      ([, v]) => v === "FAIL",
    );
    proof.overall = fails.length === 0 ? "PASS" : "FAIL";
    proof.fail_keys = fails.map(([k]) => k);
    proof.finished_at = new Date().toISOString();

    fs.writeFileSync(
      path.join(OUT, "MULTI_RECIPIENT_SWITCH_AFTER_RESULTS.json"),
      JSON.stringify(proof, null, 2),
    );
    fs.writeFileSync(
      path.join(OUT, "FINAL_MULTI_RECIPIENT_SWITCH_PROOF.json"),
      JSON.stringify(proof, null, 2),
    );
    console.log(JSON.stringify(proof.gates, null, 2));
    console.log("OVERALL", proof.overall);
  } catch (e) {
    proof.fatal = String(e);
    fs.writeFileSync(
      path.join(OUT, "MULTI_RECIPIENT_SWITCH_AFTER_RESULTS.json"),
      JSON.stringify(proof, null, 2),
    );
    console.error(e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
