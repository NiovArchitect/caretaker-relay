import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.CR_E2E_BASE_URL ?? "http://127.0.0.1:5180";
const API_URL = process.env.CR_E2E_API_URL ?? "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  reporter: [
    ["list"],
    ["json", { outputFile: "evidence/phase1/validation/playwright-raw.json" }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "off",
    video: "off",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  metadata: {
    apiUrl: API_URL,
    campaign: "CARETAKER RELAY REAL BROWSER + LIVE MODEL INTEGRATION — V1",
  },
});
