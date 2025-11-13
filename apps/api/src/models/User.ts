import Joi from 'joi';
import { User, UserProfile, HealthGoal, ActivityLevel, GoalType, GoalStatus } from '../types/shared';

// 用戶驗證 Schema
export const userValidationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '請輸入有效的電子郵件地址',
    'any.required': '電子郵件為必填欄位'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required().messages({
    'string.min': '密碼至少需要8個字符',
    'string.pattern.base': '密碼必須包含大小寫字母、數字和特殊字符',
    'any.required': '密碼為必填欄位'
  })
});

// 用戶檔案驗證 Schema
export const userProfileValidationSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    'string.min': '姓名不能為空',
    'string.max': '姓名不能超過255個字符',
    'any.required': '姓名為必填欄位'
  }),
  age: Joi.number().integer().min(1).max(150).required().messages({
    'number.min': '年齡必須大於0',
    'number.max': '年齡不能超過150',
    'any.required': '年齡為必填欄位'
  }),
  gender: Joi.string().valid('male', 'female', 'other').required().messages({
    'any.only': '性別必須是 male、female 或 other',
    'any.required': '性別為必填欄位'
  }),
  height: Joi.number().positive().min(50).max(300).required().messages({
    'number.positive': '身高必須為正數',
    'number.min': '身高不能小於50公分',
    'number.max': '身高不能超過300公分',
    'any.required': '身高為必填欄位'
  }),
  weight: Joi.number().positive().min(10).max(500).required().messages({
    'number.positive': '體重必須為正數',
    'number.min': '體重不能小於10公斤',
    'number.max': '體重不能超過500公斤',
    'any.required': '體重為必填欄位'
  }),
  activityLevel: Joi.string().valid(...Object.values(ActivityLevel)).required().messages({
    'any.only': '活動水平必須是有效的選項',
    'any.required': '活動水平為必填欄位'
  })
});

// 健康目標驗證 Schema
export const healthGoalValidationSchema = Joi.object({
  type: Joi.string().valid(...Object.values(GoalType)).required().messages({
    'any.only': '目標類型必須是有效的選項',
    'any.required': '目標類型為必填欄位'
  }),
  target: Joi.number().positive().required().messages({
    'number.positive': '目標值必須為正數',
    'any.required': '目標值為必填欄位'
  }),
  current: Joi.number().min(0).default(0).messages({
    'number.min': '當前值不能為負數'
  }),
  deadline: Joi.date().greater('now').required().messages({
    'date.greater': '截止日期必須是未來的日期',
    'any.required': '截止日期為必填欄位'
  }),
  status: Joi.string().valid(...Object.values(GoalStatus)).default(GoalStatus.ACTIVE)
});

// 用戶更新驗證 Schema (部分更新)
export const userUpdateValidationSchema = Joi.object({
  email: Joi.string().email().messages({
    'string.email': '請輸入有效的電子郵件地址'
  }),
  profile: userProfileValidationSchema.optional()
}).min(1).messages({
  'object.min': '至少需要提供一個要更新的欄位'
});

// 用戶模型類別
export class UserModel {
  // 驗證用戶註冊資料
  static validateRegistration(userData: any): { error?: Joi.ValidationError; value?: any } {
    return userValidationSchema.validate(userData, { abortEarly: false });
  }

  // 驗證用戶檔案資料
  static validateProfile(profileData: any): { error?: Joi.ValidationError; value?: UserProfile } {
    return userProfileValidationSchema.validate(profileData, { abortEarly: false });
  }

  // 驗證健康目標資料
  static validateHealthGoal(goalData: any): { error?: Joi.ValidationError; value?: HealthGoal } {
    return healthGoalValidationSchema.validate(goalData, { abortEarly: false });
  }

  // 驗證用戶更新資料
  static validateUpdate(updateData: any): { error?: Joi.ValidationError; value?: any } {
    return userUpdateValidationSchema.validate(updateData, { abortEarly: false });
  }

  // 序列化用戶資料 (移除敏感資訊)
  static serialize(user: any): Omit<User, 'password'> {
    const { password, password_hash, ...serializedUser } = user;
    return {
      id: serializedUser.id,
      email: serializedUser.email,
      profile: serializedUser.profile || {},
      preferences: serializedUser.preferences || {
        language: 'zh-TW',
        timezone: 'Asia/Taipei',
        notifications: {
          email: true,
          push: true,
          sms: false,
          weeklyReport: true,
          achievements: true
        },
        privacy: {
          dataSharing: false,
          analytics: true,
          thirdPartyIntegration: true
        }
      },
      healthGoals: serializedUser.healthGoals || [],
      createdAt: serializedUser.created_at || serializedUser.createdAt,
      updatedAt: serializedUser.updated_at || serializedUser.updatedAt
    };
  }

  // 序列化用戶檔案資料
  static serializeProfile(profile: any): UserProfile {
    return {
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      activityLevel: profile.activity_level || profile.activityLevel
    };
  }

  // 序列化健康目標資料
  static serializeHealthGoal(goal: any): HealthGoal {
    return {
      id: goal.id,
      type: goal.type,
      target: goal.target,
      current: goal.current_value || goal.current,
      deadline: new Date(goal.deadline),
      status: goal.status
    };
  }

  // 計算 BMI
  static calculateBMI(height: number, weight: number): number {
    if (height <= 0 || weight <= 0) {
      return NaN;
    }
    const heightInMeters = height / 100;
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }

  // 計算基礎代謝率 (BMR) - 使用 Mifflin-St Jeor 公式
  static calculateBMR(profile: UserProfile): number {
    const { gender, age, height, weight } = profile;
    
    if (gender === 'male') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
  }

  // 計算每日總消耗熱量 (TDEE)
  static calculateTDEE(profile: UserProfile): number {
    const bmr = this.calculateBMR(profile);
    const activityMultipliers = {
      [ActivityLevel.SEDENTARY]: 1.2,
      [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
      [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
      [ActivityLevel.VERY_ACTIVE]: 1.725,
      [ActivityLevel.EXTREMELY_ACTIVE]: 1.9
    };
    
    return Math.round(bmr * activityMultipliers[profile.activityLevel]);
  }

  // 驗證目標是否合理
  static validateGoalReasonableness(goal: HealthGoal, profile: UserProfile): { isValid: boolean; message?: string } {
    const currentBMI = this.calculateBMI(profile.height, profile.weight);
    
    switch (goal.type) {
      case GoalType.WEIGHT_LOSS:
        if (currentBMI < 18.5) {
          return { isValid: false, message: '您的BMI已經偏低，不建議進一步減重' };
        }
        if (goal.target > profile.weight) {
          return { isValid: false, message: '減重目標不能高於當前體重' };
        }
        break;
        
      case GoalType.WEIGHT_GAIN:
        if (currentBMI > 30) {
          return { isValid: false, message: '您的BMI已經偏高，建議先諮詢醫師' };
        }
        if (goal.target < profile.weight) {
          return { isValid: false, message: '增重目標不能低於當前體重' };
        }
        break;
        
      case GoalType.MAINTENANCE:
        if (Math.abs(goal.target - profile.weight) > 2) {
          return { isValid: false, message: '維持體重目標應該接近當前體重' };
        }
        break;
    }
    
    return { isValid: true };
  }
}