import { JWTUtils, JWTPayload } from '../jwt';
import { User } from '../../types/shared';
import jwt from 'jsonwebtoken';

// Mock jwt module
jest.mock('jsonwebtoken');

describe('JWTUtils', () => {
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
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('應該生成有效的存取令牌', () => {
      // Arrange
      const mockToken = 'mock-access-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const token = JWTUtils.generateAccessToken(mockUser);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          email: mockUser.email,
          type: 'access'
        },
        expect.any(String),
        {
          expiresIn: expect.any(String),
          issuer: 'health-nutrition-tracker',
          audience: 'health-nutrition-tracker-users'
        }
      );
      expect(token).toBe(mockToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('應該生成有效的刷新令牌', () => {
      // Arrange
      const mockToken = 'mock-refresh-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const token = JWTUtils.generateRefreshToken(mockUser);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          email: mockUser.email,
          type: 'refresh'
        },
        expect.any(String),
        {
          expiresIn: expect.any(String),
          issuer: 'health-nutrition-tracker',
          audience: 'health-nutrition-tracker-users'
        }
      );
      expect(token).toBe(mockToken);
    });
    });

  describe('verifyAccessToken', () => {
    it('應該成功驗證有效的存取令牌', () => {
      // Arrange
      const mockPayload: JWTPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      // Act
      const result = JWTUtils.verifyAccessToken('valid-token');

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-token',
        expect.any(String),
        {
          issuer: 'health-nutrition-tracker',
          audience: 'health-nutrition-tracker-users'
        }
      );
      expect(result).toEqual(mockPayload);
    });

    it('應該在令牌類型錯誤時返回 null', () => {
      // Arrange
      const mockPayload: JWTPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        type: 'refresh', // 錯誤的類型
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      // Act
      const result = JWTUtils.verifyAccessToken('invalid-type-token');

      // Assert
      expect(result).toBeNull();
    });

    it('應該在令牌無效時返回 null', () => {
      // Arrange
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      const result = JWTUtils.verifyAccessToken('invalid-token');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('應該成功驗證有效的刷新令牌', () => {
      // Arrange
      const mockPayload: JWTPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      // Act
      const result = JWTUtils.verifyRefreshToken('valid-refresh-token');

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-refresh-token',
        expect.any(String),
        {
          issuer: 'health-nutrition-tracker',
          audience: 'health-nutrition-tracker-users'
        }
      );
      expect(result).toEqual(mockPayload);
    });

    it('應該在令牌類型錯誤時返回 null', () => {
      // Arrange
      const mockPayload: JWTPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        type: 'access', // 錯誤的類型
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      // Act
      const result = JWTUtils.verifyRefreshToken('invalid-type-token');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('generateTokenPair', () => {
    it('應該生成存取令牌和刷新令牌對', () => {
      // Arrange
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');

      // Act
      const tokens = JWTUtils.generateTokenPair(mockUser);

      // Assert
      expect(tokens).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });
      expect(jwt.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('isTokenExpiringSoon', () => {
    it('應該在令牌即將過期時返回 true', () => {
      // Arrange
      const soonToExpirePayload = {
        exp: Math.floor(Date.now() / 1000) + 900 // 15分鐘後過期
      };
      (jwt.decode as jest.Mock).mockReturnValue(soonToExpirePayload);

      // Act
      const result = JWTUtils.isTokenExpiringSoon('soon-to-expire-token');

      // Assert
      expect(result).toBe(true);
    });

    it('應該在令牌還有很長時間才過期時返回 false', () => {
      // Arrange
      const longLivedPayload = {
        exp: Math.floor(Date.now() / 1000) + 7200 // 2小時後過期
      };
      (jwt.decode as jest.Mock).mockReturnValue(longLivedPayload);

      // Act
      const result = JWTUtils.isTokenExpiringSoon('long-lived-token');

      // Assert
      expect(result).toBe(false);
    });

    it('應該在無法解碼令牌時返回 true', () => {
      // Arrange
      (jwt.decode as jest.Mock).mockReturnValue(null);

      // Act
      const result = JWTUtils.isTokenExpiringSoon('invalid-token');

      // Assert
      expect(result).toBe(true);
    });
  });
});