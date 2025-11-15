# Render 環境變數完整配置指南

## 📋 需要配置的環境變數

### 1. AWS S3 配置（照片上傳功能）

| 變數名稱 | 值 | 說明 |
|---------|-----|------|
| `AWS_ACCESS_KEY_ID` | 你的 AWS Access Key ID | 從 AWS IAM 獲取 |
| `AWS_SECRET_ACCESS_KEY` | 你的 AWS Secret Access Key | 從 AWS IAM 獲取 |
| `AWS_REGION` | `ap-northeast-1` 或其他 | 你的 S3 Bucket 所在區域 |
| `AWS_S3_BUCKET` | 你創建的 bucket 名稱 | 例如：`health-nutrition-tracker-kevinhktw` |

### 2. 資料庫配置（已配置）

| 變數名稱 | 值 | 說明 |
|---------|-----|------|
| `DATABASE_URL` | Render PostgreSQL 連接字串 | 自動配置 |
| `REDIS_URL` | Render Redis 連接字串 | 自動配置（如果有） |

### 3. OpenAI API 配置（食物識別功能）

| 變數名稱 | 值 | 說明 |
|---------|-----|------|
| `OPENAI_API_KEY` | 你的 OpenAI API Key | 從 OpenAI 獲取 |

### 4. JWT 配置（用戶認證）

| 變數名稱 | 值 | 說明 |
|---------|-----|------|
| `JWT_SECRET` | 隨機生成的密鑰 | 至少 32 字符的隨機字串 |
| `JWT_EXPIRES_IN` | `7d` | Token 有效期（可選） |

### 5. 應用配置

| 變數名稱 | 值 | 說明 |
|---------|-----|------|
| `NODE_ENV` | `production` | 環境模式 |
| `PORT` | `3000` | 端口（Render 會自動設置） |

---

## 🔧 詳細配置步驟

### 步驟 1：登入 Render Dashboard

1. 前往：https://dashboard.render.com
2. 找到你的服務：`health-nutrition-api`
3. 點擊進入服務頁面

### 步驟 2：進入環境變數設置

1. 點擊左側菜單的 **"Environment"** 標籤
2. 你會看到現有的環境變數列表

### 步驟 3：添加 AWS S3 環境變數

#### 3.1 添加 AWS_ACCESS_KEY_ID

1. 點擊 **"Add Environment Variable"** 按鈕
2. **Key**: 輸入 `AWS_ACCESS_KEY_ID`
3. **Value**: 輸入你的 AWS Access Key ID（從 AWS IAM 獲取）
4. 點擊 **"Save"**

#### 3.2 添加 AWS_SECRET_ACCESS_KEY

1. 點擊 **"Add Environment Variable"** 按鈕
2. **Key**: 輸入 `AWS_SECRET_ACCESS_KEY`
3. **Value**: 輸入你的 AWS Secret Access Key
4. 點擊 **"Save"**

#### 3.3 添加 AWS_REGION

1. 點擊 **"Add Environment Variable"** 按鈕
2. **Key**: 輸入 `AWS_REGION`
3. **Value**: 輸入你的 S3 Bucket 所在區域
   - 如果你在 AWS 控制台創建 bucket 時選擇的是：
     - **亞太區域（東京）**: `ap-northeast-1`
     - **亞太區域（首爾）**: `ap-northeast-2`
     - **亞太區域（新加坡）**: `ap-southeast-1`
     - **美國東部（維吉尼亞）**: `us-east-1`
     - **美國西部（俄勒岡）**: `us-west-2`
4. 點擊 **"Save"**

#### 3.4 添加 AWS_S3_BUCKET

1. 點擊 **"Add Environment Variable"** 按鈕
2. **Key**: 輸入 `AWS_S3_BUCKET`
3. **Value**: 輸入你剛創建的 bucket 名稱
   - 例如：`health-nutrition-tracker-kevinhktw`
4. 點擊 **"Save"**

### 步驟 4：添加 OpenAI API Key（如果還沒有）

1. 點擊 **"Add Environment Variable"** 按鈕
2. **Key**: 輸入 `OPENAI_API_KEY`
3. **Value**: 輸入你的 OpenAI API Key
   - 從 https://platform.openai.com/api-keys 獲取
4. 點擊 **"Save"**

### 步驟 5：添加 JWT Secret（如果還沒有）

1. 點擊 **"Add Environment Variable"** 按鈕
2. **Key**: 輸入 `JWT_SECRET`
3. **Value**: 輸入一個隨機生成的密鑰
   - 可以使用以下命令生成：
     ```bash
     openssl rand -base64 32
     ```
   - 或使用線上工具：https://randomkeygen.com/
4. 點擊 **"Save"**

### 步驟 6：確認所有環境變數

確保你已經添加了以下環境變數：

```
✅ AWS_ACCESS_KEY_ID
✅ AWS_SECRET_ACCESS_KEY
✅ AWS_REGION
✅ AWS_S3_BUCKET
✅ OPENAI_API_KEY
✅ JWT_SECRET
✅ DATABASE_URL (應該已經存在)
✅ NODE_ENV (設置為 production)
```

### 步驟 7：保存並重新部署

1. 確認所有環境變數都已添加
2. Render 會自動檢測到環境變數的變更
3. 點擊 **"Manual Deploy"** → **"Deploy latest commit"**
4. 等待部署完成（約 3-5 分鐘）

---

## 🔍 如何獲取 AWS 憑證

### 方法 1：使用現有的 AWS 帳號

1. 登入 AWS Console: https://console.aws.amazon.com
2. 搜索並進入 **IAM** 服務
3. 點擊左側菜單的 **"Users"**
4. 點擊 **"Create user"** 創建新用戶
   - User name: `health-nutrition-api`
   - 勾選 **"Provide user access to the AWS Management Console"** (可選)
5. 點擊 **"Next"**
6. 設置權限：
   - 選擇 **"Attach policies directly"**
   - 搜索並勾選 **"AmazonS3FullAccess"**
   - 或創建自定義策略（更安全，見下方）
7. 點擊 **"Next"** → **"Create user"**
8. 創建 Access Key：
   - 進入剛創建的用戶頁面
   - 點擊 **"Security credentials"** 標籤
   - 點擊 **"Create access key"**
   - 選擇 **"Application running outside AWS"**
   - 點擊 **"Next"** → **"Create access key"**
   - **重要**：複製 **Access key ID** 和 **Secret access key**
   - 這是唯一一次可以看到 Secret access key 的機會！

### 方法 2：使用自定義 IAM 策略（推薦，更安全）

創建一個只有 S3 必要權限的策略：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::你的bucket名稱",
                "arn:aws:s3:::你的bucket名稱/*"
            ]
        }
    ]
}
```

---

## 🧪 測試配置

配置完成並重新部署後，測試照片上傳功能：

```bash
# 執行測試腳本
./test-photo-upload.sh
```

或使用 curl：

```bash
curl -X POST https://health-nutrition-api.onrender.com/api/v1/photo/recognize \
  -F "photo=@你的圖片路徑.jpg" \
  --max-time 120
```

---

## ❗ 常見問題

### Q1: 找不到 AWS Access Key 在哪裡？

**A**: 
1. 登入 AWS Console
2. 點擊右上角的用戶名
3. 選擇 **"Security credentials"**
4. 滾動到 **"Access keys"** 部分
5. 點擊 **"Create access key"**

### Q2: 忘記複製 Secret Access Key 怎麼辦？

**A**: Secret Access Key 只在創建時顯示一次。如果忘記了，需要：
1. 刪除舊的 Access Key
2. 創建新的 Access Key
3. 更新 Render 上的環境變數

### Q3: 如何確認環境變數是否生效？

**A**: 
1. 查看 Render 部署日誌
2. 或在代碼中添加日誌輸出（不要輸出完整的密鑰！）：
   ```typescript
   console.log('AWS Region:', process.env.AWS_REGION);
   console.log('S3 Bucket:', process.env.AWS_S3_BUCKET);
   console.log('AWS Key exists:', !!process.env.AWS_ACCESS_KEY_ID);
   ```

### Q4: 部署後還是報錯怎麼辦？

**A**: 
1. 檢查 Render 日誌中的錯誤訊息
2. 確認所有環境變數都已正確設置
3. 確認 AWS 憑證有效且有正確的權限
4. 確認 S3 Bucket 名稱正確
5. 確認 S3 Bucket 的 CORS 配置正確

---

## 🔒 安全最佳實踐

1. **不要將憑證提交到 Git**
   - 確保 `.env` 在 `.gitignore` 中
   - 不要在代碼中硬編碼憑證

2. **使用最小權限原則**
   - 只授予必要的 S3 權限
   - 不要使用 root 帳號的 Access Key

3. **定期輪換憑證**
   - 建議每 90 天輪換一次 Access Key
   - 在 AWS IAM 中設置提醒

4. **監控使用情況**
   - 在 AWS CloudWatch 中監控 S3 使用情況
   - 設置異常使用警報

---

## 📝 環境變數檢查清單

配置完成後，請確認：

- [ ] `AWS_ACCESS_KEY_ID` 已設置
- [ ] `AWS_SECRET_ACCESS_KEY` 已設置
- [ ] `AWS_REGION` 已設置（與 bucket 區域一致）
- [ ] `AWS_S3_BUCKET` 已設置（與實際 bucket 名稱一致）
- [ ] `OPENAI_API_KEY` 已設置
- [ ] `JWT_SECRET` 已設置
- [ ] `DATABASE_URL` 存在
- [ ] `NODE_ENV` 設置為 `production`
- [ ] Render 服務已重新部署
- [ ] 照片上傳功能測試通過

---

## 🎉 完成！

配置完成後，你的應用應該可以：
- ✅ 上傳照片到 S3
- ✅ 使用 OpenAI 識別食物
- ✅ 用戶認證和授權
- ✅ 資料庫操作

如果遇到問題，請查看 Render 的部署日誌或聯繫支援。
