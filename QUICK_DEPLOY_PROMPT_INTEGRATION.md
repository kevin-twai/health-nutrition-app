# 🚀 快速部署 Prompt 整合

## 一鍵部署

```bash
./deploy-prompt-integration.sh
```

這個腳本會自動：
1. ✅ 檢查 Git 狀態
2. ✅ 運行測試
3. ✅ 添加文件到 Git
4. ✅ 創建提交
5. ✅ 推送到遠程倉庫
6. ✅ 觸發 Render 自動部署

## 部署後測試

```bash
# 設置你的 API URL
export RENDER_API_URL="https://your-api.onrender.com"

# 運行測試
./test-render-prompt-integration.sh
```

## 手動部署步驟

如果你想手動控制每一步：

```bash
# 1. 運行測試
node test-prompt-integration.js

# 2. 提交更改
git add apps/api/src/utils/simpleVisionHelper.js
git add *.md
git commit -m "feat: integrate prompt systems"

# 3. 推送
git push origin main

# 4. 等待 Render 自動部署（5-10 分鐘）

# 5. 驗證部署
curl https://your-api.onrender.com/health
```

## 驗證改進

訪問測試頁面：
```
https://your-api.onrender.com/test-vision-api
```

上傳測試圖片，檢查：
- ✅ 計數準確性（蛋、餃子、生蠔等）
- ✅ 完整性（湯汁、主食、蔬菜、調味料）
- ✅ 份量估算（具體數字和單位）
- ✅ 原住民料理識別

## 需要幫助？

查看詳細文檔：
- **DEPLOY_PROMPT_INTEGRATION_TO_RENDER.md** - 完整部署指南
- **INTEGRATION_COMPLETE.md** - 整合完成報告
- **PROMPT_INTEGRATION_GUIDE.md** - 技術細節

## 常見問題

**Q: 部署需要多久？**
A: 通常 5-10 分鐘

**Q: 如何確認部署成功？**
A: 檢查 Render Dashboard 或運行測試腳本

**Q: 如果部署失敗怎麼辦？**
A: 查看 Render 日誌，參考故障排除指南

**Q: 整合會影響現有功能嗎？**
A: 不會，完全向後兼容

---

**準備好了嗎？運行部署腳本開始吧！** 🚀
