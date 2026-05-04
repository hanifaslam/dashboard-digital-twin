# -------------------------
# 1. Install dependencies
# -------------------------
FROM node:22-slim AS deps
WORKDIR /app

# Enable Corepack agar bisa pakai Yarn
RUN corepack enable

COPY package.json yarn.lock* ./

# Instalasi menggunakan Yarn (lebih sinkron dengan local Anda)
RUN yarn install --frozen-lockfile


# -------------------------
# 2. Build app
# -------------------------
FROM node:22-slim AS builder
WORKDIR /app
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_DISABLE_CSRF
ENV NEXT_PUBLIC_DISABLE_CSRF=$NEXT_PUBLIC_DISABLE_CSRF

RUN yarn build


# -------------------------
# 3. Production image (Optimized Standalone)
# -------------------------
FROM node:22-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Security
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs

# Copy hasil build standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Tetap jalankan server.js bawaan standalone
CMD ["node", "server.js"]
