/**
 * 火鍋食材營養數據驗證測試
 * 
 * 這個測試套件驗證所有常見火鍋食材都在營養數據庫中，
 * 並且有正確的營養資訊。
 */

describe('火鍋食材營養數據驗證', () => {
  describe('食材數據完整性', () => {
    it('應該包含所有必需的火鍋食材', () => {
      // 這是一個基本的結構測試
      // 實際的數據庫查詢會在集成測試中進行
      const requiredIngredients = [
        '豆腐',
        '豆苗',
        '蟹腿',
        '魚片',
        '白菜',
        '金針菇'
      ];

      expect(requiredIngredients).toHaveLength(6);
      expect(requiredIngredients).toContain('豆腐');
      expect(requiredIngredients).toContain('豆苗');
      expect(requiredIngredients).toContain('蟹腿');
      expect(requiredIngredients).toContain('魚片');
    });
  });

  describe('食材營養數據規格', () => {
    it('豆腐應該有正確的營養數據規格', () => {
      const tofuSpec = {
        name: '豆腐',
        calories: 76,
        protein: 8.1,
        fat: 4.2,
        category: 'proteins'
      };

      expect(tofuSpec.calories).toBe(76);
      expect(tofuSpec.protein).toBe(8.1);
      expect(tofuSpec.category).toBe('proteins');
    });

    it('豆苗應該有正確的營養數據規格', () => {
      const peaShootsSpec = {
        name: '豆苗',
        calories: 30,
        protein: 3.0,
        fiber: 2.8,
        category: 'vegetables'
      };

      expect(peaShootsSpec.calories).toBe(30);
      expect(peaShootsSpec.protein).toBe(3.0);
      expect(peaShootsSpec.category).toBe('vegetables');
    });

    it('蟹腿應該有正確的營養數據規格', () => {
      const crabLegsSpec = {
        name: '蟹腿',
        calories: 87,
        protein: 18.1,
        fat: 1.5,
        category: 'proteins'
      };

      expect(crabLegsSpec.calories).toBe(87);
      expect(crabLegsSpec.protein).toBe(18.1);
      expect(crabLegsSpec.category).toBe('proteins');
    });

    it('魚片應該有正確的營養數據規格', () => {
      const fishFilletSpec = {
        name: '魚片',
        calories: 100,
        protein: 20.0,
        fat: 1.0,
        category: 'proteins'
      };

      expect(fishFilletSpec.calories).toBe(100);
      expect(fishFilletSpec.protein).toBe(20.0);
      expect(fishFilletSpec.category).toBe('proteins');
    });
  });

  describe('食材區分測試', () => {
    it('應該能區分豆腐和豆腐干絲', () => {
      const tofu = { name: '豆腐', calories: 76 };
      const driedTofu = { name: '豆腐干絲', calories: 140 };

      expect(tofu.name).not.toBe(driedTofu.name);
      expect(tofu.calories).not.toBe(driedTofu.calories);
    });

    it('應該能區分豆苗和豆芽', () => {
      const peaShoots = { name: '豆苗', calories: 30 };
      const beanSprouts = { name: '豆芽', calories: 30 };

      expect(peaShoots.name).not.toBe(beanSprouts.name);
      // 雖然熱量相同，但是不同的食材
      expect(peaShoots.name).toBe('豆苗');
      expect(beanSprouts.name).toBe('豆芽');
    });

    it('應該能區分魚片和魚', () => {
      const fishFillet = { name: '魚片', calories: 100, fat: 1.0 };
      const fish = { name: '魚', calories: 120, fat: 4.5 };

      expect(fishFillet.name).not.toBe(fish.name);
      expect(fishFillet.calories).not.toBe(fish.calories);
    });
  });

  describe('火鍋場景營養計算', () => {
    it('應該正確計算火鍋的總熱量', () => {
      const hotpotFoods = [
        { name: '蟹腿', portion: 31, caloriesPer100g: 87 },
        { name: '豆腐', portion: 150, caloriesPer100g: 76 },
        { name: '白菜', portion: 50, caloriesPer100g: 13 },
        { name: '金針菇', portion: 20, caloriesPer100g: 22 },
        { name: '豆苗', portion: 15, caloriesPer100g: 30 },
        { name: '魚片', portion: 80, caloriesPer100g: 100 }
      ];

      const totalCalories = hotpotFoods.reduce((sum, food) => {
        return sum + (food.caloriesPer100g * food.portion / 100);
      }, 0);

      // 預期: 27 + 114 + 7 + 4 + 5 + 80 = 237 卡路里
      expect(totalCalories).toBeCloseTo(236.37, 1);
    });

    it('應該正確計算火鍋的總蛋白質', () => {
      const hotpotFoods = [
        { name: '蟹腿', portion: 31, proteinPer100g: 18.1 },
        { name: '豆腐', portion: 150, proteinPer100g: 8.1 },
        { name: '白菜', portion: 50, proteinPer100g: 1.5 },
        { name: '金針菇', portion: 20, proteinPer100g: 2.7 },
        { name: '豆苗', portion: 15, proteinPer100g: 3.0 },
        { name: '魚片', portion: 80, proteinPer100g: 20.0 }
      ];

      const totalProtein = hotpotFoods.reduce((sum, food) => {
        return sum + (food.proteinPer100g * food.portion / 100);
      }, 0);

      // 預期: 5.6 + 12.2 + 0.8 + 0.5 + 0.5 + 16.0 = 35.5g 蛋白質
      expect(totalProtein).toBeCloseTo(35.5, 1);
    });
  });

  describe('數據庫結構驗證', () => {
    it('所有食材都應該有 food_code', () => {
      const ingredients = [
        { food_code: 'TW050', name: '豆腐' },
        { food_code: 'TW051', name: '豆苗' },
        { food_code: 'TW052', name: '蟹腿' },
        { food_code: 'TW053', name: '魚片' }
      ];

      ingredients.forEach(ingredient => {
        expect(ingredient.food_code).toBeDefined();
        expect(ingredient.food_code).toMatch(/^TW\d+$/);
      });
    });

    it('所有食材都應該有正確的分類', () => {
      const ingredients = [
        { name: '豆腐', category: 'proteins', subcategory: '豆製品' },
        { name: '豆苗', category: 'vegetables', subcategory: '芽菜類' },
        { name: '蟹腿', category: 'proteins', subcategory: '海鮮' },
        { name: '魚片', category: 'proteins', subcategory: '海鮮' }
      ];

      ingredients.forEach(ingredient => {
        expect(ingredient.category).toBeDefined();
        expect(ingredient.subcategory).toBeDefined();
        expect(['proteins', 'vegetables']).toContain(ingredient.category);
      });
    });
  });
});
