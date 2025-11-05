import { Request, Response, NextFunction } from 'express';
import { User } from '@health-tracker/shared-types';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { db } from '../database/connection';
import Redis from 'ioredis';

// 擴展 Express Request 介面以包含用戶資訊
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

// 認證中介軟體選項
interface AuthMiddlewareOptions {
  required?: boolean; // 是否必須認證
  roles?: string[]; // 允許的角色（未來擴展用）
}

// 建立認證中介軟體
export function createAuthMiddleware(redis?: Redis) {
  const userRepository = new UserRepository(db.getPool(), redis);
  const authService = new AuthService(userRepository, redis);

  // 認證中介軟體
  return function authMiddleware(options: AuthMiddlewareOptions = { required: true }) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // 從 Authorization header 獲取令牌
        const authHeader = req.headers.authorization;
        let token: string | null = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }

        // 如果沒有令牌且認證是必須的
        if (!token && options.required) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'MISSING_TOKEN',
              message: '缺少認證令牌'
            }
          });
        }

        // 如果有令牌，驗證它
        if (token) {
          const user = await authService.verifyAccessToken(token);
          
          if (!user && options.required) {
            return res.status(401).json({
              success: false,
              error: {
                code: 'INVALID_TOKEN',
                message: '無效的認證令牌'
              }
            });
          }

          if (user) {
            req.user = user;
            req.userId = user.id;
          }
        }

        next();
      } catch (error) {
        console.error('認證中介軟體錯誤:', error);
        
        if (options.required) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'AUTH_ERROR',
              message: '認證失敗'
            }
          });
        }

        next();
      }
    };
  };
}

// 必須認證的中介軟體
export function requireAuth(redis?: Redis) {
  const middleware = createAuthMiddleware(redis);
  return middleware({ required: true });
}

// 可選認證的中介軟體
export function optionalAuth(redis?: Redis) {
  const middleware = createAuthMiddleware(redis);
  return middleware({ required: false });
}

// 檢查用戶是否為管理員的中介軟體（未來擴展用）
export function requireAdmin(redis?: Redis) {
  const authMiddleware = requireAuth(redis);
  
  return [
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      // TODO: 實作管理員角色檢查
      // 目前暫時允許所有已認證用戶
      next();
    }
  ];
}

// 檢查用戶是否可以存取特定資源的中介軟體
export function requireOwnership(redis?: Redis) {
  const authMiddleware = requireAuth(redis);
  
  return [
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
      const resourceUserId = req.params.userId || req.body.userId;
      
      if (req.userId !== resourceUserId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '您沒有權限存取此資源'
          }
        });
      }
      
      next();
    }
  ];
}

// 速率限制中介軟體（基於用戶）
export function createUserRateLimit(redis?: Redis, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redis || !req.userId) {
      return next();
    }

    const key = `rate_limit:${req.userId}`;
    const window = Math.floor(Date.now() / windowMs);
    const windowKey = `${key}:${window}`;

    try {
      const current = await redis.incr(windowKey);
      
      if (current === 1) {
        await redis.expire(windowKey, Math.ceil(windowMs / 1000));
      }

      if (current > maxRequests) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: '請求過於頻繁，請稍後再試'
          }
        });
      }

      // 設定回應標頭
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, maxRequests - current).toString(),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });

      next();
    } catch (error) {
      console.error('速率限制錯誤:', error);
      next(); // 如果 Redis 出錯，不阻擋請求
    }
  };
}