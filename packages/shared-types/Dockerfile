# Shared Types Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 複製 package 文件
COPY package*.json ./
COPY tsconfig.json ./

# 安裝依賴
RUN npm ci

# 複製源代碼
COPY src ./src

# 構建
RUN npm run build

# 最終階段
FROM node:18-alpine

WORKDIR /app

# 複製構建產物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# 安裝生產依賴
RUN npm ci --only=production

CMD ["echo", "Shared types built successfully"]