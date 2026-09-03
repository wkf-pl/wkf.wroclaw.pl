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

RUN apk add --no-cache bash

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]

FROM development AS builder

ENV NODE_ENV=production

RUN DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build" \
    AZURE_STORAGE_ACCOUNT_BASE_URL="http://127.0.0.1:10000/devstoreaccount1" \
    AZURE_STORAGE_CONNECTION_STRING="UseDevelopmentStorage=true" \
    AZURE_STORAGE_CONTAINER_NAME="media" \
    PAYLOAD_SECRET="build-time-only" \
    pnpm build:container

FROM dependencies AS production-dependencies

RUN pnpm prune --prod

FROM base AS runner

ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=production-dependencies --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/migrations ./migrations
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
