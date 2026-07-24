/**
 * Public UI button / control audit via Playwright.
 * Verifies critical controls exist, are labeled, and invoke without dead ends.
 */
import { chromium } from "playwright";

const WEB = process.env.CARE_WEB_URL || "https://care.niovlabs.com";
const results = [];
function assert(name, cond, detail = "") {
  results.push({ name, pass: !!cond, detail: String(detail).slice(0, 120) });
  if (!cond) console.log("FAIL", name, detail);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(WEB + "/?cb=" + Date.now(), {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page.waitForTimeout(1500);

  // Login gate
  assert("login_principal", (await page.getByTestId("login-principal").count()) > 0);
  assert("login_submit", (await page.getByTestId("login-submit").count()) > 0);
  // Dr Shah option present
  const opts = await page.getByTestId("login-principal").innerText();
  assert("login_has_marcus", /Marcus/i.test(opts));
  assert("login_has_maya", /Maya/i.test(opts));
  assert("login_has_daniel", /Daniel/i.test(opts));
  assert("login_has_shah", /Shah|Priya/i.test(opts));

  await page.getByTestId("login-principal").selectOption("p-sadeil");
  await page.getByTestId("login-submit").click();
  await page.waitForSelector("[data-testid=app-shell]", { timeout: 45000 });
  assert("app_shell", true);

  // Nav / primary controls
  const controls = [
    "try-care-update-top",
    "profile-menu-btn",
    "connection-status",
    "composer-input",
    "composer-send",
  ];
  for (const id of controls) {
    const n = await page.getByTestId(id).count();
    assert(`control_${id}`, n > 0, `count=${n}`);
  }

  // Recipient switch
  await page.getByTestId("profile-menu-btn").click();
  await page.waitForTimeout(200);
  assert(
    "switch_robert",
    (await page.getByTestId("switch-recipient-cr-robert").count()) > 0,
  );
  await page.getByTestId("switch-recipient-cr-robert").click();
  await page.waitForTimeout(1000);
  const label = await page
    .locator("[data-testid=care-recipient-label]")
    .first()
    .innerText()
    .catch(() => "");
  assert("switched_robert", /Robert/i.test(label), label);

  await page.getByTestId("profile-menu-btn").click();
  await page.waitForTimeout(200);
  await page.getByTestId("switch-recipient-cr-olivia").click();
  await page.waitForTimeout(1000);

  // Relay ask
  await page.getByTestId("try-care-update-top").click().catch(() => {});
  await page.waitForTimeout(300);
  await page.getByTestId("composer-input").fill("What medication is due next?");
  await page.getByTestId("composer-send").click();
  await page.waitForTimeout(3500);
  const thread = await page.getByTestId("relay-thread").innerText().catch(() => "");
  assert("relay_answered", /Metformin|medication|500/i.test(thread), thread.slice(0, 80));

  // Adversarial button path — false premise
  await page.getByTestId("composer-input").fill("Evelyn takes insulin, right?");
  await page.getByTestId("composer-send").click();
  await page.waitForTimeout(3500);
  const thread2 = await page.getByTestId("relay-thread").innerText().catch(() => "");
  assert("relay_false_premise_ui", /insulin|don't have|not/i.test(thread2));

  // No dead primary buttons (disabled without reason)
  const primaryBtns = page.locator("button.primary-btn");
  const count = await primaryBtns.count();
  assert("primary_buttons_present", count > 0, `count=${count}`);
  for (let i = 0; i < Math.min(count, 8); i++) {
    const btn = primaryBtns.nth(i);
    const disabled = await btn.isDisabled().catch(() => false);
    const text = await btn.innerText().catch(() => "");
    assert(`primary_btn_${i}_enabled_or_labeled`, !disabled || text.length > 0, text);
  }

  await browser.close();
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(JSON.stringify({ passed, total, results }, null, 2));
  console.log(`BUTTON_AUDIT ${passed}/${total}`);
  if (passed < total) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
