# 亞洲料理成分識別系統 - 實施任務

## 概述

本文檔將設計轉換為可執行的編碼任務，採用增量開發方式，確保每個步驟都能整合到現有系統中。

**重要：本功能將整合到現有的 health-nutrition-app 專案中，而非創建獨立專案。**

### 整合原則

1. **向後兼容**：所有新功能不影響現有 API 行為
2. **可選啟用**：通過 `includeComponents=true` 查詢參數控制
3. **利用現有基礎**：擴展現有服務而非重寫
4. **獨立測試**：為新功能編寫獨立測試套件
5. **統一部署**：使用現有的 Render 部署流程

---

## Phase 1: 基礎架構 (Foundation)

- [x] 1. 創建核心類型定義
  - 創建 `apps/api/src/types/ComponentDetection.ts` 文件
  - 定義 `DishType`、`CookingMethod`、`ComponentCategory` 枚舉
  - 定義 `DetectedComponent`、`ComponentDetectionResult` 接口
  - 定義 `ComponentInfo`、`DishComponentMap` 接口
  - 定義 `ComponentRecognitionResponse` 接口
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. 擴展知識庫數據結構
  - [x] 2.1 創建料理-成分映射數據
    - 創建 `apps/api/src/data/dishComponentMaps.ts` 文件
    - 實現至少 5 種料理的成分映射（蛋炒飯、味噌湯、台式便當、拉麵、小籠包）
    - 包含常見成分、份量範圍、烹飪方式
    - _Requirements: 5.1, 5.2_
  
  - [x] 2.2 創建烹飪方式營養影響數據
    - 創建 `apps/api/src/data/cookingMethodEffects.ts` 文件
    - 定義各種烹飪方式對營養的影響係數
    - 包含炒、煮、炸、蒸、烤、滷等方式
    - _Requirements: 2.6_
  
  - [x] 2.3 擴展食材數據庫
    - 修改 `apps/api/src/data/asianFoodItemsExtended.ts`
    - 為現有食材添加 `componentInfo` 屬性
    - 添加常見成分的營養數據（如雞蛋、青蔥、豆腐等）
    - _Requirements: 2.1, 2.2_

- [x] 3. 擴展 EnhancedPromptGenerator
  - [x] 3.1 添加成分識別 prompt 方法
    - 修改 `apps/api/src/services/EnhancedPromptGenerator.ts`
    - 實現 `generateComponentDetectionPrompt()` 方法
    - 為不同料理類型創建專門的 prompt 模板
    - 支持湯品、炒飯、便當、麵食類的 prompt
    - _Requirements: 1.1, 1.2_
  
  - [x] 3.2 添加成分精煉 prompt
    - 實現 `generateComponentRefinementPrompt()` 方法
    - 用於低信心度成分的二次確認
    - _Requirements: 3.4_

---

## Phase 2: 核心成分識別引擎

- [x] 4. 實現 ComponentDetectionEngine
  - [x] 4.1 創建基礎引擎類
    - 創建 `apps/api/src/services/ComponentDetectionEngine.ts`
    - 實現 `detectComponents()` 主方法
    - 實現料理類型自動判斷邏輯
    - 整合 Vision API 調用
    - _Requirements: 1.1, 1.2_
  
  - [x] 4.2 實現成分提取邏輯
    - 解析 Vision API 返回的成分資訊
    - 提取成分名稱、份量、烹飪方式
    - 計算信心度分數
    - _Requirements: 1.2, 1.3, 3.2_
  
  - [x] 4.3 實現知識庫增強
    - 實現 `enrichWithKnowledgeBase()` 方法
    - 當 Vision API 識別不完整時，補充常見成分
    - 驗證識別結果的合理性
    - _Requirements: 1.4, 2.3_
  
  - [x] 4.4 實現成分驗證
    - 實現 `validateComponents()` 方法
    - 檢查成分與料理類型的一致性
    - 標記低信心度成分
    - _Requirements: 3.2, 3.4_

- [x] 5. 實現 ComponentNutritionCalculator
  - [x] 5.1 創建營養計算器類
    - 創建 `apps/api/src/services/ComponentNutritionCalculator.ts`
    - 實現 `calculateComponentNutrition()` 方法
    - 從知識庫獲取基礎營養數據
    - _Requirements: 2.1, 2.2_
  
  - [x] 5.2 實現烹飪方式影響計算
    - 實現 `applyCookingEffects()` 方法
    - 根據烹飪方式調整營養值
    - 應用營養影響係數
    - _Requirements: 2.6_
  
  - [x] 5.3 實現營養聚合
    - 實現 `aggregateDishNutrition()` 方法
    - 計算總營養值
    - 按成分和類別分組統計
    - 計算各成分佔比
    - _Requirements: 2.4, 2.5_

---

## Phase 3: API 整合

- [x] 6. 擴展 PhotoController
  - [x] 6.1 添加成分識別端點
    - 修改 `apps/api/src/controllers/PhotoController.ts`
    - 添加 `recognizeWithComponents()` 方法
    - 支持 `includeComponents` 查詢參數
    - _Requirements: 1.1_
  
  - [x] 6.2 整合 ComponentDetectionEngine
    - 在照片識別流程中調用成分識別
    - 處理成分識別結果
    - 格式化 API 回應
    - _Requirements: 1.2, 1.3_
  
  - [x] 6.3 實現錯誤處理和降級
    - 處理 Vision API 失敗情況
    - 實現知識庫降級策略
    - 提供有意義的錯誤訊息
    - _Requirements: 4.3_

- [x] 7. 更新 API 回應格式
  - [x] 7.1 擴展回應類型
    - 修改 `apps/api/src/types/shared.ts`
    - 添加 `ComponentRecognitionResponse` 類型
    - 確保向後兼容性
    - _Requirements: 3.1_
  
  - [x] 7.2 實現建議生成
    - 生成可能缺失的成分建議
    - 提供份量調整建議
    - 提供替代解釋
    - _Requirements: 3.6_

---

## Phase 4: 料理類型支持

- [x] 8. 實現湯品類成分識別
  - 添加味噌湯、蛋花湯、貢丸湯、酸辣湯的成分映射
  - 實現湯品專用的成分識別邏輯
  - 處理液體和固體成分的份量估計
  - 測試湯品識別準確率
  - _Requirements: 5.1 (湯品類)_

- [x] 9. 實現炒菜類成分識別
  - 添加炒飯、炒麵、炒青菜、宮保雞丁的成分映射
  - 實現炒菜專用的成分識別邏輯
  - 處理混合成分的識別
  - 測試炒菜識別準確率
  - _Requirements: 5.1 (炒菜類)_

- [x] 10. 實現便當類成分識別
  - 添加台式便當、日式便當、韓式便當的成分映射
  - 實現便當區域劃分邏輯（主食、主菜、配菜）
  - 處理多個獨立成分的識別
  - 測試便當識別準確率
  - _Requirements: 5.1 (便當類)_

- [x] 11. 實現麵食類成分識別
  - 添加拉麵、烏龍麵、米粉、河粉的成分映射
  - 實現麵食專用的成分識別邏輯
  - 處理湯麵和乾麵的差異
  - 測試麵食識別準確率
  - _Requirements: 5.1 (麵食類)_

- [x] 12. 實現點心和燒烤類成分識別
  - 添加小籠包、餃子、燒賣、春捲、烤肉的成分映射
  - 實現點心和燒烤專用的識別邏輯
  - 處理包餡類食物的內餡識別
  - 測試點心和燒烤識別準確率
  - _Requirements: 5.1 (點心類、燒烤類)_

---

## Phase 5: 地域和文化支持

- [x] 13. 添加地域變化支持
  - [x] 13.1 實現台灣料理支持
    - 添加台灣特色料理的成分映射（滷肉飯、牛肉麵、夜市小吃）
    - 添加台灣特色食材
    - _Requirements: 6.1_
  
  - [x] 13.2 實現日式料理支持
    - 添加日式料理的成分映射（壽司、天婦羅、定食）
    - 添加日式特色食材
    - _Requirements: 6.2_
  
  - [x] 13.3 實現韓式料理支持
    - 添加韓式料理的成分映射（韓式烤肉、泡菜、石鍋拌飯）
    - 添加韓式特色食材
    - _Requirements: 6.3_
  
  - [x] 13.4 實現中式和東南亞料理支持
    - 添加中式料理的成分映射（宮保雞丁、麻婆豆腐、北京烤鴨）
    - 添加東南亞料理的成分映射（泰式炒河粉、越南河粉）
    - _Requirements: 6.4, 6.5_

---

## Phase 6: 用戶互動功能

- [x] 14. 實現用戶調整功能
  - [x] 14.1 添加成分調整 API
    - 創建 `apps/api/src/routes/component-adjustment.ts`
    - 實現添加/移除成分的端點
    - 實現調整份量的端點
    - _Requirements: 3.6, 5.3_
  
  - [x] 14.2 實現調整後的營養重算
    - 當用戶調整成分時重新計算營養
    - 更新總營養值
    - 保存用戶調整記錄
    - _Requirements: 2.4, 2.5_

- [x] 15. 實現反饋收集
  - 創建成分識別反饋表
  - 收集用戶對成分識別的評價
  - 記錄用戶修正的成分
  - 用於未來改進
  - _Requirements: 3.6_

---

## Phase 7: 性能優化

- [x] 16. 實現緩存機制
  - [x] 16.1 實現料理-成分映射緩存
    - 擴展 `RecognitionResultCache` 支持成分緩存
    - 緩存常見料理的成分列表
    - TTL: 24 小時
    - _Requirements: 4.4_
  
  - [x] 16.2 實現營養計算緩存
    - 緩存成分的營養計算結果
    - 緩存烹飪方式影響計算
    - _Requirements: 4.4_

- [x] 17. 實現批量處理優化
  - 並行處理多個成分的營養計算
  - 優化知識庫查詢（批量查詢）
  - 減少數據庫往返次數
  - _Requirements: 4.6_

- [x] 18. 實現性能監控
  - 擴展 `FoodRecognitionPerformanceMonitor` 支持成分識別
  - 記錄成分識別時間
  - 記錄各階段耗時（Vision API、知識庫、營養計算）
  - 生成性能報告
  - _Requirements: 4.5_

---

## Phase 8: 測試和驗證

- [x] 19. 編寫單元測試
  - [x] 19.1 測試 ComponentDetectionEngine
    - 測試成分提取邏輯
    - 測試知識庫增強
    - 測試成分驗證
    - _Requirements: All_
  
  - [x] 19.2 測試 ComponentNutritionCalculator
    - 測試營養計算準確性
    - 測試烹飪方式影響
    - 測試營養聚合
    - _Requirements: 2.1-2.6_
  
  - [x] 19.3 測試知識庫查詢
    - 測試料理-成分映射查詢
    - 測試成分營養數據查詢
    - 測試查詢性能
    - _Requirements: 4.2_

- [x] 20. 編寫整合測試
  - [x] 20.1 測試完整識別流程
    - 測試從圖片到成分識別的完整流程
    - 測試 API 回應格式
    - 測試錯誤處理
    - _Requirements: All_
  
  - [x] 20.2 測試不同料理類型
    - 為每種料理類型創建測試案例
    - 測試識別準確率
    - 測試份量估計準確性
    - _Requirements: 5.1_

- [x] 21. 進行用戶驗收測試
  - [x] 21.1 準備測試數據集
    - 收集各種亞洲料理的真實圖片
    - 標註正確的成分和份量
    - 涵蓋不同地域和料理類型
    - _Requirements: All_
  
  - [x] 21.2 執行準確率測試
    - 測試成分識別準確率（目標 > 75%）
    - 測試主要成分識別率（目標 > 90%）
    - 測試份量估計誤差（目標 < ±25%）
    - _Requirements: Non-Functional Requirements_
  
  - [x] 21.3 執行性能測試
    - 測試簡單料理響應時間（目標 < 3 秒）
    - 測試中等複雜料理響應時間（目標 < 5 秒）
    - 測試複雜料理響應時間（目標 < 8 秒）
    - _Requirements: 4.1_

---

## Phase 9: 文檔和部署

- [x] 22. 更新 API 文檔
  - 記錄新的成分識別端點
  - 提供請求/回應範例
  - 說明查詢參數和選項
  - 更新 Postman collection
  - _Requirements: All_

- [x] 23. 創建用戶指南
  - 編寫成分識別功能使用指南
  - 提供最佳實踐建議
  - 說明如何調整識別結果
  - 提供常見問題解答
  - _Requirements: 3.1-3.7_

- [x] 24. 部署到生產環境
  - 更新環境變數配置
  - 執行數據庫遷移（如需要）
  - 部署新版本 API
  - 執行煙霧測試
  - 監控性能指標
  - _Requirements: All_

---

## 定義完成標準 (Definition of Done)

每個任務完成需要滿足：

✅ 代碼實現完整且符合 Acceptance Criteria
✅ 代碼遵循現有的編碼規範和風格
✅ 所有新增代碼有適當的類型定義（TypeScript）
✅ 關鍵邏輯有註釋說明
✅ 與現有系統整合無衝突
✅ 本地測試通過
✅ 性能符合要求

## 風險評估

### 高風險
- **Vision API 識別準確率**：複雜料理的成分識別可能不準確
  - 緩解：強化知識庫降級機制，允許用戶調整
  
- **性能問題**：多成分識別可能導致響應時間過長
  - 緩解：實現緩存、批量處理、並行計算

### 中風險
- **知識庫完整性**：可能缺少某些地方料理的數據
  - 緩解：持續收集用戶反饋，逐步擴充
  
- **份量估計準確性**：從圖片估計份量有固有誤差
  - 緩解：提供份量範圍，允許用戶調整

### 低風險
- **用戶接受度**：用戶可能不習慣詳細的成分分解
  - 緩解：提供簡化和詳細兩種顯示模式

## 成功指標

- ✅ 成分識別準確率 > 75%
- ✅ 主要成分識別率 > 90%
- ✅ 平均響應時間 < 5 秒
- ✅ 支持 20+ 種常見亞洲料理
- ✅ 知識庫包含 100+ 種常見成分
- ✅ 緩存命中率 > 60%
- ✅ 用戶滿意度 > 4.0/5.0

## 預估時間

- Phase 1-2: 5-7 天（基礎架構和核心引擎）
- Phase 3: 2-3 天（API 整合）
- Phase 4: 5-7 天（料理類型支持）
- Phase 5: 3-4 天（地域支持）
- Phase 6: 2-3 天（用戶互動）
- Phase 7: 2-3 天（性能優化）
- Phase 8: 3-5 天（測試）
- Phase 9: 1-2 天（文檔和部署）

**總計：23-34 天（約 4-7 週）**

## 下一步

1. 開始 Phase 1 的任務 1：創建核心類型定義
2. 逐步完成每個任務，確保每個階段都能整合到現有系統
3. 定期測試和驗證功能
4. 收集反饋並持續改進
