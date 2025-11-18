# Simple-Server 與 EnhancedPromptGenerator 整合計劃

## 目標

將 `simple-server.js` 中優秀的 prompt 設計整合到 `EnhancedPromptGenerator.ts` 中，並讓 `simple-server.js` 使用 `EnhancedPromptGenerator`。

## 整合步驟

### 步驟 1: 創建 Simple Vision API Helper
創建一個輔助模組，讓 JavaScript 代碼可以輕鬆使用 TypeScript 的 `EnhancedPromptGenerator`。

**文件**: `apps/api/src/utils/simpleVisionHelper.js`

### 步驟 2: 更新 simple-server.js
修改 `simple-server.js`，移除內嵌的 prompt，改為調用 `EnhancedPromptGenerator`。

**保留功能**:
- 圖片格式轉換 (HEIC support)
- 圖片壓縮
- 重試機制
- 錯誤處理

**移除功能**:
- 內嵌的 prompt 文本（改用 EnhancedPromptGenerator）

### 步驟 3: 驗證整合
- 測試 simple-server.js 是否正常工作
- 確認使用的是 EnhancedPromptGenerator 的 prompt
- 驗證識別準確率沒有下降

## 優點

1. **單一來源**：所有 prompt 都在 `EnhancedPromptGenerator` 中管理
2. **易於維護**：只需要更新一個地方
3. **功能完整**：保留 simple-server 的圖片處理功能
4. **類型安全**：使用 TypeScript 的類型檢查

## 實施

開始整合...
