# Requirements Document

## Introduction

修正食材名稱模糊匹配導致的誤識別問題。當前系統在營養數據查找時，由於模糊匹配邏輯不當，會將「豆腐」錯誤匹配為「豆腐干絲」，導致營養資訊不準確。

## Glossary

- **System**: 健康營養追蹤系統（Health Nutrition Tracker）
- **NutritionCalculator**: 營養計算器，負責計算食材的營養資訊
- **FoodRepository**: 食材資料庫存取層，負責查詢食材資料
- **Fuzzy Matching**: 模糊匹配，當精確匹配失敗時使用的部分匹配策略
- **Nutrition Data**: 營養數據，包含食材的卡路里、蛋白質、碳水化合物等資訊
- **Food Name**: 食材名稱，用於識別和查詢食材

## Requirements

### Requirement 1: 精確匹配優先

**User Story:** 作為用戶，我希望系統能準確識別「豆腐」而不是「豆腐干絲」，這樣我才能獲得正確的營養資訊

#### Acceptance Criteria

1. WHEN THE System 查找「豆腐」的營養數據時，THE System SHALL 優先返回精確匹配的「豆腐」
2. WHEN 精確匹配存在時，THE System SHALL NOT 返回包含搜索詞的其他食材（如「豆腐干絲」）
3. THE System SHALL 在模糊匹配結果中優先選擇名稱長度最接近搜索詞的食材
4. WHEN 多個模糊匹配結果存在時，THE System SHALL 選擇名稱最短且包含搜索詞的食材
5. THE System SHALL 避免選擇名稱明顯較長的食材（如搜索「豆腐」時避免返回「豆腐干絲」）

### Requirement 2: 模糊匹配改進

**User Story:** 作為開發者，我希望模糊匹配邏輯能夠智能地選擇最佳匹配，這樣可以提高整體識別準確性

#### Acceptance Criteria

1. THE FoodRepository SHALL 在部分匹配查詢中按照匹配度排序結果
2. THE FoodRepository SHALL 優先返回精確匹配的結果
3. THE FoodRepository SHALL 其次返回以搜索詞開頭的結果
4. THE FoodRepository SHALL 最後返回包含搜索詞的結果
5. WHEN 匹配度相同時，THE FoodRepository SHALL 按照名稱長度升序排序

### Requirement 3: 最佳匹配選擇

**User Story:** 作為用戶，我希望系統能夠從多個匹配結果中選擇最合適的食材，這樣我的營養記錄才會準確

#### Acceptance Criteria

1. THE NutritionCalculator SHALL 實現 findBestMatch 方法來選擇最佳匹配
2. WHEN 存在精確匹配時，THE findBestMatch SHALL 返回精確匹配結果
3. WHEN 不存在精確匹配時，THE findBestMatch SHALL 選擇名稱長度最接近的結果
4. THE findBestMatch SHALL 過濾掉名稱明顯過長的結果（長度差異超過 2 個字符）
5. THE findBestMatch SHALL 記錄匹配決策以便調試

### Requirement 4: 豆製品特殊處理

**User Story:** 作為用戶，我希望系統能夠正確區分不同的豆製品（豆腐、豆腐干絲、豆皮等），這樣我才能準確追蹤營養攝取

#### Acceptance Criteria

1. THE System SHALL 正確區分以下豆製品：
   - 豆腐（嫩豆腐、板豆腐、傳統豆腐）
   - 油豆腐（炸豆腐、油炸豆腐）
   - 豆腐干絲（豆干絲、豆腐絲）
   - 豆皮（豆腐皮、腐皮）
   - 豆乾（豆腐乾、五香豆乾）
   - 凍豆腐（冷凍豆腐）
2. WHEN 用戶輸入「豆腐」時，THE System SHALL 返回「豆腐」的營養資訊（76 卡路里）
3. WHEN 用戶輸入「豆腐干絲」時，THE System SHALL 返回「豆腐干絲」的營養資訊（140 卡路里）
4. THE System SHALL 使用 ComponentDetectionEngine 的 mapFoodName 方法標準化食材名稱
5. THE System SHALL 確保標準化後的名稱能夠正確匹配營養數據庫

### Requirement 5: 測試覆蓋

**User Story:** 作為開發者，我希望有完整的測試覆蓋來防止類似問題再次發生，這樣系統才能保持穩定

#### Acceptance Criteria

1. THE System SHALL 包含測試驗證「豆腐」不會被誤認為「豆腐干絲」
2. THE System SHALL 包含測試驗證模糊匹配邏輯的正確性
3. THE System SHALL 包含測試驗證 findBestMatch 方法的各種場景
4. THE System SHALL 包含測試驗證豆製品名稱映射的正確性
5. THE System SHALL 包含測試驗證火鍋場景中的豆腐識別
6. THE System SHALL 包含測試驗證排序邏輯的正確性

### Requirement 6: 日誌和監控

**User Story:** 作為系統管理員，我希望能夠追蹤模糊匹配的決策過程，這樣可以快速診斷和修正問題

#### Acceptance Criteria

1. THE System SHALL 記錄所有模糊匹配的查詢和結果
2. WHEN 使用模糊匹配時，THE System SHALL 記錄搜索詞和匹配結果
3. WHEN 選擇最佳匹配時，THE System SHALL 記錄選擇原因
4. THE System SHALL 記錄營養數據查找失敗的情況
5. THE System SHALL 提供模糊匹配統計資訊以便優化

## Non-Functional Requirements

### 準確性
- 食材名稱匹配準確率應達到 95% 以上
- 豆製品識別準確率應達到 98% 以上
- 模糊匹配應優先選擇最相似的食材

### 性能
- 營養數據查找時間應在 100ms 以內
- 模糊匹配不應顯著增加查詢時間
- 排序邏輯應高效執行

### 可維護性
- 匹配邏輯應集中在 NutritionCalculator 和 FoodRepository 中
- 應支持添加新的匹配規則
- 應提供清晰的日誌以便調試

### 可擴展性
- 匹配邏輯應支持其他類似的食材分類（如蔬菜、肉類等）
- 應支持自定義匹配規則
- 應支持多語言食材名稱匹配

