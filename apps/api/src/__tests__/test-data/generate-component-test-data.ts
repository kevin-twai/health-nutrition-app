/**
 * 生成亞洲料理成分識別測試數據集
 */

import * as fs from 'fs';
import * as path from 'path';

interface ComponentAnnotation {
  name: string;
  nameEn: string;
  category: string;
  portion: number;
  cookingMethod: string;
  confidence: number;
  visualFeatures: string[];
  nutritionPer100g: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
}

interface TestCase {
  imageId: string;
  imagePath: string;
  category: string;
  cuisineType: string;
  cookingMethod: string;
  difficulty: 'easy' | 'medium' | 'hard';
  dishName: string;
  dishType: string;
  estimatedTotalPortion: number;
  components: ComponentAnnotation[];
  commonConfusions: string[];
  tags: string[];
  notes: string;
  expectedChallenges: string[];
}

interface TestDataset {
  version: string;
  description: string;
  testCases: TestCase[];
  statistics: {
    totalImages: number;
    categories: Record<string, number>;
    difficulty: Record<string, number>;
    cuisineTypes: Record<string, number>;
  };
}

const testCases: TestCase[] = [
  // 1. 簡單炒飯 - Easy
  {
    imageId: 'egg-fried-rice-01',
    imagePath: 'component-detection/fried-rice/egg-fried-rice-01.jpg',
    category: '炒飯類',
    cuisineType: '台式',
    cookingMethod: '炒',
    difficulty: 'easy',
    dishName: '蛋炒飯',
    dishType: 'fried_rice',
    estimatedTotalPortion: 300,
    components: [
      {
        name: '白飯',
        nameEn: 'White Rice',
        category: 'grain',
        portion: 200,
        cookingMethod: 'stir_fried',
        confidence: 1.0,
        visualFeatures: ['白色', '粒狀', '略帶油光', '分散'],
        nutritionPer100g: { calories: 130, protein: 2.7, carbohydrates: 28, fat: 0.3 }
      },
      {
        name: '雞蛋',
        nameEn: 'Egg',
        category: 'protein',
        portion: 50,
        cookingMethod: 'stir_fried',
        confidence: 1.0,
        visualFeatures: ['黃色', '塊狀', '鬆軟', '分散在飯中'],
        nutritionPer100g: { calories: 143, protein: 12.6, carbohydrates: 0.7, fat: 9.5 }
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: 'garnish',
        portion: 10,
        cookingMethod: 'stir_fried',
        confidence: 0.9,
        visualFeatures: ['綠色', '細碎', '點綴在表面'],
        nutritionPer100g: { calories: 32, protein: 1.8, carbohydrates: 7.3, fat: 0.2 }
      }
    ],
    commonConfusions: [],
    tags: ['炒飯', '簡單', '台式', '基礎料理'],
    notes: '標準的台式蛋炒飯，成分簡單明確',
    expectedChallenges: []
  },
  // 2. 日式味噌湯 - Medium
  {
    imageId: 'miso-soup-01',
    imagePath: 'component-detection/soup/miso-soup-01.jpg',
    category: '湯品類',
    cuisineType: '日式',
    cookingMethod: '煮',
    difficulty: 'medium',
    dishName: '味噌湯',
    dishType: 'soup',
    estimatedTotalPortion: 250,
    components: [
      {
        name: '味噌湯底',
        nameEn: 'Miso Broth',
        category: 'sauce',
        portion: 200,
        cookingMethod: 'boiled',
        confidence: 1.0,
        visualFeatures: ['褐色', '液體', '略混濁'],
        nutritionPer100g: { calories: 30, protein: 2, carbohydrates: 4, fat: 1 }
      },
      {
        name: '豆腐',
        nameEn: 'Tofu',
        category: 'protein',
        portion: 30,
        cookingMethod: 'boiled',
        confidence: 1.0,
        visualFeatures: ['白色', '方塊狀', '柔軟', '漂浮在湯中'],
        nutritionPer100g: { calories: 76, protein: 8, carbohydrates: 1.9, fat: 4.8 }
      },
      {
        name: '海帶芽',
        nameEn: 'Wakame Seaweed',
        category: 'vegetable',
        portion: 5,
        cookingMethod: 'boiled',
        confidence: 0.9,
        visualFeatures: ['深綠色', '片狀', '柔軟', '漂浮在湯中'],
        nutritionPer100g: { calories: 45, protein: 3, carbohydrates: 9, fat: 0.6 }
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: 'garnish',
        portion: 5,
        cookingMethod: 'raw',
        confidence: 0.85,
        visualFeatures: ['綠色', '細碎', '漂浮在表面'],
        nutritionPer100g: { calories: 32, protein: 1.8, carbohydrates: 7.3, fat: 0.2 }
      }
    ],
    commonConfusions: [],
    tags: ['湯品', '日式', '味噌', '簡單'],
    notes: '標準的日式味噌湯，成分清晰可見',
    expectedChallenges: ['湯底顏色可能影響成分識別']
  },
  // 3. 台式便當 - Hard
  {
    imageId: 'taiwanese-bento-01',
    imagePath: 'component-detection/bento/taiwanese-bento-01.jpg',
    category: '便當類',
    cuisineType: '台式',
    cookingMethod: '混合',
    difficulty: 'hard',
    dishName: '台式便當',
    dishType: 'bento',
    estimatedTotalPortion: 500,
    components: [
      {
        name: '白飯',
        nameEn: 'White Rice',
        category: 'grain',
        portion: 200,
        cookingMethod: 'steamed',
        confidence: 1.0,
        visualFeatures: ['白色', '粒狀', '佔便當約1/2空間'],
        nutritionPer100g: { calories: 130, protein: 2.7, carbohydrates: 28, fat: 0.3 }
      },
      {
        name: '炸排骨',
        nameEn: 'Fried Pork Chop',
        category: 'protein',
        portion: 120,
        cookingMethod: 'deep_fried',
        confidence: 1.0,
        visualFeatures: ['金黃色', '長條狀', '有麵衣', '主菜位置'],
        nutritionPer100g: { calories: 280, protein: 20, carbohydrates: 15, fat: 16 }
      },
      {
        name: '滷蛋',
        nameEn: 'Braised Egg',
        category: 'protein',
        portion: 50,
        cookingMethod: 'braised',
        confidence: 1.0,
        visualFeatures: ['褐色', '橢圓形', '對半切', '配菜區'],
        nutritionPer100g: { calories: 155, protein: 13, carbohydrates: 1.1, fat: 11 }
      },
      {
        name: '炒高麗菜',
        nameEn: 'Stir-fried Cabbage',
        category: 'vegetable',
        portion: 60,
        cookingMethod: 'stir_fried',
        confidence: 0.95,
        visualFeatures: ['淡綠色', '片狀', '略軟', '配菜區'],
        nutritionPer100g: { calories: 25, protein: 1.3, carbohydrates: 5.8, fat: 0.1 }
      },
      {
        name: '滷豆干',
        nameEn: 'Braised Dried Tofu',
        category: 'protein',
        portion: 40,
        cookingMethod: 'braised',
        confidence: 0.9,
        visualFeatures: ['深褐色', '方塊狀', '緊實', '配菜區'],
        nutritionPer100g: { calories: 140, protein: 14, carbohydrates: 8, fat: 6 }
      }
    ],
    commonConfusions: [],
    tags: ['便當', '台式', '複雜', '多成分'],
    notes: '典型的台式便當，包含主食、主菜和多種配菜',
    expectedChallenges: ['成分多', '需要區分主菜和配菜', '份量估計困難']
  },
  // 4. 牛肉麵 - Medium
  {
    imageId: 'beef-noodle-soup-01',
    imagePath: 'component-detection/noodles/beef-noodle-soup-01.jpg',
    category: '麵食類',
    cuisineType: '台式',
    cookingMethod: '煮',
    difficulty: 'medium',
    dishName: '牛肉麵',
    dishType: 'noodle_soup',
    estimatedTotalPortion: 450,
    components: [
      {
        name: '麵條',
        nameEn: 'Noodles',
        category: 'grain',
        portion: 200,
        cookingMethod: 'boiled',
        confidence: 1.0,
        visualFeatures: ['淡黃色', '長條狀', '有彈性', '浸在湯中'],
        nutritionPer100g: { calories: 138, protein: 4.5, carbohydrates: 27, fat: 0.6 }
      },
      {
        name: '牛肉',
        nameEn: 'Beef',
        category: 'protein',
        portion: 100,
        cookingMethod: 'braised',
        confidence: 1.0,
        visualFeatures: ['深褐色', '塊狀', '軟嫩', '浸在湯中'],
        nutritionPer100g: { calories: 250, protein: 26, carbohydrates: 0, fat: 15 }
      },
      {
        name: '牛肉湯',
        nameEn: 'Beef Broth',
        category: 'sauce',
        portion: 300,
        cookingMethod: 'boiled',
        confidence: 1.0,
        visualFeatures: ['深褐色', '液體', '有香料味'],
        nutritionPer100g: { calories: 20, protein: 2, carbohydrates: 2, fat: 0.5 }
      },
      {
        name: '青菜',
        nameEn: 'Bok Choy',
        category: 'vegetable',
        portion: 50,
        cookingMethod: 'boiled',
        confidence: 0.9,
        visualFeatures: ['綠色', '葉狀', '軟嫩'],
        nutritionPer100g: { calories: 13, protein: 1.5, carbohydrates: 2.2, fat: 0.2 }
      }
    ],
    commonConfusions: [],
    tags: ['麵食', '台式', '湯麵', '經典'],
    notes: '經典台式牛肉麵，湯頭濃郁',
    expectedChallenges: ['湯汁可能遮蔽部分成分']
  },
  // 5. 宮保雞丁 - Medium
  {
    imageId: 'kung-pao-chicken-01',
    imagePath: 'component-detection/stir-fry/kung-pao-chicken-01.jpg',
    category: '熱炒類',
    cuisineType: '川式',
    cookingMethod: '炒',
    difficulty: 'medium',
    dishName: '宮保雞丁',
    dishType: 'stir_fry',
    estimatedTotalPortion: 250,
    components: [
      {
        name: '雞肉',
        nameEn: 'Chicken',
        category: 'protein',
        portion: 120,
        cookingMethod: 'stir_fried',
        confidence: 1.0,
        visualFeatures: ['淡褐色', '丁狀', '有醬汁'],
        nutritionPer100g: { calories: 165, protein: 31, carbohydrates: 0, fat: 3.6 }
      },
      {
        name: '花生',
        nameEn: 'Peanuts',
        category: 'protein',
        portion: 30,
        cookingMethod: 'stir_fried',
        confidence: 0.95,
        visualFeatures: ['褐色', '顆粒狀', '酥脆'],
        nutritionPer100g: { calories: 567, protein: 26, carbohydrates: 16, fat: 49 }
      },
      {
        name: '乾辣椒',
        nameEn: 'Dried Chili',
        category: 'garnish',
        portion: 5,
        cookingMethod: 'stir_fried',
        confidence: 0.9,
        visualFeatures: ['深紅色', '細長', '乾燥'],
        nutritionPer100g: { calories: 40, protein: 2, carbohydrates: 9, fat: 0.4 }
      },
      {
        name: '青蔥',
        nameEn: 'Green Onion',
        category: 'garnish',
        portion: 10,
        cookingMethod: 'stir_fried',
        confidence: 0.85,
        visualFeatures: ['綠色', '段狀'],
        nutritionPer100g: { calories: 32, protein: 1.8, carbohydrates: 7.3, fat: 0.2 }
      }
    ],
    commonConfusions: [],
    tags: ['熱炒', '川式', '辣味', '經典'],
    notes: '經典川菜，辣椒和花生是特色',
    expectedChallenges: ['醬汁可能影響顏色識別']
  },
  // 6. 日式壽司拼盤 - Hard
  {
    imageId: 'sushi-platter-01',
    imagePath: 'component-detection/japanese/sushi-platter-01.jpg',
    category: '日式料理',
    cuisineType: '日式',
    cookingMethod: '生食',
    difficulty: 'hard',
    dishName: '壽司拼盤',
    dishType: 'sushi',
    estimatedTotalPortion: 300,
    components: [
      {
        name: '壽司飯',
        nameEn: 'Sushi Rice',
        category: 'grain',
        portion: 150,
        cookingMethod: 'steamed',
        confidence: 1.0,
        visualFeatures: ['白色', '粒狀', '略帶光澤', '緊實'],
        nutritionPer100g: { calories: 140, protein: 2.5, carbohydrates: 31, fat: 0.3 }
      },
      {
        name: '鮭魚',
        nameEn: 'Salmon',
        category: 'protein',
        portion: 50,
        cookingMethod: 'raw',
        confidence: 1.0,
        visualFeatures: ['橘紅色', '片狀', '有油脂光澤'],
        nutritionPer100g: { calories: 208, protein: 20, carbohydrates: 0, fat: 13 }
      },
      {
        name: '鮪魚',
        nameEn: 'Tuna',
        category: 'protein',
        portion: 50,
        cookingMethod: 'raw',
        confidence: 1.0,
        visualFeatures: ['深紅色', '片狀', '肉質緊實'],
        nutritionPer100g: { calories: 144, protein: 23, carbohydrates: 0, fat: 4.9 }
      },
      {
        name: '海苔',
        nameEn: 'Nori',
        category: 'vegetable',
        portion: 5,
        cookingMethod: 'raw',
        confidence: 0.95,
        visualFeatures: ['深綠色', '薄片狀', '包裹壽司'],
        nutritionPer100g: { calories: 35, protein: 5.8, carbohydrates: 5.1, fat: 0.3 }
      },
      {
        name: '醃薑',
        nameEn: 'Pickled Ginger',
        category: 'garnish',
        portion: 10,
        cookingMethod: 'pickled',
        confidence: 0.9,
        visualFeatures: ['粉紅色', '薄片狀', '配菜'],
        nutritionPer100g: { calories: 51, protein: 0.2, carbohydrates: 12, fat: 0.1 }
      }
    ],
    commonConfusions: ['不同魚類可能混淆'],
    tags: ['日式', '壽司', '生食', '複雜'],
    notes: '多種魚類組合，需要精確識別',
    expectedChallenges: ['多種相似魚類', '份量估計困難', '需要區分不同魚種']
  }
];

// 計算統計數據
function calculateStatistics(testCases: TestCase[]): TestDataset['statistics'] {
  const categories: Record<string, number> = {};
  const difficulty: Record<string, number> = {};
  const cuisineTypes: Record<string, number> = {};

  testCases.forEach(tc => {
    categories[tc.category] = (categories[tc.category] || 0) + 1;
    difficulty[tc.difficulty] = (difficulty[tc.difficulty] || 0) + 1;
    cuisineTypes[tc.cuisineType] = (cuisineTypes[tc.cuisineType] || 0) + 1;
  });

  return {
    totalImages: testCases.length,
    categories,
    difficulty,
    cuisineTypes
  };
}

// 生成完整數據集
const dataset: TestDataset = {
  version: '1.0',
  description: '亞洲料理成分識別測試數據集 - 涵蓋不同地域和料理類型',
  testCases,
  statistics: calculateStatistics(testCases)
};

// 輸出 JSON 文件
const outputPath = path.join(__dirname, 'annotations', 'component-detection-annotations.json');
fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2), 'utf-8');

console.log(`✅ 測試數據集已生成: ${outputPath}`);
console.log(`📊 統計信息:`);
console.log(`   - 總測試案例: ${dataset.statistics.totalImages}`);
console.log(`   - 類別分布:`, dataset.statistics.categories);
console.log(`   - 難度分布:`, dataset.statistics.difficulty);
console.log(`   - 料理類型分布:`, dataset.statistics.cuisineTypes);
