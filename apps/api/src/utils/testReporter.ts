import fs from 'fs';
import path from 'path';

export interface TestResult {
  testSuite: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  timestamp: Date;
}

export interface TestSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
  testResults: TestResult[];
  timestamp: Date;
}

export class TestReporter {
  private results: TestResult[] = [];
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  addResult(result: TestResult): void {
    this.results.push(result);
  }

  generateSummary(): TestSummary {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'passed').length;
    const failedTests = this.results.filter(r => r.status === 'failed').length;
    const skippedTests = this.results.filter(r => r.status === 'skipped').length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    return {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      totalDuration,
      testResults: this.results,
      timestamp: new Date()
    };
  }

  generateHTMLReport(): string {
    const summary = this.generateSummary();
    const passRate = ((summary.passedTests / summary.totalTests) * 100).toFixed(2);

    return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>端到端測試報告</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .summary-card .number {
            font-size: 2em;
            font-weight: bold;
            margin: 10px 0;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .total { color: #007bff; }
        .results {
            padding: 30px;
        }
        .results h2 {
            margin-bottom: 20px;
            color: #333;
        }
        .test-result {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
            border-left: 4px solid;
        }
        .test-result.passed {
            background: #d4edda;
            border-left-color: #28a745;
        }
        .test-result.failed {
            background: #f8d7da;
            border-left-color: #dc3545;
        }
        .test-result.skipped {
            background: #fff3cd;
            border-left-color: #ffc107;
        }
        .test-info {
            flex: 1;
        }
        .test-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .test-suite {
            color: #666;
            font-size: 0.9em;
        }
        .test-duration {
            color: #666;
            font-size: 0.9em;
        }
        .error-message {
            margin-top: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.8em;
            color: #dc3545;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #dee2e6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>端到端測試報告</h1>
            <p>健康營養追蹤系統 - 測試執行時間: ${summary.timestamp.toLocaleString('zh-TW')}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>總測試數</h3>
                <div class="number total">${summary.totalTests}</div>
            </div>
            <div class="summary-card">
                <h3>通過測試</h3>
                <div class="number passed">${summary.passedTests}</div>
            </div>
            <div class="summary-card">
                <h3>失敗測試</h3>
                <div class="number failed">${summary.failedTests}</div>
            </div>
            <div class="summary-card">
                <h3>跳過測試</h3>
                <div class="number skipped">${summary.skippedTests}</div>
            </div>
            <div class="summary-card">
                <h3>通過率</h3>
                <div class="number total">${passRate}%</div>
            </div>
            <div class="summary-card">
                <h3>總執行時間</h3>
                <div class="number total">${(summary.totalDuration / 1000).toFixed(2)}s</div>
            </div>
        </div>
        
        <div class="results">
            <h2>測試結果詳情</h2>
            ${summary.testResults.map(result => `
                <div class="test-result ${result.status}">
                    <div class="test-info">
                        <div class="test-name">${result.testName}</div>
                        <div class="test-suite">${result.testSuite}</div>
                        ${result.error ? `<div class="error-message">${result.error}</div>` : ''}
                    </div>
                    <div class="test-duration">${result.duration}ms</div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>報告生成時間: ${new Date().toLocaleString('zh-TW')}</p>
            <p>健康營養追蹤系統 © 2024</p>
        </div>
    </div>
</body>
</html>`;
  }

  saveReport(outputDir: string = './test-reports'): void {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const summary = this.generateSummary();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // 儲存JSON報告
    const jsonReport = JSON.stringify(summary, null, 2);
    fs.writeFileSync(
      path.join(outputDir, `e2e-report-${timestamp}.json`),
      jsonReport
    );

    // 儲存HTML報告
    const htmlReport = this.generateHTMLReport();
    fs.writeFileSync(
      path.join(outputDir, `e2e-report-${timestamp}.html`),
      htmlReport
    );

    // 儲存最新報告（覆蓋）
    fs.writeFileSync(
      path.join(outputDir, 'latest-report.json'),
      jsonReport
    );
    fs.writeFileSync(
      path.join(outputDir, 'latest-report.html'),
      htmlReport
    );

    console.log(`測試報告已儲存到: ${outputDir}`);
  }

  generateSlackMessage(): string {
    const summary = this.generateSummary();
    const passRate = ((summary.passedTests / summary.totalTests) * 100).toFixed(2);
    const status = summary.failedTests === 0 ? '✅' : '❌';

    return `
${status} *端到端測試報告*

📊 *測試摘要*
• 總測試數: ${summary.totalTests}
• 通過: ${summary.passedTests} ✅
• 失敗: ${summary.failedTests} ❌
• 跳過: ${summary.skippedTests} ⏭️
• 通過率: ${passRate}%
• 執行時間: ${(summary.totalDuration / 1000).toFixed(2)}秒

${summary.failedTests > 0 ? `
⚠️ *失敗的測試*
${summary.testResults
  .filter(r => r.status === 'failed')
  .map(r => `• ${r.testSuite}: ${r.testName}`)
  .join('\n')}
` : ''}

🕐 測試時間: ${summary.timestamp.toLocaleString('zh-TW')}
`;
  }

  generateEmailReport(): { subject: string; html: string } {
    const summary = this.generateSummary();
    const passRate = ((summary.passedTests / summary.totalTests) * 100).toFixed(2);
    const status = summary.failedTests === 0 ? '通過' : '失敗';

    return {
      subject: `端到端測試報告 - ${status} (${passRate}% 通過率)`,
      html: this.generateHTMLReport()
    };
  }
}

// Jest 自訂報告器
export class JestTestReporter {
  private reporter: TestReporter;

  constructor() {
    this.reporter = new TestReporter();
  }

  onRunComplete(contexts: any, results: any): void {
    results.testResults.forEach((testResult: any) => {
      testResult.testResults.forEach((test: any) => {
        this.reporter.addResult({
          testSuite: testResult.testFilePath.split('/').pop() || 'Unknown',
          testName: test.fullName,
          status: test.status === 'passed' ? 'passed' : 
                  test.status === 'failed' ? 'failed' : 'skipped',
          duration: test.duration || 0,
          error: test.failureMessages?.[0],
          timestamp: new Date()
        });
      });
    });

    this.reporter.saveReport();

    // 如果有環境變數設定，發送通知
    if (process.env.SLACK_WEBHOOK_URL) {
      this.sendSlackNotification();
    }

    if (process.env.EMAIL_NOTIFICATION && process.env.SMTP_CONFIG) {
      this.sendEmailNotification();
    }
  }

  private async sendSlackNotification(): Promise<void> {
    try {
      const message = this.reporter.generateSlackMessage();
      const response = await fetch(process.env.SLACK_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });

      if (!response.ok) {
        console.error('Slack 通知發送失敗:', response.statusText);
      }
    } catch (error) {
      console.error('Slack 通知發送錯誤:', error);
    }
  }

  private async sendEmailNotification(): Promise<void> {
    try {
      const nodemailer = require('nodemailer');
      const smtpConfig = JSON.parse(process.env.SMTP_CONFIG!);
      
      const transporter = nodemailer.createTransporter(smtpConfig);
      const emailReport = this.reporter.generateEmailReport();

      await transporter.sendMail({
        from: smtpConfig.auth.user,
        to: process.env.EMAIL_NOTIFICATION,
        subject: emailReport.subject,
        html: emailReport.html
      });

      console.log('Email 通知發送成功');
    } catch (error) {
      console.error('Email 通知發送錯誤:', error);
    }
  }
}