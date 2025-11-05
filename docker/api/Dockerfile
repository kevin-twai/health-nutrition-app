# 多階段構建
FROM node:18-alpine AS base

# 安裝必要的系統依賴
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 複製 package 文件
COPY package*.json ./
COPY turbo.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json ./apps/api/

# 安裝依賴
RUN npm ci --only=production && npm cache clean --force

# 開發階段
FROM base AS development
RUN npm ci
COPY packages/shared-types ./packages/shared-types
COPY apps/api ./apps/api
RUN npm run build --workspace=@health-tracker/shared-types
WORKDIR /app/apps/api
RUN npm install
EXPOSE 3001
CMD ["npm", "run", "dev"]

# 生產構建階段
FROM base AS builder
RUN npm ci
COPY packages/shared-types ./packages/shared-types
COPY apps/api ./apps/api
RUN npm run build --workspace=@health-tracker/shared-types
WORKDIR /app/apps/api
RUN npm run build

# 生產運行階段
FROM node:18-alpine AS production
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# 創建非 root 用戶
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# 複製構建產物和依賴
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/package.json ./apps/api/

# 創建日誌目錄
RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

USER nodejs

WORKDIR /app/apps/api

EXPOSE 3001

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]