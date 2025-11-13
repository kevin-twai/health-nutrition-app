import jwt from 'jsonwebtoken';
import { User } from '../types/shared';

// JWT 配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// JWT Payload 介面
export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

// JWT 工具類
export class JWTUtils {
  // 生成存取令牌
  static generateAccessToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      type: 'access'
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'health-nutrition-tracker',
      audience: 'health-nutrition-tracker-users'
    } as jwt.SignOptions);
  }

  // 生成刷新令牌
  static generateRefreshToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      type: 'refresh'
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'health-nutrition-tracker',
      audience: 'health-nutrition-tracker-users'
    } as jwt.SignOptions);
  }

  // 驗證存取令牌
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'health-nutrition-tracker',
        audience: 'health-nutrition-tracker-users'
      }) as JWTPayload;

      if (decoded.type !== 'access') {
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('存取令牌驗證失敗:', error);
      return null;
    }
  }

  // 驗證刷新令牌
  static verifyRefreshToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'health-nutrition-tracker',
        audience: 'health-nutrition-tracker-users'
      }) as JWTPayload;

      if (decoded.type !== 'refresh') {
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('刷新令牌驗證失敗:', error);
      return null;
    }
  }

  // 解碼令牌（不驗證）
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      console.error('令牌解碼失敗:', error);
      return null;
    }
  }

  // 檢查令牌是否即將過期（30分鐘內）
  static isTokenExpiringSoon(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const thirtyMinutes = 30 * 60;
    
    return decoded.exp - now < thirtyMinutes;
  }

  // 生成令牌對
  static generateTokenPair(user: User): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user)
    };
  }
}