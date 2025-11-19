# Design Document

## Overview

本設計文檔描述如何修正食物識別與 recognition description 不符合的問題。核心策略是讓成分檢測引擎接受並使用基礎識別的結果，而不是重新進行識別。

## Architecture

### Current Flow (有問題的流程)

```
用戶上傳照片
    ↓
MultiStageRecognitionEngine.recognize()
    → 識別出：[白飯, 炸豬排, 滷蛋, 豆腐, 酸菜]
    ↓
PhotoController.recognizeWithComponents()
    → 只傳遞第一個食物名稱："白飯"
    ↓
ComponentDetectionEngine.detectComponents(image, "白飯")
    → 重新調用 Vision API
    → 返回：[白飯, 炒高麗菜, 辣椒炒肉末]  ❌ 不一致！
```

### New Flow (修正後的流程)

```
用戶上傳照片
    ↓
MultiStageRecognitionEngine.recognize()
    → 識別出：[白飯, 炸豬排, 滷蛋, 豆腐, 酸菜]
    ↓
PhotoController.recognizeWithComponents()
    → 傳遞完整的食物列表
    ↓
ComponentDetectionEngine.detectComponents(image, dishName, dishType, preRecognizedFoods)
    → 使用預識別食物列表
    → 將每個食物轉換為成分
    → 返回：[白飯, 炸豬排, 滷蛋, 豆腐, 酸菜]  ✅ 一致！
```

## Components and Interfaces

### 1. ComponentDetectionEngine 修改

#### 新增參數

```typescript
interface DetectComponentsOptions {
  dishName?: string;
  dishType?: DishType;
  preRecognizedFoods?: RecognizedFood[];  // 新增：預識別食物列表
}

async detectComponents(
  image: Buffer,
  options?: DetectComponentsOptions
): Promise<ComponentDetectionResult>
```

#### 處理邏輯

1. **檢查是否有預識別食物**
   - 如果有 `preRecognizedFoods`，使用它們作為成分基礎
   - 如果沒有，執行現有的 Vision API 識別流程

2. **轉換預識別食物為成分**
   ```typescript
   private convertRecognizedFoodsToComponents(
     foods: RecognizedFood[]
   ): EnrichedComponent[]
   ```

3. **保留食物屬性**
   - 名稱（中文和英文）
   - 份量
   - 信心度
   - 營養資訊（如果有）

### 2. PhotoController 修改

#### 修改 recognizeWithComponents 方法

```typescript
// 當前代碼（有問題）
const dishName = multiStageResult.foods && multiStageResult.foods.length > 0
  ? multiStageResult.foods[0].name
  : undefined;

componentResult = await this.componentDetectionEngine.detectComponents(
  req.file.buffer,
  dishName
);

// 修正後的代碼
const options: DetectComponentsOptions = {
  dishName: multiStageResult.foods?.[0]?.name,
  dishType: this.inferDishType(multiStageResult.foods),
  preRecognizedFoods: multiStageResult.foods  // 傳遞完整食物列表
};

componentResult = await this.componentDetectionEngine.detectComponents(
  req.file.buffer,
  options
);
```

### 3. 類型定義

#### RecognizedFood 接口

```typescript
interface RecognizedFood {
  id: string;
  name: string;
  nameEn?: string;
  confidence: number;
  portion: number;
  unit: string;
  category?: string;
  nutrition?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
}
```

#### EnrichedComponent 擴展

```typescript
interface EnrichedComponent extends DetectedComponent {
  // 現有屬性...
  
  // 新增屬性
  sourceType?: 'vision_api' | 'pre_recognized' | 'knowledge_base';
  originalFoodId?: string;  // 如果來自預識別，記錄原始食物 ID
}
```

## Data Models

### ComponentDetectionResult 修改

```typescript
interface ComponentDetectionResult {
  mainDish: MainDishInfo;
  components: EnrichedComponent[];
  nutritionSummary: NutritionSummary;
  metadata: {
    processingTime: number;
    confidenceScore: number;
    detectionMethod: 'hybrid' | 'knowledge_base' | 'pre_recognized';  // 新增 pre_recognized
    componentsDetected: number;
    componentsFromKB: number;
    componentsFromVision: number;
    componentsFromPreRecognition: number;  // 新增
  };
  suggestions: UserSuggestions;
}
```

## Error Handling

### 1. 預識別食物為空

```typescript
if (options.preRecognizedFoods && options.preRecognizedFoods.length === 0) {
  console.warn('預識別食物列表為空，降級至 Vision API 識別');
  // 執行 Vision API 識別
}
```

### 2. 預識別食物格式錯誤

```typescript
try {
  const components = this.convertRecognizedFoodsToComponents(
    options.preRecognizedFoods
  );
} catch (error) {
  console.error('轉換預識別食物失敗:', error);
  // 降級至 Vision API 識別
}
```

### 3. 混合模式

```typescript
// 如果預識別食物數量較少，可以補充 Vision API 識別
if (components.length < 3) {
  const visionComponents = await this.extractComponentsFromVision(
    image,
    dishName,
    dishType
  );
  
  // 合併結果，避免重複
  components = this.mergeComponents(components, visionComponents);
}
```

## Testing Strategy

### 1. 單元測試

#### ComponentDetectionEngine.convertRecognizedFoodsToComponents

```typescript
describe('convertRecognizedFoodsToComponents', () => {
  it('應該正確轉換單個食物', () => {
    const foods: RecognizedFood[] = [{
      id: 'food-1',
      name: '白飯',
      nameEn: 'White Rice',
      confidence: 0.95,
      portion: 200,
      unit: 'g'
    }];
    
    const components = engine.convertRecognizedFoodsToComponents(foods);
    
    expect(components).toHaveLength(1);
    expect(components[0].name).toBe('白飯');
    expect(components[0].sourceType).toBe('pre_recognized');
  });
  
  it('應該正確轉換多個食物', () => {
    const foods: RecognizedFood[] = [
      { id: 'food-1', name: '白飯', confidence: 0.95, portion: 200, unit: 'g' },
      { id: 'food-2', name: '炸豬排', confidence: 0.90, portion: 150, unit: 'g' },
      { id: 'food-3', name: '滷蛋', confidence: 0.85, portion: 60, unit: 'g' }
    ];
    
    const components = engine.convertRecognizedFoodsToComponents(foods);
    
    expect(components).toHaveLength(3);
    expect(components.map(c => c.name)).toEqual(['白飯', '炸豬排', '滷蛋']);
  });
  
  it('應該保留營養資訊', () => {
    const foods: RecognizedFood[] = [{
      id: 'food-1',
      name: '白飯',
      confidence: 0.95,
      portion: 200,
      unit: 'g',
      nutrition: {
        calories: 260,
        protein: 5,
        carbohydrates: 58,
        fat: 0.5
      }
    }];
    
    const components = engine.convertRecognizedFoodsToComponents(foods);
    
    expect(components[0].nutrition).toBeDefined();
    expect(components[0].nutrition.calories).toBe(260);
  });
});
```

#### ComponentDetectionEngine.detectComponents with preRecognizedFoods

```typescript
describe('detectComponents with preRecognizedFoods', () => {
  it('應該使用預識別食物而不調用 Vision API', async () => {
    const mockVisionCall = jest.spyOn(engine as any, 'extractComponentsFromVision');
    
    const options: DetectComponentsOptions = {
      preRecognizedFoods: [
        { id: 'food-1', name: '白飯', confidence: 0.95, portion: 200, unit: 'g' }
      ]
    };
    
    const result = await engine.detectComponents(mockImageBuffer, options);
    
    expect(mockVisionCall).not.toHaveBeenCalled();
    expect(result.components).toHaveLength(1);
    expect(result.metadata.detectionMethod).toBe('pre_recognized');
  });
  
  it('應該在沒有預識別食物時調用 Vision API', async () => {
    const mockVisionCall = jest.spyOn(engine as any, 'extractComponentsFromVision');
    
    const options: DetectComponentsOptions = {
      dishName: '白飯'
    };
    
    await engine.detectComponents(mockImageBuffer, options);
    
    expect(mockVisionCall).toHaveBeenCalled();
  });
});
```

### 2. 整合測試

#### PhotoController.recognizeWithComponents

```typescript
describe('PhotoController.recognizeWithComponents', () => {
  it('應該將基礎識別結果傳遞給成分檢測引擎', async () => {
    const mockFile = createMockFile();
    const mockRequest = createMockRequest({ file: mockFile });
    const mockResponse = createMockResponse();
    
    // Mock MultiStageRecognitionEngine
    const mockRecognitionResult = {
      foods: [
        { id: 'food-1', name: '白飯', confidence: 0.95, portion: 200, unit: 'g' },
        { id: 'food-2', name: '炸豬排', confidence: 0.90, portion: 150, unit: 'g' }
      ],
      confidence: 0.92,
      description: '白飯和炸豬排'
    };
    
    jest.spyOn(multiStageEngine, 'recognize').mockResolvedValue(mockRecognitionResult);
    
    // Mock ComponentDetectionEngine
    const detectComponentsSpy = jest.spyOn(componentDetectionEngine, 'detectComponents');
    
    await photoController.recognizeWithComponents(mockRequest, mockResponse);
    
    // 驗證傳遞的參數
    expect(detectComponentsSpy).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.objectContaining({
        preRecognizedFoods: mockRecognitionResult.foods
      })
    );
  });
  
  it('應該返回一致的識別結果', async () => {
    const mockFile = createMockFile();
    const mockRequest = createMockRequest({ file: mockFile });
    const mockResponse = createMockResponse();
    
    await photoController.recognizeWithComponents(mockRequest, mockResponse);
    
    const responseData = mockResponse.json.mock.calls[0][0].data;
    
    // 驗證基礎識別和成分識別的食物名稱一致
    const recognizedFoodNames = responseData.recognition.foods.map(f => f.name);
    const componentNames = responseData.componentDetection.components.map(c => c.name);
    
    expect(componentNames).toEqual(expect.arrayContaining(recognizedFoodNames));
  });
});
```

### 3. 端到端測試

```typescript
describe('E2E: Recognition Consistency', () => {
  it('應該在整個流程中保持識別結果一致', async () => {
    // 上傳測試圖片
    const response = await request(app)
      .post('/api/v1/photo/recognize-with-components')
      .attach('photo', 'test-images/bento.jpg')
      .expect(200);
    
    const { recognition, componentDetection } = response.body.data;
    
    // 驗證基礎識別結果
    expect(recognition.foods).toBeDefined();
    expect(recognition.foods.length).toBeGreaterThan(0);
    
    // 驗證成分識別結果
    expect(componentDetection.components).toBeDefined();
    expect(componentDetection.components.length).toBeGreaterThan(0);
    
    // 驗證一致性
    const recognizedFoodNames = recognition.foods.map(f => f.name);
    const componentNames = componentDetection.components.map(c => c.name);
    
    // 所有基礎識別的食物都應該出現在成分列表中
    recognizedFoodNames.forEach(foodName => {
      expect(componentNames).toContain(foodName);
    });
    
    // 驗證 description 與成分一致
    recognizedFoodNames.forEach(foodName => {
      expect(recognition.description).toContain(foodName);
    });
  });
});
```

## Performance Considerations

### 1. 避免重複識別

- **當前問題**: 基礎識別和成分識別都調用 Vision API，浪費時間和資源
- **解決方案**: 成分識別使用基礎識別結果，只調用一次 Vision API
- **預期改善**: 減少 30-50% 的處理時間

### 2. 緩存優化

```typescript
// 如果使用預識別食物，可以跳過某些緩存查詢
if (options.preRecognizedFoods) {
  // 直接使用預識別食物，不需要查詢緩存
  return this.convertRecognizedFoodsToComponents(options.preRecognizedFoods);
}
```

### 3. 並行處理

```typescript
// 如果需要補充 Vision API 識別，可以並行處理
const [preRecognizedComponents, visionComponents] = await Promise.all([
  this.convertRecognizedFoodsToComponents(options.preRecognizedFoods),
  this.extractComponentsFromVision(image, dishName, dishType)
]);
```

## Migration Strategy

### Phase 1: 向後兼容

1. 保留現有的 `detectComponents(image, dishName, dishType)` 簽名
2. 新增 `detectComponents(image, options)` 重載
3. 內部檢測參數類型並路由到正確的處理邏輯

```typescript
async detectComponents(
  image: Buffer,
  dishNameOrOptions?: string | DetectComponentsOptions,
  dishType?: DishType
): Promise<ComponentDetectionResult> {
  // 向後兼容：檢測參數類型
  let options: DetectComponentsOptions;
  
  if (typeof dishNameOrOptions === 'string') {
    // 舊版 API: detectComponents(image, dishName, dishType)
    options = {
      dishName: dishNameOrOptions,
      dishType: dishType
    };
  } else {
    // 新版 API: detectComponents(image, options)
    options = dishNameOrOptions || {};
  }
  
  // 統一處理邏輯
  return this.detectComponentsInternal(image, options);
}
```

### Phase 2: 逐步遷移

1. 更新 PhotoController 使用新 API
2. 更新測試使用新 API
3. 監控日誌，確保沒有使用舊 API 的地方

### Phase 3: 清理

1. 移除舊版 API 支持
2. 簡化類型定義
3. 更新文檔

## Logging and Monitoring

### 1. 關鍵日誌點

```typescript
// PhotoController
console.log(`[${sessionId}] 傳遞 ${multiStageResult.foods.length} 個預識別食物給成分檢測引擎`);
console.log(`[${sessionId}] 預識別食物:`, multiStageResult.foods.map(f => f.name));

// ComponentDetectionEngine
console.log(`🔍 ComponentDetectionEngine: 收到 ${options.preRecognizedFoods?.length || 0} 個預識別食物`);
console.log(`   使用預識別食物，跳過 Vision API 調用`);
console.log(`   轉換完成，共 ${components.length} 個成分`);
```

### 2. 一致性驗證

```typescript
// 在返回結果前驗證一致性
const recognizedFoodNames = new Set(multiStageResult.foods.map(f => f.name));
const componentNames = new Set(componentResult.components.map(c => c.name));

const missingFoods = Array.from(recognizedFoodNames).filter(
  name => !componentNames.has(name)
);

if (missingFoods.length > 0) {
  console.warn(`[${sessionId}] ⚠️ 一致性警告: 以下食物在成分列表中缺失:`, missingFoods);
}
```

### 3. 性能監控

```typescript
const metrics = {
  sessionId,
  totalProcessingTime,
  baseRecognitionTime: multiStageResult.processingTime,
  componentDetectionTime: componentResult.metadata.processingTime,
  usedPreRecognizedFoods: !!options.preRecognizedFoods,
  foodCount: multiStageResult.foods.length,
  componentCount: componentResult.components.length,
  consistencyCheck: missingFoods.length === 0
};

console.log(`[${sessionId}] 性能指標:`, metrics);
```

## Rollback Plan

### 如果新實現出現問題

1. **Feature Flag**: 添加環境變數控制是否使用新邏輯
   ```typescript
   const USE_PRE_RECOGNIZED_FOODS = process.env.USE_PRE_RECOGNIZED_FOODS === 'true';
   
   if (USE_PRE_RECOGNIZED_FOODS && multiStageResult.foods) {
     options.preRecognizedFoods = multiStageResult.foods;
   }
   ```

2. **快速回滾**: 恢復到舊版代碼
   ```bash
   git revert <commit-hash>
   git push origin main
   # Render 自動部署
   ```

3. **漸進式部署**: 先在測試環境驗證，再部署到生產環境
