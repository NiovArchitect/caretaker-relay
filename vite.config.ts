import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Prefer vendored packages (standalone Render/static deploy). Local monorepo
      // re-sync via `npm run vendor:care-packages`.
      "@caretaker-relay/care-domain": resolve(
        __dirname,
        "vendor/care-domain/src/index.ts",
      ),
      "@caretaker-relay/product-identity": resolve(
        __dirname,
        "vendor/product-identity/src/index.ts",
      ),
    },
  },
  server: {
    port: 5180,
    strictPort: true,
    // Optional same-origin proxy; browser still uses VITE_CARE_API_URL when set.
    proxy: {
      "/api/v1/care": {
        target: process.env.CARE_PROXY_TARGET ?? process.env.VITE_CARE_API_URL ?? "http://127.0.0.1:3100",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5180,
  },
  test: {
    environment: "jsdom",
    globals: true,
    // Playwright E2E lives under e2e/ — do not collect with Vitest
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",
      "**/*.spec.ts",
    ],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
  },
});

