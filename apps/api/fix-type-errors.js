#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 修復文件的函數
function fixFile(filePath, fixes) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    fixes.forEach(fix => {
      if (content.includes(fix.search)) {
        content = content.replace(new RegExp(fix.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.replace);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ 修復: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ 錯誤 ${filePath}:`, error.message);
  }
}

// 修復 Food.ts - 添加可選鏈
const foodFixes = [
  {
    search: "nutritionPer100g.vitamins.vitaminA",
    replace: "nutritionPer100g.vitamins?.vitaminA"
  },
  {
    search: "nutritionPer100g.vitamins.vitaminC",
    replace: "nutritionPer100g.vitamins?.vitaminC"
  },
  {
    search: "nutritionPer100g.vitamins.vitaminD",
    replace: "nutritionPer100g.vitamins?.vitaminD"
  },
  {
    search: "nutritionPer100g.vitamins.vitaminE",
    replace: "nutritionPer100g.vitamins?.vitaminE"
  },
  {
    search: "nutritionPer100g.vitamins.vitaminK",
    replace: "nutritionPer100g.vitamins?.vitaminK"
  },
  {
    search: "nutritionPer100g.vitamins.thiamine",
    replace: "nutritionPer100g.vitamins?.thiamine"
  },
  {
    search: "nutritionPer100g.vitamins.riboflavin",
    replace: "nutritionPer100g.vitamins?.riboflavin"
  },
  {
    search: "nutritionPer100g.vitamins.niacin",
    replace: "nutritionPer100g.vitamins?.niacin"
  },
  {
    search: "nutritionPer100g.vitamins.vitaminB6",
    replace: "nutritionPer100g.vitamins?.vitaminB6"
  },
  {
    search: "nutritionPer100g.vitamins.folate",
    replace: "nutritionPer100g.vitamins?.folate"
  },
  {
    search: "nutritionPer100g.vitamins.vitaminB12",
    replace: "nutritionPer100g.vitamins?.vitaminB12"
  },
  {
    search: "nutritionPer100g.minerals.calcium",
    replace: "nutritionPer100g.minerals?.calcium"
  },
  {
    search: "nutritionPer100g.minerals.iron",
    replace: "nutritionPer100g.minerals?.iron"
  },
  {
    search: "nutritionPer100g.minerals.magnesium",
    replace: "nutritionPer100g.minerals?.magnesium"
  },
  {
    search: "nutritionPer100g.minerals.phosphorus",
    replace: "nutritionPer100g.minerals?.phosphorus"
  },
  {
    search: "nutritionPer100g.minerals.potassium",
    replace: "nutritionPer100g.minerals?.potassium"
  },
  {
    search: "nutritionPer100g.minerals.zinc",
    replace: "nutritionPer100g.minerals?.zinc"
  },
  {
    search: "nutritionPer100g.minerals.copper",
    replace: "nutritionPer100g.minerals?.copper"
  },
  {
    search: "nutritionPer100g.minerals.manganese",
    replace: "nutritionPer100g.minerals?.manganese"
  },
  {
    search: "nutritionPer100g.minerals.selenium",
    replace: "nutritionPer100g.minerals?.selenium"
  },
  {
    search: "vitamins.vitaminA",
    replace: "vitamins?.vitaminA"
  },
  {
    search: "vitamins.vitaminC",
    replace: "vitamins?.vitaminC"
  },
  {
    search: "vitamins.vitaminD",
    replace: "vitamins?.vitaminD"
  },
  {
    search: "vitamins.vitaminE",
    replace: "vitamins?.vitaminE"
  },
  {
    search: "vitamins.vitaminK",
    replace: "vitamins?.vitaminK"
  },
  {
    search: "vitamins.thiamine",
    replace: "vitamins?.thiamine"
  },
  {
    search: "vitamins.riboflavin",
    replace: "vitamins?.riboflavin"
  },
  {
    search: "vitamins.niacin",
    replace: "vitamins?.niacin"
  },
  {
    search: "vitamins.vitaminB6",
    replace: "vitamins?.vitaminB6"
  },
  {
    search: "vitamins.folate",
    replace: "vitamins?.folate"
  },
  {
    search: "vitamins.vitaminB12",
    replace: "vitamins?.vitaminB12"
  },
  {
    search: "minerals.calcium",
    replace: "minerals?.calcium"
  },
  {
    search: "minerals.iron",
    replace: "minerals?.iron"
  },
  {
    search: "minerals.magnesium",
    replace: "minerals?.magnesium"
  },
  {
    search: "minerals.phosphorus",
    replace: "minerals?.phosphorus"
  },
  {
    search: "minerals.potassium",
    replace: "minerals?.potassium"
  },
  {
    search: "minerals.zinc",
    replace: "minerals?.zinc"
  },
  {
    search: "minerals.copper",
    replace: "minerals?.copper"
  },
  {
    search: "minerals.manganese",
    replace: "minerals?.manganese"
  },
  {
    search: "minerals.selenium",
    replace: "minerals?.selenium"
  }
];

// 執行修復
console.log('開始修復類型錯誤...\n');

fixFile('apps/api/src/models/Food.ts', foodFixes);
fixFile('apps/api/src/services/NutritionCalculator.ts', foodFixes);

console.log('\n修復完成！');
