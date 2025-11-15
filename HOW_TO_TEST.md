# 如何測試食物識別功能

## 🚀 最簡單的方法（推薦）

### 1. 準備一張食物照片
- 可以是手機拍的
- 可以從網路下載
- 任何食物都可以

### 2. 執行測試命令
```bash
./test-single-image.sh ~/Downloads/your-food-photo.jpg
```

### 3. 查看結果
腳本會自動顯示：
- ✅ 識別到的食物
- 📊 營養成分
- ⏱️ 處理時間
- 💯 信心度

就這麼簡單！

---

## 📸 測試範例

### 範例 1: 測試一張牛肉麵照片
```bash
# 假設你有一張牛肉麵照片在桌面
./test-single-image.sh ~/Desktop/beef-noodles.jpg
```

**預期輸出**:
```
🍽️  食物識別測試工具
================================

📸 圖片: /Users/you/Desktop/beef-noodles.jpg

🔍 開始識別...

================================

✅ 識別成功！

📊 識別結果:
  信心度: 95%
  處理時間: 6200ms
  識別到 1 個食物

🍱 食物清單:

1. 牛肉麵
   份量: 1 碗
   熱量: 550 kcal
   蛋白質: 28g | 碳水: 65g | 脂肪: 18g

================================
📈 總營養成分:
  總熱量: 550 kcal
  總蛋白質: 28g
  總碳水化合物: 65g
  總脂肪: 18g

✓ 完整結果已儲存到 last-recognition-result.json
```

### 範例 2: 測試便當（多個食物）
```bash
./test-single-image.sh ~/Downloads/bento.jpg
```

**預期輸出**:
```
✅ 識別成功！

📊 識別結果:
  信心度: 88%
  處理時間: 8500ms
  識別到 4 個食物

🍱 食物清單:

1. 白飯
   份量: 1 碗
   熱量: 200 kcal
   蛋白質: 4g | 碳水: 45g | 脂肪: 0.5g

2. 炸雞腿
   份量: 1 塊
   熱量: 280 kcal
   蛋白質: 22g | 碳水: 12g | 脂肪: 16g

3. 炒青菜
   份量: 100 克
   熱量: 45 kcal
   蛋白質: 2g | 碳水: 6g | 脂肪: 2g

4. 滷蛋
   份量: 1 個
   熱量: 80 kcal
   蛋白質: 6g | 碳水: 1g | 脂肪: 6g

================================
📈 總營養成分:
  總熱量: 605 kcal
  總蛋白質: 34g
  總碳水化合物: 64g
  總脂肪: 24.5g
```

---

## 🎯 測試不同類型的食物

### 中式料理
```bash
./test-single-image.sh ./炒飯.jpg
./test-single-image.sh ./水餃.jpg
./test-single-image.sh ./滷肉飯.jpg
```

### 日式料理
```bash
./test-single-image.sh ./壽司.jpg
./test-single-image.sh ./拉麵.jpg
./test-single-image.sh ./生魚片.jpg
```

### 西式料理
```bash
./test-single-image.sh ./漢堡.jpg
./test-single-image.sh ./披薩.jpg
./test-single-image.sh ./義大利麵.jpg
```

### 水果
```bash
./test-single-image.sh ./蘋果.jpg
./test-single-image.sh ./香蕉.jpg
```

---

## 📊 查看詳細結果

每次測試後，完整的 JSON 結果會儲存到 `last-recognition-result.json`：

```bash
# 查看完整結果（格式化）
cat last-recognition-result.json | jq '.'

# 只看食物名稱
cat last-recognition-result.json | jq '.foods[].name'

# 只看營養成分
cat last-recognition-result.json | jq '.foods[].nutrition'

# 查看信心度
cat last-recognition-result.json | jq '.confidence'
```

---

## 🔧 進階用法

### 使用自己的 Token
如果你已經有帳號和 token：

```bash
./test-single-image.sh ./food.jpg "your_token_here"
```

### 批次測試多張圖片
1. 將圖片放到 `test-images/` 目錄
2. 編輯 `test-food-recognition-accuracy.sh`
3. 取消註解測試案例
4. 執行：
```bash
./test-food-recognition-accuracy.sh
```

---

## 💡 測試技巧

### 1. 測試不同角度
同一盤食物，從不同角度拍攝：
- 俯視（正上方）
- 45 度角
- 側面

比較哪個角度識別效果最好。

### 2. 測試不同光線
- 自然光
- 室內燈光
- 昏暗環境

評估光線對識別準確度的影響。

### 3. 測試相似食物
測試系統能否區分相似的食物：
- 炒飯 vs 炒麵
- 壽司 vs 生魚片
- 拿鐵 vs 卡布奇諾

### 4. 測試複雜場景
- 便當（多種食物）
- 自助餐盤
- 火鍋
- 下午茶套餐

---

## 📝 記錄測試結果

建議建立一個測試記錄：

```markdown
# 我的測試記錄

## 2024-XX-XX

### 測試 1: 牛肉麵
- 信心度: 95%
- 結果: ✅ 完美識別
- 備註: 光線充足，角度好

### 測試 2: 便當
- 信心度: 88%
- 結果: ✅ 識別出 4 個食物
- 備註: 有一個配菜識別錯誤

### 測試 3: 水果拼盤
- 信心度: 92%
- 結果: ✅ 全部正確
- 備註: 簡單場景，識別快速
```

---

## 🐛 遇到問題？

### 問題 1: 腳本無法執行
```bash
# 給予執行權限
chmod +x test-single-image.sh
```

### 問題 2: 找不到圖片
```bash
# 檢查檔案是否存在
ls -la ~/Downloads/food.jpg

# 使用絕對路徑
./test-single-image.sh /Users/username/Downloads/food.jpg
```

### 問題 3: 識別失敗
可能原因：
- 圖片太大（> 10MB）→ 壓縮圖片
- 圖片模糊 → 重新拍攝
- 網路問題 → 檢查連線
- API 暫時無法使用 → 稍後重試

### 問題 4: 識別結果不準確
改善方法：
- 確保光線充足
- 使用俯視或 45 度角
- 背景簡單
- 食物清晰可見
- 避免食物重疊

---

## 📚 更多資源

- **快速範例**: `QUICK_TEST_EXAMPLE.md`
- **完整指南**: `FOOD_RECOGNITION_TESTING_GUIDE.md`
- **工具總結**: `TESTING_SUMMARY.md`
- **測試圖片**: `test-images/README.md`

---

## 🎉 開始測試！

現在就試試看吧！

```bash
# 1. 找一張食物照片
# 2. 執行測試
./test-single-image.sh ~/Downloads/your-food.jpg

# 3. 查看結果
# 4. 享受測試的樂趣！
```

有任何問題或發現，歡迎回報！🚀
