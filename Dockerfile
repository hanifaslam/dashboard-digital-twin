# -------------------------
# 1. Install dependencies
# -------------------------
FROM node:20-slim AS deps
WORKDIR /app

COPY package.json package-lock.json* ./

# Lebih stabil + cepat
RUN npm config set registry https://registry.npmmirror.com \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm ci --no-audit



# -------------------------
# 2. Build app
# -------------------------
FROM node:20-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_DISABLE_CSRF
ENV NEXT_PUBLIC_DISABLE_CSRF=$NEXT_PUBLIC_DISABLE_CSRF

RUN npm run build


# -------------------------
# 3. Production image (Optimized Standalone)
# -------------------------
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Security
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs

# Copy hasil build standalone (sangat hemat RAM)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Jalankan server.js (bawaan dari standalone mode)
CMD ["node", "server.js"]
