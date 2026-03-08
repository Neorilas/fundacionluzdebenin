# ─── Stage 1: Build Next.js (standalone) ────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --silent

COPY next.config.mjs ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY tsconfig.json ./
COPY src ./src/
COPY public ./public/

# NEXT_PUBLIC_API_URL must be the public domain — baked at build time
ARG NEXT_PUBLIC_API_URL=https://fundacionluzdebenin.org
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production

RUN npm run build


# ─── Stage 2: Serve with Node.js standalone ──────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER node
EXPOSE 3000
CMD ["node", "server.js"]
