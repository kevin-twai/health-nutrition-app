# 🚀 食物識別準確度改進 - Step by Step 部署指南

## 📋 目錄

1. [部署前準備](#部署前準備)
2. [方案 A：整合到現有項目](#方案-a整合到現有項目)
3. [方案 B：獨立測試部署](#方案-b獨立測試部署)
4. [驗證部署](#驗證部署)
5. [故障排除](#故障排除)

---

## 部署前準備

### Step 1: 確認部署包存在

```bash
# 檢查部署包
ls -lh food-recognition-accuracy-v1.0.0.tar.gz

# 預期輸出: -rw-r--r-- ... 141K ... food-recognition-accuracy-v1.0.0.tar.gz
```

如果部署包不存在，運行：
```bash
bash scripts/deploy-minimal.sh
```

### Step 2: 驗證部署包完整性

```bash
# 運行驗證腳本
bash verify-deployment-package.sh

# 預期輸出: ✓ 部署包驗證通過！
```

### Step 3: 準備環境變數

確保您的 `.env` 文件包含以下配置：

```bash
# 檢查環境變數
cat .env | grep OPENAI_API_KEY

# 如果沒有，添加以下內容到 .env
echo "OPENAI_API_KEY=your-api-key-here" >> .env
echo "OPENAI_MODEL=gpt-4o" >> .env
echo "RECOGNITION_CONFIDENCE_THRESHOLD=85" >> .env
```

---

## 方案 A：整合到現有項目

### Step 1: 解壓部署包

```bash
# 解壓到當前目錄
tar -xzf food-recognition-accuracy-v1.0.0.tar.gz

# 查看解壓內容
ls -la deploy-minimal/
```

### Step 2: 備份現有文件（重要！）

```bash
# 創建備份目錄
mkdir -p backups/$(date +%Y%m%d_%H%M%S)

# 備份可能被覆蓋的文件
cp -r apps/api/src/services backups/$(date +%Y%m%d_%H%M%S)/services_backup
cp -r apps/api/src/data backups/$(date +%Y%m%d_%H%M%S)/data_backup
cp -r apps/api/src/types backups/$(date +%Y%m%d_%H%M%S)/types_backup

echo "✓ 備份完成"
```

### Step 3: 複製服務文件

```bash
# 複製核心服務文件到項目中
cp deploy-minimal/services/AsianCuisineKnowledgeBase.ts apps/api/src/services/
cp deploy-minimal/services/EnhancedPromptGenerator.ts apps/api/src/services/
cp deploy-minimal/services/MultiStageRecognitionEngine.ts apps/api/src/services/
cp deploy-minimal/services/ResultValidator.ts apps/api/src/services/
cp deploy-minimal/services/AsianCuisineValidationRules.ts apps/api/src/services/
cp deploy-minimal/services/NutritionValidationRules.ts apps/api/src/services/
cp deploy-minimal/services/FeedbackCollector.ts apps/api/src/services/
cp deploy-minimal/services/FeedbackAnalyzer.ts apps/api/src/services/
cp deploy-minimal/services/FeedbackImprover.ts apps/api/src/services/
cp deploy-minimal/services/FoodRecognitionPerformanceMonitor.ts apps/api/src/services/
cp deploy-minimal/services/FoodRecognitionLogger.ts apps/api/src/services/
cp deploy-minimal/services/RecognitionResultCache.ts apps/api/src/services/
cp deploy-minimal/services/KnowledgeBaseQueryOptimizer.ts apps/api/src/services/

echo "✓ 服務文件複製完成 (13 個文件)"
```

### Step 4: 複製數據文件

```bash
# 複製數據文件
cp deploy-minimal/data/asianFoodItems.ts apps/api/src/data/
cp deploy-minimal/data/asianFoodItemsExtended.ts apps/api/src/data/
cp deploy-minimal/data/dishPatterns.ts apps/api/src/data/
cp deploy-minimal/data/index.ts apps/api/src/data/

echo "✓ 數據文件複製完成 (4 個文件)"
```

### Step 5: 複製類型定義

```bash
# 複製類型定義文件
cp deploy-minimal/types/AsianCuisineKnowledgeBase.ts apps/api/src/types/

echo "✓ 類型定義複製完成 (1 個文件)"
```

### Step 6: 安裝依賴（如果需要）

```bash
# 進入 API 目錄
cd apps/api

# 安裝 OpenAI SDK（如果還沒安裝）
npm install openai

# 返回根目錄
cd ../..

echo "✓ 依賴安裝完成"
```

### Step 7: 驗證整合

```bash
# 檢查文件是否正確複製
echo "檢查服務文件..."
ls apps/api/src/services/AsianCuisineKnowledgeBase.ts
ls apps/api/src/services/EnhancedPromptGenerator.ts
ls apps/api/src/services/MultiStageRecognitionEngine.ts

echo "檢查數據文件..."
ls apps/api/src/data/asianFoodItems.ts
ls apps/api/src/data/dishPatterns.ts

echo "✓ 文件驗證完成"
```

### Step 8: 測試基本功能

```bash
# 測試知識庫載入
npx tsx -e "
import { AsianCuisineKnowledgeBase } from './apps/api/src/services/AsianCuisineKnowledgeBase';
const kb = new AsianCuisineKnowledgeBase();
console.log('✓ 知識庫載入成功');
console.log('食材數量:', kb.getAllIngredients().length);
console.log('料理模式:', kb.getDishPatterns().length);
"
```

### Step 9: 更新現有的 PhotoController（可選）

如果您想在現有的照片識別功能中使用新的引擎，需要更新 `PhotoController.ts`：

```typescript
// 在 apps/api/src/controllers/PhotoController.ts 中添加

import { AsianCuisineKnowledgeBase } from '../services/AsianCuisineKnowledgeBase';
import { EnhancedPromptGenerator } from '../services/EnhancedPromptGenerator';
import { MultiStageRecognitionEngine } from '../services/MultiStageRecognitionEngine';

// 在 PhotoController 類中初始化
private knowledgeBase = new AsianCuisineKnowledgeBase();
private promptGenerator = new EnhancedPromptGenerator('zh-TW');
private recognitionEngine = new MultiStageRecognitionEngine(
  this.knowledgeBase,
  this.promptGenerator
);

// 在識別方法中使用
async recognizeFood(imageBuffer: Buffer) {
  const result = await this.recognitionEngine.recognize(imageBuffer);
  return result;
}
```

### Step 10: 重啟服務

```bash
# 如果使用 Docker
docker-compose restart api

# 或者如果直接運行
# 停止現有服務，然後重新啟動
npm run dev
```

---

## 方案 B：獨立測試部署

### Step 1: 解壓到測試目錄

```bash
# 創建測試目錄
mkdir -p test-deployment
cd test-deployment

# 解壓部署包
tar -xzf ../food-recognition-accuracy-v1.0.0.tar.gz
cd deploy-minimal

echo "✓ 解壓完成"
```

### Step 2: 查看文件結構

```bash
# 查看目錄結構
tree -L 2

# 或使用 ls
ls -la
ls -la services/
ls -la data/
ls -la docs/
```

### Step 3: 閱讀文檔

```bash
# 查看 README
cat README.md

# 查看快速開始指南
cat QUICK_START.md

# 查看部署清單
cat DEPLOYMENT_MANIFEST.md
```

### Step 4: 設置環境變數

```bash
# 創建 .env 文件
cat > .env << EOF
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o
RECOGNITION_CONFIDENCE_THRESHOLD=85
EOF

echo "✓ 環境變數設置完成"
```

### Step 5: 測試知識庫

```bash
# 測試知識庫載入
npx tsx -e "
import { AsianCuisineKnowledgeBase } from './services/AsianCuisineKnowledgeBase.ts';
const kb = new AsianCuisineKnowledgeBase();
console.log('✓ 知識庫載入成功');
console.log('食材數量:', kb.getAllIngredients().length);
console.log('料理模式:', kb.getDishPatterns().length);

// 測試查詢功能
const rice = kb.getIngredientByName('白飯');
console.log('白飯資訊:', rice);
"
```

### Step 6: 測試 Prompt 生成器

```bash
# 測試 Prompt 生成
npx tsx -e "
import { EnhancedPromptGenerator } from './services/EnhancedPromptGenerator.ts';
const generator = new EnhancedPromptGenerator('zh-TW');
console.log('✓ Prompt 生成器初始化成功');
console.log('初始 Prompt:');
console.log(generator.generateInitialPrompt());
"
```

### Step 7: 創建測試腳本

```bash
# 創建測試腳本
cat > test-recognition.ts << 'EOF'
import { AsianCuisineKnowledgeBase } from './services/AsianCuisineKnowledgeBase';
import { EnhancedPromptGenerator } from './services/EnhancedPromptGenerator';
import { MultiStageRecognitionEngine } from './services/MultiStageRecognitionEngine';
import { ResultValidator } from './services/ResultValidator';

async function testRecognition() {
  console.log('🧪 開始測試食物識別系統...\n');

  // 1. 初始化組件
  console.log('1️⃣ 初始化組件...');
  const knowledgeBase = new AsianCuisineKnowledgeBase();
  const promptGenerator = new EnhancedPromptGenerator('zh-TW');
  const recognitionEngine = new MultiStageRecognitionEngine(
    knowledgeBase,
    promptGenerator
  );
  const validator = new ResultValidator();
  console.log('✓ 組件初始化完成\n');

  // 2. 測試知識庫
  console.log('2️⃣ 測試知識庫...');
  const ingredients = knowledgeBase.getAllIngredients();
  const patterns = knowledgeBase.getDishPatterns();
  console.log(`✓ 載入 ${ingredients.length} 種食材`);
  console.log(`✓ 載入 ${patterns.length} 種料理模式\n`);

  // 3. 測試 Prompt 生成
  console.log('3️⃣ 測試 Prompt 生成...');
  const prompt = promptGenerator.generateInitialPrompt();
  console.log('✓ Prompt 生成成功');
  console.log(`Prompt 長度: ${prompt.length} 字元\n`);

  // 4. 測試結果驗證器
  console.log('4️⃣ 測試結果驗證器...');
  const mockResult = {
    items: [
      {
        name: '白飯',
        portion: '1 碗',
        calories: 280,
        protein: 5,
        carbs: 62,
        fat: 0.5
      }
    ],
    confidence: 90,
    language: 'zh-TW'
  };
  
  const validationResult = await validator.validate(mockResult);
  console.log('✓ 驗證器測試完成');
  console.log('驗證結果:', validationResult.isValid ? '通過' : '失敗');
  
  if (validationResult.warnings.length > 0) {
    console.log('警告:', validationResult.warnings);
  }
  
  console.log('\n✅ 所有測試完成！');
  console.log('系統已準備就緒，可以開始使用。');
}

testRecognition().catch(console.error);
EOF

echo "✓ 測試腳本創建完成"
```

### Step 8: 運行測試

```bash
# 運行測試腳本
npx tsx test-recognition.ts
```

### Step 9: 查看技術文檔

```bash
# 查看完整技術文檔
cat docs/TECHNICAL_DOCUMENTATION.md

# 查看用戶指南
cat docs/USER_GUIDE.md

# 查看部署指南
cat docs/DEPLOYMENT_GUIDE.md
```

---

## 驗證部署

### 驗證清單

運行以下命令確認部署成功：

```bash
# 1. 檢查文件存在
echo "檢查服務文件..."
test -f apps/api/src/services/AsianCuisineKnowledgeBase.ts && echo "✓ AsianCuisineKnowledgeBase.ts"
test -f apps/api/src/services/EnhancedPromptGenerator.ts && echo "✓ EnhancedPromptGenerator.ts"
test -f apps/api/src/services/MultiStageRecognitionEngine.ts && echo "✓ MultiStageRecognitionEngine.ts"

echo "檢查數據文件..."
test -f apps/api/src/data/asianFoodItems.ts && echo "✓ asianFoodItems.ts"
test -f apps/api/src/data/dishPatterns.ts && echo "✓ dishPatterns.ts"

# 2. 檢查環境變數
echo "檢查環境變數..."
grep -q "OPENAI_API_KEY" .env && echo "✓ OPENAI_API_KEY 已設置"

# 3. 測試導入
echo "測試模組導入..."
npx tsx -e "
import { AsianCuisineKnowledgeBase } from './apps/api/src/services/AsianCuisineKnowledgeBase';
console.log('✓ 模組導入成功');
"

echo ""
echo "✅ 部署驗證完成！"
```

### 功能測試

創建一個簡單的測試腳本：

```bash
cat > test-deployment.ts << 'EOF'
import { AsianCuisineKnowledgeBase } from './apps/api/src/services/AsianCuisineKnowledgeBase';
import { EnhancedPromptGenerator } from './apps/api/src/services/EnhancedPromptGenerator';

console.log('🧪 測試部署...\n');

// 測試知識庫
const kb = new AsianCuisineKnowledgeBase();
console.log('✓ 知識庫初始化成功');
console.log(`  - 食材數量: ${kb.getAllIngredients().length}`);
console.log(`  - 料理模式: ${kb.getDishPatterns().length}`);

// 測試 Prompt 生成器
const gen = new EnhancedPromptGenerator('zh-TW');
console.log('✓ Prompt 生成器初始化成功');

// 測試查詢
const rice = kb.getIngredientByName('白飯');
console.log('✓ 查詢功能正常');
console.log(`  - 找到食材: ${rice?.name}`);

console.log('\n✅ 部署測試通過！');
EOF

npx tsx test-deployment.ts
```

---

## 故障排除

### 問題 1: 找不到模組

**錯誤**: `Cannot find module './services/AsianCuisineKnowledgeBase'`

**解決方案**:
```bash
# 檢查文件是否存在
ls apps/api/src/services/AsianCuisineKnowledgeBase.ts

# 如果不存在，重新複製
cp deploy-minimal/services/AsianCuisineKnowledgeBase.ts apps/api/src/services/
```

### 問題 2: TypeScript 編譯錯誤

**錯誤**: TypeScript 類型錯誤

**解決方案**:
```bash
# 檢查 tsconfig.json
cat apps/api/tsconfig.json

# 確保包含以下配置
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

### 問題 3: OpenAI API 錯誤

**錯誤**: `OpenAI API key not found`

**解決方案**:
```bash
# 檢查環境變數
echo $OPENAI_API_KEY

# 如果為空，設置環境變數
export OPENAI_API_KEY="your-api-key-here"

# 或添加到 .env 文件
echo "OPENAI_API_KEY=your-api-key-here" >> .env
```

### 問題 4: 依賴缺失

**錯誤**: `Cannot find package 'openai'`

**解決方案**:
```bash
# 安裝 OpenAI SDK
cd apps/api
npm install openai
cd ../..
```

### 問題 5: 數據文件載入失敗

**錯誤**: `Cannot load data files`

**解決方案**:
```bash
# 檢查數據文件
ls -la apps/api/src/data/

# 重新複製數據文件
cp deploy-minimal/data/*.ts apps/api/src/data/
```

---

## 📞 獲取幫助

如果遇到問題：

1. **查看文檔**
   ```bash
   cat deploy-minimal/docs/USER_GUIDE.md
   cat deploy-minimal/docs/TECHNICAL_DOCUMENTATION.md
   ```

2. **檢查日誌**
   ```bash
   # 查看應用日誌
   tail -f logs/app.log
   ```

3. **運行驗證腳本**
   ```bash
   bash verify-deployment-package.sh
   ```

---

## ✅ 部署完成檢查清單

- [ ] 部署包已解壓
- [ ] 服務文件已複製（13 個）
- [ ] 數據文件已複製（4 個）
- [ ] 類型定義已複製（1 個）
- [ ] 環境變數已設置
- [ ] 依賴已安裝
- [ ] 基本功能測試通過
- [ ] 服務已重啟
- [ ] 文檔已閱讀

---

## 🎉 恭喜！

部署完成！您現在可以開始使用食物識別準確度改進功能了。

**下一步**:
1. 閱讀用戶指南了解所有功能
2. 查看技術文檔了解架構
3. 開始整合到您的應用中

**祝您使用愉快！** 🎊
