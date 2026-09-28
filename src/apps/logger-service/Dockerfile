# ==========================================
# 1: Build stage
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

# Принимаем аргумент. По умолчанию он равен true (для продакшна)
ARG BUILD_DIST=true

# Запускаем сборку ТОЛЬКО если аргумент равен true. 
RUN if [ "$BUILD_DIST" = "true" ]; then npx nest build logger-service; else echo "Skipping build for dev"; fi

# ==========================================
# 2: Production stage
# ==========================================
FROM node:24-alpine AS runner

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist/apps/logger-service ./dist/apps/logger-service

EXPOSE 3000

CMD ["node", "dist/apps/logger-service/main.js"]