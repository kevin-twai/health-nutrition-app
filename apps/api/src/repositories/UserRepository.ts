import { Pool } from 'pg';
import Redis from 'ioredis';
import bcrypt from 'bcryptjs';
import { User, UserProfile, HealthGoal, UserPreferences } from '../types/shared';
import { 
  PostgreSQLBaseRepository, 
  QueryOptions, 
  PaginatedResult, 
  NotFoundError, 
  DuplicateError,
  ValidationError 
} from './BaseRepository';

// 用戶資料庫實體介面
interface UserEntity {
  id: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  email_verified: boolean;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// 用戶檔案實體介面
interface UserProfileEntity {
  id: string;
  user_id: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  activity_level?: string;
  avatar_url?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

// 健康目標實體介面
interface HealthGoalEntity {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: string;
  target: number;
  current_value: number;
  unit: string;
  start_date: Date;
  deadline?: Date;
  status: string;
  priority: number;
  created_at: Date;
  updated_at: Date;
}

// 用戶偏好實體介面
interface UserPreferencesEntity {
  id: string;
  user_id: string;
  language: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  weekly_report_notifications: boolean;
  achievement_notifications: boolean;
  data_sharing: boolean;
  analytics: boolean;
  third_party_integration: boolean;
  profile_visibility: string;
  created_at: Date;
  updated_at: Date;
}

// 完整用戶資料介面
interface CompleteUserData extends UserEntity {
  profile?: UserProfileEntity;
  preferences?: UserPreferencesEntity;
  health_goals?: HealthGoalEntity[];
}

export class UserRepository extends PostgreSQLBaseRepository<User> {
  constructor(pool: Pool, redis?: Redis) {
    super(pool, 'users', redis);
  }

  // 根據 ID 查找用戶
  async findById(id: string): Promise<User | null> {
    // 先檢查快取
    const cached = await this.getFromCache(`user:${id}`);
    if (cached) {
      return cached as User;
    }

    const query = `
      SELECT 
        u.*,
        up.name, up.age, up.gender, up.height, up.weight, up.activity_level, up.avatar_url, up.bio,
        upr.language, upr.timezone, upr.email_notifications, upr.push_notifications, 
        upr.sms_notifications, upr.weekly_report_notifications, upr.achievement_notifications,
        upr.data_sharing, upr.analytics, upr.third_party_integration, upr.profile_visibility
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN user_preferences upr ON u.id = upr.user_id
      WHERE u.id = $1 AND u.is_active = true
    `;

    const result = await this.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const userData = result.rows[0];
    const user = this.mapToUser(userData);

    // 獲取健康目標
    user.healthGoals = await this.findHealthGoalsByUserId(id);

    // 快取結果
    await this.setCache(`user:${id}`, user, 1800); // 30分鐘

    return user;
  }

  // 根據電子郵件查找用戶
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT 
        u.*,
        up.name, up.age, up.gender, up.height, up.weight, up.activity_level, up.avatar_url, up.bio,
        upr.language, upr.timezone, upr.email_notifications, upr.push_notifications, 
        upr.sms_notifications, upr.weekly_report_notifications, upr.achievement_notifications,
        upr.data_sharing, upr.analytics, upr.third_party_integration, upr.profile_visibility
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN user_preferences upr ON u.id = upr.user_id
      WHERE u.email = $1 AND u.is_active = true
    `;

    const result = await this.query(query, [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const userData = result.rows[0];
    const user = this.mapToUser(userData);
    user.healthGoals = await this.findHealthGoalsByUserId(user.id);

    return user;
  }

  // 查找所有用戶
  async findAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    const query = `
      SELECT 
        u.*,
        up.name, up.age, up.gender, up.height, up.weight, up.activity_level, up.avatar_url, up.bio,
        upr.language, upr.timezone, upr.email_notifications, upr.push_notifications, 
        upr.sms_notifications, upr.weekly_report_notifications, upr.achievement_notifications,
        upr.data_sharing, upr.analytics, upr.third_party_integration, upr.profile_visibility
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN user_preferences upr ON u.id = upr.user_id
      WHERE u.is_active = true
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await this.query(query, [limit, offset]);
    const users: User[] = [];

    for (const userData of result.rows) {
      const user = this.mapToUser(userData);
      user.healthGoals = await this.findHealthGoalsByUserId(user.id);
      users.push(user);
    }

    return users;
  }

  // 建立新用戶
  async createUser(userData: {
    email: string;
    password: string;
    profile?: Partial<UserProfile>;
    preferences?: Partial<UserPreferences>;
  }): Promise<User> {
    // 檢查電子郵件是否已存在
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new DuplicateError('User', 'email', userData.email);
    }

    // 加密密碼
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    return await this.transaction(async (client) => {
      // 建立用戶
      const userQuery = `
        INSERT INTO users (email, password_hash, is_active, email_verified)
        VALUES ($1, $2, true, false)
        RETURNING *
      `;
      
      const userResult = await client.query(userQuery, [
        userData.email.toLowerCase(),
        passwordHash
      ]);
      
      const newUser = userResult.rows[0];

      // 建立用戶檔案
      if (userData.profile) {
        const profileQuery = `
          INSERT INTO user_profiles (user_id, name, age, gender, height, weight, activity_level, avatar_url, bio)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        
        await client.query(profileQuery, [
          newUser.id,
          userData.profile.name || '',
          userData.profile.age,
          userData.profile.gender,
          userData.profile.height,
          userData.profile.weight,
          userData.profile.activityLevel,
          null, // avatar_url
          null  // bio
        ]);
      }

      // 建立用戶偏好設定
      const preferences = userData.preferences || {};
      const preferencesQuery = `
        INSERT INTO user_preferences (
          user_id, language, timezone, email_notifications, push_notifications,
          sms_notifications, weekly_report_notifications, achievement_notifications,
          data_sharing, analytics, third_party_integration, profile_visibility
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `;
      
      await client.query(preferencesQuery, [
        newUser.id,
        preferences.language || 'zh-TW',
        preferences.timezone || 'Asia/Taipei',
        preferences.notifications?.email ?? true,
        preferences.notifications?.push ?? true,
        preferences.notifications?.sms ?? false,
        preferences.notifications?.weeklyReport ?? true,
        preferences.notifications?.achievements ?? true,
        preferences.privacy?.dataSharing ?? false,
        preferences.privacy?.analytics ?? true,
        preferences.privacy?.thirdPartyIntegration ?? true,
        'private'
      ]);

      // 建立用戶等級記錄
      const levelQuery = `
        INSERT INTO user_levels (user_id, level, experience_points, total_points, streak_days, last_activity_date)
        VALUES ($1, 1, 0, 0, 0, CURRENT_DATE)
      `;
      
      await client.query(levelQuery, [newUser.id]);

      return await this.findById(newUser.id) as User;
    });
  }

  // 更新用戶
  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }

    return await this.transaction(async (client) => {
      // 更新用戶基本資訊
      if (updateData.email) {
        const userQuery = `
          UPDATE users 
          SET email = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `;
        await client.query(userQuery, [updateData.email.toLowerCase(), id]);
      }

      // 更新用戶檔案
      if (updateData.profile) {
        const profileQuery = `
          UPDATE user_profiles 
          SET name = COALESCE($1, name),
              age = COALESCE($2, age),
              gender = COALESCE($3, gender),
              height = COALESCE($4, height),
              weight = COALESCE($5, weight),
              activity_level = COALESCE($6, activity_level),
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $7
        `;
        
        await client.query(profileQuery, [
          updateData.profile.name,
          updateData.profile.age,
          updateData.profile.gender,
          updateData.profile.height,
          updateData.profile.weight,
          updateData.profile.activityLevel,
          id
        ]);
      }

      // 更新用戶偏好
      if (updateData.preferences) {
        const preferencesQuery = `
          UPDATE user_preferences 
          SET language = COALESCE($1, language),
              timezone = COALESCE($2, timezone),
              email_notifications = COALESCE($3, email_notifications),
              push_notifications = COALESCE($4, push_notifications),
              sms_notifications = COALESCE($5, sms_notifications),
              weekly_report_notifications = COALESCE($6, weekly_report_notifications),
              achievement_notifications = COALESCE($7, achievement_notifications),
              data_sharing = COALESCE($8, data_sharing),
              analytics = COALESCE($9, analytics),
              third_party_integration = COALESCE($10, third_party_integration),
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $11
        `;
        
        await client.query(preferencesQuery, [
          updateData.preferences.language,
          updateData.preferences.timezone,
          updateData.preferences.notifications?.email,
          updateData.preferences.notifications?.push,
          updateData.preferences.notifications?.sms,
          updateData.preferences.notifications?.weeklyReport,
          updateData.preferences.notifications?.achievements,
          updateData.preferences.privacy?.dataSharing,
          updateData.preferences.privacy?.analytics,
          updateData.preferences.privacy?.thirdPartyIntegration,
          id
        ]);
      }

      // 清除快取
      await this.deleteFromCache(`user:${id}`);

      return await this.findById(id);
    });
  }

  // 軟刪除用戶
  async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
    `;

    const result = await this.query(query, [id]);
    
    if (result.rowCount === 0) {
      return false;
    }

    // 清除快取
    await this.deleteFromCache(`user:${id}`);
    
    return true;
  }

  // 驗證用戶密碼
  async validatePassword(email: string, password: string): Promise<User | null> {
    const query = `
      SELECT * FROM users 
      WHERE email = $1 AND is_active = true
    `;

    const result = await this.query(query, [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const userData = result.rows[0];
    const isValid = await bcrypt.compare(password, userData.password_hash);
    
    if (!isValid) {
      return null;
    }

    // 更新最後登入時間
    await this.updateLastLogin(userData.id);

    return await this.findById(userData.id);
  }

  // 更新最後登入時間
  async updateLastLogin(id: string): Promise<void> {
    const query = `
      UPDATE users 
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await this.query(query, [id]);
    
    // 清除快取
    await this.deleteFromCache(`user:${id}`);
  }

  // 查找用戶的健康目標
  async findHealthGoalsByUserId(userId: string): Promise<HealthGoal[]> {
    const query = `
      SELECT * FROM health_goals 
      WHERE user_id = $1 
      ORDER BY priority DESC, created_at DESC
    `;

    const result = await this.query(query, [userId]);
    
    return result.rows.map((row: HealthGoalEntity) => ({
      id: row.id,
      type: row.type as any,
      target: row.target,
      current: row.current_value,
      deadline: row.deadline,
      status: row.status as any
    }));
  }

  // 新增健康目標
  async addHealthGoal(userId: string, goalData: Omit<HealthGoal, 'id'>): Promise<HealthGoal> {
    const query = `
      INSERT INTO health_goals (user_id, title, description, type, target, current_value, unit, deadline, status, priority)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await this.query(query, [
      userId,
      `${goalData.type} 目標`, // 預設標題
      null, // 描述
      goalData.type,
      goalData.target,
      goalData.current,
      'kg', // 預設單位
      goalData.deadline,
      goalData.status,
      1 // 預設優先級
    ]);

    const newGoal = result.rows[0];
    
    // 清除用戶快取
    await this.deleteFromCache(`user:${userId}`);

    return {
      id: newGoal.id,
      type: newGoal.type,
      target: newGoal.target,
      current: newGoal.current_value,
      deadline: newGoal.deadline,
      status: newGoal.status
    };
  }

  // 更新健康目標
  async updateHealthGoal(goalId: string, updateData: Partial<HealthGoal>): Promise<HealthGoal | null> {
    const query = `
      UPDATE health_goals 
      SET type = COALESCE($1, type),
          target = COALESCE($2, target),
          current_value = COALESCE($3, current_value),
          deadline = COALESCE($4, deadline),
          status = COALESCE($5, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const result = await this.query(query, [
      updateData.type,
      updateData.target,
      updateData.current,
      updateData.deadline,
      updateData.status,
      goalId
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    const updatedGoal = result.rows[0];
    
    // 清除相關快取
    await this.deleteCachePattern(`user:*`);

    return {
      id: updatedGoal.id,
      type: updatedGoal.type,
      target: updatedGoal.target,
      current: updatedGoal.current_value,
      deadline: updatedGoal.deadline,
      status: updatedGoal.status
    };
  }

  // 公開查詢方法供 AuthService 使用
  async executeQuery(text: string, params?: any[]): Promise<any> {
    return await this.query(text, params);
  }

  // 實作基礎類別要求的 create 方法
  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // 這個方法不會被直接使用，因為我們有專門的 createUser 方法
    throw new Error('請使用 createUser 方法來建立用戶');
  }

  // 分頁查詢用戶
  async findWithPagination(options: QueryOptions): Promise<PaginatedResult<User>> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const page = Math.floor(offset / limit) + 1;

    // 計算總數
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM users 
      WHERE is_active = true
    `;
    
    const countResult = await this.query(countQuery);
    const total = parseInt(countResult.rows[0].total);

    // 獲取資料
    const users = await this.findAll(limit, offset);

    return {
      data: users,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      hasNext: offset + limit < total,
      hasPrev: offset > 0
    };
  }

  // 將資料庫記錄映射為 User 物件
  private mapToUser(userData: any): User {
    return {
      id: userData.id,
      email: userData.email,
      profile: {
        name: userData.name || '',
        age: userData.age || 0,
        gender: userData.gender || 'other',
        height: userData.height || 0,
        weight: userData.weight || 0,
        activityLevel: userData.activity_level || 'sedentary'
      },
      preferences: {
        language: userData.language || 'zh-TW',
        timezone: userData.timezone || 'Asia/Taipei',
        notifications: {
          email: userData.email_notifications ?? true,
          push: userData.push_notifications ?? true,
          sms: userData.sms_notifications ?? false,
          weeklyReport: userData.weekly_report_notifications ?? true,
          achievements: userData.achievement_notifications ?? true
        },
        privacy: {
          dataSharing: userData.data_sharing ?? false,
          analytics: userData.analytics ?? true,
          thirdPartyIntegration: userData.third_party_integration ?? true
        }
      },
      healthGoals: [], // 會在後續填入
      createdAt: userData.created_at,
      updatedAt: userData.updated_at
    };
  }
}