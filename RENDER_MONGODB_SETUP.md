# Render MongoDB 環境變數設定指南

## 📋 在 Render 添加 MONGODB_URI 環境變數

### 步驟 1: 取得 MongoDB Atlas 連接字串

從 MongoDB Atlas 取得你的連接字串（參考 `MONGODB_ATLAS_SETUP.md`），格式如下：

```
mongodb+srv://health_app_user:<db_password>@health-nutrition-app.tbsmokt.mongodb.net/?appName=health-nutrition-app
```

### 步驟 2: 在 Render 設定環境變數

1. 登入 [Render Dashboard](https://dashboard.render.com/)
2. 選擇你的 Web Service (health-nutrition-app)
3. 點擊左側的 **Environment** 標籤
4. 點擊 **Add Environment Variable**

### 步驟 3: 填寫環境變數

#### Key (鍵名)
```
MONGODB_URI
```

#### Value (值) - 完整格式

```
mongodb+srv://health_app_user:YOUR_ACTUAL_PASSWORD@health-nutrition-app.tbsmokt.mongodb.net/health_nutrition_db?retryWrites=true&w=majority&appName=health-nutrition-app
```

## ⚠️ 重要提醒

### 1. 替換密碼
將 `YOUR_ACTUAL_PASSWORD` 替換為你在 MongoDB Atlas 設定的實際密碼

**範例:**
如果你的密碼是 `MySecurePass123`，則填入：
```
mongodb+srv://health_app_user:MySecurePass123@health-nutrition-app.tbsmokt.mongodb.net/health_nutrition_db?retryWrites=true&w=majority&appName=health-nutrition-app
```

### 2. 密碼包含特殊字元？
如果密碼包含特殊字元（如 `@`, `#`, `$`, `%` 等），需要進行 URL encode：

| 特殊字元 | URL Encoded |
|---------|-------------|
| @       | %40         |
| #       | %23         |
| $       | %24         |
| %       | %25         |
| ^       | %5E         |
| &       | %26         |
| *       | %2A         |
| (       | %28         |
| )       | %29         |
| +       | %2B         |
| =       | %3D         |
| [       | %5B         |
| ]       | %5D         |
| {       | %7B         |
| }       | %7D         |
| \|      | %7C         |
| :       | %3A         |
| ;       | %3B         |
| "       | %22         |
| '       | %27         |
| <       | %3C         |
| >       | %3E         |
| ,       | %2C         |
| ?       | %3F         |
| /       | %2F         |
| \       | %5C         |

**範例:**
如果密碼是 `Pass@123#`，則填入：
```
mongodb+srv://health_app_user:Pass%40123%23@health-nutrition-app.tbsmokt.mongodb.net/health_nutrition_db?retryWrites=true&w=majority&appName=health-nutrition-app
```

### 3. 確認連接字串格式

完整的連接字串應該包含：

```
mongodb+srv://[使用者名稱]:[密碼]@[cluster地址]/[資料庫名稱]?[選項參數]
```

**各部分說明:**
- `mongodb+srv://` - 協議（固定）
- `health_app_user` - MongoDB 使用者名稱
- `YOUR_PASSWORD` - 你的密碼（需替換）
- `health-nutrition-app.tbsmokt.mongodb.net` - 你的 Cluster 地址
- `health_nutrition_db` - 資料庫名稱
- `retryWrites=true&w=majority` - 連接選項
- `appName=health-nutrition-app` - 應用名稱

## 📝 完整設定範例

### 範例 1: 簡單密碼
```
Key: MONGODB_URI
Value: mongodb+srv://health_app_user:SimplePass123@health-nutrition-app.tbsmokt.mongodb.net/health_nutrition_db?retryWrites=true&w=majority&appName=health-nutrition-app
```

### 範例 2: 包含特殊字元的密碼
```
Key: MONGODB_URI
Value: mongodb+srv://health_app_user:MyP%40ss%23123@health-nutrition-app.tbsmokt.mongodb.net/health_nutrition_db?retryWrites=true&w=majority&appName=health-nutrition-app
```

## 🔧 設定後的步驟

### 1. 儲存環境變數
點擊 **Save Changes** 按鈕

### 2. 重新部署
Render 會自動重新部署你的應用

### 3. 檢查部署日誌
在 **Logs** 標籤中查看是否成功連接到 MongoDB：
```
✅ MongoDB 連接成功
📊 開始導入營養資料...
```

### 4. 測試連接
部署完成後，測試 API：
```bash
curl https://your-app.onrender.com/api/health
```

應該看到包含 MongoDB 連接狀態的回應。

## 🚨 常見錯誤排除

### 錯誤 1: "Authentication failed"
**原因:** 密碼錯誤或未正確 URL encode
**解決:** 
1. 確認密碼正確
2. 檢查特殊字元是否已 URL encode

### 錯誤 2: "Connection timeout"
**原因:** IP 白名單未設定
**解決:** 
1. 前往 MongoDB Atlas
2. Network Access → Add IP Address
3. 選擇 "Allow Access from Anywhere" (0.0.0.0/0)

### 錯誤 3: "Database not found"
**原因:** 資料庫名稱錯誤
**解決:** 
確認連接字串中的資料庫名稱為 `health_nutrition_db`

### 錯誤 4: "Invalid connection string"
**原因:** 連接字串格式錯誤
**解決:** 
1. 檢查是否有多餘的空格
2. 確認所有部分都正確填寫
3. 使用 MongoDB Atlas 提供的連接字串作為基礎

## 📋 檢查清單

在 Render 設定 MONGODB_URI 前，確認：

- [ ] 已在 MongoDB Atlas 建立 Cluster
- [ ] 已建立資料庫使用者 (health_app_user)
- [ ] 已記錄密碼
- [ ] 已設定 Network Access (允許所有 IP 或 Render IP)
- [ ] 已取得完整連接字串
- [ ] 密碼中的特殊字元已 URL encode
- [ ] 連接字串包含資料庫名稱 (health_nutrition_db)

設定完成後：

- [ ] 環境變數已儲存
- [ ] 應用已重新部署
- [ ] 部署日誌顯示成功
- [ ] API 測試通過

## 🔗 相關文件

- [MongoDB Atlas 設定指南](./MONGODB_ATLAS_SETUP.md)
- [Render 部署指南](./RENDER_DEPLOYMENT_GUIDE.md)
- [環境變數設定指南](./RENDER_ENVIRONMENT_SETUP_GUIDE.md)

## 💡 小技巧

### 使用線上工具 URL Encode 密碼
如果不確定如何 encode 密碼，可以使用：
- [URL Encoder](https://www.urlencoder.org/)
- 或在瀏覽器 Console 執行：
```javascript
encodeURIComponent('your_password_here')
```

### 測試連接字串
在本地測試連接字串是否正確：
```bash
# 在 .env 檔案中設定
MONGODB_URI=你的連接字串

# 執行測試
npx ts-node apps/api/src/scripts/verify-nutrition-data.ts
```

---

**設定完成後，你的應用就能在 Render 上使用 MongoDB Atlas 的營養資料庫了！** 🎉
