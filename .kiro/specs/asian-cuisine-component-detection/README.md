# 亞洲料理成分識別系統 Spec

## 📋 概述

這個 spec 定義了一個全面的亞洲料理成分識別系統，能夠識別料理中的個別成分並提供詳細的營養分析。

## 🎯 核心功能

### 1. 智能成分識別
- 自動識別料理中的所有可見成分
- 支持複合料理（便當、火鍋等）
- 提供成分的視覺描述和信心度

### 2. 營養分析
- 為每個成分提供獨立的營養資訊
- 考慮烹飪方式對營養的影響
- 計算整道料理的總營養值

### 3. 多料理類型支持
- **湯品類**：味噌湯、蛋花湯、貢丸湯、酸辣湯、火鍋
- **炒菜類**：炒飯、炒麵、炒青菜、宮保雞丁
- **便當類**：台式便當、日式便當、韓式便當
- **麵食類**：拉麵、烏龍麵、米粉、河粉
- **點心類**：小籠包、餃子、燒賣、春捲
- **燒烤類**：烤肉、燒雞、烤魚

### 4. 地域文化支持
- 🇹🇼 台灣料理（滷肉飯、牛肉麵、夜市小吃）
- 🇯🇵 日式料理（壽司、天婦羅、定食）
- 🇰🇷 韓式料理（韓式烤肉、泡菜、石鍋拌飯）
- 🇨🇳 中式料理（宮保雞丁、麻婆豆腐、北京烤鴨）
- 🌏 東南亞料理（泰式炒河粉、越南河粉）

### 5. 用戶互動
- 手動調整或移除識別的成分
- 調整成分份量
- 提供反饋改進識別

## 📁 文檔結構

```
.kiro/specs/asian-cuisine-component-detection/
├── README.md           # 本文檔（快速參考）
├── requirements.md     # 詳細需求文檔（6 個主要需求）
├── design.md          # 系統設計文檔（架構、接口、數據模型）
└── tasks.md           # 實施任務分解（24 個任務，9 個階段）
```

## 🚀 快速開始

### 查看需求
```bash
cat .kiro/specs/asian-cuisine-component-detection/requirements.md
```

### 查看設計
```bash
cat .kiro/specs/asian-cuisine-component-detection/design.md
```

### 開始實施
```bash
cat .kiro/specs/asian-cuisine-component-detection/tasks.md
```

## 📊 技術架構

### 核心組件
1. **ComponentDetectionEngine** - 成分識別引擎
2. **ComponentNutritionCalculator** - 營養計算器
3. **DishComponentKnowledgeBase** - 料理-成分知識庫
4. **EnhancedPromptGenerator** - 增強的 prompt 生成器

### 技術棧
- **Backend**: Node.js + TypeScript
- **AI**: OpenAI Vision API (gpt-4o)
- **Database**: MongoDB (知識庫) + PostgreSQL (用戶數據)
- **Cache**: Redis

## 📈 性能目標

- ✅ 成分識別準確率 > 75%
- ✅ 主要成分識別率 > 90%
- ✅ 簡單料理響應時間 < 3 秒
- ✅ 中等複雜料理響應時間 < 5 秒
- ✅ 複雜料理響應時間 < 8 秒
- ✅ 份量估計誤差 < ±25%

## 🗓️ 實施計劃

### Phase 1: 基礎架構 (5-7 天)
- 創建核心類型定義
- 擴展知識庫數據結構
- 擴展 EnhancedPromptGenerator

### Phase 2: 核心引擎 (5-7 天)
- 實現 ComponentDetectionEngine
- 實現 ComponentNutritionCalculator

### Phase 3: API 整合 (2-3 天)
- 擴展 PhotoController
- 更新 API 回應格式

### Phase 4: 料理類型支持 (5-7 天)
- 實現各種料理類型的成分識別

### Phase 5: 地域支持 (3-4 天)
- 添加不同地區的料理支持

### Phase 6: 用戶互動 (2-3 天)
- 實現用戶調整功能
- 實現反饋收集

### Phase 7: 性能優化 (2-3 天)
- 實現緩存機制
- 批量處理優化
- 性能監控

### Phase 8: 測試 (3-5 天)
- 單元測試
- 整合測試
- 用戶驗收測試

### Phase 9: 部署 (1-2 天)
- 更新文檔
- 部署到生產環境

**總計：23-34 天（約 4-7 週）**

## 🎯 成功指標

- 支持 20+ 種常見亞洲料理
- 知識庫包含 100+ 種常見成分
- 緩存命中率 > 60%
- 用戶滿意度 > 4.0/5.0

## 🏗️ 實施方式

**本功能將整合到現有的 health-nutrition-app 專案中**，而非創建獨立專案。

### 為什麼整合而非獨立？

✅ 利用現有基礎設施（EnhancedPromptGenerator、AsianCuisineKnowledgeBase）
✅ 共享營養數據庫和 Vision API 配置
✅ 統一部署到 Render（前後端已配置完成）
✅ 作為現有食物識別功能的增強，而非獨立產品
✅ 可以作為可選功能（`?includeComponents=true`）提供

### 整合策略

1. **向後兼容**：現有 API 不受影響
2. **可選啟用**：通過查詢參數控制是否啟用成分識別
3. **漸進式實施**：先實現核心功能，再擴展料理類型
4. **獨立測試**：為成分識別功能編寫獨立測試

## 📝 下一步

1. **開始實施**：打開 `tasks.md` 查看第一個任務
2. **執行任務**：在 Kiro 中點擊任務旁的 "Start task" 按鈕
3. **逐步推進**：完成一個任務後再進行下一個
4. **持續測試**：每個階段完成後進行測試驗證
5. **部署到 Render**：使用現有的部署流程

## 🤝 貢獻

如果您在實施過程中發現需要調整需求或設計，請：
1. 更新相應的文檔（requirements.md 或 design.md）
2. 同步更新 tasks.md 中的相關任務
3. 記錄變更原因

## 📞 支援

如有問題或需要協助，請參考：
- 需求文檔中的 Glossary 部分
- 設計文檔中的詳細接口定義
- 任務文檔中的風險評估和緩解策略

---

**創建日期**: 2025-11-16
**狀態**: ✅ 規劃完成，準備開始實施
**預估完成時間**: 4-7 週
