import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { UserModel } from '../models/User';
import { User, UserProfile, UserPreferences, HealthGoal } from '../types/shared';
import { db } from '../database/connection';
import Redis from 'ioredis';

// 用戶管理控制器
export class UserController {
  private userRepository: UserRepository;

  constructor(redis?: Redis) {
    this.userRepository = new UserRepository(db.getPool(), redis);
  }

  // 獲取用戶檔案
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId || req.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: '缺少用戶 ID'
          }
        });
        return;
      }

      const user = await this.userRepository.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用戶不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: UserModel.serialize(user)
        }
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 更新用戶檔案
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId || req.userId;
      const updateData = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: '缺少用戶 ID'
          }
        });
        return;
      }

      // 驗證更新資料
      const { error } = UserModel.validateUpdate(updateData);
      if (error) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.details.map(d => d.message).join(', ')
          }
        });
        return;
      }

      const updatedUser = await this.userRepository.update(userId, updateData);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用戶不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: UserModel.serialize(updatedUser)
        },
        message: '用戶檔案更新成功'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 更新用戶偏好設定
  updatePreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId || req.userId;
      const preferences: Partial<UserPreferences> = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: '缺少用戶 ID'
          }
        });
        return;
      }

      // 基本驗證
      if (!preferences || Object.keys(preferences).length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'EMPTY_PREFERENCES',
            message: '偏好設定不能為空'
          }
        });
        return;
      }

      const updatedUser = await this.userRepository.update(userId, { preferences: preferences as UserPreferences });

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用戶不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          preferences: updatedUser.preferences
        },
        message: '偏好設定更新成功'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 獲取健康目標
  getHealthGoals = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId || req.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: '缺少用戶 ID'
          }
        });
        return;
      }

      const healthGoals = await this.userRepository.findHealthGoalsByUserId(userId);

      res.json({
        success: true,
        data: {
          healthGoals
        }
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 新增健康目標
  addHealthGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId || req.userId;
      const goalData = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: '缺少用戶 ID'
          }
        });
        return;
      }

      // 驗證健康目標資料
      const { error } = UserModel.validateHealthGoal(goalData);
      if (error) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.details.map(d => d.message).join(', ')
          }
        });
        return;
      }

      // 檢查目標合理性（如果有用戶檔案資料）
      const user = await this.userRepository.findById(userId);
      if (user && user.profile) {
        const reasonableness = UserModel.validateGoalReasonableness(goalData, user.profile);
        if (!reasonableness.isValid) {
          res.status(400).json({
            success: false,
            error: {
              code: 'UNREASONABLE_GOAL',
              message: reasonableness.message
            }
          });
          return;
        }
      }

      const newGoal = await this.userRepository.addHealthGoal(userId, goalData);

      res.status(201).json({
        success: true,
        data: {
          healthGoal: newGoal
        },
        message: '健康目標新增成功'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 更新健康目標
  updateHealthGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const { goalId } = req.params;
      const updateData = req.body;

      if (!goalId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_GOAL_ID',
            message: '缺少目標 ID'
          }
        });
        return;
      }

      // 部分驗證健康目標資料
      if (updateData.type || updateData.target || updateData.deadline) {
        const { error } = UserModel.validateHealthGoal({
          type: updateData.type || 'weight_loss',
          target: updateData.target || 1,
          deadline: updateData.deadline || new Date(),
          ...updateData
        });
        
        if (error) {
          res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: error.details.map(d => d.message).join(', ')
            }
          });
          return;
        }
      }

      const updatedGoal = await this.userRepository.updateHealthGoal(goalId, updateData);

      if (!updatedGoal) {
        res.status(404).json({
          success: false,
          error: {
            code: 'GOAL_NOT_FOUND',
            message: '健康目標不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          healthGoal: updatedGoal
        },
        message: '健康目標更新成功'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 刪除健康目標
  deleteHealthGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const { goalId } = req.params;

      if (!goalId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_GOAL_ID',
            message: '缺少目標 ID'
          }
        });
        return;
      }

      // 軟刪除：將狀態設為 cancelled
      const updatedGoal = await this.userRepository.updateHealthGoal(goalId, {
        status: 'cancelled' as any
      });

      if (!updatedGoal) {
        res.status(404).json({
          success: false,
          error: {
            code: 'GOAL_NOT_FOUND',
            message: '健康目標不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: '健康目標刪除成功'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 計算用戶健康指標
  getHealthMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId || req.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: '缺少用戶 ID'
          }
        });
        return;
      }

      const user = await this.userRepository.findById(userId);

      if (!user || !user.profile) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_PROFILE_NOT_FOUND',
            message: '用戶檔案不存在'
          }
        });
        return;
      }

      const { profile } = user;
      
      // 計算健康指標
      const bmi = UserModel.calculateBMI(profile.height, profile.weight);
      const bmr = UserModel.calculateBMR(profile);
      const tdee = UserModel.calculateTDEE(profile);

      // BMI 分類
      let bmiCategory = '';
      if (bmi < 18.5) bmiCategory = '體重過輕';
      else if (bmi < 24) bmiCategory = '正常體重';
      else if (bmi < 27) bmiCategory = '體重過重';
      else if (bmi < 30) bmiCategory = '輕度肥胖';
      else if (bmi < 35) bmiCategory = '中度肥胖';
      else bmiCategory = '重度肥胖';

      res.json({
        success: true,
        data: {
          metrics: {
            bmi: {
              value: bmi,
              category: bmiCategory
            },
            bmr: {
              value: bmr,
              description: '基礎代謝率 (每日靜息消耗熱量)'
            },
            tdee: {
              value: tdee,
              description: '每日總消耗熱量 (包含活動)'
            }
          },
          profile
        }
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 獲取用戶統計資料
  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId || req.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: '缺少用戶 ID'
          }
        });
        return;
      }

      // 獲取用戶基本資訊
      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用戶不存在'
          }
        });
        return;
      }

      // 計算統計資料
      const activeGoals = user.healthGoals.filter(goal => goal.status === 'active').length;
      const completedGoals = user.healthGoals.filter(goal => goal.status === 'completed').length;
      const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

      // TODO: 從其他表獲取更多統計資料
      // - 總記錄天數
      // - 平均每日熱量攝取
      // - 最常記錄的食物類型
      // - 連續記錄天數

      res.json({
        success: true,
        data: {
          stats: {
            accountAge,
            activeGoals,
            completedGoals,
            totalGoals: user.healthGoals.length,
            // 暫時的模擬資料
            totalLogDays: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageDailyCalories: 0
          }
        }
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 刪除用戶帳戶
  deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId || req.userId;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: '缺少用戶 ID'
          }
        });
        return;
      }

      const success = await this.userRepository.delete(userId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用戶不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: '用戶帳戶刪除成功'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 錯誤處理
  private handleError(error: any, res: Response): void {
    console.error('用戶控制器錯誤:', error);

    if (error.code === 'NOT_FOUND_ERROR') {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用戶不存在'
        }
      });
      return;
    }

    if (error.code === 'VALIDATION_ERROR') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '伺服器內部錯誤'
      }
    });
  }
}