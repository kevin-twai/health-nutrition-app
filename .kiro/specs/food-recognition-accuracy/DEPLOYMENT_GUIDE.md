# 食物識別準確度改進 - 部署指南

## 概述

本指南提供將食物識別準確度改進功能部署到生產環境的詳細步驟。

---

## 部署前檢查清單

### 1. 代碼準備

- [ ] 所有功能已完成開發和測試
- [ ] 單元測試通過率 >= 90%
- [ ] 整合測試全部通過
- [ ] 代碼已通過 Code Review
- [ ] 已合併到 main 分支
- [ ] 版本號已更新

### 2. 環境配置

- [ ] 生產環境變數已配置
- [ ] OpenAI API 金鑰已設置
- [ ] 資料庫連接已測試
- [ ] Redis 連接已測試
- [ ] 日誌目錄已創建
- [ ] 備份策略已設置

### 3. 資料準備

- [ ] 知識庫數據已準備
- [ ] 資料庫遷移腳本已準備
- [ ] 測試數據已清理
- [ ] 生產數據已備份

### 4. 監控和告警

- [ ] 監控系統已配置
- [ ] 告警規則已設置
- [ ] 日誌收集已啟用
- [ ] 性能指標已定義

---

## 部署步驟

### 步驟 1: 更新環境配置

#### 1.1 檢查現有環境變數

```bash
# 查看當前環境變數
cat .env.production

# 驗證必要變數
npm run verify:env
```

#### 1.2 更新生產環境變數

編輯 `.env.production` 文件：

```bash
# OpenAI API 配置
OPENAI_API_KEY=sk-prod-xxxxx
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.3

# 識別配置
RECOGNITION_CONFIDENCE_THRESHOLD=85
RECOGNITION_MAX_RETRIES=3
RECOGNITION_TIMEOUT=30000
ENABLE_MULTI_STAGE_RECOGNITION=true
ENABLE_KNOWLEDGE_BASE_MATCHING=true

# 快取配置
CACHE_TTL=3600
CACHE_MAX_SIZE=1000
ENABLE_RESULT_CACHE=true

# 性能監控
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_DETAILED_LOGGING=true
LOG_LEVEL=info

# 反饋系統
ENABLE_FEEDBACK_COLLECTION=true
FEEDBACK_AUTO_IMPROVE=true

# 資料庫
DATABASE_URL=postgresql://user:password@prod-db:5432/nutrition_db
MONGODB_URI=mongodb://prod-mongo:27017/nutrition_db
REDIS_URL=redis://prod-redis:6379

# 應用配置
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.nutrition-app.com
```

#### 1.3 驗證配置

```bash
# 驗證環境變數
npm run verify:env

# 測試資料庫連接
npm run test:db-connection

# 測試 OpenAI API
npm run test:openai-connection
```

### 步驟 2: 資料庫遷移

#### 2.1 備份現有資料庫

```bash
# 備份 PostgreSQL
npm run backup:postgres

# 備份 MongoDB
npm run backup:mongodb

# 驗證備份
npm run verify:backup
```

#### 2.2 執行資料庫遷移

```bash
# PostgreSQL 遷移（如果有新的遷移）
npm run migrate:postgres

# MongoDB 索引初始化
npm run init:mongodb-indexes

# 初始化反饋表索引
npm run init:feedback-indexes
```

#### 2.3 初始化知識庫

```bash
# 載入知識庫數據
npm run seed:knowledge-base

# 驗證知識庫完整性
npm run verify:knowledge-base

# 查看知識庫統計
npm run stats:knowledge-base
```

輸出範例：
```
✅ 知識庫驗證完成

統計資訊:
- 總食材數: 215
- 食材類別: 17
- 料理類型: 10
- 料理模式: 8
- 易混淆食材對: 25

驗證結果:
✓ 所有食材都有完整的必填欄位
✓ 所有易混淆食材都存在於知識庫中
✓ 營養資訊都在合理範圍內
✓ 視覺特徵描述完整
```

### 步驟 3: 建置和部署

#### 3.1 建置應用

```bash
# 安裝生產依賴
npm ci --production

# 建置 TypeScript
npm run build

# 驗證建置
npm run verify:build
```

#### 3.2 部署到伺服器

##### 選項 A: 使用 PM2（推薦）

```bash
# 安裝 PM2（如果尚未安裝）
npm install -g pm2

# 使用 PM2 啟動
pm2 start ecosystem.config.js --env production

# 查看狀態
pm2 status

# 查看日誌
pm2 logs nutrition-api

# 設置開機自動啟動
pm2 startup
pm2 save
```

`ecosystem.config.js` 配置：

```javascript
module.exports = {
  apps: [{
    name: 'nutrition-api',
    script: './dist/index.js',
    instances: 4,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};
```

##### 選項 B: 使用 Docker

```bash
# 建置 Docker 映像
docker build -f docker/api/Dockerfile -t nutrition-api:v1.0.0 .

# 標記為 latest
docker tag nutrition-api:v1.0.0 nutrition-api:latest

# 推送到 Registry（如果使用）
docker push your-registry/nutrition-api:v1.0.0

# 使用 Docker Compose 部署
docker-compose -f docker-compose.prod.yml up -d

# 查看日誌
docker-compose -f docker-compose.prod.yml logs -f api
```

##### 選項 C: 使用 Kubernetes

```bash
# 應用配置
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# 部署應用
kubectl apply -f k8s/api-deployment.yaml

# 查看部署狀態
kubectl get pods -n nutrition-app
kubectl describe deployment nutrition-api -n nutrition-app

# 查看日誌
kubectl logs -f deployment/nutrition-api -n nutrition-app
```

### 步驟 4: 驗證部署

#### 4.1 健康檢查

```bash
# API 健康檢查
curl https://api.nutrition-app.com/health

# 預期輸出:
{
  "status": "healthy",
  "timestamp": "2025-11-13T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "mongodb": "connected",
    "redis": "connected",
    "openai": "available"
  }
}
```

#### 4.2 功能測試

```bash
# 測試照片識別端點
curl -X POST https://api.nutrition-app.com/api/photos/recognize \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test-image.jpg"

# 測試知識庫查詢
curl https://api.nutrition-app.com/api/knowledge-base/foods/豆腐干絲

# 測試反饋端點
curl -X POST https://api.nutrition-app.com/api/feedback \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageId": "test", "userCorrection": {...}}'
```

#### 4.3 性能測試

```bash
# 運行性能測試
npm run test:performance

# 預期結果:
✓ 第一階段識別: 平均 2.8 秒 (< 3秒)
✓ 多階段識別: 平均 7.2 秒 (< 8秒)
✓ 知識庫查詢: 平均 45ms (< 100ms)
✓ API 響應時間: 平均 3.1 秒
```

#### 4.4 準確度測試

```bash
# 運行準確度測試
npm run test:accuracy

# 預期結果:
✓ 亞洲食材整體識別準確率: 87.5% (>= 85%)
✓ 易混淆食材區分準確率: 91.2% (>= 90%)
✓ 混合菜餚食材召回率: 86.8% (>= 85%)
✓ 整體 F1 分數: 0.89 (>= 0.88)
```

### 步驟 5: 監控設置

#### 5.1 啟用性能監控

```bash
# 啟動監控服務
npm run start:monitoring

# 訪問監控儀表板
open https://api.nutrition-app.com/monitoring/dashboard
```

#### 5.2 配置告警規則

編輯 `config/alerts.yml`:

```yaml
alerts:
  - name: high_error_rate
    condition: error_rate > 5%
    duration: 5m
    severity: critical
    notification:
      - email
      - slack
    
  - name: slow_recognition
    condition: avg_recognition_time > 10s
    duration: 10m
    severity: warning
    notification:
      - slack
    
  - name: low_confidence
    condition: avg_confidence < 75%
    duration: 15m
    severity: warning
    notification:
      - email
    
  - name: high_memory_usage
    condition: memory_usage > 80%
    duration: 5m
    severity: critical
    notification:
      - email
      - slack
```

#### 5.3 設置日誌收集

```bash
# 配置日誌輪轉
npm run setup:log-rotation

# 設置日誌備份
npm run setup:log-backup

# 配置日誌分析
npm run setup:log-analysis
```

### 步驟 6: 流量切換

#### 6.1 灰度發布（推薦）

```bash
# 階段 1: 5% 流量
npm run deploy:canary -- --traffic=5

# 監控 30 分鐘，確認無問題

# 階段 2: 25% 流量
npm run deploy:canary -- --traffic=25

# 監控 1 小時

# 階段 3: 50% 流量
npm run deploy:canary -- --traffic=50

# 監控 2 小時

# 階段 4: 100% 流量
npm run deploy:canary -- --traffic=100
```

#### 6.2 藍綠部署

```bash
# 部署到綠色環境
npm run deploy:green

# 驗證綠色環境
npm run verify:green

# 切換流量到綠色
npm run switch:to-green

# 監控並確認

# 如果有問題，快速回滾
npm run rollback:to-blue
```

### 步驟 7: 部署後驗證

#### 7.1 功能驗證清單

- [ ] 照片上傳和識別正常
- [ ] 多階段識別流程正常
- [ ] 知識庫查詢正常
- [ ] 結果驗證正常
- [ ] 替代選項顯示正常
- [ ] 用戶反饋提交正常
- [ ] 營養計算正確
- [ ] 快取功能正常
- [ ] 日誌記錄正常
- [ ] 監控數據正常

#### 7.2 性能驗證

```bash
# 運行負載測試
npm run test:load

# 監控關鍵指標
npm run monitor:metrics

# 檢查資源使用
npm run check:resources
```

#### 7.3 用戶驗證

- [ ] 邀請測試用戶試用
- [ ] 收集初步反饋
- [ ] 監控錯誤率
- [ ] 檢查用戶滿意度

---

## 回滾計劃

### 何時需要回滾

- 錯誤率超過 10%
- 識別準確度下降超過 5%
- 系統響應時間超過 15 秒
- 出現嚴重 bug
- 用戶投訴激增

### 回滾步驟

#### 快速回滾（使用 PM2）

```bash
# 停止當前版本
pm2 stop nutrition-api

# 切換到上一個版本
cd /path/to/previous/version

# 啟動上一個版本
pm2 start ecosystem.config.js --env production

# 驗證
curl https://api.nutrition-app.com/health
```

#### 回滾資料庫（如果需要）

```bash
# 恢復 PostgreSQL
npm run restore:postgres -- --file=backup-before-deploy.sql

# 恢復 MongoDB
npm run restore:mongodb -- --file=backup-before-deploy.archive

# 驗證資料完整性
npm run verify:data
```

#### 通知用戶

```bash
# 發送系統通知
npm run notify:users -- --message="系統維護中，暫時回滾到穩定版本"
```

---

## 部署後監控

### 關鍵指標

#### 1. 系統健康指標

- API 可用性: >= 99.9%
- 平均響應時間: < 3 秒
- 錯誤率: < 1%
- CPU 使用率: < 70%
- 記憶體使用率: < 80%

#### 2. 識別性能指標

- 識別成功率: >= 95%
- 平均信心度: >= 85%
- 第一階段成功率: >= 70%
- 平均處理時間: < 5 秒

#### 3. 用戶體驗指標

- 用戶滿意度: >= 4.0/5.0
- 用戶修正率: < 20%
- 替代選項準確率: >= 80%
- 反饋提交率: >= 10%

### 監控工具

#### 訪問監控儀表板

```
https://api.nutrition-app.com/monitoring/dashboard
```

#### 查看實時日誌

```bash
# 應用日誌
tail -f logs/combined.log

# 錯誤日誌
tail -f logs/error.log

# 性能日誌
tail -f logs/performance.log
```

#### 查看性能報告

```bash
# 生成每日報告
npm run report:daily

# 生成每週報告
npm run report:weekly
```

---

## 故障處理

### 常見問題和解決方案

#### 問題 1: OpenAI API 調用失敗

**症狀**: 大量 429 或 500 錯誤

**解決方案**:
```bash
# 檢查 API 配額
npm run check:openai-quota

# 啟用備用 API 金鑰
npm run switch:api-key

# 增加重試延遲
# 編輯 .env.production
OPENAI_RETRY_DELAY=2000
```

#### 問題 2: 資料庫連接問題

**症狀**: 資料庫連接超時

**解決方案**:
```bash
# 檢查資料庫狀態
npm run check:db-status

# 重啟資料庫連接池
npm run restart:db-pool

# 如果需要，重啟資料庫
systemctl restart postgresql
systemctl restart mongodb
```

#### 問題 3: 記憶體洩漏

**症狀**: 記憶體使用持續增長

**解決方案**:
```bash
# 生成記憶體快照
npm run profile:memory

# 分析記憶體洩漏
npm run analyze:memory-leaks

# 重啟應用（臨時解決）
pm2 restart nutrition-api

# 增加記憶體限制
pm2 restart nutrition-api --max-memory-restart 2G
```

#### 問題 4: 識別準確度下降

**症狀**: 準確度低於預期

**解決方案**:
```bash
# 分析最近的識別錯誤
npm run analyze:errors

# 查看用戶反饋
npm run review:feedback

# 更新 prompt 模板
npm run update:prompts

# 重新訓練知識庫匹配
npm run retrain:knowledge-base
```

---

## 維護計劃

### 每日維護

- [ ] 檢查系統健康狀態
- [ ] 查看錯誤日誌
- [ ] 監控性能指標
- [ ] 檢查磁碟空間

### 每週維護

- [ ] 審查用戶反饋
- [ ] 分析識別錯誤模式
- [ ] 更新知識庫（如需要）
- [ ] 優化 prompt 模板
- [ ] 清理舊日誌
- [ ] 備份資料庫

### 每月維護

- [ ] 生成月度報告
- [ ] 評估系統性能
- [ ] 規劃改進措施
- [ ] 更新文檔
- [ ] 安全性審查
- [ ] 依賴套件更新

---

## 聯絡資訊

### 技術支援

- **Email**: devops@nutrition-app.com
- **Slack**: #deployment-support
- **On-call**: +886-xxx-xxx-xxx

### 緊急聯絡

- **系統管理員**: admin@nutrition-app.com
- **資料庫管理員**: dba@nutrition-app.com
- **安全團隊**: security@nutrition-app.com

---

**部署版本**: 1.0.0  
**部署日期**: 2025-11-13  
**負責人**: 開發團隊
