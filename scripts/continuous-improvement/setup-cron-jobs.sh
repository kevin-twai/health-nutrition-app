#!/bin/bash

# 設置持續改進的定時任務
# 此腳本會配置所有必要的 cron jobs

set -e

echo "設置持續改進定時任務..."

# 獲取專案根目錄
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# 創建臨時 crontab 文件
TEMP_CRON=$(mktemp)

# 保存現有的 crontab（如果有）
crontab -l > "$TEMP_CRON" 2>/dev/null || true

# 添加新的定時任務
cat >> "$TEMP_CRON" << EOF

# ========================================
# 食物識別準確度改進 - 持續改進任務
# ========================================

# 每日健康檢查（每6小時）
0 */6 * * * cd $PROJECT_ROOT && npm run health:check >> logs/health-check.log 2>&1

# 每日功能測試（每天 02:00）
0 2 * * * cd $PROJECT_ROOT && npm run test:functional -- --run >> logs/daily-test.log 2>&1

# 每日反饋審查（每天 10:00）
0 10 * * * cd $PROJECT_ROOT && npm run feedback:review -- --since=yesterday >> logs/feedback-review.log 2>&1

# 每週準確度測試（每週一 03:00）
0 3 * * 1 cd $PROJECT_ROOT && npm run test:accuracy:weekly >> logs/weekly-accuracy.log 2>&1

# 每週審查（每週五 15:00）
0 15 * * 5 cd $PROJECT_ROOT && bash scripts/continuous-improvement/weekly-review.sh >> logs/weekly-review.log 2>&1

# 每週知識庫更新（每週三 14:00）
0 14 * * 3 cd $PROJECT_ROOT && npm run kb:weekly-update >> logs/kb-update.log 2>&1

# 每週 Prompt 審查（每週四 16:00）
0 16 * * 4 cd $PROJECT_ROOT && npm run prompt:weekly-review >> logs/prompt-review.log 2>&1

# 每月性能測試（每月 1 號 04:00）
0 4 1 * * cd $PROJECT_ROOT && npm run test:performance:monthly >> logs/monthly-performance.log 2>&1

# 每月深度分析（每月 5 號 10:00）
0 10 5 * * cd $PROJECT_ROOT && npm run analyze:monthly >> logs/monthly-analysis.log 2>&1

# 每月報告生成（每月 5 號 14:00）
0 14 5 * * cd $PROJECT_ROOT && npm run report:monthly >> logs/monthly-report.log 2>&1

# 清理舊日誌（每週日 01:00）
0 1 * * 0 cd $PROJECT_ROOT && find logs -name "*.log" -mtime +30 -delete

# ========================================

EOF

# 安裝新的 crontab
crontab "$TEMP_CRON"

# 清理臨時文件
rm "$TEMP_CRON"

echo "✓ 定時任務設置完成！"
echo ""
echo "已設置的定時任務："
echo "- 每日健康檢查（每6小時）"
echo "- 每日功能測試（02:00）"
echo "- 每日反饋審查（10:00）"
echo "- 每週準確度測試（週一 03:00）"
echo "- 每週審查（週五 15:00）"
echo "- 每週知識庫更新（週三 14:00）"
echo "- 每週 Prompt 審查（週四 16:00）"
echo "- 每月性能測試（1號 04:00）"
echo "- 每月深度分析（5號 10:00）"
echo "- 每月報告生成（5號 14:00）"
echo "- 清理舊日誌（週日 01:00）"
echo ""
echo "查看當前 crontab: crontab -l"
echo "編輯 crontab: crontab -e"
