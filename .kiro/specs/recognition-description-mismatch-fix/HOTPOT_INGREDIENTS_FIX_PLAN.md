# 火鍋食材補充修復計劃

## 執行摘要

**問題**: 營養數據庫中缺少常見火鍋食材，導致識別描述與分析結果不一致

**影響**: 用戶看到正確的食材描述，但無法獲得完整的營養分析

**解決方案**: 添加 4 個缺失的火鍋食材到營養數據庫

**預計時間**: 30 分鐘

**優先級**: 高 🔴

---

## 缺失食材清單

### 1. 豆腐 🥛
**狀態**: ❌ 缺失（只有豆腐干絲）  
**重要性**: 極高（火鍋必備食材）  
**營養數據**:
```typescript
{
  food_code: 'TW050',
  food_name: '豆腐',
  food_name_en: 'Tofu',
  category: 'proteins',
  subcategory: '豆製品',
  energy_kcal: 76,
  protein_g: 8.1,
  fat_g: 4.2,
  carbohydrate_g: 1.9,
  fiber_g: 0.3,
  sugar_g: 0.7,
  sodium_mg: 7,
  calcium_mg: 350,
  iron_mg: 5.4,
  magnesium_mg: 30,
  phosphorus_mg: 97,
  potassium_mg: 121,
  zinc_mg: 0.8,
  data_source: '台灣食品營養成分資料庫',
  reference_year: 2023
}
```

### 2. 豆苗 🌱
**狀態**: ❌ 缺失（只有豆芽）  
**重要性**: 高（常見蔬菜）  
**營養數據**:
```typescript
{
  food_code: 'TW051',
  food_name: '豆苗',
  food_name_en: 'Pea Shoots',
  category: 'vegetables',
  subcategory: '芽菜類',
  energy_kcal: 30,
  protein_g: 3.0,
  fat_g: 0.2,
  carbohydrate_g: 5.5,
  fiber_g: 2.8,
  sugar_g: 2.0,
  sodium_mg: 4,
  calcium_mg: 65,
  iron_mg: 2.1,
  magnesium_mg: 22,
  phosphorus_mg: 53,
  potassium_mg: 295,
  zinc_mg: 0.4,
  vitamin_a_ug: 380,
  vitamin_c_mg: 60,
  vitamin_k_ug: 250,
  folate_ug: 120,
  data_source: '台灣食品營養成分資料庫',
  reference_year: 2023
}
```

### 3. 蟹腿 🦀
**狀態**: ❌ 缺失  
**重要性**: 高（海鮮火鍋必備）  
**營養數據**:
```typescript
{
  food_code: 'TW052',
  food_name: '蟹腿',
  food_name_en: 'Crab Legs',
  category: 'proteins',
  subcategory: '海鮮',
  energy_kcal: 87,
  protein_g: 18.1,
  fat_g: 1.5,
  carbohydrate_g: 0,
  fiber_g: 0,
  sugar_g: 0,
  sodium_mg: 293,
  calcium_mg: 89,
  iron_mg: 0.5,
  magnesium_mg: 48,
  phosphorus_mg: 229,
  potassium_mg: 329,
  zinc_mg: 4.7,
  vitamin_b12_ug: 9.8,
  data_source: '台灣食品營養成分資料庫',
  reference_year: 2023
}
```

### 4. 魚片 🐟
**狀態**: ❌ 缺失（只有「魚」）  
**重要性**: 高（火鍋常見食材）  
**營養數據**:
```typescript
{
  food_code: 'TW053',
  food_name: '魚片',
  food_name_en: 'Fish Fillet',
  category: 'proteins',
  subcategory: '海鮮',
  energy_kcal: 100,
  protein_g: 20.0,
  fat_g: 1.0,
  carbohydrate_g: 0,
  fiber_g: 0,
  sugar_g: 0,
  sodium_mg: 50,
  calcium_mg: 20,
  iron_mg: 0.6,
  magnesium_mg: 28,
  phosphorus_mg: 200,
  potassium_mg: 350,
  zinc_mg: 0.5,
  vitamin_d_ug: 4.0,
  vitamin_b12_ug: 2.5,
  data_source: '台灣食品營養成分資料庫',
  reference_year: 2023
}
```

---

## 實施步驟

### 步驟 1: 更新營養數據庫文件 ⏱️ 10 分鐘

**文件**: `apps/api/src/database/seeds/nutrition-data-extended.ts`

**操作**:
1. 在豆製品部分添加「豆腐」
2. 在蔬菜部分添加「豆苗」
3. 在海鮮部分添加「蟹腿」和「魚片」

**位置建議**:
- 豆腐：在豆腐干絲（TW011）之後
- 豆苗：在豆芽（TW037）之後
- 蟹腿：在蝦（TW034）之後
- 魚片：在魚（TW035）之後

### 步驟 2: 創建驗證測試 ⏱️ 10 分鐘

**文件**: `apps/api/src/services/__tests__/hotpot-ingredients.test.ts`

**測試內容**:
```typescript
describe('火鍋食材營養數據驗證', () => {
  const hotpotIngredients = [
    '豆腐',
    '豆苗',
    '蟹腿',
    '魚片',
    '白菜',
    '金針菇'
  ];

  it('應該在數據庫中找到所有火鍋食材', async () => {
    for (const ingredient of hotpotIngredients) {
      const result = await foodRepository.findByName(ingredient);
      expect(result).toBeDefined();
      expect(result.food_name).toBe(ingredient);
      expect(result.energy_kcal).toBeGreaterThan(0);
    }
  });

  it('豆腐的營養數據應該正確', async () => {
    const tofu = await foodRepository.findByName('豆腐');
    expect(tofu.energy_kcal).toBe(76);
    expect(tofu.protein_g).toBe(8.1);
    expect(tofu.category).toBe('proteins');
  });

  it('豆苗的營養數據應該正確', async () => {
    const peaShoots = await foodRepository.findByName('豆苗');
    expect(peaShoots.energy_kcal).toBe(30);
    expect(peaShoots.protein_g).toBe(3.0);
    expect(peaShoots.category).toBe('vegetables');
  });

  it('蟹腿的營養數據應該正確', async () => {
    const crabLegs = await foodRepository.findByName('蟹腿');
    expect(crabLegs.energy_kcal).toBe(87);
    expect(crabLegs.protein_g).toBe(18.1);
    expect(crabLegs.category).toBe('proteins');
  });

  it('魚片的營養數據應該正確', async () => {
    const fishFillet = await foodRepository.findByName('魚片');
    expect(fishFillet.energy_kcal).toBe(100);
    expect(fishFillet.protein_g).toBe(20.0);
    expect(fishFillet.category).toBe('proteins');
  });
});
```

### 步驟 3: 運行測試驗證 ⏱️ 5 分鐘

```bash
cd apps/api
npm test -- --testPathPattern=hotpot-ingredients
```

**預期結果**: 所有測試通過 ✅

### 步驟 4: 提交並部署 ⏱️ 5 分鐘

```bash
# 提交更改
git add apps/api/src/database/seeds/nutrition-data-extended.ts
git add apps/api/src/services/__tests__/hotpot-ingredients.test.ts
git commit -m "fix: add missing hotpot ingredients (豆腐, 豆苗, 蟹腿, 魚片) to nutrition database

- Add tofu (豆腐) with complete nutrition data
- Add pea shoots (豆苗) with complete nutrition data  
- Add crab legs (蟹腿) with complete nutrition data
- Add fish fillet (魚片) with complete nutrition data
- Add comprehensive test suite for hotpot ingredients
- Fixes recognition description vs analysis result inconsistency

Resolves: Hotpot ingredient recognition consistency issue"

# 推送到遠端
git push origin main

# Render 自動部署（等待 3-5 分鐘）
```

---

## 驗證計劃

### 自動化驗證

**測試腳本**: 
```bash
# 運行所有相關測試
npm test -- --testPathPattern="hotpot|tofu|nutrition"
```

**預期結果**:
- ✅ 所有火鍋食材測試通過
- ✅ 豆腐識別測試通過
- ✅ 營養計算測試通過

### 手動驗證

**測試場景**: 上傳包含以下食材的火鍋圖片
- 蟹腿
- 豆腐
- 白菜
- 金針菇
- 豆苗
- 魚片

**預期結果**:
```json
{
  "recognition": {
    "description": "這是一道海鮮火鍋，包含蟹腿、豆腐、白菜、金針菇、豆苗和魚片...",
    "foods": [
      { "name": "蟹腿", "calories": 27, "protein": 5.6 },
      { "name": "豆腐", "calories": 114, "protein": 12.2 },
      { "name": "白菜", "calories": 7, "protein": 0.8 },
      { "name": "金針菇", "calories": 4, "protein": 0.5 },
      { "name": "豆苗", "calories": 5, "protein": 0.5 },
      { "name": "魚片", "calories": 80, "protein": 16.0 }
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
- ✅ 識別描述包含所有食材
- ✅ foods 列表包含所有食材
- ✅ components 列表包含所有食材
- ✅ 所有食材都有完整的營養資訊
- ✅ sourceType 為 'pre_recognized'

---

## 預期效果

### 修復前 ❌

**識別描述**: "這是一道海鮮火鍋，包含蟹腿、豆腐、白菜、金針菇、豆苗和魚片..."

**分析結果**: 
- ❌ 豆腐 - 缺失或被誤認為豆腐干絲
- ❌ 豆苗 - 缺失
- ❌ 蟹腿 - 缺失
- ❌ 魚片 - 可能被識別為「魚」
- ✅ 白菜 - 正確
- ✅ 金針菇 - 正確

**一致性**: ~33% ❌

### 修復後 ✅

**識別描述**: "這是一道海鮮火鍋，包含蟹腿、豆腐、白菜、金針菇、豆苗和魚片..."

**分析結果**:
- ✅ 豆腐 - 正確識別，完整營養資訊
- ✅ 豆苗 - 正確識別，完整營養資訊
- ✅ 蟹腿 - 正確識別，完整營養資訊
- ✅ 魚片 - 正確識別，完整營養資訊
- ✅ 白菜 - 正確識別，完整營養資訊
- ✅ 金針菇 - 正確識別，完整營養資訊

**一致性**: 100% ✅

---

## 風險評估

### 風險 1: 營養數據不準確

**可能性**: 低  
**影響**: 中  
**緩解措施**: 
- 使用台灣食品營養成分資料庫作為參考
- 與 USDA 數據交叉驗證
- 標註數據來源和年份

### 風險 2: 食材名稱衝突

**可能性**: 極低  
**影響**: 中  
**緩解措施**:
- 檢查是否已存在相同名稱的食材
- 使用唯一的 food_code
- 測試驗證

### 風險 3: 部署失敗

**可能性**: 極低  
**影響**: 低  
**緩解措施**:
- 本地測試通過後再部署
- Render 自動部署有回滾機制
- 保持 Git 歷史清晰

---

## 回滾計劃

如果修復後出現問題：

### 快速回滾

```bash
# 回滾到修復前的版本
git revert HEAD
git push origin main

# Render 自動部署舊版本
```

### 驗證回滾

```bash
# 檢查服務狀態
curl https://health-nutrition-api.onrender.com/health

# 運行煙霧測試
bash .kiro/specs/recognition-description-mismatch-fix/smoke-test.sh
```

---

## 成功標準

修復被認為成功，當：

1. ✅ 所有 4 個食材已添加到數據庫
2. ✅ 所有測試通過
3. ✅ 部署成功
4. ✅ 手動驗證通過
5. ✅ 識別描述與分析結果一致性達到 100%
6. ✅ 用戶確認問題解決

---

## 時間表

| 步驟 | 預計時間 | 狀態 |
|------|---------|------|
| 1. 更新數據庫文件 | 10 分鐘 | ⏳ 待執行 |
| 2. 創建驗證測試 | 10 分鐘 | ⏳ 待執行 |
| 3. 運行測試驗證 | 5 分鐘 | ⏳ 待執行 |
| 4. 提交並部署 | 5 分鐘 | ⏳ 待執行 |
| **總計** | **30 分鐘** | ⏳ 待執行 |

---

## 相關文件

### 診斷報告
- `.kiro/specs/recognition-description-mismatch-fix/HOTPOT_CONSISTENCY_ISSUE.md`

### 數據文件
- `apps/api/src/database/seeds/nutrition-data-extended.ts` - 需要修改

### 測試文件
- `apps/api/src/services/__tests__/hotpot-ingredients.test.ts` - 需要創建

### 相關 Specs
- `.kiro/specs/recognition-description-mismatch-fix/` - 識別一致性修復
- `.kiro/specs/tofu-misidentification-fix/` - 豆腐誤識別修復

---

## 下一步行動

**立即執行**:
1. 審查此修復計劃
2. 確認營養數據準確性
3. 執行步驟 1-4
4. 驗證修復效果

**後續跟進**:
5. 收集用戶反饋
6. 監控識別準確率
7. 擴展其他常見食材

---

**計劃創建時間**: 2025-11-20  
**預計執行時間**: 30 分鐘  
**優先級**: 高 🔴  
**狀態**: ⏳ 等待審查和執行

