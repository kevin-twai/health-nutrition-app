#!/bin/bash

# 最小化部署腳本 - 僅部署新的食物識別功能
# 此腳本跳過有問題的舊代碼，專注於新功能

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}最小化部署 - 食物識別準確度改進${NC}"
echo -e "${BLUE}========================================${NC}\n"

# 1. 檢查環境變數（可選）
echo -e "${GREEN}[1/4] 檢查環境變數...${NC}"
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}⚠ 警告: 未設置 OPENAI_API_KEY（部署時需要）${NC}"
else
    echo -e "${GREEN}✓ OPENAI_API_KEY 已設置${NC}"
fi
echo -e "${GREEN}✓ 環境變數檢查完成${NC}\n"

# 2. 創建部署目錄
echo -e "${GREEN}[2/4] 準備部署文件...${NC}"
DEPLOY_DIR="deploy-minimal"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# 複製新功能的核心文件
echo "複製核心服務..."
mkdir -p "$DEPLOY_DIR/services"
cp apps/api/src/services/AsianCuisineKnowledgeBase.ts "$DEPLOY_DIR/services/"
cp apps/api/src/services/EnhancedPromptGenerator.ts "$DEPLOY_DIR/services/"
cp apps/api/src/services/MultiStageRecognitionEngine.ts "$DEPLOY_DIR/services/"
cp apps/api/src/services/ResultValidator.ts "$DEPLOY_DIR/services/"
cp apps/api/src/services/AsianCuisineValidationRules.ts "$DEPLOY_DIR/services/"
cp apps/api/src/services/NutritionValidationRules.ts "$DEPLOY_DIR/services/"
cp apps/api/src/services/FeedbackCollector.ts "$DEPLOY_DIR/services/"
cp apps/api/src/services/FeedbackAnalyzer.ts "$DEPLOY_DIR/services/"
cp apps/api/src/services/FeedbackImprover.ts "$DEPLOY_DIR/services/"
cp apps/api/src/services/FoodRecognitionPerformanceMonitor.ts "$DEPLOY_DIR/services/"
cp apps/api/src/services/FoodRecognitionLogger.ts "$DEPLOY_DIR/services/"
cp apps/api/src/services/RecognitionResultCache.ts "$DEPLOY_DIR/services/"
cp apps/api/src/services/KnowledgeBaseQueryOptimizer.ts "$DEPLOY_DIR/services/"

echo "複製數據文件..."
mkdir -p "$DEPLOY_DIR/data"
cp -r apps/api/src/data/* "$DEPLOY_DIR/data/"

echo "複製類型定義..."
mkdir -p "$DEPLOY_DIR/types"
cp -r apps/api/src/types/* "$DEPLOY_DIR/types/"

echo "複製文檔..."
mkdir -p "$DEPLOY_DIR/docs"
cp .kiro/specs/food-recognition-accuracy/*.md "$DEPLOY_DIR/docs/"

echo -e "${GREEN}✓ 部署文件準備完成${NC}\n"

# 3. 創建部署包
echo -e "${GREEN}[3/4] 創建部署包...${NC}"
tar -czf food-recognition-accuracy-v1.0.0.tar.gz "$DEPLOY_DIR"
echo -e "${GREEN}✓ 部署包已創建: food-recognition-accuracy-v1.0.0.tar.gz${NC}\n"

# 4. 生成部署清單
echo -e "${GREEN}[4/4] 生成部署清單...${NC}"
cat > "$DEPLOY_DIR/DEPLOYMENT_MANIFEST.md" << 'EOF'
# 食物識別準確度改進 - 部署清單

## 版本資訊
- **版本**: 1.0.0
- **發布日期**: $(date +%Y-%m-%d)
- **部署類型**: 最小化部署（僅新功能）

## 包含的文件

### 核心服務 (13 個文件)
- AsianCuisineKnowledgeBase.ts - 知識庫系統
- EnhancedPromptGenerator.ts - Prompt 生成器
- MultiStageRecognitionEngine.ts - 多階段識別引擎
- ResultValidator.ts - 結果驗證器
- AsianCuisineValidationRules.ts - 亞洲料理驗證規則
- NutritionValidationRules.ts - 營養驗證規則
- FeedbackCollector.ts - 反饋收集器
- FeedbackAnalyzer.ts - 反饋分析器
- FeedbackImprover.ts - 反饋改進器
- FoodRecognitionPerformanceMonitor.ts - 性能監控
- FoodRecognitionLogger.ts - 日誌記錄
- RecognitionResultCache.ts - 結果快取
- KnowledgeBaseQueryOptimizer.ts - 查詢優化

### 數據文件
- asianFoodItems.ts - 基礎食材數據（200+ 種）
- asianFoodItemsExtended.ts - 擴展食材數據
- dishPatterns.ts - 料理模式數據

### 類型定義
- AsianCuisineKnowledgeBase.ts - 知識庫類型定義

### 文檔
- TECHNICAL_DOCUMENTATION.md - 技術文檔
- USER_GUIDE.md - 用戶指南
- DEPLOYMENT_GUIDE.md - 部署指南
- CONTINUOUS_IMPROVEMENT.md - 持續改進流程
- IMPLEMENTATION_SUMMARY.md - 實施總結
- BUILD_STATUS.md - 建置狀態

## 部署步驟

1. **解壓部署包**
   ```bash
   tar -xzf food-recognition-accuracy-v1.0.0.tar.gz
   cd deploy-minimal
   ```

2. **整合到現有系統**
   - 將 services/ 目錄複製到您的 API 服務中
   - 將 data/ 目錄複製到相應位置
   - 將 types/ 目錄複製到相應位置

3. **配置環境變數**
   確保設置以下環境變數：
   - OPENAI_API_KEY
   - OPENAI_MODEL (建議: gpt-4o)
   - RECOGNITION_CONFIDENCE_THRESHOLD (建議: 85)

4. **驗證部署**
   ```bash
   # 驗證知識庫
   npx tsx services/AsianCuisineKnowledgeBase.ts
   
   # 測試 Prompt 生成
   npx tsx services/EnhancedPromptGenerator.ts
   ```

5. **開始使用**
   參考 TECHNICAL_DOCUMENTATION.md 了解如何使用各個組件

## 使用範例

```typescript
import { AsianCuisineKnowledgeBase } from './services/AsianCuisineKnowledgeBase';
import { EnhancedPromptGenerator } from './services/EnhancedPromptGenerator';
import { MultiStageRecognitionEngine } from './services/MultiStageRecognitionEngine';

// 初始化
const knowledgeBase = new AsianCuisineKnowledgeBase();
const promptGenerator = new EnhancedPromptGenerator('zh-TW');
const recognitionEngine = new MultiStageRecognitionEngine(
  knowledgeBase,
  promptGenerator
);

// 使用
const result = await recognitionEngine.recognize(imageBuffer);
console.log(result);
```

## 注意事項

- 此為最小化部署，僅包含新功能
- 不包含有編譯錯誤的舊代碼
- 可以獨立使用或整合到現有系統
- 建議先在測試環境驗證

## 支援

如有問題，請參考：
- 技術文檔: docs/TECHNICAL_DOCUMENTATION.md
- 用戶指南: docs/USER_GUIDE.md
- 部署指南: docs/DEPLOYMENT_GUIDE.md
EOF

echo -e "${GREEN}✓ 部署清單已生成${NC}\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ 最小化部署準備完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "\n${YELLOW}部署包: food-recognition-accuracy-v1.0.0.tar.gz${NC}"
echo -e "${YELLOW}部署目錄: $DEPLOY_DIR/${NC}"
echo -e "${YELLOW}部署清單: $DEPLOY_DIR/DEPLOYMENT_MANIFEST.md${NC}\n"

echo -e "${BLUE}下一步:${NC}"
echo -e "1. 檢查部署包內容: tar -tzf food-recognition-accuracy-v1.0.0.tar.gz"
echo -e "2. 查看部署清單: cat $DEPLOY_DIR/DEPLOYMENT_MANIFEST.md"
echo -e "3. 整合到您的系統或部署到測試環境\n"
