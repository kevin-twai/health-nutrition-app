# 亞洲料理成分識別系統設計文檔

## Overview

本系統擴展現有的食物識別功能，增加對亞洲料理中個別成分的智能識別能力。系統將利用 OpenAI Vision API 和本地知識庫的混合策略，為用戶提供詳細的成分分解和營養分析。

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│  (Photo Upload → Component Display → Manual Adjustment)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  API Gateway / Controller                     │
│              (PhotoController with Component Mode)            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Component Detection Engine (NEW)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Dish Type    │  │ Component    │  │ Nutrition    │      │
│  │ Classifier   │→ │ Extractor    │→ │ Calculator   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Knowledge Base Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Dish-        │  │ Component    │  │ Cooking      │      │
│  │ Component    │  │ Nutrition    │  │ Method       │      │
│  │ Mapping      │  │ Database     │  │ Effects      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    External Services                          │
│         OpenAI Vision API  │  MongoDB  │  Cache               │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Component Detection Engine

**Purpose**: 核心成分識別邏輯，協調各個子模組完成成分識別

**Interface**:
```typescript
interface ComponentDetectionEngine {
  detectComponents(
    image: Buffer,
    dishName: string,
    dishType?: DishType
  ): Promise<ComponentDetectionResult>;
  
  validateComponents(
    components: DetectedComponent[],
    dishType: DishType
  ): ValidationResult;
  
  enrichWithKnowledgeBase(
    components: DetectedComponent[],
    dishName: string
  ): Promise<EnrichedComponent[]>;
}

interface ComponentDetectionResult {
  mainDish: {
    name: string;
    type: DishType;
    confidence: number;
    estimatedTotalPortion: number;
  };
  components: DetectedComponent[];
  nutritionSummary: NutritionSummary;
  metadata: DetectionMetadata;
  suggestions: UserSuggestions;
}

interface DetectedComponent {
  id: string;
  name: string;
  nameEn?: string;
  confidence: number;
  estimatedPortion: number; // grams
  cookingMethod?: CookingMethod;
  visualFeatures: {
    color: string[];
    shape: string;
    texture: string;
    position: string;
  };
  nutritionPer100g?: NutritionData;
  actualNutrition?: NutritionData; // based on portion
}

enum DishType {
  SOUP = 'soup',
  FRIED_RICE = 'fried_rice',
  STIR_FRY = 'stir_fry',
  BENTO = 'bento',
  NOODLES = 'noodles',
  DUMPLING = 'dumpling',
  BARBECUE = 'barbecue',
  HOT_POT = 'hot_pot',
  UNKNOWN = 'unknown'
}

enum CookingMethod {
  RAW = 'raw',
  BOILED = 'boiled',
  FRIED = 'fried',
  DEEP_FRIED = 'deep_fried',
  STEAMED = 'steamed',
  GRILLED = 'grilled',
  BRAISED = 'braised',
  STIR_FRIED = 'stir_fried',
  PICKLED = 'pickled'
}
```

### 2. Enhanced Prompt Generator (Extension)

**Purpose**: 擴展現有的 prompt generator 以支持成分識別

**New Methods**:
```typescript
interface EnhancedPromptGenerator {
  // Existing methods...
  
  generateComponentDetectionPrompt(
    dishName: string,
    dishType: DishType,
    region?: string
  ): string;
  
  generateComponentRefinementPrompt(
    initialComponents: DetectedComponent[],
    dishContext: string
  ): string;
}
```

**Example Prompts**:
```typescript
// 炒飯類
const FRIED_RICE_COMPONENT_PROMPT = `
請仔細分析這張炒飯圖片，識別所有可見的成分：

主要成分類別：
1. 主食：米飯（估計份量）
2. 蛋白質：蛋、肉類、海鮮（具體種類和份量）
3. 蔬菜：所有可見的蔬菜（如青豆、玉米、胡蘿蔔、青蔥）
4. 調料：可見的調料（如蔥花、蒜末）

對每個成分，請提供：
- 中文名稱
- 英文名稱（如果適用）
- 估計份量（克）
- 信心度（0-1）
- 烹飪狀態（炒、煮等）
- 視覺特徵（顏色、形狀、位置）

請以 JSON 格式返回結果。
`;

// 便當類
const BENTO_COMPONENT_PROMPT = `
請分析這張便當圖片，識別各個區域的食物：

便當結構：
1. 主食區（通常佔 1/3-1/2）：
   - 米飯或其他主食
   - 估計份量

2. 主菜區（通常 1-2 個）：
   - 主要蛋白質（肉類、魚類、蛋類）
   - 烹飪方式（炸、烤、滷、煎等）
   - 估計份量

3. 配菜區（通常 2-4 個）：
   - 蔬菜類配菜
   - 醃漬物
   - 其他小菜
   - 各自的份量

請詳細列出每個食物項目，包括位置、份量、烹飪方式。
`;

// 湯品類
const SOUP_COMPONENT_PROMPT = `
請分析這張湯品圖片，識別所有配料：

湯品分析：
1. 湯底類型（清湯、濃湯、味噌等）
2. 可見配料：
   - 蛋白質類（豆腐、肉類、海鮮、蛋）
   - 蔬菜類（青蔥、海帶、菇類等）
   - 其他配料

3. 估計：
   - 湯的總量（毫升）
   - 每種配料的份量（克）
   - 配料在湯中的比例

請提供詳細的成分列表和份量估計。
`;
```

### 3. Dish-Component Knowledge Base

**Purpose**: 維護料理與成分的映射關係

**Data Structure**:
```typescript
interface DishComponentMap {
  dishName: string;
  dishNameEn?: string;
  dishType: DishType;
  region: string[]; // ['taiwan', 'china', 'japan', etc.]
  commonComponents: ComponentInfo[];
  regionalVariations: RegionalVariation[];
  typicalPortionRange: {
    min: number;
    max: number;
    typical: number;
  };
}

interface ComponentInfo {
  name: string;
  nameEn?: string;
  category: ComponentCategory;
  typicalPortion: number; // grams in this dish
  portionRange: { min: number; max: number };
  frequency: number; // 0-1, how often it appears
  alternatives: string[]; // similar components
  cookingMethods: CookingMethod[];
  nutritionImpact: CookingNutritionImpact[];
}

enum ComponentCategory {
  GRAIN = 'grain',
  PROTEIN = 'protein',
  VEGETABLE = 'vegetable',
  SEASONING = 'seasoning',
  SAUCE = 'sauce',
  GARNISH = 'garnish'
}

interface CookingNutritionImpact {
  method: CookingMethod;
  calorieMultiplier: number;
  fatMultiplier: number;
  proteinRetention: number;
  vitaminRetention: number;
  notes: string;
}

interface RegionalVariation {
  region: string;
  components: ComponentInfo[];
  culturalNotes: string;
}
```

**Example Data**:
```typescript
const DISH_COMPONENT_MAPS: DishComponentMap[] = [
  {
    dishName: '蛋炒飯',
    dishNameEn: 'Egg Fried Rice',
    dishType: DishType.FRIED_RICE,
    region: ['taiwan', 'china'],
    commonComponents: [
      {
        name: '白飯',
        nameEn: 'White Rice',
        category: ComponentCategory.GRAIN,
        typicalPortion: 200,
        portionRange: { min: 150, max: 300 },
        frequency: 1.0,
        alternatives: ['糙米飯', '炒飯'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.STIR_FRIED,
            calorieMultiplier: 1.3,
            fatMultiplier: 3.0,
            proteinRetention: 0.95,
            vitaminRetention: 0.85,
            notes: '炒製過程增加油脂'
          }
        ]
      },
      {
        name: '雞蛋',
        nameEn: 'Egg',
        category: ComponentCategory.PROTEIN,
        typicalPortion: 50,
        portionRange: { min: 30, max: 100 },
        frequency: 1.0,
        alternatives: [],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: [
          {
            method: CookingMethod.STIR_FRIED,
            calorieMultiplier: 1.2,
            fatMultiplier: 1.5,
            proteinRetention: 0.98,
            vitaminRetention: 0.90,
            notes: '炒蛋增加少量油脂'
          }
        ]
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: ComponentCategory.GARNISH,
        typicalPortion: 10,
        portionRange: { min: 5, max: 20 },
        frequency: 0.9,
        alternatives: ['蔥花'],
        cookingMethods: [CookingMethod.STIR_FRIED],
        nutritionImpact: []
      }
    ],
    regionalVariations: [
      {
        region: 'taiwan',
        components: [
          {
            name: '火腿',
            category: ComponentCategory.PROTEIN,
            typicalPortion: 30,
            portionRange: { min: 20, max: 50 },
            frequency: 0.7,
            alternatives: ['香腸', '培根'],
            cookingMethods: [CookingMethod.STIR_FRIED],
            nutritionImpact: []
          }
        ],
        culturalNotes: '台式炒飯常加火腿或香腸'
      }
    ],
    typicalPortionRange: {
      min: 250,
      max: 400,
      typical: 300
    }
  }
];
```

### 4. Component Nutrition Calculator

**Purpose**: 計算成分的營養價值，考慮烹飪方式的影響

**Interface**:
```typescript
interface ComponentNutritionCalculator {
  calculateComponentNutrition(
    component: DetectedComponent,
    cookingMethod: CookingMethod
  ): Promise<NutritionData>;
  
  aggregateDishNutrition(
    components: EnrichedComponent[]
  ): Promise<NutritionSummary>;
  
  applyCookingEffects(
    baseNutrition: NutritionData,
    cookingMethod: CookingMethod,
    componentType: ComponentCategory
  ): NutritionData;
}

interface NutritionSummary {
  total: NutritionData;
  byComponent: ComponentNutrition[];
  byCategory: CategoryNutrition[];
  cookingImpact: {
    method: CookingMethod;
    caloriesAdded: number;
    fatAdded: number;
    notes: string;
  }[];
}

interface ComponentNutrition {
  component: EnrichedComponent;
  rawNutrition: NutritionData;
  cookedNutrition: NutritionData;
  portionNutrition: NutritionData;
  percentageOfTotal: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface CategoryNutrition {
  category: ComponentCategory;
  totalNutrition: NutritionData;
  components: string[];
  percentageOfDish: number;
}
```

## Data Models

### Extended Food Items

```typescript
interface ExtendedFoodItem extends FoodItem {
  componentInfo?: {
    category: ComponentCategory;
    isCommonComponent: boolean;
    typicalDishes: string[];
    cookingMethods: CookingMethod[];
    portionRanges: {
      min: number;
      max: number;
      typical: number;
    };
  };
  
  cookingEffects?: {
    [key in CookingMethod]?: {
      nutritionMultiplier: Partial<NutritionData>;
      notes: string;
    };
  };
}
```

### Component Detection Response

```typescript
interface ComponentRecognitionResponse {
  success: boolean;
  data: {
    mainDish: {
      name: string;
      type: DishType;
      confidence: number;
      estimatedTotalPortion: number;
    };
    
    components: DetectedComponent[];
    
    nutritionSummary: {
      total: NutritionData;
      byComponent: ComponentNutrition[];
      byCategory: CategoryNutrition[];
      cookingImpact: string;
    };
    
    metadata: {
      processingTime: number;
      confidenceScore: number;
      detectionMethod: 'vision_api' | 'knowledge_base' | 'hybrid';
      componentsDetected: number;
      componentsFromKB: number;
      componentsFromVision: number;
    };
    
    suggestions: {
      possibleMissingComponents: string[];
      portionAdjustments: {
        component: string;
        suggestedPortion: number;
        reason: string;
      }[];
      alternativeInterpretations: {
        dishName: string;
        components: DetectedComponent[];
        confidence: number;
      }[];
    };
  };
  error?: string;
}
```

## Error Handling

### Error Scenarios

1. **Vision API Failure**
   - Fallback: Use knowledge base common components
   - User notification: "使用常見配料估計"

2. **Component Not in Knowledge Base**
   - Mark as "營養資訊不可用"
   - Log for future addition
   - Suggest similar components

3. **Low Confidence Detection**
   - Mark components with < 70% confidence
   - Provide alternative interpretations
   - Allow user correction

4. **Portion Estimation Uncertainty**
   - Provide range instead of single value
   - Use typical portions from knowledge base
   - Allow user adjustment

## Testing Strategy

### Unit Tests
- Component detection logic
- Nutrition calculation accuracy
- Cooking method effects
- Knowledge base queries

### Integration Tests
- End-to-end component detection flow
- API response format validation
- Error handling and fallback mechanisms
- Performance benchmarks

### User Acceptance Tests
- Real dish images from different cuisines
- Regional variation testing
- Accuracy measurement against ground truth
- User feedback collection

## Performance Considerations

### Optimization Strategies

1. **Caching**
   - Cache common dish-component mappings
   - Cache nutrition calculations
   - TTL: 24 hours for component data

2. **Batch Processing**
   - Process multiple components in parallel
   - Aggregate nutrition calculations
   - Optimize database queries

3. **Smart Fallback**
   - Quick knowledge base lookup first
   - Vision API only for uncertain cases
   - Progressive enhancement approach

4. **Response Streaming**
   - Return main dish info immediately
   - Stream component results as detected
   - Update nutrition summary progressively

### Performance Targets

- Simple dishes (1-3 components): < 3 seconds
- Medium dishes (4-6 components): < 5 seconds
- Complex dishes (7+ components): < 8 seconds
- Knowledge base queries: < 100ms
- Cache hit rate: > 60%

## Security and Privacy

- No storage of user food images (unless opted in)
- Anonymized usage statistics
- Secure API key management
- Rate limiting on Vision API calls

## Future Enhancements

### Phase 2 (Optional)
- Machine learning model for component detection
- User feedback learning system
- Personalized component preferences
- 3D dish structure analysis

### Phase 3 (Optional)
- Cross-cultural dish fusion detection
- Nutritional recommendations based on components
- Meal planning with component substitutions
- Integration with recipe databases
