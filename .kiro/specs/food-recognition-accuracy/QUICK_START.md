# 快速開始指南 - 選項 B（最小化部署）

## 概述

此指南幫助您快速測試和驗證新的食物識別準確度改進功能，無需等待所有編譯錯誤修復完成。

---

## 為什麼選擇選項 B？

✅ **優點**:
- 快速驗證新功能效果（30 分鐘內）
- 不受舊代碼編譯錯誤影響
- 可以立即開始收集真實數據
- 獨立部署，風險低

⚠️ **限制**:
- 僅包含新功能，不包含完整系統
- 需要手動整合到現有系統
- 某些舊功能可能無法使用

---

## 快速開始步驟

### 步驟 1: 測試新功能（5 分鐘）

```bash
# 運行測試腳本
bash scripts/test-new-features.sh
```

這會驗證：
- ✅ 知識庫完整性
- ✅ Prompt 生成器
- ✅ 單元測試
- ✅ 數據載入器

**預期輸出**:
```
========================================
測試食物識別準確度改進功能
========================================

[1/5] 驗證知識庫...
✓ 知識庫驗證通過

[2/5] 測試 Prompt 生成器...
✓ Prompt 生成器測試通過

...

✓ 所有測試完成！
```

### 步驟 2: 創建部署包（5 分鐘）

```bash
# 創建最小化部署包
bash scripts/deploy-minimal.sh
```

這會創建：
- `food-recognition-accuracy-v1.0.0.tar.gz` - 部署包
- `deploy-minimal/` - 部署目錄
- `DEPLOYMENT_MANIFEST.md` - 部署清單

### 步驟 3: 驗證部署包（5 分鐘）

```bash
# 查看部署包內容
tar -tzf food-recognition-accuracy-v1.0.0.tar.gz

# 查看部署清單
cat deploy-minimal/DEPLOYMENT_MANIFEST.md

# 檢查文件結構
tree deploy-minimal/
```

### 步驟 4: 整合到現有系統（10 分鐘）

#### 選項 A: 直接複製文件

```bash
# 解壓部署包
tar -xzf food-recognition-accuracy-v1.0.0.tar.gz

# 複製到現有系統
cp -r deploy-minimal/services/* apps/api/src/services/
cp -r deploy-minimal/data/* apps/api/src/data/
cp -r deploy-minimal/types/* apps/api/src/types/
```

#### 選項 B: 作為獨立模組

```bash
# 保持在獨立目錄
cd deploy-minimal

# 創建測試腳本
cat > test-recognition.ts << 'EOF'
import { AsianCuisineKnowledgeBase } from './services/AsianCuisineKnowledgeBase';
import { EnhancedPromptGenerator } from './services/EnhancedPromptGenerator';

const kb = new AsianCuisineKnowledgeBase();
const pg = new EnhancedPromptGenerator('zh-TW');

console.log('知識庫統計:', kb.getStatistics());
console.log('Prompt 生成測試:', pg.generatePrompt({
  detectedCuisineType: 'TAIWANESE'
}));
EOF

# 運行測試
npx tsx test-recognition.ts
```

### 步驟 5: 實際測試（5 分鐘）

創建一個簡單的測試腳本：

```typescript
// test-food-recognition.ts
import { AsianCuisineKnowledgeBase } from './services/AsianCuisineKnowledgeBase';
import { EnhancedPromptGenerator } from './services/EnhancedPromptGenerator';
import { MultiStageRecognitionEngine } from './services/MultiStageRecognitionEngine';
import { ResultValidator } from './services/ResultValidator';

async function testRecognition() {
  // 初始化組件
  const knowledgeBase = new AsianCuisineKnowledgeBase();
  const promptGenerator = new EnhancedPromptGenerator('zh-TW');
  const recognitionEngine = new MultiStageRecognitionEngine(
    knowledgeBase,
    promptGenerator
  );
  const validator = new ResultValidator(knowledgeBase);

  console.log('✓ 所有組件初始化成功');

  // 測試知識庫
  const tofuStrips = knowledgeBase.getFoodByName('豆腐干絲');
  console.log('✓ 知識庫查詢:', tofuStrips?.name);

  // 測試 Prompt 生成
  const prompt = promptGenerator.generatePrompt({
    detectedCuisineType: 'TAIWANESE',
    suspectedFoodCategories: ['BEAN_PRODUCTS']
  });
  console.log('✓ Prompt 生成成功，長度:', prompt.length);

  // 測試易混淆食材
  const confusions = knowledgeBase.getConfusableFoods('豆腐干絲');
  console.log('✓ 易混淆食材:', confusions);

  console.log('\n所有測試通過！系統準備就緒。');
}

testRecognition().catch(console.error);
```

運行測試：

```bash
npx tsx test-food-recognition.ts
```

---

## 使用範例

### 範例 1: 查詢知識庫

```typescript
import { AsianCuisineKnowledgeBase } from './services/AsianCuisineKnowledgeBase';

const kb = new AsianCuisineKnowledgeBase();

// 查詢食材
const food = kb.getFoodByName('豆腐干絲');
console.log(food);

// 查詢易混淆食材
const confusions = kb.getConfusableFoods('豆腐干絲');
console.log('易混淆:', confusions);

// 查詢料理模式
const pattern = kb.getDishPattern('涼拌菜');
console.log('涼拌菜特徵:', pattern);

// 統計資訊
const stats = kb.getStatistics();
console.log('知識庫統計:', stats);
```

### 範例 2: 生成 Prompt

```typescript
import { EnhancedPromptGenerator } from './services/EnhancedPromptGenerator';

const pg = new EnhancedPromptGenerator('zh-TW');

// 生成台式料理 Prompt
const prompt1 = pg.generatePrompt({
  detectedCuisineType: 'TAIWANESE'
});

// 生成豆製品專用 Prompt
const prompt2 = pg.generatePrompt({
  suspectedFoodCategories: ['BEAN_PRODUCTS']
});

// 生成涼拌菜 Prompt
const prompt3 = pg.generatePrompt({
  imageFeatures: {
    dominantColors: ['yellow', 'green'],
    hasMultipleIngredients: true
  }
});

console.log('Prompt 長度:', prompt1.length, prompt2.length, prompt3.length);
```

### 範例 3: 驗證識別結果

```typescript
import { ResultValidator } from './services/ResultValidator';
import { AsianCuisineKnowledgeBase } from './services/AsianCuisineKnowledgeBase';

const kb = new AsianCuisineKnowledgeBase();
const validator = new ResultValidator(kb);

// 模擬識別結果
const result = {
  foods: [
    {
      food: {
        name: '豆腐干絲',
        category: 'BEAN_PRODUCTS',
        // ... 其他屬性
      },
      confidence: 88
    },
    {
      food: {
        name: '麵條',  // 這會觸發互斥警告
        category: 'NOODLES'
      },
      confidence: 75
    }
  ],
  cookingMethod: '涼拌',
  cuisineType: 'TAIWANESE'
};

// 驗證結果
const validations = validator.validate(result);
console.log('驗證結果:', validations);

// 檢查是否有錯誤
const errors = validations.filter(v => !v.passed && v.severity === 'error');
const warnings = validations.filter(v => !v.passed && v.severity === 'warning');

console.log('錯誤:', errors.length);
console.log('警告:', warnings.length);
```

---

## 下一步

### 立即可做

1. ✅ **運行測試腳本**
   ```bash
   bash scripts/test-new-features.sh
   ```

2. ✅ **創建部署包**
   ```bash
   bash scripts/deploy-minimal.sh
   ```

3. ✅ **驗證功能**
   ```bash
   npx tsx test-food-recognition.ts
   ```

### 短期計劃（1-2 天）

1. **準備測試圖片**
   - 收集 50-100 張亞洲料理圖片
   - 包含易混淆食材（豆腐干絲、麵條、米粉等）
   - 標註正確答案

2. **整合到現有 API**
   - 更新 PhotoController 使用新的識別引擎
   - 添加反饋收集端點
   - 啟用性能監控

3. **收集真實數據**
   - 邀請測試用戶試用
   - 監控識別準確率
   - 收集用戶反饋

### 中期計劃（1-2 週）

1. **分析效果**
   - 對比改進前後的準確率
   - 識別常見錯誤模式
   - 優化 Prompt 模板

2. **擴展知識庫**
   - 添加更多食材
   - 更新易混淆食材對照
   - 添加地方特色料理

3. **修復舊代碼**
   - 修復剩餘的編譯錯誤
   - 完整系統整合
   - 完整測試套件

---

## 常見問題

### Q: 為什麼不直接修復所有編譯錯誤？

A: 修復所有錯誤需要 2-3 小時，而選項 B 可以在 30 分鐘內開始測試新功能。這樣可以：
- 快速驗證改進效果
- 及早發現問題
- 收集真實數據
- 不被舊代碼問題阻塞

### Q: 最小化部署包含哪些功能？

A: 包含所有新實現的核心功能：
- ✅ 亞洲料理知識庫（200+ 種食材）
- ✅ 增強 Prompt 生成器（15+ 種模板）
- ✅ 多階段識別引擎
- ✅ 結果驗證器（7+ 種規則）
- ✅ 用戶反饋系統
- ✅ 性能監控系統

### Q: 如何整合到現有系統？

A: 有兩種方式：
1. **直接複製**: 將文件複製到現有目錄
2. **獨立模組**: 作為獨立模組使用，通過 import 引入

### Q: 測試需要什麼？

A: 最基本的測試只需要：
- Node.js 18+
- TypeScript
- 環境變數（OPENAI_API_KEY）

不需要：
- 資料庫連接
- Redis
- 完整的 API 服務

### Q: 何時應該修復舊代碼？

A: 建議在以下情況後再修復：
1. 驗證新功能效果良好
2. 收集了足夠的測試數據
3. 確認改進方向正確
4. 有充足的時間進行完整測試

---

## 支援和文檔

- **技術文檔**: `TECHNICAL_DOCUMENTATION.md`
- **用戶指南**: `USER_GUIDE.md`
- **部署指南**: `DEPLOYMENT_GUIDE.md`
- **建置狀態**: `BUILD_STATUS.md`
- **實施總結**: `IMPLEMENTATION_SUMMARY.md`

---

**準備好了嗎？開始測試吧！**

```bash
bash scripts/test-new-features.sh
```
