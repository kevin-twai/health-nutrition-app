# 煙霧測試快速指南

## 快速開始

### 基礎測試（無需認證）

```bash
# 執行基礎煙霧測試
.kiro/specs/recognition-description-mismatch-fix/run-smoke-test.sh
```

**測試內容**:
- ✅ 健康檢查
- ✅ 資料庫連接
- ✅ Redis 連接
- ✅ 外部 API 連接
- ✅ 服務運行時間
- ✅ 記憶體使用

**預期結果**: 7/7 測試通過

---

### 完整測試（需要認證）

```bash
# 1. 設置環境變數
export AUTH_TOKEN="your_jwt_token_here"
export API_URL="https://health-nutrition-api.onrender.com"

# 2. 準備測試圖片（可選）
# 將圖片放入 test-images/ 目錄

# 3. 執行完整煙霧測試
.kiro/specs/recognition-description-mismatch-fix/smoke-test.sh
```

**測試內容**:
- ✅ 基礎測試（7 項）
- ✅ 基本識別功能
- ✅ 成分識別功能
- ✅ 一致性驗證
- ✅ Metadata 驗證
- ✅ 性能指標

**預期結果**: 所有測試通過，一致性 100%

---

## 測試結果解讀

### 成功指標

```
✅ 所有測試通過！
```

**表示**:
- 服務運行正常
- 所有系統連接正常
- 功能測試通過
- 一致性驗證通過

### 警告指標

```
⚠️ 記憶體使用偏高
```

**表示**:
- 記憶體使用 > 90%
- 需要監控但不影響功能
- 建議檢查記憶體趨勢

### 失敗指標

```
❌ 測試失敗
```

**可能原因**:
- 服務未啟動
- 資料庫連接失敗
- API 錯誤
- 一致性問題

**處理方式**:
1. 檢查服務狀態
2. 查看錯誤日誌
3. 驗證環境變數
4. 重新部署（如需要）

---

## 常見問題

### Q1: 如何獲取 AUTH_TOKEN？

**方法 1: 使用現有用戶**
```bash
# 登入並獲取 token
curl -X POST https://health-nutrition-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

**方法 2: 註冊新用戶**
```bash
# 註冊新用戶
curl -X POST https://health-nutrition-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password","name":"Test User"}'
```

### Q2: 測試圖片從哪裡獲取？

**選項 1: 使用網路圖片**
```bash
# 下載測試圖片
curl -o test-images/bento.jpg "https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9"
```

**選項 2: 使用本地圖片**
- 將任何食物照片放入 `test-images/` 目錄
- 支援格式: JPG, PNG, WEBP
- 建議大小: < 10MB

### Q3: 測試失敗怎麼辦？

**步驟 1: 檢查服務狀態**
```bash
curl https://health-nutrition-api.onrender.com/health
```

**步驟 2: 查看詳細錯誤**
```bash
# 執行測試並保存日誌
.kiro/specs/recognition-description-mismatch-fix/smoke-test.sh 2>&1 | tee test-log.txt
```

**步驟 3: 檢查 Render 日誌**
- 訪問: https://dashboard.render.com
- 選擇服務: health-nutrition-api
- 查看 Logs 標籤

### Q4: 如何驗證一致性？

**檢查點 1: 食物名稱一致**
```bash
# 基礎識別的食物
recognition.foods[].name

# 成分檢測的食物
componentDetection.components[].name

# 應該完全一致
```

**檢查點 2: Metadata 驗證**
```bash
# 檢測方法應該是 pre_recognized
componentDetection.metadata.detectionMethod === "pre_recognized"

# 預識別成分數量應該 > 0
componentDetection.metadata.componentsFromPreRecognition > 0
```

---

## 測試腳本說明

### run-smoke-test.sh

**用途**: 基礎煙霧測試，無需認證

**測試項目**:
1. 健康檢查
2. API 端點可訪問性
3. 服務運行時間
4. 資料庫連接
5. Redis 連接
6. 外部 API 連接
7. 記憶體使用

**執行時間**: ~10 秒

**適用場景**:
- 快速驗證服務狀態
- 部署後立即檢查
- 定期健康檢查

---

### smoke-test.sh

**用途**: 完整煙霧測試，需要認證

**測試項目**:
1. 基礎測試（7 項）
2. 基本識別功能
3. 成分識別功能
4. 一致性驗證
5. Metadata 驗證
6. 日誌驗證指引
7. 性能指標

**執行時間**: ~2 分鐘

**適用場景**:
- 功能驗證
- 一致性測試
- 性能測試
- 完整部署驗證

---

## 日誌驗證

### 在 Render Dashboard 檢查

**步驟**:
1. 訪問 https://dashboard.render.com
2. 選擇服務: health-nutrition-api
3. 點擊 "Logs" 標籤
4. 搜尋關鍵日誌

### 關鍵日誌訊息

**日誌 1: 預識別食物接收**
```
🔍 ComponentDetectionEngine: 收到 X 個預識別食物
```
- 出現時機: 調用 recognize-with-components
- 預期: X > 0

**日誌 2: 跳過 Vision API**
```
使用預識別食物，跳過 Vision API 調用
```
- 出現時機: 有預識別食物時
- 預期: 每次都應該出現

**日誌 3: 轉換完成**
```
轉換完成，共 X 個成分
```
- 出現時機: 轉換成功後
- 預期: X 應該等於預識別食物數量

**日誌 4: 參數傳遞**
```
[sessionId] 傳遞 X 個預識別食物給成分檢測引擎
```
- 出現時機: PhotoController 調用前
- 預期: X 應該等於基礎識別的食物數量

---

## 性能基準

### 預期性能指標

| 指標 | 目標值 | 當前值 | 狀態 |
|------|--------|--------|------|
| 健康檢查響應時間 | < 1s | < 1s | ✅ |
| 基礎識別時間 | < 3s | TBD | ⏳ |
| 成分檢測時間 | < 2s | TBD | ⏳ |
| 總處理時間 | < 5s | TBD | ⏳ |
| Vision API 調用次數 | 1 | TBD | ⏳ |
| 一致性準確率 | 100% | TBD | ⏳ |

### 性能改善預期

**修復前**:
- Vision API 調用: 2 次（基礎 + 成分）
- 總處理時間: ~6-8 秒
- 一致性: ~70-80%

**修復後**:
- Vision API 調用: 1 次（僅基礎）
- 總處理時間: ~3-5 秒（減少 30-50%）
- 一致性: 100%

---

## 自動化測試

### 設置定期測試

**使用 cron**:
```bash
# 每小時執行一次基礎測試
0 * * * * /path/to/run-smoke-test.sh >> /var/log/smoke-test.log 2>&1

# 每天執行一次完整測試
0 0 * * * AUTH_TOKEN=$TOKEN /path/to/smoke-test.sh >> /var/log/full-test.log 2>&1
```

**使用 CI/CD**:
```yaml
# .github/workflows/smoke-test.yml
name: Smoke Test
on:
  schedule:
    - cron: '0 */6 * * *'  # 每 6 小時
  workflow_dispatch:

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Smoke Test
        env:
          AUTH_TOKEN: ${{ secrets.AUTH_TOKEN }}
        run: |
          .kiro/specs/recognition-description-mismatch-fix/smoke-test.sh
```

---

## 故障排除

### 問題: 服務無響應

**症狀**: curl 超時或連接失敗

**檢查**:
```bash
# 1. 檢查服務狀態
curl -I https://health-nutrition-api.onrender.com/health

# 2. 檢查 DNS
nslookup health-nutrition-api.onrender.com

# 3. 檢查網路
ping health-nutrition-api.onrender.com
```

**解決**:
- 等待服務啟動（冷啟動需要 1-2 分鐘）
- 檢查 Render Dashboard 服務狀態
- 重啟服務（如需要）

---

### 問題: 認證失敗

**症狀**: HTTP 401 Unauthorized

**檢查**:
```bash
# 驗證 token 格式
echo $AUTH_TOKEN | wc -c  # 應該 > 100

# 測試 token
curl -H "Authorization: Bearer $AUTH_TOKEN" \
  https://health-nutrition-api.onrender.com/api/v1/user/profile
```

**解決**:
- 重新生成 token
- 檢查 token 過期時間
- 確認 token 格式正確（Bearer token）

---

### 問題: 一致性測試失敗

**症狀**: 基礎識別和成分檢測結果不一致

**檢查**:
```bash
# 查看詳細回應
curl -X POST https://health-nutrition-api.onrender.com/api/v1/photo/recognize-with-components \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -F "photo=@test-images/bento.jpg" | jq .
```

**解決**:
- 檢查 Render 日誌
- 驗證代碼版本
- 確認修復已部署
- 重新部署（如需要）

---

## 聯絡支援

如果測試持續失敗或遇到問題：

1. **收集資訊**:
   - 測試日誌
   - 錯誤訊息
   - Render 日誌截圖
   - 測試環境資訊

2. **檢查文檔**:
   - 部署指南
   - 設計文檔
   - 需求文檔

3. **報告問題**:
   - 創建 GitHub Issue
   - 包含完整的錯誤資訊
   - 提供重現步驟

---

**最後更新**: 2025-11-19  
**版本**: 1.0  
**維護者**: Development Team
