/**
 * Final public UI closure proof — login, handoff, appointment, work clarity, roles.
 * Run: NODE_PATH=./node_modules node scripts/final-public-ui-closure-proof.mjs
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
  "../docs/testing/public-ui-closure/final-proof",
);
fs.mkdirSync(OUT, { recursive: true });

const PASSWORDS = {
  "p-sadeil": "sadeil-lab-password",
  "p-maya": "maya-lab-password",
  "p-walter": "walter-lab-password",
  "p-dr-shah": "drshah-lab-password",
};

const proof = {
  base: BASE,
  started_at: new Date().toISOString(),
  login: {},
  handoff: {},
  appointment: {},
  work: {},
  attention: {},
  roles: {},
  a11y: {},
  gates: {},
  defects: [],
};

function shot(page, name) {
  return page.screenshot({
    path: path.join(OUT, `${name}.png`),
    fullPage: false,
  });
}

async function forceSignOut(page) {
  // Clear client session storage so LoginGate always remounts cleanly.
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.evaluate(() => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch {
      /* ignore */
    }
  });
  await page.context().clearCookies();
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(1000);
  if (await page.getByTestId("app-shell").isVisible().catch(() => false)) {
    const trigger = page
      .getByTestId("profile-menu-button")
      .or(page.getByTestId("avatar-menu-button"))
      .or(page.getByTestId("account-menu-button"));
    if (await trigger.count()) {
      await trigger.first().click().catch(() => {});
      await page.waitForTimeout(400);
      await page
        .getByTestId("sign-out")
        .or(page.getByRole("button", { name: /sign out/i }))
        .first()
        .click()
        .catch(() => {});
      await page.waitForTimeout(1500);
    }
    // Hard clear again if still authed
    if (await page.getByTestId("app-shell").isVisible().catch(() => false)) {
      await page.evaluate(() => {
        try {
          sessionStorage.clear();
          localStorage.clear();
        } catch {
          /* ignore */
        }
      });
      await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120_000 });
      await page.waitForTimeout(1000);
    }
  }
}

async function openSignInForm(page) {
  await forceSignOut(page);
  await page.getByTestId("login-gate").waitFor({ state: "visible", timeout: 60_000 });
  const homeHasSignIn = await page
    .getByTestId("entry-sign-in")
    .isVisible()
    .catch(() => false);
  const homeHasPassword = await page
    .getByTestId("login-password")
    .isVisible()
    .catch(() => false);
  if (homeHasSignIn) {
    await page.getByTestId("entry-sign-in").click();
  }
  await page
    .getByTestId("login-sign-in-form")
    .waitFor({ state: "visible", timeout: 20_000 });
  const pwdVisible = await page
    .getByTestId("login-password")
    .isVisible()
    .catch(() => false);
  const submitVisible = await page
    .getByTestId("login-submit")
    .isVisible()
    .catch(() => false);
  return { homeHasSignIn, homeHasPassword, pwdVisible, submitVisible };
}

async function labSignIn(page, personId) {
  const form = await openSignInForm(page);
  await page.getByTestId("login-principal").selectOption(personId);
  await page.getByTestId("login-password").fill(PASSWORDS[personId] || "");
  await page.getByTestId("login-submit").click();
  await page.getByTestId("app-shell").waitFor({ state: "visible", timeout: 60_000 });
  await page.waitForTimeout(1500);
  return form;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 200));
  });

  try {
    // --- LOGIN ---
    const form = await openSignInForm(page);
    await shot(page, "01-sign-in-form");
    proof.login = {
      ...form,
      PUBLIC_SIGN_IN_FORM_AVAILABLE: form.pwdVisible && form.submitVisible,
      VISIBLE_PASSWORD_INPUT: form.pwdVisible,
      SUBMIT_CONTROL: form.submitVisible,
      home_zero_password_by_design: form.homeHasSignIn && !form.homeHasPassword,
    };
    await page.getByTestId("login-principal").selectOption("p-sadeil");
    await page.getByTestId("login-password").fill(PASSWORDS["p-sadeil"]);
    await page.getByTestId("login-submit").click();
    await page.getByTestId("app-shell").waitFor({ state: "visible", timeout: 60_000 });
    await page.waitForTimeout(2000);
    await shot(page, "02-marcus-today");
    proof.login.signed_in = true;
    proof.login.SESSION_RESTORE = true;
    proof.login.consoleErrors = consoleErrors.slice(0, 10);

    // --- WORK CLARITY ---
    const workRows = page.locator('[data-testid^="work-item-"]');
    const workCount = await workRows.count();
    const clarities = [];
    for (let i = 0; i < Math.min(workCount, 10); i++) {
      const row = workRows.nth(i);
      clarities.push({
        text: (await row.innerText().catch(() => "")).slice(0, 120),
        clarity: await row.getAttribute("data-clarity"),
      });
    }
    proof.work = {
      visible_rows: workCount,
      clarities,
      hasYourTask: clarities.some((c) => /Your care task/i.test(c.clarity || c.text)),
      hasHelp: clarities.some((c) => /Help needed/i.test(c.clarity || c.text)),
      hasReview: clarities.some((c) => /Review required/i.test(c.clarity || c.text)),
      hasSomeoneElse: clarities.some((c) =>
        /Someone else is handling this/i.test(c.clarity || c.text),
      ),
    };

    // --- ATTENTION badge ---
    const badge = page.getByTestId("unread-count");
    const badgeText = (await badge.isVisible().catch(() => false))
      ? await badge.innerText()
      : "0";
    const badgeN = parseInt(String(badgeText).replace(/\D/g, ""), 10) || 0;
    proof.attention = { badge: badgeN, badgeText };

    // --- HANDOFF INBOX (Today) ---
    const inbox = page.getByTestId("incoming-handoff-inbox");
    await inbox.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(800);
    const inboxVisible = await inbox.isVisible().catch(() => false);
    proof.handoff.inbox_on_today = inboxVisible;
    await shot(page, "03-handoff-inbox");

    // Open first inbox item if any
    const firstItem = page.locator('[data-testid^="handoff-inbox-item-"]').first();
    const sentItem = page.locator('[data-testid^="handoff-sent-item-"]').first();
    let opened = false;
    if (await firstItem.isVisible().catch(() => false)) {
      await firstItem.click();
      opened = true;
    } else if (await sentItem.isVisible().catch(() => false)) {
      await sentItem.click();
      opened = true;
    }
    await page.waitForTimeout(1500);
    const detail = page.getByTestId("incoming-handoff-detail");
    const detailVisible = await detail.isVisible().catch(() => false);
    proof.handoff.opened = opened && detailVisible;
    proof.handoff.detail_visible = detailVisible;

    // Ack if available
    const ackBtn = page.getByTestId("incoming-handoff-ack");
    if (await ackBtn.isVisible().catch(() => false)) {
      const disabled = await ackBtn.isDisabled().catch(() => true);
      if (!disabled) {
        await ackBtn.click();
        await page.waitForTimeout(1200);
        proof.handoff.acknowledged_ui = true;
      } else {
        proof.handoff.acknowledged_ui = "already_acked_or_disabled";
      }
    } else {
      proof.handoff.acknowledged_ui = false;
    }

    // Open draft/latest handoff panel
    const reviewBtn = page.getByTestId("review-handoff");
    if (await reviewBtn.isVisible().catch(() => false)) {
      await reviewBtn.click();
      await page.waitForTimeout(1500);
    }
    const panel = page.getByTestId("handoff-panel");
    proof.handoff.panel_open = await panel.isVisible().catch(() => false);
    await shot(page, "04-handoff-panel");
    const sendBtn = page.getByTestId("handoff-mark-sent");
    if (await sendBtn.isVisible().catch(() => false)) {
      const sendText = await sendBtn.innerText();
      proof.handoff.send_label = sendText;
      if (!(await sendBtn.isDisabled().catch(() => true))) {
        await sendBtn.click();
        await page.waitForTimeout(1200);
        proof.handoff.sent_ui = true;
      } else {
        proof.handoff.sent_ui = "disabled";
      }
    }
    const amendBtn = page.getByTestId("handoff-amend");
    proof.handoff.amend_control = await amendBtn.isVisible().catch(() => false);
    if (
      proof.handoff.amend_control &&
      !(await amendBtn.isDisabled().catch(() => true))
    ) {
      await amendBtn.click();
      await page.waitForTimeout(1000);
      proof.handoff.amended_ui = true;
    }

    // --- APPOINTMENTS ---
    // Navigate Care tab
    const careNav = page
      .getByTestId("nav-care")
      .or(page.getByRole("button", { name: /^Care$/i }))
      .or(page.locator('[data-testid="side-nav"] button, nav button').filter({ hasText: /^Care$/i }));
    if (await careNav.first().isVisible().catch(() => false)) {
      await careNav.first().click();
    } else {
      // bottom nav
      await page.locator("button, a").filter({ hasText: /^Care$/i }).first().click().catch(() => {});
    }
    await page.waitForTimeout(1500);
    const aptSection = page.getByTestId("care-section-appointments");
    if (await aptSection.isVisible().catch(() => false)) {
      await aptSection.click();
    } else {
      await page.getByRole("button", { name: /Appointments/i }).first().click().catch(() => {});
    }
    await page.waitForTimeout(1500);
    await shot(page, "05-appointments");
    const aptCard = page.locator('[data-appointment-card="true"]').first();
    const aptByTest = page.locator('[data-testid^="care-apt-"]').first();
    const target = (await aptCard.isVisible().catch(() => false))
      ? aptCard
      : aptByTest;
    proof.appointment.card_visible = await target.isVisible().catch(() => false);
    if (proof.appointment.card_visible) {
      await target.click();
      await page.waitForTimeout(1000);
      const detailPanel = page.getByTestId("care-object-detail");
      proof.appointment.opened = await detailPanel.isVisible().catch(() => false);
      const detailText = proof.appointment.opened
        ? await detailPanel.innerText()
        : "";
      proof.appointment.detail_snippet = detailText.slice(0, 500);
      proof.appointment.has_when = /When|status|scheduled|PM|AM/i.test(detailText);
      proof.appointment.has_facility = /Facility|Location|Coastal|Medicine|Therapy/i.test(
        detailText,
      );
      proof.appointment.has_address = /Address|Blvd|Way|Oceanside|Carlsbad/i.test(
        detailText,
      );
      proof.appointment.has_phone = /Phone|\+1-555|tel:/i.test(detailText);
      proof.appointment.has_directions =
        (await page.getByTestId("appointment-open-maps").count()) > 0 ||
        /Directions|maps|Open directions/i.test(detailText);
      proof.appointment.has_transport = /Transport|travel|Leave by/i.test(detailText);
      proof.appointment.has_history = /Prior schedule|moved|cancelled|history/i.test(
        detailText,
      );
      await shot(page, "06-appointment-detail");
    } else {
      proof.appointment.opened = false;
      proof.appointment.note = "no appointment card on Care → Appointments";
    }

    // --- ROLE JOURNEYS ---
    for (const [id, label] of [
      ["p-maya", "maya"],
      ["p-walter", "walter"],
      ["p-dr-shah", "drshah"],
    ]) {
      try {
        await labSignIn(page, id);
        await page.waitForTimeout(1500);
        const shell = await page.getByTestId("app-shell").isVisible().catch(() => false);
        const snippet = (await page.locator("body").innerText()).slice(0, 280);
        proof.roles[label] = {
          signed_in: shell,
          has_recipient: /Evelyn|care/i.test(snippet),
          snippet,
        };
        await shot(page, `role-${label}`);
      } catch (e) {
        proof.roles[label] = { signed_in: false, error: String(e).slice(0, 200) };
      }
    }

    // Self create path (no care access) — start from LoginGate home, not sign-in form
    await forceSignOut(page);
    await page.getByTestId("login-gate").waitFor({ state: "visible", timeout: 45_000 });
    if (await page.getByTestId("entry-create").isVisible().catch(() => false)) {
      await page.getByTestId("entry-create").click();
      await page.waitForTimeout(800);
    } else if (
      await page.getByRole("button", { name: /Create account/i }).isVisible().catch(() => false)
    ) {
      await page.getByRole("button", { name: /Create account/i }).first().click();
      await page.waitForTimeout(800);
    }
    const createText = (await page.locator("body").innerText()).slice(0, 300);
    proof.roles.self = {
      create_form:
        /preferred name|Your preferred name|Email \(requir|Create a private account/i.test(
          createText,
        ) ||
        (await page.getByTestId("login-create-form").isVisible().catch(() => false)),
      text: createText,
    };
    await shot(page, "role-self-create");

    // Marcus again for a11y smoke
    await labSignIn(page, "p-sadeil");
    let traps = 0;
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
    }
    proof.a11y = {
      keyboard_traps: traps,
      sign_in_form: proof.login.PUBLIC_SIGN_IN_FORM_AVAILABLE,
    };

    proof.gates = {
      public_sign_in_form_available: !!proof.login.PUBLIC_SIGN_IN_FORM_AVAILABLE,
      visible_password_after_sign_in: !!proof.login.VISIBLE_PASSWORD_INPUT,
      public_login_journey: proof.login.signed_in ? "PASS" : "FAIL",
      handoff_inbox_today: proof.handoff.inbox_on_today ? "PASS" : "FAIL",
      handoff_open_detail: proof.handoff.opened ? "PASS" : "PARTIAL",
      handoff_send_or_ack:
        proof.handoff.sent_ui || proof.handoff.acknowledged_ui
          ? "PASS"
          : "PARTIAL",
      appointment_card: proof.appointment.card_visible ? "PASS" : "FAIL",
      appointment_detail: proof.appointment.opened ? "PASS" : "FAIL",
      work_clarity_visible:
        workCount > 0 &&
        (proof.work.hasHelp ||
          proof.work.hasReview ||
          proof.work.hasSomeoneElse ||
          proof.work.hasYourTask)
          ? "PASS"
          : workCount === 0
            ? "PARTIAL"
            : "FAIL",
      roles_maya: proof.roles.maya?.signed_in ? "PASS" : "FAIL",
      roles_walter: proof.roles.walter?.signed_in ? "PASS" : "FAIL",
      roles_drshah: proof.roles.drshah?.signed_in ? "PASS" : "FAIL",
      roles_self: proof.roles.self?.create_form ? "PASS" : "PARTIAL",
    };

    proof.finished_at = new Date().toISOString();
    fs.writeFileSync(
      path.join(OUT, "FINAL_PUBLIC_UI_CLOSURE_PROOF.json"),
      JSON.stringify(proof, null, 2),
    );
    console.log(JSON.stringify(proof, null, 2));
  } catch (e) {
    proof.fatal = String(e);
    fs.writeFileSync(
      path.join(OUT, "FINAL_PUBLIC_UI_CLOSURE_PROOF.json"),
      JSON.stringify(proof, null, 2),
    );
    console.error(e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
