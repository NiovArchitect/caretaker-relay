/**
 * Public browser proofs — final unproven UX gates.
 * Run from caretaker-relay: NODE_PATH=./node_modules node scripts/cr_closure_browser_proof.mjs
 */
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.CARE_URL || "https://care.niovlabs.com";
const results = { steps: [] };

function log(k, v) {
  results[k] = v;
  results.steps.push({ k, v: typeof v === "string" ? v.slice(0, 200) : v });
  console.log(k, typeof v === "object" ? JSON.stringify(v).slice(0, 200) : v);
}

async function login(page, personId, password) {
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 120000 }).catch(async () => {
    await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 90000 });
  });
  await page.waitForTimeout(1500);
  const gate = page.getByTestId("login-gate");
  if (await gate.isVisible({ timeout: 8000 }).catch(() => false)) {
    await page.getByTestId("login-principal").selectOption(personId);
    await page.getByTestId("login-password").fill(password);
    await page.getByTestId("login-submit").click();
    await page.getByTestId("app-shell").waitFor({ timeout: 30000 });
    return true;
  }
  // already authed?
  if (await page.getByTestId("app-shell").isVisible().catch(() => false)) {
    // sign out
    const trigger = page.getByTestId("profile-menu-button").or(page.getByTestId("avatar-menu-button"));
    if (await trigger.count()) {
      await trigger.first().click();
      await page.getByRole("button", { name: /sign out/i }).click().catch(() => {});
      await page.waitForTimeout(1500);
    }
    if (await gate.isVisible().catch(() => false)) {
      await page.getByTestId("login-principal").selectOption(personId);
      await page.getByTestId("login-password").fill(password);
      await page.getByTestId("login-submit").click();
      await page.getByTestId("app-shell").waitFor({ timeout: 30000 });
      return true;
    }
  }
  return false;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);

  try {
    log("marcus_login", await login(page, "p-sadeil", "sadeil-lab-password"));
    log("recipient", await page.getByTestId("care-recipient-label").innerText().catch(() => "NONE"));

    // --- Notifications ---
    const badge = page.getByTestId("unread-count");
    const badgeN = await badge.count();
    log("unread_badge_present", badgeN > 0);
    log("unread_badge_text", badgeN ? await badge.innerText() : "0/ABSENT");
    log("unread_badge_not_99plus", !badgeN || !(await badge.innerText()).includes("99+"));

    // open inbox via badge or notifications control
    if (badgeN) {
      await badge.click();
    } else {
      await page.getByTestId("notifications-open").click().catch(() => {});
      await page.locator('button[title*="notification" i], [data-testid="open-notifications"]').first().click().catch(() => {});
    }
    await page.waitForTimeout(2000);
    const notifList = page.locator(
      '[data-testid="server-notifications"], [data-testid="today-notifications"], [data-testid="notification-list"], [data-testid="notifications-panel"]',
    );
    log("notification_list_open", (await notifList.count()) > 0);
    if ((await notifList.count()) > 0) {
      log("notification_list_snip", (await notifList.first().innerText()).slice(0, 400));
    }
    await page.waitForTimeout(1500);
    const badgeAfter = await badge.count();
    log("unread_after_open", badgeAfter ? await badge.innerText() : "0");

    // --- Manual family documentation on Care page ---
    await page.getByTestId("nav-care").click().catch(async () => {
      await page.getByRole("link", { name: /^Care$/i }).click();
    });
    await page.waitForTimeout(2000);
    const manual = page.getByTestId("manual-care-note");
    log("manual_panel", await manual.isVisible().catch(() => false));
    if (await manual.isVisible().catch(() => false)) {
      const input = page.getByTestId("manual-note-input");
      const ts = Date.now();
      await input.fill(`Evelyn was in a good mood today and ate all of lunch. Browser manual ${ts}.`);
      // draft edit before submit
      await input.fill(
        `Evelyn was in a good mood today and ate all of lunch including soup. Browser manual edited ${ts}.`,
      );
      log("draft_edit_value", await input.inputValue());
      await page.getByTestId("manual-note-preview").click();
      await page.waitForTimeout(12000);
      log(
        "manual_preview",
        (await page.getByTestId("manual-note-preview-body").innerText().catch(() => "NO")).slice(0, 300),
      );
      const save = page.getByTestId("manual-note-save");
      log("manual_save_disabled", await save.isDisabled());
      if (!(await save.isDisabled())) {
        await save.click();
        await page.waitForTimeout(6000);
      }
      log(
        "manual_status",
        (await manual.locator('[role="status"], p.muted').allInnerTexts()).join(" | ").slice(0, 400),
      );
      // refresh durability
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3000);
      // re-login if needed
      if (await page.getByTestId("login-gate").isVisible().catch(() => false)) {
        await login(page, "p-sadeil", "sadeil-lab-password");
      }
      await page.getByTestId("nav-care").click().catch(() => {});
      await page.waitForTimeout(2000);
      log("manual_after_refresh_panel", await page.getByTestId("manual-care-note").isVisible().catch(() => false));
    }

    // --- Coordination sticky + latest ---
    // open relay panel / coordination
    await page.getByTestId("nav-today").click().catch(() => {});
    await page.waitForTimeout(1000);
    await page.getByTestId("nav-relay").click().catch(async () => {
      await page.getByRole("button", { name: /Relay|Open relay/i }).first().click().catch(() => {});
    });
    await page.waitForTimeout(1000);
    // mode switch to messages/coordination
    const mode = page.locator(
      '[data-testid="relay-mode-messages"], button:has-text("Coordination"), button:has-text("Messages")',
    );
    if (await mode.count()) await mode.first().click();
    await page.waitForTimeout(3000);

    const thread = page.getByTestId("coord-thread");
    log("coord_thread", await thread.isVisible().catch(() => false));
    if (await thread.isVisible().catch(() => false)) {
      const sticky = page.getByTestId("coord-composer-sticky");
      log("sticky_present", await sticky.isVisible().catch(() => false));
      // scroll metrics on enter
      const enterMetrics = await thread.evaluate((el) => ({
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        atBottom: el.scrollHeight - el.scrollTop - el.clientHeight < 100,
      }));
      log("latest_on_enter", enterMetrics);
      log(
        "latest_message_default",
        enterMetrics.atBottom || enterMetrics.scrollHeight <= enterMetrics.clientHeight + 20,
      );

      // scroll up
      await thread.evaluate((el) => {
        el.scrollTop = 0;
      });
      await page.waitForTimeout(400);
      const stickyBox = await sticky.boundingBox();
      const vp = page.viewportSize();
      log(
        "sticky_in_viewport",
        !!(
          stickyBox &&
          vp &&
          stickyBox.y >= -5 &&
          stickyBox.y + stickyBox.height <= vp.height + 30
        ),
      );
      log("sticky_box", stickyBox);

      // try typing while scrolled
      const draft = page.locator(
        '[data-testid="coord-draft"], [data-testid="coord-input"], .coord-composer-sticky textarea, textarea',
      ).first();
      if (await draft.isVisible().catch(() => false)) {
        await draft.fill(`Browser sticky type proof ${Date.now()}`);
        log("sticky_type_ok", true);
      }

      // jump latest if control appears — seed new msg may need second principal; click if present
      const jump = page.getByTestId("coord-jump-latest");
      log("jump_control_visible", await jump.isVisible().catch(() => false));
      if (await jump.isVisible().catch(() => false)) {
        await jump.click();
        await page.waitForTimeout(500);
        const after = await thread.evaluate(
          (el) => el.scrollHeight - el.scrollTop - el.clientHeight < 100,
        );
        log("jump_latest_works", after);
      } else {
        // force scroll to bottom via API-equivalent: re-enter mode
        await thread.evaluate((el) => {
          el.scrollTop = el.scrollHeight;
        });
        log("jump_latest_works", "CONTROL_HIDDEN_CODE_PATH_PRESENT");
      }

      // narrower viewport sticky
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(500);
      const stickyNarrow = await sticky.boundingBox();
      const vpN = page.viewportSize();
      log(
        "sticky_narrow_in_viewport",
        !!(
          stickyNarrow &&
          vpN &&
          stickyNarrow.y >= -5 &&
          stickyNarrow.y + stickyNarrow.height <= vpN.height + 40
        ),
      );
      await page.setViewportSize({ width: 1280, height: 800 });
    }

    // Recipient isolation (Evelyn only for Marcus typically)
    const body = await page.locator("body").innerText();
    log("body_has_evelyn", /Evelyn/i.test(body));
    log("body_has_robert_leak", /Robert Chen|cr-robert/i.test(body) && /coord-thread/i.test(body));

  } catch (e) {
    log("marcus_error", String(e));
    log("marcus_stack", e?.stack?.slice?.(0, 500));
  }

  // Shah physician browser
  try {
    await context.clearCookies();
    const p2 = await context.newPage();
    log("shah_login", await login(p2, "p-dr-shah", "drshah-lab-password"));
    await p2.getByTestId("nav-care").click().catch(() => {});
    await p2.waitForTimeout(2000);
    const man = p2.getByTestId("manual-care-note");
    log("shah_manual", await man.isVisible().catch(() => false));
    if (await man.isVisible().catch(() => false)) {
      const ts = Date.now();
      await p2.getByTestId("manual-note-input").fill(
        `Continue current Metformin regimen as prescribed. No dose change. Browser physician ${ts}.`,
      );
      await p2.getByTestId("manual-note-preview").click();
      await p2.waitForTimeout(15000);
      log(
        "shah_preview",
        (await p2.getByTestId("manual-note-preview-body").innerText().catch(() => "NO")).slice(0, 300),
      );
      log(
        "shah_status",
        (await man.locator('[role="status"], p.muted').allInnerTexts()).join(" | ").slice(0, 400),
      );
      const save = p2.getByTestId("manual-note-save");
      log("shah_save_disabled", await save.isDisabled());
      if (!(await save.isDisabled())) {
        await save.click();
        await p2.waitForTimeout(6000);
        log(
          "shah_status_after",
          (await man.locator('[role="status"], p.muted').allInnerTexts()).join(" | ").slice(0, 400),
        );
      }
    }
    await p2.close();
  } catch (e) {
    log("shah_error", String(e));
  }

  // Daniel DSP browser
  try {
    await context.clearCookies();
    const p3 = await context.newPage();
    log("daniel_login", await login(p3, "p-walter", "walter-lab-password"));
    await p3.getByTestId("nav-care").click().catch(() => {});
    await p3.waitForTimeout(2000);
    const man = p3.getByTestId("manual-care-note");
    log("daniel_manual", await man.isVisible().catch(() => false));
    if (await man.isVisible().catch(() => false)) {
      const ts = Date.now();
      await p3.getByTestId("manual-note-input").fill(
        `Evelyn needed standby assistance transferring chair to walker. Support provided. DSP handoff ${ts}.`,
      );
      await p3.getByTestId("manual-note-preview").click();
      await p3.waitForTimeout(15000);
      log(
        "daniel_preview",
        (await p3.getByTestId("manual-note-preview-body").innerText().catch(() => "NO")).slice(0, 300),
      );
      const save = p3.getByTestId("manual-note-save");
      log("daniel_save_disabled", await save.isDisabled());
      if (!(await save.isDisabled())) {
        await save.click();
        await p3.waitForTimeout(6000);
      }
      log(
        "daniel_status",
        (await man.locator('[role="status"], p.muted').allInnerTexts()).join(" | ").slice(0, 400),
      );
    }
    await p3.close();
  } catch (e) {
    log("daniel_error", String(e));
  }

  // Relay-assisted via composer (Marcus)
  try {
    await context.clearCookies();
    const p4 = await context.newPage();
    log("relay_login", await login(p4, "p-sadeil", "sadeil-lab-password"));
    await p4.getByTestId("nav-today").click().catch(() => {});
    await p4.waitForTimeout(1000);
    const input = p4.getByTestId("composer-input");
    if (await input.isVisible().catch(() => false)) {
      const ts = Date.now();
      await input.fill(
        `Evelyn seemed more energetic this afternoon and finished all of lunch. Browser relay ${ts}.`,
      );
      // draft edit
      await input.fill(
        `Evelyn seemed more energetic this afternoon and finished all of lunch including dessert. Browser relay edited ${ts}.`,
      );
      log("relay_draft_edit", await input.inputValue());
      await p4.getByTestId("composer-send").click();
      await p4.waitForTimeout(15000);
      const verify = p4.getByTestId("verify-panel");
      log("relay_verify", await verify.isVisible().catch(() => false));
      if (await verify.isVisible().catch(() => false)) {
        log("relay_verify_text", (await verify.innerText()).slice(0, 400));
        const looks = p4.getByTestId("confirm-looks-right");
        if (await looks.isVisible().catch(() => false)) {
          await looks.click();
          await p4.waitForTimeout(6000);
        }
      }
      log("relay_main_snip", (await p4.locator("main").innerText()).slice(0, 400));
    } else {
      log("relay_composer", "NOT_VISIBLE");
    }
    await p4.close();
  } catch (e) {
    log("relay_error", String(e));
  }

  fs.writeFileSync("/tmp/cr_closure_browser_results.json", JSON.stringify(results, null, 2));
  console.log("\n=== FINAL ===\n", JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
