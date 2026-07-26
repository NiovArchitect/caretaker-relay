# Deployed Foundation Route Exposure

Caretaker production uses Dockerfile.care → care-app only.

Publicly exposed: /api/v1/health, /api/v1/care/*

Otzar/work-os/connectors routes: NOT in care Docker image entrypoint — not public for Caretaker Relay product.

Lab login: gated by labLoginEnabled config.
