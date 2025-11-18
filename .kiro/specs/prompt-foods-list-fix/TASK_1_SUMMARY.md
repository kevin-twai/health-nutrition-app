# Task 1 實施總結

## 任務：修改亞洲料理通用模板（createAsianCuisineTemplate）

### 完成日期
2025-11-18

### 修改內容

#### 1. 移除限制性語句 ✅
- 移除了「foods 列表必須包含 description 中提到的食材」這類限制性語句
- 改為強調 foods 列表的獨立性

#### 2. 添加核心任務說明 ✅
- 在 prompt 最前面添加「## 核心任務（最優先）」區塊
- 明確說明：「你的首要任務是：仔細觀察圖片，識別並列出所有可見的食材到 foods 列表中」

#### 3. 添加識別步驟 ✅
添加了「## 識別步驟（請按順序執行）」區塊，包含四個步驟：
- 步驟 1：仔細觀察圖片
- 步驟 2：識別每一種食材
- 步驟 3：估算份量
- 步驟 4：撰寫描述

#### 4. 添加完整性檢查清單 ✅
添加了「## 完整性檢查清單」區塊，包含 7 個檢查項目：
- 已識別所有可見的主要食材
- 已識別所有可見的配菜
- 已識別所有可見的小配料
- 已識別調味料或醬汁
- foods 列表中至少有 3 種食材
- 每種食材都有合理的份量估算
- 沒有遺漏任何明顯可見的食材

#### 5. 重新組織 prompt 結構 ✅
新的結構順序：
1. 核心任務（最優先）
2. 識別步驟
3. 食材識別重點
4. JSON 格式說明
5. 完整性檢查清單
6. 重要原則
7. 範例

### 新增的重要原則

1. **foods 列表是獨立的結構化數據**
   - 必須包含圖片中的所有可見食材
   - 即使某個食材在 description 中未提及，只要在圖片中可見，就必須加入 foods 列表
   - foods 列表是營養計算的基礎，必須完整準確

2. **description 是補充說明**
   - 用於描述整體料理特色、烹飪方式、口味等
   - 不應限制或影響 foods 列表的內容

3. **識別所有食材，不只是主要食材**
   - 如果是拼盤或小菜，請列出所有食材
   - 小配料（蔥花、香菜、芝麻等）也要列出

### 新增的範例

#### 範例 1：涼拌干絲
foods 列表應包含：
- 豆腐干絲（80g）
- 芹菜絲（20g）
- 胡蘿蔔絲（15g）
- 香菜（5g）
- 麻油（5ml）

#### 範例 2：味噌湯
foods 列表應包含：
- 味噌湯底（250ml）
- 豆腐（30g）
- 海帶芽（10g）
- 蔥花（5g）

### 測試結果

#### 新增測試
創建了 `EnhancedPromptGenerator.asian-cuisine-fix.test.ts`，包含 14 個測試案例：
- ✅ 所有測試通過

#### 現有測試
- ✅ 修復了 1 個失敗的測試（更新了期望值）
- ✅ 所有 26 個現有測試通過

### 修改的檔案

1. `apps/api/src/services/EnhancedPromptGenerator.ts`
   - 修改了 `createAsianCuisineTemplate()` 方法（中文和英文版本）

2. `apps/api/src/services/__tests__/EnhancedPromptGenerator.test.ts`
   - 修復了一個測試案例

3. `apps/api/src/services/__tests__/EnhancedPromptGenerator.asian-cuisine-fix.test.ts`
   - 新增測試檔案，驗證修復效果

### 符合的需求

- ✅ Requirement 1.1: 生成的 prompt 明確要求 AI 優先識別圖片中的所有可見食材
- ✅ Requirement 1.2: 確保 prompt 不會限制 foods 列表只包含 description 中提到的食材
- ✅ Requirement 1.3: 要求 AI 列出每一種可見的食材
- ✅ Requirement 1.4: 範例展示如何識別多種食材
- ✅ Requirement 1.5: 移除了暗示「foods 列表必須與 description 一致」的語句
- ✅ Requirement 3.1: 將「識別所有食材」的指示放在「撰寫描述」之前
- ✅ Requirement 3.2: 使用強調語氣標註食材識別的重要性
- ✅ Requirement 3.3: 將食材識別列為第一步驟
- ✅ Requirement 3.4: 移除了可能被解讀為「description 比 foods 列表更重要」的語句
- ✅ Requirement 3.5: 明確說明「foods 列表是營養計算的基礎，必須完整準確」

### 預期效果

修改後的 prompt 應該能夠：
1. 引導 AI 優先識別圖片中的所有食材
2. 避免 AI 因為 description 簡短而減少 foods 列表中的食材
3. 提高複雜料理（如涼拌菜、湯品）的食材識別完整度
4. 確保小配料（蔥花、香菜等）也被識別出來

### 下一步

繼續執行 Task 2：修改湯品識別模板（createSoupPrompt）
