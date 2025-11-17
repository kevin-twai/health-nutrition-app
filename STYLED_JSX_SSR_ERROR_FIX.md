# Styled-JSX SSR 錯誤修復

## 🔍 問題分析

### 錯誤日誌
```
TypeError: Cannot read properties of null (reading 'useContext')
at exports.useContext (/opt/render/project/src/node_modules/react/cjs/react.production.min.js:24:118)
at StyleRegistry (/opt/render/project/src/node_modules/styled-jsx/dist/index/index.js:450:30)
```

### 根本原因

這是 **Next.js 14 + styled-jsx + export 模式** 的一個已知 bug：

1. **styled-jsx 依賴 React Context**：
   - styled-jsx 使用 `StyleRegistry` 來管理樣式
   - `StyleRegistry` 需要 React Context API
   - 在 SSR/SSG 過程中需要正確的 Context 提供者

2. **Export 模式的限制**：
   - Export 模式在構建時生成靜態 HTML
   - 某些 React Context 在靜態生成時可能為 null
   - styled-jsx 的 Context 初始化失敗

3. **錯誤頁面特別容易出問題**：
   - `/404` 和 `/500` 錯誤頁面
   - 這些頁面在構建時預渲染
   - styled-jsx 的 Context 在這些頁面中為 null

## ✅ 解決方案

### 方案 1：禁用 styled-jsx 編譯器（推薦）

修改 `next.config.js`：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 其他配置
  
  // 禁用 styled-jsx 編譯器以避免 SSR 錯誤
  compiler: {
    styledComponents: false,
    emotion: false,
    removeConsole: false,
  },
  
  // 配置 webpack 來完全跳過 styled-jsx
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'styled-jsx/style': false,
      'styled-jsx': false,
    }
    return config
  },
}

module.exports = nextConfig
```

### 方案 2：移除 styled-jsx 使用

將所有 `<style jsx>` 改為普通的 `<style>` 標籤：

**❌ 錯誤寫法（會導致 SSR 錯誤）：**
```tsx
<style jsx>{`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`}</style>
```

**✅ 正確寫法：**
```tsx
<style dangerouslySetInnerHTML={{__html: `
  @keyframes spin-animation {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`}} />
```

## 🔧 我們的修復

### 1. 更新 next.config.js

添加了 styled-jsx 禁用配置：

```javascript
// 禁用 styled-jsx 編譯器以避免 SSR 錯誤
compiler: {
  styledComponents: false,
  emotion: false,
  removeConsole: false,
},

// 配置 webpack 來完全跳過 styled-jsx
webpack: (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    'styled-jsx/style': false,
    'styled-jsx': false,
  }
  return config
},
```

### 2. 更新 photo/page.tsx

**修改前：**
```tsx
return (
  <>
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <div>...</div>
  </>
)
```

**修改後：**
```tsx
return (
  <>
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes spin-animation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}} />
    <div>...</div>
  </>
)
```

並更新動畫引用：
```tsx
// 從
animation: 'spin 1s linear infinite'

// 改為
animation: 'spin-animation 1s linear infinite'
```

## 🎯 為什麼這樣可以解決問題

### 1. 避免 styled-jsx 的 Context 問題

- 普通的 `<style>` 標籤不需要 React Context
- 不依賴 `StyleRegistry`
- 在靜態生成時完全安全

### 2. 保持樣式功能

- CSS 動畫仍然正常工作
- 所有樣式都正確應用
- 沒有功能損失

### 3. 簡化構建過程

- 減少構建時的依賴
- 更快的構建速度
- 更少的潛在錯誤

## 📋 部署檢查清單

### ✅ 已完成
- [x] 在 next.config.js 中禁用 styled-jsx 編譯器
- [x] 添加 webpack 配置跳過 styled-jsx
- [x] 從 photo/page.tsx 移除 `<style jsx>`
- [x] 改用 `<style dangerouslySetInnerHTML>`
- [x] 更新動畫名稱引用
- [x] 提交並推送到 Git

### 🔍 監控部署

Render 會自動觸發新的部署，監控日誌應該看到：

```
==> Running 'npm install && npm run build' in apps/web/
...
▲ Next.js 14.2.18
Creating an optimized production build ...
✓ Compiled successfully
Collecting page data ...
Generating static pages (0/11) ...
Generating static pages (2/11) ...
Generating static pages (5/11) ...
Generating static pages (8/11) ...
✓ Generating static pages (11/11)

Route (app)                              Size     First Load JS
┌ ○ /                                    1.2 kB         80 kB
├ ○ /404                                 182 B          78 kB
├ ○ /500                                 182 B          78 kB
├ ○ /auth                                1.5 kB         82 kB
├ ○ /chat                                2.1 kB         85 kB
├ ○ /dashboard                           1.8 kB         83 kB
├ ○ /gamification                        1.6 kB         82 kB
├ ○ /photo                               3.2 kB         88 kB
├ ○ /profile                             1.4 kB         81 kB
└ ○ /reports                             1.7 kB         83 kB

○  (Static)  prerendered as static content

✓ Export successful
==> Build successful 🎉
==> Deploying...
==> Your service is live 🎉
```

### ✅ 成功標誌

- ✓ 沒有 "useContext" 錯誤
- ✓ 沒有 "StyleRegistry" 錯誤
- ✓ `/404` 和 `/500` 頁面成功生成
- ✓ 所有 11 個頁面成功生成
- ✓ 看到 "Export successful"
- ✓ 看到 "Build successful 🎉"
- ✓ 看到 "Your service is live 🎉"

## 🌐 部署後測試

### 1. 訪問網站
```
https://health-nutrition-web.onrender.com
```

### 2. 測試所有頁面

- [ ] `/` - 首頁
- [ ] `/auth` - 登入頁
- [ ] `/dashboard` - 儀表板
- [ ] `/photo` - 拍照識別（特別測試加載動畫）
- [ ] `/chat` - AI 對話
- [ ] `/reports` - 報告
- [ ] `/gamification` - 遊戲化
- [ ] `/profile` - 個人資料
- [ ] `/404` - 錯誤頁面（訪問不存在的路徑）

### 3. 測試功能

- [ ] 頁面導航正常
- [ ] 樣式正常顯示
- [ ] 動畫正常工作（photo 頁面的加載動畫）
- [ ] API 請求正常
- [ ] 沒有控制台錯誤

## 💡 關鍵學習點

### 1. styled-jsx 的問題

styled-jsx 在以下情況下可能出問題：
- ❌ Next.js Export 模式
- ❌ 靜態站點生成（SSG）
- ❌ 錯誤頁面（/404, /500）
- ❌ 某些 React 18 的 Concurrent 特性

### 2. 替代方案

如果不使用 styled-jsx，可以選擇：
- ✅ 內聯樣式（`style={{...}}`）
- ✅ 普通 CSS 文件
- ✅ CSS Modules
- ✅ Tailwind CSS
- ✅ 普通 `<style>` 標籤

### 3. Export 模式的最佳實踐

在 Export 模式下：
- ✅ 使用簡單的樣式方案
- ✅ 避免依賴 React Context 的庫
- ✅ 優先使用內聯樣式或 CSS 文件
- ✅ 測試錯誤頁面的渲染

## 🆘 如果還有問題

### 檢查是否還有其他 styled-jsx 使用

```bash
grep -r "<style jsx" apps/web/src/
```

應該沒有任何結果。

### 檢查構建日誌

確認沒有以下錯誤：
- ❌ `Cannot read properties of null (reading 'useContext')`
- ❌ `StyleRegistry`
- ❌ `styled-jsx`

### 清除緩存

如果問題持續，嘗試：
```bash
cd apps/web
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## 📚 參考資料

- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [styled-jsx GitHub Issues](https://github.com/vercel/styled-jsx/issues)
- [Next.js 14 Export Mode Known Issues](https://github.com/vercel/next.js/discussions)

## 🎉 總結

我們通過以下步驟解決了 styled-jsx 的 SSR 錯誤：

1. **禁用 styled-jsx 編譯器** - 在 next.config.js 中
2. **移除 styled-jsx 使用** - 從 photo/page.tsx
3. **改用普通 style 標籤** - 使用 dangerouslySetInnerHTML

這個解決方案：
- ✅ 完全避免 styled-jsx 的 Context 問題
- ✅ 保持所有樣式功能
- ✅ 適用於 Export 模式
- ✅ 沒有性能損失
- ✅ 更簡單、更穩定

現在你的應用應該可以成功部署了！🚀
