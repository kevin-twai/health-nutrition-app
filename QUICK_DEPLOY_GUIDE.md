# 快速部署指南 - MongoDB 修復

## 🚀 一鍵部署

```bash
./deploy-mongodb-fix.sh
```

## 📋 部署檢查清單

### 1. 部署前檢查

- [ ] 確認修改的文件
  ```bash
  git status
  ```

- [ ] 確認代碼無錯誤
  ```bash
  cd apps/api
  npm run build
  ```

### 2. 執行部署

```bash
./deploy-mongodb-fix.sh
```

### 3. 監控部署

訪問 Render Dashboard：
- URL: https://dashboard.render.com/
- 查看 "health-nutrition-aoi" 服務
- 等待部署完成（約 3-5 分鐘）

### 4. 驗證部署

```bash
# 測試健康檢查
curl https://health-nutrition-aoi.onrender.com/health

# 測試食物識別
./test-mongodb-fix.sh /path/to/food-image.jpg
```

## 🎯 預期結果

### 部署成功標誌

在 Render 日誌中應該看到：

```
✅ MultiStageRecognitionEngine 已初始化
✅ 知識庫統計: 200+ 食材
🔍 開始多階段識別流程
```

### 識別成功標誌

API 回應應該包含：

```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "food": {
          "name": "食物名稱",
          "calories": 數字,
          "protein": 數字,
          "carbs": 數字,
          "fat": 數字
        },
        "confidence": 0.XX
      }
    ]
  }
}
```

## ⚠️ 故障排除

### 問題 1: 部署失敗

**症狀：** Render 顯示構建錯誤

**解決方案：**
```bash
# 檢查 TypeScript 錯誤
cd apps/api
npm run build

# 修復後重新部署
git add .
git commit -m "fix: 修復構建錯誤"
git push origin main
```

### 問題 2: 仍然沒有營養資訊

**症狀：** API 返回食物但營養資訊為 0

**檢查步驟：**

1. 查看 Render 日誌
   ```
   是否有 "使用知識庫作為後備" 訊息？
   ```

2. 測試知識庫
   ```bash
   # 在 Render Shell 中
   node -e "
   const { asianCuisineKB } = require('./dist/services/AsianCuisineKnowledgeBase');
   const stats = asianCuisineKB.getStatistics();
   console.log('知識庫統計:', stats);
   "
   ```

3. 檢查食物名稱
   ```
   知識庫中是否有該食物？
   可能需要添加到知識庫
   ```

### 問題 3: MongoDB 連接錯誤

**症狀：** 日誌顯示 MongoDB 連接失敗

**這不是問題！** 系統設計為即使 MongoDB 失敗也能運作。

**驗證：**
- 檢查是否有 "使用知識庫作為後備" 訊息
- 確認 API 仍能返回結果

## 📊 性能指標

### 預期響應時間

- **有 MongoDB：** 2-3 秒
- **使用知識庫：** 1-2 秒
- **OpenAI Vision API：** 1-2 秒

### 預期成功率

- **整體識別：** > 95%
- **營養資訊：** 100%（有後備機制）
- **系統可用性：** 99.9%

## 🔍 測試案例

### 測試 1: 簡單食物（單一食材）

```bash
# 例如：白飯、雞蛋、蘋果
./test-mongodb-fix.sh rice.jpg
```

**預期：**
- 識別成功
- 有完整營養資訊
- 信心度 > 0.9

### 測試 2: 複雜料理（多種食材）

```bash
# 例如：炒飯、便當、湯麵
./test-mongodb-fix.sh fried-rice.jpg
```

**預期：**
- 識別多個食材
- 每個食材都有營養資訊
- 信心度 > 0.7

### 測試 3: 湯品

```bash
# 例如：味噌湯、蛋花湯
./test-mongodb-fix.sh miso-soup.jpg
```

**預期：**
- 識別湯品和配料
- 有營養資訊
- 信心度 > 0.8

## 📝 部署記錄

### 修改內容

1. **MultiStageRecognitionEngine.ts**
   - 添加 FoodItem 導入
   - 修復 parseVisionResponse 方法
   - 添加知識庫後備機制
   - 修復類型轉換

2. **文檔**
   - MONGODB_ATLAS_CONNECTION_FIX.md
   - MONGODB_FIX_SUMMARY.md
   - QUICK_DEPLOY_GUIDE.md

### Git Commit

```
fix: MongoDB Atlas 連接修復 - 添加知識庫後備機制

- 修復 MultiStageRecognitionEngine.parseVisionResponse() 方法
- 添加三層後備機制：MongoDB -> 知識庫 -> 基本項目
- 修復類型轉換問題
- 確保系統在 MongoDB 不可用時仍能正常運作
- 知識庫包含 200+ 亞洲食材的完整營養資訊
```

## ✅ 完成確認

部署完成後，確認以下項目：

- [ ] Render 部署狀態為 "Live"
- [ ] 健康檢查返回 200 OK
- [ ] 測試圖片識別成功
- [ ] 返回的結果包含營養資訊
- [ ] 日誌中沒有嚴重錯誤

## 🎉 成功！

如果所有檢查都通過，恭喜！MongoDB 修復已成功部署。

系統現在能夠：
- ✅ 穩定識別食物
- ✅ 提供準確的營養資訊
- ✅ 在 MongoDB 不可用時自動降級
- ✅ 保持高可用性

## 📞 需要幫助？

如果遇到問題，請檢查：
1. Render 部署日誌
2. API 錯誤訊息
3. 本文檔的故障排除部分

或參考完整文檔：
- MONGODB_FIX_SUMMARY.md
- MONGODB_ATLAS_CONNECTION_FIX.md
