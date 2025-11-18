# 食材識別完整性修復 - 部署指南

## 概述

本指南將協助你將 prompt-foods-list-fix 的改進部署到生產環境。

## 修復內容摘要

- 移除限制性語句
- 重組 Prompt 結構
- 添加識別步驟
- 添加完整性檢查清單
- 優化湯品、涼拌菜、熱炒等特定料理類型

預期效果：
- 食材識別完整度從 40-50% 提升至 80% 以上
- foods 列表長度從平均 1-2 種增加至 3-5 種

## 部署步驟

### 1. 提交代碼

```bash
git add apps/api/src/services/EnhancedPromptGenerator.ts
git add apps/api/src/services/EnhancedPromptGenerator.README.md
git add apps/api/src/services/FOODS_LIST_FIX_GUIDE.md
git add apps/api/src/services/__tests__/*.test.ts
git add .kiro/specs/prompt-foods-list-fix/

git commit -m "fix: 修復食材識別完整性問題"
git push origin main
```

### 2. 部署到 Render

前往 https://dashboard.render.com 並觸發部署

### 3. 驗證部署

```bash
export API_URL="https://your-app.onrender.com"
curl $API_URL/health
```

詳細步驟請參考完整文檔。
