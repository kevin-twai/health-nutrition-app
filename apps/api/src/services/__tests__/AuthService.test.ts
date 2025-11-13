import { AuthService, AuthError, RegisterRequest, LoginRequest } from '../AuthService';
import { UserRepository } from '../../repositories/UserRepository';
import { JWTUtils } from '../../utils/jwt';
import { User } from '../../types/shared';
import bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('../../repositories/UserRepository');
jest.mock('../../utils/jwt');
jest.mock('bcryptjs');

// Mock UserRepository methods
const mockUserRepository = {
  create: jest.fn(),
  validatePassword: jest.fn(),
  findById: jest.fn(),
  query: jest.fn()
} as any;

describe('AuthService', () => {
  let authService: AuthService;
  let mockRedis: any;

  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    profile: {
      name: '測試用戶',
      age: 25,
      gender: 'male',
      height: 175,
      weight: 70,
      activityLevel: 'moderately_active' as any
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
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock Redis
    mockRedis = {
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(1),
      exists: jest.fn().mockResolvedValue(0)
    };

    // Create AuthService instance
    authService = new AuthService(mockUserRepository, mockRedis);
  });

  describe('register', () => {
    const validRegisterData: RegisterRequest = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      profile: {
        name: '測試用戶',
        age: 25,
        gender: 'male',
        height: 175,
        weight: 70,
        activityLevel: 'moderately_active'
      }
    };

    it('應該成功註冊新用戶', async () => {
      // Arrange
      mockUserRepository.create.mockResolvedValue(mockUser);
      (JWTUtils.generateTokenPair as jest.Mock).mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });

      // Act
      const result = await authService.register(validRegisterData);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: validRegisterData.email,
        password: validRegisterData.password,
        profile: validRegisterData.profile,
        preferences: undefined
      });
      expect(result.user.email).toBe(mockUser.email);
      expect(result.tokens.accessToken).toBe('mock-access-token');
      expect(result.tokens.refreshToken).toBe('mock-refresh-token');
      expect(mockRedis.setex).toHaveBeenCalledWith(
        `refresh_token:${mockUser.id}`,
        30 * 24 * 60 * 60,
        'mock-refresh-token'
      );
    });

    it('應該在密碼確認不符時拋出錯誤', async () => {
      // Arrange
      const invalidData = {
        ...validRegisterData,
        confirmPassword: 'DifferentPassword123!'
      };

      // Act & Assert
      await expect(authService.register(invalidData)).rejects.toThrow(
        new AuthError('密碼確認不符', 'PASSWORD_MISMATCH', 400)
      );
    });

    it('應該在電子郵件已存在時拋出錯誤', async () => {
      // Arrange
      const duplicateError = new Error('Duplicate error');
      (duplicateError as any).code = 'DUPLICATE_ERROR';
      mockUserRepository.create.mockRejectedValue(duplicateError);

      // Act & Assert
      await expect(authService.register(validRegisterData)).rejects.toThrow(
        new AuthError('此電子郵件已被註冊', 'EMAIL_ALREADY_EXISTS', 409)
      );
    });

    it('應該在無效的電子郵件格式時拋出錯誤', async () => {
      // Arrange
      const invalidData = {
        ...validRegisterData,
        email: 'invalid-email'
      };

      // Act & Assert
      await expect(authService.register(invalidData)).rejects.toThrow(AuthError);
    });

    it('應該在密碼格式不正確時拋出錯誤', async () => {
      // Arrange
      const invalidData = {
        ...validRegisterData,
        password: 'weak',
        confirmPassword: 'weak'
      };

      // Act & Assert
      await expect(authService.register(invalidData)).rejects.toThrow(AuthError);
    });
  });

  describe('login', () => {
    const validLoginData: LoginRequest = {
      email: 'test@example.com',
      password: 'TestPassword123!'
    };

    it('應該成功登入用戶', async () => {
      // Arrange
      mockUserRepository.validatePassword.mockResolvedValue(mockUser);
      (JWTUtils.generateTokenPair as jest.Mock).mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });

      // Act
      const result = await authService.login(validLoginData);

      // Assert
      expect(mockUserRepository.validatePassword).toHaveBeenCalledWith(
        validLoginData.email,
        validLoginData.password
      );
      expect(result.user.email).toBe(mockUser.email);
      expect(result.tokens.accessToken).toBe('mock-access-token');
      expect(result.tokens.refreshToken).toBe('mock-refresh-token');
    });

    it('應該在憑證無效時拋出錯誤', async () => {
      // Arrange
      mockUserRepository.validatePassword.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(validLoginData)).rejects.toThrow(
        new AuthError('電子郵件或密碼錯誤', 'INVALID_CREDENTIALS', 401)
      );
    });

    it('應該在記住我選項為 true 時設定較長的過期時間', async () => {
      // Arrange
      mockUserRepository.validatePassword.mockResolvedValue(mockUser);
      (JWTUtils.generateTokenPair as jest.Mock).mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });

      const loginDataWithRememberMe = {
        ...validLoginData,
        rememberMe: true
      };

      // Act
      await authService.login(loginDataWithRememberMe);

      // Assert
      expect(mockRedis.setex).toHaveBeenCalledWith(
        `refresh_token:${mockUser.id}`,
        30 * 24 * 60 * 60, // 30天
        'mock-refresh-token'
      );
    });
  });

  describe('refreshToken', () => {
    const mockRefreshToken = 'mock-refresh-token';
    const mockPayload = {
      userId: mockUser.id,
      email: mockUser.email,
      type: 'refresh' as const
    };

    it('應該成功刷新令牌', async () => {
      // Arrange
      (JWTUtils.verifyRefreshToken as jest.Mock).mockReturnValue(mockPayload);
      mockRedis.get.mockResolvedValue(mockRefreshToken);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      (JWTUtils.generateTokenPair as jest.Mock).mockReturnValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      });

      // Act
      const result = await authService.refreshToken(mockRefreshToken);

      // Assert
      expect(JWTUtils.verifyRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockRedis.get).toHaveBeenCalledWith(`refresh_token:${mockUser.id}`);
      expect(result.tokens.accessToken).toBe('new-access-token');
      expect(result.tokens.refreshToken).toBe('new-refresh-token');
    });

    it('應該在無效的刷新令牌時拋出錯誤', async () => {
      // Arrange
      (JWTUtils.verifyRefreshToken as jest.Mock).mockReturnValue(null);

      // Act & Assert
      await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow(
        new AuthError('無效的刷新令牌', 'INVALID_REFRESH_TOKEN', 401)
      );
    });

    it('應該在令牌已被撤銷時拋出錯誤', async () => {
      // Arrange
      (JWTUtils.verifyRefreshToken as jest.Mock).mockReturnValue(mockPayload);
      mockRedis.get.mockResolvedValue('different-token');

      // Act & Assert
      await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow(
        new AuthError('刷新令牌已失效', 'REFRESH_TOKEN_REVOKED', 401)
      );
    });

    it('應該在用戶不存在時拋出錯誤', async () => {
      // Arrange
      (JWTUtils.verifyRefreshToken as jest.Mock).mockReturnValue(mockPayload);
      mockRedis.get.mockResolvedValue(mockRefreshToken);
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow(
        new AuthError('用戶不存在', 'USER_NOT_FOUND', 404)
      );
    });
  });

  describe('logout', () => {
    it('應該成功登出用戶', async () => {
      // Act
      await authService.logout(mockUser.id, 'mock-refresh-token');

      // Assert
      expect(mockRedis.del).toHaveBeenCalledWith(`refresh_token:${mockUser.id}`);
    });

    it('應該將刷新令牌加入黑名單', async () => {
      // Arrange
      const mockToken = 'mock-refresh-token';
      const mockPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600 // 1小時後過期
      };
      (JWTUtils.decodeToken as jest.Mock).mockReturnValue(mockPayload);

      // Act
      await authService.logout(mockUser.id, mockToken);

      // Assert
      expect(JWTUtils.decodeToken).toHaveBeenCalledWith(mockToken);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        `blacklist:${mockToken}`,
        expect.any(Number),
        '1'
      );
    });
  });

  describe('verifyAccessToken', () => {
    const mockAccessToken = 'mock-access-token';
    const mockPayload = {
      userId: mockUser.id,
      email: mockUser.email,
      type: 'access' as const
    };

    it('應該成功驗證存取令牌', async () => {
      // Arrange
      mockRedis.exists.mockResolvedValue(0); // 不在黑名單中
      (JWTUtils.verifyAccessToken as jest.Mock).mockReturnValue(mockPayload);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await authService.verifyAccessToken(mockAccessToken);

      // Assert
      expect(mockRedis.exists).toHaveBeenCalledWith(`blacklist:${mockAccessToken}`);
      expect(JWTUtils.verifyAccessToken).toHaveBeenCalledWith(mockAccessToken);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('應該在令牌在黑名單中時返回 null', async () => {
      // Arrange
      mockRedis.exists.mockResolvedValue(1); // 在黑名單中

      // Act
      const result = await authService.verifyAccessToken(mockAccessToken);

      // Assert
      expect(result).toBeNull();
    });

    it('應該在無效令牌時返回 null', async () => {
      // Arrange
      mockRedis.exists.mockResolvedValue(0);
      (JWTUtils.verifyAccessToken as jest.Mock).mockReturnValue(null);

      // Act
      const result = await authService.verifyAccessToken(mockAccessToken);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('changePassword', () => {
    const currentPassword = 'CurrentPassword123!';
    const newPassword = 'NewPassword123!';

    it('應該在用戶不存在時拋出錯誤', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.changePassword(mockUser.id, currentPassword, newPassword)
      ).rejects.toThrow(new AuthError('用戶不存在', 'USER_NOT_FOUND', 404));
    });
  });
});