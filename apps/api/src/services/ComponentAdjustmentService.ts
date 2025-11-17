/**
 * 成分調整服務
 * 
 * 管理用戶對識別成分的調整操作，包括：
 * - 添加/移除成分
 * - 調整份量
 * - 重新計算營養
 * - 保存調整記錄
 */

import { 
  DetectedComponent, 
  ComponentDetectionResult,
  CookingMethod,
  ComponentCategory,
  NutritionSummary
} from '../types/ComponentDetection';
import { ComponentNutritionCalculator } from './ComponentNutritionCalculator';
import { AsianCuisineKnowledgeBase } from './AsianCuisineKnowledgeBase';
import { ComponentAdjustmentRepository } from '../repositories/ComponentAdjustmentRepository';
import { ComponentAdjustment } from '../models/ComponentAdjustment';

/**
 * 會話狀態接口
 */
interface SessionState {
  sessionId: string;
  originalResult: ComponentDetectionResult;
  currentResult: ComponentDetectionResult;
  adjustments: Adjustment[];
  createdAt: Date;
  lastModified: Date;
}

/**
 * 調整記錄接口
 */
interface Adjustment {
  id: string;
  type: 'add' | 'remove' | 'update_portion';
  timestamp: Date;
  details: any;
}

/**
 * 添加成分結果接口
 */
interface AddComponentResult {
  addedComponent: DetectedComponent;
  updatedResult: ComponentDetectionResult;
  adjustmentId: string;
}

/**
 * 移除成分結果接口
 */
interface RemoveComponentResult {
  updatedResult: ComponentDetectionResult;
  adjustmentId: string;
}

/**
 * 更新份量結果接口
 */
interface UpdatePortionResult {
  oldPortion: number;
  newPortion: number;
  updatedResult: ComponentDetectionResult;
  adjustmentId: string;
}

/**
 * 重新計算營養結果接口
 */
interface RecalculateNutritionResult {
  updatedResult: ComponentDetectionResult;
  nutritionSummary: NutritionSummary;
  calculationTime: number;
}

export class ComponentAdjustmentService {
  private sessions: Map<string, SessionState>;
  private nutritionCalculator: ComponentNutritionCalculator;
  private knowledgeBase: AsianCuisineKnowledgeBase;
  private repository: ComponentAdjustmentRepository;

  constructor() {
    this.sessions = new Map();
    this.nutritionCalculator = new ComponentNutritionCalculator();
    this.knowledgeBase = new AsianCuisineKnowledgeBase();
    this.repository = new ComponentAdjustmentRepository();
    console.log('✓ ComponentAdjustmentService 初始化完成');
  }

  /**
   * 初始化會話（從識別結果創建）
   */
  initializeSession(sessionId: string, result: ComponentDetectionResult): void {
    const state: SessionState = {
      sessionId,
      originalResult: JSON.parse(JSON.stringify(result)), // 深拷貝
      currentResult: JSON.parse(JSON.stringify(result)),
      adjustments: [],
      createdAt: new Date(),
      lastModified: new Date()
    };

    this.sessions.set(sessionId, state);
    console.log(`[${sessionId}] 會話已初始化`);
  }

  /**
   * 添加成分
   */
  async addComponent(
    sessionId: string,
    componentData: Partial<DetectedComponent>
  ): Promise<AddComponentResult> {
    // 獲取或創建會話
    let state = this.sessions.get(sessionId);
    if (!state) {
      throw new Error(`會話 ${sessionId} 不存在。請先進行食物識別。`);
    }

    // 生成成分 ID
    const componentId = `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 從知識庫獲取成分的營養資訊
    let nutritionPer100g;
    try {
      const nutritionInfo = this.knowledgeBase.getNutritionInfo(componentData.name || '');
      if (nutritionInfo) {
        nutritionPer100g = {
          calories: nutritionInfo.calories,
          protein: nutritionInfo.protein,
          carbohydrates: nutritionInfo.carbohydrates,
          fat: nutritionInfo.fat,
          fiber: nutritionInfo.fiber,
          sodium: nutritionInfo.sodium
        };
      }
    } catch (error) {
      console.warn(`無法從知識庫獲取 ${componentData.name} 的營養資訊:`, error);
    }

    // 創建新成分
    const newComponent: DetectedComponent = {
      id: componentId,
      name: componentData.name || '未知成分',
      nameEn: componentData.nameEn,
      confidence: componentData.confidence || 1.0, // 用戶添加的成分信心度為 1.0
      estimatedPortion: componentData.estimatedPortion || 50, // 預設 50g
      cookingMethod: componentData.cookingMethod,
      category: componentData.category,
      visualFeatures: componentData.visualFeatures,
      nutritionPer100g
    };

    // 計算實際營養
    if (nutritionPer100g) {
      const portionMultiplier = newComponent.estimatedPortion / 100;
      newComponent.actualNutrition = {
        calories: nutritionPer100g.calories * portionMultiplier,
        protein: nutritionPer100g.protein * portionMultiplier,
        carbohydrates: nutritionPer100g.carbohydrates * portionMultiplier,
        fat: nutritionPer100g.fat * portionMultiplier,
        fiber: nutritionPer100g.fiber ? nutritionPer100g.fiber * portionMultiplier : undefined,
        sodium: nutritionPer100g.sodium ? nutritionPer100g.sodium * portionMultiplier : undefined
      };
    }

    // 添加到當前結果
    state.currentResult.components.push(newComponent);

    // 重新計算營養摘要
    await this.recalculateNutritionInternal(state);

    // 記錄調整
    const adjustmentId = await this.recordAdjustment(state, {
      type: 'add',
      details: {
        componentId,
        componentName: newComponent.name,
        portion: newComponent.estimatedPortion
      }
    });

    // 更新最後修改時間
    state.lastModified = new Date();

    return {
      addedComponent: newComponent,
      updatedResult: state.currentResult,
      adjustmentId
    };
  }

  /**
   * 移除成分
   */
  async removeComponent(
    sessionId: string,
    componentId: string
  ): Promise<RemoveComponentResult> {
    // 獲取會話
    const state = this.sessions.get(sessionId);
    if (!state) {
      throw new Error(`會話 ${sessionId} 不存在`);
    }

    // 查找成分
    const componentIndex = state.currentResult.components.findIndex(
      c => c.id === componentId
    );

    if (componentIndex === -1) {
      throw new Error(`找不到成分 ${componentId}`);
    }

    const removedComponent = state.currentResult.components[componentIndex];

    // 移除成分
    state.currentResult.components.splice(componentIndex, 1);

    // 重新計算營養摘要
    await this.recalculateNutritionInternal(state);

    // 記錄調整
    const adjustmentId = await this.recordAdjustment(state, {
      type: 'remove',
      details: {
        componentId,
        componentName: removedComponent.name
      }
    });

    // 更新最後修改時間
    state.lastModified = new Date();

    return {
      updatedResult: state.currentResult,
      adjustmentId
    };
  }

  /**
   * 更新份量
   */
  async updatePortion(
    sessionId: string,
    componentId: string,
    newPortion: number
  ): Promise<UpdatePortionResult> {
    // 獲取會話
    const state = this.sessions.get(sessionId);
    if (!state) {
      throw new Error(`會話 ${sessionId} 不存在`);
    }

    // 查找成分
    const component = state.currentResult.components.find(c => c.id === componentId);
    if (!component) {
      throw new Error(`找不到成分 ${componentId}`);
    }

    const oldPortion = component.estimatedPortion;

    // 更新份量
    component.estimatedPortion = newPortion;

    // 重新計算該成分的實際營養
    if (component.nutritionPer100g) {
      const portionMultiplier = newPortion / 100;
      component.actualNutrition = {
        calories: component.nutritionPer100g.calories * portionMultiplier,
        protein: component.nutritionPer100g.protein * portionMultiplier,
        carbohydrates: component.nutritionPer100g.carbohydrates * portionMultiplier,
        fat: component.nutritionPer100g.fat * portionMultiplier,
        fiber: component.nutritionPer100g.fiber 
          ? component.nutritionPer100g.fiber * portionMultiplier 
          : undefined,
        sodium: component.nutritionPer100g.sodium 
          ? component.nutritionPer100g.sodium * portionMultiplier 
          : undefined
      };
    }

    // 重新計算營養摘要
    await this.recalculateNutritionInternal(state);

    // 記錄調整
    const adjustmentId = await this.recordAdjustment(state, {
      type: 'update_portion',
      details: {
        componentId,
        componentName: component.name,
        oldPortion,
        newPortion
      }
    });

    // 更新最後修改時間
    state.lastModified = new Date();

    return {
      oldPortion,
      newPortion,
      updatedResult: state.currentResult,
      adjustmentId
    };
  }

  /**
   * 重新計算營養（公開方法）
   */
  async recalculateNutrition(sessionId: string): Promise<RecalculateNutritionResult> {
    const startTime = Date.now();

    // 獲取會話
    const state = this.sessions.get(sessionId);
    if (!state) {
      throw new Error(`會話 ${sessionId} 不存在`);
    }

    // 重新計算營養摘要
    await this.recalculateNutritionInternal(state);

    const calculationTime = Date.now() - startTime;

    return {
      updatedResult: state.currentResult,
      nutritionSummary: state.currentResult.nutritionSummary,
      calculationTime
    };
  }

  /**
   * 重新計算營養（內部方法）
   */
  private async recalculateNutritionInternal(state: SessionState): Promise<void> {
    try {
      // 使用 ComponentNutritionCalculator 重新計算營養摘要
      const nutritionSummary = await this.nutritionCalculator.aggregateDishNutrition(
        state.currentResult.components
      );

      // 更新結果
      state.currentResult.nutritionSummary = nutritionSummary;

      // 更新元數據
      state.currentResult.metadata.componentsDetected = state.currentResult.components.length;

    } catch (error) {
      console.error('重新計算營養失敗:', error);
      throw new Error('重新計算營養失敗');
    }
  }

  /**
   * 記錄調整
   */
  private async recordAdjustment(
    state: SessionState,
    adjustment: Omit<Adjustment, 'id' | 'timestamp'>,
    userId?: string
  ): Promise<string> {
    const adjustmentId = `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullAdjustment: Adjustment = {
      id: adjustmentId,
      timestamp: new Date(),
      ...adjustment
    };

    state.adjustments.push(fullAdjustment);

    // 保存到數據庫
    try {
      const adjustmentRecord = new ComponentAdjustment({
        sessionId: state.sessionId,
        userId,
        adjustmentType: adjustment.type,
        componentId: adjustment.details.componentId,
        componentName: adjustment.details.componentName,
        oldValue: adjustment.details.oldPortion,
        newValue: adjustment.details.newPortion || adjustment.details.portion,
        details: adjustment.details,
        timestamp: fullAdjustment.timestamp,
        createdAt: new Date()
      });

      await this.repository.create(adjustmentRecord);
      console.log(`[${state.sessionId}] 調整記錄已保存到數據庫: ${adjustmentId}`);
    } catch (error) {
      console.error(`[${state.sessionId}] 保存調整記錄失敗:`, error);
      // 不影響主要流程，繼續執行
    }

    return adjustmentId;
  }

  /**
   * 獲取會話狀態
   */
  async getSessionState(sessionId: string): Promise<SessionState | null> {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * 獲取調整歷史
   */
  async getAdjustmentHistory(sessionId: string): Promise<Adjustment[]> {
    // 優先從內存獲取
    const state = this.sessions.get(sessionId);
    if (state) {
      return state.adjustments;
    }

    // 如果內存中沒有，從數據庫獲取
    try {
      const records = await this.repository.findBySessionId(sessionId);
      return records.map(record => ({
        id: record._id?.toString() || '',
        type: record.adjustmentType,
        timestamp: record.timestamp,
        details: record.details
      }));
    } catch (error) {
      console.error(`獲取會話 ${sessionId} 的調整歷史失敗:`, error);
      throw new Error(`會話 ${sessionId} 不存在或無法獲取調整歷史`);
    }
  }

  /**
   * 清理過期會話（可選，用於記憶體管理）
   */
  cleanupExpiredSessions(maxAgeHours: number = 24): number {
    const now = new Date();
    const maxAge = maxAgeHours * 60 * 60 * 1000; // 轉換為毫秒
    let cleanedCount = 0;

    for (const [sessionId, state] of this.sessions.entries()) {
      const age = now.getTime() - state.lastModified.getTime();
      if (age > maxAge) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`清理了 ${cleanedCount} 個過期會話`);
    }

    return cleanedCount;
  }
}
