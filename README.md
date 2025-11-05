# 健康營養追蹤系統 (Health Nutrition Tracker)

綜合性健康管理應用，透過拍照辨識餐點自動估算營養素，結合AI聊天顧問提供個人化建議，並整合第三方平台實現自動化記錄。

## 🚀 功能特色

- **📸 拍照辨識餐點營養**: 使用AI技術自動辨識食物並計算營養成分
- **🤖 AI 聊天健康顧問**: 個人化健康建議和營養指導
- **🔗 第三方平台整合**: 與Notion、Line、Apple Health等平台同步
- **📊 週度健康報告**: 詳細的健康趨勢分析和改善建議
- **🎮 遊戲化任務系統**: 任務、獎勵和成就系統提升參與度

## 🏗️ 專案架構

這是一個 monorepo 專案，使用 Turbo 進行建置管理：

```
health-nutrition-tracker/
├── apps/
│   ├── api/          # Node.js + Express 後端 API
│   ├── web/          # Next.js 網頁應用
│   └── mobile/       # React Native 移動應用
├── packages/
│   └── shared-types/ # 共享 TypeScript 類型定義
└── docker/           # Docker 容器配置
```

## 🛠️ 技術堆疊

### 前端
- **移動應用**: React Native + Redux Toolkit
- **網頁應用**: Next.js + TypeScript + Tailwind CSS
- **狀態管理**: Redux Toolkit + React Query

### 後端
- **API 服務**: Node.js + Express + TypeScript
- **資料庫**: PostgreSQL (結構化資料) + MongoDB (營養資料)
- **快取**: Redis
- **檔案儲存**: AWS S3

### DevOps
- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **負載平衡**: NGINX
- **監控**: AWS CloudWatch

## 🚀 快速開始

### 前置需求

- Node.js 18+ 
- Docker & Docker Compose
- npm 9+

### 安裝與執行

1. **複製專案**
   ```bash
   git clone <repository-url>
   cd health-nutrition-tracker
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **設定環境變數**
   ```bash
   cp apps/api/.env.example apps/api/.env
   # 編輯 .env 檔案，填入必要的配置
   ```

4. **啟動開發環境**
   ```bash
   # 使用 Docker 啟動所有服務
   npm run docker:up
   
   # 或者分別啟動各服務
   npm run dev
   ```

5. **訪問應用**
   - API 服務: http://localhost:3001
   - 網頁應用: http://localhost:3000
   - API 文檔: http://localhost:3001/api/v1

## 📝 開發指令

```bash
# 開發模式
npm run dev

# 建置所有應用
npm run build

# 執行測試
npm run test

# 程式碼檢查
npm run lint

# 類型檢查
npm run type-check

# 清理建置檔案
npm run clean

# Docker 相關
npm run docker:build    # 建置 Docker 映像
npm run docker:up       # 啟動容器
npm run docker:down     # 停止容器
```

## 🗄️ 資料庫架構

### PostgreSQL (結構化資料)
- 用戶管理 (users, user_profiles)
- 健康目標 (health_goals)
- 食物記錄 (food_logs)
- 對話歷史 (chat_conversations)
- 遊戲化資料 (user_progress, achievements, tasks)

### MongoDB (營養資料)
- 食物項目 (food_items)
- 營養成分資料庫
- 辨識快取 (food_recognition_cache)

## 🔧 API 端點

### 認證
- `POST /api/v1/auth/register` - 用戶註冊
- `POST /api/v1/auth/login` - 用戶登入
- `POST /api/v1/auth/refresh` - 刷新 Token

### 拍照辨識
- `POST /api/v1/photo/upload` - 上傳照片辨識
- `POST /api/v1/food/confirm` - 確認食物選擇

### AI 聊天
- `POST /api/v1/chat/message` - 發送聊天訊息
- `GET /api/v1/chat/history` - 獲取對話歷史

### 健康報告
- `GET /api/v1/reports/weekly` - 獲取週報
- `POST /api/v1/reports/generate` - 生成報告

## 🧪 測試

```bash
# 執行所有測試
npm run test

# 執行特定應用的測試
npm run test --workspace=@health-tracker/api

# 監視模式
npm run test:watch
```

## 📦 部署

### Docker 部署

```bash
# 構建並啟動所有服務
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f
```

### 生產環境

1. 設定生產環境變數
2. 建置 Docker 映像
3. 部署到 AWS ECS 或 Kubernetes
4. 配置 NGINX 負載平衡
5. 設定監控和日誌

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

## 📞 聯絡資訊

如有問題或建議，請開啟 Issue 或聯絡開發團隊。

---

**健康營養追蹤系統** - 讓健康管理變得更簡單、更智慧！ 🌟