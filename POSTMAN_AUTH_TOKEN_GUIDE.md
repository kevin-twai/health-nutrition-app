# Postman 認證 Token 使用指南

## 🎉 恭喜！註冊和登入成功！

現在你需要使用登入時獲得的 JWT token 來訪問需要認證的 API。

---

## 📋 如何在 Postman 中使用 Token

### 步驟 1: 複製登入回應中的 Token

從 "3. Login User" 的回應中，複製 `data.token` 的值：

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // 複製這個
  }
}
```

### 步驟 2: 在 "4. Get User Profile" 請求中添加 Token

1. 打開 "4. Get User Profile" 請求
2. 點擊 "Authorization" 標籤
3. 在 "Type" 下拉選單中選擇 "Bearer Token"
4. 在 "Token" 欄位中貼上剛才複製的 token
5. 點擊 "Send"

### 或者使用 Headers 方式

1. 打開 "4. Get User Profile" 請求
2. 點擊 "Headers" 標籤
3. 添加新的 header：
   - Key: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（注意 Bearer 後面有空格）
4. 點擊 "Send"

---

## 🔄 Postman 環境變數（推薦方法）

為了避免每次都手動複製貼上 token，可以使用 Postman 的環境變數：

### 設置環境變數

1. **創建環境**：
   - 點擊右上角的 "Environments"
   - 點擊 "+" 創建新環境
   - 命名為 "Health Nutrition API - Render"

2. **添加變數**：
   - Variable: `base_url`
   - Initial Value: `https://health-nutrition-api.onrender.com`
   - Current Value: `https://health-nutrition-api.onrender.com`
   
   - Variable: `auth_token`
   - Initial Value: (留空)
   - Current Value: (留空)

3. **保存環境**

### 自動保存 Token

在 "3. Login User" 請求中：

1. 點擊 "Tests" 標籤
2. 添加以下腳本：

```javascript
// 自動保存 token 到環境變數
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success && response.data.token) {
        pm.environment.set("auth_token", response.data.token);
        console.log("Token saved:", response.data.token);
    }
}
```

3. 保存請求

### 使用環境變數

在所有需要認證的請求中（Get User Profile, Upload Food Image 等）：

1. 點擊 "Authorization" 標籤
2. Type: "Bearer Token"
3. Token: `{{auth_token}}`（使用雙大括號引用變數）

或在 Headers 中：
- Key: `Authorization`
- Value: `Bearer {{auth_token}}`

---

## 🧪 測試流程

### 完整的測試流程：

1. **註冊新用戶** (2. Register User)
   - 獲得 token（可選，也可以直接登入）

2. **登入** (3. Login User)
   - 自動保存 token 到環境變數

3. **獲取用戶資料** (4. Get User Profile)
   - 使用 `{{auth_token}}`
   - 預期回應: 200 OK，包含用戶完整資料

4. **上傳食物圖片** (5. Upload Food Image)
   - 使用 `{{auth_token}}`
   - 上傳圖片並獲得食物識別結果

5. **其他 API**
   - 所有需要認證的 API 都使用 `{{auth_token}}`

---

## ✅ 預期的成功回應

### Get User Profile (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "test@example.com",
    "profile": {
      "name": "測試用戶",
      "age": 30,
      "gender": "male",
      "height": 175,
      "weight": 70,
      "activityLevel": "moderately_active"
    },
    "preferences": {
      "language": "zh-TW",
      "timezone": "Asia/Taipei",
      "notifications": {
        "email": true,
        "push": true
      }
    },
    "createdAt": "2024-11-15T...",
    "lastLoginAt": "2024-11-15T..."
  }
}
```

---

## ❌ 常見錯誤

### 1. 401 Unauthorized - MISSING_TOKEN
**原因**: 沒有提供 token  
**解決**: 在 Authorization 或 Headers 中添加 token

### 2. 401 Unauthorized - INVALID_TOKEN
**原因**: Token 格式錯誤或已過期  
**解決**: 重新登入獲取新的 token

### 3. 401 Unauthorized - TOKEN_EXPIRED
**原因**: Token 已過期  
**解決**: 重新登入獲取新的 token

---

## 💡 提示

1. **Token 有效期**: JWT token 通常有效期為 24 小時
2. **安全性**: 不要在公開的地方分享你的 token
3. **測試**: 每次重新註冊或登入都會獲得新的 token
4. **環境**: 可以為不同環境（本地、測試、生產）創建不同的 Postman 環境

---

## 🎯 下一步

現在你可以：

1. ✅ 測試 Get User Profile
2. ✅ 測試其他需要認證的 API
3. ✅ 開始使用完整的 API 功能

祝測試順利！🚀
