import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@caretaker-relay/care-domain": resolve(
        __dirname,
        "../caretaker-relay-foundation/packages/care-domain/src/index.ts",
      ),
      "@caretaker-relay/product-identity": resolve(
        __dirname,
        "../caretaker-relay-foundation/packages/product-identity/src/index.ts",
      ),
    },
  },
  server: {
    port: 5180,
    strictPort: true,
  },
  preview: {
    port: 5180,
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
