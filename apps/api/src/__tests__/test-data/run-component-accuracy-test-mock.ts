/**
 * 執行亞洲料理成分識別準確率測試（模擬版本）
 * 
 * 此版本使用模擬數據來驗證測試框架和計算邏輯
 */

import { testDataLoader } from './test-data-loader';
import * as path from 'path';
import * as fs from 'fs';

// 模擬測試結果
interface MockTestResult {
  testCaseId: string;
  dishName: string;
  difficulty: string;
  expectedComponents: Array<{ name: string; portion: number; confidence: number }>;
  recognizedComponents: Array<{ name: string; portion: number; confidence: number }>;
  correct: boolean;
  correctComponents: string[];
  missingComponents: string[];
  extraComponents: string[];
  processingTime: number;
}

// 生成模擬測試結果
function generateMockResults(dataset: any): MockTestResult[] {
  const results: MockTestResult[] = [];

  for (const testCase of dataset.testCases) {
    const components = (testCase as any).components || [];
    const dishName = (testCase as any).dishName || '未知';
    
    // 模擬識別結果（90% 準確率）
    const recognizedComponents = components
      .filter(() => Math.random() > 0.1) // 90% 機率識別成功
      .map((c: any) => ({
        name: c.name,
        // 模擬份量估計（±20% 誤差）
        portion: Math.round(c.portion * (0.8 + Math.random() * 0.4)),
        confidence: 0.85 + Math.random() * 0.15
      }));

    const recognizedNames = new Set(recognizedComponents.map(c => c.name));
    const expectedNames = new Set(components.map((c: any) => c.name));

    const correctComponents = components
      .filter((c: any) => recognizedNames.has(c.name))
      .map((c: any) => c.name);

    const missingComponents = components
      .filter((c: any) => !recognizedNames.has(c.name))
      .map((c: any) => c.name);

    const extraComponents: string[] = []; // 簡化版本不添加額外成分

    results.push({
      testCaseId: testCase.imageId,
      dishName,
      difficulty: testCase.difficulty,
      expectedComponents: components.map((c: any) => ({
        name: c.name,
        portion: c.portion,
        confidence: c.confidence
      })),
      recognizedComponents,
      correct: missingComponents.length === 0 && extraComponents.length === 0,
      correctComponents,
      missingComponents,
      extraComponents,
      processingTime: 2000 + Math.random() * 3000
    });
  }

  return results;
}

// 計算準確率指標
function calculateAccuracyMetrics(results: MockTestResult[]) {
  const totalTests = results.length;
  const correctTests = results.filter(r => r.correct).length;

  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  for (const result of results) {
    truePositives += result.correctComponents.length;
    falsePositives += result.extraComponents.length;
    falseNegatives += result.missingComponents.length;
  }

  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1Score = (2 * precision * recall) / (precision + recall) || 0;

  const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / totalTests;

  return {
    totalTests,
    correctTests,
    accuracy: correctTests / totalTests,
    precision,
    recall,
    f1Score,
    avgProcessingTime
  };
}

// 計算主要成分識別率
function calculateMainComponentAccuracy(results: MockTestResult[]) {
  let mainComponentsTotal = 0;
  let mainComponentsRecognized = 0;

  for (const result of results) {
    const mainComponents = result.expectedComponents.filter(c => c.confidence >= 0.9);
    mainComponentsTotal += mainComponents.length;

    for (const mainComp of mainComponents) {
      if (result.correctComponents.includes(mainComp.name)) {
        mainComponentsRecognized++;
      }
    }
  }

  return {
    mainComponentsTotal,
    mainComponentsRecognized,
    accuracy: mainComponentsTotal > 0 ? mainComponentsRecognized / mainComponentsTotal : 0
  };
}

// 計算份量估計誤差
function calculatePortionError(results: MockTestResult[]) {
  let totalError = 0;
  let maxError = 0;
  let withinTarget = 0;
  let totalTests = 0;

  for (const result of results) {
    for (const expected of result.expectedComponents) {
      const recognized = result.recognizedComponents.find(r => r.name === expected.name);

      if (recognized && expected.portion > 0) {
        const error = Math.abs(recognized.portion - expected.portion) / expected.portion;
        totalError += error;
        maxError = Math.max(maxError, error);

        if (error <= 0.25) {
          withinTarget++;
        }

        totalTests++;
      }
    }
  }

  return {
    avgError: totalTests > 0 ? totalError / totalTests : 0,
    maxError,
    withinTarget,
    totalTests
  };
}

// 主測試函數
async function runMockAccuracyTest() {
  console.log('🚀 開始執行亞洲料理成分識別準確率測試（模擬版本）\n');

  // 1. 加載測試數據集
  console.log('📂 加載測試數據集...');
  const dataset = await testDataLoader.loadDataset('component-detection-annotations.json');
  console.log(`✅ 已加載 ${dataset.testCases.length} 個測試案例\n`);

  // 2. 生成模擬測試結果
  console.log('🧪 生成模擬測試結果...');
  const results = generateMockResults(dataset);
  console.log(`✅ 已生成 ${results.length} 個測試結果\n`);

  // 3. 計算指標
  console.log('📊 計算準確度指標...');
  const metrics = calculateAccuracyMetrics(results);
  const mainComponentMetrics = calculateMainComponentAccuracy(results);
  const portionMetrics = calculatePortionError(results);

  // 4. 顯示結果摘要
  console.log('\n' + '='.repeat(60));
  console.log('📈 測試結果摘要');
  console.log('='.repeat(60));

  console.log('\n【整體指標】');
  console.log(`  總測試數: ${metrics.totalTests}`);
  console.log(`  正確測試數: ${metrics.correctTests}`);
  console.log(`  準確率 (Accuracy): ${(metrics.accuracy * 100).toFixed(2)}% ${metrics.accuracy > 0.75 ? '✅' : '❌'} (目標: >75%)`);
  console.log(`  精確率 (Precision): ${(metrics.precision * 100).toFixed(2)}%`);
  console.log(`  召回率 (Recall): ${(metrics.recall * 100).toFixed(2)}%`);
  console.log(`  F1 分數: ${(metrics.f1Score * 100).toFixed(2)}%`);
  console.log(`  平均處理時間: ${metrics.avgProcessingTime.toFixed(0)}ms`);

  console.log('\n【主要成分識別率】');
  console.log(`  主要成分總數: ${mainComponentMetrics.mainComponentsTotal}`);
  console.log(`  成功識別數: ${mainComponentMetrics.mainComponentsRecognized}`);
  console.log(`  識別率: ${(mainComponentMetrics.accuracy * 100).toFixed(2)}% ${mainComponentMetrics.accuracy > 0.90 ? '✅' : '❌'} (目標: >90%)`);

  console.log('\n【份量估計誤差】');
  console.log(`  測試總數: ${portionMetrics.totalTests}`);
  console.log(`  平均誤差: ${(portionMetrics.avgError * 100).toFixed(2)}%`);
  console.log(`  最大誤差: ${(portionMetrics.maxError * 100).toFixed(2)}%`);
  const portionAccuracy = portionMetrics.totalTests > 0 ? portionMetrics.withinTarget / portionMetrics.totalTests : 0;
  console.log(`  誤差 ≤25% 的比例: ${(portionAccuracy * 100).toFixed(2)}% ${portionAccuracy > 0.75 ? '✅' : '❌'} (目標: >75%)`);

  // 5. 詳細結果
  console.log('\n【測試案例詳情】');
  results.forEach((result, index) => {
    const status = result.correct ? '✅' : '❌';
    console.log(`\n  ${index + 1}. ${result.dishName} (${result.difficulty}) ${status}`);
    console.log(`     識別成功: ${result.correctComponents.length}/${result.expectedComponents.length}`);
    if (result.missingComponents.length > 0) {
      console.log(`     遺漏: ${result.missingComponents.join(', ')}`);
    }
    console.log(`     處理時間: ${result.processingTime.toFixed(0)}ms`);
  });

  // 6. 目標達成總結
  console.log('\n' + '='.repeat(60));
  console.log('🎯 目標達成情況');
  console.log('='.repeat(60));

  const goals = [
    {
      name: '成分識別準確率',
      target: 0.75,
      actual: metrics.accuracy,
      achieved: metrics.accuracy > 0.75
    },
    {
      name: '主要成分識別率',
      target: 0.90,
      actual: mainComponentMetrics.accuracy,
      achieved: mainComponentMetrics.accuracy > 0.90
    },
    {
      name: '份量估計準確度',
      target: 0.75,
      actual: portionAccuracy,
      achieved: portionAccuracy > 0.75
    }
  ];

  goals.forEach(goal => {
    const status = goal.achieved ? '✅ 達成' : '❌ 未達成';
    console.log(`  ${goal.name}: ${(goal.actual * 100).toFixed(2)}% / ${(goal.target * 100).toFixed(0)}% ${status}`);
  });

  const allAchieved = goals.every(g => g.achieved);
  console.log('\n' + '='.repeat(60));
  if (allAchieved) {
    console.log('🎉 所有測試目標均已達成！');
  } else {
    console.log('⚠️  部分測試目標未達成（模擬數據）');
  }
  console.log('='.repeat(60) + '\n');

  // 7. 保存結果
  const outputDir = path.join(__dirname, 'test-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const resultPath = path.join(outputDir, `mock-test-results-${timestamp}.json`);
  
  fs.writeFileSync(resultPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    metrics,
    mainComponentMetrics,
    portionMetrics,
    goals,
    allAchieved,
    results
  }, null, 2), 'utf-8');

  console.log(`📝 測試結果已保存: ${resultPath}\n`);

  return {
    metrics,
    mainComponentMetrics,
    portionMetrics,
    allAchieved
  };
}

// 執行測試
if (require.main === module) {
  runMockAccuracyTest()
    .then(() => {
      console.log('✅ 測試完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 測試失敗:', error);
      process.exit(1);
    });
}

export { runMockAccuracyTest };
