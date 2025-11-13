import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, UserProfile, UserPreferences } from '@health-tracker/shared-types';
import { UserRepository } from '../repositories/UserRepository';
import { JWTUtils, JWTPayload } from '../utils/jwt';
import { UserModel } from '../models/User';
import Redis from 'ioredis';

// 認證相關錯誤類型
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// 註冊請求介面
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  profile?: {
    name: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    height?: number;
    weight?: number;
    activityLevel?: string;
  };
  preferences?: Partial<UserPreferences>;
}

// 登入請求介面
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 認證回應介面
export interface AuthResponse {
  user: Omit<User, 'password'>;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  expiresIn: number;
}

// OAuth 提供者介面
export interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

// 認證服務類
export class AuthService {
  private userRepository: UserRepository;
  private redis?: Redis;

  constructor(userRepository: UserRepository, redis?: Redis) {
    this.userRepository = userRepository;
    this.redis = redis;
  }

  // 用戶註冊
  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    // 驗證輸入資料
    const { error: validationError } = UserModel.validateRegistration({
      email: registerData.email,
      password: registerData.password
    });

    if (validationError) {
      throw new AuthError(
        validationError.details.map(d => d.message).join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    // 檢查密碼確認
    if (registerData.password !== registerData.confirmPassword) {
      throw new AuthError('密碼確認不符', 'PASSWORD_MISMATCH', 400);
    }

    // 驗證用戶檔案資料（如果提供）
    if (registerData.profile) {
      const { error: profileError } = UserModel.validateProfile(registerData.profile);
      if (profileError) {
        throw new AuthError(
          profileError.details.map(d => d.message).join(', '),
          'PROFILE_VALIDATION_ERROR',
          400
        );
      }
    }

    try {
      // 建立用戶
      const user = await this.userRepository.createUser({
        email: registerData.email,
        password: registerData.password,
        profile: registerData.profile as Partial<UserProfile>,
        preferences: registerData.preferences
      });

      // 生成令牌
      const tokens = JWTUtils.generateTokenPair(user);

      // 儲存刷新令牌到 Redis
      if (this.redis) {
        await this.redis.setex(
          `refresh_token:${user.id}`,
          30 * 24 * 60 * 60, // 30天
          tokens.refreshToken
        );
      }

      return {
        user: UserModel.serialize(user),
        tokens,
        expiresIn: this.getTokenExpirationTime()
      };
    } catch (error: any) {
      if (error.code === 'DUPLICATE_ERROR') {
        throw new AuthError('此電子郵件已被註冊', 'EMAIL_ALREADY_EXISTS', 409);
      }
      throw new AuthError('註冊失敗', 'REGISTRATION_FAILED', 500);
    }
  }

  // 用戶登入
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    // 驗證用戶憑證
    const user = await this.userRepository.validatePassword(
      loginData.email,
      loginData.password
    );

    if (!user) {
      throw new AuthError('電子郵件或密碼錯誤', 'INVALID_CREDENTIALS', 401);
    }

    // 生成令牌
    const tokens = JWTUtils.generateTokenPair(user);

    // 儲存刷新令牌到 Redis
    if (this.redis) {
      const expirationTime = loginData.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
      await this.redis.setex(
        `refresh_token:${user.id}`,
        expirationTime,
        tokens.refreshToken
      );
    }

    return {
      user: UserModel.serialize(user),
      tokens,
      expiresIn: this.getTokenExpirationTime()
    };
  }

  // 刷新令牌
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // 驗證刷新令牌
    const payload = JWTUtils.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new AuthError('無效的刷新令牌', 'INVALID_REFRESH_TOKEN', 401);
    }

    // 檢查 Redis 中的令牌
    if (this.redis) {
      const storedToken = await this.redis.get(`refresh_token:${payload.userId}`);
      if (storedToken !== refreshToken) {
        throw new AuthError('刷新令牌已失效', 'REFRESH_TOKEN_REVOKED', 401);
      }
    }

    // 獲取用戶資料
    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new AuthError('用戶不存在', 'USER_NOT_FOUND', 404);
    }

    // 生成新的令牌對
    const tokens = JWTUtils.generateTokenPair(user);

    // 更新 Redis 中的刷新令牌
    if (this.redis) {
      await this.redis.setex(
        `refresh_token:${user.id}`,
        30 * 24 * 60 * 60, // 30天
        tokens.refreshToken
      );
    }

    return {
      user: UserModel.serialize(user),
      tokens,
      expiresIn: this.getTokenExpirationTime()
    };
  }

  // 登出
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (this.redis) {
      // 從 Redis 中移除刷新令牌
      await this.redis.del(`refresh_token:${userId}`);
      
      // 如果提供了刷新令牌，將其加入黑名單
      if (refreshToken) {
        const payload = JWTUtils.decodeToken(refreshToken);
        if (payload && payload.exp) {
          const ttl = payload.exp - Math.floor(Date.now() / 1000);
          if (ttl > 0) {
            await this.redis.setex(`blacklist:${refreshToken}`, ttl, '1');
          }
        }
      }
    }
  }

  // 驗證存取令牌
  async verifyAccessToken(token: string): Promise<User | null> {
    // 檢查令牌是否在黑名單中
    if (this.redis) {
      const isBlacklisted = await this.redis.exists(`blacklist:${token}`);
      if (isBlacklisted) {
        return null;
      }
    }

    // 驗證令牌
    const payload = JWTUtils.verifyAccessToken(token);
    if (!payload) {
      return null;
    }

    // 獲取用戶資料
    const user = await this.userRepository.findById(payload.userId);
    return user;
  }

  // 忘記密碼
  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // 為了安全考量，即使用戶不存在也不回傳錯誤
      return;
    }

    // 生成重設密碼令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1小時後過期

    // 儲存重設令牌到資料庫
    await this.userRepository.executeQuery(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, user.id]
    );

    // 儲存到 Redis 以便快速查詢
    if (this.redis) {
      await this.redis.setex(`password_reset:${resetToken}`, 3600, user.id);
    }

    // TODO: 發送重設密碼郵件
    console.log(`密碼重設令牌: ${resetToken} (用戶: ${email})`);
  }

  // 重設密碼
  async resetPassword(token: string, newPassword: string): Promise<void> {
    let userId: string | null = null;

    // 先從 Redis 查詢
    if (this.redis) {
      userId = await this.redis.get(`password_reset:${token}`);
    }

    // 如果 Redis 中沒有，從資料庫查詢
    if (!userId) {
      const result = await this.userRepository.executeQuery(
        'SELECT id FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
        [token]
      );

      if (result.rows.length === 0) {
        throw new AuthError('無效或已過期的重設令牌', 'INVALID_RESET_TOKEN', 400);
      }

      userId = result.rows[0].id;
    }

    // 驗證新密碼
    const { error } = UserModel.validateRegistration({
      email: 'temp@example.com', // 暫時的電子郵件，只為了驗證密碼
      password: newPassword
    });

    if (error) {
      throw new AuthError(
        error.details.find(d => d.path.includes('password'))?.message || '密碼格式不正確',
        'INVALID_PASSWORD',
        400
      );
    }

    // 加密新密碼
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // 更新密碼並清除重設令牌
    await this.userRepository.executeQuery(
      `UPDATE users 
       SET password_hash = $1, 
           password_reset_token = NULL, 
           password_reset_expires = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, userId]
    );

    // 從 Redis 中移除重設令牌
    if (this.redis) {
      await this.redis.del(`password_reset:${token}`);
      // 移除用戶的所有刷新令牌，強制重新登入
      await this.redis.del(`refresh_token:${userId}`);
    }
  }

  // 變更密碼
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // 獲取用戶資料
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthError('用戶不存在', 'USER_NOT_FOUND', 404);
    }

    // 驗證當前密碼
    const result = await this.userRepository.executeQuery(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      result.rows[0].password_hash
    );

    if (!isCurrentPasswordValid) {
      throw new AuthError('當前密碼錯誤', 'INVALID_CURRENT_PASSWORD', 400);
    }

    // 驗證新密碼
    const { error } = UserModel.validateRegistration({
      email: user.email,
      password: newPassword
    });

    if (error) {
      throw new AuthError(
        error.details.find(d => d.path.includes('password'))?.message || '新密碼格式不正確',
        'INVALID_NEW_PASSWORD',
        400
      );
    }

    // 加密新密碼
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // 更新密碼
    await this.userRepository.executeQuery(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, userId]
    );

    // 移除所有刷新令牌，強制重新登入
    if (this.redis) {
      await this.redis.del(`refresh_token:${userId}`);
    }
  }

  // 電子郵件驗證
  async sendEmailVerification(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthError('用戶不存在', 'USER_NOT_FOUND', 404);
    }

    // 生成驗證令牌
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 儲存驗證令牌到資料庫
    await this.userRepository.executeQuery(
      'UPDATE users SET email_verification_token = $1 WHERE id = $2',
      [verificationToken, userId]
    );

    // 儲存到 Redis
    if (this.redis) {
      await this.redis.setex(`email_verification:${verificationToken}`, 24 * 3600, userId);
    }

    // TODO: 發送驗證郵件
    console.log(`電子郵件驗證令牌: ${verificationToken} (用戶: ${user.email})`);
  }

  // 驗證電子郵件
  async verifyEmail(token: string): Promise<void> {
    let userId: string | null = null;

    // 先從 Redis 查詢
    if (this.redis) {
      userId = await this.redis.get(`email_verification:${token}`);
    }

    // 如果 Redis 中沒有，從資料庫查詢
    if (!userId) {
      const result = await this.userRepository.executeQuery(
        'SELECT id FROM users WHERE email_verification_token = $1',
        [token]
      );

      if (result.rows.length === 0) {
        throw new AuthError('無效的驗證令牌', 'INVALID_VERIFICATION_TOKEN', 400);
      }

      userId = result.rows[0].id;
    }

    // 更新電子郵件驗證狀態
    await this.userRepository.executeQuery(
      `UPDATE users 
       SET email_verified = true, 
           email_verification_token = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId]
    );

    // 從 Redis 中移除驗證令牌
    if (this.redis) {
      await this.redis.del(`email_verification:${token}`);
    }
  }

  // 獲取令牌過期時間（秒）
  private getTokenExpirationTime(): number {
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    // 解析時間字符串
    const timeUnit = expiresIn.slice(-1);
    const timeValue = parseInt(expiresIn.slice(0, -1));
    
    switch (timeUnit) {
      case 's': return timeValue;
      case 'm': return timeValue * 60;
      case 'h': return timeValue * 60 * 60;
      case 'd': return timeValue * 24 * 60 * 60;
      default: return 7 * 24 * 60 * 60; // 預設 7 天
    }
  }
}