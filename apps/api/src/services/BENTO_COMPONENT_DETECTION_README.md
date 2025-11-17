# 便當類成分識別系統
# Bento Component Detection System

## 目錄

1. [簡介](#簡介)
2. [功能特點](#功能特點)
3. [支持的便當類型](#支持的便當類型)
4. [技術架構](#技術架構)
5. [使用指南](#使用指南)
6. [API 參考](#api-參考)
7. [測試](#測試)
8. [性能優化](#性能優化)
9. [故障排除](#故障排除)
10. [未來規劃](#未來規劃)

---

## 簡介

便當類成分識別系統是專門為識別亞洲便當（Bento）中的多個獨立成分而設計的智能識別系統。系統能夠：

- 🍱 識別便當中的所有食物成分
- 📍 自動劃分主食、主菜、配菜區域
- ⚖️ 估算每個成分的份量
- 🔍 驗證識別結果的合理性
- 💡 提供改進建議

### 為什麼需要專門的便當識別？

便當與其他料理的主要區別：

1. **多樣性**：便當包含多種獨立的食物項目
2. **區域劃分**：有明確的主食、主菜、配菜區域
3. **份量比例**：各區域有相對固定的份量比例
4. **文化差異**：不同地區的便當有不同的特色

---

## 功能特點

### 1. 智能成分識別

- **Vision API 識別**：使用 OpenAI Vision API 識別圖片中的食物
- **知識庫增強**：利用內建知識庫補充常見成分
- **混合策略**：結合 AI 和規則引擎，提高準確率

### 2. 自動區域劃分

```
┌─────────────────────────────────┐
│         便當盒佈局示意圖          │
├─────────────────────────────────┤
│                                 │
│  ┌──────────┐  ┌──────────┐   │
│  │          │  │          │   │
│  │  主食區  │  │  主菜區  │   │
│  │  (40%)   │  │  (30%)   │   │
│  │          │  │          │   │
│  └──────────┘  └──────────┘   │
│                                 │
│  ┌──────────┬──────────┐       │
│  │  配菜1   │  配菜2   │       │
│  │  (10%)   │  (10%)   │       │
│  ├──────────┼──────────┤       │
│  │  配菜3   │  配菜4   │       │
│  │  (5%)    │  (5%)    │       │
│  └──────────┴──────────┘       │
│                                 │
└─────────────────────────────────┘
```

### 3. 份量智能調整

系統會根據便當的典型比例自動調整各成分的份量：

- **主食**：35-45%（通常是米飯）
- **主菜**：25-35%（主要蛋白質）
- **配菜**：25-35%（多種小菜）

### 4. 多層驗證機制

- ✅ 必要成分檢查（主食、主菜）
- ✅ 份量合理性驗證
- ✅ 成分數量驗證
- ✅ 營養均衡檢查
- ✅ 烹飪方式多樣性檢查

---

## 支持的便當類型

### 台式便當

**特色**：
- 滷肉或肉燥淋在飯上
- 炸雞腿或排骨作為主菜
- 多種炒青菜和滷味配菜
- 常有滷蛋、豆乾、酸菜

**典型成分**：
```typescript
{
  staple: ['白飯'],
  mainDish: ['炸雞腿', '排骨', '滷雞腿'],
  sideDishes: ['滷蛋', '高麗菜', '豆乾', '酸菜', '滷肉']
}
```

**份量範圍**：400-600g

### 日式便當

**特色**：
- 注重色彩搭配和營養均衡
- 玉子燒（日式煎蛋）是標配
- 醃漬物和梅乾作為點綴
- 主菜通常是炸豬排、照燒雞腿或烤魚

**典型成分**：
```typescript
{
  staple: ['白飯', '壽司飯'],
  mainDish: ['炸豬排', '照燒雞腿', '烤魚', '炸蝦'],
  sideDishes: ['玉子燒', '炒青菜', '醃漬物', '煮物', '梅乾', '海苔']
}
```

**份量範圍**：400-600g

### 韓式便當

**特色**：
- 多種小菜（반찬）是最大特色
- 泡菜（김치）是必備
- 注重發酵食品
- 常用芝麻和辣椒醬調味

**典型成分**：
```typescript
{
  staple: ['白飯', '紫米飯', '雜糧飯'],
  mainDish: ['韓式烤肉', '炸雞', '烤魚'],
  sideDishes: ['泡菜', '炒菠菜', '炒豆芽', '炒魚板', '煎蛋', '芝麻']
}
```

**份量範圍**：450-650g

---

## 技術架構

### 系統流程圖

```
┌─────────────┐
│  上傳圖片   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  ComponentDetectionEngine       │
├─────────────────────────────────┤
│  1. 料理類型判斷                │
│  2. Vision API 成分提取         │
│  3. 知識庫增強                  │
│  4. 便當專用份量調整            │
│  5. 區域劃分                    │
│  6. 成分驗證                    │
│  7. 生成建議                    │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  識別結果                       │
├─────────────────────────────────┤
│  - 主食區成分                   │
│  - 主菜區成分                   │
│  - 配菜區成分                   │
│  - 份量估算                     │
│  - 營養資訊                     │
│  - 改進建議                     │
└─────────────────────────────────┘
```

### 核心組件

#### 1. ComponentDetectionEngine

主要引擎，負責整個識別流程：

```typescript
class ComponentDetectionEngine {
  // 主要方法
  async detectComponents(image, dishName, dishType): Promise<ComponentDetectionResult>
  
  // 便當專用方法
  private adjustBentoComponentPortions(components, totalPortion): EnrichedComponent[]
  private validateBentoComponents(components): string[]
  private generateBentoSpecificSuggestions(components, dishName): string[]
}
```

#### 2. 知識庫（dishComponentMaps.ts）

包含便當的成分映射數據：

```typescript
const DISH_COMPONENT_MAPS = [
  {
    dishName: '台式便當',
    dishType: DishType.BENTO,
    region: ['taiwan'],
    commonComponents: [...],
    regionalVariations: [...],
    typicalPortionRange: { min: 400, max: 600, typical: 500 }
  },
  // ... 更多便當類型
];
```

#### 3. Prompt 生成器（ComponentDetectionPrompts.ts）

生成便當專用的 Vision API prompt：

```typescript
export function generateBentoComponentPrompt(language: 'zh-TW' | 'en'): string {
  // 生成便當專用的識別 prompt
  // 包含區域劃分、成分識別、份量估算等指示
}
```

---

## 使用指南

### 基本使用

```typescript
import { ComponentDetectionEngine } from './ComponentDetectionEngine';
import { DishType } from '../types/ComponentDetection';
import * as fs from 'fs';

// 1. 創建引擎實例
const engine = new ComponentDetectionEngine('zh-TW');

// 2. 讀取圖片
const imageBuffer = fs.readFileSync('taiwanese-bento.jpg');

// 3. 識別成分
const result = await engine.detectComponents(
  imageBuffer,
  '台式便當',
  DishType.BENTO
);

// 4. 查看結果
console.log('料理:', result.mainDish.name);
console.log('總份量:', result.mainDish.estimatedTotalPortion, 'g');
console.log('成分數:', result.components.length);

// 5. 按區域查看成分
const staples = result.components.filter(c => c.bentoRole === 'staple');
const mainDishes = result.components.filter(c => c.bentoRole === 'main_dish');
const sideDishes = result.components.filter(c => c.bentoRole === 'side_dish');

console.log('\n主食區:');
staples.forEach(c => console.log(`  - ${c.name}: ${c.estimatedPortion}g`));

console.log('\n主菜區:');
mainDishes.forEach(c => console.log(`  - ${c.name}: ${c.estimatedPortion}g`));

console.log('\n配菜區:');
sideDishes.forEach(c => console.log(`  - ${c.name}: ${c.estimatedPortion}g`));
```

### 進階使用

#### 1. 自定義份量調整

```typescript
// 如果需要自定義份量比例
const customResult = await engine.detectComponents(
  imageBuffer,
  '台式便當',
  DishType.BENTO
);

// 手動調整份量
customResult.components.forEach(comp => {
  if (comp.bentoRole === 'staple') {
    comp.estimatedPortion *= 1.2; // 增加主食份量 20%
  }
});
```

#### 2. 驗證和建議

```typescript
const result = await engine.detectComponents(
  imageBuffer,
  '日式便當',
  DishType.BENTO
);

// 檢查驗證結果
if (result.metadata.confidenceScore < 0.7) {
  console.warn('⚠️ 識別信心度較低');
  
  // 查看建議
  if (result.suggestions.possibleMissingComponents.length > 0) {
    console.log('可能缺失的成分:');
    result.suggestions.possibleMissingComponents.forEach(comp => {
      console.log(`  - ${comp}`);
    });
  }
}

// 查看份量調整建議
if (result.suggestions.portionAdjustments.length > 0) {
  console.log('份量調整建議:');
  result.suggestions.portionAdjustments.forEach(adj => {
    console.log(`  - ${adj.component}: ${adj.suggestedPortion}g`);
    console.log(`    原因: ${adj.reason}`);
  });
}
```

#### 3. 營養分析

```typescript
const result = await engine.detectComponents(
  imageBuffer,
  '韓式便當',
  DishType.BENTO
);

// 按類別統計營養
const nutritionByCategory = {
  protein: 0,
  vegetable: 0,
  grain: 0
};

result.components.forEach(comp => {
  if (comp.category === 'protein') {
    nutritionByCategory.protein += comp.estimatedPortion;
  } else if (comp.category === 'vegetable') {
    nutritionByCategory.vegetable += comp.estimatedPortion;
  } else if (comp.category === 'grain') {
    nutritionByCategory.grain += comp.estimatedPortion;
  }
});

console.log('營養分布:');
console.log(`  蛋白質: ${nutritionByCategory.protein}g`);
console.log(`  蔬菜: ${nutritionByCategory.vegetable}g`);
console.log(`  主食: ${nutritionByCategory.grain}g`);

// 檢查營養均衡
const total = Object.values(nutritionByCategory).reduce((a, b) => a + b, 0);
const proteinRatio = nutritionByCategory.protein / total;
const vegetableRatio = nutritionByCategory.vegetable / total;
const grainRatio = nutritionByCategory.grain / total;

console.log('\n營養比例:');
console.log(`  蛋白質: ${(proteinRatio * 100).toFixed(1)}%`);
console.log(`  蔬菜: ${(vegetableRatio * 100).toFixed(1)}%`);
console.log(`  主食: ${(grainRatio * 100).toFixed(1)}%`);
```

---

## API 參考

### ComponentDetectionResult

```typescript
interface ComponentDetectionResult {
  mainDish: {
    name: string;              // 料理名稱
    type: DishType;            // 料理類型
    confidence: number;        // 信心度 (0-1)
    estimatedTotalPortion: number; // 總份量（克）
  };
  
  components: EnrichedComponent[]; // 成分列表
  
  nutritionSummary: {
    total: NutritionData;      // 總營養
    byComponent: ComponentNutrition[]; // 按成分
    byCategory: CategoryNutrition[];   // 按類別
    cookingImpact: CookingImpact[];    // 烹飪影響
  };
  
  metadata: {
    processingTime: number;    // 處理時間（毫秒）
    confidenceScore: number;   // 整體信心度
    detectionMethod: string;   // 檢測方法
    componentsDetected: number; // 檢測到的成分數
    componentsFromKB: number;   // 來自知識庫的成分數
    componentsFromVision: number; // 來自 Vision API 的成分數
  };
  
  suggestions: {
    possibleMissingComponents: string[]; // 可能缺失的成分
    portionAdjustments: PortionAdjustment[]; // 份量調整建議
    alternativeInterpretations: AlternativeInterpretation[]; // 替代解釋
  };
}
```

### EnrichedComponent

```typescript
interface EnrichedComponent {
  id: string;                  // 成分 ID
  name: string;                // 成分名稱（中文）
  nameEn?: string;             // 成分名稱（英文）
  confidence: number;          // 信心度 (0-1)
  estimatedPortion: number;    // 估計份量（克）
  cookingMethod?: CookingMethod; // 烹飪方式
  category?: ComponentCategory;  // 成分類別
  
  // 便當專用屬性
  bentoRole?: 'staple' | 'main_dish' | 'side_dish'; // 便當角色
  bentoPosition?: string;      // 便當位置
  
  // 視覺特徵
  visualFeatures?: {
    color: string[];           // 顏色
    shape: string;             // 形狀
    texture: string;           // 質地
    position: string;          // 位置
  };
  
  // 知識庫資訊
  knowledgeBaseMatch?: boolean; // 是否來自知識庫
  similarComponents?: string[]; // 相似成分
}
```

---

## 測試

### 運行測試

```bash
# 運行所有便當測試
npm test -- ComponentDetectionEngine.bento.test.ts

# 運行特定測試
npm test -- ComponentDetectionEngine.bento.test.ts -t "台式便當"

# 查看測試覆蓋率
npm test -- --coverage ComponentDetectionEngine.bento.test.ts
```

### 測試覆蓋範圍

- ✅ 台式便當成分識別
- ✅ 日式便當成分識別
- ✅ 韓式便當成分識別
- ✅ 便當區域劃分
- ✅ 份量調整邏輯
- ✅ 成分驗證規則
- ✅ 缺失成分檢測
- ✅ 營養均衡檢查

### 測試示例

```typescript
describe('便當類成分識別', () => {
  it('應該正確識別台式便當的成分', async () => {
    const result = await engine.detectComponents(
      imageBuffer,
      '台式便當',
      DishType.BENTO
    );
    
    expect(result.components.length).toBeGreaterThan(3);
    expect(result.components.some(c => c.bentoRole === 'staple')).toBe(true);
    expect(result.components.some(c => c.bentoRole === 'main_dish')).toBe(true);
    expect(result.components.some(c => c.bentoRole === 'side_dish')).toBe(true);
  });
});
```

---

## 性能優化

### 1. 緩存策略

```typescript
// 緩存常見便當的成分映射
const bentoCache = new Map<string, DishComponentMap>();

function getCachedBentoMap(dishName: string): DishComponentMap | undefined {
  if (bentoCache.has(dishName)) {
    return bentoCache.get(dishName);
  }
  
  const map = findDishComponentMap(dishName);
  if (map) {
    bentoCache.set(dishName, map);
  }
  
  return map;
}
```

### 2. 批量處理

```typescript
// 批量識別多個便當
async function batchDetectBentos(images: Buffer[]): Promise<ComponentDetectionResult[]> {
  const results = await Promise.all(
    images.map(image => 
      engine.detectComponents(image, '台式便當', DishType.BENTO)
    )
  );
  
  return results;
}
```

### 3. 性能監控

```typescript
const startTime = Date.now();
const result = await engine.detectComponents(image, '台式便當', DishType.BENTO);
const endTime = Date.now();

console.log(`處理時間: ${endTime - startTime}ms`);
console.log(`成分數: ${result.components.length}`);
console.log(`平均每個成分: ${(endTime - startTime) / result.components.length}ms`);
```

---

## 故障排除

### 問題 1：識別不到主食

**症狀**：系統警告「便當中未檢測到主食」

**可能原因**：
- 米飯被其他食物遮擋
- 圖片角度不佳
- 米飯顏色與背景相似

**解決方案**：
1. 從正上方拍攝，確保米飯可見
2. 調整光線，增加對比度
3. 手動添加主食成分

### 問題 2：配菜識別不完整

**症狀**：只識別到 1-2 個配菜，實際有更多

**可能原因**：
- 配菜份量太小
- 配菜顏色相似，難以區分
- 配菜被遮擋

**解決方案**：
1. 確保所有配菜都清晰可見
2. 使用更高解析度的圖片
3. 查看建議中的「可能缺失的成分」
4. 手動添加遺漏的配菜

### 問題 3：份量估算不準確

**症狀**：估算的份量與實際差異較大

**可能原因**：
- 便當盒大小不標準
- 食物堆疊，難以估算體積
- 缺少參照物

**解決方案**：
1. 在圖片中包含參照物（如筷子、湯匙）
2. 使用標準大小的便當盒
3. 手動調整份量
4. 參考系統的份量調整建議

### 問題 4：處理時間過長

**症狀**：識別時間超過 10 秒

**可能原因**：
- 圖片解析度過高
- 成分數量過多
- Vision API 響應慢

**解決方案**：
1. 壓縮圖片到合適大小（建議 1024x1024）
2. 使用緩存機制
3. 檢查網絡連接
4. 考慮使用批量處理

---

## 未來規劃

### 短期（1-2 個月）

- [ ] 支持更多地區的便當（東南亞、印度等）
- [ ] 改進小份量配菜的識別準確率
- [ ] 添加便當美觀度評分
- [ ] 支持便當營養建議

### 中期（3-6 個月）

- [ ] 實現便當 3D 結構分析
- [ ] 支持便當成分的用戶反饋學習
- [ ] 添加便當熱量計算
- [ ] 支持便當食譜推薦

### 長期（6-12 個月）

- [ ] 開發專門的便當識別模型
- [ ] 支持便當製作過程追蹤
- [ ] 整合營養師建議系統
- [ ] 支持便當社交分享功能

---

## 貢獻指南

歡迎貢獻！請遵循以下步驟：

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

### 貢獻重點

- 添加新的便當類型支持
- 改進識別準確率
- 優化性能
- 完善文檔
- 添加測試案例

---

## 授權

MIT License

---

## 聯繫方式

如有問題或建議，請：
- 提交 Issue
- 發送 Pull Request
- 聯繫維護者

---

## 致謝

感謝以下資源和工具：
- OpenAI Vision API
- TypeScript
- Jest 測試框架
- 所有貢獻者

---

**最後更新**：2025-11-17
**版本**：v1.0.0
