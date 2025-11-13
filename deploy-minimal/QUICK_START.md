# 快速開始指南

## 🚀 5 分鐘快速部署

### 1. 解壓部署包

```bash
tar -xzf food-recognition-accuracy-v1.0.0.tar.gz
cd deploy-minimal
```

### 2. 查看文件結構

```bash
tree -L 2
```

預期輸出：
```
deploy-minimal/
├── services/          # 13 個核心服務
├── data/             # 食材和料理數據
├── types/            # TypeScript 類型定義
├── docs/             # 完整文檔
├── DEPLOYMENT_MANIFEST.md
└── QUICK_START.md
```

### 3. 整合到您的項目

#### 選項 A：複製到現有項目

```bash
# 假設您的項目結構是 src/services/
cp -r services/* /path/to/your/project/src/services/
cp -r data/* /path/to/your/project/src/data/
cp -r types/* /path/to/your/project/src/types/
```

#### 選項 B：作為獨立模組使用

```bash
# 在您的項目中引用
import { AsianCuisineKnowledgeBase } from './deploy-minimal/services/AsianCuisineKnowledgeBase';
```

### 4. 配置環境變數

在您的 `.env` 文件中添加：

```env
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o
RECOGNITION_CONFIDENCE_THRESHOLD=85
```

### 5. 開始使用

#### 基本使用範例

```typescript
import { AsianCuisineKnowledgeBase } from './services/AsianCuisineKnowledgeBase';
import { EnhancedPromptGenerator } from './services/EnhancedPromptGenerator';
import { MultiStageRecognitionEngine } from './services/MultiStageRecognitionEngine';

// 初始化組件
const knowledgeBase = new AsianCuisineKnowledgeBase();
const promptGenerator = new EnhancedPromptGenerator('zh-TW');
const recognitionEngine = new MultiStageRecognitionEngine(
  knowledgeBase,
  promptGenerator
);

// 識別食物
async function recognizeFood(imageBuffer: Buffer) {
  const result = await recognitionEngine.recognize(imageBuffer);
  
  console.log('識別結果:', result.items);
  console.log('信心度:', result.confidence);
  console.log('營養資訊:', result.nutrition);
  
  return result;
}
```

#### 進階功能

```typescript
// 1. 使用結果驗證器
import { ResultValidator } from './services/ResultValidator';

const validator = new ResultValidator();
const validatedResult = await validator.validate(recognitionResult);

// 2. 收集用戶反饋
import { FeedbackCollector } from './services/FeedbackCollector';

const feedbackCollector = new FeedbackCollector();
await feedbackCollector.collectFeedback({
  recognitionId: result.id,
  userCorrection: '這是滷肉飯，不是炒飯',
  rating: 3
});

// 3. 性能監控
import { FoodRecognitionPerformanceMonitor } from './services/FoodRecognitionPerformanceMonitor';

const monitor = new FoodRecognitionPerformanceMonitor();
monitor.trackRecognition(result);
const metrics = monitor.getMetrics();
```

## 📚 下一步

### 深入了解

1. **技術文檔** - 了解系統架構和設計
   ```bash
   cat docs/TECHNICAL_DOCUMENTATION.md
   ```

2. **用戶指南** - 學習所有功能的使用方法
   ```bash
   cat docs/USER_GUIDE.md
   ```

3. **部署指南** - 生產環境部署最佳實踐
   ```bash
   cat docs/DEPLOYMENT_GUIDE.md
   ```

### 測試功能

```bash
# 查看知識庫內容
npx tsx -e "
import { AsianCuisineKnowledgeBase } from './services/AsianCuisineKnowledgeBase.ts';
const kb = new AsianCuisineKnowledgeBase();
console.log('食材數量:', kb.getAllIngredients().length);
console.log('料理模式:', kb.getDishPatterns().length);
"

# 測試 Prompt 生成
npx tsx -e "
import { EnhancedPromptGenerator } from './services/EnhancedPromptGenerator.ts';
const gen = new EnhancedPromptGenerator('zh-TW');
console.log(gen.generateInitialPrompt());
"
```

## 🔧 故障排除

### 常見問題

**Q: 找不到模組？**
```bash
# 確保安裝了必要的依賴
npm install openai
```

**Q: TypeScript 編譯錯誤？**
```bash
# 確保 tsconfig.json 配置正確
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "esModuleInterop": true
  }
}
```

**Q: OpenAI API 錯誤？**
```bash
# 檢查 API Key 是否正確設置
echo $OPENAI_API_KEY
```

## 📊 功能特性

✅ **亞洲料理知識庫** - 200+ 種食材，50+ 種料理模式  
✅ **多階段識別引擎** - 初步識別 → 詳細分析 → 結果驗證  
✅ **智能 Prompt 生成** - 根據上下文動態生成最佳提示詞  
✅ **結果驗證系統** - 自動驗證識別結果的合理性  
✅ **反饋學習機制** - 從用戶反饋中持續改進  
✅ **性能監控** - 實時追蹤識別準確度和性能指標  
✅ **快取優化** - 減少重複識別的 API 調用  

## 💡 使用建議

1. **從簡單開始** - 先使用基本的識別功能
2. **逐步整合** - 根據需求添加進階功能
3. **監控性能** - 使用性能監控工具追蹤效果
4. **收集反饋** - 啟用反饋系統持續改進
5. **查看文檔** - 遇到問題時參考詳細文檔

## 📞 支援

- 技術問題：查看 `docs/TECHNICAL_DOCUMENTATION.md`
- 使用問題：查看 `docs/USER_GUIDE.md`
- 部署問題：查看 `docs/DEPLOYMENT_GUIDE.md`

---

**版本**: 1.0.0  
**最後更新**: 2025-11-13  
**授權**: MIT
