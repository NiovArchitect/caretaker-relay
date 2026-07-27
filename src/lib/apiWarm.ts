/**
 * Connection warming for cold Render free-tier API.
 * Fire-and-forget; never blocks UI construction.
 */

import { getCareApiBaseUrl } from "../foundation/careHttpClient";

let warmPromise: Promise<void> | null = null;
let lastWarmAt = 0;

export function warmCareApi(force = false): Promise<void> {
  const now = Date.now();
  if (!force && warmPromise && now - lastWarmAt < 60_000) {
    return warmPromise;
  }
  lastWarmAt = now;
  const base = getCareApiBaseUrl();
  warmPromise = (async () => {
    try {
      // Parallel wake: care health + principals (cheap). Never block login submit on this.
      await Promise.allSettled([
        fetch(`${base}/api/v1/care/health`, { method: "GET", cache: "no-store" }),
        fetch(`${base}/api/v1/care/auth/lab-principals`, {
          method: "GET",
          cache: "no-store",
        }),
      ]);
    } catch {
      /* ignore — login will surface real errors */
    }
  })();
  return warmPromise;
}
