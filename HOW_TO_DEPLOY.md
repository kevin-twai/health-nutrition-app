# 🚀 如何部署 - 食物識別準確度改進

## 快速導航

選擇最適合您的部署方式：

### 🤖 推薦：自動化部署（最簡單）

```bash
bash auto-deploy.sh
```

一鍵完成所有部署步驟，腳本會引導您完成整個過程。

---

### 📖 詳細指南：Step by Step

```bash
cat DEPLOYMENT_STEP_BY_STEP.md
```

查看完整的部署步驟說明，包含：
- 部署前準備
- 整合到現有項目的詳細步驟
- 獨立測試部署的詳細步驟
- 驗證和故障排除

---

### ⚡ 快速手動部署（適合熟悉流程的用戶）

```bash
# 1. 解壓
tar -xzf food-recognition-accuracy-v1.0.0.tar.gz

# 2. 複製文件
cp -r deploy-minimal/services/* apps/api/src/services/
cp -r deploy-minimal/data/* apps/api/src/data/
cp -r deploy-minimal/types/* apps/api/src/types/

# 3. 驗證
bash verify-deployment-package.sh

# 4. 重啟服務
docker-compose restart api
```

---

## 📚 完整文檔索引

### 部署相關
- **HOW_TO_DEPLOY.md** (本文件) - 部署方式總覽
- **DEPLOYMENT_STEP_BY_STEP.md** - 詳細部署步驟
- **DEPLOYMENT_COMPLETE.md** - 部署完成總結
- **auto-deploy.sh** - 自動化部署腳本
- **verify-deployment-package.sh** - 驗證腳本

### 部署包文檔
- **deploy-minimal/README.md** - 部署包說明
- **deploy-minimal/QUICK_START.md** - 5 分鐘快速開始
- **deploy-minimal/DEPLOYMENT_MANIFEST.md** - 部署清單

### 使用文檔
- **deploy-minimal/docs/USER_GUIDE.md** - 用戶指南
- **deploy-minimal/docs/TECHNICAL_DOCUMENTATION.md** - 技術文檔
- **deploy-minimal/docs/DEPLOYMENT_GUIDE.md** - 生產環境部署

### 規格文檔
- **deploy-minimal/docs/requirements.md** - 功能需求
- **deploy-minimal/docs/design.md** - 系統設計
- **deploy-minimal/docs/tasks.md** - 實施任務

---

## 🎯 推薦流程

### 對於大多數用戶

1. 運行自動化腳本
   ```bash
   bash auto-deploy.sh
   ```

2. 選擇 "1 - 整合到現有項目"

3. 等待腳本完成

4. 重啟服務
   ```bash
   docker-compose restart api
   # 或
   npm run dev
   ```

5. 測試功能
   ```bash
   npx tsx -e "
   import { AsianCuisineKnowledgeBase } from './apps/api/src/services/AsianCuisineKnowledgeBase';
   const kb = new AsianCuisineKnowledgeBase();
   console.log('✓ 部署成功！');
   console.log('食材數量:', kb.getAllIngredients().length);
   "
   ```

### 對於想要測試的用戶

1. 運行自動化腳本
   ```bash
   bash auto-deploy.sh
   ```

2. 選擇 "2 - 獨立測試部署"

3. 進入測試目錄
   ```bash
   cd test-deployment/deploy-minimal
   ```

4. 運行測試
   ```bash
   npx tsx test-recognition.ts
   ```

5. 查看文檔
   ```bash
   cat README.md
   cat QUICK_START.md
   ```

---

## ❓ 常見問題

### Q: 我應該選擇哪種部署方式？

**A:** 
- 如果您想快速完成部署 → 使用 `auto-deploy.sh`
- 如果您想了解每個步驟 → 閱讀 `DEPLOYMENT_STEP_BY_STEP.md`
- 如果您只想測試功能 → 選擇獨立測試部署

### Q: 部署會覆蓋我的現有文件嗎？

**A:** 
- 自動化腳本會自動備份現有文件到 `backups/` 目錄
- 手動部署時建議先備份

### Q: 部署需要多長時間？

**A:** 
- 自動化部署：約 1-2 分鐘
- 手動部署：約 5-10 分鐘
- 獨立測試：約 2-3 分鐘

### Q: 部署失敗怎麼辦？

**A:** 
1. 查看錯誤訊息
2. 參考 `DEPLOYMENT_STEP_BY_STEP.md` 的故障排除章節
3. 運行驗證腳本：`bash verify-deployment-package.sh`
4. 檢查環境變數是否正確設置

### Q: 如何驗證部署是否成功？

**A:** 
```bash
# 方法 1: 運行驗證腳本
bash verify-deployment-package.sh

# 方法 2: 測試導入
npx tsx -e "
import { AsianCuisineKnowledgeBase } from './apps/api/src/services/AsianCuisineKnowledgeBase';
const kb = new AsianCuisineKnowledgeBase();
console.log('✓ 部署成功！');
"
```

### Q: 部署後需要重啟服務嗎？

**A:** 
是的，部署完成後需要重啟服務：
```bash
# Docker
docker-compose restart api

# 或直接運行
npm run dev
```

---

## 🔧 環境要求

### 必需
- Node.js 18+
- npm 或 yarn
- TypeScript

### 可選
- Docker（如果使用 Docker 部署）
- OpenAI API Key（用於實際識別功能）

---

## 📞 獲取幫助

### 查看文檔
```bash
# 用戶指南
cat deploy-minimal/docs/USER_GUIDE.md

# 技術文檔
cat deploy-minimal/docs/TECHNICAL_DOCUMENTATION.md

# 故障排除
cat DEPLOYMENT_STEP_BY_STEP.md | grep -A 50 "故障排除"
```

### 驗證部署
```bash
# 運行驗證腳本
bash verify-deployment-package.sh

# 檢查文件
ls -la apps/api/src/services/AsianCuisineKnowledgeBase.ts
ls -la apps/api/src/data/asianFoodItems.ts
```

---

## ✅ 部署檢查清單

完成部署後，確認以下項目：

- [ ] 部署包已解壓
- [ ] 文件已複製到正確位置
- [ ] 環境變數已設置
- [ ] 依賴已安裝
- [ ] 驗證腳本通過
- [ ] 基本功能測試通過
- [ ] 服務已重啟
- [ ] 文檔已閱讀

---

## 🎉 開始部署

準備好了嗎？選擇一種方式開始：

### 方式 1: 自動化（推薦）
```bash
bash auto-deploy.sh
```

### 方式 2: 詳細指南
```bash
cat DEPLOYMENT_STEP_BY_STEP.md
```

### 方式 3: 快速手動
```bash
tar -xzf food-recognition-accuracy-v1.0.0.tar.gz
cp -r deploy-minimal/services/* apps/api/src/services/
cp -r deploy-minimal/data/* apps/api/src/data/
cp -r deploy-minimal/types/* apps/api/src/types/
```

---

**祝您部署順利！** 🚀

如有任何問題，請參考相關文檔或運行驗證腳本。
