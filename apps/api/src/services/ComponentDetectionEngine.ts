/**
 * 成分檢測引擎
 * Component Detection Engine
 * 
 * 此服務負責識別亞洲料理中的個別成分，包括：
 * - 料理類型自動判斷
 * - 成分提取和識別
 * - 知識庫增強
 * - 成分驗證
 */

import OpenAI from 'openai';
import {
  ComponentDetectionResult,
  DetectedComponent,
  DishType,
  MainDishInfo,
  DetectionMetadata,
  UserSuggestions,
  NutritionSummary,
  ValidationResult,
  EnrichedComponent,
  ComponentCategory,
  CookingMethod,
  VisualFeatures
} from '../types/ComponentDetection';
import {
  generateSoupComponentPrompt,
  generateFriedRiceComponentPrompt,
  generateStirFryComponentPrompt,
  generateBentoComponentPrompt,
  generateNoodlesComponentPrompt,
  generateDumplingComponentPrompt,
  generateBarbecueComponentPrompt,
  generateGenericComponentPrompt,
  generateComponentRefinementPrompt
} from './ComponentDetectionPrompts';
import {
  findDishComponentMap,
  findDishComponentMapsByType,
  DISH_COMPONENT_MAPS
} from '../data/dishComponentMaps';
import { ComponentSuggestionGenerator } from './ComponentSuggestionGenerator';
import { recognitionResultCache } from './RecognitionResultCache';
import { componentBatchProcessor } from './ComponentBatchProcessor';

/**
 * 成分檢測引擎類
 */
export class ComponentDetectionEngine {
  private openai: OpenAI | null;
  private language: 'zh-TW' | 'en';
  private suggestionGenerator: ComponentSuggestionGenerator;

  constructor(language: 'zh-TW' | 'en' = 'zh-TW') {
    this.language = language;
    this.suggestionGenerator = new ComponentSuggestionGenerator();
    
    // 初始化 OpenAI 客戶端
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      console.log('✅ ComponentDetectionEngine: OpenAI Vision API 已初始化');
    } else {
      this.openai = null;
      console.warn('⚠️ ComponentDetectionEngine: OPENAI_API_KEY 未設定');
    }
  }

  /**
   * 主要方法：檢測料理中的成分
   * 
   * @param image - 圖片 Buffer
   * @param dishName - 料理名稱（可選）
   * @param dishType - 料理類型（可選）
   * @returns 成分檢測結果
   */
  async detectComponents(
    image: Buffer,
    dishName?: string,
    dishType?: DishType
  ): Promise<ComponentDetectionResult> {
    const startTime = Date.now();
    
    console.log('🔍 ComponentDetectionEngine: 開始成分檢測...');
    console.log(`   料理名稱: ${dishName || '未指定'}`);
    console.log(`   料理類型: ${dishType || '未指定'}`);

    try {
      // Step 1: 如果沒有提供料理類型，自動判斷
      let detectedDishType = dishType;
      let detectedDishName = dishName;
      let dishConfidence = 1.0;

      if (!detectedDishType) {
        // 只有在沒有料理類型時才需要判斷
        // 如果有 dishName，將其作為上下文傳遞給 detectDishType
        const dishInfo = await this.detectDishType(image, dishName);
        detectedDishType = dishInfo.type;
        
        // 如果沒有提供 dishName，使用 detectDishType 的結果
        if (!detectedDishName) {
          detectedDishName = dishInfo.name;
        }
        
        dishConfidence = dishInfo.confidence;
        
        console.log(`   自動判斷料理: ${detectedDishName} (${detectedDishType})`);
        console.log(`   信心度: ${(dishConfidence * 100).toFixed(1)}%`);
      } else if (!detectedDishName) {
        // 如果有類型但沒有名稱，使用類型作為名稱
        detectedDishName = detectedDishType;
      }

      // Step 2: 使用 Vision API 提取成分
      const visionComponents = await this.extractComponentsFromVision(
        image,
        detectedDishName!,
        detectedDishType!
      );
      
      console.log(`   Vision API 識別到 ${visionComponents.length} 個成分`);

      // Step 3: 使用知識庫增強成分資訊
      let enrichedComponents = await this.enrichWithKnowledgeBase(
        visionComponents,
        detectedDishName!,
        detectedDishType!
      );
      
      console.log(`   知識庫增強後共 ${enrichedComponents.length} 個成分`);

      // Step 3.5: 如果是湯品，應用湯品專用的份量調整
      if (detectedDishType === DishType.SOUP) {
        const dishMap = findDishComponentMap(detectedDishName!);
        const estimatedTotalPortion = dishMap?.typicalPortionRange.typical || 300;
        enrichedComponents = this.adjustSoupComponentPortions(
          enrichedComponents,
          estimatedTotalPortion
        );
      }

      // Step 3.6: 如果是炒菜類，應用炒菜專用的份量調整
      if (detectedDishType === DishType.STIR_FRY) {
        const dishMap = findDishComponentMap(detectedDishName!);
        const estimatedTotalPortion = dishMap?.typicalPortionRange.typical || 300;
        enrichedComponents = this.adjustStirFryComponentPortions(
          enrichedComponents,
          estimatedTotalPortion
        );
      }

      // Step 3.7: 如果是便當類，應用便當專用的份量調整和區域劃分
      if (detectedDishType === DishType.BENTO) {
        const dishMap = findDishComponentMap(detectedDishName!);
        const estimatedTotalPortion = dishMap?.typicalPortionRange.typical || 500;
        enrichedComponents = this.adjustBentoComponentPortions(
          enrichedComponents,
          estimatedTotalPortion
        );
      }

      // Step 3.8: 如果是點心類，應用點心專用的份量調整和內餡識別
      if (detectedDishType === DishType.DUMPLING) {
        const dishMap = findDishComponentMap(detectedDishName!);
        const estimatedTotalPortion = dishMap?.typicalPortionRange.typical || 50;
        enrichedComponents = this.adjustDumplingComponentPortions(
          enrichedComponents,
          estimatedTotalPortion
        );
      }

      // Step 3.9: 如果是燒烤類，應用燒烤專用的份量調整
      if (detectedDishType === DishType.BARBECUE) {
        const dishMap = findDishComponentMap(detectedDishName!);
        const estimatedTotalPortion = dishMap?.typicalPortionRange.typical || 250;
        enrichedComponents = this.adjustBarbecueComponentPortions(
          enrichedComponents,
          estimatedTotalPortion
        );
      }

      // Step 4: 驗證成分的合理性
      const validationResult = this.validateComponents(
        enrichedComponents,
        detectedDishType!
      );
      
      // 如果是湯品，添加湯品專用驗證
      if (detectedDishType === DishType.SOUP) {
        const soupWarnings = this.validateSoupComponents(enrichedComponents);
        validationResult.warnings.push(...soupWarnings);
      }

      // 如果是炒菜類，添加炒菜專用驗證
      if (detectedDishType === DishType.STIR_FRY) {
        const stirFryWarnings = this.validateStirFryComponents(enrichedComponents);
        validationResult.warnings.push(...stirFryWarnings);
      }

      // 如果是便當類，添加便當專用驗證
      if (detectedDishType === DishType.BENTO) {
        const bentoWarnings = this.validateBentoComponents(enrichedComponents);
        validationResult.warnings.push(...bentoWarnings);
      }

      // 如果是點心類，添加點心專用驗證
      if (detectedDishType === DishType.DUMPLING) {
        const dumplingWarnings = this.validateDumplingComponents(enrichedComponents);
        validationResult.warnings.push(...dumplingWarnings);
      }

      // 如果是燒烤類，添加燒烤專用驗證
      if (detectedDishType === DishType.BARBECUE) {
        const barbecueWarnings = this.validateBarbecueComponents(enrichedComponents);
        validationResult.warnings.push(...barbecueWarnings);
      }
      
      if (validationResult.warnings.length > 0) {
        console.log(`   ⚠️ 驗證警告: ${validationResult.warnings.join(', ')}`);
      }

      // Step 5: 計算總份量
      const totalPortion = enrichedComponents.reduce(
        (sum, comp) => sum + comp.estimatedPortion,
        0
      );

      // Step 6: 生成用戶建議
      const suggestions = this.generateSuggestions(
        enrichedComponents,
        detectedDishName!,
        detectedDishType!,
        validationResult
      );

      // Step 7: 組裝最終結果
      const processingTime = Date.now() - startTime;
      
      const result: ComponentDetectionResult = {
        mainDish: {
          name: detectedDishName!,
          type: detectedDishType!,
          confidence: dishConfidence,
          estimatedTotalPortion: totalPortion
        },
        components: enrichedComponents,
        nutritionSummary: {
          total: {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fat: 0
          },
          byComponent: [],
          byCategory: [],
          cookingImpact: []
        }, // 將在 ComponentNutritionCalculator 中計算
        metadata: {
          processingTime,
          confidenceScore: this.calculateOverallConfidence(enrichedComponents),
          detectionMethod: visionComponents.length > 0 ? 'hybrid' : 'knowledge_base',
          componentsDetected: enrichedComponents.length,
          componentsFromKB: enrichedComponents.filter(c => (c as any).knowledgeBaseMatch).length,
          componentsFromVision: visionComponents.length
        },
        suggestions
      };

      console.log(`✅ 成分檢測完成，耗時 ${processingTime}ms`);
      console.log(`   總成分數: ${result.components.length}`);
      console.log(`   整體信心度: ${(result.metadata.confidenceScore * 100).toFixed(1)}%`);

      return result;

    } catch (error) {
      console.error('❌ ComponentDetectionEngine 錯誤:', error);
      throw new Error(`成分檢測失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 自動判斷料理類型
   * 
   * @param image - 圖片 Buffer
   * @param knownDishName - 已知的料理名稱（可選，用作上下文）
   * @returns 料理資訊
   */
  private async detectDishType(image: Buffer, knownDishName?: string): Promise<MainDishInfo> {
    if (!this.openai) {
      // 如果沒有 OpenAI，返回預設值
      return {
        name: knownDishName || '未知料理',
        type: DishType.UNKNOWN,
        confidence: 0.5,
        estimatedTotalPortion: 300
      };
    }

    try {
      const base64Image = image.toString('base64');
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;

      // 如果已知料理名稱，將其作為上下文
      const contextHint = knownDishName 
        ? `\n\n已知料理名稱：${knownDishName}\n請根據此名稱判斷料理類型。`
        : '';

      const prompt = this.language === 'zh-TW'
        ? `請識別這張圖片中的料理類型。${contextHint}

請以 JSON 格式回應：
{
  "dishName": "料理名稱（繁體中文）",
  "dishType": "料理類型（soup/fried_rice/stir_fry/bento/noodles/dumpling/barbecue/hot_pot/curry/unknown）",
  "confidence": 0.95,
  "estimatedTotalPortion": 300
}

料理類型說明：
- soup: 湯品類（味噌湯、蛋花湯、貢丸湯等）
- fried_rice: 炒飯類
- stir_fry: 炒菜類
- bento: 便當類
- noodles: 麵食類（拉麵、烏龍麵、米粉等）
- dumpling: 點心類（小籠包、餃子、燒賣等）
- barbecue: 燒烤類
- hot_pot: 火鍋類
- curry: 咖哩類（日式咖哩、泰式咖哩、印度咖哩等）
- unknown: 無法判斷`
        : `Please identify the dish type in this image.

Respond in JSON format:
{
  "dishName": "dish name",
  "dishType": "dish type (soup/fried_rice/stir_fry/bento/noodles/dumpling/barbecue/hot_pot/curry/unknown)",
  "confidence": 0.95,
  "estimatedTotalPortion": 300
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content || '{}';
      
      // 清理回應，移除 markdown 標記
      let cleanedContent = content.trim();
      
      // 移除可能的 markdown 代碼塊標記
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '');
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '');
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.replace(/\s*```$/, '');
      }
      
      console.log('🧹 清理後的料理類型 JSON:', cleanedContent.substring(0, 200));
      
      const parsed = JSON.parse(cleanedContent);

      return {
        name: parsed.dishName || '未知料理',
        type: (parsed.dishType as DishType) || DishType.UNKNOWN,
        confidence: parsed.confidence || 0.7,
        estimatedTotalPortion: parsed.estimatedTotalPortion || 300
      };

    } catch (error) {
      console.error('料理類型判斷失敗:', error);
      if (error instanceof Error) {
        console.error('錯誤訊息:', error.message);
      }
      return {
        name: '未知料理',
        type: DishType.UNKNOWN,
        confidence: 0.5,
        estimatedTotalPortion: 300
      };
    }
  }

  /**
   * 從 Vision API 提取成分
   * 
   * @param image - 圖片 Buffer
   * @param dishName - 料理名稱
   * @param dishType - 料理類型
   * @returns 檢測到的成分列表
   */
  private async extractComponentsFromVision(
    image: Buffer,
    dishName: string,
    dishType: DishType
  ): Promise<DetectedComponent[]> {
    if (!this.openai) {
      console.log('   Vision API 不可用，跳過成分提取');
      return [];
    }

    try {
      // 根據料理類型選擇合適的 prompt
      const prompt = this.selectPromptForDishType(dishType, dishName);
      
      const base64Image = image.toString('base64');
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;

      console.log(`   使用 ${dishType} 專用 prompt 調用 Vision API...`);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content || '{}';
      console.log('   Vision API 回應:', content.substring(0, 200) + '...');

      // 清理回應，移除 markdown 標記
      let cleanedContent = content.trim();
      
      // 移除可能的 markdown 代碼塊標記
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '');
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '');
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.replace(/\s*```$/, '');
      }
      
      console.log('🧹 清理後的成分 JSON:', cleanedContent.substring(0, 200) + '...');

      // 解析回應
      const parsed = JSON.parse(cleanedContent);
      const components = parsed.components || parsed.foods || [];

      // 轉換為 DetectedComponent 格式
      return components.map((comp: any, index: number) => ({
        id: `vision-${Date.now()}-${index}`,
        name: comp.name || '',
        nameEn: comp.nameEn,
        confidence: comp.confidence || 0.7,
        estimatedPortion: comp.estimatedPortion || comp.portion || 50,
        cookingMethod: this.parseCookingMethod(comp.cookingMethod),
        category: this.parseCategory(comp.category),
        visualFeatures: comp.visualFeatures ? {
          color: Array.isArray(comp.visualFeatures.color) 
            ? comp.visualFeatures.color 
            : [comp.visualFeatures.color || ''],
          shape: comp.visualFeatures.shape || '',
          texture: comp.visualFeatures.texture || '',
          position: comp.visualFeatures.position || ''
        } : undefined
      }));

    } catch (error) {
      console.error('Vision API 成分提取失敗:', error);
      if (error instanceof Error) {
        console.error('錯誤訊息:', error.message);
      }
      return [];
    }
  }

  /**
   * 根據料理類型選擇合適的 prompt
   */
  private selectPromptForDishType(dishType: DishType, dishName: string): string {
    // 添加料理名稱作為上下文
    const dishContext = this.language === 'zh-TW'
      ? `\n\n**料理名稱**：${dishName}\n請根據此料理名稱識別成分。如果料理名稱包含特定食材（如「豆腐干絲」），請優先識別該食材，而非相似的其他食材（如「麵條」）。\n\n`
      : `\n\n**Dish Name**: ${dishName}\nPlease identify components based on this dish name. If the dish name contains specific ingredients (e.g., "dried tofu strips"), prioritize identifying that ingredient over similar alternatives (e.g., "noodles").\n\n`;
    
    let basePrompt: string;
    
    switch (dishType) {
      case DishType.SOUP:
        basePrompt = generateSoupComponentPrompt(this.language);
        break;
      case DishType.FRIED_RICE:
        basePrompt = generateFriedRiceComponentPrompt(this.language);
        break;
      case DishType.STIR_FRY:
        basePrompt = generateStirFryComponentPrompt(this.language);
        break;
      case DishType.BENTO:
        basePrompt = generateBentoComponentPrompt(this.language);
        break;
      case DishType.NOODLES:
        basePrompt = generateNoodlesComponentPrompt(this.language);
        break;
      case DishType.DUMPLING:
        basePrompt = generateDumplingComponentPrompt(this.language);
        break;
      case DishType.BARBECUE:
        basePrompt = generateBarbecueComponentPrompt(this.language);
        break;
      default:
        return generateGenericComponentPrompt(dishName, this.language);
    }
    
    // 將料理名稱上下文插入到 prompt 開頭
    return dishContext + basePrompt;
  }

  /**
   * 使用知識庫增強成分資訊
   * 
   * @param visionComponents - Vision API 識別的成分
   * @param dishName - 料理名稱
   * @param dishType - 料理類型
   * @returns 增強後的成分列表
   */
  async enrichWithKnowledgeBase(
    visionComponents: DetectedComponent[],
    dishName: string,
    dishType: DishType
  ): Promise<EnrichedComponent[]> {
    console.log('   使用知識庫增強成分資訊...');
    console.log('   🚀 使用批量處理優化...');

    // 嘗試從緩存獲取料理的常見成分
    const cachedComponents = recognitionResultCache.getComponentsForDish(dishName, dishType);
    
    if (cachedComponents && cachedComponents.length > 0) {
      console.log(`   從緩存獲取成分映射: ${dishName} (${cachedComponents.length} 個成分)`);
      
      // 合併 Vision API 識別的成分和緩存的成分
      const enrichedComponents: EnrichedComponent[] = [];
      
      // 首先添加 Vision API 識別的成分
      for (const visionComp of visionComponents) {
        enrichedComponents.push({
          ...visionComp,
          knowledgeBaseMatch: false
        });
      }
      
      // 添加緩存中的成分（如果未被 Vision API 識別）
      for (const cachedComp of cachedComponents) {
        const alreadyDetected = visionComponents.some(
          vc => this.isSimilarComponent(vc.name, cachedComp.name)
        );
        
        if (!alreadyDetected && cachedComp.confidence >= 0.7) {
          enrichedComponents.push({
            ...cachedComp,
            knowledgeBaseMatch: true
          } as EnrichedComponent);
        }
      }
      
      // 使用批量處理豐富成分資訊
      if (enrichedComponents.length > 0) {
        const batchEnriched = await componentBatchProcessor.batchEnrichComponents(enrichedComponents);
        return batchEnriched;
      }
      
      return enrichedComponents;
    }

    // 緩存未命中，從知識庫查找料理的常見成分
    const dishMap = findDishComponentMap(dishName);
    const enrichedComponents: EnrichedComponent[] = [];

    // 首先添加 Vision API 識別的成分
    for (const visionComp of visionComponents) {
      enrichedComponents.push({
        ...visionComp,
        knowledgeBaseMatch: false
      });
    }

    // 如果找到知識庫映射，補充可能缺失的常見成分
    if (dishMap) {
      console.log(`   找到知識庫映射: ${dishMap.dishName}`);
      
      // 檢查哪些常見成分沒有被 Vision API 識別到
      for (const kbComp of dishMap.commonComponents) {
        // 檢查是否已經被識別
        const alreadyDetected = visionComponents.some(
          vc => this.isSimilarComponent(vc.name, kbComp.name)
        );

        // 如果是高頻率成分且未被識別，且信心度較高，則添加
        if (!alreadyDetected && kbComp.frequency >= 0.7) {
          console.log(`   從知識庫補充成分: ${kbComp.name} (頻率: ${kbComp.frequency})`);
          
          enrichedComponents.push({
            id: `kb-${Date.now()}-${enrichedComponents.length}`,
            name: kbComp.name,
            nameEn: kbComp.nameEn,
            confidence: kbComp.frequency * 0.8, // 降低信心度，因為是推測的
            estimatedPortion: kbComp.typicalPortion,
            cookingMethod: kbComp.cookingMethods[0],
            category: kbComp.category,
            knowledgeBaseMatch: true,
            similarComponents: kbComp.alternatives
          });
        }
      }
    } else {
      console.log(`   未找到知識庫映射: ${dishName}`);
      
      // 嘗試根據料理類型找到相似的料理
      const similarDishes = findDishComponentMapsByType(dishType);
      if (similarDishes.length > 0) {
        console.log(`   找到 ${similarDishes.length} 個相似料理類型`);
      }
    }

    console.log(`   增強完成，共 ${enrichedComponents.length} 個成分`);
    
    // 將結果存入緩存（僅緩存知識庫的成分）
    const kbComponents = enrichedComponents.filter(c => c.knowledgeBaseMatch);
    if (kbComponents.length > 0) {
      recognitionResultCache.setComponentsForDish(dishName, dishType, kbComponents);
      console.log(`   已緩存 ${kbComponents.length} 個知識庫成分`);
    }
    
    return enrichedComponents;
  }

  /**
   * 驗證成分的合理性
   * 
   * @param components - 成分列表
   * @param dishType - 料理類型
   * @returns 驗證結果
   */
  validateComponents(
    components: EnrichedComponent[],
    dishType: DishType
  ): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    const suggestions: string[] = [];

    // 檢查是否有成分
    if (components.length === 0) {
      errors.push('未檢測到任何成分');
      suggestions.push('請確保圖片清晰且包含食物');
      return { isValid: false, warnings, errors, suggestions };
    }

    // 檢查低信心度成分
    const lowConfidenceComponents = components.filter(c => c.confidence < 0.5);
    if (lowConfidenceComponents.length > 0) {
      warnings.push(`${lowConfidenceComponents.length} 個成分信心度較低`);
      suggestions.push('建議手動確認這些成分');
    }

    // 檢查成分與料理類型的一致性
    const consistencyCheck = this.checkDishTypeConsistency(components, dishType);
    if (!consistencyCheck.isConsistent) {
      warnings.push(consistencyCheck.message);
    }

    // 檢查份量是否合理
    const totalPortion = components.reduce((sum, c) => sum + c.estimatedPortion, 0);
    if (totalPortion < 50) {
      warnings.push('總份量似乎過少');
    } else if (totalPortion > 1000) {
      warnings.push('總份量似乎過多');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      suggestions
    };
  }

  /**
   * 檢查成分與料理類型的一致性
   */
  private checkDishTypeConsistency(
    components: EnrichedComponent[],
    dishType: DishType
  ): { isConsistent: boolean; message: string } {
    // 根據料理類型檢查必要成分
    switch (dishType) {
      case DishType.FRIED_RICE:
        const hasRice = components.some(c => 
          c.name.includes('飯') || c.name.includes('rice')
        );
        if (!hasRice) {
          return {
            isConsistent: false,
            message: '炒飯類料理應該包含米飯成分'
          };
        }
        break;

      case DishType.SOUP:
        const hasSoupBase = components.some(c =>
          c.category === ComponentCategory.SAUCE || 
          c.name.includes('湯') || 
          c.name.includes('soup')
        );
        if (!hasSoupBase) {
          return {
            isConsistent: false,
            message: '湯品類料理應該包含湯底'
          };
        }
        break;

      case DishType.NOODLES:
        const hasNoodles = components.some(c =>
          c.name.includes('麵') || 
          c.name.includes('noodle') ||
          c.name.includes('米粉') ||
          c.name.includes('粉絲')
        );
        if (!hasNoodles) {
          return {
            isConsistent: false,
            message: '麵食類料理應該包含麵條或米粉'
          };
        }
        break;
    }

    return { isConsistent: true, message: '' };
  }

  /**
   * 生成用戶建議
   * 
   * 使用 ComponentSuggestionGenerator 生成完整的建議
   */
  private generateSuggestions(
    components: EnrichedComponent[],
    dishName: string,
    dishType: DishType,
    validationResult: ValidationResult
  ): UserSuggestions {
    // 構建主料理資訊
    const mainDish: MainDishInfo = {
      name: dishName,
      type: dishType,
      confidence: this.calculateOverallConfidence(components),
      estimatedTotalPortion: components.reduce((sum, c) => sum + c.estimatedPortion, 0)
    };

    // 使用建議生成器生成完整建議
    const suggestions = this.suggestionGenerator.generateSuggestions(
      mainDish,
      components,
      mainDish.confidence
    );

    // 記錄建議摘要
    const summary = this.suggestionGenerator.generateSuggestionSummary(suggestions);
    console.log(`   建議摘要: ${summary}`);

    return suggestions;
  }

  /**
   * 計算整體信心度
   */
  private calculateOverallConfidence(components: EnrichedComponent[]): number {
    if (components.length === 0) return 0;
    
    const totalConfidence = components.reduce((sum, c) => sum + c.confidence, 0);
    return totalConfidence / components.length;
  }

  /**
   * 判斷兩個成分名稱是否相似
   */
  private isSimilarComponent(name1: string, name2: string): boolean {
    // 簡單的相似度判斷
    const n1 = name1.toLowerCase().trim();
    const n2 = name2.toLowerCase().trim();
    
    return n1 === n2 || 
           n1.includes(n2) || 
           n2.includes(n1) ||
           this.calculateSimilarity(n1, n2) > 0.7;
  }

  /**
   * 計算字串相似度（簡單版本）
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 計算編輯距離
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 解析烹飪方式
   */
  private parseCookingMethod(method: string | undefined): CookingMethod | undefined {
    if (!method) return undefined;
    
    const methodMap: Record<string, CookingMethod> = {
      'raw': CookingMethod.RAW,
      'boiled': CookingMethod.BOILED,
      'fried': CookingMethod.FRIED,
      'deep_fried': CookingMethod.DEEP_FRIED,
      'steamed': CookingMethod.STEAMED,
      'grilled': CookingMethod.GRILLED,
      'braised': CookingMethod.BRAISED,
      'stir_fried': CookingMethod.STIR_FRIED,
      'pickled': CookingMethod.PICKLED
    };
    
    return methodMap[method.toLowerCase()];
  }

  /**
   * 解析成分類別
   */
  private parseCategory(category: string | undefined): ComponentCategory | undefined {
    if (!category) return undefined;
    
    const categoryMap: Record<string, ComponentCategory> = {
      'grain': ComponentCategory.GRAIN,
      'protein': ComponentCategory.PROTEIN,
      'vegetable': ComponentCategory.VEGETABLE,
      'seasoning': ComponentCategory.SEASONING,
      'sauce': ComponentCategory.SAUCE,
      'garnish': ComponentCategory.GARNISH
    };
    
    return categoryMap[category.toLowerCase()];
  }

  /**
   * 湯品專用：處理液體和固體成分的份量估計
   * 
   * 湯品的特殊之處在於：
   * 1. 包含大量液體（湯底）
   * 2. 固體成分通常較少但重要
   * 3. 需要區分湯底和配料
   * 
   * @param components - 檢測到的成分
   * @param totalPortion - 總份量（毫升或克）
   * @returns 調整後的成分列表
   */
  private adjustSoupComponentPortions(
    components: EnrichedComponent[],
    totalPortion: number
  ): EnrichedComponent[] {
    console.log('   🍲 應用湯品專用份量調整邏輯...');
    
    // 識別液體成分（湯底）和固體成分（配料）
    const liquidComponents = components.filter(c => 
      c.category === ComponentCategory.SAUCE || 
      c.name.includes('湯') || 
      c.name.includes('高湯') ||
      c.name.includes('湯底') ||
      c.nameEn?.toLowerCase().includes('broth') ||
      c.nameEn?.toLowerCase().includes('soup') ||
      c.nameEn?.toLowerCase().includes('stock')
    );
    
    const solidComponents = components.filter(c => 
      !liquidComponents.includes(c)
    );
    
    console.log(`   液體成分: ${liquidComponents.length} 個`);
    console.log(`   固體成分: ${solidComponents.length} 個`);
    
    // 湯品的典型比例：液體佔 70-85%，固體佔 15-30%
    const liquidRatio = 0.75; // 預設 75% 是液體
    const solidRatio = 0.25;  // 預設 25% 是固體
    
    const estimatedLiquidPortion = totalPortion * liquidRatio;
    const estimatedSolidPortion = totalPortion * solidRatio;
    
    // 調整液體成分份量
    if (liquidComponents.length > 0) {
      const portionPerLiquid = estimatedLiquidPortion / liquidComponents.length;
      liquidComponents.forEach(comp => {
        comp.estimatedPortion = Math.round(portionPerLiquid);
        console.log(`   調整液體成分 "${comp.name}": ${comp.estimatedPortion}ml`);
      });
    }
    
    // 調整固體成分份量
    if (solidComponents.length > 0) {
      // 計算當前固體成分的總份量
      const currentSolidTotal = solidComponents.reduce(
        (sum, c) => sum + c.estimatedPortion, 
        0
      );
      
      // 如果當前總份量與估計不符，按比例調整
      if (currentSolidTotal > 0) {
        const adjustmentRatio = estimatedSolidPortion / currentSolidTotal;
        
        // 只在差異較大時才調整（避免過度調整）
        if (adjustmentRatio < 0.7 || adjustmentRatio > 1.3) {
          solidComponents.forEach(comp => {
            const originalPortion = comp.estimatedPortion;
            comp.estimatedPortion = Math.round(comp.estimatedPortion * adjustmentRatio);
            console.log(`   調整固體成分 "${comp.name}": ${originalPortion}g → ${comp.estimatedPortion}g`);
          });
        }
      }
    }
    
    // 為湯品成分添加特殊標記
    components.forEach(comp => {
      if (liquidComponents.includes(comp)) {
        (comp as any).componentType = 'liquid';
      } else {
        (comp as any).componentType = 'solid';
      }
    });
    
    return components;
  }

  /**
   * 湯品專用：驗證成分的合理性
   * 
   * @param components - 成分列表
   * @returns 驗證結果
   */
  private validateSoupComponents(components: EnrichedComponent[]): string[] {
    const warnings: string[] = [];
    
    // 檢查是否有湯底
    const hasBroth = components.some(c => 
      c.category === ComponentCategory.SAUCE ||
      c.name.includes('湯') ||
      c.name.includes('高湯') ||
      c.name.includes('湯底')
    );
    
    if (!hasBroth) {
      warnings.push('湯品中未檢測到湯底，可能識別不完整');
    }
    
    // 檢查液體成分的份量是否合理（應該是最大的）
    const liquidComponents = components.filter(c => 
      (c as any).componentType === 'liquid'
    );
    
    const solidComponents = components.filter(c => 
      (c as any).componentType === 'solid'
    );
    
    if (liquidComponents.length > 0 && solidComponents.length > 0) {
      const totalLiquid = liquidComponents.reduce((sum, c) => sum + c.estimatedPortion, 0);
      const totalSolid = solidComponents.reduce((sum, c) => sum + c.estimatedPortion, 0);
      
      // 液體應該佔大部分
      if (totalLiquid < totalSolid) {
        warnings.push('湯底份量似乎過少，可能需要調整');
      }
      
      // 液體不應該超過 90%
      const liquidRatio = totalLiquid / (totalLiquid + totalSolid);
      if (liquidRatio > 0.9) {
        warnings.push('配料份量似乎過少，可能識別不完整');
      }
    }
    
    // 檢查常見的湯品配料
    const commonSoupIngredients = ['豆腐', '蛋', '青蔥', '香菜', '海帶', '菇'];
    const hasCommonIngredient = components.some(c => 
      commonSoupIngredients.some(ing => c.name.includes(ing))
    );
    
    if (!hasCommonIngredient && solidComponents.length === 0) {
      warnings.push('未檢測到常見的湯品配料，建議手動確認');
    }
    
    return warnings;
  }

  /**
   * 湯品專用：生成特定建議
   * 
   * @param components - 成分列表
   * @param dishName - 料理名稱
   * @returns 建議列表
   */
  private generateSoupSpecificSuggestions(
    components: EnrichedComponent[],
    dishName: string
  ): string[] {
    const suggestions: string[] = [];
    
    // 根據湯品類型提供建議
    if (dishName.includes('味噌湯')) {
      const hasTofu = components.some(c => c.name.includes('豆腐'));
      const hasSeaweed = components.some(c => c.name.includes('海帶') || c.name.includes('海苔'));
      
      if (!hasTofu) {
        suggestions.push('味噌湯通常包含豆腐，您可能需要添加');
      }
      if (!hasSeaweed) {
        suggestions.push('味噌湯通常包含海帶芽，您可能需要添加');
      }
    } else if (dishName.includes('蛋花湯')) {
      const hasEgg = components.some(c => c.name.includes('蛋'));
      if (!hasEgg) {
        suggestions.push('蛋花湯的主要成分是雞蛋，請確認是否遺漏');
      }
    } else if (dishName.includes('貢丸湯')) {
      const hasMeatball = components.some(c => 
        c.name.includes('貢丸') || c.name.includes('肉丸')
      );
      if (!hasMeatball) {
        suggestions.push('貢丸湯的主要成分是貢丸，請確認是否遺漏');
      }
    } else if (dishName.includes('酸辣湯')) {
      const hasTofu = components.some(c => c.name.includes('豆腐'));
      const hasMushroom = components.some(c => c.name.includes('木耳') || c.name.includes('菇'));
      
      if (!hasTofu) {
        suggestions.push('酸辣湯通常包含豆腐');
      }
      if (!hasMushroom) {
        suggestions.push('酸辣湯通常包含木耳或香菇');
      }
    }
    
    // 通用湯品建議
    const liquidComponents = components.filter(c => 
      (c as any).componentType === 'liquid'
    );
    
    if (liquidComponents.length === 0) {
      suggestions.push('建議添加湯底成分（如高湯、清湯等）');
    }
    
    return suggestions;
  }

  /**
   * 炒菜類專用：調整成分份量
   * 
   * @param components - 成分列表
   * @param totalPortion - 總份量
   * @returns 調整後的成分列表
   */
  private adjustStirFryComponentPortions(
    components: EnrichedComponent[],
    totalPortion: number
  ): EnrichedComponent[] {
    console.log('   🥘 應用炒菜專用份量調整邏輯...');
    
    // 識別主要食材、蛋白質、調味料
    const mainIngredients = components.filter(c => 
      c.category === ComponentCategory.VEGETABLE || 
      c.category === ComponentCategory.GRAIN
    );
    
    const proteinComponents = components.filter(c => 
      c.category === ComponentCategory.PROTEIN
    );
    
    const seasoningComponents = components.filter(c => 
      c.category === ComponentCategory.SEASONING ||
      c.category === ComponentCategory.GARNISH ||
      c.category === ComponentCategory.SAUCE
    );
    
    console.log(`   主要食材: ${mainIngredients.length} 個`);
    console.log(`   蛋白質: ${proteinComponents.length} 個`);
    console.log(`   調味料: ${seasoningComponents.length} 個`);
    
    // 炒菜的典型比例：
    // - 主要食材（蔬菜/主食）: 50-60%
    // - 蛋白質: 30-40%
    // - 調味料: 5-10%
    const mainRatio = 0.55;
    const proteinRatio = 0.35;
    const seasoningRatio = 0.10;
    
    const estimatedMainPortion = totalPortion * mainRatio;
    const estimatedProteinPortion = totalPortion * proteinRatio;
    const estimatedSeasoningPortion = totalPortion * seasoningRatio;
    
    // 調整主要食材份量
    if (mainIngredients.length > 0) {
      const currentMainTotal = mainIngredients.reduce(
        (sum, c) => sum + c.estimatedPortion, 
        0
      );
      
      if (currentMainTotal > 0) {
        const adjustmentRatio = estimatedMainPortion / currentMainTotal;
        
        if (adjustmentRatio < 0.7 || adjustmentRatio > 1.3) {
          mainIngredients.forEach(comp => {
            const originalPortion = comp.estimatedPortion;
            comp.estimatedPortion = Math.round(comp.estimatedPortion * adjustmentRatio);
            console.log(`   調整主要食材 "${comp.name}": ${originalPortion}g → ${comp.estimatedPortion}g`);
          });
        }
      }
    }
    
    // 調整蛋白質份量
    if (proteinComponents.length > 0) {
      const currentProteinTotal = proteinComponents.reduce(
        (sum, c) => sum + c.estimatedPortion, 
        0
      );
      
      if (currentProteinTotal > 0) {
        const adjustmentRatio = estimatedProteinPortion / currentProteinTotal;
        
        if (adjustmentRatio < 0.7 || adjustmentRatio > 1.3) {
          proteinComponents.forEach(comp => {
            const originalPortion = comp.estimatedPortion;
            comp.estimatedPortion = Math.round(comp.estimatedPortion * adjustmentRatio);
            console.log(`   調整蛋白質 "${comp.name}": ${originalPortion}g → ${comp.estimatedPortion}g`);
          });
        }
      }
    }
    
    // 調整調味料份量（通常較小）
    if (seasoningComponents.length > 0) {
      seasoningComponents.forEach(comp => {
        // 調味料通常不超過 20g
        if (comp.estimatedPortion > 20) {
          const originalPortion = comp.estimatedPortion;
          comp.estimatedPortion = Math.min(comp.estimatedPortion, 20);
          console.log(`   調整調味料 "${comp.name}": ${originalPortion}g → ${comp.estimatedPortion}g`);
        }
      });
    }
    
    // 為炒菜成分添加特殊標記
    components.forEach(comp => {
      if (mainIngredients.includes(comp)) {
        (comp as any).componentType = 'main';
      } else if (proteinComponents.includes(comp)) {
        (comp as any).componentType = 'protein';
      } else {
        (comp as any).componentType = 'seasoning';
      }
    });
    
    return components;
  }

  /**
   * 炒菜類專用：驗證成分的合理性
   * 
   * @param components - 成分列表
   * @returns 驗證警告列表
   */
  private validateStirFryComponents(components: EnrichedComponent[]): string[] {
    const warnings: string[] = [];
    
    // 檢查是否有主要食材
    const hasMainIngredient = components.some(c => 
      c.category === ComponentCategory.VEGETABLE ||
      c.category === ComponentCategory.GRAIN
    );
    
    if (!hasMainIngredient) {
      warnings.push('炒菜類料理應該包含主要食材（蔬菜或主食）');
    }
    
    // 檢查烹飪方式
    const hasStirFried = components.some(c => 
      c.cookingMethod === CookingMethod.STIR_FRIED
    );
    
    if (!hasStirFried) {
      warnings.push('炒菜類料理的成分應該是炒製的');
    }
    
    // 檢查是否有過多的液體成分
    const liquidComponents = components.filter(c => 
      c.category === ComponentCategory.SAUCE &&
      c.estimatedPortion > 50
    );
    
    if (liquidComponents.length > 0) {
      warnings.push('炒菜類料理通常不含大量液體，請確認份量');
    }
    
    // 檢查混合成分的識別
    const totalComponents = components.length;
    if (totalComponents < 2) {
      warnings.push('炒菜類料理通常包含多種混合成分，可能有遺漏');
    }
    
    // 檢查調味料
    const hasGarlic = components.some(c => 
      c.name.includes('蒜') || 
      c.nameEn?.toLowerCase().includes('garlic')
    );
    
    if (!hasGarlic) {
      warnings.push('炒菜類料理通常使用蒜頭調味，可能有遺漏');
    }
    
    return warnings;
  }

  /**
   * 便當類專用：處理多個獨立成分的識別和區域劃分
   * 
   * 便當的特殊之處在於：
   * 1. 包含多個獨立的食物項目
   * 2. 有明確的區域劃分（主食、主菜、配菜）
   * 3. 每個區域的份量比例相對固定
   * 
   * @param components - 檢測到的成分
   * @param totalPortion - 總份量（克）
   * @returns 調整後的成分列表
   */
  private adjustBentoComponentPortions(
    components: EnrichedComponent[],
    totalPortion: number
  ): EnrichedComponent[] {
    console.log('   🍱 應用便當專用份量調整邏輯...');
    
    // 識別主食、主菜、配菜
    const stapleComponents = components.filter(c => 
      c.category === ComponentCategory.GRAIN ||
      c.name.includes('飯') ||
      c.name.includes('rice') ||
      c.name.includes('麵') ||
      c.name.includes('noodle')
    );
    
    const mainDishComponents = components.filter(c => 
      c.category === ComponentCategory.PROTEIN &&
      c.estimatedPortion >= 50 && // 主菜通常份量較大
      !stapleComponents.includes(c)
    );
    
    const sideDishComponents = components.filter(c => 
      !stapleComponents.includes(c) &&
      !mainDishComponents.includes(c)
    );
    
    console.log(`   主食: ${stapleComponents.length} 個`);
    console.log(`   主菜: ${mainDishComponents.length} 個`);
    console.log(`   配菜: ${sideDishComponents.length} 個`);
    
    // 便當的典型比例：
    // - 主食: 35-45% (通常是米飯)
    // - 主菜: 25-35% (主要蛋白質)
    // - 配菜: 25-35% (多種小菜)
    const stapleRatio = 0.40;
    const mainDishRatio = 0.30;
    const sideDishRatio = 0.30;
    
    const estimatedStaplePortion = totalPortion * stapleRatio;
    const estimatedMainDishPortion = totalPortion * mainDishRatio;
    const estimatedSideDishPortion = totalPortion * sideDishRatio;
    
    // 調整主食份量
    if (stapleComponents.length > 0) {
      const portionPerStaple = estimatedStaplePortion / stapleComponents.length;
      stapleComponents.forEach(comp => {
        const originalPortion = comp.estimatedPortion;
        comp.estimatedPortion = Math.round(portionPerStaple);
        console.log(`   調整主食 "${comp.name}": ${originalPortion}g → ${comp.estimatedPortion}g`);
        (comp as any).bentoRole = 'staple';
      });
    }
    
    // 調整主菜份量
    if (mainDishComponents.length > 0) {
      const currentMainDishTotal = mainDishComponents.reduce(
        (sum, c) => sum + c.estimatedPortion, 
        0
      );
      
      if (currentMainDishTotal > 0) {
        const adjustmentRatio = estimatedMainDishPortion / currentMainDishTotal;
        
        // 只在差異較大時才調整
        if (adjustmentRatio < 0.7 || adjustmentRatio > 1.3) {
          mainDishComponents.forEach(comp => {
            const originalPortion = comp.estimatedPortion;
            comp.estimatedPortion = Math.round(comp.estimatedPortion * adjustmentRatio);
            console.log(`   調整主菜 "${comp.name}": ${originalPortion}g → ${comp.estimatedPortion}g`);
          });
        }
      }
      
      mainDishComponents.forEach(comp => {
        (comp as any).bentoRole = 'main_dish';
      });
    }
    
    // 調整配菜份量
    if (sideDishComponents.length > 0) {
      const currentSideDishTotal = sideDishComponents.reduce(
        (sum, c) => sum + c.estimatedPortion, 
        0
      );
      
      if (currentSideDishTotal > 0) {
        const adjustmentRatio = estimatedSideDishPortion / currentSideDishTotal;
        
        // 只在差異較大時才調整
        if (adjustmentRatio < 0.7 || adjustmentRatio > 1.3) {
          sideDishComponents.forEach(comp => {
            const originalPortion = comp.estimatedPortion;
            comp.estimatedPortion = Math.round(comp.estimatedPortion * adjustmentRatio);
            console.log(`   調整配菜 "${comp.name}": ${originalPortion}g → ${comp.estimatedPortion}g`);
          });
        }
      }
      
      sideDishComponents.forEach(comp => {
        (comp as any).bentoRole = 'side_dish';
      });
    }
    
    // 為便當成分添加位置資訊（如果 Vision API 有提供）
    components.forEach(comp => {
      if (comp.visualFeatures?.position) {
        (comp as any).bentoPosition = comp.visualFeatures.position;
      }
    });
    
    return components;
  }

  /**
   * 便當類專用：驗證成分的合理性
   * 
   * @param components - 成分列表
   * @returns 驗證警告列表
   */
  private validateBentoComponents(components: EnrichedComponent[]): string[] {
    const warnings: string[] = [];
    
    // 檢查是否有主食
    const hasStaple = components.some(c => 
      c.category === ComponentCategory.GRAIN ||
      c.name.includes('飯') ||
      c.name.includes('rice')
    );
    
    if (!hasStaple) {
      warnings.push('便當中未檢測到主食（米飯），可能識別不完整');
    }
    
    // 檢查是否有主菜
    const hasMainDish = components.some(c => 
      c.category === ComponentCategory.PROTEIN &&
      c.estimatedPortion >= 50
    );
    
    if (!hasMainDish) {
      warnings.push('便當中未檢測到主菜（主要蛋白質），可能識別不完整');
    }
    
    // 檢查成分數量
    const totalComponents = components.length;
    if (totalComponents < 3) {
      warnings.push('便當通常包含多種食物（主食、主菜、配菜），可能有遺漏');
    } else if (totalComponents > 10) {
      warnings.push('檢測到的成分數量過多，可能有重複識別');
    }
    
    // 檢查主食份量
    const stapleComponents = components.filter(c => 
      (c as any).bentoRole === 'staple'
    );
    
    if (stapleComponents.length > 0) {
      const totalStaplePortion = stapleComponents.reduce(
        (sum, c) => sum + c.estimatedPortion, 
        0
      );
      
      const totalPortion = components.reduce(
        (sum, c) => sum + c.estimatedPortion, 
        0
      );
      
      const stapleRatio = totalStaplePortion / totalPortion;
      
      // 主食應該佔 30-50%
      if (stapleRatio < 0.25) {
        warnings.push('主食份量似乎過少，可能需要調整');
      } else if (stapleRatio > 0.55) {
        warnings.push('主食份量似乎過多，可能需要調整');
      }
    }
    
    // 檢查主菜份量
    const mainDishComponents = components.filter(c => 
      (c as any).bentoRole === 'main_dish'
    );
    
    if (mainDishComponents.length === 0) {
      warnings.push('未識別到主菜，請確認是否遺漏');
    } else if (mainDishComponents.length > 3) {
      warnings.push('識別到過多主菜，可能有誤判');
    }
    
    // 檢查配菜數量
    const sideDishComponents = components.filter(c => 
      (c as any).bentoRole === 'side_dish'
    );
    
    if (sideDishComponents.length === 0) {
      warnings.push('未識別到配菜，便當通常包含多種配菜');
    } else if (sideDishComponents.length > 6) {
      warnings.push('識別到過多配菜，可能有重複或誤判');
    }
    
    // 檢查烹飪方式的多樣性
    const cookingMethods = new Set(
      components
        .filter(c => c.cookingMethod)
        .map(c => c.cookingMethod)
    );
    
    if (cookingMethods.size < 2) {
      warnings.push('便當通常包含多種烹飪方式的食物，可能識別不完整');
    }
    
    // 檢查是否有蔬菜
    const hasVegetable = components.some(c => 
      c.category === ComponentCategory.VEGETABLE
    );
    
    if (!hasVegetable) {
      warnings.push('便當通常包含蔬菜配菜，可能有遺漏');
    }
    
    // 檢查是否有醃漬物（常見於日式和韓式便當）
    const hasPickles = components.some(c => 
      c.cookingMethod === CookingMethod.PICKLED ||
      c.name.includes('泡菜') ||
      c.name.includes('醃') ||
      c.name.includes('pickle')
    );
    
    // 這不是必須的，所以只是提示
    if (!hasPickles && components.length >= 4) {
      // 只在成分較多時才提示，避免誤報
      console.log('   提示：便當通常包含醃漬物，但這不是必須的');
    }
    
    return warnings;
  }

  /**
   * 便當類專用：生成特定建議
   * 
   * @param components - 成分列表
   * @param dishName - 料理名稱
   * @returns 建議列表
   */
  private generateBentoSpecificSuggestions(
    components: EnrichedComponent[],
    dishName: string
  ): string[] {
    const suggestions: string[] = [];
    
    // 根據便當類型提供建議
    if (dishName.includes('台式便當')) {
      const hasEgg = components.some(c => c.name.includes('蛋'));
      const hasCabbage = components.some(c => 
        c.name.includes('高麗菜') || c.name.includes('青菜')
      );
      const hasPickles = components.some(c => 
        c.name.includes('酸菜') || c.name.includes('泡菜')
      );
      
      if (!hasEgg) {
        suggestions.push('台式便當通常包含滷蛋或荷包蛋');
      }
      if (!hasCabbage) {
        suggestions.push('台式便當通常包含炒高麗菜或其他青菜');
      }
      if (!hasPickles) {
        suggestions.push('台式便當常有酸菜或醃漬物');
      }
    } else if (dishName.includes('日式便當')) {
      const hasEgg = components.some(c => 
        c.name.includes('玉子燒') || c.name.includes('蛋')
      );
      const hasPickles = components.some(c => 
        c.name.includes('醃') || c.name.includes('漬物')
      );
      const hasUmeboshi = components.some(c => c.name.includes('梅乾'));
      
      if (!hasEgg) {
        suggestions.push('日式便當通常包含玉子燒（日式煎蛋）');
      }
      if (!hasPickles) {
        suggestions.push('日式便當通常包含醃漬物');
      }
      if (!hasUmeboshi) {
        suggestions.push('日式便當常有梅乾作為裝飾和調味');
      }
    } else if (dishName.includes('韓式便當')) {
      const hasKimchi = components.some(c => c.name.includes('泡菜'));
      const hasSesame = components.some(c => c.name.includes('芝麻'));
      const hasMultipleSides = components.filter(c => 
        (c as any).bentoRole === 'side_dish'
      ).length >= 3;
      
      if (!hasKimchi) {
        suggestions.push('韓式便當通常包含泡菜（김치）');
      }
      if (!hasSesame) {
        suggestions.push('韓式便當常用芝麻調味和裝飾');
      }
      if (!hasMultipleSides) {
        suggestions.push('韓式便當特色是多種小菜（반찬），通常有3-5種');
      }
    }
    
    // 通用便當建議
    const stapleComponents = components.filter(c => 
      (c as any).bentoRole === 'staple'
    );
    
    if (stapleComponents.length === 0) {
      suggestions.push('建議添加主食成分（如米飯）');
    }
    
    const mainDishComponents = components.filter(c => 
      (c as any).bentoRole === 'main_dish'
    );
    
    if (mainDishComponents.length === 0) {
      suggestions.push('建議添加主菜成分（如炸雞腿、烤魚等）');
    }
    
    const sideDishComponents = components.filter(c => 
      (c as any).bentoRole === 'side_dish'
    );
    
    if (sideDishComponents.length < 2) {
      suggestions.push('便當通常包含2-4種配菜，建議添加更多配菜');
    }
    
    // 檢查營養均衡
    const hasProtein = components.some(c => 
      c.category === ComponentCategory.PROTEIN
    );
    const hasVegetable = components.some(c => 
      c.category === ComponentCategory.VEGETABLE
    );
    const hasGrain = components.some(c => 
      c.category === ComponentCategory.GRAIN
    );
    
    if (!hasProtein || !hasVegetable || !hasGrain) {
      suggestions.push('建議確保便當包含蛋白質、蔬菜和主食，以達到營養均衡');
    }
    
    return suggestions;
  }

  /**
   * 點心類專用：處理包餡類食物的內餡識別
   * 
   * 點心的特殊之處在於：
   * 1. 包含外皮和內餡兩個主要部分
   * 2. 內餡通常是混合的，難以從外觀識別
   * 3. 份量較小，通常以個為單位
   * 4. 需要區分皮和餡的比例
   * 
   * @param components - 檢測到的成分
   * @param totalPortion - 總份量（克，單個點心）
   * @returns 調整後的成分列表
   */
  private adjustDumplingComponentPortions(
    components: EnrichedComponent[],
    totalPortion: number
  ): EnrichedComponent[] {
    console.log('   🥟 應用點心專用份量調整邏輯...');
    
    // 識別外皮和內餡成分
    const wrapperComponents = components.filter(c => 
      c.name.includes('皮') ||
      c.name.includes('wrapper') ||
      c.name.includes('skin') ||
      c.category === ComponentCategory.GRAIN && (
        c.name.includes('麵') ||
        c.name.includes('米紙')
      )
    );
    
    const fillingComponents = components.filter(c => 
      !wrapperComponents.includes(c) &&
      (c.category === ComponentCategory.PROTEIN ||
       c.category === ComponentCategory.VEGETABLE) &&
      !c.name.includes('醬') &&
      !c.name.includes('醋')
    );
    
    const condimentComponents = components.filter(c => 
      !wrapperComponents.includes(c) &&
      !fillingComponents.includes(c)
    );
    
    console.log(`   外皮: ${wrapperComponents.length} 個`);
    console.log(`   內餡: ${fillingComponents.length} 個`);
    console.log(`   調味料: ${condimentComponents.length} 個`);
    
    // 點心的典型比例：
    // - 外皮: 30-40%
    // - 內餡: 50-60%
    // - 湯汁/調味料: 5-15%
    const wrapperRatio = 0.35;
    const fillingRatio = 0.55;
    const condimentRatio = 0.10;
    
    const estimatedWrapperPortion = totalPortion * wrapperRatio;
    const estimatedFillingPortion = totalPortion * fillingRatio;
    const estimatedCondimentPortion = totalPortion * condimentRatio;
    
    // 調整外皮份量
    if (wrapperComponents.length > 0) {
      const portionPerWrapper = estimatedWrapperPortion / wrapperComponents.length;
      wrapperComponents.forEach(comp => {
        const originalPortion = comp.estimatedPortion;
        comp.estimatedPortion = Math.round(portionPerWrapper);
        console.log(`   調整外皮 "${comp.name}": ${originalPortion}g → ${comp.estimatedPortion}g`);
        (comp as any).dumplingPart = 'wrapper';
      });
    }
    
    // 調整內餡份量
    if (fillingComponents.length > 0) {
      const currentFillingTotal = fillingComponents.reduce(
        (sum, c) => sum + c.estimatedPortion, 
        0
      );
      
      if (currentFillingTotal > 0) {
        const adjustmentRatio = estimatedFillingPortion / currentFillingTotal;
        
        // 只在差異較大時才調整
        if (adjustmentRatio < 0.7 || adjustmentRatio > 1.3) {
          fillingComponents.forEach(comp => {
            const originalPortion = comp.estimatedPortion;
            comp.estimatedPortion = Math.round(comp.estimatedPortion * adjustmentRatio);
            console.log(`   調整內餡 "${comp.name}": ${originalPortion}g → ${comp.estimatedPortion}g`);
          });
        }
      }
      
      fillingComponents.forEach(comp => {
        (comp as any).dumplingPart = 'filling';
      });
    }
    
    // 調整調味料份量（通常很小）
    if (condimentComponents.length > 0) {
      condimentComponents.forEach(comp => {
        // 調味料通常不超過 10g（單個點心）
        if (comp.estimatedPortion > 10) {
          const originalPortion = comp.estimatedPortion;
          comp.estimatedPortion = Math.min(comp.estimatedPortion, 10);
          console.log(`   調整調味料 "${comp.name}": ${originalPortion}g → ${comp.estimatedPortion}g`);
        }
        (comp as any).dumplingPart = 'condiment';
      });
    }
    
    // 特殊處理：小籠包的湯汁
    const hasSoupJelly = components.some(c => 
      c.name.includes('高湯凍') ||
      c.name.includes('湯汁') ||
      c.nameEn?.toLowerCase().includes('soup jelly')
    );
    
    if (hasSoupJelly) {
      console.log('   檢測到小籠包特有的湯汁成分');
      const soupComponent = components.find(c => 
        c.name.includes('高湯凍') || c.name.includes('湯汁')
      );
      if (soupComponent) {
        (soupComponent as any).dumplingPart = 'soup';
      }
    }
    
    return components;
  }

  /**
   * 點心類專用：驗證成分的合理性
   * 
   * @param components - 成分列表
   * @returns 驗證警告列表
   */
  private validateDumplingComponents(components: EnrichedComponent[]): string[] {
    const warnings: string[] = [];
    
    // 檢查是否有外皮
    const hasWrapper = components.some(c => 
      (c as any).dumplingPart === 'wrapper' ||
      c.name.includes('皮') ||
      c.name.includes('wrapper')
    );
    
    if (!hasWrapper) {
      warnings.push('點心類食物應該包含外皮成分');
    }
    
    // 檢查是否有內餡
    const hasFilling = components.some(c => 
      (c as any).dumplingPart === 'filling' ||
      c.category === ComponentCategory.PROTEIN
    );
    
    if (!hasFilling) {
      warnings.push('點心類食物應該包含內餡成分（蛋白質或蔬菜）');
    }
    
    // 檢查份量是否合理（單個點心通常 30-120g）
    const totalPortion = components.reduce((sum, c) => sum + c.estimatedPortion, 0);
    
    if (totalPortion < 20) {
      warnings.push('點心份量似乎過少，可能識別不完整');
    } else if (totalPortion > 150) {
      warnings.push('點心份量似乎過多，請確認是單個還是多個');
    }
    
    // 檢查外皮和內餡的比例
    const wrapperComponents = components.filter(c => 
      (c as any).dumplingPart === 'wrapper'
    );
    const fillingComponents = components.filter(c => 
      (c as any).dumplingPart === 'filling'
    );
    
    if (wrapperComponents.length > 0 && fillingComponents.length > 0) {
      const wrapperPortion = wrapperComponents.reduce((sum, c) => sum + c.estimatedPortion, 0);
      const fillingPortion = fillingComponents.reduce((sum, c) => sum + c.estimatedPortion, 0);
      
      const wrapperRatio = wrapperPortion / (wrapperPortion + fillingPortion);
      
      // 外皮應該佔 25-45%
      if (wrapperRatio < 0.20) {
        warnings.push('外皮份量似乎過少');
      } else if (wrapperRatio > 0.50) {
        warnings.push('外皮份量似乎過多，內餡可能不足');
      }
    }
    
    // 檢查烹飪方式
    const cookingMethods = new Set(
      components
        .filter(c => c.cookingMethod)
        .map(c => c.cookingMethod)
    );
    
    // 點心通常是蒸、煮或炸
    const validMethods = [
      CookingMethod.STEAMED,
      CookingMethod.BOILED,
      CookingMethod.DEEP_FRIED,
      CookingMethod.FRIED
    ];
    
    const hasValidMethod = Array.from(cookingMethods).some(method => 
      validMethods.includes(method as CookingMethod)
    );
    
    if (!hasValidMethod && cookingMethods.size > 0) {
      warnings.push('點心的烹飪方式通常是蒸、煮或炸');
    }
    
    return warnings;
  }

  /**
   * 燒烤類專用：調整成分份量
   * 
   * 燒烤的特殊之處在於：
   * 1. 主要是肉類和蔬菜
   * 2. 烤製過程會流失水分和油脂
   * 3. 通常搭配醬料和配菜
   * 4. 可能包含多種不同食材
   * 
   * @param components - 成分列表
   * @param totalPortion - 總份量
   * @returns 調整後的成分列表
   */
  private adjustBarbecueComponentPortions(
    components: EnrichedComponent[],
    totalPortion: number
  ): EnrichedComponent[] {
    console.log('   🍖 應用燒烤專用份量調整邏輯...');
    
    // 識別主要食材、蔬菜、醬料
    const meatComponents = components.filter(c => 
      c.category === ComponentCategory.PROTEIN &&
      (c.name.includes('肉') ||
       c.name.includes('雞') ||
       c.name.includes('魚') ||
       c.name.includes('蝦') ||
       c.nameEn?.toLowerCase().includes('meat') ||
       c.nameEn?.toLowerCase().includes('chicken') ||
       c.nameEn?.toLowerCase().includes('beef') ||
       c.nameEn?.toLowerCase().includes('pork'))
    );
    
    const vegetableComponents = components.filter(c => 
      c.category === ComponentCategory.VEGETABLE
    );
    
    const sauceComponents = components.filter(c => 
      c.category === ComponentCategory.SAUCE ||
      c.category === ComponentCategory.SEASONING ||
      c.name.includes('醬') ||
      c.name.includes('sauce')
    );
    
    const sideComponents = components.filter(c => 
      !meatComponents.includes(c) &&
      !vegetableComponents.includes(c) &&
      !sauceComponents.includes(c)
    );
    
    console.log(`   肉類: ${meatComponents.length} 個`);
    console.log(`   蔬菜: ${vegetableComponents.length} 個`);
    console.log(`   醬料: ${sauceComponents.length} 個`);
    console.log(`   配菜: ${sideComponents.length} 個`);
    
    // 燒烤的典型比例：
    // - 肉類: 50-60%
    // - 蔬菜: 25-35%
    // - 醬料: 5-10%
    // - 其他配菜: 5-10%
    const meatRatio = 0.55;
    const vegetableRatio = 0.30;
    const sauceRatio = 0.08;
    const sideRatio = 0.07;
    
    const estimatedMeatPortion = totalPortion * meatRatio;
    const estimatedVegetablePortion = totalPortion * vegetableRatio;
    const estimatedSaucePortion = totalPortion * sauceRatio;
    const estimatedSidePortion = totalPortion * sideRatio;
    
    // 調整肉類份量
    if (meatComponents.length > 0) {
      const currentMeatTotal = meatComponents.reduce(
        (sum, c) => sum + c.estimatedPortion, 
        0
      );
      
      if (currentMeatTotal > 0) {
        const adjustmentRatio = estimatedMeatPortion / currentMeatTotal;
        
        if (adjustmentRatio < 0.7 || adjustmentRatio > 1.3) {
          meatComponents.forEach(comp => {
            const originalPortion = comp.estimatedPortion;
            comp.estimatedPortion = Math.round(comp.estimatedPortion * adjustmentRatio);
            console.log(`   調整肉類 "${comp.name}": ${originalPortion}g → ${comp.estimatedPortion}g`);
          });
        }
      }
      
      meatComponents.forEach(comp => {
        (comp as any).barbecueRole = 'main';
      });
    }
    
    // 調整蔬菜份量
    if (vegetableComponents.length > 0) {
      const currentVegetableTotal = vegetableComponents.reduce(
        (sum, c) => sum + c.estimatedPortion, 
        0
      );
      
      if (currentVegetableTotal > 0) {
        const adjustmentRatio = estimatedVegetablePortion / currentVegetableTotal;
        
        if (adjustmentRatio < 0.7 || adjustmentRatio > 1.3) {
          vegetableComponents.forEach(comp => {
            const originalPortion = comp.estimatedPortion;
            comp.estimatedPortion = Math.round(comp.estimatedPortion * adjustmentRatio);
            console.log(`   調整蔬菜 "${comp.name}": ${originalPortion}g → ${comp.estimatedPortion}g`);
          });
        }
      }
      
      vegetableComponents.forEach(comp => {
        (comp as any).barbecueRole = 'vegetable';
      });
    }
    
    // 調整醬料份量（通常較小）
    if (sauceComponents.length > 0) {
      sauceComponents.forEach(comp => {
        // 醬料通常不超過 30g
        if (comp.estimatedPortion > 30) {
          const originalPortion = comp.estimatedPortion;
          comp.estimatedPortion = Math.min(comp.estimatedPortion, 30);
          console.log(`   調整醬料 "${comp.name}": ${originalPortion}g → ${comp.estimatedPortion}g`);
        }
        (comp as any).barbecueRole = 'sauce';
      });
    }
    
    // 調整配菜份量
    if (sideComponents.length > 0) {
      sideComponents.forEach(comp => {
        (comp as any).barbecueRole = 'side';
      });
    }
    
    return components;
  }

  /**
   * 燒烤類專用：驗證成分的合理性
   * 
   * @param components - 成分列表
   * @returns 驗證警告列表
   */
  private validateBarbecueComponents(components: EnrichedComponent[]): string[] {
    const warnings: string[] = [];
    
    // 檢查是否有肉類
    const hasMeat = components.some(c => 
      c.category === ComponentCategory.PROTEIN &&
      (c.name.includes('肉') ||
       c.name.includes('雞') ||
       c.name.includes('魚') ||
       c.nameEn?.toLowerCase().includes('meat') ||
       c.nameEn?.toLowerCase().includes('chicken') ||
       c.nameEn?.toLowerCase().includes('beef'))
    );
    
    if (!hasMeat) {
      warnings.push('燒烤類料理應該包含肉類或海鮮');
    }
    
    // 檢查烹飪方式
    const hasGrilled = components.some(c => 
      c.cookingMethod === CookingMethod.GRILLED
    );
    
    if (!hasGrilled) {
      warnings.push('燒烤類料理的成分應該是烤製的');
    }
    
    // 檢查是否有蔬菜
    const hasVegetable = components.some(c => 
      c.category === ComponentCategory.VEGETABLE
    );
    
    if (!hasVegetable) {
      warnings.push('燒烤通常搭配蔬菜，建議添加');
    }
    
    // 檢查肉類份量
    const meatComponents = components.filter(c => 
      (c as any).barbecueRole === 'main'
    );
    
    if (meatComponents.length > 0) {
      const totalMeatPortion = meatComponents.reduce(
        (sum, c) => sum + c.estimatedPortion, 
        0
      );
      
      const totalPortion = components.reduce(
        (sum, c) => sum + c.estimatedPortion, 
        0
      );
      
      const meatRatio = totalMeatPortion / totalPortion;
      
      // 肉類應該佔 40-70%
      if (meatRatio < 0.35) {
        warnings.push('肉類份量似乎過少');
      } else if (meatRatio > 0.75) {
        warnings.push('肉類份量似乎過多，建議增加蔬菜');
      }
    }
    
    // 檢查是否有醬料
    const hasSauce = components.some(c => 
      c.category === ComponentCategory.SAUCE ||
      c.name.includes('醬') ||
      c.name.includes('sauce')
    );
    
    if (!hasSauce) {
      warnings.push('燒烤通常搭配醬料調味');
    }
    
    // 檢查總份量
    const totalPortion = components.reduce((sum, c) => sum + c.estimatedPortion, 0);
    
    if (totalPortion < 100) {
      warnings.push('燒烤份量似乎過少');
    } else if (totalPortion > 500) {
      warnings.push('燒烤份量似乎過多，請確認');
    }
    
    return warnings;
  }
}
