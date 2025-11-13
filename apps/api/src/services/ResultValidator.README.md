# ResultValidator - 結果驗證器

## 概述

ResultValidator 是一個用於驗證食物識別結果的服務，特別針對亞洲料理的特徵和常見問題進行檢查。它可以幫助識別潛在的錯誤、不一致或不合理的識別結果。

## 主要功能

### 1. 亞洲料理驗證規則

- **相似食材互斥檢查**: 檢測是否同時識別到容易混淆的食材（如豆腐干絲和麵條）
- **涼拌菜完整性檢查**: 確保涼拌菜包含主食材、配菜和調味料
- **台式熱炒常見搭配檢查**: 檢查台式熱炒是否有蒜片或辣椒
- **日式料理完整性檢查**: 檢查日式套餐是否包含湯品、醃漬物等
- **原住民料理特徵檢查**: 確保原住民食材被正確分類
- **豆製品特徵檢查**: 專門檢查豆製品識別的正確性
- **麵食類區分檢查**: 確保米粉、粉絲、麵條等被正確區分

### 2. 營養和份量驗證規則

- **營養值合理性檢查**: 檢查營養值是否在合理範圍內
- **份量描述完整性檢查**: 確保每個食物都有完整的份量資訊
- **料理類型一致性檢查**: 檢查食物、烹飪方式和料理類型的一致性
- **烹飪方式營養影響檢查**: 確保烹飪方式對營養值的影響被正確反映
- **鈉含量合理性檢查**: 檢查鈉含量是否符合料理特徵

## 使用方法

### 基本使用

```typescript
import { ResultValidator, RecognitionResultForValidation } from './ResultValidator';

// 創建驗證器
const validator = new ResultValidator();

// 準備識別結果
const result: RecognitionResultForValidation = {
  foods: [
    {
      id: '1',
      name: '豆腐干絲',
      confidence: 0.85,
      estimatedPortion: 100,
      nutrition: {
        calories: 150,
        protein: 12,
        carbs: 8,
        fat: 6,
        fiber: 2,
        sodium: 300
      }
    }
  ],
  cookingMethod: '涼拌',
  cuisineType: '台式',
  confidence: 0.85
};

// 執行驗證
const report = validator.validate(result);

// 檢查結果
if (report.overallPassed) {
  console.log('✅ 驗證通過');
} else {
  console.log('❌ 驗證未通過');
  console.log(`錯誤: ${report.errors.length}`);
  console.log(`警告: ${report.warnings.length}`);
}

// 輸出詳細報告
console.log(validator.generateReportSummary(report));
```

### 整合到識別流程

```typescript
import { MultiStageRecognitionEngine } from './MultiStageRecognitionEngine';
import { ResultValidator } from './ResultValidator';

async function recognizeAndValidate(imageBuffer: Buffer) {
  // 執行識別
  const engine = new MultiStageRecognitionEngine();
  const recognitionResult = await engine.recognize(imageBuffer);

  // 準備驗證資料
  const validationInput: RecognitionResultForValidation = {
    foods: recognitionResult.foods,
    cookingMethod: recognitionResult.stages[recognitionResult.finalStage - 1]?.result.cookingMethod,
    cuisineType: recognitionResult.stages[recognitionResult.finalStage - 1]?.result.cuisineType,
    confidence: recognitionResult.confidence
  };

  // 執行驗證
  const validator = new ResultValidator();
  const validationReport = validator.validate(validationInput);

  // 返回識別結果和驗證報告
  return {
    recognition: recognitionResult,
    validation: validationReport
  };
}
```

### 自訂驗證規則

```typescript
import { ResultValidator, ValidationRule, ValidationSeverity } from './ResultValidator';

const validator = new ResultValidator();

// 添加自訂規則
const customRule: ValidationRule = {
  name: '高熱量警告',
  description: '檢查是否為高熱量食物',
  severity: ValidationSeverity.INFO,
  enabled: true,
  check: (result, context) => {
    const totalCalories = result.foods.reduce((sum, food) => 
      sum + food.nutrition.calories, 0
    );

    if (totalCalories > 800) {
      return {
        passed: false,
        ruleName: '高熱量警告',
        severity: ValidationSeverity.INFO,
        message: `此餐點總熱量較高: ${totalCalories} kcal`,
        suggestions: [
          '考慮減少份量',
          '搭配低熱量食物',
          '增加運動量'
        ]
      };
    }

    return {
      passed: true,
      ruleName: '高熱量警告',
      severity: ValidationSeverity.INFO,
      message: `熱量適中: ${totalCalories} kcal`
    };
  }
};

validator.addRule(customRule);
```

### 規則管理

```typescript
// 獲取所有規則
const allRules = validator.getAllRules();

// 獲取啟用的規則
const enabledRules = validator.getEnabledRules();

// 停用規則
validator.disableRule('台式熱炒常見搭配檢查');

// 啟用規則
validator.enableRule('台式熱炒常見搭配檢查');

// 移除規則
validator.removeRule('自訂規則名稱');

// 獲取規則統計
const stats = validator.getRuleStatistics();
console.log(`總規則數: ${stats.total}`);
console.log(`啟用: ${stats.enabled}`);
console.log(`停用: ${stats.disabled}`);
```

### 設置驗證上下文

```typescript
// 設置季節和地區資訊
validator.setContext({
  season: '夏季',
  region: '台灣北部'
});

// 驗證時會考慮上下文資訊
const report = validator.validate(result);
```

## 驗證報告結構

```typescript
interface ValidationReport {
  overallPassed: boolean;      // 整體是否通過
  totalRules: number;          // 總規則數
  passedRules: number;         // 通過的規則數
  failedRules: number;         // 失敗的規則數
  errors: ValidationResult[];  // 錯誤列表
  warnings: ValidationResult[]; // 警告列表
  infos: ValidationResult[];   // 資訊列表
  timestamp: Date;             // 驗證時間
  processingTime: number;      // 處理時間（毫秒）
}
```

## 驗證結果結構

```typescript
interface ValidationResult {
  passed: boolean;              // 是否通過
  ruleName: string;             // 規則名稱
  severity: ValidationSeverity; // 嚴重程度
  message: string;              // 驗證訊息
  suggestions?: string[];       // 改進建議
  affectedFoods?: string[];     // 受影響的食物
  details?: any;                // 額外詳細資訊
}
```

## 嚴重程度

- **ERROR**: 嚴重問題，可能導致不正確的結果
- **WARNING**: 可能的問題，需要注意
- **INFO**: 建議性資訊

## 內建驗證規則列表

### 亞洲料理規則

1. **相似食材互斥檢查** (WARNING)
2. **涼拌菜完整性檢查** (WARNING)
3. **台式熱炒常見搭配檢查** (INFO)
4. **日式料理完整性檢查** (INFO)
5. **原住民料理特徵檢查** (INFO)
6. **豆製品特徵檢查** (WARNING)
7. **麵食類區分檢查** (WARNING)

### 營養和份量規則

1. **營養值合理性檢查** (WARNING)
2. **份量描述完整性檢查** (WARNING)
3. **料理類型一致性檢查** (INFO)
4. **烹飪方式營養影響檢查** (INFO)
5. **鈉含量合理性檢查** (INFO)

## 最佳實踐

### 1. 在識別後立即驗證

```typescript
const recognitionResult = await recognitionEngine.recognize(imageBuffer);
const validationReport = validator.validate(recognitionResult);

if (!validationReport.overallPassed) {
  // 記錄驗證問題
  logger.warn('識別結果驗證未通過', {
    errors: validationReport.errors,
    warnings: validationReport.warnings
  });
}
```

### 2. 根據驗證結果調整信心度

```typescript
const report = validator.validate(result);

// 如果有錯誤，降低信心度
if (report.errors.length > 0) {
  result.confidence *= 0.8;
}

// 如果有警告，略微降低信心度
if (report.warnings.length > 0) {
  result.confidence *= 0.95;
}
```

### 3. 提供用戶反饋

```typescript
const report = validator.validate(result);

if (report.warnings.length > 0) {
  // 向用戶顯示警告和建議
  const userMessage = report.warnings.map(w => ({
    message: w.message,
    suggestions: w.suggestions
  }));
  
  // 發送給前端
  return {
    result,
    warnings: userMessage
  };
}
```

### 4. 記錄驗證結果用於改進

```typescript
const report = validator.validate(result);

// 記錄到資料庫或日誌系統
await logValidationReport({
  imageId: imageId,
  recognitionResult: result,
  validationReport: report,
  timestamp: new Date()
});

// 分析常見問題
if (report.errors.length > 0) {
  await analyzeCommonValidationErrors(report.errors);
}
```

## 性能考量

- 驗證過程通常在 10-50ms 內完成
- 所有規則並行執行
- 可以根據需要停用不必要的規則以提升性能

## 健康檢查

```typescript
const health = validator.healthCheck();

if (health.status === 'healthy') {
  console.log('✅ 驗證器運作正常');
} else {
  console.log('⚠️ 驗證器狀態異常');
}

console.log('詳細資訊:', health.details);
```

## 範例

完整的使用範例請參考 `ResultValidator.example.ts` 文件。

## 注意事項

1. 驗證規則會隨著知識庫的更新而改進
2. 某些規則可能會產生誤報，可以根據實際情況調整
3. 建議定期檢查驗證報告，找出常見的識別問題
4. 可以根據用戶反饋添加新的驗證規則

## 未來改進

- [ ] 支援更多料理類型的驗證規則
- [ ] 基於機器學習的異常檢測
- [ ] 自動調整規則權重
- [ ] 支援規則優先級
- [ ] 提供規則配置文件
