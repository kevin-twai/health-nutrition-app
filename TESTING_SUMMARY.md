# 食物識別測試工具總結

## ✅ 已建立的測試工具

### 1. 單張圖片測試工具 ⭐ 推薦
**檔案**: `test-single-image.sh`

最簡單易用的測試工具，適合快速驗證。

**使用方法**:
```bash
./test-single-image.sh <圖片路徑>
```

**範例**:
```bash
./test-single-image.sh ~/Downloads/food.jpg
```

**輸出內容**:
- ✅ 識別信心度
- ✅ 處理時間
- ✅ 識別到的食物清單
- ✅ 每個食物的營養成分
- ✅ 總營養成分
- ✅ 完整 JSON 結果（儲存到 `last-recognition-result.json`）

---

### 2. 批次測試工具
**檔案**: `test-food-recognition-accuracy.sh`

用於測試多張圖片並生成統計報告。

**使用方法**:
```bash
./test-food-recognition-accuracy.sh [token]
```

**功能**:
- 批次測試多張圖片
- 自動統計成功率
- 生成測試報告
- 支援不同食物類別

**準備工作**:
1. 建立 `test-images` 目錄
2. 放入測試圖片
3. 在腳本中取消註解測試案例

---

### 3. 測試文件

#### 📘 完整測試指南
**檔案**: `FOOD_RECOGNITION_TESTING_GUIDE.md`

包含：
- 測試目標和策略
- 詳細測試流程
- 評估標準
- 問題排查
- 測試報告範本

#### 🚀 快速開始指南
**檔案**: `QUICK_TEST_EXAMPLE.md`

包含：
- 5 分鐘快速測試
- 3 種測試方法
- 測試技巧
- 成功案例
- 常見問題解決

#### 📁 測試圖片目錄
**目錄**: `test-images/`

包含：
- 測試圖片存放位置
- 圖片準備指南
- 建議的測試案例
- 測試記錄範本

---

## 🎯 快速開始（3 步驟）

### 步驟 1: 準備圖片
```bash
# 下載或拍攝一張食物照片
# 例如: ~/Downloads/my-food.jpg
```

### 步驟 2: 執行測試
```bash
./test-single-image.sh ~/Downloads/my-food.jpg
```

### 步驟 3: 查看結果
```bash
# 查看完整結果
cat last-recognition-result.json | jq '.'

# 只看食物名稱
cat last-recognition-result.json | jq '.foods[].name'
```

---

## 📊 測試建議

### 優先測試的食物類型

1. **常見中式料理** (最重要)
   - 炒飯、牛肉麵、水餃、滷肉飯
   - 預期準確度: > 85%

2. **日式料理**
   - 壽司、生魚片、拉麵
   - 預期準確度: > 80%

3. **簡單食物**
   - 水果、飲料、單一菜餚
   - 預期準確度: > 90%

4. **複雜場景**
   - 便當、自助餐盤、多種食物
   - 預期準確度: > 70%

### 測試策略

#### 階段 1: 基礎驗證（10-20 張圖片）
- 測試常見食物
- 驗證基本功能
- 評估整體準確度

#### 階段 2: 深度測試（50-100 張圖片）
- 測試各種食物類型
- 測試不同拍攝角度
- 測試複雜場景

#### 階段 3: 壓力測試（100+ 張圖片）
- 大量圖片批次測試
- 統計分析
- 找出改進方向

---

## 📈 評估標準

### 識別準確度
- **優秀**: 信心度 > 90%
- **良好**: 信心度 > 70%
- **可接受**: 信心度 > 50%
- **需改進**: 信心度 < 50%

### 處理速度
- **快速**: < 5 秒
- **正常**: 5-10 秒
- **較慢**: 10-15 秒
- **需優化**: > 15 秒

### 營養準確度
- 熱量誤差 < 20%
- 三大營養素誤差 < 30%

---

## 🔧 工具對比

| 工具 | 適用場景 | 難度 | 輸出 |
|------|---------|------|------|
| test-single-image.sh | 快速測試單張圖片 | ⭐ 簡單 | 詳細結果 + JSON |
| test-food-recognition-accuracy.sh | 批次測試多張圖片 | ⭐⭐ 中等 | 統計報告 |
| curl 命令 | 手動測試 API | ⭐⭐⭐ 進階 | 原始 JSON |
| 網頁測試工具 | 視覺化測試 | ⭐ 簡單 | 網頁介面 |

---

## 💡 測試技巧

### 1. 對比測試
測試相似食物，評估區分能力：
```bash
./test-single-image.sh ./fried-rice.jpg
./test-single-image.sh ./fried-noodles.jpg
```

### 2. 角度測試
同一食物，不同角度：
```bash
./test-single-image.sh ./top-view.jpg
./test-single-image.sh ./side-view.jpg
```

### 3. 份量測試
同一食物，不同份量：
```bash
./test-single-image.sh ./small-portion.jpg
./test-single-image.sh ./large-portion.jpg
```

### 4. 光線測試
同一食物，不同光線條件：
```bash
./test-single-image.sh ./bright-light.jpg
./test-single-image.sh ./dim-light.jpg
```

---

## 📝 測試記錄範本

建立 `test-results.md` 記錄測試結果：

```markdown
# 測試記錄

## 測試日期: 2024-XX-XX

### 測試 1: 牛肉麵
- 圖片: beef-noodles.jpg
- 信心度: 95%
- 處理時間: 6.2s
- 結果: ✅ 成功
- 備註: 完美識別

### 測試 2: 壽司拼盤
- 圖片: sushi-plate.jpg
- 信心度: 88%
- 處理時間: 8.5s
- 結果: ✅ 成功
- 備註: 識別出 3 種壽司

### 統計
- 總測試: 10
- 成功: 9 (90%)
- 失敗: 1 (10%)
- 平均信心度: 87%
- 平均處理時間: 7.2s
```

---

## 🐛 常見問題

### Q1: 腳本無法執行
```bash
# 給予執行權限
chmod +x test-single-image.sh
chmod +x test-food-recognition-accuracy.sh
```

### Q2: 找不到 jq 命令
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

### Q3: 圖片路徑錯誤
```bash
# 使用絕對路徑
./test-single-image.sh /Users/username/Downloads/food.jpg

# 或使用 ~ 代表家目錄
./test-single-image.sh ~/Downloads/food.jpg
```

### Q4: 識別失敗
可能原因：
1. 圖片格式不支援 → 轉換為 JPG
2. 圖片太大 → 壓縮到 < 10MB
3. 網路問題 → 檢查連線
4. API 暫時無法使用 → 稍後重試

---

## 📚 相關文件

- `FOOD_RECOGNITION_TESTING_GUIDE.md` - 完整測試指南
- `QUICK_TEST_EXAMPLE.md` - 快速開始範例
- `MONGODB_ATLAS_SETUP.md` - MongoDB 設定（可選）
- `DEPLOYMENT_COMPLETE.md` - 部署文件
- `API_DEPLOYMENT_SUMMARY.md` - API 文件

---

## 🎉 開始測試！

現在你已經有了完整的測試工具，可以開始測試食物識別功能了！

**推薦流程**:
1. 先用 `test-single-image.sh` 測試幾張圖片
2. 熟悉工具後，準備更多測試圖片
3. 使用批次測試工具進行大規模測試
4. 記錄結果並分析改進方向

祝測試順利！🚀
