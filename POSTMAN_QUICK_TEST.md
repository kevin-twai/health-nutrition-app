# Postman 快速測試指南

## 🎯 測試 Render 部署的 API

### API Base URL
```
https://health-nutrition-api.onrender.com
```

---

## 測試步驟

### 1️⃣ 測試健康檢查

**目的**: 確認 API 服務正常運行且資料庫已連接

- **URL**: `https://health-nutrition-api.onrender.com/health`
- **Method**: `GET`
- **預期回應**: 
  - Status: `200 OK`
  - Body 包含:
    ```json
    {
      "status": "healthy",
      "database": "connected",
      "checks": {
        "database": true,
        "redis": true,
        "external_apis": true
      }
    }
    ```

---

### 2️⃣ 測試用戶註冊

**目的**: 驗證資料庫表已正確創建，可以註冊新用戶

- **URL**: `https://health-nutrition-api.onrender.com/api/v1/auth/register`
- **Method**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "test123@example.com",
    "password": "Test@12345",
    "confirmPassword": "Test@12345",
    "profile": {
      "name": "測試用戶",
      "age": 30,
      "gender": "male",
      "height": 175,
      "weight": 70,
      "activityLevel": "moderately_active"
    }
  }
  ```
- **預期回應**:
  - Status: `201 Created`
  - Body 包含:
    ```json
    {
      "success": true,
      "message": "用戶註冊成功",
      "data": {
        "user": {
          "id": "...",
          "email": "test123@example.com"
        },
        "token": "eyJhbGc..."
      }
    }
    ```

**注意**: 每次測試請更換不同的 email，避免重複註冊錯誤。

---

### 3️⃣ 測試用戶登入

**目的**: 驗證已註冊用戶可以成功登入

- **URL**: `https://health-nutrition-api.onrender.com/api/v1/auth/login`
- **Method**: `POST`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "test123@example.com",
    "password": "Test@12345"
  }
  ```
- **預期回應**:
  - Status: `200 OK`
  - Body 包含:
    ```json
    {
      "success": true,
      "message": "登入成功",
      "data": {
        "user": {
          "id": "...",
          "email": "test123@example.com",
          "profile": {
            "name": "測試用戶",
            "age": 30
          }
        },
        "token": "eyJhbGc..."
      }
    }
    ```

---

## 🔍 如何在 Postman 中操作

### 創建新請求

1. 打開 Postman
2. 點擊 "New" → "HTTP Request"
3. 選擇 HTTP Method (GET/POST)
4. 輸入 URL
5. 如果是 POST 請求：
   - 點擊 "Headers" 標籤，添加 `Content-Type: application/json`
   - 點擊 "Body" 標籤，選擇 "raw" 和 "JSON"
   - 貼上 JSON 內容
6. 點擊 "Send" 發送請求

### 查看回應

- 在下方的 "Response" 區域查看：
  - Status code (200, 201, 400, 500 等)
  - Response body (JSON 格式)
  - Response time
  - Response size

---

## ❌ 常見錯誤處理

### 錯誤 1: 500 Internal Server Error (註冊時)

**可能原因**: 資料庫表未創建

**解決方法**:
1. 檢查 Render 日誌，確認看到：
   - `🔧 開始執行資料庫遷移...`
   - `🎉 所有資料庫遷移執行完成！`
2. 如果沒有看到，等待部署完成（約 2-3 分鐘）

### 錯誤 2: 400 Bad Request

**可能原因**: 請求格式錯誤或驗證失敗

**檢查項目**:
- Email 格式是否正確
- Password 是否符合要求（至少 8 字符，包含大小寫字母和數字）
- confirmPassword 是否與 password 一致
- profile 中的所有必填欄位是否都有提供

### 錯誤 3: 409 Conflict

**原因**: Email 已被註冊

**解決方法**: 更換不同的 email 地址

---

## 🎉 測試成功標準

如果以下三個測試都通過，表示資料庫已正確初始化：

✅ 健康檢查返回 200，database 狀態為 "connected"  
✅ 用戶註冊返回 201，成功創建用戶  
✅ 用戶登入返回 200，成功獲取 token  

---

## 💡 提示

- 使用 Postman 的 "Collections" 功能可以保存所有測試請求
- 可以使用 Postman 的 "Environment Variables" 來管理不同環境的 URL
- 登入成功後，保存返回的 token，用於後續需要認證的 API 測試
