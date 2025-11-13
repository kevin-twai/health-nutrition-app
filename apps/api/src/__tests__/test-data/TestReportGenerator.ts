/**
 * 測試報告生成器
 * 生成詳細的準確度測試報告，包含錯誤分析和改進建議
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  AccuracyMetrics,
  TestResult,
  MistakePattern,
  CategoryMetrics,
  DifficultyMetrics
} from './AccuracyTester';

export interface ReportOptions {
  outputDir?: string;
  format?: 'markdown' | 'json' | 'html';
  includeDetailedResults?: boolean;
  includeConfusionMatrix?: boolean;
  includeRecommendations?: boolean;
}

export class TestReportGenerator {
  private outputDir: string;

  constructor(outputDir?: string) {
    this.outputDir = outputDir || path.join(__dirname, 'test-results');
    this.ensureOutputDir();
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * 生成完整報告
   */
  async generateReport(
    metrics: AccuracyMetrics,
    testResults: TestResult[],
    mistakePatterns: MistakePattern[],
    options: ReportOptions = {}
  ): Promise<string> {
    const format = options.format || 'markdown';

    switch (format) {
      case 'markdown':
        return this.generateMarkdownReport(metrics, testResults, mistakePatterns, options);
      case 'json':
        return this.generateJsonReport(metrics, testResults, mistakePatterns);
      case 'html':
        return this.generateHtmlReport(metrics, testResults, mistakePatterns, options);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * 生成 Markdown 格式報告
   */
  private generateMarkdownReport(
    metrics: AccuracyMetrics,
    testResults: TestResult[],
    mistakePatterns: MistakePattern[],
    options: ReportOptions
  ): string {
    let report = '';

    // 標題和摘要
    report += '# 食物識別準確度測試報告\n\n';
    report += `生成時間: ${new Date().toLocaleString('zh-TW')}\n\n`;

    // 整體指標
    report += '## 整體指標\n\n';
    report += this.generateMetricsSummary(metrics);

    // 類別指標
    report += '\n## 各類別表現\n\n';
    report += this.generateCategoryMetricsTable(metrics.categoryMetrics);

    // 難度指標
    report += '\n## 各難度表現\n\n';
    report += this.generateDifficultyMetricsTable(metrics.difficultyMetrics);

    // 混淆矩陣
    if (options.includeConfusionMatrix !== false) {
      report += '\n## 混淆矩陣\n\n';
      report += this.generateConfusionMatrixTable(metrics.confusionMatrix);
    }

    // 常見錯誤模式
    report += '\n## 常見錯誤模式\n\n';
    report += this.generateMistakePatternsTable(mistakePatterns);

    // 失敗案例分析
    const failedTests = testResults.filter(r => !r.correct);
    if (failedTests.length > 0) {
      report += '\n## 失敗案例分析\n\n';
      report += this.generateFailedTestsAnalysis(failedTests);
    }

    // 改進建議
    if (options.includeRecommendations !== false) {
      report += '\n## 改進建議\n\n';
      report += this.generateRecommendations(metrics, mistakePatterns, failedTests);
    }

    // 詳細結果
    if (options.includeDetailedResults) {
      report += '\n## 詳細測試結果\n\n';
      report += this.generateDetailedResults(testResults);
    }

    return report;
  }

  /**
   * 生成指標摘要
   */
  private generateMetricsSummary(metrics: AccuracyMetrics): string {
    let summary = '';
    summary += `- **總測試數**: ${metrics.totalTests}\n`;
    summary += `- **正確測試數**: ${metrics.correctTests}\n`;
    summary += `- **準確率 (Accuracy)**: ${(metrics.accuracy * 100).toFixed(2)}%\n`;
    summary += `- **精確率 (Precision)**: ${(metrics.precision * 100).toFixed(2)}%\n`;
    summary += `- **召回率 (Recall)**: ${(metrics.recall * 100).toFixed(2)}%\n`;
    summary += `- **F1 分數**: ${(metrics.f1Score * 100).toFixed(2)}%\n`;
    summary += `- **平均信心度**: ${(metrics.avgConfidence * 100).toFixed(2)}%\n`;
    summary += `- **平均處理時間**: ${metrics.avgProcessingTime.toFixed(0)}ms\n`;

    // 目標達成情況
    summary += '\n### 目標達成情況\n\n';
    summary += this.generateGoalAchievement(metrics);

    return summary;
  }

  /**
   * 生成目標達成情況
   */
  private generateGoalAchievement(metrics: AccuracyMetrics): string {
    const goals = [
      { name: '整體準確率', target: 0.85, actual: metrics.accuracy },
      { name: '精確率', target: 0.90, actual: metrics.precision },
      { name: '召回率', target: 0.85, actual: metrics.recall },
      { name: 'F1 分數', target: 0.88, actual: metrics.f1Score }
    ];

    let result = '| 指標 | 目標 | 實際 | 狀態 |\n';
    result += '|------|------|------|------|\n';

    for (const goal of goals) {
      const status = goal.actual >= goal.target ? '✅ 達成' : '❌ 未達成';
      result += `| ${goal.name} | ${(goal.target * 100).toFixed(0)}% | ${(goal.actual * 100).toFixed(2)}% | ${status} |\n`;
    }

    return result;
  }

  /**
   * 生成類別指標表格
   */
  private generateCategoryMetricsTable(categoryMetrics: Map<string, CategoryMetrics>): string {
    let table = '| 類別 | 測試數 | 正確數 | 準確率 | 精確率 | 召回率 | F1 |\n';
    table += '|------|--------|--------|--------|--------|--------|----|\n';

    for (const [_, metrics] of categoryMetrics) {
      table += `| ${metrics.category} `;
      table += `| ${metrics.totalTests} `;
      table += `| ${metrics.correctTests} `;
      table += `| ${(metrics.accuracy * 100).toFixed(1)}% `;
      table += `| ${(metrics.precision * 100).toFixed(1)}% `;
      table += `| ${(metrics.recall * 100).toFixed(1)}% `;
      table += `| ${(metrics.f1Score * 100).toFixed(1)}% |\n`;
    }

    return table;
  }

  /**
   * 生成難度指標表格
   */
  private generateDifficultyMetricsTable(difficultyMetrics: Map<string, DifficultyMetrics>): string {
    let table = '| 難度 | 測試數 | 正確數 | 準確率 | 平均信心度 |\n';
    table += '|------|--------|--------|--------|------------|\n';

    const order = ['easy', 'medium', 'hard'];
    for (const difficulty of order) {
      const metrics = difficultyMetrics.get(difficulty);
      if (metrics) {
        table += `| ${metrics.difficulty} `;
        table += `| ${metrics.totalTests} `;
        table += `| ${metrics.correctTests} `;
        table += `| ${(metrics.accuracy * 100).toFixed(1)}% `;
        table += `| ${(metrics.avgConfidence * 100).toFixed(1)}% |\n`;
      }
    }

    return table;
  }

  /**
   * 生成混淆矩陣表格
   */
  private generateConfusionMatrixTable(confusionMatrix: Map<string, Map<string, number>>): string {
    let table = '### 前 10 個最常見的混淆\n\n';
    table += '| 預期食材 | 識別為 | 次數 |\n';
    table += '|----------|--------|------|\n';

    // 收集所有混淆並排序
    const confusions: Array<{ expected: string; recognized: string; count: number }> = [];
    
    for (const [expected, recognizedMap] of confusionMatrix) {
      for (const [recognized, count] of recognizedMap) {
        if (expected !== recognized) {
          confusions.push({ expected, recognized, count });
        }
      }
    }

    confusions.sort((a, b) => b.count - a.count);

    // 只顯示前 10 個
    for (const confusion of confusions.slice(0, 10)) {
      table += `| ${confusion.expected} | ${confusion.recognized} | ${confusion.count} |\n`;
    }

    return table;
  }

  /**
   * 生成錯誤模式表格
   */
  private generateMistakePatternsTable(mistakePatterns: MistakePattern[]): string {
    let table = '| 錯誤識別 | 正確答案 | 頻率 | 平均信心度 |\n';
    table += '|----------|----------|------|------------|\n';

    // 只顯示前 15 個最常見的錯誤
    for (const pattern of mistakePatterns.slice(0, 15)) {
      table += `| ${pattern.incorrectIdentification} `;
      table += `| ${pattern.correctIdentification} `;
      table += `| ${pattern.frequency} `;
      table += `| ${(pattern.avgConfidence * 100).toFixed(1)}% |\n`;
    }

    return table;
  }

  /**
   * 生成失敗案例分析
   */
  private generateFailedTestsAnalysis(failedTests: TestResult[]): string {
    let analysis = `總共 ${failedTests.length} 個失敗案例\n\n`;

    // 按類別分組
    const byCategory = new Map<string, TestResult[]>();
    for (const test of failedTests) {
      const category = test.testCase.category;
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push(test);
    }

    analysis += '### 按類別分布\n\n';
    for (const [category, tests] of byCategory) {
      analysis += `- **${category}**: ${tests.length} 個失敗\n`;
    }

    // 列出前 5 個最嚴重的失敗案例
    analysis += '\n### 最嚴重的失敗案例\n\n';
    const sortedByMissing = [...failedTests].sort(
      (a, b) => b.missingFoods.length - a.missingFoods.length
    );

    for (const test of sortedByMissing.slice(0, 5)) {
      analysis += `#### ${test.testCase.imageId}\n\n`;
      analysis += `- **類別**: ${test.testCase.category}\n`;
      analysis += `- **難度**: ${test.testCase.difficulty}\n`;
      analysis += `- **遺漏食材**: ${test.missingFoods.join(', ') || '無'}\n`;
      analysis += `- **額外食材**: ${test.extraFoods.join(', ') || '無'}\n`;
      analysis += `- **信心度**: ${(test.recognitionResult.overallConfidence * 100).toFixed(1)}%\n`;
      if (test.errors && test.errors.length > 0) {
        analysis += `- **錯誤**: ${test.errors.join('; ')}\n`;
      }
      analysis += '\n';
    }

    return analysis;
  }

  /**
   * 生成改進建議
   */
  private generateRecommendations(
    metrics: AccuracyMetrics,
    mistakePatterns: MistakePattern[],
    failedTests: TestResult[]
  ): string {
    const recommendations: string[] = [];

    // 基於整體指標的建議
    if (metrics.accuracy < 0.85) {
      recommendations.push('**整體準確率未達標 (< 85%)**');
      recommendations.push('  - 建議加強 Prompt 工程，提供更詳細的食材描述');
      recommendations.push('  - 考慮增加知識庫中的食材數據');
      recommendations.push('  - 檢查圖片預處理流程是否需要優化');
    }

    if (metrics.recall < 0.85) {
      recommendations.push('**召回率未達標 (< 85%)**');
      recommendations.push('  - 系統遺漏了太多食材，建議：');
      recommendations.push('  - 在 Prompt 中強調「識別所有可見食材」');
      recommendations.push('  - 增加混合食材菜餚的訓練案例');
      recommendations.push('  - 優化多階段識別流程，確保不遺漏小型食材');
    }

    if (metrics.precision < 0.90) {
      recommendations.push('**精確率未達標 (< 90%)**');
      recommendations.push('  - 系統識別出太多錯誤食材，建議：');
      recommendations.push('  - 加強結果驗證規則');
      recommendations.push('  - 在 Prompt 中加入易混淆食材的區分指引');
      recommendations.push('  - 提高信心度閾值，減少低信心度的識別結果');
    }

    // 基於錯誤模式的建議
    if (mistakePatterns.length > 0) {
      recommendations.push('**常見錯誤模式分析**');
      
      const topMistakes = mistakePatterns.slice(0, 5);
      for (const mistake of topMistakes) {
        if (mistake.frequency >= 2) {
          recommendations.push(`  - **${mistake.incorrectIdentification} → ${mistake.correctIdentification}** (${mistake.frequency} 次)`);
          recommendations.push(`    建議在知識庫中加強這兩者的區分特徵描述`);
        }
      }
    }

    // 基於類別表現的建議
    for (const [_, categoryMetric] of metrics.categoryMetrics) {
      if (categoryMetric.accuracy < 0.80) {
        recommendations.push(`**${categoryMetric.category} 類別表現不佳 (${(categoryMetric.accuracy * 100).toFixed(1)}%)**`);
        recommendations.push(`  - 建議為此類別創建專門的 Prompt 模板`);
        recommendations.push(`  - 增加此類別的測試案例和訓練數據`);
      }
    }

    // 基於難度表現的建議
    const hardMetrics = metrics.difficultyMetrics.get('hard');
    if (hardMetrics && hardMetrics.accuracy < 0.70) {
      recommendations.push('**高難度案例表現不佳**');
      recommendations.push('  - 考慮為高難度案例啟用更多識別階段');
      recommendations.push('  - 增加專家知識庫的覆蓋範圍');
      recommendations.push('  - 提供更詳細的視覺特徵描述');
    }

    // 基於處理時間的建議
    if (metrics.avgProcessingTime > 8000) {
      recommendations.push('**處理時間過長 (> 8秒)**');
      recommendations.push('  - 優化 API 調用策略，減少不必要的重試');
      recommendations.push('  - 考慮實施結果緩存機制');
      recommendations.push('  - 檢查圖片壓縮是否過度影響性能');
    }

    // 具體的 Prompt 優化建議
    recommendations.push('**Prompt 優化建議**');
    const confusedPairs = this.identifyConfusedPairs(mistakePatterns);
    if (confusedPairs.length > 0) {
      recommendations.push('  - 在 Prompt 中加入以下易混淆食材的區分指引：');
      for (const pair of confusedPairs.slice(0, 5)) {
        recommendations.push(`    - ${pair[0]} vs ${pair[1]}`);
      }
    }

    // 知識庫擴充建議
    const missingFoods = this.identifyMissingFoods(failedTests);
    if (missingFoods.length > 0) {
      recommendations.push('**知識庫擴充建議**');
      recommendations.push('  - 以下食材經常被遺漏，建議加入知識庫：');
      for (const food of missingFoods.slice(0, 10)) {
        recommendations.push(`    - ${food.name} (遺漏 ${food.count} 次)`);
      }
    }

    return recommendations.join('\n');
  }

  /**
   * 識別易混淆的食材對
   */
  private identifyConfusedPairs(mistakePatterns: MistakePattern[]): Array<[string, string]> {
    const pairs: Array<[string, string]> = [];
    
    for (const pattern of mistakePatterns) {
      if (pattern.frequency >= 2 && !pattern.incorrectIdentification.includes('未識別')) {
        pairs.push([pattern.incorrectIdentification, pattern.correctIdentification]);
      }
    }

    return pairs;
  }

  /**
   * 識別經常被遺漏的食材
   */
  private identifyMissingFoods(failedTests: TestResult[]): Array<{ name: string; count: number }> {
    const missingCount = new Map<string, number>();

    for (const test of failedTests) {
      for (const missing of test.missingFoods) {
        missingCount.set(missing, (missingCount.get(missing) || 0) + 1);
      }
    }

    const result = Array.from(missingCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return result;
  }

  /**
   * 生成詳細結果
   */
  private generateDetailedResults(testResults: TestResult[]): string {
    let details = '';

    for (const result of testResults) {
      details += `### ${result.testCase.imageId}\n\n`;
      details += `- **狀態**: ${result.correct ? '✅ 成功' : '❌ 失敗'}\n`;
      details += `- **類別**: ${result.testCase.category}\n`;
      details += `- **難度**: ${result.testCase.difficulty}\n`;
      details += `- **處理時間**: ${result.processingTime}ms\n`;
      details += `- **信心度**: ${(result.recognitionResult.overallConfidence * 100).toFixed(1)}%\n`;
      
      if (result.correctFoods.length > 0) {
        details += `- **正確識別**: ${result.correctFoods.join(', ')}\n`;
      }
      if (result.missingFoods.length > 0) {
        details += `- **遺漏食材**: ${result.missingFoods.join(', ')}\n`;
      }
      if (result.extraFoods.length > 0) {
        details += `- **額外食材**: ${result.extraFoods.join(', ')}\n`;
      }
      if (result.errors && result.errors.length > 0) {
        details += `- **錯誤**: ${result.errors.join('; ')}\n`;
      }
      
      details += '\n';
    }

    return details;
  }

  /**
   * 生成 JSON 格式報告
   */
  private generateJsonReport(
    metrics: AccuracyMetrics,
    testResults: TestResult[],
    mistakePatterns: MistakePattern[]
  ): string {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: {
        totalTests: metrics.totalTests,
        correctTests: metrics.correctTests,
        accuracy: metrics.accuracy,
        precision: metrics.precision,
        recall: metrics.recall,
        f1Score: metrics.f1Score,
        avgConfidence: metrics.avgConfidence,
        avgProcessingTime: metrics.avgProcessingTime
      },
      categoryMetrics: Array.from(metrics.categoryMetrics.values()),
      difficultyMetrics: Array.from(metrics.difficultyMetrics.values()),
      mistakePatterns: mistakePatterns.slice(0, 20),
      testResults: testResults.map(r => ({
        imageId: r.testCase.imageId,
        correct: r.correct,
        correctFoods: r.correctFoods,
        missingFoods: r.missingFoods,
        extraFoods: r.extraFoods,
        processingTime: r.processingTime,
        confidence: r.recognitionResult.overallConfidence
      }))
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * 生成 HTML 格式報告
   */
  private generateHtmlReport(
    metrics: AccuracyMetrics,
    testResults: TestResult[],
    mistakePatterns: MistakePattern[],
    options: ReportOptions
  ): string {
    // 先生成 Markdown，然後轉換為 HTML
    const markdown = this.generateMarkdownReport(metrics, testResults, mistakePatterns, options);
    
    // 簡單的 Markdown 到 HTML 轉換
    let html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>食物識別準確度測試報告</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; border-bottom: 2px solid #4CAF50; }
    h2 { color: #555; margin-top: 30px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .metric { background-color: #e8f5e9; padding: 10px; margin: 10px 0; border-radius: 5px; }
  </style>
</head>
<body>
${this.markdownToHtml(markdown)}
</body>
</html>`;

    return html;
  }

  /**
   * 簡單的 Markdown 到 HTML 轉換
   */
  private markdownToHtml(markdown: string): string {
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$2</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  }

  /**
   * 保存報告到文件
   */
  async saveReport(content: string, filename: string): Promise<string> {
    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, content, 'utf-8');
    return filepath;
  }

  /**
   * 生成並保存報告
   */
  async generateAndSave(
    metrics: AccuracyMetrics,
    testResults: TestResult[],
    mistakePatterns: MistakePattern[],
    options: ReportOptions = {}
  ): Promise<string> {
    const format = options.format || 'markdown';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `accuracy-report-${timestamp}.${format === 'markdown' ? 'md' : format}`;

    const content = await this.generateReport(metrics, testResults, mistakePatterns, options);
    return this.saveReport(content, filename);
  }
}
