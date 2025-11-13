#!/bin/bash

# 替換所有從 @health-tracker/shared-types 的 import 為本地 types/shared
find src -name "*.ts" -type f -exec sed -i '' "s|from '@health-tracker/shared-types'|from '../types/shared'|g" {} \;
find src -name "*.ts" -type f -exec sed -i '' "s|from '@health-tracker/shared-types'|from '../../types/shared'|g" {} \;
find src -name "*.ts" -type f -exec sed -i '' "s|from '@health-tracker/shared-types'|from '../../../types/shared'|g" {} \;

echo "✅ Import 語句已更新"
