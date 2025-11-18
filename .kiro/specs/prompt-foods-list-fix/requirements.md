# Requirements Document

## Introduction

修復食物識別 prompt 中的限制性問題。當前 prompt 過於強調 description 和 foods 列表的一致性，導致 AI 在生成結構化數據時受到約束，無法正確識別圖片中的所有食材。

## Glossary

- **EnhancedPromptGenerator**: 增強型 Prompt 生成器，負責生成食物識別的 AI prompt
- **foods 列表**: JSON 回應中的食材陣列，應包含圖片中所有可見的食材
- **description**: 對整體菜餚或食材的文字描述
- **限制性 prompt**: 過度約束 AI 行為的 prompt，導致識別結果不完整

## Requirements

### Requirement 1

**User Story:** 作為系統開發者，我希望 AI 能夠正確識別圖片中的所有食材，而不受 description 內容的限制，以便提供完整準確的營養分析。

#### Acceptance Criteria

1. WHEN AI 分析食物圖片時，THE EnhancedPromptGenerator SHALL 生成的 prompt 明確要求 AI 優先識別圖片中的所有可見食材
2. WHEN AI 生成 foods 列表時，THE EnhancedPromptGenerator SHALL 確保 prompt 不會限制 foods 列表只包含 description 中提到的食材
3. WHEN AI 識別複雜菜餚（如涼拌小菜、湯品）時，THE EnhancedPromptGenerator SHALL 生成的 prompt 要求 AI 列出每一種可見的食材，即使 description 中未詳細描述
4. WHEN prompt 包含範例或說明時，THE EnhancedPromptGenerator SHALL 確保範例展示如何識別多種食材，而不是只識別主要食材
5. THE EnhancedPromptGenerator SHALL 移除或修改任何暗示「foods 列表必須與 description 一致」的語句

### Requirement 2

**User Story:** 作為營養師，我希望系統能夠識別各式料理的所有食材，以便進行準確的營養計算。

#### Acceptance Criteria

1. WHEN AI 識別任何料理時，THE EnhancedPromptGenerator SHALL 生成的 prompt 明確要求識別所有可見的食材
2. WHEN AI 生成 foods 列表時，THE EnhancedPromptGenerator SHALL 確保 prompt 要求包含所有可見食材（如果圖片中有多種食材）
3. WHEN prompt 描述料理識別時，THE EnhancedPromptGenerator SHALL 提供具體的食材範例（如湯品：豆腐、海帶、蔥花；涼拌菜：豆干、芹菜、胡蘿蔔等）
4. THE EnhancedPromptGenerator SHALL 在 prompt 中強調「必須識別每一種食材」而不是「可以識別食材」
5. WHEN AI 識別複雜料理（如湯品、涼拌菜、便當）時，THE EnhancedPromptGenerator SHALL 確保 prompt 要求識別所有組成食材，而不只是料理名稱

### Requirement 3

**User Story:** 作為系統開發者，我希望 prompt 的指示清晰明確，優先強調「識別圖片中的所有食材」，然後才是「撰寫描述」，以便 AI 按正確的優先順序工作。

#### Acceptance Criteria

1. THE EnhancedPromptGenerator SHALL 在 prompt 中將「識別所有食材」的指示放在「撰寫描述」之前
2. THE EnhancedPromptGenerator SHALL 使用強調語氣（如「必須」、「重要」、「優先」）來標註食材識別的重要性
3. WHEN prompt 包含多個步驟時，THE EnhancedPromptGenerator SHALL 將食材識別列為第一步驟
4. THE EnhancedPromptGenerator SHALL 移除任何可能被解讀為「description 比 foods 列表更重要」的語句
5. THE EnhancedPromptGenerator SHALL 在 prompt 中明確說明：「foods 列表是營養計算的基礎，必須完整準確」

### Requirement 4

**User Story:** 作為測試人員，我希望能夠驗證修復後的 prompt 是否正確，以便確保問題已解決。

#### Acceptance Criteria

1. WHEN 修復完成後，THE System SHALL 提供測試腳本來驗證 prompt 的正確性
2. WHEN 使用測試圖片（如味噌湯、涼拌小菜）時，THE System SHALL 能夠識別出至少 80% 的可見食材
3. WHEN 比較修復前後的識別結果時，THE System SHALL 顯示 foods 列表中的食材數量明顯增加
4. THE System SHALL 提供至少 3 個測試案例來驗證不同類型菜餚的識別準確度
5. WHEN 測試失敗時，THE System SHALL 提供詳細的錯誤報告，說明哪些食材未被識別
