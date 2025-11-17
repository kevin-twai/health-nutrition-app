# 麵食類成分識別快速參考

## 概述

本文檔提供麵食類料理成分識別的快速參考，包括拉麵、烏龍麵、米粉和河粉。

## 支持的麵食類型

### 1. 拉麵 (Ramen)
- **地區**: 日本
- **典型份量**: 500-700g
- **主要特徵**: 
  - 細長麵條
  - 濃郁湯底（豚骨、醬油、味噌等）
  - 豐富配料（叉燒、蛋、筍、海苔）

**常見成分**:
- 拉麵 (150g) - 主食
- 叉燒 (50g) - 蛋白質
- 溏心蛋 (50g) - 蛋白質
- 筍乾 (20g) - 蔬菜
- 青蔥 (10g) - 配菜
- 海苔 (2g) - 配菜
- 豚骨湯 (300ml) - 湯底

**地域變化**:
- 日本各地有不同湯底風格
- 可能加入木耳、玉米等配料

### 2. 烏龍麵 (Udon)
- **地區**: 日本
- **典型份量**: 450-650g
- **主要特徵**:
  - 粗麵條，Q彈口感
  - 清淡柴魚高湯
  - 常搭配天婦羅

**常見成分**:
- 烏龍麵 (200g) - 主食
- 柴魚高湯 (300ml) - 湯底
- 天婦羅 (60g) - 蛋白質
- 青蔥 (10g) - 配菜
- 魚板 (30g) - 蛋白質
- 海帶 (10g) - 蔬菜

**地域變化**:
- 可能加入油豆腐
- 可撒七味粉調味

### 3. 米粉 (Rice Noodles)
- **地區**: 台灣、中國
- **典型份量**: 350-500g
- **主要特徵**:
  - 細米粉條
  - 清湯或炒製
  - 台式風味

**常見成分**:
- 米粉 (120g) - 主食
- 豬肉絲 (40g) - 蛋白質
- 香菇 (20g) - 蔬菜
- 高麗菜 (40g) - 蔬菜
- 紅蘿蔔絲 (20g) - 蔬菜
- 芹菜 (10g) - 配菜
- 清湯 (250ml) - 湯底

**地域變化**:
- 台灣: 加蝦米、油蔥酥
- 中國: 可能加酸菜

### 4. 河粉 (Rice Noodle Sheets)
- **地區**: 中國（廣東）、越南
- **典型份量**: 500-700g
- **主要特徵**:
  - 寬扁麵條
  - 濃郁牛骨湯
  - 牛肉為主

**常見成分**:
- 河粉 (200g) - 主食
- 牛肉片 (80g) - 蛋白質
- 豆芽菜 (40g) - 蔬菜
- 青蔥 (10g) - 配菜
- 香菜 (5g) - 配菜
- 牛骨湯 (300ml) - 湯底

**地域變化**:
- 廣東: 可能加牛肚、牛筋、油條
- 越南: 加羅勒、檸檬、辣椒（Pho）

## 湯麵 vs 乾麵

### 湯麵特徵
- 包含湯底成分（200-400ml）
- 麵條通常水煮
- 配料較多樣化
- 總熱量相對較低

### 乾麵特徵
- 無湯底或少量醬汁
- 麵條通常炒製
- 配料與麵條混合
- 油脂含量較高

## 成分識別重點

### 1. 麵條類型識別
- **拉麵**: 細長、淡黃色、有彈性
- **烏龍麵**: 粗條、白色、Q彈
- **米粉**: 細條、白色、軟滑
- **河粉**: 寬扁、白色、滑嫩

### 2. 湯底識別
- **清湯**: 清澈、淡色
- **濃湯**: 濃稠、乳白色（豚骨）
- **醬油湯**: 深褐色
- **味噌湯**: 淡褐色、有顆粒

### 3. 配料位置
- **麵上**: 叉燒、蛋、天婦羅
- **湯中**: 蔬菜、魚板、豆腐
- **表面**: 青蔥、海苔、香菜

### 4. 份量估算
- **麵條**: 150-250g
- **湯底**: 200-400ml
- **主要配料**: 30-80g
- **小配料**: 5-20g

## 烹飪方式影響

### 水煮 (Boiled)
- 保留大部分營養
- 熱量影響小
- 適用於湯麵

### 炒製 (Stir-Fried)
- 增加油脂 (3-4倍)
- 熱量提升 30-40%
- 適用於乾麵

### 油炸 (Deep-Fried)
- 大幅增加油脂 (3.5倍)
- 熱量提升 80%
- 適用於天婦羅等配料

## 使用範例

### 基本識別
```typescript
import { ComponentDetectionEngine } from './ComponentDetectionEngine';
import { DishType } from '../types/ComponentDetection';

const engine = new ComponentDetectionEngine('zh-TW');

// 識別拉麵
const result = await engine.detectComponents(
  imageBuffer,
  '拉麵',
  DishType.NOODLES
);

console.log('識別到的成分:', result.components);
console.log('營養摘要:', result.nutritionSummary);
```

### 知識庫查詢
```typescript
import { findDishComponentMap } from '../data/dishComponentMaps';

// 查詢拉麵的成分映射
const ramenMap = findDishComponentMap('拉麵');
console.log('常見成分:', ramenMap?.commonComponents);
console.log('地域變化:', ramenMap?.regionalVariations);
```

## 測試驗證

執行麵食類測試：
```bash
npm test -- ComponentDetectionEngine.noodles.test.ts
```

執行範例：
```bash
npx ts-node apps/api/src/services/ComponentDetectionEngine.noodles.example.ts
```

## 準確率目標

- **成分識別準確率**: > 75%
- **主要成分識別率**: > 90%
- **份量估計誤差**: < ±25%
- **響應時間**: < 5 秒

## 常見問題

### Q: 如何區分拉麵和烏龍麵？
A: 主要看麵條粗細和顏色：
- 拉麵：細長、淡黃色
- 烏龍麵：粗條、白色

### Q: 如何處理混合麵食（如炒河粉）？
A: 檢查是否有湯底：
- 有湯底：使用 NOODLES 類型
- 無湯底：使用 STIR_FRY 類型

### Q: 如何估算湯底份量？
A: 根據碗的大小和液體高度：
- 小碗：200-250ml
- 中碗：250-350ml
- 大碗：350-400ml

### Q: 越南河粉和廣東河粉有什麼區別？
A: 主要在配料和調味：
- 越南：加羅勒、檸檬、辣椒
- 廣東：加牛雜、油條

## 相關文檔

- [成分識別引擎 README](./ComponentDetectionEngine.README.md)
- [湯品識別快速參考](./SOUP_DETECTION_QUICK_REFERENCE.md)
- [炒菜識別快速參考](./STIRFRY_DETECTION_QUICK_REFERENCE.md)
- [便當識別快速參考](./BENTO_DETECTION_QUICK_REFERENCE.md)

## 更新日誌

- 2024-11-17: 初始版本，支持拉麵、烏龍麵、米粉、河粉
