# 生產環境部署指南

本文檔說明如何將健康營養追蹤系統部署到生產環境。

## 目錄

- [前置需求](#前置需求)
- [Kubernetes 部署](#kubernetes-部署)
- [Docker Compose 部署](#docker-compose-部署)
- [環境變數配置](#環境變數配置)
- [SSL 憑證設定](#ssl-憑證設定)
- [監控和日誌](#監控和日誌)
- [備份和災難恢復](#備份和災難恢復)
- [故障排除](#故障排除)

## 前置需求

### 系統需求

- **CPU**: 最少 4 核心，建議 8 核心
- **記憶體**: 最少 8GB，建議 16GB
- **儲存空間**: 最少 100GB SSD
- **網路**: 穩定的網際網路連接

### 軟體需求

- Docker 20.10+
- Docker Compose 2.0+
- Kubernetes 1.24+ (如使用 K8s 部署)
- kubectl (如使用 K8s 部署)
- AWS CLI (如使用 AWS 服務)

### 外部服務

- PostgreSQL 15+ (或使用容器化版本)
- MongoDB 6.0+ (或使用容器化版本)
- Redis 7+ (或使用容器化版本)
- AWS S3 (用於檔案儲存和備份)
- OpenAI API 金鑰
- Google Vision API 金鑰

## Kubernetes 部署

### 1. 準備環境

```bash
# 建立命名空間
kubectl apply -f k8s/namespace.yaml

# 建立初始化配置
kubectl apply -f k8s/init-configmap.yaml
```

### 2. 配置秘密

```bash
# 使用秘密管理腳本
./scripts/manage-secrets.sh create

# 或手動建立秘密
kubectl apply -f k8s/secrets.yaml
```

### 3. 部署資料庫

```bash
# 部署 PostgreSQL
kubectl apply -f k8s/postgres-deployment.yaml

# 部署 MongoDB
kubectl apply -f k8s/mongodb-deployment.yaml

# 部署 Redis
kubectl apply -f k8s/redis-deployment.yaml

# 等待資料庫就緒
kubectl wait --for=condition=ready pod -l app=postgres -n health-nutrition-tracker --timeout=300s
kubectl wait --for=condition=ready pod -l app=mongodb -n health-nutrition-tracker --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n health-nutrition-tracker --timeout=300s
```

### 4. 部署應用服務

```bash
# 部署配置
kubectl apply -f k8s/configmap.yaml

# 部署 API 服務
kubectl apply -f k8s/api-deployment.yaml

# 部署 Web 服務
kubectl apply -f k8s/web-deployment.yaml

# 部署 Ingress
kubectl apply -f k8s/ingress.yaml
```

### 5. 部署監控和備份

```bash
# 部署監控服務
kubectl apply -f k8s/monitoring.yaml
kubectl apply -f k8s/grafana.yaml

# 部署日誌收集
kubectl apply -f k8s/logging.yaml
kubectl apply -f k8s/elasticsearch.yaml
kubectl apply -f k8s/kibana.yaml

# 部署備份任務
kubectl apply -f k8s/backup-cronjob.yaml
```

### 6. 使用部署腳本

```bash
# 一鍵部署
./scripts/deploy.sh deploy v1.0.0

# 健康檢查
./scripts/deploy.sh health-check

# 回滾部署
./scripts/deploy.sh rollback 2
```

## Docker Compose 部署

### 1. 準備環境變數

```bash
# 複製環境變數範本
cp .env.production.example .env.production

# 編輯環境變數
nano .env.production
```

### 2. 建立 SSL 憑證目錄

```bash
mkdir -p docker/nginx/ssl
# 將 SSL 憑證檔案放入此目錄
```

### 3. 啟動服務

```bash
# 開發環境
docker-compose up -d

# 生產環境
docker-compose -f docker-compose.prod.yml up -d

# 包含監控服務
docker-compose -f docker-compose.prod.yml --profile monitoring up -d
```

### 4. 驗證部署

```bash
# 檢查服務狀態
docker-compose -f docker-compose.prod.yml ps

# 查看日誌
docker-compose -f docker-compose.prod.yml logs -f api-1

# 健康檢查
curl http://localhost/health
```

## 環境變數配置

### 必要變數

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `POSTGRES_PASSWORD` | PostgreSQL 密碼 | `secure_password_123` |
| `MONGODB_PASSWORD` | MongoDB 密碼 | `secure_password_456` |
| `REDIS_PASSWORD` | Redis 密碼 | `secure_password_789` |
| `JWT_SECRET` | JWT 簽名金鑰 | `your_jwt_secret_key_32_chars` |
| `OPENAI_API_KEY` | OpenAI API 金鑰 | `sk-...` |
| `GOOGLE_VISION_API_KEY` | Google Vision API 金鑰 | `AIza...` |

### AWS 配置

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-west-2
S3_BACKUP_BUCKET=health-nutrition-backups
```

### 第三方整合

```bash
NOTION_API_KEY=secret_...
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_access_token
```

## SSL 憑證設定

### 使用 Let's Encrypt

```bash
# 安裝 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 獲取憑證
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# 自動續期
sudo crontab -e
# 加入: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 手動憑證

```bash
# 將憑證檔案放入指定目錄
cp your_domain.crt docker/nginx/ssl/
cp your_domain.key docker/nginx/ssl/
cp ca_bundle.crt docker/nginx/ssl/
```

## 監控和日誌

### Prometheus 監控

- **URL**: `http://your-domain:9090`
- **配置**: `monitoring/prometheus.yml`
- **警報規則**: `monitoring/alert_rules.yml`

### Grafana 儀表板

- **URL**: `http://your-domain:3001`
- **預設帳號**: `admin` / `admin`
- **儀表板**: 自動載入健康營養追蹤系統監控面板

### 日誌查看

```bash
# Kubernetes 日誌
kubectl logs -f deployment/api -n health-nutrition-tracker

# Docker Compose 日誌
docker-compose -f docker-compose.prod.yml logs -f api-1

# Kibana 日誌分析
# URL: http://your-domain:5601
```

## 備份和災難恢復

### 自動備份

備份任務每天凌晨 2 點自動執行：

- PostgreSQL 備份到 S3
- MongoDB 備份到 S3
- 本地保留 7 天備份

### 手動備份

```bash
# 執行備份腳本
./scripts/backup.sh

# Kubernetes 環境
kubectl create job --from=cronjob/postgres-backup manual-backup-$(date +%s) -n health-nutrition-tracker
```

### 災難恢復

```bash
# 列出可用備份
./scripts/disaster-recovery.sh list-postgres
./scripts/disaster-recovery.sh list-mongodb

# 恢復資料庫
./scripts/disaster-recovery.sh restore-postgres postgres_backup_20231201_020000.sql.gz
./scripts/disaster-recovery.sh restore-mongodb mongodb_backup_20231201_030000.tar.gz

# 完整恢復
./scripts/disaster-recovery.sh full-restore postgres_backup.sql.gz mongodb_backup.tar.gz
```

## 故障排除

### 常見問題

#### 1. 資料庫連接失敗

```bash
# 檢查資料庫狀態
kubectl get pods -n health-nutrition-tracker
docker-compose -f docker-compose.prod.yml ps

# 檢查網路連接
kubectl exec -it deployment/api -n health-nutrition-tracker -- nc -zv postgres-service 5432
```

#### 2. API 服務無回應

```bash
# 檢查 API 日誌
kubectl logs -f deployment/api -n health-nutrition-tracker
docker-compose -f docker-compose.prod.yml logs api-1

# 檢查健康端點
curl http://localhost:3001/health
```

#### 3. 記憶體不足

```bash
# 檢查資源使用
kubectl top pods -n health-nutrition-tracker
docker stats

# 調整資源限制
kubectl edit deployment api -n health-nutrition-tracker
```

#### 4. SSL 憑證問題

```bash
# 檢查憑證有效期
openssl x509 -in docker/nginx/ssl/your_domain.crt -text -noout

# 測試 SSL 連接
openssl s_client -connect yourdomain.com:443
```

### 效能調優

#### 資料庫優化

```sql
-- PostgreSQL 效能調優
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

#### Redis 優化

```bash
# 設定記憶體策略
redis-cli CONFIG SET maxmemory-policy allkeys-lru
redis-cli CONFIG SET maxmemory 512mb
```

#### API 服務優化

```bash
# 調整 Node.js 記憶體限制
export NODE_OPTIONS="--max-old-space-size=1024"

# 啟用 PM2 叢集模式
pm2 start ecosystem.config.js --env production
```

### 監控警報

設定重要指標的警報：

- CPU 使用率 > 80%
- 記憶體使用率 > 85%
- 磁碟使用率 > 90%
- API 回應時間 > 2 秒
- 資料庫連接失敗
- 備份任務失敗

### 安全性檢查清單

- [ ] 所有密碼都已更改為強密碼
- [ ] SSL 憑證已正確配置
- [ ] 防火牆規則已設定
- [ ] API Rate Limiting 已啟用
- [ ] 資料庫存取權限已限制
- [ ] 日誌記錄已啟用
- [ ] 備份加密已啟用
- [ ] 安全更新已套用

## 聯絡支援

如遇到部署問題，請提供以下資訊：

1. 部署環境 (Kubernetes/Docker Compose)
2. 錯誤日誌
3. 系統資源狀況
4. 網路配置資訊

---

**注意**: 請定期檢查和更新此部署指南，確保與最新版本保持同步。