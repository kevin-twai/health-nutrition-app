import request from 'supertest';
import express from 'express';
import { AuthController } from '../AuthController';
import { AuthService, AuthError } from '../../services/AuthService';
import { ActivityLevel } from '../../types/shared';

// Mock AuthService
jest.mock('../../services/AuthService');

describe('AuthController', () => {
  let app: express.Application;
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;

  const mockAuthResponse = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      profile: {
        name: '測試用戶',
        age: 25,
        gender: 'male' as const,
        height: 175,
        weight: 70,
        activityLevel: ActivityLevel.MODERATELY_ACTIVE
      },
      preferences: {
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
      healthGoals: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    tokens: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    },
    expiresIn: 604800
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create Express app for testing
    app = express();
    app.use(express.json());

    // Create controller instance
    authController = new AuthController();

    // Mock AuthService methods
    mockAuthService = AuthService.prototype as jest.Mocked<AuthService>;

    // Setup routes
    app.post('/register', authController.register);
    app.post('/login', authController.login);
    app.post('/refresh', authController.refreshToken);
    app.post('/logout', (req, res, next) => {
      req.userId = 'test-user-id';
      next();
    }, authController.logout);
    app.get('/me', (req, res, next) => {
      req.user = mockAuthResponse.user as any;
      next();
    }, authController.getCurrentUser);
    app.post('/forgot-password', authController.forgotPassword);
    app.post('/reset-password', authController.resetPassword);
    app.post('/change-password', (req, res, next) => {
      req.userId = 'test-user-id';
      next();
    }, authController.changePassword);
  });

  describe('POST /register', () => {
    const validRegisterData = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      profile: {
        name: '測試用戶',
        age: 25,
        gender: 'male' as const,
        height: 175,
        weight: 70,
        activityLevel: ActivityLevel.MODERATELY_ACTIVE
      }
    };

    it('應該成功註冊用戶', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      // Act
      const response = await request(app)
        .post('/register')
        .send(validRegisterData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.tokens.accessToken).toBe('mock-access-token');
      expect(response.body.message).toBe('註冊成功');
    });

    it('應該在缺少必填欄位時返回 400', async () => {
      // Act
      const response = await request(app)
        .post('/register')
        .send({ email: 'test@example.com' }); // 缺少密碼

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_REQUIRED_FIELDS');
    });

    it('應該在電子郵件已存在時返回 409', async () => {
      // Arrange
      mockAuthService.register.mockRejectedValue(
        new AuthError('此電子郵件已被註冊', 'EMAIL_ALREADY_EXISTS', 409)
      );

      // Act
      const response = await request(app)
        .post('/register')
        .send(validRegisterData);

      // Assert
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('POST /login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'TestPassword123!'
    };

    it('應該成功登入用戶', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      // Act
      const response = await request(app)
        .post('/login')
        .send(validLoginData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.tokens.accessToken).toBe('mock-access-token');
      expect(response.body.message).toBe('登入成功');
    });

    it('應該在缺少憑證時返回 400', async () => {
      // Act
      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com' }); // 缺少密碼

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_CREDENTIALS');
    });

    it('應該在憑證無效時返回 401', async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(
        new AuthError('電子郵件或密碼錯誤', 'INVALID_CREDENTIALS', 401)
      );

      // Act
      const response = await request(app)
        .post('/login')
        .send(validLoginData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /refresh', () => {
    it('應該成功刷新令牌', async () => {
      // Arrange
      mockAuthService.refreshToken.mockResolvedValue(mockAuthResponse);

      // Act
      const response = await request(app)
        .post('/refresh')
        .send({ refreshToken: 'valid-refresh-token' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBe('mock-access-token');
      expect(response.body.message).toBe('令牌刷新成功');
    });

    it('應該在缺少刷新令牌時返回 400', async () => {
      // Act
      const response = await request(app)
        .post('/refresh')
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_REFRESH_TOKEN');
    });

    it('應該在無效的刷新令牌時返回 401', async () => {
      // Arrange
      mockAuthService.refreshToken.mockRejectedValue(
        new AuthError('無效的刷新令牌', 'INVALID_REFRESH_TOKEN', 401)
      );

      // Act
      const response = await request(app)
        .post('/refresh')
        .send({ refreshToken: 'invalid-refresh-token' });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });
  });

  describe('POST /logout', () => {
    it('應該成功登出用戶', async () => {
      // Arrange
      mockAuthService.logout.mockResolvedValue();

      // Act
      const response = await request(app)
        .post('/logout')
        .send({ refreshToken: 'valid-refresh-token' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('登出成功');
      expect(mockAuthService.logout).toHaveBeenCalledWith('test-user-id', 'valid-refresh-token');
    });
  });

  describe('GET /me', () => {
    it('應該返回當前用戶資訊', async () => {
      // Act
      const response = await request(app).get('/me');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
    });
  });

  describe('POST /forgot-password', () => {
    it('應該成功發送重設密碼郵件', async () => {
      // Arrange
      mockAuthService.forgotPassword.mockResolvedValue();

      // Act
      const response = await request(app)
        .post('/forgot-password')
        .send({ email: 'test@example.com' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('如果該電子郵件地址存在');
    });

    it('應該在缺少電子郵件時返回 400', async () => {
      // Act
      const response = await request(app)
        .post('/forgot-password')
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_EMAIL');
    });
  });

  describe('POST /reset-password', () => {
    const validResetData = {
      token: 'valid-reset-token',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    };

    it('應該成功重設密碼', async () => {
      // Arrange
      mockAuthService.resetPassword.mockResolvedValue();

      // Act
      const response = await request(app)
        .post('/reset-password')
        .send(validResetData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('密碼重設成功，請使用新密碼登入');
    });

    it('應該在密碼不符時返回 400', async () => {
      // Act
      const response = await request(app)
        .post('/reset-password')
        .send({
          ...validResetData,
          confirmPassword: 'DifferentPassword123!'
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PASSWORD_MISMATCH');
    });
  });

  describe('POST /change-password', () => {
    const validChangeData = {
      currentPassword: 'CurrentPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    };

    it('應該成功變更密碼', async () => {
      // Arrange
      mockAuthService.changePassword.mockResolvedValue();

      // Act
      const response = await request(app)
        .post('/change-password')
        .send(validChangeData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('密碼變更成功，請重新登入');
    });

    it('應該在密碼不符時返回 400', async () => {
      // Act
      const response = await request(app)
        .post('/change-password')
        .send({
          ...validChangeData,
          confirmPassword: 'DifferentPassword123!'
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PASSWORD_MISMATCH');
    });

    it('應該在當前密碼錯誤時返回 400', async () => {
      // Arrange
      mockAuthService.changePassword.mockRejectedValue(
        new AuthError('當前密碼錯誤', 'INVALID_CURRENT_PASSWORD', 400)
      );

      // Act
      const response = await request(app)
        .post('/change-password')
        .send(validChangeData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CURRENT_PASSWORD');
    });
  });
});