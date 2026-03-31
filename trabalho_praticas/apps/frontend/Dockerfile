# ─────────────────────────────────────────────
# Stage 1: Install dependencies
# ─────────────────────────────────────────────
FROM node:lts-alpine AS deps

WORKDIR /app

COPY apps/frontend/package*.json ./apps/frontend/
COPY package*.json ./

RUN npm ci --workspace=apps/frontend --ignore-scripts

# ─────────────────────────────────────────────
# Stage 2: Build
# ─────────────────────────────────────────────
FROM node:lts-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_module[s] ./apps/frontend/node_modules/

COPY apps/frontend/ ./apps/frontend/
COPY package*.json ./

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build --workspace=apps/frontend

# ─────────────────────────────────────────────
# Stage 3: Runtime (Next.js standalone)
# ─────────────────────────────────────────────
FROM node:lts-alpine AS runtime

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

WORKDIR /app

COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/.next/stati[c] ./apps/frontend/.next/static/
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/publi[c] ./apps/frontend/public/

USER nextjs

ARG PORT=3000
ENV PORT=$PORT
EXPOSE $PORT

CMD ["node", "apps/frontend/server.js"]
