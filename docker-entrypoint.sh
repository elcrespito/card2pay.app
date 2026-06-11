#!/bin/sh
set -e

# Sync the schema to the database. We use `db push` (no migration history)
# so the first deploy creates all tables without needing pre-authored
# migration files. Switch to `prisma migrate deploy` once you start
# committing migrations under prisma/migrations.
echo "[card2pay] Syncing database schema…"
if [ -d "prisma/migrations" ] && [ -n "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  npx prisma migrate deploy
else
  npx prisma db push --skip-generate --accept-data-loss
fi

echo "[card2pay] Seeding admin user…"
npx tsx prisma/seed.ts || echo "[card2pay] seed skipped/failed (continuing)"

echo "[card2pay] Starting server…"
exec "$@"
