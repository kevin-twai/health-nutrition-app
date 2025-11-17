# 成分調整 API 使用指南

## 概述

成分調整 API 允許用戶對食物識別結果中的成分進行調整，包括添加、移除成分和調整份量。所有調整都會自動重新計算營養資訊。

## 功能特性

- ✅ 添加新成分
- ✅ 移除現有成分
- ✅ 調整成分份量
- ✅ 自動重新計算營養
- ✅ 保存調整記錄
- ✅ 查詢調整歷史

## API 端點

### 1. 添加成分

**端點**: `POST /api/v1/component-adjustment/add`

**請求體**:
```json
{
  "sessionId": "component_session_1234567890_abc123",
  "component": {
    "name": "青蔥",
    "estimatedPortion": 10,
    "cookingMethod": "stir_fried",
    "category": "garnish"
  }
}
```

**回應**:
```json
{
  "success": true,
  "data": {
    "message": "成分已成功添加",
    "sessionId": "component_session_1234567890_abc123",
    "addedComponent": {
      "id": "component_1234567890_xyz789",
      "name": "青蔥",
      "confidence": 1.0,
      "estimatedPortion": 10,
      "cookingMethod": "stir_fried",
      "category": "garnish",
      "nutritionPer100g": { ... },
      "actualNutrition": { ... }
    },
    "updatedResult": { ... },
    "adjustmentId": "adj_1234567890_def456"
  },
  "timestamp": "2025-11-17T10:30:00.000Z"
}
```

### 2. 移除成分

**端點**: `POST /api/v1/component-adjustment/remove`

**請求體**:
```json
{
  "sessionId": "component_session_1234567890_abc123",
  "componentId": "component_1234567890_xyz789"
}
```

**回應**:
```json
{
  "success": true,
  "data": {
    "message": "成分已成功移除",
    "sessionId": "component_session_1234567890_abc123",
    "removedComponentId": "component_1234567890_xyz789",
    "updatedResult": { ... },
    "adjustmentId": "adj_1234567890_ghi789"
  },
  "timestamp": "2025-11-17T10:31:00.000Z"
}
```

### 3. 調整份量

**端點**: `POST /api/v1/component-adjustment/update-portion`

**請求體**:
```json
{
  "sessionId": "component_session_1234567890_abc123",
  "componentId": "comp_1",
  "newPortion": 250
}
```

**回應**:
```json
{
  "success": true,
  "data": {
    "message": "份量已成功調整",
    "sessionId": "component_session_1234567890_abc123",
    "componentId": "comp_1",
    "oldPortion": 200,
    "newPortion": 250,
    "updatedResult": { ... },
    "adjustmentId": "adj_1234567890_jkl012"
  },
  "timestamp": "2025-11-17T10:32:00.000Z"
}
```

### 4. 重新計算營養

**端點**: `POST /api/v1/component-adjustment/recalculate`

**請求體**:
```json
{
  "sessionId": "component_session_1234567890_abc123"
}
```

**回應**:
```json
{
  "success": true,
  "data": {
    "message": "營養已重新計算",
    "sessionId": "component_session_1234567890_abc123",
    "updatedResult": { ... },
    "nutritionSummary": {
      "total": {
        "calories": 450,
        "protein": 15,
        "carbohydrates": 60,
        "fat": 8
      },
      "byComponent": [ ... ],
      "byCategory": [ ... ],
      "cookingImpact": [ ... ]
    },
    "calculationTime": 45
  },
  "timestamp": "2025-11-17T10:33:00.000Z"
}
```

### 5. 獲取會話狀態

**端點**: `GET /api/v1/component-adjustment/session/:sessionId`

**回應**:
```json
{
  "success": true,
  "data": {
    "sessionId": "component_session_1234567890_abc123",
    "originalResult": { ... },
    "currentResult": { ... },
    "adjustments": [ ... ],
    "createdAt": "2025-11-17T10:30:00.000Z",
    "lastModified": "2025-11-17T10:33:00.000Z"
  },
  "timestamp": "2025-11-17T10:34:00.000Z"
}
```

### 6. 獲取調整歷史

**端點**: `GET /api/v1/component-adjustment/history/:sessionId`

**回應**:
```json
{
  "success": true,
  "data": {
    "sessionId": "component_session_1234567890_abc123",
    "adjustments": [
      {
        "id": "adj_1234567890_def456",
        "type": "add",
        "timestamp": "2025-11-17T10:30:00.000Z",
        "details": {
          "componentId": "component_1234567890_xyz789",
          "componentName": "青蔥",
          "portion": 10
        }
      },
      {
        "id": "adj_1234567890_jkl012",
        "type": "update_portion",
        "timestamp": "2025-11-17T10:32:00.000Z",
        "details": {
          "componentId": "comp_1",
          "componentName": "白飯",
          "oldPortion": 200,
          "newPortion": 250
        }
      }
    ],
    "totalAdjustments": 2
  },
  "timestamp": "2025-11-17T10:35:00.000Z"
}
```

## 使用流程

### 1. 執行食物識別（包含成分識別）

```bash
curl -X POST http://localhost:3000/api/v1/photo/recognize-with-components \
  -F "photo=@food.jpg" \
  -F "includeComponents=true"
```

這會返回一個 `sessionId`，用於後續的調整操作。

### 2. 添加缺失的成分

```bash
curl -X POST http://localhost:3000/api/v1/component-adjustment/add \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "component_session_1234567890_abc123",
    "component": {
      "name": "青蔥",
      "estimatedPortion": 10
    }
  }'
```

### 3. 調整成分份量

```bash
curl -X POST http://localhost:3000/api/v1/component-adjustment/update-portion \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "component_session_1234567890_abc123",
    "componentId": "comp_1",
    "newPortion": 250
  }'
```

### 4. 移除不需要的成分

```bash
curl -X POST http://localhost:3000/api/v1/component-adjustment/remove \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "component_session_1234567890_abc123",
    "componentId": "comp_2"
  }'
```

### 5. 查看最終結果

```bash
curl http://localhost:3000/api/v1/component-adjustment/session/component_session_1234567890_abc123
```

## 成分屬性說明

### 必填屬性
- `name`: 成分名稱（中文）

### 可選屬性
- `nameEn`: 成分英文名稱
- `estimatedPortion`: 估計份量（克），預設 50g
- `cookingMethod`: 烹飪方式
  - `raw`: 生食
  - `boiled`: 煮
  - `fried`: 炒
  - `deep_fried`: 炸
  - `steamed`: 蒸
  - `grilled`: 烤
  - `braised`: 滷/燉
  - `stir_fried`: 快炒
  - `pickled`: 醃製
- `category`: 成分類別
  - `grain`: 主食類
  - `protein`: 蛋白質類
  - `vegetable`: 蔬菜類
  - `seasoning`: 調味料
  - `sauce`: 醬料
  - `garnish`: 配菜/裝飾

## 自動營養計算

所有調整操作（添加、移除、更新份量）都會自動觸發營養重新計算：

1. **添加成分**: 從知識庫獲取營養資訊，根據份量計算實際營養
2. **移除成分**: 從總營養中扣除該成分的營養
3. **更新份量**: 重新計算該成分的實際營養，更新總營養

營養計算考慮：
- 基礎營養數據（每 100g）
- 實際份量
- 烹飪方式的影響

## 調整記錄持久化

所有調整操作都會保存到數據庫，包括：
- 會話 ID
- 用戶 ID（如果已登入）
- 調整類型（add/remove/update_portion）
- 成分資訊
- 舊值和新值
- 時間戳

這些記錄可用於：
- 用戶查看調整歷史
- 系統分析用戶行為
- 改進識別準確度

## 會話管理

### 會話生命週期
1. 識別完成時自動創建會話
2. 會話在內存中保持 24 小時
3. 過期會話自動清理

### 會話清理
```typescript
// 清理 24 小時前的會話
service.cleanupExpiredSessions(24);
```

## 錯誤處理

### 常見錯誤

1. **會話不存在**
```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "找不到指定的會話"
  }
}
```

2. **成分不存在**
```json
{
  "success": false,
  "error": {
    "code": "COMPONENT_NOT_FOUND",
    "message": "找不到成分 comp_123"
  }
}
```

3. **無效的份量**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PORTION",
    "message": "份量必須大於 0"
  }
}
```

## 最佳實踐

1. **保存 sessionId**: 識別完成後立即保存 sessionId，用於後續調整
2. **批量調整**: 如果需要多次調整，可以連續調用 API，最後再查看結果
3. **驗證輸入**: 確保份量為正數，成分名稱不為空
4. **錯誤處理**: 妥善處理 API 錯誤，提供友好的用戶提示
5. **會話過期**: 提醒用戶會話有效期為 24 小時

## 範例：完整調整流程

```javascript
// 1. 執行識別
const recognitionResponse = await fetch('/api/v1/photo/recognize-with-components', {
  method: 'POST',
  body: formData
});
const { data } = await recognitionResponse.json();
const sessionId = data.sessionId;

// 2. 添加缺失的成分
await fetch('/api/v1/component-adjustment/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    component: {
      name: '青蔥',
      estimatedPortion: 10
    }
  })
});

// 3. 調整份量
await fetch('/api/v1/component-adjustment/update-portion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    componentId: 'comp_1',
    newPortion: 250
  })
});

// 4. 獲取最終結果
const finalResponse = await fetch(`/api/v1/component-adjustment/session/${sessionId}`);
const finalData = await finalResponse.json();
console.log('最終營養:', finalData.data.currentResult.nutritionSummary);
```

## 相關文檔

- [成分識別系統設計](../../../.kiro/specs/asian-cuisine-component-detection/design.md)
- [成分識別需求](../../../.kiro/specs/asian-cuisine-component-detection/requirements.md)
- [ComponentDetectionEngine README](./ComponentDetectionEngine.README.md)
- [ComponentNutritionCalculator README](./ComponentNutritionCalculator.README.md)
