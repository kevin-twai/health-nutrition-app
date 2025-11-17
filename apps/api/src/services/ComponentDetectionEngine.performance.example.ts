/**
 * 成分識別引擎性能監控整合範例
 * Component Detection Engine Performance Monitoring Integration Example
 */

import { foodRecognitionPerformanceMonitor } from './FoodRecognitionPerformanceMonitor';
import { DishType } from '../types/ComponentDetection';

/**
 * 範例 1: 基本的成分識別性能監控
 */
async function exampleBasicComponentDetection() {
  const sessionId = `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const dishName = '蛋炒飯';
  const dishType = DishType.FRIED_RICE;
  const userId = 'user-123';

  // 開始監控會話
  foodRecognitionPerformanceMonitor.startComponentDetectionSession(
    sessionId,
    dishName,
    dishType,
    userId
  );

  try {
    // 階段 1: Vision API 調用
    const visionApiStart = Date.now();
    // 模擬 Vision API 調用
    await new Promise(resolve => setTimeout(resolve, 2000));
    const visionApiEnd = Date.now();
    
    foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
      sessionId,
      'vision_api',
      visionApiStart,
      visionApiEnd,
      1, // API 調用次數
      true
    );

    // 階段 2: 知識庫查詢
    const kbStart = Date.now();
    // 模擬知識庫查詢
    await new Promise(resolve => setTimeout(resolve, 300));
    const kbEnd = Date.now();
    
    foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
      sessionId,
      'knowledge_base',
      kbStart,
      kbEnd,
      5, // 查詢的項目數
      true
    );

    // 記錄緩存命中
    foodRecognitionPerformanceMonitor.recordComponentKnowledgeBaseCacheHit(sessionId);

    // 階段 3: 營養計算
    const nutritionStart = Date.now();
    // 模擬營養計算
    await new Promise(resolve => setTimeout(resolve, 500));
    const nutritionEnd = Date.now();
    
    foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
      sessionId,
      'nutrition_calculation',
      nutritionStart,
      nutritionEnd,
      5, // 計算的成分數
      true
    );

    // 階段 4: 驗證
    const validationStart = Date.now();
    // 模擬驗證
    await new Promise(resolve => setTimeout(resolve, 200));
    const validationEnd = Date.now();
    
    foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
      sessionId,
      'validation',
      validationStart,
      validationEnd,
      5, // 驗證的成分數
      true
    );

    // 結束會話
    foodRecognitionPerformanceMonitor.endComponentDetectionSession(
      sessionId,
      5, // 識別的成分數
      0.85, // 平均信心度
      'hybrid', // 檢測方法
      true
    );

    console.log('✅ 成分識別完成並記錄性能指標');
  } catch (error) {
    // 記錄失敗
    foodRecognitionPerformanceMonitor.endComponentDetectionSession(
      sessionId,
      0,
      0,
      'vision_api',
      false,
      error.message
    );
    console.error('❌ 成分識別失敗:', error.message);
  }
}

/**
 * 範例 2: 僅使用知識庫的成分識別
 */
async function exampleKnowledgeBaseOnlyDetection() {
  const sessionId = `component-kb-${Date.now()}`;
  const dishName = '味噌湯';
  const dishType = DishType.SOUP;

  foodRecognitionPerformanceMonitor.startComponentDetectionSession(
    sessionId,
    dishName,
    dishType
  );

  try {
    // 跳過 Vision API，直接使用知識庫
    const kbStart = Date.now();
    await new Promise(resolve => setTimeout(resolve, 200));
    const kbEnd = Date.now();
    
    foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
      sessionId,
      'knowledge_base',
      kbStart,
      kbEnd,
      4,
      true
    );

    // 記錄緩存命中
    foodRecognitionPerformanceMonitor.recordComponentKnowledgeBaseCacheHit(sessionId);

    // 營養計算
    const nutritionStart = Date.now();
    await new Promise(resolve => setTimeout(resolve, 300));
    const nutritionEnd = Date.now();
    
    foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
      sessionId,
      'nutrition_calculation',
      nutritionStart,
      nutritionEnd,
      4,
      true
    );

    // 驗證
    const validationStart = Date.now();
    await new Promise(resolve => setTimeout(resolve, 100));
    const validationEnd = Date.now();
    
    foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
      sessionId,
      'validation',
      validationStart,
      validationEnd,
      4,
      true
    );

    foodRecognitionPerformanceMonitor.endComponentDetectionSession(
      sessionId,
      4,
      0.90,
      'knowledge_base',
      true
    );

    console.log('✅ 知識庫成分識別完成');
  } catch (error) {
    foodRecognitionPerformanceMonitor.endComponentDetectionSession(
      sessionId,
      0,
      0,
      'knowledge_base',
      false,
      error.message
    );
  }
}

/**
 * 範例 3: Vision API 失敗降級到知識庫
 */
async function exampleVisionApiFallback() {
  const sessionId = `component-fallback-${Date.now()}`;
  const dishName = '台式便當';
  const dishType = DishType.BENTO;

  foodRecognitionPerformanceMonitor.startComponentDetectionSession(
    sessionId,
    dishName,
    dishType
  );

  try {
    // 嘗試 Vision API
    const visionApiStart = Date.now();
    try {
      await new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Vision API timeout')), 1000)
      );
    } catch (visionError) {
      const visionApiEnd = Date.now();
      
      // 記錄 Vision API 失敗
      foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
        sessionId,
        'vision_api',
        visionApiStart,
        visionApiEnd,
        0,
        false,
        visionError.message
      );

      console.log('⚠️ Vision API 失敗，降級到知識庫');
    }

    // 降級到知識庫
    const kbStart = Date.now();
    await new Promise(resolve => setTimeout(resolve, 400));
    const kbEnd = Date.now();
    
    foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
      sessionId,
      'knowledge_base',
      kbStart,
      kbEnd,
      6,
      true
    );

    // 營養計算
    const nutritionStart = Date.now();
    await new Promise(resolve => setTimeout(resolve, 600));
    const nutritionEnd = Date.now();
    
    foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
      sessionId,
      'nutrition_calculation',
      nutritionStart,
      nutritionEnd,
      6,
      true
    );

    // 驗證
    const validationStart = Date.now();
    await new Promise(resolve => setTimeout(resolve, 150));
    const validationEnd = Date.now();
    
    foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
      sessionId,
      'validation',
      validationStart,
      validationEnd,
      6,
      true
    );

    foodRecognitionPerformanceMonitor.endComponentDetectionSession(
      sessionId,
      6,
      0.75,
      'knowledge_base',
      true
    );

    console.log('✅ 降級成分識別完成');
  } catch (error) {
    foodRecognitionPerformanceMonitor.endComponentDetectionSession(
      sessionId,
      0,
      0,
      'knowledge_base',
      false,
      error.message
    );
  }
}

/**
 * 範例 4: 獲取和顯示性能統計
 */
function exampleGetStatistics() {
  console.log('\n=== 成分識別性能統計 ===\n');

  // 獲取最近 5 分鐘的統計
  const stats = foodRecognitionPerformanceMonitor.getComponentDetectionStatistics(300000);

  console.log('📊 會話統計:');
  console.log(`  總會話數: ${stats.totalSessions}`);
  console.log(`  成功會話: ${stats.successfulSessions} (${(stats.successfulSessions / stats.totalSessions * 100).toFixed(1)}%)`);
  console.log(`  失敗會話: ${stats.failedSessions}`);
  console.log(`  平均處理時間: ${stats.averageDuration.toFixed(0)}ms`);
  console.log(`  平均識別成分數: ${stats.averageComponentsDetected.toFixed(1)}`);
  console.log(`  平均信心度: ${(stats.averageConfidence * 100).toFixed(1)}%`);
  console.log(`  慢會話數: ${stats.slowSessions} (>8000ms)`);

  console.log('\n⏱️ 各階段平均耗時:');
  console.log(`  Vision API: ${stats.averageVisionApiDuration.toFixed(0)}ms (${((stats.averageVisionApiDuration / stats.averageDuration) * 100).toFixed(1)}%)`);
  console.log(`  知識庫查詢: ${stats.averageKnowledgeBaseDuration.toFixed(0)}ms (${((stats.averageKnowledgeBaseDuration / stats.averageDuration) * 100).toFixed(1)}%)`);
  console.log(`  營養計算: ${stats.averageNutritionCalculationDuration.toFixed(0)}ms (${((stats.averageNutritionCalculationDuration / stats.averageDuration) * 100).toFixed(1)}%)`);
  console.log(`  驗證: ${stats.averageValidationDuration.toFixed(0)}ms (${((stats.averageValidationDuration / stats.averageDuration) * 100).toFixed(1)}%)`);

  console.log('\n🔧 API 和查詢統計:');
  console.log(`  Vision API 調用: ${stats.totalVisionApiCalls} 次`);
  console.log(`  Vision API 成功率: ${(stats.visionApiSuccessRate * 100).toFixed(1)}%`);
  console.log(`  知識庫查詢: ${stats.totalKnowledgeBaseQueries} 次`);
  console.log(`  知識庫緩存命中率: ${(stats.knowledgeBaseCacheHitRate * 100).toFixed(1)}%`);
  console.log(`  營養計算次數: ${stats.totalNutritionCalculations}`);

  console.log('\n🎯 檢測方法分佈:');
  console.log(`  Vision API: ${stats.detectionMethodDistribution.vision_api} (${((stats.detectionMethodDistribution.vision_api / stats.totalSessions) * 100).toFixed(1)}%)`);
  console.log(`  知識庫: ${stats.detectionMethodDistribution.knowledge_base} (${((stats.detectionMethodDistribution.knowledge_base / stats.totalSessions) * 100).toFixed(1)}%)`);
  console.log(`  混合: ${stats.detectionMethodDistribution.hybrid} (${((stats.detectionMethodDistribution.hybrid / stats.totalSessions) * 100).toFixed(1)}%)`);

  console.log('\n🍜 料理類型分佈:');
  Array.from(stats.dishTypeDistribution.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} (${((count / stats.totalSessions) * 100).toFixed(1)}%)`);
    });
}

/**
 * 範例 5: 生成性能報告
 */
function exampleGenerateReport() {
  console.log('\n=== 生成性能報告 ===\n');

  // 生成成分識別專用報告
  const componentReport = foodRecognitionPerformanceMonitor.generateComponentDetectionReport(300000);
  console.log(componentReport);

  // 生成完整性能報告（包含成分識別統計）
  const fullReport = foodRecognitionPerformanceMonitor.generatePerformanceReport(300000);
  console.log('\n=== 完整性能報告 ===\n');
  console.log(fullReport);
}

/**
 * 範例 6: 獲取最慢的會話
 */
function exampleGetSlowestSessions() {
  console.log('\n=== 最慢的成分識別會話 ===\n');

  const slowestSessions = foodRecognitionPerformanceMonitor.getSlowestComponentDetectionSessions(5);

  slowestSessions.forEach((session, index) => {
    console.log(`${index + 1}. ${session.dishName} (${session.dishType})`);
    console.log(`   會話 ID: ${session.sessionId}`);
    console.log(`   總時間: ${session.totalDuration}ms`);
    console.log(`   Vision API: ${session.visionApiDuration}ms`);
    console.log(`   知識庫: ${session.knowledgeBaseDuration}ms`);
    console.log(`   營養計算: ${session.nutritionCalculationDuration}ms`);
    console.log(`   驗證: ${session.validationDuration}ms`);
    console.log(`   成分數: ${session.componentsDetected}`);
    console.log(`   信心度: ${(session.averageConfidence * 100).toFixed(1)}%`);
    console.log(`   檢測方法: ${session.detectionMethod}`);
    console.log(`   時間: ${session.timestamp.toISOString()}`);
    console.log('');
  });
}

/**
 * 範例 7: 批量測試並分析性能
 */
async function exampleBatchPerformanceTest() {
  console.log('\n=== 批量性能測試 ===\n');

  const testCases = [
    { dishName: '蛋炒飯', dishType: DishType.FRIED_RICE, components: 5 },
    { dishName: '味噌湯', dishType: DishType.SOUP, components: 4 },
    { dishName: '台式便當', dishType: DishType.BENTO, components: 8 },
    { dishName: '拉麵', dishType: DishType.NOODLES, components: 6 },
    { dishName: '小籠包', dishType: DishType.DUMPLING, components: 3 },
  ];

  console.log(`執行 ${testCases.length} 個測試案例...\n`);

  for (const testCase of testCases) {
    const sessionId = `batch-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    foodRecognitionPerformanceMonitor.startComponentDetectionSession(
      sessionId,
      testCase.dishName,
      testCase.dishType
    );

    try {
      // Vision API
      const visionApiStart = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      const visionApiEnd = Date.now();
      foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
        sessionId, 'vision_api', visionApiStart, visionApiEnd, 1, true
      );

      // 知識庫
      const kbStart = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
      const kbEnd = Date.now();
      foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
        sessionId, 'knowledge_base', kbStart, kbEnd, testCase.components, true
      );

      // 營養計算
      const nutritionStart = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
      const nutritionEnd = Date.now();
      foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
        sessionId, 'nutrition_calculation', nutritionStart, nutritionEnd, testCase.components, true
      );

      // 驗證
      const validationStart = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
      const validationEnd = Date.now();
      foodRecognitionPerformanceMonitor.recordComponentDetectionStage(
        sessionId, 'validation', validationStart, validationEnd, testCase.components, true
      );

      foodRecognitionPerformanceMonitor.endComponentDetectionSession(
        sessionId,
        testCase.components,
        0.80 + Math.random() * 0.15,
        'hybrid',
        true
      );

      console.log(`✅ ${testCase.dishName} 完成`);
    } catch (error) {
      foodRecognitionPerformanceMonitor.endComponentDetectionSession(
        sessionId, 0, 0, 'hybrid', false, error.message
      );
      console.log(`❌ ${testCase.dishName} 失敗`);
    }
  }

  console.log('\n批量測試完成！\n');
  
  // 顯示統計
  exampleGetStatistics();
  
  // 顯示最慢的會話
  exampleGetSlowestSessions();
}

/**
 * 執行所有範例
 */
async function runAllExamples() {
  console.log('🚀 開始執行成分識別性能監控範例\n');

  // 範例 1: 基本監控
  await exampleBasicComponentDetection();
  await new Promise(resolve => setTimeout(resolve, 100));

  // 範例 2: 僅知識庫
  await exampleKnowledgeBaseOnlyDetection();
  await new Promise(resolve => setTimeout(resolve, 100));

  // 範例 3: 降級處理
  await exampleVisionApiFallback();
  await new Promise(resolve => setTimeout(resolve, 100));

  // 範例 4: 獲取統計
  exampleGetStatistics();

  // 範例 5: 生成報告
  exampleGenerateReport();

  // 範例 6: 最慢會話
  exampleGetSlowestSessions();

  // 範例 7: 批量測試
  await exampleBatchPerformanceTest();

  console.log('\n✅ 所有範例執行完成！');
}

// 如果直接執行此文件
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  exampleBasicComponentDetection,
  exampleKnowledgeBaseOnlyDetection,
  exampleVisionApiFallback,
  exampleGetStatistics,
  exampleGenerateReport,
  exampleGetSlowestSessions,
  exampleBatchPerformanceTest,
  runAllExamples
};
