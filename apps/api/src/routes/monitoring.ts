import { Router } from 'express';
import { HealthMonitor, AlertSystem } from '../middleware/monitoring';
import { performanceMonitor } from '../services/PerformanceMonitor';
import { checkAlarmStatus } from '../config/cloudwatch-alarms';
import { logger } from '../config/logging';
import { memoryMonitor } from '../utils/memoryMonitor';

const router = Router();

// 詳細的系統監控端點
router.get('/system', async (req, res) => {
  try {
    const healthMonitor = HealthMonitor.getInstance();
    const alertSystem = AlertSystem.getInstance();
    
    const systemMetrics = healthMonitor.getSystemMetrics();
    const healthChecks = await healthMonitor.runHealthChecks();
    const performanceStats = performanceMonitor.getPerformanceStats();
    const unresolvedAlerts = alertSystem.getUnresolvedAlerts();
    const slowestOperations = performanceMonitor.getSlowestOperations(5);
    const memoryStats = memoryMonitor.getMemoryStats();
    
    res.json({
      timestamp: new Date().toISOString(),
      service: 'health-nutrition-tracker-api',
      status: Object.values(healthChecks).every(check => check) ? 'healthy' : 'degraded',
      system: {
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
          rss: process.memoryUsage().rss
        },
        cpu: {
          usage: process.cpuUsage()
        },
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      health: healthChecks,
      metrics: systemMetrics,
      performance: performanceStats,
      memory: memoryStats,
      alerts: {
        unresolved: unresolvedAlerts.length,
        recent: unresolvedAlerts.slice(0, 10)
      },
      slowestOperations,
      requestId: req.requestId
    });
  } catch (error) {
    logger.error('系統監控端點錯誤', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'MONITORING_ERROR',
        message: 'Failed to retrieve system monitoring data',
        requestId: req.requestId
      }
    });
  }
});

// CloudWatch 警報狀態端點
router.get('/alarms', async (req, res) => {
  try {
    const alarmStates = await checkAlarmStatus();
    
    res.json({
      timestamp: new Date().toISOString(),
      service: 'health-nutrition-tracker-api',
      alarms: alarmStates,
      summary: {
        total: alarmStates.length,
        ok: alarmStates.filter(a => a.state === 'OK').length,
        alarm: alarmStates.filter(a => a.state === 'ALARM').length,
        insufficientData: alarmStates.filter(a => a.state === 'INSUFFICIENT_DATA').length
      },
      requestId: req.requestId
    });
  } catch (error) {
    logger.error('CloudWatch 警報狀態查詢失敗', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'ALARM_STATUS_ERROR',
        message: 'Failed to retrieve alarm status',
        requestId: req.requestId
      }
    });
  }
});

// 效能統計端點
router.get('/performance', (req, res) => {
  try {
    const timeWindow = parseInt(req.query.window as string) || 300000; // 預設 5 分鐘
    const limit = parseInt(req.query.limit as string) || 10;
    
    const performanceStats = performanceMonitor.getPerformanceStats(timeWindow);
    const slowestOperations = performanceMonitor.getSlowestOperations(limit);
    
    res.json({
      timestamp: new Date().toISOString(),
      service: 'health-nutrition-tracker-api',
      timeWindow: timeWindow / 1000, // 轉換為秒
      statistics: performanceStats,
      slowestOperations,
      requestId: req.requestId
    });
  } catch (error) {
    logger.error('效能統計端點錯誤', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'PERFORMANCE_ERROR',
        message: 'Failed to retrieve performance statistics',
        requestId: req.requestId
      }
    });
  }
});

// 警報管理端點
router.get('/alerts', (req, res) => {
  try {
    const alertSystem = AlertSystem.getInstance();
    const unresolvedAlerts = alertSystem.getUnresolvedAlerts();
    
    res.json({
      timestamp: new Date().toISOString(),
      service: 'health-nutrition-tracker-api',
      alerts: unresolvedAlerts,
      summary: {
        total: unresolvedAlerts.length,
        error: unresolvedAlerts.filter(a => a.type === 'error').length,
        warning: unresolvedAlerts.filter(a => a.type === 'warning').length,
        info: unresolvedAlerts.filter(a => a.type === 'info').length
      },
      requestId: req.requestId
    });
  } catch (error) {
    logger.error('警報查詢端點錯誤', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'ALERTS_ERROR',
        message: 'Failed to retrieve alerts',
        requestId: req.requestId
      }
    });
  }
});

// 解決警報端點
router.post('/alerts/:alertId/resolve', (req, res) => {
  try {
    const { alertId } = req.params;
    const alertSystem = AlertSystem.getInstance();
    
    alertSystem.resolveAlert(alertId);
    
    logger.info('警報已解決', { alertId, resolvedBy: req.user?.id });
    
    res.json({
      success: true,
      message: 'Alert resolved successfully',
      alertId,
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });
  } catch (error) {
    logger.error('解決警報失敗', { 
      error: error instanceof Error ? error.message : String(error), 
      alertId: req.params.alertId 
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'RESOLVE_ALERT_ERROR',
        message: 'Failed to resolve alert',
        requestId: req.requestId
      }
    });
  }
});

// 健康檢查詳細資訊端點
router.get('/health/detailed', async (req, res) => {
  try {
    const healthMonitor = HealthMonitor.getInstance();
    const healthChecks = await healthMonitor.runHealthChecks();
    
    // 執行額外的詳細檢查
    const detailedChecks = {
      ...healthChecks,
      diskSpace: await checkDiskSpace(),
      networkConnectivity: await checkNetworkConnectivity(),
      environmentVariables: checkEnvironmentVariables()
    };
    
    const overallHealth = Object.values(detailedChecks).every(check => check);
    
    res.json({
      timestamp: new Date().toISOString(),
      service: 'health-nutrition-tracker-api',
      status: overallHealth ? 'healthy' : 'unhealthy',
      checks: detailedChecks,
      summary: {
        total: Object.keys(detailedChecks).length,
        passed: Object.values(detailedChecks).filter(check => check).length,
        failed: Object.values(detailedChecks).filter(check => !check).length
      },
      requestId: req.requestId
    });
  } catch (error) {
    logger.error('詳細健康檢查失敗', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'DETAILED_HEALTH_CHECK_ERROR',
        message: 'Failed to perform detailed health check',
        requestId: req.requestId
      }
    });
  }
});

// 輔助函數：檢查磁碟空間
async function checkDiskSpace(): Promise<boolean> {
  try {
    const fs = require('fs').promises;
    const stats = await fs.statfs('.');
    const freeSpace = stats.bavail * stats.bsize;
    const totalSpace = stats.blocks * stats.bsize;
    const usagePercent = ((totalSpace - freeSpace) / totalSpace) * 100;
    
    return usagePercent < 90; // 磁碟使用率低於 90%
  } catch {
    return false;
  }
}

// 輔助函數：檢查網路連線
async function checkNetworkConnectivity(): Promise<boolean> {
  try {
    const dns = require('dns').promises;
    await dns.resolve('google.com');
    return true;
  } catch {
    return false;
  }
}

// 輔助函數：檢查環境變數
function checkEnvironmentVariables(): boolean {
  const requiredVars = [
    'NODE_ENV',
    'DATABASE_URL',
    'REDIS_URL'
  ];
  
  return requiredVars.every(varName => process.env[varName]);
}

// 記憶體管理端點
router.get('/memory', (req, res) => {
  try {
    const memoryStats = memoryMonitor.getMemoryStats();
    
    res.json({
      timestamp: new Date().toISOString(),
      service: 'health-nutrition-tracker-api',
      memory: memoryStats,
      requestId: req.requestId
    });
  } catch (error) {
    logger.error('記憶體統計端點錯誤', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'MEMORY_STATS_ERROR',
        message: 'Failed to retrieve memory statistics',
        requestId: req.requestId
      }
    });
  }
});

// 強制垃圾回收端點
router.post('/memory/gc', (req, res) => {
  try {
    if (!global.gc) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'GC_NOT_AVAILABLE',
          message: 'Garbage collection is not available. Start Node.js with --expose-gc flag.',
          requestId: req.requestId
        }
      });
    }

    const beforeGC = process.memoryUsage();
    global.gc();
    const afterGC = process.memoryUsage();
    
    const freed = beforeGC.heapUsed - afterGC.heapUsed;
    
    logger.info('手動垃圾回收執行', {
      freedMemory: Math.round(freed / 1024 / 1024),
      beforeGC: Math.round(beforeGC.heapUsed / 1024 / 1024),
      afterGC: Math.round(afterGC.heapUsed / 1024 / 1024),
      requestedBy: req.user?.id || 'anonymous'
    });

    res.json({
      success: true,
      message: 'Garbage collection executed successfully',
      result: {
        freedMemory: `${Math.round(freed / 1024 / 1024)}MB`,
        beforeGC: `${Math.round(beforeGC.heapUsed / 1024 / 1024)}MB`,
        afterGC: `${Math.round(afterGC.heapUsed / 1024 / 1024)}MB`
      },
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });
  } catch (error) {
    logger.error('手動垃圾回收失敗', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'GC_ERROR',
        message: 'Failed to execute garbage collection',
        requestId: req.requestId
      }
    });
  }
});

export default router;