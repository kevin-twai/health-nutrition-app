import { 
  AggregatedNutritionData, 
  HealthTrend, 
  DailyNutritionData,
  WeeklyNutritionData,
  MealType 
} from '../types/shared';

/**
 * 圖表資料介面
 */
export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  title: string;
  labels: string[];
  datasets: ChartDataset[];
  options?: ChartOptions;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartOptions {
  responsive?: boolean;
  plugins?: {
    legend?: { display: boolean };
    title?: { display: boolean; text: string };
  };
  scales?: {
    x?: { display?: boolean; title?: { display: boolean; text: string } };
    y?: { display?: boolean; title?: { display: boolean; text: string } };
  };
}

/**
 * 圖表生成器
 * 負責為報告生成各種圖表資料
 */
export class ChartGenerator {
  /**
   * 生成每日熱量趨勢圖
   */
  generateDailyCaloriesTrend(dailyData: DailyNutritionData[]): ChartData {
    const labels = dailyData.map(d => d.date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }));
    const data = dailyData.map(d => d.calories);

    return {
      type: 'line',
      title: '每日熱量攝取趨勢',
      labels,
      datasets: [{
        label: '熱量 (大卡)',
        data,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 2,
        fill: true
      }],
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: '每日熱量攝取趨勢' },
          legend: { display: false }
        },
        scales: {
          x: { display: true, title: { display: true, text: '日期' } },
          y: { display: true, title: { display: true, text: '熱量 (大卡)' } }
        }
      }
    };
  }

  /**
   * 生成營養素分布圓餅圖
   */
  generateMacronutrientDistribution(data: AggregatedNutritionData): ChartData {
    const proteinCalories = data.macronutrients.protein * 4;
    const carbCalories = data.macronutrients.carbohydrates * 4;
    const fatCalories = data.macronutrients.fat * 9;
    const total = proteinCalories + carbCalories + fatCalories;

    if (total === 0) {
      return {
        type: 'pie',
        title: '營養素分布',
        labels: ['無資料'],
        datasets: [{
          label: '比例',
          data: [1],
          backgroundColor: ['#e9ecef']
        }]
      };
    }

    const proteinPercent = (proteinCalories / total * 100).toFixed(1);
    const carbPercent = (carbCalories / total * 100).toFixed(1);
    const fatPercent = (fatCalories / total * 100).toFixed(1);

    return {
      type: 'doughnut',
      title: '營養素熱量分布',
      labels: [
        `蛋白質 (${proteinPercent}%)`,
        `碳水化合物 (${carbPercent}%)`,
        `脂肪 (${fatPercent}%)`
      ],
      datasets: [{
        label: '熱量比例',
        data: [proteinCalories, carbCalories, fatCalories],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        borderWidth: 2
      }],
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: '營養素熱量分布' },
          legend: { display: true }
        }
      }
    };
  }

  /**
   * 生成餐點分布圖
   */
  generateMealDistribution(data: AggregatedNutritionData): ChartData {
    const mealLabels = ['早餐', '午餐', '晚餐', '點心'];
    const mealData = [
      data.mealDistribution.breakfast * 100,
      data.mealDistribution.lunch * 100,
      data.mealDistribution.dinner * 100,
      data.mealDistribution.snack * 100
    ];

    return {
      type: 'bar',
      title: '餐點熱量分布',
      labels: mealLabels,
      datasets: [{
        label: '熱量比例 (%)',
        data: mealData,
        backgroundColor: ['#ff9f43', '#10ac84', '#5f27cd', '#ff6b6b'],
        borderWidth: 1
      }],
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: '餐點熱量分布' },
          legend: { display: false }
        },
        scales: {
          x: { display: true, title: { display: true, text: '餐點類型' } },
          y: { display: true, title: { display: true, text: '熱量比例 (%)' } }
        }
      }
    };
  }

  /**
   * 生成週平均營養素趨勢圖
   */
  generateWeeklyNutritionTrend(weeklyData: WeeklyNutritionData[]): ChartData {
    const labels = weeklyData.map(w => 
      `${w.weekStart.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}`
    );

    return {
      type: 'line',
      title: '週平均營養素趨勢',
      labels,
      datasets: [
        {
          label: '熱量',
          data: weeklyData.map(w => w.avgCalories),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 2
        },
        {
          label: '蛋白質 (×10)',
          data: weeklyData.map(w => w.avgProtein * 10),
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          borderWidth: 2
        },
        {
          label: '碳水化合物 (×5)',
          data: weeklyData.map(w => w.avgCarbohydrates * 5),
          borderColor: '#ffc107',
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          borderWidth: 2
        }
      ],
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: '週平均營養素趨勢' },
          legend: { display: true }
        },
        scales: {
          x: { display: true, title: { display: true, text: '週次' } },
          y: { display: true, title: { display: true, text: '數值' } }
        }
      }
    };
  }

  /**
   * 生成飲食一致性圖表
   */
  generateConsistencyChart(weeklyData: WeeklyNutritionData[]): ChartData {
    const labels = weeklyData.map(w => 
      `第${weeklyData.indexOf(w) + 1}週`
    );
    const consistencyData = weeklyData.map(w => w.consistency * 100);

    return {
      type: 'bar',
      title: '飲食一致性評分',
      labels,
      datasets: [{
        label: '一致性評分 (%)',
        data: consistencyData,
        backgroundColor: consistencyData.map(score => 
          score >= 80 ? '#28a745' : score >= 60 ? '#ffc107' : '#dc3545'
        ),
        borderWidth: 1
      }],
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: '飲食一致性評分' },
          legend: { display: false }
        },
        scales: {
          x: { display: true, title: { display: true, text: '週次' } },
          y: { 
            display: true,
            title: { display: true, text: '一致性評分 (%)' }
          }
        }
      }
    };
  }

  /**
   * 生成趨勢變化圖表
   */
  generateTrendChart(trends: HealthTrend[]): ChartData {
    const labels = trends.map(t => this.getTrendLabel(t.metric));
    const changes = trends.map(t => t.change);
    
    return {
      type: 'bar',
      title: '健康指標變化',
      labels,
      datasets: [{
        label: '變化百分比 (%)',
        data: changes,
        backgroundColor: changes.map(change => 
          change > 5 ? '#28a745' : change < -5 ? '#dc3545' : '#6c757d'
        ),
        borderWidth: 1
      }],
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: '健康指標變化' },
          legend: { display: false }
        },
        scales: {
          x: { display: true, title: { display: true, text: '健康指標' } },
          y: { display: true, title: { display: true, text: '變化百分比 (%)' } }
        }
      }
    };
  }

  /**
   * 生成綜合健康評分雷達圖
   */
  generateHealthScoreRadar(scores: {
    nutrition: number;
    consistency: number;
    balance: number;
    variety: number;
    adequacy: number;
  }): ChartData {
    return {
      type: 'line', // 在實際實作中應該是 'radar'，但這裡簡化為線圖
      title: '綜合健康評分',
      labels: ['營養充足', '飲食規律', '營養平衡', '食物多樣', '攝取適量'],
      datasets: [{
        label: '健康評分',
        data: [
          scores.nutrition * 100,
          scores.consistency * 100,
          scores.balance * 100,
          scores.variety * 100,
          scores.adequacy * 100
        ],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderWidth: 2
      }],
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: '綜合健康評分' },
          legend: { display: false }
        }
      }
    };
  }

  /**
   * 將圖表資料轉換為 Chart.js 配置
   */
  toChartJsConfig(chartData: ChartData): any {
    return {
      type: chartData.type,
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets
      },
      options: chartData.options || {}
    };
  }

  /**
   * 生成圖表的 HTML 嵌入代碼
   */
  generateChartHTML(chartData: ChartData, canvasId: string): string {
    const config = JSON.stringify(this.toChartJsConfig(chartData));
    
    return `
      <div style="position: relative; height: 400px; margin: 20px 0;">
        <canvas id="${canvasId}"></canvas>
      </div>
      <script>
        const ctx${canvasId} = document.getElementById('${canvasId}').getContext('2d');
        new Chart(ctx${canvasId}, ${config});
      </script>
    `;
  }

  /**
   * 獲取趨勢標籤
   */
  private getTrendLabel(metric: string): string {
    const labels: Record<string, string> = {
      calories: '熱量',
      protein: '蛋白質',
      carbohydrates: '碳水化合物',
      fat: '脂肪',
      fiber: '膳食纖維',
      consistency: '飲食規律'
    };
    return labels[metric] || metric;
  }
}