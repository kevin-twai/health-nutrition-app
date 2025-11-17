# 亞洲料理成分識別系統需求文檔

## Introduction

本功能旨在增強食物識別系統，使其能夠識別亞洲料理中的個別成分/配料（如炒飯中的蛋、青菜、火腿；湯品中的豆腐、青蔥；便當中的各種菜色等），並為每個成分提供獨立的營養資訊。

## Glossary

- **System**: 健康營養追蹤系統的食物識別模組
- **Dish**: 料理/菜餚（如炒飯、便當、湯品、火鍋等）
- **Component**: 料理中的成分/配料（如蛋、青菜、豆腐、肉類等）
- **Vision API**: OpenAI Vision API (gpt-4o)
- **Knowledge Base**: 系統內建的食材知識庫
- **Asian Cuisine**: 亞洲料理（中式、台式、日式、韓式等）

## Requirements

### Requirement 1: 亞洲料理成分識別

**User Story:** 作為用戶，我想要系統能識別亞洲料理中的個別成分，以便我能了解每種成分的營養價值

#### Acceptance Criteria

1. WHEN 用戶上傳亞洲料理圖片，THE System SHALL 識別料理的主要名稱（如「炒飯」、「便當」、「火鍋」）
2. WHEN 料理被識別後，THE System SHALL 嘗試識別圖片中可見的成分
3. WHEN 成分被識別後，THE System SHALL 為每個成分提供獨立的營養資訊
4. WHEN 成分無法從圖片中識別時，THE System SHALL 使用知識庫中的常見成分作為參考
5. THE System SHALL 為每個識別的成分估計份量（克）
6. THE System SHALL 支持複合料理（如便當、火鍋、炒菜等）的成分分解

### Requirement 2: 成分資訊準確性

**User Story:** 作為用戶，我想要成分的營養資訊準確可靠，以便我能正確追蹤我的營養攝取

#### Acceptance Criteria

1. THE System SHALL 從知識庫或資料庫獲取每個成分的營養資訊
2. THE System SHALL 根據估計的份量計算成分的實際營養值
3. WHEN 成分在知識庫中不存在時，THE System SHALL 標記該成分為「營養資訊不可用」
4. THE System SHALL 提供整道料理的總營養資訊（所有成分的總和）
5. THE System SHALL 確保成分的營養資訊與整體料理的營養資訊一致
6. THE System SHALL 處理烹飪方式對營養價值的影響（如油炸、清蒸等）

### Requirement 3: 用戶體驗優化

**User Story:** 作為用戶，我想要清楚地看到料理和成分的分別，以便我能理解識別結果

#### Acceptance Criteria

1. THE System SHALL 在回應中明確區分料理整體和個別成分
2. THE System SHALL 為每個成分顯示信心度（confidence）
3. THE System SHALL 按照份量或重要性排序成分列表
4. WHEN 成分識別信心度低於 70% 時，THE System SHALL 標記為「可能的成分」
5. THE System SHALL 提供成分的視覺描述（如顏色、形狀、烹飪方式）以幫助用戶驗證
6. THE System SHALL 支持用戶手動調整或移除識別的成分
7. THE System SHALL 提供成分的料理方式資訊（如炒、煮、炸等）

### Requirement 4: 性能要求

**User Story:** 作為用戶，我想要成分識別快速完成，以便我能快速記錄我的飲食

#### Acceptance Criteria

1. THE System SHALL 在 8 秒內完成成分識別（包含 Vision API 調用）
2. THE System SHALL 優先使用知識庫以減少 API 調用次數
3. WHEN Vision API 調用失敗時，THE System SHALL 降級到知識庫的常見成分
4. THE System SHALL 緩存常見料理的成分資訊以提高性能
5. THE System SHALL 記錄成分識別的性能指標
6. THE System SHALL 支持批量處理多個成分的營養計算

### Requirement 5: 支持的料理類型

**User Story:** 作為用戶，我想要系統支持多種亞洲料理的成分識別，以便我能追蹤各種料理的營養

#### Acceptance Criteria

1. THE System SHALL 支持以下料理類型的成分識別：
   - 湯品類：味噌湯、蛋花湯、貢丸湯、酸辣湯、火鍋
   - 炒菜類：炒飯、炒麵、炒青菜、宮保雞丁
   - 便當類：台式便當、日式便當、韓式便當
   - 麵食類：拉麵、烏龍麵、米粉、河粉
   - 點心類：小籠包、餃子、燒賣、春捲
   - 燒烤類：烤肉、燒雞、烤魚
2. THE System SHALL 為每種料理類型維護常見成分列表
3. THE System SHALL 支持用戶手動添加或移除成分
4. WHEN 遇到未知料理時，THE System SHALL 嘗試通用的成分識別
5. THE System SHALL 允許擴展支持更多料理類型
6. THE System SHALL 識別不同料理風格（中式、台式、日式、韓式、東南亞式）

### Requirement 6: 文化和地域適應性

**User Story:** 作為來自不同地區的用戶，我想要系統能識別我熟悉的地方料理成分，以便我能準確追蹤我的飲食習慣

#### Acceptance Criteria

1. THE System SHALL 支持台灣特色料理成分識別（如：滷肉飯、牛肉麵、夜市小吃）
2. THE System SHALL 支持日式料理成分識別（如：壽司、天婦羅、定食）
3. THE System SHALL 支持韓式料理成分識別（如：韓式烤肉、泡菜、石鍋拌飯）
4. THE System SHALL 支持中式料理成分識別（如：宮保雞丁、麻婆豆腐、北京烤鴨）
5. THE System SHALL 支持東南亞料理成分識別（如：泰式炒河粉、越南河粉、新加坡炒米粉）
6. THE System SHALL 識別地方特色食材和調料

## Non-Functional Requirements

### 準確性
- 成分識別準確率應達到 75% 以上（考慮複雜度增加）
- 份量估計誤差應在 ±25% 以內
- 主要成分（佔料理 20% 以上）識別率應達到 90% 以上

### 可用性
- 系統應在 Vision API 不可用時仍能提供基本的成分資訊
- 成分識別失敗不應影響整體料理的識別
- 系統應提供成分識別的信心度指標

### 可擴展性
- 設計應支持未來添加更多料理類型
- 應支持不同烹飪方式的成分識別
- 應支持新的亞洲料理風格
- 知識庫應支持動態擴展

### 可維護性
- 成分資訊應集中管理在知識庫中
- 成分識別邏輯應與主要識別流程解耦
- 應支持 A/B 測試不同的識別策略
- 應提供成分識別的詳細日誌和分析

### 性能
- 複雜料理（5+ 成分）的識別時間不應超過 10 秒
- 系統應支持並發處理多個識別請求
- 知識庫查詢響應時間應在 100ms 以內
