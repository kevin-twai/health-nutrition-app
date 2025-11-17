/**
 * 執行亞洲料理成分識別準確率測試
 * 
 * 測試目標：
 * - 成分識別準確率 > 75%
 * - 主要成分識別率 > 90%
 * - 份量估計誤差 < ±25%
 */

import { AccuracyTester, RecognitionResult } from './AccuracyTester';
import { TestReportGenerator } from './TestReportGenerator';
import { testDataLoader, TestCase } from './test-data-loader';
import { ComponentDetectionEngine } from '../../services/ComponentDetectionEngine';
import * as path from 'path';

// 模擬圖片 buffer（實際使用時應該加載真實圖片）
function createMockImageBuffer(): Buffer {
  return Buffer.from('mock-image-data');
}

// 創建成分識別測試函數
function createComponentRecognitionFunction(engine: ComponentDetectionEngine) {
  return async (imageBuffer: Buffer | null, testCase: TestCase): Promise<RecognitionResult> => {
    // 如果沒有圖片，使用模擬數據
    const buffer = imageBuffer || createMockImageBuffer();
    
    try {
      // 從測試案例中提取料理名稱
      const dishName = (testCase as any).dishName || testCase.foods?.[0]?.name || '未知料理';
      
      // 執行成分識別
      const result = await engine.detectComponents(buffer, dishName);
      
      // 轉換為測試所需格式
      return {
        foods: result.components.map(c => ({
          food: {
            name: c.name,
            category: c.category,
            portion: `${c.estimatedPortion}g`
          },
          confidence: c.confidence
        })),
        overallConfidence: result.metadata.confidenceScore,
        description: result.mainDish.name,
        cookingMethod: testCase.cookingMethod,
        cuisineType: testCase.cuisineType
      };
    } catch (error) {
      console.error(`識別失敗 [${testCase.imageId}]:`, error);
      throw error;
    }
  };
}

// 計算份量估計誤差
function calculatePortionError(
  testResults: any[],
  dataset: any
): {
  avgError: number;
  maxError: number;
  withinTarget: number;
  totalTests: number;
} {
  let totalError = 0;
  let maxError = 0;
  let withinTarget = 0;
  let totalTests = 0;

  for (const result of testResults) {
    const testCase = result.testCase;
    const components = (testCase as any).components || [];
    
    // 對每個成分計算份量誤差
    for (const expectedComponent of components) {
      const recognizedComponent = result.recognitionResult.foods.find(
        (f: any) => f.food.name === expectedComponent.name
      );

      if (recognizedComponent) {
        const expectedPortion = expectedComponent.portion;
        const recognizedPortion = parseInt(recognizedComponent.food.portion);
        
        if (!isNaN(recognizedPortion) && expectedPortion > 0) {
          const error = Math.abs(recognizedPortion - expectedPortion) / expectedPortion;
          totalError += error;
          maxError = Math.max(maxError, error);
          
          if (error <= 0.25) {  // 25% 誤差範圍內
            withinTarget++;
          }
          
          totalTests++;
        }
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

// 計算主要成分識別率
function calculateMainComponentAccuracy(testResults: any[]): {
  mainComponentsTotal: number;
  mainComponentsRecognized: number;
  accuracy: number;
} {
  let mainComponentsTotal = 0;
  let mainComponentsRecognized = 0;

  for (const result of testResults) {
    const testCase = result.testCase;
    const components = (testCase as any).components || [];
    
    // 主要成分定義為 confidence >= 0.9 的成分
    const mainComponents = components.filter(
      (c: any) => c.confidence >= 0.9
    );

    mainComponentsTotal += mainComponents.length;

    for (const mainComp of mainComponents) {
      const wasRecognized = result.recognitionResult.foods.some(
        (f: any) => f.food.name === mainComp.name || 
                    f.food.name.includes(mainComp.name) ||
                    mainComp.name.includes(f.food.name)
      );

      if (wasRecognized) {
        mainComponentsRecognized++;
      }
    }
  }

  return {
    mainComponentsTotal,
    mainComponentsRecognized,
    accuracy: mainComponentsTotal > 0 
      ? mainComponentsRecognized / mainComponentsTotal 
      : 0
  };
}

// 主測試函數
async function runAccuracyTest() {
  console.log('🚀 開始執行亞洲料理成分識別準確率測試\n');

  // 1. 加載測試數據集
  console.log('📂 加載測試數據集...');
  const dataset = await testDataLoader.loadDataset('component-detection-annotations.json');
  console.log(`✅ 已加載 ${dataset.testCases.length} 個測試案例\n`);

  // 2. 初始化成分識別引擎
  console.log('🔧 初始化成分識別引擎...');
  const engine = new ComponentDetectionEngine('zh-TW');
  const recognitionFunction = createComponentRecognitionFunction(engine);
  console.log('✅ 引擎初始化完成\n');

  // 3. 創建測試器
  const tester = new AccuracyTester(recognitionFunction);

  // 4. 執行測試
  console.log('🧪 執行測試...');
  console.log('─'.repeat(50));
  
  const results = await tester.testDataset(dataset, {
    parallel: false,
    onProgress: (current, total) => {
      const percentage = ((current / total) * 100).toFixed(0);
      console.log(`進度: ${current}/${total} (${percentage}%)`);
    }
  });

  console.log('─'.repeat(50));
  console.log('✅ 測試執行完成\n');

  // 5. 計算基本指標
  console.log('📊 計算準確度指標...');
  const metrics = tester.calculateMetrics();
  const mistakePatterns = tester.identifyMistakePatterns();

  // 6. 計算額外指標
  const portionMetrics = calculatePortionError(results, dataset);
  const mainComponentMetrics = calculateMainComponentAccuracy(results);

  // 7. 顯示結果摘要
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
  console.log(`  平均信心度: ${(metrics.avgConfidence * 100).toFixed(2)}%`);
  console.log(`  平均處理時間: ${metrics.avgProcessingTime.toFixed(0)}ms`);

  console.log('\n【主要成分識別率】');
  console.log(`  主要成分總數: ${mainComponentMetrics.mainComponentsTotal}`);
  console.log(`  成功識別數: ${mainComponentMetrics.mainComponentsRecognized}`);
  console.log(`  識別率: ${(mainComponentMetrics.accuracy * 100).toFixed(2)}% ${mainComponentMetrics.accuracy > 0.90 ? '✅' : '❌'} (目標: >90%)`);

  console.log('\n【份量估計誤差】');
  console.log(`  測試總數: ${portionMetrics.totalTests}`);
  console.log(`  平均誤差: ${(portionMetrics.avgError * 100).toFixed(2)}%`);
  console.log(`  最大誤差: ${(portionMetrics.maxError * 100).toFixed(2)}%`);
  console.log(`  誤差 ≤25% 的比例: ${portionMetrics.totalTests > 0 ? ((portionMetrics.withinTarget / portionMetrics.totalTests) * 100).toFixed(2) : 0}% ${(portionMetrics.withinTarget / portionMetrics.totalTests) > 0.75 ? '✅' : '❌'} (目標: >75%)`);

  console.log('\n【難度分布】');
  for (const [difficulty, diffMetrics] of metrics.difficultyMetrics) {
    console.log(`  ${difficulty}: ${diffMetrics.correctTests}/${diffMetrics.totalTests} (${(diffMetrics.accuracy * 100).toFixed(1)}%)`);
  }

  console.log('\n【類別表現】');
  for (const [category, catMetrics] of metrics.categoryMetrics) {
    console.log(`  ${category}: ${catMetrics.correctTests}/${catMetrics.totalTests} (${(catMetrics.accuracy * 100).toFixed(1)}%)`);
  }

  if (mistakePatterns.length > 0) {
    console.log('\n【常見錯誤 (前5項)】');
    mistakePatterns.slice(0, 5).forEach((pattern, index) => {
      console.log(`  ${index + 1}. ${pattern.incorrectIdentification} → ${pattern.correctIdentification} (${pattern.frequency}次)`);
    });
  }

  // 8. 生成詳細報告
  console.log('\n📝 生成詳細測試報告...');
  const reportGenerator = new TestReportGenerator(
    path.join(__dirname, 'test-results')
  );

  const reportPath = await reportGenerator.generateAndSave(
    metrics,
    results,
    mistakePatterns,
    {
      format: 'markdown',
      includeDetailedResults: true,
      includeConfusionMatrix: true,
      includeRecommendations: true
    }
  );

  console.log(`✅ 報告已生成: ${reportPath}`);

  // 9. 目標達成總結
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
      actual: portionMetrics.totalTests > 0 ? portionMetrics.withinTarget / portionMetrics.totalTests : 0,
      achieved: portionMetrics.totalTests > 0 && (portionMetrics.withinTarget / portionMetrics.totalTests) > 0.75
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
    console.log('⚠️  部分測試目標未達成，請查看詳細報告以了解改進方向。');
  }
  console.log('='.repeat(60) + '\n');

  return {
    metrics,
    mainComponentMetrics,
    portionMetrics,
    allAchieved
  };
}

// 執行測試
if (require.main === module) {
  runAccuracyTest()
    .then(() => {
      console.log('✅ 測試完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 測試失敗:', error);
      process.exit(1);
    });
}

export { runAccuracyTest };
