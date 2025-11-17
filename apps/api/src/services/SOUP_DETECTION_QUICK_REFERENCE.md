# 湯品識別快速參考

## 支持的湯品

| 湯品名稱 | 英文名稱 | 地區 | 典型份量 | 主要成分 |
|---------|---------|------|---------|---------|
| 味噌湯 | Miso Soup | 日本 | 250ml | 味噌、豆腐、海帶芽、柴魚高湯 |
| 蛋花湯 | Egg Drop Soup | 中國、台灣 | 300ml | 雞蛋、雞湯、青蔥 |
| 貢丸湯 | Pork Ball Soup | 台灣 | 350ml | 貢丸、清湯、芹菜 |
| 酸辣湯 | Hot and Sour Soup | 中國、台灣 | 350ml | 豆腐、木耳、筍絲、雞蛋、豬肉絲 |

## 快速使用

### TypeScript
```typescript
import { ComponentDetectionEngine } from './services/ComponentDetectionEngine';
import { DishType } from './types/ComponentDetection';

const engine = new ComponentDetectionEngine('zh-TW');
const result = await engine.detectComponents(imageBuffer, '味噌湯', DishType.SOUP);
```

### API 調用
```bash
curl -X POST http://localhost:3000/api/photos/recognize?includeComponents=true \
  -H "Content-Type: application/json" \
  -d '{
    "image": "base64_image_data",
    "dishName": "味噌湯",
    "dishType": "soup"
  }'
```

## 核心特性

### 1. 液體/固體自動區分
- 液體：湯底、高湯（75%）
- 固體：配料、食材（25%）

### 2. 智能驗證
- ✅ 檢查湯底存在
- ✅ 驗證份量比例
- ✅ 確認常見配料

### 3. 專用建議
- 💡 缺失成分提醒
- 💡 份量調整建議
- 💡 料理特定建議

## 測試

```bash
npm test -- ComponentDetectionEngine.soup.test.ts
```

## 常見問題

**Q: 為什麼湯底份量這麼大？**
A: 湯品主要成分就是湯底，通常佔 70-85%。

**Q: 如何添加新湯品？**
A: 在 `dishComponentMaps.ts` 中添加新的映射配置。

**Q: 識別不準確怎麼辦？**
A: 檢查圖片清晰度，或使用手動調整功能。

## 相關文檔

- [完整文檔](./SOUP_COMPONENT_DETECTION_README.md)
- [使用示例](./ComponentDetectionEngine.soup.example.ts)
- [測試文件](./__tests__/ComponentDetectionEngine.soup.test.ts)
