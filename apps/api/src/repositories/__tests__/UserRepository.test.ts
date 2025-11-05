import { Pool } from 'pg';
import Redis from 'ioredis';
import { UserRepository } from '../UserRepository';
import { ActivityLevel, GoalType, GoalStatus } from '@health-tracker/shared-types';

// Mock dependencies
jest.mock('pg');
jest.mock('ioredis');
jest.mock('bcryptjs');

const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
} as unknown as Pool;

const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
} as unknown as Redis;

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository(mockPool, mockRedis);
  });

  describe('findById', () => {
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
    const mockUserData = {
      id: mockUserId,
      email: 'test@example.com',
      password_hash: 'hashed_password',
      is_active: true,
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
      name: '張三',
      age: 30,
      gender: 'male',
      height: 175,
      weight: 70,
      activity_level: 'moderately_active',
      language: 'zh-TW',
      timezone: 'Asia/Taipei',
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      weekly_report_notifications: true,
      achievement_notifications: true,
      data_sharing: false,
      analytics: true,
      third_party_integration: true,
      profile_visibility: 'private'
    };

    it('應該從快取返回用戶資料', async () => {
      const cachedUser = {
        id: mockUserId,
        email: 'test@example.com',
        profile: { name: '張三' },
        preferences: {},
        healthGoals: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockRedis.get as jest.Mock).mockResolvedValue(JSON.stringify(cachedUser));

      const result = await userRepository.findById(mockUserId);

      expect(result).toEqual(cachedUser);
      expect(mockRedis.get).toHaveBeenCalledWith(`users:user:${mockUserId}`);
      expect(mockPool.query).not.toHaveBeenCalled();
    });

    it('應該從資料庫查詢用戶資料', async () => {
      (mockRedis.get as jest.Mock).mockResolvedValue(null);
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockUserData] }) // 主查詢
        .mockResolvedValueOnce({ rows: [] }); // 健康目標查詢

      const result = await userRepository.findById(mockUserId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(mockUserId);
      expect(result?.email).toBe('test@example.com');
      expect(result?.profile.name).toBe('張三');
      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('應該在用戶不存在時返回 null', async () => {
      (mockRedis.get as jest.Mock).mockResolvedValue(null);
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await userRepository.findById(mockUserId);

      expect(result).toBeNull();
    });

    it('應該處理資料庫錯誤', async () => {
      (mockRedis.get as jest.Mock).mockResolvedValue(null);
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findById(mockUserId)).rejects.toThrow('Database error');
    });
  });

  describe('findByEmail', () => {
    const mockEmail = 'test@example.com';
    const mockUserData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: mockEmail,
      password_hash: 'hashed_password',
      is_active: true,
      name: '張三',
      age: 30,
      gender: 'male',
      height: 175,
      weight: 70,
      activity_level: 'moderately_active'
    };

    it('應該根據電子郵件查找用戶', async () => {
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockUserData] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await userRepository.findByEmail(mockEmail);

      expect(result).toBeDefined();
      expect(result?.email).toBe(mockEmail);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE u.email = $1'),
        [mockEmail.toLowerCase()]
      );
    });

    it('應該將電子郵件轉換為小寫', async () => {
      const upperCaseEmail = 'TEST@EXAMPLE.COM';
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockUserData] })
        .mockResolvedValueOnce({ rows: [] });

      await userRepository.findByEmail(upperCaseEmail);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        [upperCaseEmail.toLowerCase()]
      );
    });

    it('應該在用戶不存在時返回 null', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await userRepository.findByEmail(mockEmail);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const mockUserData = {
      email: 'newuser@example.com',
      password: 'Password123!',
      profile: {
        name: '新用戶',
        age: 25,
        gender: 'female' as const,
        height: 160,
        weight: 55,
        activityLevel: ActivityLevel.LIGHTLY_ACTIVE
      }
    };

    beforeEach(() => {
      // Mock bcrypt
      const bcrypt = require('bcryptjs');
      bcrypt.hash = jest.fn().mockResolvedValue('hashed_password');
    });

    it('應該建立新用戶', async () => {
      const mockNewUser = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: mockUserData.email,
        password_hash: 'hashed_password',
        is_active: true,
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Mock 檢查用戶是否存在
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      // Mock 事務
      (mockPool.connect as jest.Mock).mockResolvedValue(mockClient);
      (mockClient.query as jest.Mock)
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [mockNewUser] }) // INSERT user
        .mockResolvedValueOnce(undefined) // INSERT profile
        .mockResolvedValueOnce(undefined) // INSERT preferences
        .mockResolvedValueOnce(undefined) // INSERT progress
        .mockResolvedValueOnce(undefined); // COMMIT

      // Mock findById 返回完整用戶資料
      const completeUser = {
        id: mockNewUser.id,
        email: mockNewUser.email,
        profile: mockUserData.profile,
        preferences: expect.any(Object),
        healthGoals: [],
        createdAt: mockNewUser.created_at,
        updatedAt: mockNewUser.updated_at
      };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(completeUser);

      const result = await userRepository.create(mockUserData);

      expect(result).toBeDefined();
      expect(result.email).toBe(mockUserData.email);
      expect(result.profile.name).toBe(mockUserData.profile.name);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('應該拒絕重複的電子郵件', async () => {
      const existingUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: mockUserData.email,
        profile: {},
        preferences: {},
        healthGoals: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(existingUser);

      await expect(userRepository.create(mockUserData)).rejects.toThrow('already exists');
    });

    it('應該在事務失敗時回滾', async () => {
      // Mock 檢查用戶不存在
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

      // Mock 事務失敗
      (mockPool.connect as jest.Mock).mockResolvedValue(mockClient);
      (mockClient.query as jest.Mock)
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockRejectedValueOnce(new Error('Insert failed')); // INSERT user fails

      await expect(userRepository.create(mockUserData)).rejects.toThrow('Insert failed');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
    const mockUpdateData = {
      email: 'updated@example.com',
      profile: {
        name: '更新的名字',
        age: 31,
        gender: 'male' as const,
        height: 176,
        weight: 72,
        activityLevel: ActivityLevel.VERY_ACTIVE
      }
    };

    it('應該更新用戶資料', async () => {
      const existingUser = {
        id: mockUserId,
        email: 'old@example.com',
        profile: { name: '舊名字' },
        preferences: {},
        healthGoals: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedUser = {
        ...existingUser,
        email: mockUpdateData.email,
        profile: mockUpdateData.profile
      };

      jest.spyOn(userRepository, 'findById')
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(updatedUser);

      // Mock 事務
      (mockPool.connect as jest.Mock).mockResolvedValue(mockClient);
      (mockClient.query as jest.Mock)
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce(undefined) // UPDATE users
        .mockResolvedValueOnce(undefined) // UPDATE user_profiles
        .mockResolvedValueOnce(undefined); // COMMIT

      const result = await userRepository.update(mockUserId, mockUpdateData);

      expect(result).toBeDefined();
      expect(result?.email).toBe(mockUpdateData.email);
      expect(result?.profile.name).toBe(mockUpdateData.profile.name);
      expect(mockRedis.del).toHaveBeenCalledWith(`users:user:${mockUserId}`);
    });

    it('應該在用戶不存在時拋出錯誤', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      await expect(userRepository.update(mockUserId, mockUpdateData))
        .rejects.toThrow('not found');
    });
  });

  describe('delete', () => {
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000';

    it('應該軟刪除用戶', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      const result = await userRepository.delete(mockUserId);

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET is_active = false'),
        [mockUserId]
      );
      expect(mockRedis.del).toHaveBeenCalledWith(`users:user:${mockUserId}`);
    });

    it('應該在用戶不存在時返回 false', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

      const result = await userRepository.delete(mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('validatePassword', () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'Password123!';
    const mockUserData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: mockEmail,
      password_hash: 'hashed_password',
      is_active: true
    };

    beforeEach(() => {
      const bcrypt = require('bcryptjs');
      bcrypt.compare = jest.fn();
    });

    it('應該驗證正確的密碼', async () => {
      const bcrypt = require('bcryptjs');
      bcrypt.compare.mockResolvedValue(true);

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockUserData] }) // 查找用戶
        .mockResolvedValueOnce(undefined); // 更新最後登入時間

      const completeUser = {
        id: mockUserData.id,
        email: mockUserData.email,
        profile: {},
        preferences: {},
        healthGoals: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(userRepository, 'findById').mockResolvedValue(completeUser);

      const result = await userRepository.validatePassword(mockEmail, mockPassword);

      expect(result).toBeDefined();
      expect(result?.email).toBe(mockEmail);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockUserData.password_hash);
    });

    it('應該拒絕錯誤的密碼', async () => {
      const bcrypt = require('bcryptjs');
      bcrypt.compare.mockResolvedValue(false);

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockUserData] });

      const result = await userRepository.validatePassword(mockEmail, 'wrong_password');

      expect(result).toBeNull();
    });

    it('應該在用戶不存在時返回 null', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await userRepository.validatePassword(mockEmail, mockPassword);

      expect(result).toBeNull();
    });
  });

  describe('addHealthGoal', () => {
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
    const mockGoalData = {
      type: GoalType.WEIGHT_LOSS,
      target: 65,
      current: 70,
      deadline: new Date('2024-12-31'),
      status: GoalStatus.ACTIVE
    };

    it('應該新增健康目標', async () => {
      const mockNewGoal = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        user_id: mockUserId,
        type: mockGoalData.type,
        target: mockGoalData.target,
        current_value: mockGoalData.current,
        deadline: mockGoalData.deadline,
        status: mockGoalData.status
      };

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockNewGoal] });

      const result = await userRepository.addHealthGoal(mockUserId, mockGoalData);

      expect(result).toBeDefined();
      expect(result.type).toBe(mockGoalData.type);
      expect(result.target).toBe(mockGoalData.target);
      expect(mockRedis.del).toHaveBeenCalledWith(`users:user:${mockUserId}`);
    });
  });

  describe('updateHealthGoal', () => {
    const mockGoalId = '550e8400-e29b-41d4-a716-446655440001';
    const mockUpdateData = {
      target: 63,
      current: 68,
      status: GoalStatus.COMPLETED
    };

    it('應該更新健康目標', async () => {
      const mockUpdatedGoal = {
        id: mockGoalId,
        type: GoalType.WEIGHT_LOSS,
        target: mockUpdateData.target,
        current_value: mockUpdateData.current,
        deadline: new Date('2024-12-31'),
        status: mockUpdateData.status
      };

      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [mockUpdatedGoal] });

      const result = await userRepository.updateHealthGoal(mockGoalId, mockUpdateData);

      expect(result).toBeDefined();
      expect(result?.target).toBe(mockUpdateData.target);
      expect(result?.current).toBe(mockUpdateData.current);
      expect(result?.status).toBe(mockUpdateData.status);
    });

    it('應該在目標不存在時返回 null', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await userRepository.updateHealthGoal(mockGoalId, mockUpdateData);

      expect(result).toBeNull();
    });
  });

  describe('findWithPagination', () => {
    it('應該返回分頁結果', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          profile: {},
          preferences: {},
          healthGoals: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          email: 'user2@example.com',
          profile: {},
          preferences: {},
          healthGoals: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ total: '10' }] }) // 總數查詢
        .mockResolvedValueOnce({ rows: [] }) // findAll 會被調用

      jest.spyOn(userRepository, 'findAll').mockResolvedValue(mockUsers);

      const result = await userRepository.findWithPagination({
        limit: 2,
        offset: 0
      });

      expect(result.data).toEqual(mockUsers);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(5);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(false);
    });
  });
});