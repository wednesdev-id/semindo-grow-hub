# Backend Dockerfile - Multi-environment support with PNPM
ARG NODE_ENV=production

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Development stage
FROM base AS development
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
RUN pnpm exec prisma generate
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

# Builder stage for production
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY --from=builder --chown=expressjs:nodejs /app/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./
COPY --from=builder --chown=expressjs:nodejs /app/prisma ./prisma

USER expressjs
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]

# Final stage selection based on NODE_ENV
FROM ${NODE_ENV} AS final
