# 點心和燒烤類成分識別 - 快速參考

## 快速開始

```typescript
import { ComponentDetectionEngine } from './services/ComponentDetectionEngine';
import { DishType } from './types/ComponentDetection';

const engine = new ComponentDetectionEngine('zh-TW');

// 識別餃子
const result = await engine.detectComponents(
  imageBuffer,
  '餃子',
  DishType.DUMPLING
);

// 識別烤肉
const result = await engine.detectComponents(
  imageBuffer,
  '烤肉',
  DishType.BARBECUE
);
```

## 支持的料理

### 點心類 (DUMPLING)
| 料理 | 典型份量 | 主要成分 |
|------|---------|---------|
| 餃子 | 40-60g | 餃子皮、豬肉餡、高麗菜、青蔥 |
| 小籠包 | 30-50g | 麵皮、豬肉餡、高湯凍、薑絲 |
| 燒賣 | 35-55g | 燒賣皮、豬肉餡、蝦仁、魚卵 |
| 春捲 | 80-120g | 春捲皮、豬肉絲、高麗菜絲、冬粉 |

### 燒烤類 (BARBECUE)
| 料理 | 典型份量 | 主要成分 |
|------|---------|---------|
| 烤肉 | 200-350g | 豬肉片、烤肉醬、青椒、洋蔥 |

## 成分比例

### 點心類
```
外皮: 30-40%
內餡: 50-60%
調味料: 5-15%
```

### 燒烤類
```
肉類: 50-60%
蔬菜: 25-35%
醬料: 5-10%
配菜: 5-10%
```

## 特殊標記

### 點心類
- `dumplingPart: 'wrapper'` - 外皮
- `dumplingPart: 'filling'` - 內餡
- `dumplingPart: 'soup'` - 湯汁
- `dumplingPart: 'condiment'` - 調味料

### 燒烤類
- `barbecueRole: 'main'` - 主要肉類
- `barbecueRole: 'vegetable'` - 蔬菜
- `barbecueRole: 'sauce'` - 醬料
- `barbecueRole: 'side'` - 配菜

## 驗證規則

### 點心類檢查
- ✅ 有外皮成分
- ✅ 有內餡成分
- ✅ 外皮佔 25-45%
- ✅ 總份量 20-150g
- ✅ 烹飪方式：蒸/煮/炸

### 燒烤類檢查
- ✅ 有肉類或海鮮
- ✅ 烹飪方式：烤製
- ✅ 有蔬菜配菜
- ✅ 肉類佔 40-70%
- ✅ 有醬料
- ✅ 總份量 100-500g

## 地域變化

### 餃子
- 🇨🇳 中式：韭菜、蝦仁
- 🇹🇼 台式：玉米

### 燒賣
- 🇭🇰 港式：蟹黃
- 🇨🇳 廣式：馬蹄

### 春捲
- 🇹🇼 台式：花生粉、香菜（潤餅）
- 🇻🇳 越南：生菜、薄荷葉、米紙

### 烤肉
- 🇰🇷 韓式：生菜、泡菜、辣椒醬
- 🇯🇵 日式：照燒醬、白蘿蔔泥
- 🇹🇼 台式：吐司、米血糕、甜不辣

## 常見問題

### Q: 為什麼內餡識別信心度較低？
A: 內餡通常無法直接看到，系統會根據視覺線索和知識庫推測，因此信心度會相對較低（通常 70-85%）。

### Q: 如何提高識別準確率？
A: 
1. 確保圖片清晰
2. 拍攝角度能看到食物細節
3. 對於點心，如果能看到內餡更好
4. 對於燒烤，拍攝多種食材

### Q: 份量估計準確嗎？
A: 份量估計誤差目標在 ±25% 以內。點心類以單個為單位，燒烤類以整盤為單位。

### Q: 支持哪些烹飪方式？
A: 
- 點心：蒸、煮、炸、煎
- 燒烤：烤製

## 性能指標

| 指標 | 目標 |
|------|------|
| 處理時間（點心） | 2-4 秒 |
| 處理時間（燒烤） | 3-5 秒 |
| 外皮識別準確率 | > 95% |
| 內餡識別準確率 | > 80% |
| 肉類識別準確率 | > 90% |
| 蔬菜識別準確率 | > 85% |
| 份量估計誤差 | < ±25% |

## 測試

```bash
# 運行測試
npm test -- ComponentDetectionEngine.dumpling-barbecue.test.ts

# 查看詳細文檔
cat apps/api/src/services/DUMPLING_BARBECUE_DETECTION_README.md
```

## 相關文件

- 📖 詳細文檔：`DUMPLING_BARBECUE_DETECTION_README.md`
- 🧪 測試文件：`__tests__/ComponentDetectionEngine.dumpling-barbecue.test.ts`
- 📊 實現摘要：`.kiro/specs/asian-cuisine-component-detection/TASK_12_IMPLEMENTATION_SUMMARY.md`
- 💾 數據映射：`apps/api/src/data/dishComponentMaps.ts`
- 🔧 檢測引擎：`apps/api/src/services/ComponentDetectionEngine.ts`
- 📝 Prompts：`apps/api/src/services/ComponentDetectionPrompts.ts`

---

**最後更新**: 2025-11-17
