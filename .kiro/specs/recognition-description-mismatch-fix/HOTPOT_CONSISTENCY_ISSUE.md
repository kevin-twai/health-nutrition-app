# 火鍋識別一致性問題診斷報告

## 問題描述

**用戶報告時間**: 2025-11-20  
**問題類型**: 識別描述與分析結果不一致

### 具體表現

**識別描述** (Recognition Description):
> "這是一道海鮮火鍋，包含蟹腿、豆腐、白菜、金針菇、豆苗和魚片等食材，搭配清淡的湯底，呈現出豐富的海鮮風味和多層次的口感。"

**問題**: 
- 描述符合圖片內容 ✅
- 但分析結果卻不一致 ❌

### 預期食材列表

根據描述，應該識別出：
1. 🦀 蟹腿
2. 🥛 豆腐
3. 🥬 白菜
4. 🍄 金針菇
5. 🌱 豆苗
6. 🐟 魚片
7. 🍲 湯底

---

## 問題分析

### 1. 已知的修復狀態

#### ✅ 識別一致性修復（已部署）
- **Spec**: `recognition-description-mismatch-fix`
- **狀態**: 已完成並部署到生產環境
- **部署時間**: 2025-11-19
- **修復內容**:
  - ComponentDetectionEngine 接受預識別食物列表
  - PhotoController 傳遞完整的基礎識別結果
  - 避免重複調用 Vision API
  - 確保基礎識別和成分識別結果一致

#### ✅ 豆腐誤識別修復（已部署）
- **Spec**: `tofu-misidentification-fix`
- **狀態**: 已完成並部署
- **部署時間**: 2025-11-19
- **修復內容**:
  - 改進模糊匹配邏輯
  - 防止「豆腐」被誤認為「豆腐干絲」
  - 優先選擇精確匹配和較短名稱

#### ❌ 豆苗數據缺失（未部署）
- **問題**: 營養數據庫中沒有「豆苗」
- **影響**: 即使識別出豆苗，也無法提供營養資訊
- **狀態**: 上次會話中已修復，但未推送到遠端

### 2. 可能的原因

#### 原因 A: 豆苗數據缺失 ⭐ 最可能
**描述**: 營養數據庫中沒有豆苗的營養資訊

**證據**:
- 上次會話檢查發現豆苗不在數據庫中
- 已在本地添加但未推送

**影響**:
- 識別描述可能包含豆苗
- 但營養分析無法找到對應數據
- 導致最終結果中缺少豆苗

**解決方案**: 添加豆苗到營養數據庫

#### 原因 B: 其他食材數據問題
**描述**: 其他食材可能也有類似問題

**需要檢查的食材**:
- 蟹腿 - 需要驗證
- 白菜 - 需要驗證
- 金針菇 - 需要驗證
- 魚片 - 需要驗證

**解決方案**: 驗證並補充缺失的食材數據

#### 原因 C: 識別流程問題
**描述**: 雖然已部署一致性修復，但可能還有邊界情況

**可能的問題**:
- 預識別食物列表為空
- 預識別食物格式錯誤
- 降級邏輯被觸發

**解決方案**: 檢查日誌，驗證修復是否正常工作

#### 原因 D: 緩存問題
**描述**: 舊的識別結果被緩存

**可能性**: 較低（服務已重啟）

**解決方案**: 清除緩存或等待緩存過期

---

## 診斷步驟

### 步驟 1: 檢查營養數據庫 ⭐ 優先

```bash
# 檢查豆苗是否在數據庫中
grep -r "豆苗" apps/api/src/database/seeds/
```

**預期結果**: 應該找不到豆苗

**如果找不到**: 需要添加豆苗數據

### 步驟 2: 檢查其他火鍋食材

```bash
# 檢查所有火鍋食材
grep -E "蟹腿|白菜|金針菇|魚片" apps/api/src/database/seeds/nutrition-data.ts
```

**預期結果**: 應該都存在

**如果缺失**: 需要補充

### 步驟 3: 檢查生產環境日誌

```bash
# 查看最近的識別請求日誌
# 需要訪問 Render Dashboard 查看日誌
```

**查找關鍵字**:
- "傳遞 X 個預識別食物給成分檢測引擎"
- "使用預識別食物，跳過 Vision API 調用"
- "一致性警告"
- "降級至 Vision API 識別"

### 步驟 4: 測試實際識別

```bash
# 使用測試腳本測試火鍋圖片識別
# 需要準備測試圖片和認證 token
```

---

## 解決方案

### 方案 1: 補充豆苗數據（立即執行）⭐

#### 1.1 添加豆苗到基礎營養數據庫

**文件**: `apps/api/src/database/seeds/nutrition-data.ts`

**位置**: 蔬菜部分

**數據**:
```typescript
{ name: '豆苗', calories: 30, protein: 3.0, carbs: 5.5, fat: 0.2, fiber: 2.8 }
```

#### 1.2 添加豆苗到擴展數據庫

**文件**: `apps/api/src/database/seeds/nutrition-data-extended.ts`

**數據**:
```typescript
{ 
  name: '豆苗', 
  category: 'vegetable', 
  confidence: 0.85,
  aliases: ['豌豆苗', '豆芽菜'],
  description: '嫩綠色豆類幼苗，細嫩可口'
}
```

#### 1.3 創建測試驗證

**文件**: `apps/api/src/services/__tests__/hotpot-recognition.test.ts`

**測試內容**:
- 驗證所有火鍋食材都在數據庫中
- 驗證豆苗的營養數據正確
- 驗證識別一致性

#### 1.4 部署到生產環境

```bash
# 提交更改
git add apps/api/src/database/seeds/
git commit -m "fix: add missing bean sprouts (豆苗) to nutrition database"

# 推送到遠端
git push origin main

# Render 自動部署
```

### 方案 2: 驗證其他食材（並行執行）

#### 2.1 檢查所有火鍋食材

創建驗證腳本檢查：
- 蟹腿
- 白菜
- 金針菇
- 魚片
- 豆腐

#### 2.2 補充缺失的食材

如果發現缺失，按照方案 1 的步驟添加

### 方案 3: 增強監控（後續執行）

#### 3.1 添加食材覆蓋率監控

監控哪些食材經常被識別但缺少營養數據

#### 3.2 添加自動告警

當識別出的食材缺少營養數據時發送告警

#### 3.3 創建食材數據管理界面

方便快速添加新的食材數據

---

## 實施計劃

### 階段 1: 立即修復（今天）

**任務**:
1. ✅ 創建問題診斷報告（本文件）
2. ⏳ 檢查營養數據庫
3. ⏳ 添加豆苗數據
4. ⏳ 驗證其他火鍋食材
5. ⏳ 創建測試
6. ⏳ 部署到生產環境

**預計時間**: 1-2 小時

**成功標準**:
- 豆苗數據已添加
- 所有測試通過
- 部署成功

### 階段 2: 驗證修復（24 小時內）

**任務**:
1. 使用真實火鍋圖片測試
2. 檢查識別結果
3. 驗證所有食材都被正確識別
4. 驗證營養資訊完整

**成功標準**:
- 識別描述與分析結果一致
- 所有食材都有營養資訊
- 用戶滿意

### 階段 3: 持續改進（1 週內）

**任務**:
1. 收集更多火鍋場景的測試數據
2. 優化食材識別準確率
3. 擴展營養數據庫
4. 改進監控系統

**成功標準**:
- 火鍋識別準確率 > 90%
- 食材覆蓋率 > 95%
- 用戶反饋積極

---

## 測試計劃

### 測試用例 1: 海鮮火鍋完整測試

**輸入**: 包含蟹腿、豆腐、白菜、金針菇、豆苗、魚片的火鍋圖片

**預期輸出**:
```json
{
  "recognition": {
    "description": "這是一道海鮮火鍋，包含蟹腿、豆腐、白菜、金針菇、豆苗和魚片...",
    "foods": [
      { "name": "蟹腿", "portion": 31, "calories": 27 },
      { "name": "豆腐", "portion": 150, "calories": 114 },
      { "name": "白菜", "portion": 50, "calories": 7 },
      { "name": "金針菇", "portion": 20, "calories": 4 },
      { "name": "豆苗", "portion": 15, "calories": 5 },
      { "name": "魚片", "portion": 80, "calories": 80 }
    ]
  },
  "componentDetection": {
    "components": [
      { "name": "蟹腿", "sourceType": "pre_recognized" },
      { "name": "豆腐", "sourceType": "pre_recognized" },
      { "name": "白菜", "sourceType": "pre_recognized" },
      { "name": "金針菇", "sourceType": "pre_recognized" },
      { "name": "豆苗", "sourceType": "pre_recognized" },
      { "name": "魚片", "sourceType": "pre_recognized" }
    ]
  }
}
```

**驗證點**:
- ✅ 所有食材都在 recognition.foods 中
- ✅ 所有食材都在 componentDetection.components 中
- ✅ 所有食材都有營養資訊
- ✅ sourceType 為 'pre_recognized'（使用預識別結果）

### 測試用例 2: 豆苗單獨測試

**輸入**: 只包含豆苗的圖片

**預期輸出**:
```json
{
  "recognition": {
    "foods": [
      { 
        "name": "豆苗", 
        "portion": 100, 
        "calories": 30,
        "protein": 3.0,
        "carbohydrates": 5.5,
        "fat": 0.2
      }
    ]
  }
}
```

**驗證點**:
- ✅ 豆苗被正確識別
- ✅ 營養資訊完整
- ✅ 數值正確

### 測試用例 3: 一致性驗證

**輸入**: 任意火鍋圖片

**驗證邏輯**:
```typescript
const recognizedFoodNames = recognition.foods.map(f => f.name);
const componentNames = componentDetection.components.map(c => c.name);

// 所有基礎識別的食物都應該在成分列表中
recognizedFoodNames.forEach(foodName => {
  expect(componentNames).toContain(foodName);
});

// 描述中提到的食物都應該在結果中
const mentionedFoods = extractFoodsFromDescription(recognition.description);
mentionedFoods.forEach(foodName => {
  expect(recognizedFoodNames).toContain(foodName);
});
```

---

## 風險評估

### 風險 1: 豆苗數據不準確

**可能性**: 低  
**影響**: 中  
**緩解措施**: 使用可靠的營養數據來源

### 風險 2: 其他食材也缺失

**可能性**: 中  
**影響**: 高  
**緩解措施**: 全面檢查所有常見火鍋食材

### 風險 3: 修復後仍有問題

**可能性**: 低  
**影響**: 高  
**緩解措施**: 
- 詳細的日誌記錄
- 完整的測試覆蓋
- 快速回滾計劃

---

## 成功標準

修復被認為成功，當：

1. ✅ 豆苗數據已添加到營養數據庫
2. ✅ 所有火鍋食材都有營養資訊
3. ✅ 識別描述與分析結果一致
4. ✅ 所有測試通過
5. ✅ 部署到生產環境成功
6. ✅ 實際測試驗證通過
7. ✅ 用戶確認問題解決

---

## 相關文件

### Specs
- `.kiro/specs/recognition-description-mismatch-fix/` - 識別一致性修復
- `.kiro/specs/tofu-misidentification-fix/` - 豆腐誤識別修復

### 數據文件
- `apps/api/src/database/seeds/nutrition-data.ts` - 基礎營養數據
- `apps/api/src/database/seeds/nutrition-data-extended.ts` - 擴展營養數據

### 核心代碼
- `apps/api/src/services/ComponentDetectionEngine.ts` - 成分檢測引擎
- `apps/api/src/controllers/PhotoController.ts` - 照片控制器
- `apps/api/src/services/NutritionCalculator.ts` - 營養計算器
- `apps/api/src/repositories/FoodRepository.ts` - 食物數據倉庫

### 測試文件
- `apps/api/src/services/__tests__/tofu-recognition-fix.test.ts` - 豆腐修復測試
- `apps/api/src/services/__tests__/ComponentDetectionEngine.test.ts` - 成分檢測測試

---

## 下一步行動

### 立即執行

1. **檢查營養數據庫**
   ```bash
   grep -r "豆苗" apps/api/src/database/seeds/
   ```

2. **如果豆苗缺失，添加數據**
   - 修改 `nutrition-data.ts`
   - 修改 `nutrition-data-extended.ts`

3. **驗證其他火鍋食材**
   ```bash
   grep -E "蟹腿|白菜|金針菇|魚片" apps/api/src/database/seeds/nutrition-data.ts
   ```

4. **創建測試**
   - 創建 `hotpot-recognition.test.ts`
   - 驗證所有食材

5. **部署到生產環境**
   ```bash
   git add .
   git commit -m "fix: add missing hotpot ingredients to nutrition database"
   git push origin main
   ```

### 後續跟進

6. **使用真實圖片測試**
7. **驗證修復效果**
8. **收集用戶反饋**
9. **持續優化**

---

**報告創建時間**: 2025-11-20  
**問題優先級**: 高  
**預計解決時間**: 1-2 小時  
**負責人**: AI Assistant  
**狀態**: 🔄 診斷完成，等待執行修復

