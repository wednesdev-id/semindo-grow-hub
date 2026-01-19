# Frontend Dockerfile - Multi-environment support with PNPM
ARG NODE_ENV=production

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ======================
# Dependencies
# ======================
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# ======================
# Development
# ======================
FROM base AS development
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
EXPOSE 8080
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]

# ======================
# Build
# ======================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm run build

# ======================
# Production
# ======================
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
