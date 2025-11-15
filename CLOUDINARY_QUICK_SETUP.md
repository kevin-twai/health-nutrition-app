# Cloudinary 快速配置指南

## ✅ 已完成

- [x] 安裝 Cloudinary SDK
- [x] 修改 ImageProcessingService 使用 Cloudinary
- [x] 備份舊的 AWS S3 版本

## 🚀 下一步：配置環境變數

### 1. 在 Render 上配置環境變數

登入 Render Dashboard 並添加以下環境變數：

| 變數名稱 | 值 | 在哪裡找到 |
|---------|-----|-----------|
| `CLOUDINARY_CLOUD_NAME` | 你的 Cloud Name | Cloudinary Dashboard 首頁 |
| `CLOUDINARY_API_KEY` | 你的 API Key | Cloudinary Dashboard 首頁 |
| `CLOUDINARY_API_SECRET` | 你的 API Secret | Cloudinary Dashboard 首頁（點擊眼睛圖標） |

### 2. 配置步驟

1. 前往：https://dashboard.render.com
2. 找到服務：`health-nutrition-api`
3. 點擊 **"Environment"** 標籤
4. 點擊 **"Add Environment Variable"**
5. 添加上述 3 個變數
6. 點擊 **"Save Changes"**
7. Render 會自動重新部署

### 3. 本地測試（可選）

在 `apps/api/.env` 文件中添加：

```bash
CLOUDINARY_CLOUD_NAME=你的cloud_name
CLOUDINARY_API_KEY=你的api_key
CLOUDINARY_API_SECRET=你的api_secret
```

## 🧪 測試

部署完成後（約 3-5 分鐘），執行：

```bash
./test-photo-upload.sh
```

## 📊 Cloudinary 免費方案限制

- ✅ 25 GB 存儲空間
- ✅ 25 GB 月流量
- ✅ 無限次圖片轉換
- ✅ 自動優化和 CDN

## 🎉 優勢

相比 AWS S3，Cloudinary 提供：

1. **更簡單的設定** - 只需 3 個環境變數
2. **內建圖片優化** - 自動選擇最佳格式和質量
3. **CDN 加速** - 全球 CDN 節點
4. **強大的轉換** - URL 參數即可調整圖片
5. **更好的免費方案** - 25GB vs 5GB

## 🔗 有用的連結

- Cloudinary Dashboard: https://cloudinary.com/console
- 文檔: https://cloudinary.com/documentation
- Node.js SDK: https://cloudinary.com/documentation/node_integration

## ❓ 常見問題

### Q: 如何找到我的 Cloud Name?
A: 登入 Cloudinary Dashboard，在首頁頂部可以看到。

### Q: API Secret 在哪裡?
A: 在 Dashboard 首頁，API Secret 旁邊有個眼睛圖標，點擊即可顯示。

### Q: 需要在 Cloudinary 上做其他設定嗎?
A: 不需要！預設設定已經足夠。Cloudinary 會自動處理 CORS、HTTPS 等。

### Q: 舊的 AWS S3 代碼怎麼辦?
A: 已經備份為 `ImageProcessingService.aws.backup.ts`，如果需要可以恢復。

## 📝 檢查清單

- [ ] 在 Cloudinary Dashboard 確認憑證
- [ ] 在 Render 上添加 3 個環境變數
- [ ] 保存並等待自動部署
- [ ] 執行測試腳本
- [ ] 確認圖片上傳成功
- [ ] 確認圖片可以訪問

完成後，你的照片上傳功能就可以正常工作了！🎉
