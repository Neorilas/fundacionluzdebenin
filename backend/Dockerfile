# ─── Stage 1: Build admin panel (React + Vite) ───────────────────────────────
FROM node:20-alpine AS admin-builder

RUN npm install -g npm@11

WORKDIR /app/admin
COPY admin/package*.json ./
RUN npm ci --silent

COPY admin/ ./
RUN npm run build


# ─── Stage 2: Build backend (TypeScript) ─────────────────────────────────────
FROM node:20-alpine AS backend-builder

RUN apk add --no-cache openssl && npm install -g npm@11

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.seed.json ./
COPY prisma ./prisma/

RUN npm ci --silent
RUN npx prisma generate

COPY src ./src/
RUN npm run build
RUN npx tsc -p tsconfig.seed.json


# ─── Stage 3: Production image ───────────────────────────────────────────────
FROM node:20-alpine

RUN apk add --no-cache openssl && npm install -g npm@11

WORKDIR /app

# Runtime deps only
COPY package*.json ./
RUN npm ci --omit=dev --silent

# Compiled backend
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/node_modules/@prisma ./node_modules/@prisma

# Prisma schema (needed for db push at startup)
COPY prisma ./prisma/

# Built admin panel served by Express at /admin
COPY --from=admin-builder /app/admin/dist ./admin/dist

# Migration scripts (idempotent, run at startup)
COPY scripts ./scripts/

# Create dirs for persistent data
RUN mkdir -p /data /app/uploads

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL=file:/data/prod.db
ENV UPLOAD_DIR=/app/uploads

EXPOSE 3001

# On start: apply DB schema (idempotent) then run the server
CMD ["sh", "-c", "npx prisma db push --schema=./prisma/schema.prisma && node dist/prisma/seed.js && node scripts/migrate-md-to-html.cjs && node dist/index.js"]
