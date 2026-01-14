# Frontend Dockerfile - Multi-environment support with PNPM
ARG NODE_ENV=production

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
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
EXPOSE 8080
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]

# Builder stage for production
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_API_URL=http://localhost:3000/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm run build

# Production stage with Nginx
FROM nginx:alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]

# Final stage selection based on NODE_ENV
FROM ${NODE_ENV} AS final
