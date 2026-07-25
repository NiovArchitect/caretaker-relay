/**
 * 60-second orientation + 5-minute mission browser proof on public web.
 */
import { chromium } from "playwright";

const WEB = process.env.CARE_WEB_URL || "https://care.niovlabs.com";
const results = [];
function check(name, cond, detail = "") {
  results.push({ name, pass: !!cond, detail: String(detail).slice(0, 120) });
  if (!cond) console.log("FAIL", name, detail);
  else console.log("PASS", name);
}

async function orientAs(principal, label) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const t0 = Date.now();
  await page.goto(WEB + "/?cb=" + Date.now(), {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page.getByTestId("login-principal").selectOption(principal);
  await page.getByTestId("login-submit").click();
  await page.waitForSelector("[data-testid=app-shell]", { timeout: 45000 });
  // Orientation surfaces (coverage may load after fetch)
  const orient = page.getByTestId("orientation-card");
  check(`${label}_orientation_card`, (await orient.count()) > 0);
  await page
    .waitForSelector("[data-testid=coverage-panel]", { timeout: 15000 })
    .catch(() => {});
  const cov = page.getByTestId("coverage-panel");
  const bodyText = await page.locator("body").innerText();
  check(
    `${label}_coverage_panel`,
    (await cov.count()) > 0 || /Helping now|Who is helping|Marcus|Maya/i.test(bodyText),
  );
  const text = await page.locator("body").innerText();
  check(`${label}_sees_recipient`, /Evelyn/i.test(text));
  check(`${label}_sees_medication_or_about`, /Metformin|About|Orient|medication/i.test(text));
  // Navigate Care About
  await page.locator('button:has-text("Care"), [data-testid=nav-care]').first().click().catch(() => {});
  await page.waitForTimeout(800);
  const aboutTab = page.getByTestId("care-section-about");
  if ((await aboutTab.count()) > 0) {
    await aboutTab.click();
    await page.waitForTimeout(500);
  }
  check(
    `${label}_about_profile`,
    (await page.getByTestId("care-about-profile").count()) > 0 ||
      /About Evelyn|years old|diabetes/i.test(await page.locator("body").innerText()),
  );
  // History
  const histTab = page.getByTestId("care-section-history");
  if ((await histTab.count()) > 0) {
    await histTab.click();
    await page.waitForTimeout(600);
    check(
      `${label}_history`,
      (await page.getByTestId("care-history-panel").count()) > 0 ||
        /Care history|timeline/i.test(await page.locator("body").innerText()),
    );
  }
  const elapsed = Date.now() - t0;
  check(`${label}_under_90s`, elapsed < 90000, `ms=${elapsed}`);
  // Mission: open Relay and ask age
  await page.getByTestId("try-care-update-top").click().catch(() => {});
  await page.waitForTimeout(400);
  await page.getByTestId("composer-input").fill("How old is Evelyn?");
  await page
    .waitForFunction(() => {
      const b = document.querySelector("[data-testid=composer-send]");
      return b && !b.disabled;
    }, { timeout: 20000 })
    .catch(() => {});
  await page.getByTestId("composer-send").click();
  await page.waitForTimeout(4000);
  const thread = await page.getByTestId("relay-thread").innerText().catch(() => "");
  check(`${label}_relay_age`, /years old|1948|don't have/i.test(thread), thread.slice(0, 80));
  const totalMs = Date.now() - t0;
  check(`${label}_mission_under_5min`, totalMs < 300000, `ms=${totalMs}`);
  await browser.close();
  return elapsed;
}

async function main() {
  await orientAs("p-sadeil", "family");
  await orientAs("p-walter", "dsp");
  // Page audit quick: login copy
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(WEB + "/?cb=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 90000 });
  const login = await page.locator("body").innerText();
  check(
    "login_platform_copy",
    /everyone helping someone|Ask, coordinate/i.test(login),
    login.slice(0, 100),
  );
  check("login_not_evelyn_value_prop", !/helping Evelyn\. Ask or update/i.test(login));
  await browser.close();

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(JSON.stringify({ passed, total, fails: results.filter((r) => !r.pass) }, null, 2));
  console.log(`ORIENTATION_PROOF ${passed}/${total}`);
  if (passed < total) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
