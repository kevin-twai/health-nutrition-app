# Cloudinary 遷移完整指南

## ✅ 你已經完成

- [x] 註冊 Cloudinary 帳號
- [x] 獲取 API Key
- [x] 獲取 API Secret

## 📋 Cloudinary 設定

### 1. Cloudinary Dashboard 設定（可選）

大部分情況下，Cloudinary 的預設設定已經足夠。但你可以進行以下優化：

#### 1.1 登入 Cloudinary Dashboard
https://cloudinary.com/console

#### 1.2 檢查你的憑證
在 Dashboard 首頁，你應該看到：
- **Cloud Name**: 你的 cloud name（例如：`dxxxxx`）
- **API Key**: 你的 API key
- **API Secret**: 你的 API secret（點擊眼睛圖標顯示）

#### 1.3 設定上傳預設值（可選）

進入 **Settings** → **Upload**：
- **Upload presets**: 可以創建預設的上傳配置
- **Allowed formats**: 確保包含 `jpg`, `png`, `heic`, `heif`
- **Max file size**: 建議設置為 10MB

#### 1.4 設定資料夾結構（可選）

Cloudinary 會自動管理資料夾，但你可以設定：
- 進入 **Media Library**
- 創建資料夾：`health-nutrition-app/food-images`

#### 1.5 啟用自動優化（推薦）

進入 **Settings** → **Image Optimization**：
- 啟用 **Auto quality**
- 啟用 **Auto format**

### 2. 不需要額外設定的功能

Cloudinary 預設已經支援：
- ✅ CORS（跨域請求）
- ✅ HTTPS
- ✅ 圖片轉換和優化
- ✅ CDN 加速
- ✅ 自動備份

## 🔧 代碼修改

### 步驟 1：安裝 Cloudinary SDK

```bash
cd apps/api
npm install cloudinary
```

### 步驟 2：修改 ImageProcessingService

我會為你創建新的 Cloudinary 版本的 ImageProcessingService。

### 步驟 3：配置環境變數

#### Render 環境變數：

| 變數名稱 | 值 | 說明 |
|---------|-----|------|
| `CLOUDINARY_CLOUD_NAME` | 你的 Cloud Name | 從 Dashboard 獲取 |
| `CLOUDINARY_API_KEY` | 你的 API Key | 從 Dashboard 獲取 |
| `CLOUDINARY_API_SECRET` | 你的 API Secret | 從 Dashboard 獲取 |

#### 本地開發環境變數（.env）：

```bash
CLOUDINARY_CLOUD_NAME=你的cloud_name
CLOUDINARY_API_KEY=你的api_key
CLOUDINARY_API_SECRET=你的api_secret
```

## 📊 Cloudinary vs AWS S3 比較

| 功能 | Cloudinary | AWS S3 |
|------|-----------|--------|
| 設定複雜度 | ⭐ 簡單 | ⭐⭐⭐ 複雜 |
| 圖片優化 | ✅ 內建 | ❌ 需要額外服務 |
| CDN | ✅ 內建 | ❌ 需要 CloudFront |
| 免費額度 | 25GB 存儲 + 25GB 流量 | 5GB 存儲 + 有限流量 |
| 圖片轉換 | ✅ 免費 | ❌ 需要 Lambda |
| URL 簽名 | ✅ 支援 | ✅ 支援 |

## 🎉 Cloudinary 優勢

1. **自動圖片優化**
   - 自動選擇最佳格式（WebP, AVIF）
   - 自動調整質量
   - 自動壓縮

2. **強大的轉換功能**
   - 即時調整大小
   - 裁剪和濾鏡
   - 人臉檢測
   - 背景移除

3. **CDN 加速**
   - 全球 CDN 節點
   - 自動快取
   - 快速載入

4. **簡單的 API**
   - 一行代碼上傳
   - RESTful API
   - 豐富的 SDK

## 📝 遷移檢查清單

- [ ] 安裝 Cloudinary SDK
- [ ] 修改 ImageProcessingService.ts
- [ ] 在 Render 上配置環境變數
- [ ] 在本地 .env 配置環境變數
- [ ] 測試圖片上傳
- [ ] 測試圖片訪問
- [ ] 部署到 Render
- [ ] 最終測試

## 🔗 有用的連結

- Cloudinary Dashboard: https://cloudinary.com/console
- Cloudinary 文檔: https://cloudinary.com/documentation
- Node.js SDK: https://cloudinary.com/documentation/node_integration
- 圖片轉換: https://cloudinary.com/documentation/image_transformations
