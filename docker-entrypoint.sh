#!/bin/sh
# Resilient startup: sync the DB schema + seed, but never let those steps
# crash the container — always start the server so the app stays up.
#
# We invoke the Prisma CLI by its real path (node node_modules/prisma/build/index.js)
# instead of `npx prisma`, because the .bin/prisma shim resolves its bundled
# *.wasm relative to its own directory and breaks when copied standalone.

echo "[card2pay] DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo yes || echo NO)"

PRISMA="node node_modules/prisma/build/index.js"

echo "[card2pay] Syncing database schema (prisma db push)…"
if [ -d "prisma/migrations" ] && [ -n "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  $PRISMA migrate deploy || echo "[card2pay] migrate deploy failed (continuing)"
else
  $PRISMA db push --skip-generate --accept-data-loss || echo "[card2pay] db push failed (continuing)"
fi

echo "[card2pay] Seeding admin user…"
node prisma/seed.cjs || echo "[card2pay] seed skipped/failed (continuing)"

echo "[card2pay] Starting server…"
exec "$@"
