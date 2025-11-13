# Requirements Document

## Introduction

本文檔定義了食物識別準確度改進功能的需求。目前系統在識別特定類型的食物時存在準確度問題，例如將涼拌干絲誤識別為麵條，或將食材的數量和種類識別錯誤。本功能旨在提升 OpenAI Vision API 的食物識別準確度，特別是針對亞洲料理和複雜的混合食材菜餚。

## Glossary

- **Vision System**: 使用 OpenAI Vision API 進行圖像分析的食物識別系統
- **Food Recognition Engine**: 處理食物圖像識別和營養分析的核心引擎
- **Prompt Template**: 發送給 OpenAI Vision API 的指令模板
- **Confidence Score**: 系統對識別結果的信心度評分（0-100%）
- **Asian Cuisine**: 亞洲料理，包括中式、日式、韓式等料理
- **Mixed Ingredient Dish**: 包含多種食材混合的菜餚，如涼拌菜、炒菜等

## Requirements

### Requirement 1

**User Story:** 作為一個使用者，我想要系統能正確識別亞洲料理中的豆製品（如豆腐干絲、豆皮等），以便獲得準確的營養分析

#### Acceptance Criteria

1. WHEN 使用者上傳包含豆腐干絲的圖片，THE Vision System SHALL 正確識別出豆腐干絲而非麵條
2. WHEN 使用者上傳包含豆製品的圖片，THE Vision System SHALL 在識別結果中明確標註豆製品的類型（如干絲、豆皮、豆腐等）
3. WHEN Vision System 識別豆製品時，THE Vision System SHALL 提供至少 80% 的 Confidence Score
4. WHERE 圖片中包含多種相似食材（如麵條和干絲），THE Vision System SHALL 根據質地、顏色和形狀特徵進行區分

### Requirement 2

**User Story:** 作為一個使用者，我想要系統能正確識別混合食材菜餚中的所有主要成分，以便獲得完整的營養資訊

#### Acceptance Criteria

1. WHEN 使用者上傳涼拌菜圖片，THE Vision System SHALL 識別出所有可見的主要食材（至少 3 種以上）
2. WHEN Vision System 分析 Mixed Ingredient Dish 時，THE Vision System SHALL 列出每種食材的名稱和估計份量
3. IF 圖片中包含細絲狀食材（如胡蘿蔔絲、芹菜絲、干絲），THEN THE Vision System SHALL 分別識別每種食材而非籠統歸類
4. THE Vision System SHALL 在識別結果中使用繁體中文標註所有食材名稱

### Requirement 3

**User Story:** 作為一個使用者，我想要系統在識別不確定時提供替代選項，以便我能手動選擇正確的食物

#### Acceptance Criteria

1. WHEN Vision System 的 Confidence Score 低於 85%，THE Vision System SHALL 提供 2-3 個可能的食物選項
2. WHEN Vision System 提供多個選項時，THE Vision System SHALL 為每個選項標註 Confidence Score
3. THE Vision System SHALL 允許使用者從提供的選項中選擇正確的食物
4. WHEN 使用者選擇正確選項後，THE Vision System SHALL 記錄此選擇以改進未來的識別準確度

### Requirement 4

**User Story:** 作為一個使用者，我想要系統能識別食物的烹飪方式（如涼拌、清蒸、油炸等），以便獲得更準確的營養估算

#### Acceptance Criteria

1. WHEN Vision System 分析食物圖片時，THE Vision System SHALL 識別食物的烹飪方式
2. THE Vision System SHALL 在 Prompt Template 中包含烹飪方式識別的指令
3. WHEN Vision System 識別出烹飪方式時，THE Vision System SHALL 根據烹飪方式調整營養估算（如油炸食物增加脂肪含量）
4. THE Vision System SHALL 在識別結果中以繁體中文標註烹飪方式

### Requirement 5

**User Story:** 作為一個使用者，我想要系統能區分相似但不同的食材（如麵條 vs 干絲、米粉 vs 粉絲），以便獲得準確的營養資訊

#### Acceptance Criteria

1. THE Vision System SHALL 在 Prompt Template 中包含詳細的食材區分指引
2. WHEN Vision System 遇到相似食材時，THE Vision System SHALL 分析質地、顏色、粗細、光澤等特徵進行區分
3. THE Vision System SHALL 在 Prompt Template 中列出常見的易混淆食材對照表
4. WHEN Vision System 識別相似食材時，THE Vision System SHALL 在結果中說明區分依據

### Requirement 6

**User Story:** 作為一個開發者，我想要能夠測試和驗證食物識別的準確度，以便持續改進系統

#### Acceptance Criteria

1. THE Food Recognition Engine SHALL 記錄每次識別的詳細日誌（包括原始 prompt、API 回應、處理時間）
2. THE Food Recognition Engine SHALL 提供測試端點以驗證特定食物的識別準確度
3. WHEN 識別失敗或準確度低時，THE Food Recognition Engine SHALL 記錄失敗原因和圖片特徵
4. THE Food Recognition Engine SHALL 支援批次測試多張圖片並生成準確度報告
