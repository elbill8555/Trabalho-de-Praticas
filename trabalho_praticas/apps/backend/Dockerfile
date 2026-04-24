# ─────────────────────────────────────────────
# Stage 1: Install dependencies
# ─────────────────────────────────────────────
FROM node:20-bookworm-slim AS deps

WORKDIR /app

# Copy only dependency manifests from backend
COPY apps/backend/package*.json ./apps/backend/
COPY package*.json ./

RUN npm ci --workspace=apps/backend --ignore-scripts

# ─────────────────────────────────────────────
# Stage 2: Build
# ─────────────────────────────────────────────
FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_module[s] ./apps/backend/node_modules/

COPY apps/backend/ ./apps/backend/
COPY package*.json ./

RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma
RUN npm run build --workspace=apps/backend

# ─────────────────────────────────────────────
# Stage 3: Runtime
# ─────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*
RUN groupadd --gid 1001 nodejs && useradd --uid 1001 --gid nodejs --create-home nestjs

WORKDIR /app

COPY --from=build --chown=nestjs:nodejs /app/apps/backend/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/package.json ./package.json
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/prisma ./prisma

USER nestjs

ARG PORT=3001
ENV PORT=$PORT
EXPOSE $PORT

CMD ["node", "dist/main"]
