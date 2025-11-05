// MongoDB 初始化腳本
// 健康營養追蹤系統

// 切換到應用資料庫
db = db.getSiblingDB('health_tracker_nutrition');

// 創建用戶
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'health_tracker_nutrition'
    }
  ]
});

// 創建食物資料集合
db.createCollection('foods', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'nutrition'],
      properties: {
        name: {
          bsonType: 'string',
          description: '食物名稱'
        },
        nutrition: {
          bsonType: 'object',
          required: ['calories', 'protein', 'carbs', 'fat'],
          properties: {
            calories: { bsonType: 'number' },
            protein: { bsonType: 'number' },
            carbs: { bsonType: 'number' },
            fat: { bsonType: 'number' },
            fiber: { bsonType: 'number' },
            sugar: { bsonType: 'number' },
            sodium: { bsonType: 'number' }
          }
        },
        category: {
          bsonType: 'string',
          description: '食物分類'
        },
        brand: {
          bsonType: 'string',
          description: '品牌'
        },
        barcode: {
          bsonType: 'string',
          description: '條碼'
        }
      }
    }
  }
});

// 創建食物日誌集合
db.createCollection('food_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'foodId', 'quantity', 'loggedAt'],
      properties: {
        userId: {
          bsonType: 'string',
          description: '用戶 ID'
        },
        foodId: {
          bsonType: 'string',
          description: '食物 ID'
        },
        quantity: {
          bsonType: 'number',
          minimum: 0,
          description: '食用量'
        },
        unit: {
          bsonType: 'string',
          description: '單位'
        },
        loggedAt: {
          bsonType: 'date',
          description: '記錄時間'
        }
      }
    }
  }
});

// 創建索引
db.foods.createIndex({ name: 'text', category: 1 });
db.foods.createIndex({ barcode: 1 }, { unique: true, sparse: true });
db.food_logs.createIndex({ userId: 1, loggedAt: -1 });
db.food_logs.createIndex({ foodId: 1 });

// 插入一些基礎食物資料
db.foods.insertMany([
  {
    name: '白米飯',
    category: '主食',
    nutrition: {
      calories: 130,
      protein: 2.7,
      carbs: 28,
      fat: 0.3,
      fiber: 0.4,
      sugar: 0.1,
      sodium: 1
    },
    unit: '100g',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: '雞胸肉',
    category: '蛋白質',
    nutrition: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74
    },
    unit: '100g',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: '花椰菜',
    category: '蔬菜',
    nutrition: {
      calories: 25,
      protein: 3,
      carbs: 5,
      fat: 0.3,
      fiber: 2.6,
      sugar: 1.5,
      sodium: 33
    },
    unit: '100g',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: '香蕉',
    category: '水果',
    nutrition: {
      calories: 89,
      protein: 1.1,
      carbs: 23,
      fat: 0.3,
      fiber: 2.6,
      sugar: 12,
      sodium: 1
    },
    unit: '100g',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('MongoDB 初始化完成！');
print('- 創建了 health_tracker_nutrition 資料庫');
print('- 創建了 foods 和 food_logs 集合');
print('- 插入了基礎食物資料');
print('- 設定了必要的索引');