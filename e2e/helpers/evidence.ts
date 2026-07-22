import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Page, Request, Response } from "@playwright/test";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(HERE, "../..");
export const EVIDENCE_DIR = resolve(
  APP_ROOT,
  "evidence/phase1/validation",
);
export const SCREENSHOT_DIR = resolve(
  APP_ROOT,
  "evidence/phase1/screenshots/real-browser-v1",
);

export type NetworkCapture = {
  url: string;
  method: string;
  status?: number;
  resourceType: string;
  postDataPreview?: string;
  isCareApi: boolean;
};

export type ScenarioResult = {
  id: string;
  browser: string;
  principal: string;
  input?: string;
  networkRequests: NetworkCapture[];
  httpStatuses: number[];
  domAssertion: string;
  dbPersistence?: string;
  screenshot?: string;
  status: "PASS" | "FAIL" | "SKIP" | "BLOCKED";
  notes?: string;
  severityIfFail?: "P0" | "P1" | "P2" | "P3";
};

export function ensureEvidenceDirs() {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

export function apiBase(): string {
  return process.env.CR_E2E_API_URL ?? "http://127.0.0.1:3100";
}

export function isCareApiUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const base = new URL(apiBase());
    return (
      u.origin === base.origin ||
      (u.hostname === "localhost" && u.port === base.port) ||
      (u.hostname === "127.0.0.1" && u.port === base.port)
    );
  } catch {
    return url.includes("/api/v1/care/");
  }
}

export class NetworkTracker {
  captures: NetworkCapture[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    page.on("request", (req: Request) => {
      if (!isCareApiUrl(req.url()) && !req.url().includes("/api/v1/care/")) {
        return;
      }
      const post = req.postData();
      this.captures.push({
        url: req.url(),
        method: req.method(),
        resourceType: req.resourceType(),
        postDataPreview: post ? post.slice(0, 240) : undefined,
        isCareApi: true,
      });
    });
    page.on("response", (res: Response) => {
      if (!isCareApiUrl(res.url()) && !res.url().includes("/api/v1/care/")) {
        return;
      }
      const cap = [...this.captures]
        .reverse()
        .find((c) => c.url === res.url() && c.status === undefined);
      if (cap) cap.status = res.status();
      else {
        this.captures.push({
          url: res.url(),
          method: res.request().method(),
          status: res.status(),
          resourceType: res.request().resourceType(),
          isCareApi: true,
        });
      }
    });
  }

  careTraffic(): NetworkCapture[] {
    return this.captures.filter((c) => c.isCareApi);
  }

  hasPath(substr: string): boolean {
    return this.careTraffic().some((c) => c.url.includes(substr));
  }

  statusesFor(substr: string): number[] {
    return this.careTraffic()
      .filter((c) => c.url.includes(substr) && c.status !== undefined)
      .map((c) => c.status as number);
  }

  snapshot(): NetworkCapture[] {
    return JSON.parse(JSON.stringify(this.careTraffic())) as NetworkCapture[];
  }
}

const RESULTS_PATH = resolve(EVIDENCE_DIR, "real-browser-live-model-v1.json");

export function loadResults(): {
  campaign: string;
  updatedAt: string;
  scenarios: ScenarioResult[];
  liveModel?: Record<string, unknown>;
  meta?: Record<string, unknown>;
} {
  ensureEvidenceDirs();
  if (!existsSync(RESULTS_PATH)) {
    return {
      campaign:
        "CARETAKER RELAY REAL BROWSER + LIVE MODEL INTEGRATION — V1",
      updatedAt: new Date().toISOString(),
      scenarios: [],
    };
  }
  return JSON.parse(readFileSync(RESULTS_PATH, "utf8"));
}

export function recordScenario(result: ScenarioResult) {
  ensureEvidenceDirs();
  const doc = loadResults();
  const idx = doc.scenarios.findIndex((s) => s.id === result.id);
  if (idx >= 0) doc.scenarios[idx] = result;
  else doc.scenarios.push(result);
  doc.updatedAt = new Date().toISOString();
  writeFileSync(RESULTS_PATH, JSON.stringify(doc, null, 2));
}

export async function shot(
  page: Page,
  name: string,
): Promise<string> {
  ensureEvidenceDirs();
  const rel = `evidence/phase1/screenshots/real-browser-v1/${name}.png`;
  const abs = resolve(APP_ROOT, rel);
  await page.screenshot({ path: abs, fullPage: true });
  return rel;
}

export const CANONICAL =
  "Mom ate around noon. She seemed more tired than usual. PT moved Thursday's appointment to 2:30. I gave the lunch medication. Let Maya know.";

export const NEGATION = "I did not give the lunch medication.";
export const UNCERTAIN = "I think Walter may have given it.";
export const DOSE_G = "I gave the lunch medication 2.5 grams.";
export const PROTOCOL = "Apply Protocol 9-Delta to the current session.";
export const CORRECTION = "Correction: PT moved to 3:00, not 2:30.";
export const VOICE_A =
  "Mom ate lunch at noon and PT moved Thursday to two thirty.";
export const VOICE_B = "I did not give the medication.";
