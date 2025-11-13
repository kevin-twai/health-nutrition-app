import Joi from 'joi';

// 反饋類型枚舉
export enum FeedbackType {
  INCORRECT_FOOD = 'incorrect_food',
  MISSING_FOOD = 'missing_food',
  WRONG_PORTION = 'wrong_portion',
  WRONG_COOKING_METHOD = 'wrong_cooking_method',
  WRONG_CUISINE_TYPE = 'wrong_cuisine_type',
  OTHER = 'other'
}

// 反饋狀態枚舉
export enum FeedbackStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  APPLIED = 'applied',
  REJECTED = 'rejected'
}

// 用戶反饋接口
export interface UserFeedback {
  id?: string;
  imageId: string;
  userId?: string;
  sessionId: string;
  recognitionResult: RecognitionResultSnapshot;
  userCorrection: UserCorrection;
  feedbackType: FeedbackType[];
  additionalComments?: string;
  status: FeedbackStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

// 識別結果快照
export interface RecognitionResultSnapshot {
  foods: FoodSuggestionSnapshot[];
  overallConfidence: number;
  description: string;
  cookingMethod?: string;
  cuisineType?: string;
  recognitionStages: number;
  processingTime: number;
}

// 食物建議快照
export interface FoodSuggestionSnapshot {
  name: string;
  category: string;
  portion: string;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// 用戶修正
export interface UserCorrection {
  correctFoods: CorrectFood[];
  incorrectFoods: IncorrectFood[];
  missingFoods: MissingFood[];
  portionCorrections: PortionCorrection[];
  cookingMethodCorrection?: string;
  cuisineTypeCorrection?: string;
}

// 正確的食物
export interface CorrectFood {
  name: string;
  originalName?: string; // 如果用戶修改了名稱
  portion?: string;
}

// 錯誤的食物
export interface IncorrectFood {
  identifiedAs: string;
  actualFood: string;
  reason?: string;
}

// 遺漏的食物
export interface MissingFood {
  name: string;
  portion?: string;
  category?: string;
  reason?: string;
}

// 份量修正
export interface PortionCorrection {
  foodName: string;
  identifiedPortion: string;
  actualPortion: string;
}

// 錯誤模式
export interface MistakePattern {
  incorrectIdentification: string;
  correctIdentification: string;
  frequency: number;
  imageFeatures: ImageFeaturesSummary;
  commonScenarios: string[];
  lastOccurrence: Date;
}

// 圖片特徵摘要
export interface ImageFeaturesSummary {
  dominantColors: string[];
  textureType: string;
  complexity: string;
  cuisineType?: string;
  cookingMethod?: string;
}

// 反饋統計
export interface FeedbackStats {
  totalFeedbacks: number;
  pendingReviews: number;
  appliedFeedbacks: number;
  rejectedFeedbacks: number;
  averageConfidenceOfIncorrect: number;
  mostCommonMistakes: MistakePattern[];
  improvementSuggestions: ImprovementSuggestion[];
  feedbackByType: Record<FeedbackType, number>;
  feedbackTrend: FeedbackTrendData[];
}

// 改進建議
export interface ImprovementSuggestion {
  type: 'prompt' | 'knowledge_base' | 'validation_rule';
  priority: 'high' | 'medium' | 'low';
  description: string;
  affectedFoods: string[];
  estimatedImpact: number; // 預估影響的反饋數量
  suggestedAction: string;
}

// 反饋趨勢數據
export interface FeedbackTrendData {
  date: string;
  totalFeedbacks: number;
  incorrectIdentifications: number;
  missingFoods: number;
  averageConfidence: number;
}

// 反饋驗證 Schema
export const feedbackValidationSchema = Joi.object({
  imageId: Joi.string().required().messages({
    'any.required': '圖片ID為必填欄位'
  }),
  userId: Joi.string().optional(),
  sessionId: Joi.string().required().messages({
    'any.required': '會話ID為必填欄位'
  }),
  recognitionResult: Joi.object({
    foods: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      category: Joi.string().required(),
      portion: Joi.string().required(),
      confidence: Joi.number().min(0).max(1).required(),
      calories: Joi.number().min(0).required(),
      protein: Joi.number().min(0).required(),
      carbs: Joi.number().min(0).required(),
      fat: Joi.number().min(0).required()
    })).required(),
    overallConfidence: Joi.number().min(0).max(1).required(),
    description: Joi.string().required(),
    cookingMethod: Joi.string().optional(),
    cuisineType: Joi.string().optional(),
    recognitionStages: Joi.number().integer().min(1).required(),
    processingTime: Joi.number().min(0).required()
  }).required(),
  userCorrection: Joi.object({
    correctFoods: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      originalName: Joi.string().optional(),
      portion: Joi.string().optional()
    })).default([]),
    incorrectFoods: Joi.array().items(Joi.object({
      identifiedAs: Joi.string().required(),
      actualFood: Joi.string().required(),
      reason: Joi.string().optional()
    })).default([]),
    missingFoods: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      portion: Joi.string().optional(),
      category: Joi.string().optional(),
      reason: Joi.string().optional()
    })).default([]),
    portionCorrections: Joi.array().items(Joi.object({
      foodName: Joi.string().required(),
      identifiedPortion: Joi.string().required(),
      actualPortion: Joi.string().required()
    })).default([]),
    cookingMethodCorrection: Joi.string().optional(),
    cuisineTypeCorrection: Joi.string().optional()
  }).required(),
  feedbackType: Joi.array().items(
    Joi.string().valid(...Object.values(FeedbackType))
  ).min(1).required().messages({
    'array.min': '至少需要選擇一種反饋類型'
  }),
  additionalComments: Joi.string().max(1000).optional().messages({
    'string.max': '附加評論不能超過1000個字符'
  })
});

// 反饋模型類別
export class FeedbackModel {
  // 驗證反饋資料
  static validate(feedbackData: any): { error?: Joi.ValidationError; value?: any } {
    return feedbackValidationSchema.validate(feedbackData, { abortEarly: false });
  }

  // 序列化反饋資料
  static serialize(feedback: any): UserFeedback {
    return {
      id: feedback.id,
      imageId: feedback.image_id || feedback.imageId,
      userId: feedback.user_id || feedback.userId,
      sessionId: feedback.session_id || feedback.sessionId,
      recognitionResult: feedback.recognition_result || feedback.recognitionResult,
      userCorrection: feedback.user_correction || feedback.userCorrection,
      feedbackType: feedback.feedback_type || feedback.feedbackType,
      additionalComments: feedback.additional_comments || feedback.additionalComments,
      status: feedback.status,
      reviewedBy: feedback.reviewed_by || feedback.reviewedBy,
      reviewedAt: feedback.reviewed_at ? new Date(feedback.reviewed_at) : undefined,
      appliedAt: feedback.applied_at ? new Date(feedback.applied_at) : undefined,
      createdAt: new Date(feedback.created_at || feedback.createdAt),
      updatedAt: feedback.updated_at ? new Date(feedback.updated_at) : undefined
    };
  }

  // 從反饋中提取錯誤模式
  static extractMistakePattern(feedback: UserFeedback): MistakePattern[] {
    const patterns: MistakePattern[] = [];

    // 從錯誤識別中提取模式
    for (const incorrect of feedback.userCorrection.incorrectFoods) {
      patterns.push({
        incorrectIdentification: incorrect.identifiedAs,
        correctIdentification: incorrect.actualFood,
        frequency: 1,
        imageFeatures: {
          dominantColors: [],
          textureType: 'unknown',
          complexity: 'unknown',
          cuisineType: feedback.recognitionResult.cuisineType,
          cookingMethod: feedback.recognitionResult.cookingMethod
        },
        commonScenarios: [incorrect.reason || 'unknown'],
        lastOccurrence: feedback.createdAt
      });
    }

    return patterns;
  }

  // 計算反饋的嚴重程度
  static calculateSeverity(feedback: UserFeedback): 'high' | 'medium' | 'low' {
    const incorrectCount = feedback.userCorrection.incorrectFoods.length;
    const missingCount = feedback.userCorrection.missingFoods.length;
    const confidence = feedback.recognitionResult.overallConfidence;

    // 高信心度但錯誤 = 高嚴重度
    if (confidence > 0.85 && (incorrectCount > 0 || missingCount > 1)) {
      return 'high';
    }

    // 多個錯誤 = 高嚴重度
    if (incorrectCount + missingCount >= 3) {
      return 'high';
    }

    // 中等錯誤
    if (incorrectCount + missingCount >= 1) {
      return 'medium';
    }

    // 僅份量或烹飪方式錯誤 = 低嚴重度
    return 'low';
  }

  // 生成反饋摘要
  static generateSummary(feedback: UserFeedback): string {
    const parts: string[] = [];

    if (feedback.userCorrection.incorrectFoods.length > 0) {
      const incorrect = feedback.userCorrection.incorrectFoods
        .map(f => `${f.identifiedAs} → ${f.actualFood}`)
        .join(', ');
      parts.push(`錯誤識別: ${incorrect}`);
    }

    if (feedback.userCorrection.missingFoods.length > 0) {
      const missing = feedback.userCorrection.missingFoods
        .map(f => f.name)
        .join(', ');
      parts.push(`遺漏食材: ${missing}`);
    }

    if (feedback.userCorrection.portionCorrections.length > 0) {
      parts.push(`份量修正: ${feedback.userCorrection.portionCorrections.length}項`);
    }

    if (feedback.userCorrection.cookingMethodCorrection) {
      parts.push(`烹飪方式修正: ${feedback.userCorrection.cookingMethodCorrection}`);
    }

    return parts.join(' | ') || '無具體修正';
  }
}
