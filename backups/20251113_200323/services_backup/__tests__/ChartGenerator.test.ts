import { ChartGenerator } from '../ChartGenerator';
import { MealType } from '@health-tracker/shared-types';

describe('ChartGenerator', () => {
  let chartGenerator: ChartGenerator;

  beforeEach(() => {
    chartGenerator = new ChartGenerator();
  });

  const mockDailyData = [
    {
      date: new Date('2024-01-01'),
      calories: 1800,
      protein: 80,
      carbohydrates: 200,
      fat: 60,
      fiber: 25,
      mealCounts: {
        [MealType.BREAKFAST]: 1,
        [MealType.LUNCH]: 1,
        [MealType.DINNER]: 1,
        [MealType.SNACK]: 1
      }
    },
    {
      date: new Date('2024-01-02'),
      calories: 2000,
      protein: 90,
      carbohydrates: 220,
      fat: 70,
      fiber: 30,
      mealCounts: {
        [MealType.BREAKFAST]: 1,
        [MealType.LUNCH]: 1,
        [MealType.DINNER]: 1,
        [MealType.SNACK]: 0
      }
    },
    {
      date: new Date('2024-01-03'),
      calories: 1900,
      protein: 85,
      carbohydrates: 210,
      fat: 65,
      fiber: 28,
      mealCounts: {
        [MealType.BREAKFAST]: 1,
        [MealType.LUNCH]: 1,
        [MealType.DINNER]: 1,
        [MealType.SNACK]: 1
      }
    }
  ];

  const mockAggregatedData = {
    period: {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-07')
    },
    totalCalories: 13300,
    avgDailyCalories: 1900,
    macronutrients: {
      protein: 595, // 85g/day average
      carbohydrates: 1470, // 210g/day average
      fat: 455, // 65g/day average
      fiber: 196 // 28g/day average
    },
    micronutrients: {
      vitamins: {},
      minerals: {}
    },
    mealDistribution: {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.35,
      snack: 0.05
    },
    dailyBreakdown: mockDailyData,
    weeklyAverages: [
      {
        weekStart: new Date('2024-01-01'),
        weekEnd: new Date('2024-01-07'),
        avgCalories: 1900,
        avgProtein: 85,
        avgCarbohydrates: 210,
        avgFat: 65,
        avgFiber: 28,
        consistency: 0.85
      }
    ]
  };

  const mockTrends = [
    {
      metric: 'calories',
      change: 5.2,
      direction: 'up' as const,
      significance: 'medium' as const,
      period: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      },
      description: '熱量攝取增加了 5.2%'
    },
    {
      metric: 'protein',
      change: -2.1,
      direction: 'down' as const,
      significance: 'low' as const,
      period: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07')
      },
      description: '蛋白質攝取減少了 2.1%'
    }
  ];

  describe('generateDailyCaloriesTrend', () => {
    it('應該生成每日熱量趨勢圖資料', () => {
      const chartData = chartGenerator.generateDailyCaloriesTrend(mockDailyData);

      expect(chartData.type).toBe('line');
      expect(chartData.title).toBe('每日熱量攝取趨勢');
      expect(chartData.labels).toHaveLength(3);
      expect(chartData.labels[0]).toContain('1月');
      expect(chartData.datasets).toHaveLength(1);
      expect(chartData.datasets[0].label).toBe('熱量 (大卡)');
      expect(chartData.datasets[0].data).toEqual([1800, 2000, 1900]);
      expect(chartData.datasets[0].borderColor).toBe('#667eea');
      expect(chartData.options?.responsive).toBe(true);
    });

    it('應該處理空資料', () => {
      const chartData = chartGenerator.generateDailyCaloriesTrend([]);

      expect(chartData.labels).toHaveLength(0);
      expect(chartData.datasets[0].data).toHaveLength(0);
    });
  });

  describe('generateMacronutrientDistribution', () => {
    it('應該生成營養素分布圓餅圖', () => {
      const chartData = chartGenerator.generateMacronutrientDistribution(mockAggregatedData);

      expect(chartData.type).toBe('doughnut');
      expect(chartData.title).toBe('營養素熱量分布');
      expect(chartData.labels).toHaveLength(3);
      expect(chartData.labels[0]).toContain('蛋白質');
      expect(chartData.labels[1]).toContain('碳水化合物');
      expect(chartData.labels[2]).toContain('脂肪');
      
      expect(chartData.datasets).toHaveLength(1);
      expect(chartData.datasets[0].data).toHaveLength(3);
      
      // 驗證熱量計算：蛋白質 595*4, 碳水化合物 1470*4, 脂肪 455*9
      expect(chartData.datasets[0].data[0]).toBe(2380); // 蛋白質熱量
      expect(chartData.datasets[0].data[1]).toBe(5880); // 碳水化合物熱量
      expect(chartData.datasets[0].data[2]).toBe(4095); // 脂肪熱量
      
      expect(chartData.datasets[0].backgroundColor).toEqual(['#28a745', '#ffc107', '#dc3545']);
    });

    it('應該處理零熱量的情況', () => {
      const zeroData = {
        ...mockAggregatedData,
        macronutrients: {
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          fiber: 0
        }
      };

      const chartData = chartGenerator.generateMacronutrientDistribution(zeroData);

      expect(chartData.labels).toEqual(['無資料']);
      expect(chartData.datasets[0].data).toEqual([1]);
      expect(chartData.datasets[0].backgroundColor).toEqual(['#e9ecef']);
    });
  });

  describe('generateMealDistribution', () => {
    it('應該生成餐點分布圖', () => {
      const chartData = chartGenerator.generateMealDistribution(mockAggregatedData);

      expect(chartData.type).toBe('bar');
      expect(chartData.title).toBe('餐點熱量分布');
      expect(chartData.labels).toEqual(['早餐', '午餐', '晚餐', '點心']);
      
      expect(chartData.datasets).toHaveLength(1);
      expect(chartData.datasets[0].label).toBe('熱量比例 (%)');
      expect(chartData.datasets[0].data).toEqual([25, 35, 35, 5]); // 轉換為百分比
      expect(chartData.datasets[0].backgroundColor).toHaveLength(4);
    });
  });

  describe('generateWeeklyNutritionTrend', () => {
    it('應該生成週平均營養素趨勢圖', () => {
      const chartData = chartGenerator.generateWeeklyNutritionTrend(mockAggregatedData.weeklyAverages);

      expect(chartData.type).toBe('line');
      expect(chartData.title).toBe('週平均營養素趨勢');
      expect(chartData.labels).toHaveLength(1);
      expect(chartData.datasets).toHaveLength(3);
      
      expect(chartData.datasets[0].label).toBe('熱量');
      expect(chartData.datasets[0].data).toEqual([1900]);
      
      expect(chartData.datasets[1].label).toBe('蛋白質 (×10)');
      expect(chartData.datasets[1].data).toEqual([850]); // 85 * 10
      
      expect(chartData.datasets[2].label).toBe('碳水化合物 (×5)');
      expect(chartData.datasets[2].data).toEqual([1050]); // 210 * 5
    });

    it('應該處理空的週資料', () => {
      const chartData = chartGenerator.generateWeeklyNutritionTrend([]);

      expect(chartData.labels).toHaveLength(0);
      expect(chartData.datasets[0].data).toHaveLength(0);
    });
  });

  describe('generateConsistencyChart', () => {
    it('應該生成飲食一致性圖表', () => {
      const chartData = chartGenerator.generateConsistencyChart(mockAggregatedData.weeklyAverages);

      expect(chartData.type).toBe('bar');
      expect(chartData.title).toBe('飲食一致性評分');
      expect(chartData.labels).toEqual(['第1週']);
      
      expect(chartData.datasets).toHaveLength(1);
      expect(chartData.datasets[0].label).toBe('一致性評分 (%)');
      expect(chartData.datasets[0].data).toEqual([85]); // 0.85 * 100
      
      // 檢查顏色映射（85% 應該是綠色）
      expect(chartData.datasets[0].backgroundColor).toEqual(['#28a745']);
    });

    it('應該根據評分設定不同顏色', () => {
      const weeklyData = [
        {
          weekStart: new Date('2024-01-01'),
          weekEnd: new Date('2024-01-07'),
          avgCalories: 1900,
          avgProtein: 85,
          avgCarbohydrates: 210,
          avgFat: 65,
          avgFiber: 28,
          consistency: 0.9 // 90% - 綠色
        },
        {
          weekStart: new Date('2024-01-08'),
          weekEnd: new Date('2024-01-14'),
          avgCalories: 1800,
          avgProtein: 80,
          avgCarbohydrates: 200,
          avgFat: 60,
          avgFiber: 25,
          consistency: 0.7 // 70% - 黃色
        },
        {
          weekStart: new Date('2024-01-15'),
          weekEnd: new Date('2024-01-21'),
          avgCalories: 1700,
          avgProtein: 75,
          avgCarbohydrates: 190,
          avgFat: 55,
          avgFiber: 22,
          consistency: 0.5 // 50% - 紅色
        }
      ];

      const chartData = chartGenerator.generateConsistencyChart(weeklyData);

      expect(chartData.datasets[0].backgroundColor).toEqual(['#28a745', '#ffc107', '#dc3545']);
    });
  });

  describe('generateTrendChart', () => {
    it('應該生成趨勢變化圖表', () => {
      const chartData = chartGenerator.generateTrendChart(mockTrends);

      expect(chartData.type).toBe('bar');
      expect(chartData.title).toBe('健康指標變化');
      expect(chartData.labels).toEqual(['熱量', '蛋白質']);
      
      expect(chartData.datasets).toHaveLength(1);
      expect(chartData.datasets[0].label).toBe('變化百分比 (%)');
      expect(chartData.datasets[0].data).toEqual([5.2, -2.1]);
      
      // 檢查顏色映射
      expect(chartData.datasets[0].backgroundColor).toEqual(['#28a745', '#6c757d']); // 5.2% > 5% 為綠色，-2.1% 在範圍內為灰色
    });

    it('應該根據變化幅度設定顏色', () => {
      const extremeTrends = [
        {
          metric: 'calories',
          change: 10, // > 5% - 綠色
          direction: 'up' as const,
          significance: 'high' as const,
          period: { start: new Date(), end: new Date() },
          description: '大幅增加'
        },
        {
          metric: 'protein',
          change: -8, // < -5% - 紅色
          direction: 'down' as const,
          significance: 'high' as const,
          period: { start: new Date(), end: new Date() },
          description: '大幅減少'
        }
      ];

      const chartData = chartGenerator.generateTrendChart(extremeTrends);

      expect(chartData.datasets[0].backgroundColor).toEqual(['#28a745', '#dc3545']);
    });
  });

  describe('generateHealthScoreRadar', () => {
    it('應該生成綜合健康評分雷達圖', () => {
      const scores = {
        nutrition: 0.8,
        consistency: 0.9,
        balance: 0.75,
        variety: 0.6,
        adequacy: 0.85
      };

      const chartData = chartGenerator.generateHealthScoreRadar(scores);

      expect(chartData.type).toBe('line'); // 簡化為線圖
      expect(chartData.title).toBe('綜合健康評分');
      expect(chartData.labels).toEqual(['營養充足', '飲食規律', '營養平衡', '食物多樣', '攝取適量']);
      
      expect(chartData.datasets).toHaveLength(1);
      expect(chartData.datasets[0].label).toBe('健康評分');
      expect(chartData.datasets[0].data).toEqual([80, 90, 75, 60, 85]); // 轉換為百分比
    });
  });

  describe('toChartJsConfig', () => {
    it('應該轉換為 Chart.js 配置格式', () => {
      const chartData = chartGenerator.generateDailyCaloriesTrend(mockDailyData);
      const config = chartGenerator.toChartJsConfig(chartData);

      expect(config).toHaveProperty('type', 'line');
      expect(config).toHaveProperty('data');
      expect(config.data).toHaveProperty('labels');
      expect(config.data).toHaveProperty('datasets');
      expect(config).toHaveProperty('options');
    });
  });

  describe('generateChartHTML', () => {
    it('應該生成圖表的 HTML 嵌入代碼', () => {
      const chartData = chartGenerator.generateDailyCaloriesTrend(mockDailyData);
      const html = chartGenerator.generateChartHTML(chartData, 'myChart');

      expect(html).toContain('<canvas id="myChart"></canvas>');
      expect(html).toContain('const ctxmyChart = document.getElementById(\'myChart\')');
      expect(html).toContain('new Chart(ctxmyChart,');
      expect(html).toContain('"type":"line"');
    });
  });
});