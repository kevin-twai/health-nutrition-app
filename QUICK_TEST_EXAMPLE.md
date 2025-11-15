# 快速測試範例

## 🚀 5 分鐘快速測試

### 方法 1: 使用測試腳本（推薦）

1. 準備一張食物照片（任何格式）
2. 執行測試：

```bash
./test-single-image.sh ~/Downloads/my-food.jpg
```

3. 查看結果！

### 方法 2: 使用 curl 命令

```bash
# 1. 註冊並取得 token
curl -X POST https://health-nutrition-tracker-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "Test User"
  }' | jq -r '.token'

# 2. 儲存 token
TOKEN="your_token_here"

# 3. 上傳圖片並識別
curl -X POST https://health-nutrition-tracker-api.onrender.com/api/v1/photo/recognize \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@./my-food.jpg" | jq '.'
```

### 方法 3: 使用網頁測試工具

1. 開啟瀏覽器
2. 前往測試頁面：`apps/web/public/test-vision-api.html`
3. 選擇圖片
4. 點擊「識別食物」
5. 查看結果

## 📸 測試圖片建議

### 好的測試圖片：
- ✅ 光線充足
- ✅ 食物清晰可見
- ✅ 俯視或 45 度角
- ✅ 背景簡單
- ✅ 單一或少數食物

### 避免的情況：
- ❌ 光線昏暗
- ❌ 食物模糊
- ❌ 角度過於傾斜
- ❌ 背景雜亂
- ❌ 食物重疊嚴重

## 🎯 預期結果

成功的識別應該包含：

```json
{
  "success": true,
  "confidence": 0.95,
  "foods": [
    {
      "name": "牛肉麵",
      "portion": {
        "amount": 1,
        "unit": "碗"
      },
      "nutrition": {
        "calories": 550,
        "protein": 28,
        "carbohydrates": 65,
        "fat": 18
      }
    }
  ],
  "processingTime": 5200
}
```

## 📊 測試不同類型的食物

### 簡單食物（單一項目）
```bash
# 水果
./test-single-image.sh ./apple.jpg

# 飲料
./test-single-image.sh ./coffee.jpg

# 單一菜餚
./test-single-image.sh ./fried-rice.jpg
```

### 複雜場景（多個食物）
```bash
# 便當
./test-single-image.sh ./bento.jpg

# 自助餐
./test-single-image.sh ./buffet-plate.jpg

# 早餐組合
./test-single-image.sh ./breakfast-set.jpg
```

## 🔍 解讀測試結果

### 信心度 (Confidence)
- **0.9 - 1.0**: 非常確定，識別準確
- **0.7 - 0.9**: 相當確定，可能有小誤差
- **0.5 - 0.7**: 不太確定，建議人工確認
- **< 0.5**: 識別可能不準確

### 處理時間 (Processing Time)
- **< 5000ms**: 快速
- **5000-10000ms**: 正常
- **> 10000ms**: 較慢（可能是複雜場景）

## 💡 測試技巧

### 1. 測試相似食物
比較系統如何區分相似的食物：
```bash
./test-single-image.sh ./fried-rice.jpg
./test-single-image.sh ./fried-noodles.jpg
```

### 2. 測試不同份量
同一種食物，不同份量：
```bash
./test-single-image.sh ./small-portion.jpg
./test-single-image.sh ./large-portion.jpg
```

### 3. 測試不同角度
同一盤食物，不同拍攝角度：
```bash
./test-single-image.sh ./top-view.jpg
./test-single-image.sh ./side-view.jpg
./test-single-image.sh ./45-degree.jpg
```

## 📝 記錄測試結果

每次測試後，結果會自動儲存到 `last-recognition-result.json`：

```bash
# 查看完整結果
cat last-recognition-result.json | jq '.'

# 只看食物名稱
cat last-recognition-result.json | jq '.foods[].name'

# 只看營養成分
cat last-recognition-result.json | jq '.foods[].nutrition'
```

## 🎉 成功案例

### 案例 1: 生魚片蓋飯
```
✅ 識別成功！
信心度: 95%
處理時間: 9142ms
識別到 1 個食物

1. 生魚片蓋飯
   份量: 1 碗
   熱量: 520 kcal
   蛋白質: 32g | 碳水: 68g | 脂肪: 12g
```

### 案例 2: 水果拼盤
```
✅ 識別成功！
信心度: 88%
處理時間: 6500ms
識別到 3 個食物

1. 蘋果
   份量: 1 個
   熱量: 95 kcal

2. 香蕉
   份量: 1 根
   熱量: 105 kcal

3. 葡萄
   份量: 100 克
   熱量: 69 kcal
```

## 🐛 遇到問題？

### 錯誤: "圖片檔案不存在"
```bash
# 檢查檔案路徑
ls -la ~/Downloads/my-food.jpg

# 使用絕對路徑
./test-single-image.sh /Users/username/Downloads/my-food.jpg
```

### 錯誤: "無法取得 token"
```bash
# 手動註冊並取得 token
curl -X POST https://health-nutrition-tracker-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test123@example.com","password":"Test123456","name":"Test"}' \
  | jq -r '.token'

# 使用取得的 token
./test-single-image.sh ./my-food.jpg "your_token_here"
```

### 錯誤: "識別失敗"
可能原因：
1. 圖片格式不支援 → 轉換為 JPG
2. 圖片太大 → 壓縮到 < 10MB
3. 網路問題 → 檢查連線
4. API 暫時無法使用 → 稍後重試

## 📚 更多資源

- 完整測試指南: `FOOD_RECOGNITION_TESTING_GUIDE.md`
- MongoDB 設定: `MONGODB_ATLAS_SETUP.md`
- API 文件: `API_DEPLOYMENT_SUMMARY.md`
- 部署指南: `DEPLOYMENT_COMPLETE.md`
