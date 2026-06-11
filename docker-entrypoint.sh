#!/bin/sh
# Resilient startup: ensure the schema exists + seed the admin, but never let
# those steps crash the container — always start the server so the app stays up.
#
# The schema DDL (prisma/init.sql) is generated at build time from the Prisma
# schema, so the runtime image needs only psql (not the Prisma CLI).

echo "[card2pay] DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo yes || echo NO)"

# psql doesn't understand Prisma's ?schema=public query string — strip it.
PSQL_URL=$(printf '%s' "$DATABASE_URL" | sed 's/?.*$//')

# Wait briefly for Postgres to accept connections (it may still be starting).
i=0
while [ $i -lt 30 ]; do
  if pg_isready -d "$PSQL_URL" >/dev/null 2>&1; then
    echo "[card2pay] Postgres is ready."
    break
  fi
  i=$((i + 1))
  echo "[card2pay] waiting for Postgres… ($i)"
  sleep 2
done

# Only apply the schema if our tables are missing (idempotent on restarts).
HAS_TABLES=$(psql "$PSQL_URL" -tAc "SELECT to_regclass('public.users') IS NOT NULL" 2>/dev/null)
if [ "$HAS_TABLES" = "t" ]; then
  echo "[card2pay] Schema already present — skipping init."
else
  echo "[card2pay] Applying schema from prisma/init.sql…"
  psql "$PSQL_URL" -v ON_ERROR_STOP=0 -f prisma/init.sql || echo "[card2pay] schema apply reported errors (continuing)"
fi

echo "[card2pay] Seeding admin user…"
node prisma/seed.cjs || echo "[card2pay] seed skipped/failed (continuing)"

echo "[card2pay] Starting server…"
exec "$@"
