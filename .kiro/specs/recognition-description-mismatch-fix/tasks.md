
# Implementation Plan

- [x] 1. 更新類型定義
  - 創建 `DetectComponentsOptions` 接口
  - 添加 `preRecognizedFoods` 參數
  - 更新 `EnrichedComponent` 接口，添加 `sourceType` 和 `originalFoodId`
  - 更新 `ComponentDetectionResult` 的 metadata，添加 `componentsFromPreRecognition`
  - _Requirements: 1.1, 2.1, 2.5_

- [x] 2. 實現食物轉換邏輯
- [x] 2.1 在 ComponentDetectionEngine 中實現 convertRecognizedFoodsToComponents 方法
  - 將 RecognizedFood 轉換為 EnrichedComponent 格式
  - 保留所有原始屬性（名稱、份量、信心度、營養資訊）
  - 設置 sourceType 為 'pre_recognized'
  - 記錄 originalFoodId
  - _Requirements: 2.4, 2.5_

- [x] 2.2 實現類別和烹飪方式的推斷邏輯
  - 根據食物名稱推斷 category
  - 根據食物名稱推斷 cookingMethod
  - 提供合理的預設值
  - _Requirements: 2.5_

- [x] 2.3 編寫 convertRecognizedFoodsToComponents 的單元測試
  - 測試單個食物轉換
  - 測試多個食物轉換
  - 測試營養資訊保留
  - 測試邊界情況（空列表、缺失屬性等）
  - _Requirements: 2.1, 2.4, 2.5_

- [x] 3. 修改 ComponentDetectionEngine.detectComponents 方法
- [x] 3.1 更新方法簽名支持新的 options 參數
  - 實現向後兼容的重載
  - 支持舊版 API: `detectComponents(image, dishName, dishType)`
  - 支持新版 API: `detectComponents(image, options)`
  - _Requirements: 2.1, 2.2_

- [x] 3.2 實現預識別食物的處理邏輯
  - 檢查是否提供 preRecognizedFoods
  - 如果有，調用 convertRecognizedFoodsToComponents
  - 如果沒有，執行現有的 Vision API 識別流程
  - 添加適當的日誌記錄
  - _Requirements: 1.1, 2.2, 2.3_

- [x] 3.3 更新 metadata 記錄
  - 設置 detectionMethod 為 'pre_recognized'
  - 記錄 componentsFromPreRecognition 數量
  - 更新處理時間統計
  - _Requirements: 4.3_

- [x] 3.4 編寫 detectComponents 的單元測試
  - 測試使用預識別食物的情況
  - 測試不使用預識別食物的情況（降級）
  - 測試向後兼容性
  - 驗證不調用 Vision API
  - _Requirements: 2.2, 2.3_

- [x] 4. 修改 PhotoController.recognizeWithComponents 方法
- [x] 4.1 更新參數傳遞邏輯
  - 構建 DetectComponentsOptions 對象
  - 包含 dishName、dishType 和 preRecognizedFoods
  - 傳遞完整的 multiStageResult.foods 列表
  - _Requirements: 1.2, 3.1_

- [x] 4.2 添加一致性驗證
  - 比較基礎識別和成分識別的食物名稱
  - 記錄缺失或不一致的食物
  - 添加警告日誌
  - _Requirements: 1.5, 4.5_

- [x] 4.3 更新日誌記錄
  - 記錄傳遞給成分檢測引擎的參數
  - 記錄預識別食物列表
  - 記錄一致性檢查結果
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4.4 編寫 PhotoController 的整合測試
  - 測試完整的識別流程
  - 驗證參數正確傳遞
  - 驗證結果一致性
  - _Requirements: 1.1, 1.2, 1.5, 3.1_

- [x] 5. 添加錯誤處理和降級邏輯
- [x] 5.1 處理預識別食物為空的情況
  - 檢測空列表
  - 記錄警告
  - 降級至 Vision API 識別
  - _Requirements: 2.3_

- [x] 5.2 處理預識別食物格式錯誤
  - 添加 try-catch 包裹轉換邏輯
  - 記錄錯誤詳情
  - 降級至 Vision API 識別
  - _Requirements: 2.3_

- [x] 5.3 實現混合模式（可選）
  - 當預識別食物數量較少時，補充 Vision API 識別
  - 合併結果，避免重複
  - 記錄混合模式使用情況
  - _Requirements: 3.2_

- [x] 6. 更新文檔和日誌
- [x] 6.1 更新 ComponentDetectionEngine.README.md
  - 說明新的 options 參數
  - 提供使用示例
  - 說明向後兼容性
  - _Requirements: 2.1_

- [x] 6.2 添加性能監控日誌
  - 記錄是否使用預識別食物
  - 記錄處理時間對比
  - 記錄一致性檢查結果
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6.3 更新 API 文檔
  - 說明識別流程的改進
  - 說明一致性保證
  - 更新示例回應
  - _Requirements: 1.5_

- [x] 7. 測試和驗證
- [x] 7.1 執行所有單元測試
  - 運行 ComponentDetectionEngine 測試
  - 運行 PhotoController 測試
  - 確保測試覆蓋率 > 80%
  - _Requirements: All_

- [x] 7.2 執行整合測試
  - 測試完整的識別流程
  - 驗證結果一致性
  - 測試各種食物組合
  - _Requirements: 1.1, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7.3 執行端到端測試
  - 使用真實圖片測試
  - 驗證日誌輸出
  - 驗證性能改善
  - 驗證一致性
  - _Requirements: All_

- [x] 8. 部署和監控
- [x] 8.1 部署到測試環境
  - 推送代碼到測試分支
  - 觸發 Render 部署
  - 驗證部署成功
  - _Requirements: All_

- [x] 8.2 執行煙霧測試
  - 測試基本識別功能
  - 測試成分識別功能
  - 驗證日誌輸出
  - 檢查錯誤率
  - _Requirements: All_

- [x] 8.3 監控性能指標
  - 監控處理時間
  - 監控 Vision API 調用次數
  - 監控一致性檢查結果
  - 監控錯誤率
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8.4 部署到生產環境
  - 確認測試環境穩定
  - 推送代碼到主分支
  - 觸發生產部署
  - 監控生產環境指標
  - _Requirements: All_

- [x] 9. 文檔和清理
- [x] 9.1 更新部署文檔
  - 記錄修復的問題
  - 記錄性能改善
  - 記錄已知限制
  - _Requirements: All_

- [x] 9.2 創建修復摘要報告
  - 問題描述
  - 解決方案
  - 測試結果
  - 性能對比
  - _Requirements: All_

- [x] 9.3 清理臨時代碼和註釋
  - 移除調試日誌
  - 清理註釋掉的代碼
  - 格式化代碼
  - _Requirements: All_
