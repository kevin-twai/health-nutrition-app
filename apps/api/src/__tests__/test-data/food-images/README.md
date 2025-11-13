# 食物識別測試圖片集

本目錄包含用於測試食物識別準確度的圖片集和標註數據。

## 目錄結構

```
test-data/
├── food-images/
│   ├── asian-cuisine/          # 亞洲料理圖片
│   │   ├── liangban-gansi/     # 涼拌干絲
│   │   ├── taiwanese-stir-fry/ # 台式熱炒
│   │   ├── japanese-dishes/    # 日式料理
│   │   └── korean-dishes/      # 韓式料理
│   ├── confusing-pairs/        # 易混淆食材對照
│   │   ├── tofu-vs-noodles/    # 豆腐干絲 vs 麵條
│   │   ├── rice-noodles-vs-glass-noodles/ # 米粉 vs 粉絲
│   │   └── vegetables/         # 易混淆蔬菜
│   ├── mixed-dishes/           # 混合食材菜餚
│   └── indigenous-food/        # 原住民料理
├── annotations/                # 標註文件
└── test-results/              # 測試結果
```

## 標註格式

每張圖片都有對應的 JSON 標註文件，格式如下：

```json
{
  "imageId": "liangban-gansi-01",
  "imagePath": "asian-cuisine/liangban-gansi/01.jpg",
  "category": "涼拌菜",
  "cuisineType": "台式",
  "cookingMethod": "涼拌",
  "foods": [
    {
      "name": "豆腐干絲",
      "category": "豆製品",
      "portion": "100g",
      "confidence": 1.0,
      "visualFeatures": ["淡黃色", "細長條狀", "有韌性"]
    },
    {
      "name": "芹菜絲",
      "category": "蔬菜",
      "portion": "30g",
      "confidence": 1.0
    }
  ],
  "commonConfusions": ["麵條", "米粉"],
  "difficulty": "medium",
  "tags": ["豆製品", "涼拌", "混合食材"]
}
```

## 測試場景分類

### 1. 涼拌菜 (Cold Dishes)
- 涼拌干絲
- 涼拌木耳
- 涼拌海蜇皮
- 涼拌黃瓜

### 2. 台式熱炒 (Taiwanese Stir-Fry)
- 三杯雞
- 宮保雞丁
- 糯米椒炒豆乾
- 炒空心菜

### 3. 日式料理 (Japanese Cuisine)
- 壽司
- 拉麵
- 天婦羅
- 味噌湯

### 4. 韓式料理 (Korean Cuisine)
- 泡菜
- 石鍋拌飯
- 韓式烤肉
- 豆腐鍋

### 5. 易混淆食材 (Confusing Pairs)
- 豆腐干絲 vs 麵條
- 米粉 vs 粉絲
- 玉米筍 vs 筍子
- 糯米椒 vs 青椒

### 6. 混合食材菜餚 (Mixed Ingredient Dishes)
- 什錦炒飯
- 綜合沙拉
- 火鍋
- 佛跳牆

### 7. 原住民料理 (Indigenous Food)
- 馬告料理
- 刺蔥料理
- 小米料理
- 過貓料理

## 圖片要求

- 格式：JPG 或 PNG
- 最小尺寸：800x600
- 最大尺寸：4000x3000
- 清晰度：高清，無模糊
- 光線：自然光或良好照明
- 角度：俯視或 45 度角

## 標註指南

1. **準確性**：確保所有可見食材都被標註
2. **完整性**：包含主食材、配菜和調味料
3. **一致性**：使用統一的命名規範
4. **詳細性**：提供視覺特徵和份量估計
5. **難度評級**：easy, medium, hard

## 使用方式

```typescript
import { loadTestDataset } from './test-data-loader';

const dataset = await loadTestDataset('asian-cuisine');
for (const testCase of dataset) {
  const result = await recognitionEngine.recognize(testCase.image);
  // 比對結果與標註
}
```

## 注意事項

- 測試圖片不應包含個人隱私信息
- 圖片來源應合法且有使用權限
- 定期更新測試集以涵蓋新的食材和場景
- 保持測試集的多樣性和代表性
