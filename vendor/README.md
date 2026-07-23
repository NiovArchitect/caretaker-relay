# Vendored care packages

**DEPLOYMENT REQUIREMENT** — not product redesign.

Render static builds only clone `caretaker-relay`. They cannot resolve `file:../caretaker-relay-foundation/...`.

`vendor/care-domain` and `vendor/product-identity` are copies of the foundation packages at the research freeze line (re-sync with `npm run vendor:care-packages` after foundation care changes).

Do not invent a second care domain here. Refresh from foundation.
