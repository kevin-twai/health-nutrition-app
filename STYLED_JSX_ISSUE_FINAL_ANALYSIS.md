# Styled-JSX SSR 問題最終分析

## 問題摘要

Next.js 14 在建置時會自動預渲染 `/404` 和 `/500` 錯誤頁面，這些頁面內部使用 styled-jsx，導致在 SSR 環境中出現 `Cannot read properties of null (reading 'useContext')` 錯誤。

## 已嘗試的解決方案

1. ✗ 移除 Inter 字體（使用 styled-jsx）
2. ✗ 刪除所有自訂錯誤頁面
3. ✗ 升級 Next.js 到 14.2.18 和 React 到 18.3.1
4. ✗ 簡化 globals.css，移除 @apply 指令
5. ✗ 更新 Next.js 配置
6. ✗ 使用 force-dynamic
7. ✗ 完全禁用靜態優化

## 根本原因

Next.js 14 的 App Router 會自動生成默認錯誤頁面，這些頁面在預渲染時會觸發 styled-jsx 的 Context 問題。這是 Next.js 14.0-14.2 系列的已知問題。

## 建議的解決方案

### 選項 1：部署 API 服務，暫時跳過 Web 前端（推薦）

由於這是一個全棧應用，API 服務是核心功能。建議：

1. 先部署 API 服務到 Render
2. 使用 Postman 或其他工具測試 API 功能
3. 等待 Next.js 15 穩定版本或尋找其他前端解決方案

**Render 配置（僅 API）：**
```yaml
Build Command: cd apps/api && npm install && npm run build
Start Command: cd apps/api && npm start
Root Directory: /
```

### 選項 2：降級到 Next.js 13

Next.js 13 的 Pages Router 不會有這個問題：

```bash
cd apps/web
npm install next@13.5.6 react@18.2.0 react-dom@18.2.0
```

然後需要將 App Router 結構轉換為 Pages Router。

### 選項 3：使用其他前端框架

考慮使用：
- Vite + React
- Create React App
- Remix
- SvelteKit

### 選項 4：接受建置警告（不推薦）

修改建置腳本忽略錯誤：
```json
"build": "next build || echo 'Build completed with warnings'"
```

但這可能導致應用程式不穩定。

## 當前狀態

- ✅ API 服務代碼完整且可運行
- ✅ 數據庫配置正確
- ✅ 所有業務邏輯已實現
- ✗ Web 前端無法建置

## 下一步行動

請選擇以下其中一個方向：

1. **專注於 API 部署**：先讓後端服務上線
2. **重構前端**：使用 Next.js 13 或其他框架
3. **等待修復**：追蹤 Next.js GitHub issues 等待官方修復

## 相關資源

- Next.js styled-jsx issue: https://github.com/vercel/next.js/issues
- Next.js 15 RC: https://nextjs.org/blog/next-15-rc
- Render 部署文檔: https://render.com/docs

---

**建議**：優先部署 API 服務，這樣至少後端功能可以正常運行和測試。前端可以之後再處理。
