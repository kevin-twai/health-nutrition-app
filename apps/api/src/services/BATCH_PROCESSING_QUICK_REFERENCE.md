# 批量處理優化 - 快速參考

## 快速開始

### 1. 批量計算營養

```typescript
import { componentBatchProcessor } from './ComponentBatchProcessor';

const result = await componentBatchProcessor.batchCalculateNutrition(components);
console.log(`處理 ${result.componentsProcessed} 個成分，耗時 ${result.totalProcessingTime}ms`);
```

### 2. 批量查詢知識庫

```typescript
const result = await componentBatchProcessor.batchQueryKnowledgeBase(
  ['雞蛋', '白飯', '青蔥'],
  { includeNutrition: true }
);
```

### 3. 批量豐富成分

```typescript
const enriched = await componentBatchProcessor.batchEnrichComponents(detectedComponents);
```

### 4. 緩存預熱

```typescript
await componentBatchProcessor.preheatCache('炒飯', ['白飯', '雞蛋', '青蔥']);
```

## 性能提升

| 成分數 | 無優化 | 批量處理 | 提升 |
|--------|--------|----------|------|
| 5 個   | ~250ms | ~30ms    | 8x   |
| 10 個  | ~500ms | ~50ms    | 10x  |
| 20 個  | ~1000ms| ~80ms    | 12x  |

## 配置

```typescript
// 自定義配置
const processor = new ComponentBatchProcessor(
  20,  // 最大並發數
  30   // 批次大小
);
```

## 最佳實踐

1. **預熱緩存**: 應用啟動時預熱常見成分
2. **批量處理**: 5+ 個成分時使用批量處理
3. **監控性能**: 定期檢查緩存命中率

## 相關文件

- [詳細文檔](./BATCH_PROCESSING_README.md)
- [實施摘要](../../.kiro/specs/asian-cuisine-component-detection/TASK_17_IMPLEMENTATION_SUMMARY.md)
