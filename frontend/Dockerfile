# ─── Stage 1: Build Next.js static export ────────────────────────────────────
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


# ─── Stage 2: Serve with Nginx ───────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
