#!/bin/bash

# 生產環境配置檢查腳本
# 用於驗證部署前的配置是否正確

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  生產環境配置檢查${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# 檢查計數器
total_checks=0
passed_checks=0
failed_checks=0
warning_checks=0

# 檢查函數
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((passed_checks++))
    ((total_checks++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((failed_checks++))
    ((total_checks++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((warning_checks++))
    ((total_checks++))
}

# 1. 檢查核心文件
echo "1. 檢查核心文件..."
echo ""

files_to_check=(
    "apps/api/src/types/ComponentDetection.ts"
    "apps/api/src/services/ComponentDetectionEngine.ts"
    "apps/api/src/services/ComponentNutritionCalculator.ts"
    "apps/api/src/services/ComponentAdjustmentService.ts"
    "apps/api/src/data/dishComponentMaps.ts"
    "apps/api/src/data/cookingMethodEffects.ts"
    "apps/api/src/routes/component-adjustment.ts"
    "apps/api/src/controllers/ComponentAdjustmentController.ts"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        check_pass "文件存在: $file"
    else
        check_fail "文件缺失: $file"
    fi
done

echo ""

# 2. 檢查 package.json 依賴
echo "2. 檢查依賴..."
echo ""

if [ -f "apps/api/package.json" ]; then
    if grep -q "openai" apps/api/package.json; then
        check_pass "OpenAI SDK 已安裝"
    else
        check_fail "OpenAI SDK 未安裝"
    fi
    
    if grep -q "typescript" apps/api/package.json; then
        check_pass "TypeScript 已安裝"
    else
        check_fail "TypeScript 未安裝"
    fi
else
    check_fail "package.json 不存在"
fi

echo ""

# 3. 檢查環境變數範例
echo "3. 檢查環境變數配置..."
echo ""

if [ -f "apps/api/.env.example" ]; then
    check_pass ".env.example 存在"
    
    if grep -q "OPENAI_API_KEY" apps/api/.env.example; then
        check_pass "OPENAI_API_KEY 已定義"
    else
        check_warn "OPENAI_API_KEY 未在 .env.example 中定義"
    fi
    
    if grep -q "COMPONENT_DETECTION_ENABLED" apps/api/.env.example; then
        check_pass "COMPONENT_DETECTION_ENABLED 已定義"
    else
        check_warn "COMPONENT_DETECTION_ENABLED 未在 .env.example 中定義（可選）"
    fi
else
    check_warn ".env.example 不存在"
fi

echo ""

# 4. 檢查 TypeScript 配置
echo "4. 檢查 TypeScript 配置..."
echo ""

if [ -f "apps/api/tsconfig.json" ]; then
    check_pass "tsconfig.json 存在"
else
    check_fail "tsconfig.json 不存在"
fi

echo ""

# 5. 檢查測試文件
echo "5. 檢查測試文件..."
echo ""

test_files=(
    "apps/api/src/services/__tests__/ComponentDetectionEngine.test.ts"
    "apps/api/src/services/__tests__/ComponentNutritionCalculator.test.ts"
    "apps/api/src/__tests__/component-detection-integration.test.ts"
)

for file in "${test_files[@]}"; do
    if [ -f "$file" ]; then
        check_pass "測試文件存在: $(basename $file)"
    else
        check_warn "測試文件缺失: $(basename $file)"
    fi
done

echo ""

# 6. 檢查文檔
echo "6. 檢查文檔..."
echo ""

docs=(
    ".kiro/specs/asian-cuisine-component-detection/requirements.md"
    ".kiro/specs/asian-cuisine-component-detection/design.md"
    ".kiro/specs/asian-cuisine-component-detection/tasks.md"
    ".kiro/specs/asian-cuisine-component-detection/USER_GUIDE.md"
    ".kiro/specs/asian-cuisine-component-detection/COMPONENT_DETECTION_API_DOCUMENTATION.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "文檔存在: $(basename $doc)"
    else
        check_warn "文檔缺失: $(basename $doc)"
    fi
done

echo ""

# 7. 檢查 Git 狀態
echo "7. 檢查 Git 狀態..."
echo ""

if [ -d ".git" ]; then
    check_pass "Git 倉庫已初始化"
    
    if [ -n "$(git status --porcelain)" ]; then
        check_warn "有未提交的變更"
        echo "   未提交的文件:"
        git status --short | head -5
        if [ $(git status --porcelain | wc -l) -gt 5 ]; then
            echo "   ... 還有 $(($(git status --porcelain | wc -l) - 5)) 個文件"
        fi
    else
        check_pass "工作目錄乾淨"
    fi
    
    # 檢查遠端倉庫
    if git remote -v | grep -q "origin"; then
        check_pass "遠端倉庫已配置"
    else
        check_warn "遠端倉庫未配置"
    fi
else
    check_fail "Git 倉庫未初始化"
fi

echo ""

# 8. 檢查 Node 和 npm 版本
echo "8. 檢查 Node 和 npm 版本..."
echo ""

if command -v node &> /dev/null; then
    node_version=$(node --version)
    check_pass "Node.js 已安裝: $node_version"
    
    # 檢查 Node 版本是否 >= 18
    major_version=$(echo $node_version | cut -d'.' -f1 | sed 's/v//')
    if [ "$major_version" -ge 18 ]; then
        check_pass "Node.js 版本符合要求 (>= 18)"
    else
        check_fail "Node.js 版本過低 (需要 >= 18)"
    fi
else
    check_fail "Node.js 未安裝"
fi

if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    check_pass "npm 已安裝: $npm_version"
else
    check_fail "npm 未安裝"
fi

echo ""

# 9. 檢查 API 路由註冊
echo "9. 檢查 API 路由註冊..."
echo ""

if [ -f "apps/api/src/index.ts" ]; then
    if grep -q "component-adjustment" apps/api/src/index.ts; then
        check_pass "成分調整路由已註冊"
    else
        check_warn "成分調整路由可能未註冊"
    fi
else
    check_warn "apps/api/src/index.ts 不存在"
fi

echo ""

# 10. 檢查知識庫數據
echo "10. 檢查知識庫數據..."
echo ""

if [ -f "apps/api/src/data/dishComponentMaps.ts" ]; then
    # 計算料理映射數量
    dish_count=$(grep -c "dishName:" apps/api/src/data/dishComponentMaps.ts || echo "0")
    if [ "$dish_count" -gt 20 ]; then
        check_pass "料理映射數量充足: $dish_count 種"
    else
        check_warn "料理映射數量較少: $dish_count 種"
    fi
fi

if [ -f "apps/api/src/data/asianFoodItemsExtended.ts" ]; then
    # 計算食材數量
    food_count=$(grep -c "name:" apps/api/src/data/asianFoodItemsExtended.ts || echo "0")
    if [ "$food_count" -gt 100 ]; then
        check_pass "食材數量充足: $food_count 種"
    else
        check_warn "食材數量較少: $food_count 種"
    fi
fi

echo ""

# 總結
echo "═══════════════════════════════════════════════════════"
echo "檢查總結"
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "總檢查項目: ${BLUE}$total_checks${NC}"
echo -e "通過: ${GREEN}$passed_checks${NC}"
echo -e "失敗: ${RED}$failed_checks${NC}"
echo -e "警告: ${YELLOW}$warning_checks${NC}"
echo ""

# 計算通過率
if [ $total_checks -gt 0 ]; then
    pass_rate=$((passed_checks * 100 / total_checks))
    echo -e "通過率: ${BLUE}$pass_rate%${NC}"
    echo ""
fi

# 給出建議
if [ $failed_checks -eq 0 ]; then
    if [ $warning_checks -eq 0 ]; then
        echo -e "${GREEN}✓ 所有檢查都通過！可以開始部署。${NC}"
    else
        echo -e "${YELLOW}⚠ 有一些警告，但可以繼續部署。${NC}"
        echo "  建議先解決警告項目以獲得最佳體驗。"
    fi
else
    echo -e "${RED}✗ 有 $failed_checks 個檢查失敗，請先修復後再部署。${NC}"
    exit 1
fi

echo ""
echo "下一步："
echo "  1. 如果有警告，建議先解決"
echo "  2. 運行部署腳本: bash scripts/deploy-component-detection.sh"
echo "  3. 或手動部署到 Render"
echo ""
