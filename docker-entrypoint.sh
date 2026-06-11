#!/bin/sh
# Resilient startup: sync the DB schema + seed, but never let those steps
# crash the container — always start the server so the app stays up.

echo "[card2pay] DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo yes || echo NO)"

echo "[card2pay] Syncing database schema (prisma db push)…"
if [ -d "prisma/migrations" ] && [ -n "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  npx prisma migrate deploy || echo "[card2pay] migrate deploy failed (continuing)"
else
  npx prisma db push --skip-generate --accept-data-loss || echo "[card2pay] db push failed (continuing)"
fi

echo "[card2pay] Seeding admin user…"
npx tsx prisma/seed.ts || echo "[card2pay] seed skipped/failed (continuing)"

echo "[card2pay] Starting server…"
exec "$@"
