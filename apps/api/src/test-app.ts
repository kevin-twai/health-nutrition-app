import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// 建立一個輕量的測試應用程式，不包含複雜的監控和定時器
const testApp = express();

// 基礎中間件
testApp.use(helmet());
testApp.use(cors());
testApp.use(express.json());

// 健康檢查端點
testApp.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'health-nutrition-tracker-api',
    version: '1.0.0'
  });
});

// API 根端點
testApp.get('/api/v1', (req, res) => {
  res.json({
    message: '健康營養追蹤系統 API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health'
    }
  });
});

// 404 處理
testApp.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

export default testApp;