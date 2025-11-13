import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { createHash } from 'crypto';

// API 版本管理中間件
export const apiVersioning = (req: Request, res: Response, next: NextFunction) => {
  // 從 URL 路徑提取版本
  const versionMatch = req.path.match(/^\/api\/v(\d+)\//);
  const version = versionMatch ? parseInt(versionMatch[1]) : 1;
  
  // 設定 API 版本到請求物件
  req.apiVersion = version;
  
  // 添加版本標頭到回應
  res.setHeader('API-Version', `v${version}`);
  
  // 檢查支援的版本
  const supportedVersions = [1];
  if (!supportedVersions.includes(version)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UNSUPPORTED_API_VERSION',
        message: `API version v${version} is not supported. Supported versions: ${supportedVersions.map(v => `v${v}`).join(', ')}`,
        supportedVersions: supportedVersions.map(v => `v${v}`)
      }
    });
  }
  
  next();
};

// 請求 ID 生成中間件
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || 
                   createHash('md5').update(`${Date.now()}-${Math.random()}`).digest('hex').substring(0, 16);
  
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

// API 金鑰驗證中間件 (可選)
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  // 如果沒有配置 API 金鑰，則跳過驗證
  if (validApiKeys.length === 0) {
    return next();
  }
  
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_API_KEY',
        message: 'Valid API key is required'
      }
    });
  }
  
  next();
};

// 進階 Rate Limiting 配置
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: options.message || 'Too many requests, please try again later.'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    keyGenerator: (req) => {
      // 使用 IP 和用戶 ID (如果有) 作為限制鍵
      const userId = req.user?.id || 'anonymous';
      return `${req.ip}-${userId}`;
    }
  });
};

// 慢速回應中間件 (防止暴力攻擊)
export const createSlowDown = (options: {
  windowMs: number;
  delayAfter: number;
  delayMs: number;
}) => {
  return slowDown({
    windowMs: options.windowMs,
    delayAfter: options.delayAfter,
    delayMs: () => options.delayMs, // 修復 express-slow-down v2 警告
    validate: { delayMs: false }, // 禁用警告
    keyGenerator: (req) => {
      const userId = req.user?.id || 'anonymous';
      return `${req.ip}-${userId}`;
    }
  });
};

// 安全標頭中間件
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // 防止點擊劫持
  res.setHeader('X-Frame-Options', 'DENY');
  
  // 防止 MIME 類型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS 保護
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // 引用者政策
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 內容安全政策 (基本設定)
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  // 權限政策
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// IP 白名單中間件 (可選)
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || '';
    
    if (allowedIPs.length === 0 || allowedIPs.includes(clientIP)) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      error: {
        code: 'IP_NOT_ALLOWED',
        message: 'Access denied from this IP address'
      }
    });
  };
};

// 請求大小限制中間件
export const requestSizeLimit = (maxSize: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxBytes = parseSize(maxSize);
    
    if (contentLength > maxBytes) {
      return res.status(413).json({
        success: false,
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `Request size exceeds limit of ${maxSize}`
        }
      });
    }
    
    next();
  };
};

// 輔助函數：解析大小字串 (如 "10MB", "1GB")
function parseSize(size: string): number {
  const units: { [key: string]: number } = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024
  };
  
  const match = size.match(/^(\d+(?:\.\d+)?)\s*([A-Z]{1,2})$/i);
  if (!match) {
    throw new Error(`Invalid size format: ${size}`);
  }
  
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  
  return Math.floor(value * (units[unit] || 1));
}

// 健康檢查中間件
export const healthCheck = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/health') {
    // 跳過所有其他中間件，直接處理健康檢查
    return next();
  }
  next();
};

// API Gateway 主要配置
export const apiGatewayConfig = {
  // 認證端點的嚴格限制
  auth: {
    rateLimit: createRateLimiter({
      windowMs: 15 * 60 * 1000, // 15 分鐘
      max: 5, // 每 15 分鐘最多 5 次請求
      message: 'Too many authentication attempts, please try again later.'
    }),
    slowDown: createSlowDown({
      windowMs: 15 * 60 * 1000,
      delayAfter: 2,
      delayMs: 500
    })
  },
  
  // 照片上傳的特殊限制
  photo: {
    rateLimit: createRateLimiter({
      windowMs: 60 * 1000, // 1 分鐘
      max: 10, // 每分鐘最多 10 次上傳
      message: 'Too many photo uploads, please try again later.'
    }),
    sizeLimit: requestSizeLimit('20MB')
  },
  
  // 一般 API 的限制
  general: {
    rateLimit: createRateLimiter({
      windowMs: 15 * 60 * 1000, // 15 分鐘
      max: 1000, // 每 15 分鐘最多 1000 次請求
      skipSuccessfulRequests: true
    })
  }
};

import { User } from '../types/shared';

// 擴展 Express Request 介面
declare global {
  namespace Express {
    interface Request {
      apiVersion?: number;
      requestId?: string;
      user?: User;
    }
  }
}