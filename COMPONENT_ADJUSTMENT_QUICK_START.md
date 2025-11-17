# 成分調整功能 - 快速開始指南

## 概述

成分調整功能允許用戶對食物識別結果進行精確調整，包括添加缺失的成分、移除錯誤的成分、調整份量等。所有調整都會自動重新計算營養資訊。

## 快速開始

### 1. 執行食物識別

首先，上傳照片並執行成分識別：

```bash
curl -X POST http://localhost:3000/api/v1/photo/recognize-with-components \
  -F "photo=@food.jpg" \
  -F "includeComponents=true"
```

**回應範例**:
```json
{
  "success": true,
  "data": {
    "sessionId": "component_session_1731825600000_abc123",
    "componentDetection": {
      "mainDish": {
        "name": "蛋炒飯",
        "type": "fried_rice",
        "confidence": 0.9
      },
      "components": [
        {
          "id": "comp_1",
          "name": "白飯",
          "estimatedPortion": 200,
          "actualNutrition": { ... }
        },
        {
          "id": "comp_2",
          "name": "雞蛋",
          "estimatedPortion": 50,
          "actualNutrition": { ... }
        }
      ],
      "nutritionSummary": {
        "total": {
          "calories": 450,
          "protein": 15,
          "carbohydrates": 60,
          "fat": 8
        }
      }
    }
  }
}
```

**重要**: 保存返回的 `sessionId`，後續所有調整操作都需要使用它。

### 2. 添加缺失的成分

如果識別結果缺少某些成分，可以手動添加：

```bash
curl -X POST http://localhost:3000/api/v1/component-adjustment/add \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "component_session_1731825600000_abc123",
    "component": {
      "name": "青蔥",
      "estimatedPortion": 10,
      "cookingMethod": "stir_fried",
      "category": "garnish"
    }
  }'
```

**回應**:
```json
{
  "success": true,
  "data": {
    "message": "成分已成功添加",
    "addedComponent": {
      "id": "component_1731825700000_xyz789",
      "name": "青蔥",
      "confidence": 1.0,
      "estimatedPortion": 10,
      "actualNutrition": {
        "calories": 3.2,
        "protein": 0.2,
        "carbohydrates": 0.7,
        "fat": 0.02
      }
    },
    "updatedResult": {
      "components": [ ... ],
      "nutritionSummary": {
        "total": {
          "calories": 453.2,
          "protein": 15.2,
          "carbohydrates": 60.7,
          "fat": 8.02
        }
      }
    }
  }
}
```

### 3. 調整成分份量

如果份量估計不準確，可以調整：

```bash
curl -X POST http://localhost:3000/api/v1/component-adjustment/update-portion \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "component_session_1731825600000_abc123",
    "componentId": "comp_1",
    "newPortion": 250
  }'
```

**回應**:
```json
{
  "success": true,
  "data": {
    "message": "份量已成功調整",
    "componentId": "comp_1",
    "oldPortion": 200,
    "newPortion": 250,
    "updatedResult": {
      "nutritionSummary": {
        "total": {
          "calories": 518.2,
          "protein": 16.55,
          "carbohydrates": 70.7,
          "fat": 8.17
        }
      }
    }
  }
}
```

### 4. 移除錯誤的成分

如果識別結果包含錯誤的成分，可以移除：

```bash
curl -X POST http://localhost:3000/api/v1/component-adjustment/remove \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "component_session_1731825600000_abc123",
    "componentId": "comp_2"
  }'
```

### 5. 查看最終結果

查看所有調整後的最終結果：

```bash
curl http://localhost:3000/api/v1/component-adjustment/session/component_session_1731825600000_abc123
```

**回應**:
```json
{
  "success": true,
  "data": {
    "sessionId": "component_session_1731825600000_abc123",
    "originalResult": { ... },
    "currentResult": {
      "components": [
        {
          "id": "comp_1",
          "name": "白飯",
          "estimatedPortion": 250
        },
        {
          "id": "component_1731825700000_xyz789",
          "name": "青蔥",
          "estimatedPortion": 10
        }
      ],
      "nutritionSummary": {
        "total": {
          "calories": 328.2,
          "protein": 7.05,
          "carbohydrates": 70.7,
          "fat": 0.77
        }
      }
    },
    "adjustments": [
      {
        "id": "adj_1",
        "type": "add",
        "timestamp": "2025-11-17T10:30:00.000Z",
        "details": { ... }
      },
      {
        "id": "adj_2",
        "type": "update_portion",
        "timestamp": "2025-11-17T10:31:00.000Z",
        "details": { ... }
      },
      {
        "id": "adj_3",
        "type": "remove",
        "timestamp": "2025-11-17T10:32:00.000Z",
        "details": { ... }
      }
    ]
  }
}
```

### 6. 查看調整歷史

查看所有調整操作的歷史記錄：

```bash
curl http://localhost:3000/api/v1/component-adjustment/history/component_session_1731825600000_abc123
```

## 完整範例：JavaScript/TypeScript

```typescript
// 1. 執行食物識別
const formData = new FormData();
formData.append('photo', fileInput.files[0]);
formData.append('includeComponents', 'true');

const recognitionResponse = await fetch('/api/v1/photo/recognize-with-components', {
  method: 'POST',
  body: formData
});

const { data } = await recognitionResponse.json();
const sessionId = data.sessionId;

console.log('識別結果:', data.componentDetection);

// 2. 添加缺失的成分
const addResponse = await fetch('/api/v1/component-adjustment/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    component: {
      name: '青蔥',
      estimatedPortion: 10,
      cookingMethod: 'stir_fried',
      category: 'garnish'
    }
  })
});

const addResult = await addResponse.json();
console.log('添加成分結果:', addResult.data);

// 3. 調整份量
const updateResponse = await fetch('/api/v1/component-adjustment/update-portion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    componentId: 'comp_1',
    newPortion: 250
  })
});

const updateResult = await updateResponse.json();
console.log('調整份量結果:', updateResult.data);

// 4. 獲取最終結果
const finalResponse = await fetch(`/api/v1/component-adjustment/session/${sessionId}`);
const finalData = await finalResponse.json();

console.log('最終營養:', finalData.data.currentResult.nutritionSummary.total);
console.log('調整次數:', finalData.data.adjustments.length);
```

## 完整範例：React 組件

```tsx
import React, { useState } from 'react';

function ComponentAdjustment() {
  const [sessionId, setSessionId] = useState('');
  const [components, setComponents] = useState([]);
  const [nutrition, setNutrition] = useState(null);

  // 上傳照片並識別
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('includeComponents', 'true');

    const response = await fetch('/api/v1/photo/recognize-with-components', {
      method: 'POST',
      body: formData
    });

    const { data } = await response.json();
    setSessionId(data.sessionId);
    setComponents(data.componentDetection.components);
    setNutrition(data.componentDetection.nutritionSummary.total);
  };

  // 添加成分
  const handleAddComponent = async (name: string, portion: number) => {
    const response = await fetch('/api/v1/component-adjustment/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        component: { name, estimatedPortion: portion }
      })
    });

    const { data } = await response.json();
    setComponents(data.updatedResult.components);
    setNutrition(data.updatedResult.nutritionSummary.total);
  };

  // 調整份量
  const handleUpdatePortion = async (componentId: string, newPortion: number) => {
    const response = await fetch('/api/v1/component-adjustment/update-portion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        componentId,
        newPortion
      })
    });

    const { data } = await response.json();
    setComponents(data.updatedResult.components);
    setNutrition(data.updatedResult.nutritionSummary.total);
  };

  // 移除成分
  const handleRemoveComponent = async (componentId: string) => {
    const response = await fetch('/api/v1/component-adjustment/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        componentId
      })
    });

    const { data } = await response.json();
    setComponents(data.updatedResult.components);
    setNutrition(data.updatedResult.nutritionSummary.total);
  };

  return (
    <div>
      <h2>成分調整</h2>
      
      {/* 上傳區域 */}
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
      />

      {/* 成分列表 */}
      {components.map(comp => (
        <div key={comp.id}>
          <span>{comp.name}</span>
          <input 
            type="number" 
            value={comp.estimatedPortion}
            onChange={(e) => handleUpdatePortion(comp.id, Number(e.target.value))}
          />
          <button onClick={() => handleRemoveComponent(comp.id)}>移除</button>
        </div>
      ))}

      {/* 添加成分 */}
      <button onClick={() => handleAddComponent('青蔥', 10)}>
        添加青蔥
      </button>

      {/* 營養摘要 */}
      {nutrition && (
        <div>
          <h3>總營養</h3>
          <p>卡路里: {nutrition.calories} kcal</p>
          <p>蛋白質: {nutrition.protein} g</p>
          <p>碳水化合物: {nutrition.carbohydrates} g</p>
          <p>脂肪: {nutrition.fat} g</p>
        </div>
      )}
    </div>
  );
}

export default ComponentAdjustment;
```

## 測試腳本

使用提供的測試腳本快速測試所有功能：

```bash
# 運行測試腳本
./test-component-adjustment.sh

# 或者設置 SESSION_ID 後運行
SESSION_ID="your_session_id" ./test-component-adjustment.sh
```

## 常見問題

### Q: sessionId 的有效期是多久？
A: 預設 24 小時。過期後會話會被自動清理。

### Q: 可以同時調整多個成分嗎？
A: 可以連續調用 API，每次調整都會自動重新計算營養。

### Q: 添加的成分沒有營養資訊怎麼辦？
A: 系統會嘗試從知識庫獲取。如果找不到，該成分的營養資訊將為空。

### Q: 調整記錄會保存多久？
A: 永久保存在數據庫中，可用於後續分析和改進。

### Q: 可以撤銷調整嗎？
A: 目前不支持撤銷，但可以查看原始識別結果（originalResult）。

## 相關文檔

- [詳細 API 文檔](apps/api/src/services/COMPONENT_ADJUSTMENT_README.md)
- [實施摘要](.kiro/specs/asian-cuisine-component-detection/TASK_14_IMPLEMENTATION_SUMMARY.md)
- [成分識別設計](. kiro/specs/asian-cuisine-component-detection/design.md)

## 支持

如有問題或建議，請查看詳細文檔或聯繫開發團隊。
