# Render AWS S3 環境變數配置

## 🔍 問題

照片上傳失敗，錯誤訊息：
```
Missing credentials in config, if using AWS_CONFIG_FILE, set AWS_SDK_LOAD_CONFIG=1
```

## 🎯 原因

Render 上缺少 AWS S3 的環境變數配置。

## 🔧 解決方案

### 步驟 1：在 Render Dashboard 配置環境變數

1. 登入 Render Dashboard: https://dashboard.render.com
2. 找到服務 "health-nutrition-api"
3. 點擊 "Environment" 標籤
4. 添加以下環境變數：

#### 必需的環境變數：

```bash
# AWS 憑證
AWS_ACCESS_KEY_ID=你的_AWS_Access_Key_ID
AWS_SECRET_ACCESS_KEY=你的_AWS_Secret_Access_Key

# AWS 區域
AWS_REGION=us-east-1

# S3 Bucket 名稱
AWS_S3_BUCKET=health-tracker-images
```

### 步驟 2：獲取 AWS 憑證

如果你還沒有 AWS 憑證：

#### 選項 A：使用現有的 AWS 帳號

1. 登入 AWS Console: https://console.aws.amazon.com
2. 進入 IAM (Identity and Access Management)
3. 創建新的 IAM 用戶或使用現有用戶
4. 為用戶添加 S3 權限（AmazonS3FullAccess 或自定義策略）
5. 創建 Access Key
6. 複製 Access Key ID 和 Secret Access Key

#### 選項 B：創建新的 AWS 帳號

1. 註冊 AWS 免費帳號: https://aws.amazon.com/free/
2. 按照上面的步驟創建 IAM 用戶和 Access Key

#### 選項 C：使用替代方案（暫時）

如果不想使用 AWS S3，可以：
- 使用 Cloudinary（免費方案）
- 使用 Render 的文件存儲
- 暫時禁用圖片上傳功能

### 步驟 3：創建 S3 Bucket

1. 登入 AWS Console
2. 進入 S3 服務
3. 點擊 "Create bucket"
4. Bucket 名稱：`health-tracker-images`（或其他名稱）
5. 區域：選擇 `us-east-1`（或其他區域）
6. 配置 CORS（允許跨域上傳）：

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

7. 配置 Bucket Policy（允許公開讀取）：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::health-tracker-images/*"
        }
    ]
}
```

### 步驟 4：在 Render 上重新部署

配置完環境變數後：
1. Render 會自動重新部署服務
2. 或手動點擊 "Manual Deploy" → "Deploy latest commit"
3. 等待部署完成（約 3-5 分鐘）

### 步驟 5：測試照片上傳

部署完成後，重新測試：

```bash
./test-photo-upload.sh
```

## 🔒 安全注意事項

### 1. 不要將 AWS 憑證提交到 Git

確保 `.env` 文件在 `.gitignore` 中：

```bash
# .gitignore
.env
.env.local
.env.production
```

### 2. 使用最小權限原則

為 IAM 用戶創建自定義策略，只授予必要的 S3 權限：

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
                "arn:aws:s3:::health-tracker-images",
                "arn:aws:s3:::health-tracker-images/*"
            ]
        }
    ]
}
```

### 3. 定期輪換憑證

建議每 90 天輪換一次 AWS Access Key。

## 🆘 替代方案

如果不想使用 AWS S3，可以考慮：

### 選項 1：Cloudinary（推薦）

免費方案提供：
- 25 GB 存儲
- 25 GB 月流量
- 圖片轉換和優化

配置步驟：
1. 註冊 Cloudinary: https://cloudinary.com
2. 獲取 API 憑證
3. 修改代碼使用 Cloudinary SDK

### 選項 2：Render Disk Storage

Render 提供持久化存儲：
- 需要付費方案
- 適合小規模應用

### 選項 3：暫時禁用圖片上傳

修改代碼，暫時返回模擬數據：

```typescript
// 在 ImageProcessingService 中
async uploadAndProcessImage(file: Express.Multer.File, options: ImageProcessingOptions) {
  // 暫時返回模擬數據
  return {
    imageId: uuidv4(),
    originalUrl: 'https://via.placeholder.com/800',
    processedUrl: 'https://via.placeholder.com/800',
    metadata: {
      originalSize: file.size,
      processedSize: file.size,
      width: 800,
      height: 600,
      format: 'jpeg',
      uploadedAt: new Date()
    }
  };
}
```

## 📝 檢查清單

- [ ] 在 Render 上配置 `AWS_ACCESS_KEY_ID`
- [ ] 在 Render 上配置 `AWS_SECRET_ACCESS_KEY`
- [ ] 在 Render 上配置 `AWS_REGION`
- [ ] 在 Render 上配置 `AWS_S3_BUCKET`
- [ ] 創建 S3 Bucket
- [ ] 配置 S3 CORS
- [ ] 配置 S3 Bucket Policy
- [ ] 重新部署 Render 服務
- [ ] 測試照片上傳功能

## 🔗 相關資源

- AWS IAM Console: https://console.aws.amazon.com/iam/
- AWS S3 Console: https://console.aws.amazon.com/s3/
- Render Environment Variables: https://render.com/docs/environment-variables
- Cloudinary: https://cloudinary.com
