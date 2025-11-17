# API 重試機制使用指南

## 問題
Render 免費方案的服務會在閒置 15 分鐘後進入休眠狀態，導致：
- 首次請求返回 503 錯誤
- 需要 30-60 秒喚醒服務
- 用戶體驗不佳

## 解決方案

### 1. 自動重試機制
創建了 `apps/web/src/lib/api-with-retry.ts`，提供：
- 自動喚醒 API 服務
- 智能重試邏輯（最多 3 次）
- 適當的延遲和超時設置

### 2. 用戶友好的提示
創建了 `apps/web/src/components/ApiStatusBanner.tsx`：
- 檢測 API 喚醒狀態
- 顯示友好的等待提示
- 自動隱藏

### 3. 使用方法

#### 在照片頁面中使用：
```typescript
import { recognizeFood } from '@/lib/api-with-retry'

const handleAnalyze = async () => {
  try {
    const result = await recognizeFood(selectedFile)
    // 處理結果...
  } catch (error) {
    // 處理錯誤...
  }
}
```

#### 添加狀態橫幅：
```typescript
import ApiStatusBanner from '@/components/ApiStatusBanner'

export default function Page() {
  return (
    <>
      <ApiStatusBanner />
      {/* 其他內容 */}
    </>
  )
}
```

## 工作流程

1. **首次請求**:
   - 檢測 API 狀態
   - 如果休眠，顯示"喚醒中"提示
   - 自動重試直到成功

2. **後續請求**:
   - API 已喚醒，正常響應
   - 無需等待

3. **錯誤處理**:
   - 503 錯誤自動重試
   - 其他錯誤顯示友好提示
   - 最多重試 3 次

## 測試

### 測試 API 喚醒：
```bash
# 等待 API 休眠（15分鐘後）
# 然後訪問網站上傳照片
# 應該看到"喚醒中"提示，然後成功分析
```

### 手動測試：
```bash
curl https://health-nutrition-api.onrender.com/health
# 如果響應慢，說明正在喚醒
```

## 優化建議

### 對於生產環境：
1. 升級到 Render 付費方案（服務不會休眠）
2. 使用定時任務保持服務活躍
3. 添加服務預熱機制

### 當前免費方案：
- 重試機制已足夠應對休眠問題
- 用戶體驗已優化
- 首次請求需要耐心等待
