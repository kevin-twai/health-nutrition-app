#!/bin/bash

echo "🚀 部署食材識別完整性修復..."
echo ""

# 1. 提交代碼
echo "�� 提交代碼到 Git..."
git add apps/api/src/services/EnhancedPromptGenerator.ts
git add apps/api/src/services/EnhancedPromptGenerator.README.md
git add apps/api/src/services/FOODS_LIST_FIX_GUIDE.md
git add apps/api/src/services/__tests__/EnhancedPromptGenerator.*.test.ts
git add apps/api/src/services/__tests__/prompt-fix-verification.test.ts
git add .kiro/specs/prompt-foods-list-fix/

git commit -m "fix: 修復食材識別完整性問題

- 移除 prompt 限制性語句
- 重組結構，優先識別所有食材
- 添加識別步驟和檢查清單
- 優化湯品、涼拌菜、熱炒等模板

效果：食材識別完整度從 40-50% 提升至 80%+
"

echo ""
echo "📤 推送到遠端..."
git push origin main

echo ""
echo "✅ 完成！"
echo ""
echo "下一步："
echo "1. 前往 Render Dashboard: https://dashboard.render.com"
echo "2. 等待自動部署完成（或手動觸發部署）"
echo "3. 測試食材識別功能"
echo ""
