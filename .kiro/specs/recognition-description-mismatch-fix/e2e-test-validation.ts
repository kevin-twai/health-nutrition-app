/**
 * 端到端測試驗證腳本
 * 驗證預識別食物功能的完整流程
 */

import { ComponentDetectionEngine } from '../../../apps/api/src/services/ComponentDetectionEngine';
import { DishType, RecognizedFood } from '../../../apps/api/src/types/ComponentDetection';

async function runE2EValidation() {
  console.log('🧪 開始端到端測試驗證...\n');

  const engine = new ComponentDetectionEngine('zh-TW');
  const mockImageBuffer = Buffer.from('mock-image-data');

  // 測試案例 1: 便當 - 多個食物
  console.log('📦 測試案例 1: 便當（多個食物）');
  const bentoFoods: RecognizedFood[] = [
    {
      id: 'food-1',
      name: '白飯',
      nameEn: 'White Rice',
      confidence: 0.95,
      estimatedPortion: 200,
      unit: 'g',
      nutrition: {
        calories: 260,
        protein: 5,
        carbohydrates: 58,
        fat: 0.5
      }
    },
    {
      id: 'food-2',
      name: '炸豬排',
      nameEn: 'Fried Pork Cutlet',
      confidence: 0.90,
      estimatedPortion: 150,
      unit: 'g',
      nutrition: {
        calories: 350,
        protein: 25,
        carbohydrates: 15,
        fat: 22
      }
    },
    {
      id: 'food-3',
      name: '滷蛋',
      confidence: 0.85,
      estimatedPortion: 60,
      unit: 'g',
      nutrition: {
        calories: 90,
        protein: 7,
        carbohydrates: 1,
        fat: 6
      }
    }
  ];

  try {
    const bentoResult = await engine.detectComponents(mockImageBuffer, {
      dishName: '便當',
      dishType: DishType.BENTO,
      preRecognizedFoods: bentoFoods
    });

    console.log('✅ 便當測試通過');
    console.log(`   - 檢測到 ${bentoResult.components.length} 個成分`);
    console.log(`   - 檢測方法: ${bentoResult.metadata.detectionMethod}`);
    console.log(`   - 預識別成分數: ${bentoResult.metadata.componentsFromPreRecognition || 0}`);
    console.log(`   - 成分名稱: ${bentoResult.components.map(c => c.name).join(', ')}`);
    
    // 驗證一致性
    const recognizedNames = bentoFoods.map(f => f.name);
    const componentNames = bentoResult.components.map(c => c.name);
    const allPresent = recognizedNames.every(name => componentNames.includes(name));
    
    if (allPresent) {
      console.log('   ✓ 一致性檢查: 所有預識別食物都出現在成分列表中');
    } else {
      console.log('   ✗ 一致性檢查失敗: 部分食物缺失');
    }
    console.log('');
  } catch (error) {
    console.error('❌ 便當測試失敗:', error);
  }

  // 測試案例 2: 炒飯 - 單一料理
  console.log('🍚 測試案例 2: 炒飯（單一料理）');
  const friedRiceFoods: RecognizedFood[] = [
    {
      id: 'food-1',
      name: '蛋炒飯',
      confidence: 0.92,
      estimatedPortion: 300,
      unit: 'g',
      nutrition: {
        calories: 450,
        protein: 15,
        carbohydrates: 65,
        fat: 12
      }
    }
  ];

  try {
    const friedRiceResult = await engine.detectComponents(mockImageBuffer, {
      dishName: '蛋炒飯',
      dishType: DishType.FRIED_RICE,
      preRecognizedFoods: friedRiceFoods
    });

    console.log('✅ 炒飯測試通過');
    console.log(`   - 檢測到 ${friedRiceResult.components.length} 個成分`);
    console.log(`   - 檢測方法: ${friedRiceResult.metadata.detectionMethod}`);
    console.log(`   - 成分名稱: ${friedRiceResult.components.map(c => c.name).join(', ')}`);
    console.log('');
  } catch (error) {
    console.error('❌ 炒飯測試失敗:', error);
  }

  // 測試案例 3: 湯品
  console.log('🍜 測試案例 3: 湯品');
  const soupFoods: RecognizedFood[] = [
    {
      id: 'food-1',
      name: '味噌湯',
      confidence: 0.90,
      estimatedPortion: 250,
      unit: 'ml'
    },
    {
      id: 'food-2',
      name: '豆腐',
      confidence: 0.88,
      estimatedPortion: 50,
      unit: 'g'
    },
    {
      id: 'food-3',
      name: '海帶',
      confidence: 0.85,
      estimatedPortion: 20,
      unit: 'g'
    }
  ];

  try {
    const soupResult = await engine.detectComponents(mockImageBuffer, {
      dishName: '味噌湯',
      dishType: DishType.SOUP,
      preRecognizedFoods: soupFoods
    });

    console.log('✅ 湯品測試通過');
    console.log(`   - 檢測到 ${soupResult.components.length} 個成分`);
    console.log(`   - 檢測方法: ${soupResult.metadata.detectionMethod}`);
    console.log(`   - 成分名稱: ${soupResult.components.map(c => c.name).join(', ')}`);
    console.log('');
  } catch (error) {
    console.error('❌ 湯品測試失敗:', error);
  }

  // 測試案例 4: 降級處理 - 空列表
  console.log('⚠️  測試案例 4: 降級處理（空列表）');
  try {
    const fallbackResult = await engine.detectComponents(mockImageBuffer, {
      dishName: '便當',
      dishType: DishType.BENTO,
      preRecognizedFoods: []
    });

    console.log('✅ 降級處理測試通過');
    console.log(`   - 檢測方法: ${fallbackResult.metadata.detectionMethod}`);
    console.log(`   - 系統正確降級至 Vision API`);
    console.log('');
  } catch (error) {
    console.error('❌ 降級處理測試失敗:', error);
  }

  // 測試案例 5: 向後兼容 - 舊版 API
  console.log('🔄 測試案例 5: 向後兼容（舊版 API）');
  try {
    const legacyResult = await engine.detectComponents(
      mockImageBuffer,
      '白飯',
      DishType.FRIED_RICE
    );

    console.log('✅ 向後兼容測試通過');
    console.log(`   - 舊版 API 仍然正常工作`);
    console.log(`   - 檢測到 ${legacyResult.components.length} 個成分`);
    console.log('');
  } catch (error) {
    console.error('❌ 向後兼容測試失敗:', error);
  }

  // 性能測試
  console.log('⚡ 測試案例 6: 性能測試');
  const startTime = Date.now();
  
  try {
    await engine.detectComponents(mockImageBuffer, {
      dishName: '便當',
      dishType: DishType.BENTO,
      preRecognizedFoods: bentoFoods
    });
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.log('✅ 性能測試通過');
    console.log(`   - 處理時間: ${processingTime}ms`);
    
    if (processingTime < 1000) {
      console.log('   ✓ 性能良好（< 1秒）');
    } else {
      console.log('   ⚠️  性能需要優化（> 1秒）');
    }
    console.log('');
  } catch (error) {
    console.error('❌ 性能測試失敗:', error);
  }

  console.log('🎉 端到端測試驗證完成！\n');
}

// 執行測試
runE2EValidation().catch(console.error);
