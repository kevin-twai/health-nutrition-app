# 亞洲料理成分識別測試數據集

## 概述

此測試數據集專門用於測試亞洲料理成分識別系統的準確性。數據集涵蓋不同地域、料理類型和難度級別的測試案例。

## 數據集統計

- **總測試案例**: 6
- **類別分布**:
  - 炒飯類: 1
  - 湯品類: 1
  - 便當類: 1
  - 麵食類: 1
  - 熱炒類: 1
  - 日式料理: 1

- **難度分布**:
  - Easy: 1 (簡單料理，成分少且明確)
  - Medium: 3 (中等複雜度，成分較多)
  - Hard: 2 (複雜料理，多種成分或相似成分)

- **料理類型分布**:
  - 台式: 3
  - 日式: 2
  - 川式: 1

## 測試案例詳情

### 1. 蛋炒飯 (Easy)
- **料理類型**: 台式炒飯
- **成分數量**: 3 (白飯、雞蛋、青蔥)
- **總份量**: 300g
- **測試重點**: 基礎成分識別

### 2. 味噌湯 (Medium)
- **料理類型**: 日式湯品
- **成分數量**: 4 (味噌湯底、豆腐、海帶芽、青蔥)
- **總份量**: 250g
- **測試重點**: 湯品成分識別，液體中的固體成分

### 3. 台式便當 (Hard)
- **料理類型**: 台式便當
- **成分數量**: 6 (白飯、炸排骨、滷蛋、炒高麗菜、滷豆干、酸菜)
- **總份量**: 500g
- **測試重點**: 多成分識別、主菜與配菜區分、份量估計

### 4. 牛肉麵 (Medium)
- **料理類型**: 台式麵食
- **成分數量**: 4 (麵條、牛肉、牛肉湯、青菜)
- **總份量**: 450g
- **測試重點**: 湯麵類料理、湯汁中的成分識別

### 5. 宮保雞丁 (Medium)
- **料理類型**: 川式熱炒
- **成分數量**: 4 (雞肉、花生、乾辣椒、青蔥)
- **總份量**: 250g
- **測試重點**: 醬汁覆蓋的成分識別、小型配料識別

### 6. 壽司拼盤 (Hard)
- **料理類型**: 日式壽司
- **成分數量**: 5 (壽司飯、鮭魚、鮪魚、海苔、醃薑)
- **總份量**: 300g
- **測試重點**: 多種相似魚類區分、生食識別、精確份量估計

## 數據格式

每個測試案例包含以下信息：

```typescript
{
  imageId: string;              // 唯一識別碼
  imagePath: string;            // 圖片路徑
  category: string;             // 料理類別
  cuisineType: string;          // 料理類型（台式、日式等）
  cookingMethod: string;        // 烹飪方法
  difficulty: 'easy' | 'medium' | 'hard';  // 難度
  dishName: string;             // 料理名稱
  dishType: string;             // 料理類型代碼
  estimatedTotalPortion: number; // 預估總份量（克）
  components: Array<{
    name: string;               // 成分名稱（中文）
    nameEn: string;             // 成分名稱（英文）
    category: string;           // 成分類別
    portion: number;            // 份量（克）
    cookingMethod: string;      // 烹飪方法
    confidence: number;         // 標註信心度（0-1）
    visualFeatures: string[];   // 視覺特徵
    nutritionPer100g: {         // 每100g營養成分
      calories: number;
      protein: number;
      carbohydrates: number;
      fat: number;
    };
  }>;
  commonConfusions: string[];   // 常見混淆項
  tags: string[];               // 標籤
  notes: string;                // 備註
  expectedChallenges: string[]; // 預期挑戰
}
```

## 使用方法

### 1. 加載測試數據

```typescript
import { testDataLoader } from '../test-data-loader';

const dataset = await testDataLoader.loadDataset('component-detection-annotations.json');
console.log(`加載了 ${dataset.testCases.length} 個測試案例`);
```

### 2. 過濾測試案例

```typescript
// 按難度過濾
const easyTests = testDataLoader.filterByDifficulty(dataset, 'easy');

// 按料理類型過濾
const taiwaneseTests = testDataLoader.filterByCuisineType(dataset, '台式');

// 按類別過濾
const bentoTests = testDataLoader.filterByCategory(dataset, '便當類');
```

### 3. 執行測試

```typescript
import { AccuracyTester } from '../AccuracyTester';
import { ComponentDetectionEngine } from '../../../services/ComponentDetectionEngine';

const engine = new ComponentDetectionEngine('zh-TW');

// 創建測試函數
const recognitionFunction = async (imageBuffer: Buffer | null, testCase: TestCase) => {
  if (!imageBuffer) {
    throw new Error('No image buffer provided');
  }
  
  const result = await engine.detectComponents(imageBuffer, testCase.dishName);
  
  // 轉換為測試所需格式
  return {
    foods: result.components.map(c => ({
      food: {
        name: c.name,
        category: c.category,
        portion: `${c.estimatedPortion}g`
      },
      confidence: c.confidence
    })),
    overallConfidence: result.metadata.confidenceScore
  };
};

// 執行測試
const tester = new AccuracyTester(recognitionFunction);
const results = await tester.testDataset(dataset, {
  parallel: false,
  onProgress: (current, total) => {
    console.log(`進度: ${current}/${total}`);
  }
});

// 計算指標
const metrics = tester.calculateMetrics();
console.log(`準確率: ${(metrics.accuracy * 100).toFixed(2)}%`);
```

## 測試目標

根據需求文檔，系統應達到以下目標：

1. **成分識別準確率**: > 75%
2. **主要成分識別率**: > 90%
3. **份量估計誤差**: < ±25%

## 擴展數據集

要添加新的測試案例，請編輯 `generate-component-test-data.ts` 文件並重新執行：

```bash
cd apps/api
npx ts-node src/__tests__/test-data/generate-component-test-data.ts
```

## 注意事項

1. **圖片文件**: 當前數據集僅包含標註，實際圖片需要另外準備
2. **標註信心度**: confidence 值表示標註者對該成分存在的信心度
3. **份量估計**: 所有份量以克（g）為單位
4. **營養數據**: 營養成分為每100g的標準值

## 相關文件

- `test-data-loader.ts`: 數據加載工具
- `AccuracyTester.ts`: 準確度測試工具
- `TestReportGenerator.ts`: 測試報告生成器
- `generate-component-test-data.ts`: 數據集生成腳本
