# 測試圖片目錄

## 📁 目錄說明

這個目錄用於存放食物識別測試圖片。

## 📸 如何準備測試圖片

### 1. 從網路下載
可以從以下網站下載食物圖片：
- Unsplash (https://unsplash.com/s/photos/food)
- Pexels (https://www.pexels.com/search/food/)
- Pixabay (https://pixabay.com/images/search/food/)

### 2. 自己拍攝
使用手機或相機拍攝食物照片：
- 光線充足
- 食物清晰
- 俯視或 45 度角
- 背景簡單

### 3. 使用範例圖片
如果沒有圖片，可以先用任何食物照片測試。

## 📋 建議的測試圖片

### 中式料理
- [ ] beef-noodles.jpg (牛肉麵)
- [ ] fried-rice.jpg (炒飯)
- [ ] dumplings.jpg (水餃)
- [ ] braised-pork-rice.jpg (滷肉飯)

### 日式料理
- [ ] sushi.jpg (壽司)
- [ ] sashimi.jpg (生魚片)
- [ ] ramen.jpg (拉麵)
- [ ] tempura.jpg (天婦羅)

### 西式料理
- [ ] burger.jpg (漢堡)
- [ ] pizza.jpg (披薩)
- [ ] pasta.jpg (義大利麵)
- [ ] steak.jpg (牛排)

### 水果
- [ ] apple.jpg (蘋果)
- [ ] banana.jpg (香蕉)
- [ ] orange.jpg (橘子)

### 複雜場景
- [ ] bento.jpg (便當)
- [ ] buffet-plate.jpg (自助餐盤)
- [ ] breakfast-set.jpg (早餐組合)

## 🎯 圖片要求

- **格式**: JPG, PNG, WEBP
- **大小**: < 10MB
- **解析度**: 建議 1000x1000 以上
- **內容**: 清晰的食物照片

## 🚀 開始測試

將圖片放入此目錄後，執行：

```bash
# 測試單張圖片
./test-single-image.sh ./test-images/beef-noodles.jpg

# 批次測試（需要先在腳本中設定）
./test-food-recognition-accuracy.sh
```

## 📊 測試記錄

建議建立一個測試記錄表格：

| 檔名 | 食物類型 | 測試日期 | 結果 | 備註 |
|------|---------|---------|------|------|
| beef-noodles.jpg | 牛肉麵 | 2024-XX-XX | ✓ | 信心度 95% |
| sushi.jpg | 壽司 | 2024-XX-XX | ✓ | 信心度 88% |
| ... | ... | ... | ... | ... |

## 💡 提示

1. 檔名使用英文，方便腳本處理
2. 可以建立子目錄分類（如 chinese/, japanese/, western/）
3. 保留原始圖片，方便重複測試
4. 記錄測試結果，追蹤改進情況
