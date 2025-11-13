# 容器和餐具排除修復

## 問題描述

系統錯誤地將容器（如蒸籠、竹籠）識別為食材並計算營養價值。

### 錯誤案例

**小籠包照片辨識結果：**
1. ✅ 小籠包 - 正確（食物）
2. ❌ 蒸籠 - 錯誤（容器，不是食物）
3. ✅ 青菜 - 正確（食物）

**問題：**
- 蒸籠被識別為食材
- 系統為蒸籠計算了營養價值（200卡路里、8g蛋白質等）
- 這會導致營養追蹤不準確

## 根本原因

OpenAI Vision API 會識別圖片中的所有物體，包括：
- 食物
- 容器（碗、盤、蒸籠）
- 餐具（筷子、湯匙）
- 背景物品

如果沒有明確指示，AI 可能會將這些非食物項目也當作食材。

## 解決方案

### 1. 添加明確的排除清單

在 prompt 中添加了詳細的排除指示：

```
🚫 **絕對不要識別以下非食物項目**：
- **容器和餐具**：碗、盤子、蒸籠、竹籠、竹筒（空的）、杯子、筷子、湯匙、叉子
- **裝飾物**：桌布、餐巾、花朵裝飾、葉片裝飾（非食用）
- **背景物品**：桌子、椅子、牆壁、其他人的手或臉
- **包裝材料**：塑膠袋、紙盒、鋁箔紙、保鮮膜
- **調味料容器**：醬油瓶、鹽罐、胡椒罐（只識別實際使用的調味料）
```

### 2. 特別強調常見錯誤

針對容易混淆的項目添加特別說明：

```
⚠️ **特別注意**：
- **蒸籠/竹籠**：這是容器，不是食物！不要識別！
- **空的竹筒**：如果竹筒是空的或只是容器，不要識別
- **竹筒飯**：如果竹筒裡有米飯，識別「竹筒飯」而不是「竹筒」
- **葉片包裹**：如果是用來包裹食物的葉片（如粽葉、月桃葉），
  識別包裹的食物（如粽子、阿粨），而不是葉片本身
```

### 3. 英文 Prompt 同步更新

在重試機制使用的英文 prompt 中也添加了相同的排除指示：

```
IMPORTANT - DO NOT identify these non-food items:
- Containers and utensils: bowls, plates, steamer baskets, bamboo steamers, 
  cups, chopsticks, spoons, forks
- Decorations: tablecloths, napkins, flower decorations
- Background items: tables, chairs, walls, people's hands or faces
- Packaging: plastic bags, boxes, aluminum foil, plastic wrap

SPECIAL NOTE:
- Steamer baskets/bamboo steamers are containers, NOT food! Do not identify them!
- Empty bamboo tubes are containers, not food
- If bamboo tube contains rice, identify as "bamboo tube rice", not "bamboo tube"
```

## 修改的文件

- `apps/api/src/simple-server.js`
  - 更新中文 prompt（主要 API 調用）
  - 更新英文 prompt（重試機制）

## 測試方法

### 測試案例 1: 小籠包（蒸籠）

上傳包含蒸籠的小籠包照片，確認：
- ✅ 識別出小籠包
- ✅ 識別出配菜（如青菜）
- ❌ 不識別蒸籠
- ❌ 不識別盤子、筷子等

### 測試案例 2: 竹筒飯

上傳竹筒飯照片，確認：
- ✅ 識別為「竹筒飯」（食物）
- ❌ 不識別為「竹筒」（容器）

### 測試案例 3: 粽子

上傳粽子照片，確認：
- ✅ 識別為「粽子」或「肉粽」
- ❌ 不識別為「粽葉」或「竹葉」

## 預期效果

### 修復前
```json
{
  "foods": [
    {"name": "小籠包", "calories": 300},
    {"name": "蒸籠", "calories": 200},  // ❌ 錯誤
    {"name": "青菜", "calories": 20}
  ]
}
```

### 修復後
```json
{
  "foods": [
    {"name": "小籠包", "calories": 300},
    {"name": "青菜", "calories": 20}
  ]
}
```

## 部署

修改已提交並推送到 GitHub：
```bash
git commit -m "fix: Exclude containers and utensils from food recognition"
git push origin main
```

Render 會自動檢測並部署更新。

## 驗證步驟

部署完成後（約 2-3 分鐘）：

1. **重新上傳小籠包照片**
2. **檢查辨識結果**
   - 確認沒有「蒸籠」
   - 確認沒有「竹籠」
   - 確認沒有其他容器或餐具
3. **檢查營養總計**
   - 確認總熱量更準確
   - 確認不包含容器的「營養價值」

## 相關問題

這個修復也解決了以下類似問題：
- 碗被識別為食材
- 盤子被識別為食材
- 筷子被識別為食材
- 桌布被識別為食材
- 背景物品被識別為食材

## 未來改進

如果仍然出現容器被識別的情況，可以考慮：

1. **後處理過濾**
   - 在返回結果前，過濾掉已知的容器名稱
   - 建立容器黑名單

2. **信心度閾值**
   - 對於容器類別的識別，要求更高的信心度
   - 或直接拒絕容器類別

3. **用戶反饋**
   - 允許用戶標記錯誤識別
   - 收集數據改進 prompt

## 監控

查看 Render 日誌確認：
- 沒有容器被識別為食材
- 識別的食材數量更合理
- 營養計算更準確
