#!/usr/bin/env bash
# DEPLOYMENT REQUIREMENT: copy care packages into vendor/ so Render static builds
# work without the sibling monorepo checkout.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FOUND="$(cd "$ROOT/../caretaker-relay-foundation" && pwd)"
mkdir -p "$ROOT/vendor"
rm -rf "$ROOT/vendor/care-domain" "$ROOT/vendor/product-identity"
cp -R "$FOUND/packages/care-domain" "$ROOT/vendor/care-domain"
cp -R "$FOUND/packages/product-identity" "$ROOT/vendor/product-identity"
rm -rf "$ROOT/vendor/care-domain/node_modules" "$ROOT/vendor/product-identity/node_modules"
echo "Vendored care-domain + product-identity from $FOUND"
