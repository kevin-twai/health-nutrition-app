# Task 14: 用戶調整功能 - 實施摘要

## 概述

成功實現了用戶調整功能，允許用戶對識別的成分進行添加、移除和份量調整，並自動重新計算營養資訊。所有調整記錄都會保存到數據庫以供後續分析。

## 實施內容

### 14.1 添加成分調整 API ✅

#### 創建的文件

1. **路由文件**: `apps/api/src/routes/component-adjustment.ts`
   - 定義了 6 個 API 端點
   - 添加成分 (`POST /add`)
   - 移除成分 (`POST /remove`)
   - 調整份量 (`POST /update-portion`)
   - 重新計算營養 (`POST /recalculate`)
   - 獲取會話狀態 (`GET /session/:sessionId`)
   - 獲取調整歷史 (`GET /history/:sessionId`)

2. **控制器**: `apps/api/src/controllers/ComponentAdjustmentController.ts`
   - 實現了所有端點的處理邏輯
   - 完整的參數驗證
   - 詳細的錯誤處理
   - 結構化的 API 回應

3. **服務層**: `apps/api/src/services/ComponentAdjustmentService.ts`
   - 核心業務邏輯實現
   - 會話管理（內存 + 數據庫）
   - 成分操作（添加、移除、更新）
   - 自動營養重算
   - 調整記錄管理

#### 功能特性

- ✅ **添加成分**: 支持手動添加缺失的成分
  - 自動從知識庫獲取營養資訊
  - 支持自定義份量和烹飪方式
  - 用戶添加的成分信心度為 1.0

- ✅ **移除成分**: 移除識別錯誤的成分
  - 自動更新總營養值
  - 記錄移除操作

- ✅ **調整份量**: 精確調整成分份量
  - 自動重新計算該成分的營養
  - 更新總營養摘要
  - 記錄舊值和新值

- ✅ **會話管理**: 
  - 識別完成時自動初始化會話
  - 內存緩存提高性能
  - 支持會話過期清理（預設 24 小時）

### 14.2 實現調整後的營養重算 ✅

#### 創建的文件

1. **數據模型**: `apps/api/src/models/ComponentAdjustment.ts`
   - 定義調整記錄的數據結構
   - 支持三種調整類型（add/remove/update_portion）
   - 包含完整的元數據

2. **Repository**: `apps/api/src/repositories/ComponentAdjustmentRepository.ts`
   - 數據庫操作封裝
   - 支持按會話 ID 和用戶 ID 查詢
   - 調整統計功能
   - 過期記錄清理
   - 索引優化

3. **測試文件**: `apps/api/src/services/__tests__/ComponentAdjustmentService.test.ts`
   - 完整的單元測試覆蓋
   - 測試所有核心功能
   - 邊界情況測試

4. **文檔**: `apps/api/src/services/COMPONENT_ADJUSTMENT_README.md`
   - 詳細的 API 使用指南
   - 完整的請求/回應範例
   - 最佳實踐建議
   - 錯誤處理說明

#### 功能特性

- ✅ **自動營養重算**: 
  - 每次調整後自動觸發
  - 使用 ComponentNutritionCalculator 計算
  - 更新總營養和分類營養
  - 考慮烹飪方式影響

- ✅ **調整記錄持久化**:
  - 所有調整保存到 MongoDB
  - 支持歷史查詢
  - 用於後續分析和改進
  - 包含用戶 ID（如果已登入）

- ✅ **會話狀態管理**:
  - 保存原始識別結果
  - 追蹤當前狀態
  - 記錄所有調整操作
  - 時間戳記錄

## 整合點

### 1. PhotoController 整合

修改了 `apps/api/src/controllers/PhotoController.ts`:
- 添加 ComponentAdjustmentService 實例
- 在成功識別後自動初始化調整會話
- 為用戶提供 sessionId 用於後續調整

### 2. 路由註冊

修改了 `apps/api/src/routes/index.ts`:
- 註冊成分調整路由
- 應用標準的 rate limiting
- 路徑: `/api/v1/component-adjustment`

## API 端點總覽

| 方法 | 端點 | 功能 | 狀態 |
|------|------|------|------|
| POST | `/api/v1/component-adjustment/add` | 添加成分 | ✅ |
| POST | `/api/v1/component-adjustment/remove` | 移除成分 | ✅ |
| POST | `/api/v1/component-adjustment/update-portion` | 調整份量 | ✅ |
| POST | `/api/v1/component-adjustment/recalculate` | 重新計算營養 | ✅ |
| GET | `/api/v1/component-adjustment/session/:sessionId` | 獲取會話狀態 | ✅ |
| GET | `/api/v1/component-adjustment/history/:sessionId` | 獲取調整歷史 | ✅ |

## 數據流程

```
1. 用戶上傳照片
   ↓
2. 執行成分識別 (PhotoController.recognizeWithComponents)
   ↓
3. 初始化調整會話 (ComponentAdjustmentService.initializeSession)
   ↓
4. 返回識別結果 + sessionId
   ↓
5. 用戶進行調整 (add/remove/update-portion)
   ↓
6. 自動重新計算營養 (recalculateNutritionInternal)
   ↓
7. 保存調整記錄到數據庫 (ComponentAdjustmentRepository)
   ↓
8. 返回更新後的結果
```

## 技術實現細節

### 會話管理策略

1. **雙層存儲**:
   - 內存: 快速訪問當前會話
   - 數據庫: 持久化調整記錄

2. **會話生命週期**:
   - 創建: 識別完成時
   - 使用: 24 小時內有效
   - 清理: 自動清理過期會話

### 營養計算邏輯

1. **添加成分**:
   ```typescript
   // 從知識庫獲取基礎營養
   nutritionPer100g = knowledgeBase.getNutritionInfo(name)
   
   // 根據份量計算實際營養
   actualNutrition = nutritionPer100g * (portion / 100)
   
   // 重新聚合總營養
   aggregateDishNutrition(allComponents)
   ```

2. **更新份量**:
   ```typescript
   // 更新成分份量
   component.estimatedPortion = newPortion
   
   // 重新計算該成分營養
   component.actualNutrition = nutritionPer100g * (newPortion / 100)
   
   // 重新聚合總營養
   aggregateDishNutrition(allComponents)
   ```

3. **移除成分**:
   ```typescript
   // 從列表中移除
   components.splice(index, 1)
   
   // 重新聚合總營養
   aggregateDishNutrition(remainingComponents)
   ```

### 錯誤處理

- 參數驗證: 在控制器層進行
- 業務邏輯錯誤: 在服務層拋出
- 數據庫錯誤: 在 Repository 層處理
- 降級策略: 數據庫失敗不影響主要功能

## 測試覆蓋

### 單元測試

- ✅ 會話初始化
- ✅ 添加成分（正常和邊界情況）
- ✅ 移除成分（正常和錯誤情況）
- ✅ 更新份量（正常和錯誤情況）
- ✅ 重新計算營養
- ✅ 獲取會話狀態
- ✅ 獲取調整歷史
- ✅ 會話清理

### 測試命令

```bash
# 運行所有測試
npm test ComponentAdjustmentService.test.ts

# 運行特定測試
npm test -- --testNamePattern="addComponent"
```

## 性能考慮

1. **內存管理**:
   - 會話在內存中緩存
   - 自動清理過期會話
   - 避免內存洩漏

2. **數據庫優化**:
   - 索引: sessionId, userId, timestamp
   - 批量操作支持
   - 過期記錄定期清理

3. **計算優化**:
   - 只在必要時重新計算
   - 使用現有的 ComponentNutritionCalculator
   - 避免重複計算

## 使用範例

### 完整流程

```bash
# 1. 執行識別
curl -X POST http://localhost:3000/api/v1/photo/recognize-with-components \
  -F "photo=@food.jpg"

# 回應包含 sessionId: "component_session_123"

# 2. 添加缺失的成分
curl -X POST http://localhost:3000/api/v1/component-adjustment/add \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "component_session_123",
    "component": {
      "name": "青蔥",
      "estimatedPortion": 10
    }
  }'

# 3. 調整份量
curl -X POST http://localhost:3000/api/v1/component-adjustment/update-portion \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "component_session_123",
    "componentId": "comp_1",
    "newPortion": 250
  }'

# 4. 查看最終結果
curl http://localhost:3000/api/v1/component-adjustment/session/component_session_123
```

## 滿足的需求

### Requirements 3.6 (用戶調整)
- ✅ 支持用戶手動調整或移除識別的成分
- ✅ 提供添加缺失成分的功能
- ✅ 支持份量調整

### Requirements 5.3 (用戶互動)
- ✅ 支持用戶手動添加或移除成分
- ✅ 實時更新營養資訊

### Requirements 2.4 (營養計算)
- ✅ 提供整道料理的總營養資訊
- ✅ 自動聚合所有成分的營養

### Requirements 2.5 (營養一致性)
- ✅ 確保成分的營養資訊與整體料理的營養資訊一致
- ✅ 調整後自動重新計算

## 後續改進建議

### Phase 1 (短期)
1. 添加用戶認證支持
2. 實現調整建議功能
3. 添加批量調整 API

### Phase 2 (中期)
1. 機器學習分析用戶調整模式
2. 自動建議常見調整
3. 個性化成分推薦

### Phase 3 (長期)
1. 跨會話的調整模式分析
2. 用戶偏好學習
3. 識別準確度改進

## 部署注意事項

1. **數據庫索引**: 
   ```bash
   # 確保創建必要的索引
   db.component_adjustments.createIndex({ sessionId: 1 })
   db.component_adjustments.createIndex({ userId: 1 })
   db.component_adjustments.createIndex({ timestamp: -1 })
   ```

2. **環境變數**: 無需額外配置

3. **監控指標**:
   - 調整操作頻率
   - 會話數量
   - 數據庫查詢性能
   - 內存使用情況

## 文檔

- ✅ API 使用指南: `COMPONENT_ADJUSTMENT_README.md`
- ✅ 單元測試: `ComponentAdjustmentService.test.ts`
- ✅ 實施摘要: 本文檔

## 總結

成功實現了完整的用戶調整功能，包括：
- 6 個 API 端點
- 完整的業務邏輯
- 數據持久化
- 自動營養重算
- 詳細的文檔和測試

所有功能都已整合到現有系統中，可以立即使用。用戶現在可以對識別結果進行精確調整，系統會自動重新計算營養資訊並保存調整記錄。

## 實施時間

- 開始時間: 2025-11-17
- 完成時間: 2025-11-17
- 總耗時: ~2 小時

## 實施者

Kiro AI Assistant
