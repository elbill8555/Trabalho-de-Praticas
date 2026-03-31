# ─────────────────────────────────────────────
# Stage 1: Install dependencies
# ─────────────────────────────────────────────
FROM node:lts-alpine AS deps

WORKDIR /app

# Copy only dependency manifests from backend
COPY apps/backend/package*.json ./apps/backend/
COPY package*.json ./

RUN npm ci --workspace=apps/backend --ignore-scripts

# ─────────────────────────────────────────────
# Stage 2: Build
# ─────────────────────────────────────────────
FROM node:lts-alpine AS build

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
FROM node:lts-alpine AS runtime

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

COPY --from=build --chown=nestjs:nodejs /app/apps/backend/dist ./dist
COPY --from=build  --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/package.json ./package.json

USER nestjs

ARG PORT=3001
ENV PORT=$PORT
EXPOSE $PORT

CMD ["node", "dist/main"]
