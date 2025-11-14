# cURL 測試命令集合

如果你不想使用 Postman，可以直接用 cURL 測試 API。

## 🔧 設定變數

```bash
# 設定 API URL
export API_URL="https://health-nutrition-api.onrender.com"

# Token 會在登入後設定
export JWT_TOKEN=""
```

---

## 1️⃣ 健康檢查

```bash
curl -X GET "$API_URL/health" | jq
```

---

## 2️⃣ 註冊用戶

```bash
curl -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "測試用戶"
  }' | jq
```

---

## 3️⃣ 登入並儲存 Token

```bash
# 登入並自動儲存 Token
response=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "$response" | jq

# 提取並儲存 Token
export JWT_TOKEN=$(echo "$response" | jq -r '.token // .accessToken // .jwt')

echo "Token 已儲存: ${JWT_TOKEN:0:20}..."
```

---

## 4️⃣ 獲取用戶資料

```bash
curl -X GET "$API_URL/api/users/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq
```

---

## 5️⃣ 上傳食物圖片

```bash
# 替換 /path/to/food-image.jpg 為你的圖片路徑
curl -X POST "$API_URL/api/photo/recognize" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "image=@/path/to/food-image.jpg" | jq
```

**範例（使用測試圖片）：**

```bash
# 如果你有一張名為 food.jpg 的圖片在當前目錄
curl -X POST "$API_URL/api/photo/recognize" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "image=@./food.jpg" | jq
```

---

## 6️⃣ 查看識別歷史

```bash
curl -X GET "$API_URL/api/photo/history" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq
```

---

## 7️⃣ AI 聊天

```bash
curl -X POST "$API_URL/api/chat/message" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "我今天吃了什麼？營養均衡嗎？"
  }' | jq
```

**更多測試問題：**

```bash
# 查詢今日飲食
curl -X POST "$API_URL/api/chat/message" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "我今天吃了什麼？"}' | jq

# 營養分析
curl -X POST "$API_URL/api/chat/message" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "我的蛋白質攝取夠嗎？"}' | jq

# 健康建議
curl -X POST "$API_URL/api/chat/message" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "給我一些健康飲食建議"}' | jq
```

---

## 8️⃣ 營養報告

```bash
# 每日報告
curl -X GET "$API_URL/api/reports/nutrition?period=day" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq

# 每週報告
curl -X GET "$API_URL/api/reports/nutrition?period=week" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq

# 每月報告
curl -X GET "$API_URL/api/reports/nutrition?period=month" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq
```

---

## 9️⃣ 遊戲化功能

```bash
# 獲取遊戲化資料
curl -X GET "$API_URL/api/gamification/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq

# 獲取成就列表
curl -X GET "$API_URL/api/gamification/achievements" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq

# 獲取排行榜
curl -X GET "$API_URL/api/gamification/leaderboard" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq
```

---

## 🔟 監控端點

```bash
# 系統狀態
curl -X GET "$API_URL/api/monitoring/status" | jq

# 效能指標
curl -X GET "$API_URL/api/monitoring/metrics" | jq

# 食物識別監控
curl -X GET "$API_URL/api/monitoring/food-recognition" | jq
```

---

## 🚀 完整測試腳本

建立一個測試腳本 `test-api.sh`：

```bash
#!/bin/bash

API_URL="https://health-nutrition-api.onrender.com"

echo "🚀 開始測試 Health Nutrition API"
echo "================================"

# 1. 健康檢查
echo -e "\n1️⃣ 健康檢查..."
curl -s "$API_URL/health" | jq -r '.status'

# 2. 註冊用戶
echo -e "\n2️⃣ 註冊用戶..."
register_response=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "測試用戶"
  }')
echo "$register_response" | jq -r '.message // .error'

# 3. 登入
echo -e "\n3️⃣ 登入用戶..."
login_response=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

JWT_TOKEN=$(echo "$login_response" | jq -r '.token // .accessToken // .jwt')

if [ -n "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ]; then
    echo "✅ 登入成功，Token: ${JWT_TOKEN:0:20}..."
else
    echo "❌ 登入失敗"
    exit 1
fi

# 4. 獲取用戶資料
echo -e "\n4️⃣ 獲取用戶資料..."
curl -s "$API_URL/api/users/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq -r '.email'

# 5. 測試 AI 聊天
echo -e "\n5️⃣ 測試 AI 聊天..."
curl -s -X POST "$API_URL/api/chat/message" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "你好"}' | jq -r '.response' | head -c 100

# 6. 獲取遊戲化資料
echo -e "\n\n6️⃣ 獲取遊戲化資料..."
curl -s "$API_URL/api/gamification/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq -r '.points'

echo -e "\n\n✅ 測試完成！"
echo "================================"
```

執行測試：

```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 📸 測試食物圖片上傳

如果你沒有食物圖片，可以：

1. **下載測試圖片：**
```bash
# 下載一張食物圖片
curl -o food-test.jpg "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"

# 上傳測試
curl -X POST "$API_URL/api/photo/recognize" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "image=@food-test.jpg" | jq
```

2. **使用手機拍攝：**
   - 拍一張食物照片
   - 傳到電腦
   - 使用上面的 curl 命令上傳

---

## 🔍 調試技巧

### 查看完整回應（包含 headers）

```bash
curl -v -X GET "$API_URL/health"
```

### 只查看 HTTP 狀態碼

```bash
curl -s -o /dev/null -w "%{http_code}" "$API_URL/health"
```

### 儲存回應到檔案

```bash
curl -X GET "$API_URL/health" > response.json
cat response.json | jq
```

### 測試回應時間

```bash
curl -w "\nTime: %{time_total}s\n" -o /dev/null -s "$API_URL/health"
```

---

## ⚠️ 注意事項

1. **Token 過期：** JWT Token 可能會過期，需要重新登入
2. **圖片大小：** 上傳的圖片不要超過 5MB
3. **API 限制：** 注意 API 的 rate limiting
4. **jq 工具：** 如果沒有 jq，可以移除 `| jq` 部分

---

**準備好了嗎？** 開始測試你的 API！ 🚀
