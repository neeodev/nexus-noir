# ── Étape 1 : dépendances ────────────────────────────────────────────────────
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ── Étape 2 : build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables publiques injectées au build (remplacer en CI/CD)
ARG NEXT_PUBLIC_API_URL=https://api.nexus-noir.ch/api/v1
ARG NEXT_PUBLIC_SITE_URL=https://nexus-noir.ch
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN pnpm build

# ── Étape 3 : image de production ────────────────────────────────────────────
FROM node:22-alpine AS production

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Standalone inclut tout le nécessaire pour tourner sans node_modules complet
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
