# ==========================================
# 1: Build stage
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

ARG BUILD_DIST=true

RUN if [ "$BUILD_DIST" = "true" ]; then npx nest build api-gateway; else echo "Skipping build for dev"; fi

# ==========================================
# 2: Production stage
# ==========================================
FROM node:24-alpine AS runner

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist/apps/api-gateway ./dist/apps/api-gateway

EXPOSE 3000

CMD ["node", "dist/apps/api-gateway/main.ts"]