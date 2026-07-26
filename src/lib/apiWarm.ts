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
      // Parallel wake: health + principals (cheap) so login does not pay cold start alone.
      await Promise.allSettled([
        fetch(`${base}/api/v1/health`, { method: "GET", cache: "no-store" }),
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
