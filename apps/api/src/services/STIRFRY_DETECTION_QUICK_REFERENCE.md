# 炒菜類識別快速參考
# Stir-Fry Detection Quick Reference

## 快速開始 Quick Start

```typescript
import { ComponentDetectionEngine } from './ComponentDetectionEngine';
import { DishType } from '../types/ComponentDetection';

const engine = new ComponentDetectionEngine('zh-TW');
const result = await engine.detectComponents(
  imageBuffer,
  '炒麵',
  DishType.STIR_FRY
);
```

## 支援的料理 Supported Dishes

| 料理 | 英文 | 主要成分 |
|------|------|----------|
| 炒麵 | Stir-Fried Noodles | 麵條、高麗菜、豬肉絲、青蔥 |
| 炒青菜 | Stir-Fried Vegetables | 青江菜、蒜頭、食用油 |
| 宮保雞丁 | Kung Pao Chicken | 雞肉丁、花生、乾辣椒、青椒 |
| 炒飯 | Fried Rice | 米飯、蛋、青蔥、配料 |

## 成分類型 Component Types

識別結果中的成分會被標記為以下類型之一：

- `main` - 主要食材（蔬菜、主食）
- `protein` - 蛋白質
- `seasoning` - 調味料

## 份量比例 Portion Ratios

炒菜類料理的典型份量比例：

- 主要食材：55%
- 蛋白質：35%
- 調味料：10%

## 常見成分 Common Components

### 主要食材
- 麵條、米飯
- 青江菜、高麗菜、豆芽菜
- 紅蘿蔔、青椒

### 蛋白質
- 豬肉絲、雞肉丁、牛肉絲
- 蝦仁、魷魚
- 雞蛋、豆腐

### 調味料
- 蒜頭、蒜片、蒜末
- 薑片、薑絲
- 青蔥、蔥段
- 辣椒、乾辣椒
- 花生、腰果

## 驗證檢查 Validation Checks

系統會自動檢查：

✓ 是否包含主要食材  
✓ 烹飪方式是否為炒製  
✓ 液體成分是否過多  
✓ 成分數量是否合理  
✓ 是否有蒜頭調味  

## 結果示例 Result Example

```json
{
  "mainDish": {
    "name": "宮保雞丁",
    "type": "stir_fry",
    "confidence": 0.92
  },
  "components": [
    {
      "name": "雞肉丁",
      "estimatedPortion": 120,
      "category": "protein",
      "componentType": "protein"
    },
    {
      "name": "花生",
      "estimatedPortion": 30,
      "category": "protein",
      "componentType": "protein"
    },
    {
      "name": "青椒",
      "estimatedPortion": 40,
      "category": "vegetable",
      "componentType": "main"
    },
    {
      "name": "乾辣椒",
      "estimatedPortion": 10,
      "category": "seasoning",
      "componentType": "seasoning"
    }
  ]
}
```

## 提升準確率 Improve Accuracy

1. 使用清晰的圖片
2. 從上方俯拍
3. 確保光線充足
4. 提供準確的料理名稱

## 相關文件 Related Files

- 詳細指南：`STIRFRY_COMPONENT_DETECTION_README.md`
- 示例代碼：`ComponentDetectionEngine.stirfry.example.ts`
- 測試文件：`__tests__/ComponentDetectionEngine.stirfry.test.ts`
