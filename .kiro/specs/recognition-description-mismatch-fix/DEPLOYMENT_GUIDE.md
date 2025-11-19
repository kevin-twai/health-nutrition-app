# 部署指南 - 識別一致性修復

## 概述

本指南說明如何部署識別一致性修復到測試和生產環境。

## 修復內容

- ✅ 修正食物識別與成分檢測不一致的問題
- ✅ ComponentDetectionEngine 支持預識別食物列表
- ✅ PhotoController 傳遞完整的基礎識別結果
- ✅ 添加錯誤處理和降級邏輯
- ✅ 實現一致性驗證和詳細日誌記錄
- ✅ 完成所有測試（單元測試、整合測試、端到端測試）

## 部署步驟

### 1. 部署到測試環境（Render）

#### 1.1 推送代碼

```bash
# 代碼已推送到 main 分支
git push origin main
```

**Commit:** `7a0eaf8` - fix: 修正食物識別與成分檢測不一致的問題

#### 1.2 觸發 Render 部署

Render 會自動檢測到 main 分支的更新並開始部署：

1. 訪問 Render Dashboard: https://dashboard.render.com
2. 找到 `health-nutrition-app` 服務
3. 查看部署狀態（應該會自動觸發）
4. 等待部署完成（通常需要 5-10 分鐘）

#### 1.3 驗證部署成功

檢查部署日誌：
- 確認構建成功
- 確認服務啟動成功
- 確認沒有錯誤訊息

### 2. 執行煙霧測試

#### 2.1 測試基本識別功能

```bash
# 使用測試腳本
./test-photo-recognize.sh
```

預期結果：
- API 回應正常（200 OK）
- 返回識別結果
- 包含食物列表

#### 2.2 測試成分識別功能

```bash
# 測試成分識別端點
curl -X POST https://health-nutrition-app.onrender.com/api/v1/photo/recognize-with-components \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@test-images/bento.jpg"
```

預期結果：
- 返回基礎識別結果
- 返回成分檢測結果
- 食物名稱一致
- description 與成分一致

#### 2.3 驗證日誌輸出

在 Render Dashboard 查看日誌：

關鍵日誌訊息：
```
🔍 ComponentDetectionEngine: 收到 X 個預識別食物
   使用預識別食物，跳過 Vision API 調用
   轉換完成，共 X 個成分
[sessionId] 傳遞 X 個預識別食物給成分檢測引擎
[sessionId] 預識別食物: [食物列表]
```

#### 2.4 檢查錯誤率

監控以下指標：
- API 錯誤率應該 < 1%
- 識別成功率應該 > 95%
- 一致性檢查通過率應該 = 100%

### 3. 監控性能指標

#### 3.1 處理時間

預期改善：
- 減少 30-50% 的處理時間（因為避免重複調用 Vision API）
- 基礎識別時間：2-4 秒
- 成分檢測時間：< 1 秒（使用預識別食物）
- 總處理時間：< 5 秒

#### 3.2 Vision API 調用次數

預期改善：
- 每次請求只調用 1 次 Vision API（之前是 2 次）
- 減少 50% 的 API 成本

#### 3.3 一致性檢查結果

監控指標：
- `componentsFromPreRecognition`: 應該 > 0
- `detectionMethod`: 應該是 'pre_recognized'
- 一致性警告數量：應該 = 0

#### 3.4 錯誤率

監控指標：
- HTTP 5xx 錯誤：應該 < 0.1%
- HTTP 4xx 錯誤：應該 < 1%
- Vision API 錯誤：應該 < 0.5%

### 4. 部署到生產環境

#### 4.1 確認測試環境穩定

檢查清單：
- [ ] 煙霧測試全部通過
- [ ] 性能指標符合預期
- [ ] 錯誤率在可接受範圍內
- [ ] 日誌輸出正常
- [ ] 一致性檢查通過率 100%

#### 4.2 推送代碼到主分支

```bash
# 代碼已在 main 分支
# Render 會自動部署
```

#### 4.3 觸發生產部署

Render 會自動部署 main 分支的更新。

#### 4.4 監控生產環境指標

部署後監控 24 小時：
- 處理時間
- 錯誤率
- Vision API 調用次數
- 一致性檢查結果
- 用戶反饋

## 測試腳本

### 完整測試腳本

```bash
#!/bin/bash

# 設置變數
API_URL="https://health-nutrition-app.onrender.com"
TOKEN="YOUR_AUTH_TOKEN"
TEST_IMAGE="test-images/bento.jpg"

echo "🧪 開始煙霧測試..."

# 測試 1: 健康檢查
echo "1. 測試健康檢查..."
curl -s "${API_URL}/health" | jq .

# 測試 2: 基本識別
echo "2. 測試基本識別..."
RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/photo/recognize" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "photo=@${TEST_IMAGE}")

echo "$RESPONSE" | jq .

# 測試 3: 成分識別
echo "3. 測試成分識別..."
RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/photo/recognize-with-components" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "photo=@${TEST_IMAGE}")

echo "$RESPONSE" | jq .

# 驗證一致性
RECOGNIZED_FOODS=$(echo "$RESPONSE" | jq -r '.data.recognition.foods[].name')
COMPONENTS=$(echo "$RESPONSE" | jq -r '.data.componentDetection.components[].name')

echo "4. 驗證一致性..."
echo "基礎識別食物: $RECOGNIZED_FOODS"
echo "成分列表: $COMPONENTS"

# 檢查 metadata
DETECTION_METHOD=$(echo "$RESPONSE" | jq -r '.data.componentDetection.metadata.detectionMethod')
COMPONENTS_FROM_PRE=$(echo "$RESPONSE" | jq -r '.data.componentDetection.metadata.componentsFromPreRecognition')

echo "5. 檢查 metadata..."
echo "Detection Method: $DETECTION_METHOD"
echo "Components from Pre-Recognition: $COMPONENTS_FROM_PRE"

if [ "$DETECTION_METHOD" = "pre_recognized" ] && [ "$COMPONENTS_FROM_PRE" -gt 0 ]; then
  echo "✅ 煙霧測試通過！"
else
  echo "❌ 煙霧測試失敗！"
  exit 1
fi
```

## 回滾計劃

如果部署後出現問題：

### 選項 1: Feature Flag

```bash
# 在 Render Dashboard 設置環境變數
USE_PRE_RECOGNIZED_FOODS=false
```

### 選項 2: 快速回滾

```bash
# 回滾到上一個版本
git revert 7a0eaf8
git push origin main
```

### 選項 3: 緊急修復

如果發現 bug，立即修復並推送：

```bash
# 修復代碼
git add .
git commit -m "hotfix: 修復識別一致性問題"
git push origin main
```

## 監控儀表板

### Render Dashboard

- URL: https://dashboard.render.com
- 監控項目：
  - 部署狀態
  - 日誌輸出
  - 資源使用率
  - 錯誤率

### 關鍵指標

| 指標 | 目標值 | 當前值 | 狀態 |
|------|--------|--------|------|
| 處理時間 | < 5s | TBD | ⏳ |
| Vision API 調用 | 1次/請求 | TBD | ⏳ |
| 一致性通過率 | 100% | TBD | ⏳ |
| 錯誤率 | < 1% | TBD | ⏳ |

## 已知限制

1. **降級邏輯**: 如果預識別食物為空或格式錯誤，會降級至 Vision API 識別
2. **向後兼容**: 保留舊版 API 支持，確保現有客戶端不受影響
3. **混合模式**: 當前未啟用，可在未來版本中添加

## 下一步

1. ✅ 部署到測試環境
2. ⏳ 執行煙霧測試
3. ⏳ 監控性能指標
4. ⏳ 部署到生產環境
5. ⏳ 創建修復摘要報告

## 聯絡資訊

如有問題，請聯絡：
- 開發團隊: [email]
- Render 支援: https://render.com/support
