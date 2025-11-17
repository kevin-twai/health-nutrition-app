# 錯誤的 API URL 修復

## 🚨 問題
控制台顯示的 API URL 是錯誤的：
```
🌐 API URL: "https://health-nutrition-app.onrender.com"
```

正確的應該是：
```
🌐 API URL: "https://health-nutrition-api.onrender.com"
```

## 根本原因
Render Dashboard 上的環境變數設置錯誤，或者沒有設置。

## 🔧 立即修復步驟

### 1. 登入 Render Dashboard
訪問：https://dashboard.render.com

### 2. 選擇前端服務
找到並點擊 `health-nutrition-web` 服務

### 3. 進入環境變數設置
點擊左側菜單的 **"Environment"** 標籤

### 4. 檢查並修復環境變數

#### 如果已經存在 `NEXT_PUBLIC_API_URL`：
1. 點擊該環境變數旁邊的編輯按鈕
2. 確認值為：`https://health-nutrition-api.onrender.com`
3. 如果不正確，修改為正確的值
4. 點擊 "Save Changes"

#### 如果不存在 `NEXT_PUBLIC_API_URL`：
1. 點擊 "Add Environment Variable" 按鈕
2. Key: `NEXT_PUBLIC_API_URL`
3. Value: `https://health-nutrition-api.onrender.com`
4. 點擊 "Save Changes"

### 5. 等待重新部署
- Render 會自動觸發重新部署
- 預計 2-3 分鐘完成
- 在 "Events" 標籤查看部署進度

## ⚠️ 重要提醒

### Next.js 環境變數規則
- 瀏覽器端使用的環境變數**必須**以 `NEXT_PUBLIC_` 開頭
- 如果沒有這個前綴，環境變數只能在服務器端使用
- 我們的 API 調用是在瀏覽器端進行的，所以必須使用 `NEXT_PUBLIC_API_URL`

### 常見錯誤
❌ `API_URL` - 錯誤，瀏覽器無法訪問
❌ `NEXT_API_URL` - 錯誤，缺少 PUBLIC
✅ `NEXT_PUBLIC_API_URL` - 正確

## 🧪 驗證修復

### 1. 等待部署完成
在 Render Dashboard 的 "Events" 標籤查看：
- 應該看到 "Deploy succeeded" 消息
- 服務狀態應該是 "Live"

### 2. 清除瀏覽器緩存
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 3. 重新訪問頁面
https://health-nutrition-web.onrender.com/photo

### 4. 打開控制台 (F12)

### 5. 上傳照片並查看日誌

### 6. 預期輸出
```
📤 發送請求到後端 API...
🌐 API URL: https://health-nutrition-api.onrender.com  ← 應該是這個！
🔍 測試後端連接...
✅ 後端連接正常，狀態: 200
📤 發送照片識別請求...
📥 收到後端回應，狀態: 200
```

## 🔍 如果還是顯示錯誤的 URL

### 檢查清單

1. **確認環境變數已保存**
   - 在 Render Dashboard 的 Environment 標籤確認
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://health-nutrition-api.onrender.com`

2. **確認已重新部署**
   - 查看 Events 標籤
   - 應該看到最新的部署記錄
   - 狀態應該是 "Deploy succeeded"

3. **清除瀏覽器緩存**
   - 硬刷新頁面
   - 或者使用無痕模式測試

4. **檢查構建日誌**
   - 在 Render Dashboard 點擊 "Logs" 標籤
   - 查看構建過程中的環境變數
   - 搜索 "NEXT_PUBLIC_API_URL"

## 📊 URL 對照表

| 服務 | 正確的 URL | 錯誤的 URL |
|------|-----------|-----------|
| 前端 | https://health-nutrition-web.onrender.com | - |
| 後端 API | https://health-nutrition-api.onrender.com | https://health-nutrition-app.onrender.com ❌ |

## 🎯 為什麼會出現這個問題？

可能的原因：

1. **環境變數未設置** - Render 上沒有設置環境變數
2. **環境變數值錯誤** - 設置了錯誤的 URL
3. **使用了錯誤的 key** - 使用了 `API_URL` 而不是 `NEXT_PUBLIC_API_URL`
4. **緩存問題** - 瀏覽器緩存了舊的代碼

## 💡 預防措施

為了避免將來出現類似問題：

1. **在 Render Dashboard 設置環境變數**
   - 不要依賴代碼中的默認值
   - 明確設置所有必需的環境變數

2. **使用正確的命名規範**
   - 瀏覽器端變數：`NEXT_PUBLIC_*`
   - 服務器端變數：不需要前綴

3. **文檔化環境變數**
   - 在 README 中列出所有必需的環境變數
   - 說明每個變數的用途和正確的值

## 📝 總結

✅ 問題：API URL 錯誤
✅ 原因：Render 環境變數未正確設置
✅ 解決：在 Render Dashboard 設置正確的 `NEXT_PUBLIC_API_URL`
✅ 驗證：清除緩存後查看控制台日誌

**最關鍵的步驟：在 Render Dashboard 設置環境變數！**
