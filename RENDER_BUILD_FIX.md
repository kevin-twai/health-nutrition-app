# 🔧 Render 構建錯誤修復

**錯誤**: `TypeError: Cannot read properties of null (reading 'useContext')`  
**原因**: styled-jsx 在 SSR (Server-Side Rendering) 時的 React Context 問題

---

## ✅ 已修復的問題

### 1. 添加 'use client' 指令
所有使用 React hooks 或客戶端功能的頁面都需要 'use client' 指令：

**修復的文件**:
- `apps/web/src/app/page.tsx` - 首頁
- `apps/web/src/app/reports/page.tsx` - 報告頁面  
- `apps/web/src/app/profile/page.tsx` - 個人資料頁面

### 2. 更新 Next.js 配置
在 `apps/web/next.config.js` 中添加：
- 忽略 styled-jsx 警告
- 優化 webpack 配置
- 禁用不必要的功能

---

## 🔍 錯誤分析

### 原始錯誤
```
TypeError: Cannot read properties of null (reading 'useContext')
at exports.useContext (/opt/render/project/src/node_modules/react/cjs/react.production.min.js:24:118)
at StyleRegistry (/opt/render/project/src/node_modules/styled-jsx/dist/index/index.js:450:30)
```

### 根本原因
1. styled-jsx 嘗試在 SSR 時使用 React Context
2. 某些頁面沒有 'use client' 指令
3. Next.js 嘗試靜態生成這些頁面時失敗

### 解決方案
1. 所有使用客戶端功能的頁面添加 'use client'
2. 配置 Next.js 忽略 styled-jsx 警告
3. 禁用 React Strict Mode (已在配置中)

---

## 📋 修復清單

- [x] 添加 'use client' 到首頁
- [x] 添加 'use client' 到報告頁面
- [x] 添加 'use client' 到個人資料頁面
- [x] 更新 next.config.js
- [x] 配置 webpack 忽略警告
- [ ] 測試本地構建
- [ ] 推送到 Git
- [ ] 在 Render 上重新部署

---

## 🧪 本地測試

在推送前測試構建：

```bash
cd apps/web
npm run build
```

如果構建成功，應該看到：
```
✓ Compiled successfully
✓ Generating static pages (11/11)
✓ Finalizing page optimization
```

---

## 🚀 部署步驟

### 1. 提交修改
```bash
git add apps/web/
git commit -m "fix: 修復 Render 構建錯誤 - styled-jsx SSR 問題

- 添加 'use client' 到所有客戶端頁面
- 更新 next.config.js 配置
- 忽略 styled-jsx 警告
- 優化 webpack 配置"
```

### 2. 推送到 Git
```bash
git push origin main
```

### 3. 監控 Render 部署
- 進入 Render Dashboard
- 查看 health-nutrition-web 服務
- 監控構建日誌
- 等待部署完成（約 3-5 分鐘）

---

## 🔍 驗證部署

部署完成後：

### 1. 檢查前端
```bash
curl https://health-nutrition-web.onrender.com
```

### 2. 在瀏覽器中測試
打開: https://health-nutrition-web.onrender.com

檢查:
- ✅ 首頁正常顯示
- ✅ 所有頁面可以訪問
- ✅ 沒有 JavaScript 錯誤
- ✅ API 請求指向正確的後端

### 3. 測試各個頁面
- https://health-nutrition-web.onrender.com/
- https://health-nutrition-web.onrender.com/photo
- https://health-nutrition-web.onrender.com/reports
- https://health-nutrition-web.onrender.com/chat
- https://health-nutrition-web.onrender.com/gamification
- https://health-nutrition-web.onrender.com/profile

---

## 📚 相關文檔

- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [styled-jsx Documentation](https://github.com/vercel/styled-jsx)
- [Render Build Troubleshooting](https://render.com/docs/troubleshooting-builds)

---

## 🐛 如果仍然失敗

### 檢查 1: 確認所有頁面都有 'use client'
```bash
grep -r "useState\|useEffect" apps/web/src/app --include="*.tsx" | grep -v "use client"
```

### 檢查 2: 查看 Render 日誌
在 Render Dashboard 中查看完整的構建日誌

### 檢查 3: 本地測試
```bash
cd apps/web
rm -rf .next
npm run build
```

### 備用方案: 完全禁用 SSR
如果問題持續，可以在 `apps/web/src/app/layout.tsx` 中添加：
```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

---

**狀態**: 修復已完成，等待測試和部署
