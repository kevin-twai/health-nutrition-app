# 在 Render 上設置 PostgreSQL 數據庫

## 架構說明

```
┌─────────────────────────────────────────────────────────┐
│                    Render Dashboard                      │
│                                                          │
│  ┌────────────────────┐      ┌────────────────────┐   │
│  │   PostgreSQL       │      │   後端 Web 服務    │   │
│  │   (獨立服務)       │◄─────┤   (你的 API)       │   │
│  │                    │      │                    │   │
│  │  - 數據庫名稱      │      │  環境變數:         │   │
│  │  - 用戶名          │      │  DATABASE_URL ─────┼───┤
│  │  - 密碼            │      │  JWT_SECRET        │   │
│  │  - 連接字串        │      │  PORT=10000        │   │
│  └────────────────────┘      └────────────────────┘   │
│                                                          │
│  ┌────────────────────┐                                │
│  │   前端 Web 服務    │                                │
│  │   (Next.js)        │                                │
│  │                    │                                │
│  │  環境變數:         │                                │
│  │  NEXT_PUBLIC_API_URL                               │
│  └────────────────────┘                                │
└─────────────────────────────────────────────────────────┘
```

## 步驟 1: 創建 PostgreSQL 數據庫

### 1.1 前往 Render Dashboard

訪問：https://dashboard.render.com

### 1.2 創建新的 PostgreSQL 數據庫

1. 點擊右上角的 **"New +"** 按鈕
2. 選擇 **"PostgreSQL"**

### 1.3 配置數據庫

填寫以下信息：

```
Name: health-nutrition-db
(或任何你喜歡的名稱)

Database: health_nutrition
(數據庫名稱)

User: health_user
(會自動生成，也可以自定義)

Region: Singapore (Southeast Asia)
(選擇離你最近的區域)

PostgreSQL Version: 15
(選擇最新穩定版本)

Plan: Free
(開始時選擇免費方案)
```

### 1.4 點擊 "Create Database"

等待幾分鐘，數據庫會自動創建。

## 步驟 2: 獲取數據庫連接字串

### 2.1 數據庫創建完成後

你會看到數據庫的詳細信息頁面。

### 2.2 找到連接信息

在頁面上方，你會看到幾個連接字串選項：

- **Internal Database URL** ⭐ (推薦使用這個)
- External Database URL
- PSQL Command

### 2.3 複製 Internal Database URL

點擊 "Internal Database URL" 旁邊的複製按鈕。

連接字串格式類似：
```
postgresql://health_user:xxxxxxxxxxxx@dpg-xxxxx-a/health_nutrition
```

## 步驟 3: 配置後端 Web 服務

### 3.1 前往後端 Web 服務

1. 在 Render Dashboard 中，點擊你的後端 Web 服務
   (名稱可能是 "health-nutrition-app" 或類似)

### 3.2 進入 Environment 設置

1. 點擊左側菜單的 **"Environment"**
2. 你會看到環境變數列表

### 3.3 添加必需的環境變數

點擊 **"Add Environment Variable"** 添加以下變數：

#### 變數 1: DATABASE_URL (必需)
```
Key: DATABASE_URL
Value: [貼上你剛才複製的 Internal Database URL]
```

#### 變數 2: JWT_SECRET (必需)
```
Key: JWT_SECRET
Value: [輸入一個隨機的安全字串，例如: my-super-secret-jwt-key-2024]
```

#### 變數 3: PORT (必需)
```
Key: PORT
Value: 10000
```

#### 變數 4: NODE_ENV (建議)
```
Key: NODE_ENV
Value: production
```

#### 變數 5: OPENAI_API_KEY (可選，用於食物識別)
```
Key: OPENAI_API_KEY
Value: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3.4 保存環境變數

點擊 **"Save Changes"**

## 步驟 4: 重新部署後端服務

### 4.1 觸發重新部署

環境變數更新後，服務會自動重新部署。

或者你可以手動觸發：
1. 點擊右上角的 **"Manual Deploy"**
2. 選擇 **"Deploy latest commit"**

### 4.2 監控部署日誌

1. 點擊 **"Logs"** 標籤
2. 查看部署過程
3. 確認沒有錯誤訊息

## 步驟 5: 驗證部署

### 5.1 等待部署完成

通常需要 2-5 分鐘。

### 5.2 測試 API

部署完成後，測試以下端點：

```bash
# 健康檢查
curl https://health-nutrition-app-w3zm.onrender.com/health

# API 根端點
curl https://health-nutrition-app-w3zm.onrender.com/api/v1
```

如果返回 JSON 響應（而不是 502 錯誤），表示部署成功！

## 常見問題

### Q: 為什麼要用 Internal Database URL？

A: Internal Database URL 使用 Render 的內部網絡，速度更快且更安全。

### Q: 免費的 PostgreSQL 有什麼限制？

A: Render 免費方案提供：
- 1 GB 存儲空間
- 90 天後會過期（需要手動延期）
- 適合開發和測試

### Q: 如何查看數據庫內容？

A: 在 PostgreSQL 服務頁面，點擊 "Connect" 可以看到連接命令，使用 psql 或其他數據庫工具連接。

### Q: 數據庫密碼在哪裡？

A: 密碼已經包含在 Internal Database URL 中，格式是：
```
postgresql://用戶名:密碼@主機/數據庫名
```

## 下一步

設置完成後，你的應用程式應該能夠：

1. ✅ 連接到 PostgreSQL 數據庫
2. ✅ 正常啟動後端服務
3. ✅ 響應 API 請求

如果仍然有問題，檢查：
- Render 日誌中的錯誤訊息
- 環境變數是否正確設置
- DATABASE_URL 格式是否正確

## 視覺化步驟總結

```
1. Render Dashboard
   ↓
2. 點擊 "New +" → 選擇 "PostgreSQL"
   ↓
3. 填寫數據庫信息 → 點擊 "Create Database"
   ↓
4. 複製 "Internal Database URL"
   ↓
5. 前往後端 Web 服務 → Environment
   ↓
6. 添加環境變數：
   - DATABASE_URL = [複製的 URL]
   - JWT_SECRET = [隨機字串]
   - PORT = 10000
   ↓
7. 保存並等待自動重新部署
   ↓
8. 測試 API 端點
   ↓
9. ✅ 完成！
```
