import {
  HealthReport,
  DateRange,
  NutritionSummary,
  HealthTrend,
  Achievement,
  ReportSettings,
  ReportFrequency,
  DeliveryMethod,
  AggregatedNutritionData,
  TrendAnalysisResult
} from '../types/shared';

/**
 * 報告模板基礎類別
 */
export abstract class BaseReportTemplate {
  protected reportSettings: ReportSettings;

  constructor(settings: ReportSettings) {
    this.reportSettings = settings;
  }

  /**
   * 生成報告
   */
  abstract generateReport(
    userId: string,
    period: DateRange,
    data: AggregatedNutritionData,
    trends: TrendAnalysisResult,
    achievements: Achievement[]
  ): Promise<HealthReport>;

  /**
   * 格式化報告為 HTML
   */
  abstract formatAsHTML(report: HealthReport): Promise<string>;

  /**
   * 格式化報告為 PDF
   */
  abstract formatAsPDF(report: HealthReport): Promise<Buffer>;

  /**
   * 生成報告摘要
   */
  protected generateSummary(data: AggregatedNutritionData): string {
    const days = Math.ceil((data.period.end.getTime() - data.period.start.getTime()) / (1000 * 60 * 60 * 24));
    return `在過去 ${days} 天中，您總共攝取了 ${data.totalCalories.toFixed(0)} 大卡，平均每日 ${data.avgDailyCalories.toFixed(0)} 大卡。`;
  }

  /**
   * 生成營養素分析
   */
  protected generateNutritionAnalysis(data: AggregatedNutritionData): string[] {
    const analysis: string[] = [];
    
    // 熱量分析
    if (data.avgDailyCalories < 1200) {
      analysis.push('您的每日熱量攝取偏低，建議增加健康的高熱量食物。');
    } else if (data.avgDailyCalories > 2500) {
      analysis.push('您的每日熱量攝取較高，建議適度控制份量。');
    } else {
      analysis.push('您的每日熱量攝取在合理範圍內。');
    }

    // 蛋白質分析
    const days = Math.ceil((data.period.end.getTime() - data.period.start.getTime()) / (1000 * 60 * 60 * 24));
    const avgProtein = data.macronutrients.protein / days;
    if (avgProtein < 50) {
      analysis.push('建議增加蛋白質攝取，可選擇瘦肉、魚類、豆類等。');
    }

    return analysis;
  }
}
/**

 * 週報模板
 */
export class WeeklyReportTemplate extends BaseReportTemplate {
  async generateReport(
    userId: string,
    period: DateRange,
    data: AggregatedNutritionData,
    trends: TrendAnalysisResult,
    achievements: Achievement[]
  ): Promise<HealthReport> {
    const nutritionSummary: NutritionSummary = {
      totalCalories: data.totalCalories,
      avgDailyCalories: data.avgDailyCalories,
      macronutrients: data.macronutrients,
      micronutrients: data.micronutrients
    };

    const recommendations = [
      ...this.generateNutritionAnalysis(data),
      ...trends.recommendations.map(r => r.description)
    ];

    return {
      id: `weekly_${userId}_${Date.now()}`,
      userId,
      period,
      nutritionSummary,
      trends: trends.trends,
      recommendations,
      achievements,
      generatedAt: new Date()
    };
  }

  async formatAsHTML(report: HealthReport): Promise<string> {
    const startDate = report.period.start.toLocaleDateString('zh-TW');
    const endDate = report.period.end.toLocaleDateString('zh-TW');

    return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>週度健康報告</title>
    <style>
        body { font-family: 'Microsoft JhengHei', Arial, sans-serif; margin: 20px; color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #667eea; background: #f8f9fa; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .trend-up { color: #28a745; }
        .trend-down { color: #dc3545; }
        .trend-stable { color: #6c757d; }
        .chart-placeholder { height: 200px; background: #e9ecef; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h1>週度健康報告</h1>
        <p>${startDate} - ${endDate}</p>
    </div>

    <div class="section">
        <h2>📊 營養攝取摘要</h2>
        <div class="metric">
            <h3>總熱量</h3>
            <p>${report.nutritionSummary.totalCalories.toFixed(0)} 大卡</p>
        </div>
        <div class="metric">
            <h3>平均每日熱量</h3>
            <p>${report.nutritionSummary.avgDailyCalories.toFixed(0)} 大卡</p>
        </div>
        <div class="metric">
            <h3>蛋白質</h3>
            <p>${report.nutritionSummary.macronutrients.protein.toFixed(1)} 公克</p>
        </div>
        <div class="metric">
            <h3>碳水化合物</h3>
            <p>${report.nutritionSummary.macronutrients.carbohydrates.toFixed(1)} 公克</p>
        </div>
        <div class="metric">
            <h3>脂肪</h3>
            <p>${report.nutritionSummary.macronutrients.fat.toFixed(1)} 公克</p>
        </div>
    </div>

    <div class="section">
        <h2>📈 健康趨勢</h2>
        ${report.trends.map(trend => `
            <div class="metric">
                <h4>${this.getTrendTitle(trend.metric)}</h4>
                <p class="trend-${trend.direction}">${trend.description}</p>
                <small>變化: ${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)}%</small>
            </div>
        `).join('')}
    </div>

    ${this.reportSettings.includeCharts ? `
    <div class="section">
        <h2>📊 圖表分析</h2>
        <div class="chart-placeholder">
            圖表將在此顯示 (需要圖表庫支援)
        </div>
    </div>
    ` : ''}

    <div class="section">
        <h2>💡 個人化建議</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>

    ${report.achievements.length > 0 ? `
    <div class="section">
        <h2>🏆 本週成就</h2>
        ${report.achievements.map(achievement => `
            <div class="metric">
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <p><small>報告生成時間: ${report.generatedAt.toLocaleString('zh-TW')}</small></p>
    </div>
</body>
</html>`;
  }

  async formatAsPDF(report: HealthReport): Promise<Buffer> {
    // 這裡需要使用 PDF 生成庫，如 puppeteer 或 jsPDF
    // 暫時返回空的 Buffer，實際實作需要整合 PDF 庫
    const htmlContent = await this.formatAsHTML(report);
    
    // 模擬 PDF 生成
    return Buffer.from(`PDF Content for report ${report.id}\n${htmlContent}`, 'utf-8');
  }

  private getTrendTitle(metric: string): string {
    const titles: Record<string, string> = {
      calories: '熱量攝取',
      protein: '蛋白質攝取',
      carbohydrates: '碳水化合物攝取',
      fat: '脂肪攝取',
      fiber: '膳食纖維攝取',
      consistency: '飲食一致性'
    };
    return titles[metric] || metric;
  }
}

/**
 * 月報模板
 */
export class MonthlyReportTemplate extends BaseReportTemplate {
  async generateReport(
    userId: string,
    period: DateRange,
    data: AggregatedNutritionData,
    trends: TrendAnalysisResult,
    achievements: Achievement[]
  ): Promise<HealthReport> {
    const nutritionSummary: NutritionSummary = {
      totalCalories: data.totalCalories,
      avgDailyCalories: data.avgDailyCalories,
      macronutrients: data.macronutrients,
      micronutrients: data.micronutrients
    };

    const recommendations = [
      ...this.generateNutritionAnalysis(data),
      ...this.generateMonthlyInsights(data, trends),
      ...trends.recommendations.map(r => r.description)
    ];

    return {
      id: `monthly_${userId}_${Date.now()}`,
      userId,
      period,
      nutritionSummary,
      trends: trends.trends,
      recommendations,
      achievements,
      generatedAt: new Date()
    };
  }

  async formatAsHTML(report: HealthReport): Promise<string> {
    const startDate = report.period.start.toLocaleDateString('zh-TW');
    const endDate = report.period.end.toLocaleDateString('zh-TW');

    return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>月度健康報告</title>
    <style>
        body { font-family: 'Microsoft JhengHei', Arial, sans-serif; margin: 20px; color: #333; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; }
        .section { margin: 25px 0; padding: 20px; border-left: 5px solid #11998e; background: #f8f9fa; border-radius: 10px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .metric { padding: 20px; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
        .trend-up { color: #28a745; }
        .trend-down { color: #dc3545; }
        .trend-stable { color: #6c757d; }
        .highlight { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌟 月度健康報告</h1>
        <p>${startDate} - ${endDate}</p>
        <h3>您的健康旅程回顧</h3>
    </div>

    <div class="section">
        <h2>📊 月度營養概覽</h2>
        <div class="metric-grid">
            <div class="metric highlight">
                <h3>總熱量攝取</h3>
                <h2>${report.nutritionSummary.totalCalories.toFixed(0)}</h2>
                <p>大卡</p>
            </div>
            <div class="metric">
                <h3>平均每日熱量</h3>
                <h2>${report.nutritionSummary.avgDailyCalories.toFixed(0)}</h2>
                <p>大卡/天</p>
            </div>
            <div class="metric">
                <h3>蛋白質攝取</h3>
                <h2>${report.nutritionSummary.macronutrients.protein.toFixed(1)}</h2>
                <p>公克</p>
            </div>
            <div class="metric">
                <h3>碳水化合物</h3>
                <h2>${report.nutritionSummary.macronutrients.carbohydrates.toFixed(1)}</h2>
                <p>公克</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>📈 長期趨勢分析</h2>
        <div class="metric-grid">
            ${report.trends.map(trend => `
                <div class="metric">
                    <h4>${this.getTrendTitle(trend.metric)}</h4>
                    <p class="trend-${trend.direction}">${trend.description}</p>
                    <div style="font-size: 24px; margin: 10px 0;">
                        ${trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➡️'}
                    </div>
                    <small>變化幅度: ${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)}%</small>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>🎯 個人化建議與目標</h2>
        <div style="columns: 2; column-gap: 20px;">
            ${report.recommendations.map(rec => `<p>• ${rec}</p>`).join('')}
        </div>
    </div>

    ${report.achievements.length > 0 ? `
    <div class="section">
        <h2>🏆 本月成就與里程碑</h2>
        <div class="metric-grid">
            ${report.achievements.map(achievement => `
                <div class="metric highlight">
                    <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <div class="section">
        <p style="text-align: center;"><small>報告生成時間: ${report.generatedAt.toLocaleString('zh-TW')}</small></p>
    </div>
</body>
</html>`;
  }

  async formatAsPDF(report: HealthReport): Promise<Buffer> {
    const htmlContent = await this.formatAsHTML(report);
    return Buffer.from(`Monthly PDF Content for report ${report.id}\n${htmlContent}`, 'utf-8');
  }

  private getTrendTitle(metric: string): string {
    const titles: Record<string, string> = {
      calories: '熱量攝取趨勢',
      protein: '蛋白質攝取趨勢',
      carbohydrates: '碳水化合物趨勢',
      fat: '脂肪攝取趨勢',
      fiber: '膳食纖維趨勢',
      consistency: '飲食規律性'
    };
    return titles[metric] || metric;
  }

  private generateMonthlyInsights(data: AggregatedNutritionData, trends: TrendAnalysisResult): string[] {
    const insights: string[] = [];
    
    // 分析週平均一致性
    if (data.weeklyAverages.length > 0) {
      const avgConsistency = data.weeklyAverages.reduce((sum, week) => sum + week.consistency, 0) / data.weeklyAverages.length;
      if (avgConsistency > 0.8) {
        insights.push('您本月的飲食習慣非常規律，請繼續保持！');
      } else if (avgConsistency < 0.6) {
        insights.push('建議建立更規律的飲食習慣，這有助於達成健康目標。');
      }
    }

    // 分析趨勢穩定性
    const stableTrends = trends.trends.filter(t => t.direction === 'stable').length;
    if (stableTrends > trends.trends.length * 0.7) {
      insights.push('您的營養攝取模式相當穩定，這是健康飲食的好兆頭。');
    }

    return insights;
  }
}

/**
 * 報告模板工廠
 */
export class ReportTemplateFactory {
  static createTemplate(frequency: ReportFrequency, settings: ReportSettings): BaseReportTemplate {
    switch (frequency) {
      case ReportFrequency.WEEKLY:
        return new WeeklyReportTemplate(settings);
      case ReportFrequency.MONTHLY:
        return new MonthlyReportTemplate(settings);
      case ReportFrequency.DAILY:
        // 可以添加日報模板
        return new WeeklyReportTemplate(settings);
      default:
        return new WeeklyReportTemplate(settings);
    }
  }
}