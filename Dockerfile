# ---- Dependencies ----------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# ---- Builder ---------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build
# Generate plain SQL DDL for the whole schema while the full Prisma toolchain is
# available. Applied at runtime with psql so the runner needs no Prisma CLI.
RUN node node_modules/prisma/build/index.js migrate diff \
      --from-empty --to-schema-datamodel prisma/schema.prisma --script \
      > prisma/init.sql && wc -l prisma/init.sql

# ---- Runner ----------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
# postgresql-client gives us psql to apply the schema SQL at startup.
RUN apk add --no-cache libc6-compat openssl postgresql-client
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Next.js standalone output + static assets + public files.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Generated Prisma client + query engine for the server's runtime queries, and
# bcryptjs for the seed. No Prisma CLI needed: the schema is applied from the
# build-time-generated prisma/init.sql via psql in the entrypoint.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
