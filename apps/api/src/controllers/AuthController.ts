import { Request, Response } from 'express';
import { AuthService, AuthError, RegisterRequest, LoginRequest } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { UserModel } from '../models/User';
import { db } from '../database/connection';
import Redis from 'ioredis';

// 認證控制器
export class AuthController {
  private authService: AuthService;

  constructor(redis?: Redis) {
    const userRepository = new UserRepository(db.getPool(), redis);
    this.authService = new AuthService(userRepository, redis);
  }

  // 用戶註冊
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const registerData: RegisterRequest = req.body;

      // 基本驗證
      if (!registerData.email || !registerData.password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: '電子郵件和密碼為必填欄位'
          }
        });
        return;
      }

      const result = await this.authService.register(registerData);

      res.status(201).json({
        success: true,
        data: result,
        message: '註冊成功'
      });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  };

  // 用戶登入
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginData: LoginRequest = req.body;

      // 基本驗證
      if (!loginData.email || !loginData.password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_CREDENTIALS',
            message: '請提供電子郵件和密碼'
          }
        });
        return;
      }

      const result = await this.authService.login(loginData);

      res.json({
        success: true,
        data: result,
        message: '登入成功'
      });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  };

  // 刷新令牌
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REFRESH_TOKEN',
            message: '缺少刷新令牌'
          }
        });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: result,
        message: '令牌刷新成功'
      });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  };

  // 用戶登出
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '未認證的請求'
          }
        });
        return;
      }

      await this.authService.logout(userId, refreshToken);

      res.json({
        success: true,
        message: '登出成功'
      });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  };

  // 獲取當前用戶資訊
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '未認證的請求'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: UserModel.serialize(req.user)
        }
      });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  };

  // 忘記密碼
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_EMAIL',
            message: '請提供電子郵件地址'
          }
        });
        return;
      }

      await this.authService.forgotPassword(email);

      res.json({
        success: true,
        message: '如果該電子郵件地址存在，我們已發送重設密碼的指示'
      });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  };

  // 重設密碼
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token || !newPassword || !confirmPassword) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: '請提供重設令牌、新密碼和確認密碼'
          }
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({
          success: false,
          error: {
            code: 'PASSWORD_MISMATCH',
            message: '新密碼和確認密碼不符'
          }
        });
        return;
      }

      await this.authService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: '密碼重設成功，請使用新密碼登入'
      });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  };

  // 變更密碼
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '未認證的請求'
          }
        });
        return;
      }

      if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: '請提供當前密碼、新密碼和確認密碼'
          }
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({
          success: false,
          error: {
            code: 'PASSWORD_MISMATCH',
            message: '新密碼和確認密碼不符'
          }
        });
        return;
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: '密碼變更成功，請重新登入'
      });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  };

  // 發送電子郵件驗證
  sendEmailVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '未認證的請求'
          }
        });
        return;
      }

      await this.authService.sendEmailVerification(userId);

      res.json({
        success: true,
        message: '驗證郵件已發送'
      });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  };

  // 驗證電子郵件
  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: '缺少驗證令牌'
          }
        });
        return;
      }

      await this.authService.verifyEmail(token);

      res.json({
        success: true,
        message: '電子郵件驗證成功'
      });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  };

  // OAuth 登入（Google）- 未來實作
  googleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: 實作 Google OAuth 登入
      res.status(501).json({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Google OAuth 登入尚未實作'
        }
      });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  };

  // OAuth 登入（Facebook）- 未來實作
  facebookAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: 實作 Facebook OAuth 登入
      res.status(501).json({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Facebook OAuth 登入尚未實作'
        }
      });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  };

  // OAuth 登入（Apple）- 未來實作
  appleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: 實作 Apple OAuth 登入
      res.status(501).json({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Apple OAuth 登入尚未實作'
        }
      });
    } catch (error) {
      this.handleAuthError(error, res);
    }
  };

  // 處理認證錯誤
  private handleAuthError(error: any, res: Response): void {
    console.error('認證錯誤:', error);

    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
      return;
    }

    // 處理其他類型的錯誤
    if (error.code === 'DUPLICATE_ERROR') {
      res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: '此電子郵件已被註冊'
        }
      });
      return;
    }

    // 預設錯誤回應
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '伺服器內部錯誤'
      }
    });
  }
}