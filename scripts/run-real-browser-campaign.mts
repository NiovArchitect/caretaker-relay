/**
 * Finite lifecycle: start Care API + Vite → Playwright → live model probe → stop.
 * Never blocks on process exit as success.
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  startCareApi,
  startViteApp,
  stopAllCareDevServices,
  isPortListening,
  waitForHealth,
} from "../../caretaker-relay-foundation/scripts/lib/dev-service-lifecycle.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(HERE, "..");
const EVIDENCE = resolve(APP_ROOT, "evidence/phase1/validation");
const SCREENSHOTS = resolve(
  APP_ROOT,
  "evidence/phase1/screenshots/real-browser-v1",
);

function run(
  cmd: string,
  args: string[],
  opts?: { cwd?: string; env?: NodeJS.ProcessEnv; timeoutMs?: number },
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolveP) => {
    const child = spawn(cmd, args, {
      cwd: opts?.cwd ?? APP_ROOT,
      env: { ...process.env, ...opts?.env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => {
      stdout += String(d);
      process.stdout.write(d);
    });
    child.stderr?.on("data", (d) => {
      stderr += String(d);
      process.stderr.write(d);
    });
    const timer =
      opts?.timeoutMs && opts.timeoutMs > 0
        ? setTimeout(() => {
            try {
              child.kill("SIGTERM");
            } catch {
              /* ignore */
            }
          }, opts.timeoutMs)
        : null;
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      resolveP({ code: code ?? 1, stdout, stderr });
    });
  });
}

async function main() {
  mkdirSync(EVIDENCE, { recursive: true });
  mkdirSync(SCREENSHOTS, { recursive: true });

  const leave = process.env.LEAVE_SERVICES === "1";
  console.log("=== REAL BROWSER + LIVE MODEL V1 CAMPAIGN ===");
  console.log("Stopping any prior care-api/vite-app…");
  await stopAllCareDevServices();

  if (!isPortListening(5434)) {
    console.error("FATAL: Postgres on 5434 not listening");
    process.exit(2);
  }

  console.log("Starting care-api on 3100…");
  const api = await startCareApi({ port: 3100 });
  console.log("care-api up", { pid: api.pid });

  console.log("Starting vite-app on 5180…");
  const vite = await startViteApp({
    port: 5180,
    apiUrl: "http://127.0.0.1:3100",
  });
  console.log("vite-app up", { pid: vite.pid });

  // Double-check health
  const h = await waitForHealth("http://127.0.0.1:3100/api/v1/care/health", {
    timeoutMs: 10_000,
    expectBodyMatch: /caretaker-relay/,
  });
  if (!h.ok) {
    console.error("API health failed", h);
    if (!leave) await stopAllCareDevServices();
    process.exit(3);
  }

  // Seed/probe store backend
  try {
    const healthBody = JSON.parse(h.body ?? "{}") as Record<string, unknown>;
    console.log("API health:", {
      product_id: healthBody.product_id,
      durable: healthBody.durable,
      store: healthBody.store_backend ?? healthBody.store,
    });
  } catch {
    /* ignore */
  }

  console.log("Running Playwright CR-BROWSER suite…");
  const pw = await run(
    "npx",
    ["playwright", "test", "--config=playwright.config.ts"],
    {
      cwd: APP_ROOT,
      env: {
        CR_E2E_BASE_URL: "http://127.0.0.1:5180",
        CR_E2E_API_URL: "http://127.0.0.1:3100",
      },
      timeoutMs: 600_000,
    },
  );

  console.log("Live model credential probe…");
  const live = await run("npx", ["tsx", "scripts/live-model-probe.mts"], {
    cwd: APP_ROOT,
    env: {
      CR_E2E_API_URL: "http://127.0.0.1:3100",
    },
    timeoutMs: 120_000,
  });

  // Continuity: restart API, re-check health + optional narrow today
  console.log("API restart continuity check…");
  await stopAllCareDevServices();
  // vite was stopped; restart both for final health then stop
  const api2 = await startCareApi({ port: 3100 });
  const vite2 = await startViteApp({
    port: 5180,
    apiUrl: "http://127.0.0.1:3100",
  });
  const h2 = await waitForHealth("http://127.0.0.1:3100/api/v1/care/health", {
    timeoutMs: 20_000,
    expectBodyMatch: /caretaker-relay/,
  });
  console.log("post-restart health ok?", h2.ok, "api2", api2.pid, "vite2", vite2.pid);

  // Merge campaign meta
  const outPath = resolve(EVIDENCE, "real-browser-live-model-v1.json");
  let doc: Record<string, unknown> = {
    campaign: "CARETAKER RELAY REAL BROWSER + LIVE MODEL INTEGRATION — V1",
    scenarios: [],
  };
  if (existsSync(outPath)) {
    doc = JSON.parse(readFileSync(outPath, "utf8")) as Record<string, unknown>;
  }
  doc.meta = {
    playwrightExitCode: pw.code,
    liveProbeExitCode: live.code,
    apiRestartHealth: h2.ok,
    finishedAt: new Date().toISOString(),
    ports: { api: 3100, vite: 5180, db: 5434 },
    finiteLifecycle: true,
  };
  const scenarios = (doc.scenarios as Array<{ status: string }>) ?? [];
  doc.summary = {
    total: scenarios.length,
    pass: scenarios.filter((s) => s.status === "PASS").length,
    fail: scenarios.filter((s) => s.status === "FAIL").length,
    skip: scenarios.filter((s) => s.status === "SKIP").length,
    blocked: scenarios.filter((s) => s.status === "BLOCKED").length,
  };
  writeFileSync(outPath, JSON.stringify(doc, null, 2));

  if (!leave) {
    console.log("Stopping services…");
    await stopAllCareDevServices();
    console.log("3100 free?", !isPortListening(3100));
    console.log("5180 free?", !isPortListening(5180));
  } else {
    console.log("LEAVE_SERVICES=1 — leaving detached servers up");
  }

  console.log("=== CAMPAIGN HARNESS DONE ===");
  console.log("playwright exit", pw.code);
  process.exit(pw.code === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  try {
    await stopAllCareDevServices();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
