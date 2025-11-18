# Prompt 系統整合指南

## 概述

本指南說明如何整合 `EnhancedPromptGenerator.ts` 和 `simple-server.js` 中的 prompt 邏輯，創建一個統一且強大的 prompt 生成系統。

## 當前狀況分析

### EnhancedPromptGenerator.ts 的優勢
1. **結構化設計**：使用 TypeScript 類別，易於維護和擴展
2. **模板系統**：支援多種料理類型的專用模板
3. **類型安全**：完整的 TypeScript 類型定義
4. **可配置**：支援動態配置和上下文感知
5. **多語言支援**：內建中英文雙語支援

### simple-server.js 的優勢
1. **詳細的計數指導**：對可數食材有非常詳細的計數警告和指導
2. **完整的檢查清單**：包含蛋類、湯汁、主食等強制檢查項目
3. **精確的份量指南**：提供詳細的標準份量參考
4. **實戰經驗**：經過實際測試，知道哪些食材容易被遺漏
5. **原住民料理支援**：包含台灣原住民料理的詳細識別指南

## 整合策略

### 方案 1：增強 EnhancedPromptGenerator（推薦）

**優點**：
- 保持代碼結構化和可維護性
- 利用 TypeScript 的類型安全
- 易於測試和擴展

**實施步驟**：

1. **添加增強版通用模板**
   ```typescript
   // 在 EnhancedPromptGenerator.ts 中添加
   generateEnhancedUniversalPrompt(): string {
     // 整合 simple-server.js 的詳細指導
   }
   ```

2. **更新 PromptTemplateType 枚舉**
   ```typescript
   export enum PromptTemplateType {
     // ... 現有類型
     ENHANCED_UNIVERSAL = 'enhanced_universal', // 新增
   }
   ```

3. **修改 simple-server.js 使用 EnhancedPromptGenerator**
   ```javascript
   const { EnhancedPromptGenerator } = require('./services/EnhancedPromptGenerator');
   const promptGenerator = new EnhancedPromptGenerator('zh-TW');
   
   // 在 callChatGPTVisionAPI 中使用
   const prompt = promptGenerator.generateEnhancedUniversalPrompt();
   ```

### 方案 2：創建 Prompt 工具函數

**優點**：
- 不需要大幅修改現有代碼
- 可以逐步遷移

**實施步驟**：

1. **創建 promptUtils.ts**
   ```typescript
   export function generateFoodRecognitionPrompt(options: {
     language?: 'zh-TW' | 'en';
     includeCountingWarnings?: boolean;
     includePortionGuide?: boolean;
   }): string {
     // 整合兩個系統的優點
   }
   ```

2. **在 simple-server.js 中使用**
   ```javascript
   const { generateFoodRecognitionPrompt } = require('./utils/promptUtils');
   const prompt = generateFoodRecognitionPrompt({
     language: 'zh-TW',
     includeCountingWarnings: true,
     includePortionGuide: true
   });
   ```

## 具體整合內容

### 1. 計數準確性警告（從 simple-server.js 整合）

```typescript
🚨 **計數準確性警告（極其重要！）**：

對於可數食材（如生蠔、蛋、餃子等），你**必須**：
1. **逐個計數** - 一個一個數，不要估算
2. **在回應中說明你的計數過程** - 例如："我看到5個生蠔殼"
3. **絕對不要猜測或加倍數量** - 如果看到5個就是5個，不是10個
4. **只數可見的完整食材** - 不要數部分遮擋的

❌ **常見錯誤**：實際5個卻報告10個（這是嚴重錯誤！）
✅ **正確做法**：仔細數每一個，確認後再報告
```

### 2. 強制檢查清單（從 simple-server.js 整合）

```typescript
🚨 **強制檢查清單**：
1. **蛋類檢查**：仔細尋找任何蛋類食材（水煮蛋、煎蛋、蛋花等）
2. **湯汁檢查**：是否有湯汁、醬汁、咖喱等液體食材
3. **主食檢查**：是否有米飯、麵條等主食
4. **蔬菜檢查**：是否識別了所有可見的蔬菜
5. **調味料檢查**：是否有明顯的調味料或醬料
```

### 3. 份量計算指南（從 simple-server.js 整合）

```typescript
📏 **份量計算指南**：

**標準份量參考**：
- 1碗白飯 = 150-200克
- 1碗麵條 = 200-250克
- 1份炒青菜 = 80-100克
- 1個水煮蛋 = 50-60克
- 1片雞胸肉 = 100-120克
- 1碗湯 = 200-300毫升
- 1份咖喱醬 = 150-200毫升

**計數方法**：
1. 識別所有可見的食材
2. 一個一個數
3. 再次確認數量
4. 報告精確數字
```

### 4. 原住民料理識別（從 simple-server.js 整合）

```typescript
🇹🇼 **台灣原住民料理特別識別指南**：
- **小米阿粨/阿拜（Abai）**：
  * 外觀：長條形或三角錐形，用綠色葉片包裹
  * 特徵：可能看到綠色葉片包裹，內部是小米和豬肉
- **馬告料理**：
  * 特徵：黑色小顆粒散布在食物上，類似黑胡椒
- **竹筒飯**：
  * 外觀：竹筒容器，內有米飯
```

## 實施計劃

### 階段 1：準備工作（已完成）
- [x] 分析兩個系統的優缺點
- [x] 確定整合策略
- [x] 創建整合指南文檔

### 階段 2：代碼整合（進行中）
- [ ] 在 EnhancedPromptGenerator.ts 中添加 `generateEnhancedUniversalPrompt()` 方法
- [ ] 更新 PromptTemplateType 枚舉
- [ ] 添加單元測試

### 階段 3：遷移 simple-server.js（待進行）
- [ ] 修改 simple-server.js 導入 EnhancedPromptGenerator
- [ ] 替換現有的 prompt 字符串為方法調用
- [ ] 測試功能是否正常

### 階段 4：測試和優化（待進行）
- [ ] 使用真實圖片測試
- [ ] 比較整合前後的識別準確度
- [ ] 根據測試結果優化 prompt

### 階段 5：文檔和部署（待進行）
- [ ] 更新 API 文檔
- [ ] 更新部署指南
- [ ] 通知團隊成員

## 使用示例

### 在 TypeScript/Node.js 中使用

```typescript
import { EnhancedPromptGenerator } from './services/EnhancedPromptGenerator';

// 創建生成器實例
const generator = new EnhancedPromptGenerator('zh-TW');

// 使用增強版通用模板
const prompt = generator.generateEnhancedUniversalPrompt();

// 或使用智能選擇
const smartPrompt = generator.generateSmartPrompt({
  useEnhancedTemplate: true,
  detectedCuisineType: 'TAIWANESE',
  suspectedFoodCategories: ['SOUP']
});
```

### 在 simple-server.js 中使用

```javascript
// 方法 1：直接使用（如果已編譯）
const { EnhancedPromptGenerator } = require('./services/EnhancedPromptGenerator');
const generator = new EnhancedPromptGenerator('zh-TW');
const prompt = generator.generateEnhancedUniversalPrompt();

// 方法 2：使用工具函數（推薦）
const { generateFoodRecognitionPrompt } = require('./utils/simpleVisionHelper');
const prompt = generateFoodRecognitionPrompt();
```

## 維護建議

1. **保持 prompt 的一致性**：所有 prompt 更新應該在 EnhancedPromptGenerator 中進行
2. **版本控制**：為 prompt 添加版本號，便於追蹤變更
3. **A/B 測試**：對新的 prompt 進行 A/B 測試，確保改進效果
4. **收集反饋**：記錄用戶反饋和識別錯誤，持續優化 prompt
5. **文檔更新**：每次 prompt 更新都要更新相關文檔

## 常見問題

### Q1: 為什麼不直接在 simple-server.js 中使用字符串？
A: 使用 EnhancedPromptGenerator 可以：
- 保持代碼 DRY（Don't Repeat Yourself）
- 易於維護和更新
- 支援多語言和多場景
- 便於測試和版本控制

### Q2: 如何確保 TypeScript 代碼可以在 JavaScript 中使用？
A: 需要先編譯 TypeScript：
```bash
npm run build
# 或
tsc
```

### Q3: 如果需要快速修改 prompt 怎麼辦？
A: 可以：
1. 在 EnhancedPromptGenerator 中修改
2. 使用環境變量覆蓋部分內容
3. 創建自定義模板並註冊

### Q4: 整合後性能會受影響嗎？
A: 不會。Prompt 生成是一次性操作，對整體性能影響可忽略不計。

## 下一步

1. **立即行動**：實施階段 2 的代碼整合
2. **測試驗證**：使用測試圖片驗證整合效果
3. **收集反饋**：從團隊和用戶收集反饋
4. **持續優化**：根據反饋持續優化 prompt

## 相關文件

- `apps/api/src/services/EnhancedPromptGenerator.ts` - 主要的 prompt 生成器
- `apps/api/src/simple-server.js` - 簡單服務器實現
- `apps/api/src/utils/simpleVisionHelper.js` - Vision API 輔助函數
- `apps/api/src/services/EnhancedPromptGenerator.README.md` - 詳細文檔

## 總結

通過整合兩個系統的優點，我們可以創建一個：
- ✅ 結構化且易於維護的代碼
- ✅ 詳細且準確的 prompt 指導
- ✅ 支援多種場景和語言
- ✅ 經過實戰驗證的識別邏輯

這將顯著提升食物識別的準確性和用戶體驗。
