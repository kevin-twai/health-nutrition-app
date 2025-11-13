import { Db } from 'mongodb';

/**
 * 初始化反饋集合的索引
 */
export async function initFeedbackIndexes(db: Db): Promise<void> {
  const feedbackCollection = db.collection('feedbacks');

  console.log('開始創建反饋集合索引...');

  try {
    // 基本索引
    await feedbackCollection.createIndex({ imageId: 1 });
    console.log('✓ 創建 imageId 索引');

    await feedbackCollection.createIndex({ userId: 1 });
    console.log('✓ 創建 userId 索引');

    await feedbackCollection.createIndex({ sessionId: 1 }, { unique: true });
    console.log('✓ 創建 sessionId 唯一索引');

    await feedbackCollection.createIndex({ status: 1 });
    console.log('✓ 創建 status 索引');

    await feedbackCollection.createIndex({ createdAt: -1 });
    console.log('✓ 創建 createdAt 索引');

    // 識別結果相關索引
    await feedbackCollection.createIndex({ 'recognitionResult.cuisineType': 1 });
    console.log('✓ 創建 cuisineType 索引');

    await feedbackCollection.createIndex({ 'recognitionResult.overallConfidence': 1 });
    console.log('✓ 創建 overallConfidence 索引');

    // 用戶修正相關索引
    await feedbackCollection.createIndex({ 'userCorrection.incorrectFoods.identifiedAs': 1 });
    console.log('✓ 創建 incorrectFoods.identifiedAs 索引');

    await feedbackCollection.createIndex({ 'userCorrection.incorrectFoods.actualFood': 1 });
    console.log('✓ 創建 incorrectFoods.actualFood 索引');

    // 複合索引
    await feedbackCollection.createIndex({ status: 1, createdAt: -1 });
    console.log('✓ 創建 status + createdAt 複合索引');

    await feedbackCollection.createIndex({ userId: 1, createdAt: -1 });
    console.log('✓ 創建 userId + createdAt 複合索引');

    // 文本搜索索引（用於搜索食材名稱）
    await feedbackCollection.createIndex({
      'recognitionResult.foods.name': 'text',
      'userCorrection.incorrectFoods.identifiedAs': 'text',
      'userCorrection.incorrectFoods.actualFood': 'text',
      'userCorrection.missingFoods.name': 'text',
      additionalComments: 'text'
    }, {
      name: 'feedback_text_search',
      default_language: 'none' // 支持中文搜索
    });
    console.log('✓ 創建文本搜索索引');

    console.log('反饋集合索引創建完成！');
  } catch (error) {
    console.error('創建反饋集合索引時發生錯誤:', error);
    throw error;
  }
}

/**
 * 檢查索引是否存在
 */
export async function checkFeedbackIndexes(db: Db): Promise<boolean> {
  try {
    const feedbackCollection = db.collection('feedbacks');
    const indexes = await feedbackCollection.indexes();
    
    console.log('現有索引:', indexes.map(idx => idx.name));
    
    const requiredIndexes = [
      'imageId_1',
      'userId_1',
      'sessionId_1',
      'status_1',
      'createdAt_-1',
      'status_1_createdAt_-1',
      'feedback_text_search'
    ];

    const existingIndexNames = indexes.map(idx => idx.name);
    const missingIndexes = requiredIndexes.filter(
      name => !existingIndexNames.includes(name)
    );

    if (missingIndexes.length > 0) {
      console.log('缺少以下索引:', missingIndexes);
      return false;
    }

    console.log('所有必需的索引都已存在');
    return true;
  } catch (error) {
    console.error('檢查索引時發生錯誤:', error);
    return false;
  }
}
