# 亞洲料理成分識別測試快速指南

## 快速開始

### 1. 生成測試數據集

```bash
cd apps/api
npx ts-node src/__tests__/test-data/generate-component-test-data.ts
```

**輸出：**
- 生成 `annotations/component-detection-annotations.json`
- 包含 6 個測試案例（台式、日式、川式料理）

### 2. 執行準確率測試（模擬版本）

```bash
npx ts-node src/__tests__/test-data/run-component-accuracy-test-mock.ts
```

**測試內容：**
- ✅ 成分識別準確率
- ✅ 主要成分識別率
- ✅ 份量估計誤差

**預期結果：**
```
【整體指標】
  準確率: ~70-90%
  主要成分識別率: >90% ✅
  份量估計準確度: >75% ✅
```

### 3. 執行性能測試

```bash
npx ts-node src/__tests__/test-data/run-component-performance-test.ts
```

**測試內容：**
- ✅ 簡單料理響應時間 < 3秒
- ✅ 中等複雜料理響應時間 < 5秒
- ✅ 複雜料理響應時間 < 8秒

**預期結果：**
```
【按難度分類】
  Easy: ~1500ms ✅
  Medium: ~3000ms ✅
  Hard: ~5000ms ✅
```

## 測試數據集結構

### 包含的測試案例

1. **蛋炒飯** (Easy, 台式)
   - 成分：白飯、雞蛋、青蔥
   - 總份量：300g

2. **味噌湯** (Medium, 日式)
   - 成分：味噌湯底、豆腐、海帶芽、青蔥
   - 總份量：250g

3. **台式便當** (Hard, 台式)
   - 成分：白飯、炸排骨、滷蛋、炒高麗菜、滷豆干
   - 總份量：500g

4. **牛肉麵** (Medium, 台式)
   - 成分：麵條、牛肉、牛肉湯、青菜
   - 總份量：450g

5. **宮保雞丁** (Medium, 川式)
   - 成分：雞肉、花生、乾辣椒、青蔥
   - 總份量：250g

6. **壽司拼盤** (Hard, 日式)
   - 成分：壽司飯、鮭魚、鮪魚、海苔、醃薑
   - 總份量：300g

## 測試結果位置

所有測試結果保存在：
```
apps/api/src/__tests__/test-data/test-results/
```

文件格式：
- `mock-test-results-{timestamp}.json` - 準確率測試結果
- `performance-test-results-{timestamp}.json` - 性能測試結果

## 查看測試結果

### 準確率測試結果

```bash
cat apps/api/src/__tests__/test-data/test-results/mock-test-results-*.json | jq '.metrics'
```

### 性能測試結果

```bash
cat apps/api/src/__tests__/test-data/test-results/performance-test-results-*.json | jq '.stats'
```

## 添加新的測試案例

編輯 `generate-component-test-data.ts`，在 `testCases` 數組中添加新案例：

```typescript
{
  imageId: 'your-dish-id',
  imagePath: 'component-detection/category/your-dish.jpg',
  category: '料理類別',
  cuisineType: '料理類型',
  cookingMethod: '烹飪方法',
  difficulty: 'easy' | 'medium' | 'hard',
  dishName: '料理名稱',
  dishType: 'dish_type',
  estimatedTotalPortion: 300,
  components: [
    {
      name: '成分名稱',
      nameEn: 'Component Name',
      category: 'grain' | 'protein' | 'vegetable' | 'sauce' | 'garnish',
      portion: 100,
      cookingMethod: 'stir_fried' | 'boiled' | 'steamed' | 'raw',
      confidence: 1.0,
      visualFeatures: ['特徵1', '特徵2'],
      nutritionPer100g: {
        calories: 130,
        protein: 2.7,
        carbohydrates: 28,
        fat: 0.3
      }
    }
  ],
  commonConfusions: [],
  tags: ['標籤1', '標籤2'],
  notes: '備註',
  expectedChallenges: []
}
```

然後重新生成數據集：
```bash
npx ts-node src/__tests__/test-data/generate-component-test-data.ts
```

## 使用真實 API 測試

### 前置條件

1. 設置環境變量：
```bash
export OPENAI_API_KEY="your-api-key"
```

2. 準備真實圖片：
   - 將圖片放在 `apps/api/src/__tests__/test-data/food-images/` 目錄
   - 確保圖片路徑與測試數據集中的 `imagePath` 匹配

### 執行真實測試

```bash
npx ts-node src/__tests__/test-data/run-component-accuracy-test.ts
```

## 測試目標

### 準確率目標
- ✅ 成分識別準確率 > 75%
- ✅ 主要成分識別率 > 90%
- ✅ 份量估計誤差 < ±25%

### 性能目標
- ✅ 簡單料理 < 3秒
- ✅ 中等複雜料理 < 5秒
- ✅ 複雜料理 < 8秒

## 常見問題

### Q: 為什麼使用模擬測試？
A: 模擬測試不需要 OpenAI API 密鑰和真實圖片，可以快速驗證測試框架和計算邏輯。

### Q: 如何提高測試準確率？
A: 
1. 使用真實圖片和 API
2. 優化 Prompt 設計
3. 擴充知識庫
4. 增加訓練數據

### Q: 測試失敗怎麼辦？
A: 
1. 檢查測試數據格式
2. 確認 API 配置正確
3. 查看詳細錯誤日誌
4. 檢查圖片質量

### Q: 如何解讀測試結果？
A: 
- **Accuracy**: 完全正確識別的比例
- **Precision**: 識別出的成分中正確的比例
- **Recall**: 實際成分中被識別出的比例
- **F1 Score**: Precision 和 Recall 的調和平均

## 相關文檔

- [測試數據集說明](./annotations/COMPONENT_TEST_DATA_README.md)
- [任務實施摘要](../../../.kiro/specs/asian-cuisine-component-detection/TASK_21_IMPLEMENTATION_SUMMARY.md)
- [AccuracyTester 文檔](./AccuracyTester.ts)
- [TestReportGenerator 文檔](./TestReportGenerator.ts)

## 支持

如有問題，請查看：
1. 測試輸出日誌
2. 生成的 JSON 結果文件
3. 相關文檔和代碼註釋
