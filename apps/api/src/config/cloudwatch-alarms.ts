import AWS from 'aws-sdk';
import { logger } from './logging';

const cloudWatch = new AWS.CloudWatch({
  region: process.env.AWS_REGION || 'ap-northeast-1'
});

// 獲取有效的 SNS ARN
const getValidAlarmActions = (): string[] => {
  const snsArn = process.env.AWS_SNS_ALERT_TOPIC_ARN;
  return snsArn ? [snsArn] : [];
};

// CloudWatch 警報配置
export const alarmConfigurations = [
  {
    AlarmName: 'HealthNutritionTracker-HighErrorRate',
    AlarmDescription: '錯誤率過高警報',
    MetricName: 'ErrorRequest',
    Namespace: 'HealthNutritionTracker/API',
    Statistic: 'Sum',
    Period: 300, // 5 分鐘
    EvaluationPeriods: 2,
    Threshold: 10,
    ComparisonOperator: 'GreaterThanThreshold',
    AlarmActions: getValidAlarmActions()
  },
  {
    AlarmName: 'HealthNutritionTracker-SlowResponseTime',
    AlarmDescription: '回應時間過慢警報',
    MetricName: 'ResponseTime',
    Namespace: 'HealthNutritionTracker/API',
    Statistic: 'Average',
    Period: 300,
    EvaluationPeriods: 3,
    Threshold: 2000, // 2 秒
    ComparisonOperator: 'GreaterThanThreshold',
    AlarmActions: getValidAlarmActions()
  },
  {
    AlarmName: 'HealthNutritionTracker-HighMemoryUsage',
    AlarmDescription: '記憶體使用率過高警報',
    MetricName: 'MemoryUsed',
    Namespace: 'HealthNutritionTracker/API',
    Statistic: 'Average',
    Period: 300,
    EvaluationPeriods: 2,
    Threshold: 1073741824, // 1GB
    ComparisonOperator: 'GreaterThanThreshold',
    AlarmActions: getValidAlarmActions()
  },
  {
    AlarmName: 'HealthNutritionTracker-HealthCheckFailure',
    AlarmDescription: '健康檢查失敗警報',
    MetricName: 'HealthCheck',
    Namespace: 'HealthNutritionTracker/API',
    Statistic: 'Average',
    Period: 300,
    EvaluationPeriods: 1,
    Threshold: 0.5, // 健康檢查成功率低於 50%
    ComparisonOperator: 'LessThanThreshold',
    AlarmActions: getValidAlarmActions()
  },
  {
    AlarmName: 'HealthNutritionTracker-NoRequests',
    AlarmDescription: '無請求警報 (可能服務停止)',
    MetricName: 'RequestCount',
    Namespace: 'HealthNutritionTracker/API',
    Statistic: 'Sum',
    Period: 600, // 10 分鐘
    EvaluationPeriods: 1,
    Threshold: 1,
    ComparisonOperator: 'LessThanThreshold',
    TreatMissingData: 'breaching',
    AlarmActions: getValidAlarmActions()
  }
];

// 建立 CloudWatch 警報
export async function createCloudWatchAlarms() {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('非生產環境，跳過 CloudWatch 警報建立');
    return;
  }

  for (const alarmConfig of alarmConfigurations) {
    try {
      await cloudWatch.putMetricAlarm(alarmConfig).promise();
      logger.info(`CloudWatch 警報建立成功: ${alarmConfig.AlarmName}`);
    } catch (error) {
      logger.error(`CloudWatch 警報建立失敗: ${alarmConfig.AlarmName}`, {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

// 建立 CloudWatch 儀表板
export async function createCloudWatchDashboard() {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('非生產環境，跳過 CloudWatch 儀表板建立');
    return;
  }

  try {
    const fs = require('fs');
    const path = require('path');
    
    const dashboardBody = fs.readFileSync(
      path.join(__dirname, 'cloudwatch-dashboard.json'),
      'utf8'
    );

    await cloudWatch.putDashboard({
      DashboardName: 'HealthNutritionTracker-API-Dashboard',
      DashboardBody: dashboardBody
    }).promise();

    logger.info('CloudWatch 儀表板建立成功');
  } catch (error) {
    logger.error('CloudWatch 儀表板建立失敗', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// 檢查警報狀態
export async function checkAlarmStatus() {
  try {
    const alarms = await cloudWatch.describeAlarms({
      AlarmNamePrefix: 'HealthNutritionTracker-'
    }).promise();

    const alarmStates = alarms.MetricAlarms?.map(alarm => ({
      name: alarm.AlarmName,
      state: alarm.StateValue,
      reason: alarm.StateReason,
      timestamp: alarm.StateUpdatedTimestamp
    })) || [];

    return alarmStates;
  } catch (error) {
    logger.error('檢查警報狀態失敗', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return [];
  }
}

// 初始化監控設定
export async function initializeMonitoring() {
  logger.info('初始化 CloudWatch 監控設定');
  
  await createCloudWatchAlarms();
  await createCloudWatchDashboard();
  
  logger.info('CloudWatch 監控設定完成');
}