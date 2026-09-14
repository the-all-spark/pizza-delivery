# ==========================================
# 1: Build stage
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx nest build auth-service

# ==========================================
# 2: Production stage
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist/apps/auth-service ./dist/apps/auth-service

EXPOSE 3000

CMD ["node", "dist/apps/auth-service/main.js"]