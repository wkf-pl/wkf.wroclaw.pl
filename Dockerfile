FROM node:22.17.0-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@11.16.0 --activate

WORKDIR /app

FROM base AS dependencies

RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS development

ENV NODE_ENV=development

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]

FROM development AS builder

ENV NODE_ENV=production

RUN DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build" \
    PAYLOAD_SECRET="build-time-only" \
    STORAGE_ADAPTER="local" \
    pnpm build

FROM base AS runner

ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
