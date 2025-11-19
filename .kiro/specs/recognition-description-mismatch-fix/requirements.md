# Requirements Document

## Introduction

修正食物識別與 recognition description 不符合的問題。當前系統在執行成分識別時會重新調用 Vision API，導致識別出的食物與基礎識別結果不一致。

## Glossary

- **System**: 健康營養追蹤系統（Health Nutrition Tracker）
- **MultiStageRecognitionEngine**: 多階段識別引擎，負責基礎食物識別
- **ComponentDetectionEngine**: 成分檢測引擎，負責識別料理中的個別成分
- **Vision API**: OpenAI GPT-4 Vision API，用於圖像識別
- **Recognition Result**: 基礎識別結果，包含識別出的食物列表
- **Component Detection Result**: 成分識別結果，包含料理中的個別成分
- **PhotoController**: 照片控制器，協調識別流程

## Requirements

### Requirement 1

**User Story:** 作為用戶，我希望成分識別的結果與基礎識別的結果一致，這樣我才能信任系統的識別準確性

#### Acceptance Criteria

1. WHEN THE System 執行成分識別時，THE System SHALL 使用基礎識別結果作為輸入
2. WHEN THE System 收到基礎識別結果時，THE System SHALL 將所有識別出的食物傳遞給成分檢測引擎
3. THE ComponentDetectionEngine SHALL NOT 重新調用 Vision API 進行食物識別
4. THE ComponentDetectionEngine SHALL 使用基礎識別結果中的食物列表作為成分來源
5. WHEN THE System 返回識別結果時，THE System SHALL 確保 recognition description 與檢測到的成分一致

### Requirement 2

**User Story:** 作為開發者，我希望成分檢測引擎能夠接受預先識別的食物列表，這樣可以避免重複識別並提高一致性

#### Acceptance Criteria

1. THE ComponentDetectionEngine SHALL 接受可選的預識別食物列表參數
2. WHEN 提供預識別食物列表時，THE ComponentDetectionEngine SHALL 使用該列表作為成分基礎
3. THE ComponentDetectionEngine SHALL 僅在未提供預識別食物列表時調用 Vision API
4. THE ComponentDetectionEngine SHALL 將預識別食物轉換為成分格式
5. THE ComponentDetectionEngine SHALL 保留預識別食物的所有屬性（名稱、份量、信心度等）

### Requirement 3

**User Story:** 作為用戶，我希望系統能夠正確處理多個食物項目的識別，這樣我可以一次記錄多種食物

#### Acceptance Criteria

1. WHEN 基礎識別檢測到多個食物時，THE System SHALL 將所有食物傳遞給成分檢測引擎
2. THE ComponentDetectionEngine SHALL 為每個預識別食物創建對應的成分
3. THE ComponentDetectionEngine SHALL 保持食物之間的獨立性
4. THE ComponentDetectionEngine SHALL 正確計算多個食物的總營養資訊
5. THE System SHALL 在回應中清楚標示每個食物及其成分

### Requirement 4

**User Story:** 作為系統管理員，我希望能夠追蹤識別流程的每個步驟，這樣可以快速診斷和修正問題

#### Acceptance Criteria

1. THE System SHALL 記錄基礎識別的結果
2. THE System SHALL 記錄傳遞給成分檢測引擎的參數
3. THE System SHALL 記錄成分檢測引擎的處理過程
4. THE System SHALL 記錄最終返回給用戶的結果
5. WHEN 識別結果不一致時，THE System SHALL 記錄警告訊息
