import { JWTUtils } from '../utils/jwt';
import { User } from '../types/shared';

describe('認證系統基本功能測試', () => {
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

  describe('JWT 工具', () => {
    it('應該能生成存取令牌', () => {
      const token = JWTUtils.generateAccessToken(mockUser);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('應該能生成刷新令牌', () => {
      const token = JWTUtils.generateRefreshToken(mockUser);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('應該能生成令牌對', () => {
      const tokens = JWTUtils.generateTokenPair(mockUser);
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });
  });
});