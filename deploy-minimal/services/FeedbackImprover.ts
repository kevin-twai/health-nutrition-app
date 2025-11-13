import { FeedbackRepository } from '../repositories/FeedbackRepository';
import { FeedbackAnalyzer } from './FeedbackAnalyzer';
import { AsianCuisineKnowledgeBase } from './AsianCuisineKnowledgeBase';
import { EnhancedPromptGenerator } from './EnhancedPromptGenerator';
import {
  UserFeedback,
  MistakePattern,
  ImprovementSuggestion,
  FeedbackStatus
} from '../models/Feedback';
import {
  FoodItem,
  VisualFeatures,
  FoodCategory,
  CuisineType
} from '../types/AsianCuisineKnowledgeBase';
import { getFoodItemByName } from '../data/asianFoodItems';

// 改進操作類型
export enum ImprovementActionType {
  UPDATE_KNOWLEDGE_BASE = 'update_knowledge_base',
  OPTIMIZE_PROMPT = 'optimize_prompt',
  ADD_VALIDATION_RULE = 'add_validation_rule',
  UPDATE_CONFUSION_PAIRS = 'update_confusion_pairs'
}

// 改進操作記錄
export interface ImprovementAction {
  id?: string;
  type: ImprovementActionType;
  description: string;
  affectedFoods: string[];
  basedOnFeedbacks: string[];
  appliedAt: Date;
  appliedBy?: string;
  impact?: {
    beforeErrorRate: number;
    afterErrorRate: number;
    improvement: number;
  };
}

// 知識庫更新建議
export interface KnowledgeBaseUpdate {
  foodName: string;
  updateType: 'add' | 'modify' | 'enhance';
  changes: {
    visualFeatures?: Partial<VisualFeatures>;
    commonConfusions?: string[];
    distinguishingFeatures?: string[];
    nameVariants?: string[];
  };
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

// Prompt 優化建議
export interface PromptOptimization {
  promptType: string;
  currentIssues: string[];
  suggestedChanges: string[];
  affectedFoods: string[];
  priority: 'high' | 'medium' | 'low';
}

// 驗證規則建議
export interface ValidationRuleUpdate {
  ruleName: string;
  ruleType: 'add' | 'modify';
  description: string;
  logic: string;
  affectedScenarios: string[];
  priority: 'high' | 'medium' | 'low';
}

export class FeedbackImprover {
  private feedbackRepository: FeedbackRepository;
  private feedbackAnalyzer: FeedbackAnalyzer;
  private knowledgeBase: AsianCuisineKnowledgeBase;
  private promptGenerator: EnhancedPromptGenerator;
  private improvementHistory: ImprovementAction[] = [];

  constructor(
    feedbackRepository: FeedbackRepository,
    feedbackAnalyzer: FeedbackAnalyzer,
    knowledgeBase: AsianCuisineKnowledgeBase,
    promptGenerator: EnhancedPromptGenerator
  ) {
    this.feedbackRepository = feedbackRepository;
    this.feedbackAnalyzer = feedbackAnalyzer;
    this.knowledgeBase = knowledgeBase;
    this.promptGenerator = promptGenerator;
  }

  /**
   * 根據反饋自動更新知識庫
   */
  async updateKnowledgeBaseFromFeedback(
    feedbackIds: string[],
    autoApply: boolean = false
  ): Promise<KnowledgeBaseUpdate[]> {
    const updates: KnowledgeBaseUpdate[] = [];

    for (const feedbackId of feedbackIds) {
      const feedback = await this.feedbackRepository.findById(feedbackId);
      if (!feedback) continue;

      // 處理錯誤識別
      for (const incorrect of feedback.userCorrection.incorrectFoods) {
        const update = await this.generateKnowledgeBaseUpdate(
          incorrect.actualFood,
          incorrect.identifiedAs,
          feedback
        );
        if (update) {
          updates.push(update);
        }
      }

      // 處理遺漏食材
      for (const missing of feedback.userCorrection.missingFoods) {
        const update = await this.generateKnowledgeBaseUpdateForMissing(
          missing.name,
          feedback
        );
        if (update) {
          updates.push(update);
        }
      }
    }

    // 自動應用更新
    if (autoApply) {
      for (const update of updates) {
        await this.applyKnowledgeBaseUpdate(update);
      }

      // 記錄改進操作
      this.recordImprovementAction({
        type: ImprovementActionType.UPDATE_KNOWLEDGE_BASE,
        description: `根據 ${feedbackIds.length} 個反饋更新知識庫`,
        affectedFoods: updates.map(u => u.foodName),
        basedOnFeedbacks: feedbackIds,
        appliedAt: new Date()
      });
    }

    return updates;
  }

  /**
   * 根據反饋優化 Prompt 模板
   */
  async optimizePromptsFromFeedback(
    feedbackIds: string[],
    autoApply: boolean = false
  ): Promise<PromptOptimization[]> {
    const optimizations: PromptOptimization[] = [];
    const mistakes = await this.getCommonMistakes(50);

    // 分析需要優化的 prompt 類型
    const promptTypes = this.identifyProblematicPromptTypes(mistakes);

    for (const promptType of promptTypes) {
      const optimization = await this.generatePromptOptimization(
        promptType,
        mistakes
      );
      if (optimization) {
        optimizations.push(optimization);
      }
    }

    // 自動應用優化
    if (autoApply) {
      for (const optimization of optimizations) {
        await this.applyPromptOptimization(optimization);
      }

      // 記錄改進操作
      this.recordImprovementAction({
        type: ImprovementActionType.OPTIMIZE_PROMPT,
        description: `優化 ${optimizations.length} 個 prompt 模板`,
        affectedFoods: optimizations.flatMap(o => o.affectedFoods),
        basedOnFeedbacks: feedbackIds,
        appliedAt: new Date()
      });
    }

    return optimizations;
  }

  /**
   * 根據反饋調整驗證規則
   */
  async updateValidationRulesFromFeedback(
    feedbackIds: string[],
    autoApply: boolean = false
  ): Promise<ValidationRuleUpdate[]> {
    const updates: ValidationRuleUpdate[] = [];
    const errorAnalysis = await this.feedbackAnalyzer.analyzeCommonErrors();

    // 分析需要新增或修改的驗證規則
    for (const [food, detail] of errorAnalysis.errorsByFood.entries()) {
      // 如果某個食材經常被遺漏，添加檢測規則
      if (detail.missingCount >= 3) {
        updates.push({
          ruleName: `check_${food}_presence`,
          ruleType: 'add',
          description: `檢測 ${food} 在常見菜餚中的存在`,
          logic: `當識別到特定菜餚類型時，檢查是否包含 ${food}`,
          affectedScenarios: this.identifyAffectedScenarios(food),
          priority: detail.missingCount >= 5 ? 'high' : 'medium'
        });
      }

      // 如果某個食材經常被誤識別，添加互斥檢查
      if (detail.incorrectCount >= 3 && detail.commonMisidentifications.length > 0) {
        const topMisid = detail.commonMisidentifications[0].identifiedAs;
        updates.push({
          ruleName: `check_${food}_vs_${topMisid}_confusion`,
          ruleType: 'add',
          description: `檢查 ${food} 和 ${topMisid} 的混淆`,
          logic: `當同時識別到 ${food} 和 ${topMisid} 時發出警告`,
          affectedScenarios: [food, topMisid],
          priority: detail.incorrectCount >= 5 ? 'high' : 'medium'
        });
      }
    }

    // 自動應用更新
    if (autoApply) {
      for (const update of updates) {
        await this.applyValidationRuleUpdate(update);
      }

      // 記錄改進操作
      this.recordImprovementAction({
        type: ImprovementActionType.ADD_VALIDATION_RULE,
        description: `添加/更新 ${updates.length} 個驗證規則`,
        affectedFoods: updates.flatMap(u => u.affectedScenarios),
        basedOnFeedbacks: feedbackIds,
        appliedAt: new Date()
      });
    }

    return updates;
  }

  /**
   * 執行完整的持續改進流程
   */
  async performContinuousImprovement(options: {
    analyzeDays?: number;
    autoApply?: boolean;
    minFeedbackCount?: number;
  } = {}): Promise<{
    knowledgeBaseUpdates: KnowledgeBaseUpdate[];
    promptOptimizations: PromptOptimization[];
    validationRuleUpdates: ValidationRuleUpdate[];
    summary: string;
  }> {
    const {
      analyzeDays = 7,
      autoApply = false,
      minFeedbackCount = 5
    } = options;

    console.log('開始執行持續改進流程...', {
      analyzeDays,
      autoApply,
      minFeedbackCount
    });

    // 獲取待處理的反饋
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - analyzeDays);

    const feedbacks = await this.feedbackRepository.search(
      {
        status: FeedbackStatus.REVIEWED,
        startDate
      },
      1000
    );

    if (feedbacks.length < minFeedbackCount) {
      return {
        knowledgeBaseUpdates: [],
        promptOptimizations: [],
        validationRuleUpdates: [],
        summary: `反饋數量不足（${feedbacks.length}/${minFeedbackCount}），跳過改進流程`
      };
    }

    const feedbackIds = feedbacks.map(f => f.id!);

    // 執行各項改進
    const [knowledgeBaseUpdates, promptOptimizations, validationRuleUpdates] =
      await Promise.all([
        this.updateKnowledgeBaseFromFeedback(feedbackIds, autoApply),
        this.optimizePromptsFromFeedback(feedbackIds, autoApply),
        this.updateValidationRulesFromFeedback(feedbackIds, autoApply)
      ]);

    // 標記反饋為已應用
    if (autoApply) {
      await this.feedbackRepository.bulkUpdateStatus(
        feedbackIds,
        FeedbackStatus.APPLIED
      );
    }

    const summary = this.generateImprovementSummary(
      knowledgeBaseUpdates,
      promptOptimizations,
      validationRuleUpdates,
      feedbacks.length
    );

    console.log('持續改進流程完成', {
      knowledgeBaseUpdates: knowledgeBaseUpdates.length,
      promptOptimizations: promptOptimizations.length,
      validationRuleUpdates: validationRuleUpdates.length
    });

    return {
      knowledgeBaseUpdates,
      promptOptimizations,
      validationRuleUpdates,
      summary
    };
  }

  /**
   * 獲取常見錯誤（從 FeedbackAnalyzer 獲取）
   */
  private async getCommonMistakes(limit: number = 50): Promise<MistakePattern[]> {
    return await this.feedbackRepository.getCommonMistakes(limit);
  }

  /**
   * 獲取改進歷史
   */
  getImprovementHistory(limit: number = 50): ImprovementAction[] {
    return this.improvementHistory.slice(-limit);
  }

  /**
   * 評估改進效果
   */
  async evaluateImprovementImpact(
    improvementAction: ImprovementAction,
    evaluationDays: number = 7
  ): Promise<ImprovementAction> {
    const beforeDate = new Date(improvementAction.appliedAt);
    beforeDate.setDate(beforeDate.getDate() - evaluationDays);

    const afterDate = new Date(improvementAction.appliedAt);
    afterDate.setDate(afterDate.getDate() + evaluationDays);

    const impact = await this.feedbackAnalyzer.analyzeImprovementImpact(
      beforeDate,
      afterDate,
      improvementAction.affectedFoods
    );

    improvementAction.impact = {
      beforeErrorRate: impact.beforeStats.errorRate,
      afterErrorRate: impact.afterStats.errorRate,
      improvement: impact.improvement.errorRateReduction
    };

    return improvementAction;
  }

  // ===== 私有輔助方法 =====

  private async generateKnowledgeBaseUpdate(
    correctFood: string,
    incorrectIdentification: string,
    feedback: UserFeedback
  ): Promise<KnowledgeBaseUpdate | null> {
    const existingFood = getFoodItemByName(correctFood);

    if (!existingFood) {
      // 新增食材
      return {
        foodName: correctFood,
        updateType: 'add',
        changes: {
          commonConfusions: [incorrectIdentification],
          distinguishingFeatures: [
            `與 ${incorrectIdentification} 不同的特徵需要補充`
          ]
        },
        reason: `根據反饋，${correctFood} 經常被誤識別為 ${incorrectIdentification}`,
        priority: 'high'
      };
    } else {
      // 更新現有食材
      const needsUpdate =
        !existingFood.commonConfusions?.includes(incorrectIdentification);

      if (needsUpdate) {
        return {
          foodName: correctFood,
          updateType: 'enhance',
          changes: {
            commonConfusions: [
              ...(existingFood.commonConfusions || []),
              incorrectIdentification
            ],
            distinguishingFeatures: [
              ...(existingFood.distinguishingFeatures || []),
              `注意與 ${incorrectIdentification} 的區別`
            ]
          },
          reason: `根據反饋，添加 ${incorrectIdentification} 到易混淆列表`,
          priority: 'medium'
        };
      }
    }

    return null;
  }

  private async generateKnowledgeBaseUpdateForMissing(
    missingFood: string,
    feedback: UserFeedback
  ): Promise<KnowledgeBaseUpdate | null> {
    const existingFood = getFoodItemByName(missingFood);

    if (!existingFood) {
      return {
        foodName: missingFood,
        updateType: 'add',
        changes: {
          distinguishingFeatures: ['需要補充視覺特徵以提高識別率']
        },
        reason: `根據反饋，${missingFood} 經常被遺漏`,
        priority: 'high'
      };
    }

    return null;
  }

  private identifyProblematicPromptTypes(
    mistakes: MistakePattern[]
  ): string[] {
    const promptTypes = new Set<string>();

    for (const mistake of mistakes) {
      // 根據食材類型確定需要優化的 prompt
      if (
        mistake.incorrectIdentification.includes('豆') ||
        mistake.correctIdentification.includes('豆')
      ) {
        promptTypes.add('bean_products');
      }

      if (
        mistake.incorrectIdentification.includes('麵') ||
        mistake.incorrectIdentification.includes('粉') ||
        mistake.correctIdentification.includes('麵') ||
        mistake.correctIdentification.includes('粉')
      ) {
        promptTypes.add('noodles');
      }

      if (mistake.imageFeatures.cuisineType) {
        promptTypes.add(`cuisine_${mistake.imageFeatures.cuisineType}`);
      }

      if (mistake.imageFeatures.cookingMethod) {
        promptTypes.add(`cooking_${mistake.imageFeatures.cookingMethod}`);
      }
    }

    return Array.from(promptTypes);
  }

  private async generatePromptOptimization(
    promptType: string,
    mistakes: MistakePattern[]
  ): Promise<PromptOptimization | null> {
    const relevantMistakes = mistakes.filter(m => {
      // 簡化的相關性判斷
      return true;
    });

    if (relevantMistakes.length === 0) return null;

    const currentIssues: string[] = [];
    const suggestedChanges: string[] = [];
    const affectedFoods = new Set<string>();

    for (const mistake of relevantMistakes.slice(0, 5)) {
      currentIssues.push(
        `${mistake.incorrectIdentification} 被誤識別為 ${mistake.correctIdentification}`
      );
      suggestedChanges.push(
        `添加 ${mistake.correctIdentification} 與 ${mistake.incorrectIdentification} 的詳細區分說明`
      );
      affectedFoods.add(mistake.incorrectIdentification);
      affectedFoods.add(mistake.correctIdentification);
    }

    return {
      promptType,
      currentIssues,
      suggestedChanges,
      affectedFoods: Array.from(affectedFoods),
      priority: relevantMistakes.length >= 5 ? 'high' : 'medium'
    };
  }

  private identifyAffectedScenarios(food: string): string[] {
    // 根據食材識別相關場景
    const scenarios: string[] = [];

    // 這裡應該查詢知識庫中的常見搭配
    const foodItem = getFoodItemByName(food);
    if (foodItem?.commonPairings) {
      scenarios.push(...foodItem.commonPairings);
    }

    return scenarios;
  }

  private async applyKnowledgeBaseUpdate(
    update: KnowledgeBaseUpdate
  ): Promise<void> {
    console.log(`應用知識庫更新: ${update.foodName}`, update.updateType);

    // 實際應用邏輯
    // 這裡應該調用知識庫的更新方法
    // 由於知識庫目前是靜態的，這裡只記錄日誌

    // TODO: 實現動態知識庫更新
  }

  private async applyPromptOptimization(
    optimization: PromptOptimization
  ): Promise<void> {
    console.log(`應用 Prompt 優化: ${optimization.promptType}`);

    // 實際應用邏輯
    // 這裡應該更新 prompt 模板

    // TODO: 實現動態 prompt 更新
  }

  private async applyValidationRuleUpdate(
    update: ValidationRuleUpdate
  ): Promise<void> {
    console.log(`應用驗證規則更新: ${update.ruleName}`, update.ruleType);

    // 實際應用邏輯
    // 這裡應該添加或更新驗證規則

    // TODO: 實現動態驗證規則更新
  }

  private recordImprovementAction(action: ImprovementAction): void {
    this.improvementHistory.push(action);
    console.log('記錄改進操作:', action.description);
  }

  private generateImprovementSummary(
    knowledgeBaseUpdates: KnowledgeBaseUpdate[],
    promptOptimizations: PromptOptimization[],
    validationRuleUpdates: ValidationRuleUpdate[],
    feedbackCount: number
  ): string {
    const parts: string[] = [];

    parts.push(`分析了 ${feedbackCount} 個反饋`);

    if (knowledgeBaseUpdates.length > 0) {
      parts.push(`知識庫更新: ${knowledgeBaseUpdates.length}項`);
      const highPriority = knowledgeBaseUpdates.filter(u => u.priority === 'high');
      if (highPriority.length > 0) {
        parts.push(`其中高優先級: ${highPriority.length}項`);
      }
    }

    if (promptOptimizations.length > 0) {
      parts.push(`Prompt 優化: ${promptOptimizations.length}項`);
    }

    if (validationRuleUpdates.length > 0) {
      parts.push(`驗證規則更新: ${validationRuleUpdates.length}項`);
    }

    const totalChanges =
      knowledgeBaseUpdates.length +
      promptOptimizations.length +
      validationRuleUpdates.length;

    if (totalChanges === 0) {
      return '未發現需要改進的項目';
    }

    return parts.join(' | ');
  }
}
