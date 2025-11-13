/**
 * 內容過濾服務 - 確保對話內容的安全性和適當性
 */
export class ContentFilterService {
  private readonly inappropriateWords: string[] = [
    // 醫療診斷相關
    '診斷', '確診', '患病', '得病',
    // 極端減重相關
    '絕食', '不吃飯', '極端減重',
    // 藥物相關
    '服藥', '吃藥', '藥物治療'
  ];

  private readonly medicalTerms: string[] = [
    '糖尿病', '高血壓', '心臟病', '癌症', '腫瘤',
    '肝病', '腎病', '甲狀腺', '憂鬱症', '焦慮症'
  ];

  private readonly sensitivePatterns: RegExp[] = [
    // 信用卡號
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,
    // 電話號碼
    /\b\d{2,4}[-\s]?\d{3,4}[-\s]?\d{3,4}\b/,
    // 電子郵件
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    // 身分證號格式
    /\b[A-Z]\d{9}\b/
  ];

  /**
   * 檢查用戶輸入內容
   */
  checkUserInput(content: string): {
    isAllowed: boolean;
    issues: string[];
    filteredContent?: string;
  } {
    const issues: string[] = [];
    let filteredContent = content;

    // 檢查敏感個人資訊
    this.sensitivePatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        const issueTypes = ['信用卡號', '電話號碼', '電子郵件', '身分證號'];
        issues.push(`包含${issueTypes[index]}`);
        filteredContent = filteredContent.replace(pattern, '[已過濾]');
      }
    });

    // 檢查不當詞彙
    this.inappropriateWords.forEach(word => {
      if (content.includes(word)) {
        issues.push(`包含不當詞彙: ${word}`);
      }
    });

    // 檢查是否詢問醫療診斷
    if (this.containsMedicalDiagnosisRequest(content)) {
      issues.push('詢問醫療診斷相關問題');
    }

    // 檢查內容長度
    if (content.length > 2000) {
      issues.push('內容過長');
    }

    return {
      isAllowed: issues.length === 0,
      issues,
      filteredContent: issues.length > 0 ? filteredContent : undefined
    };
  }

  /**
   * 檢查 AI 回應內容
   */
  checkAIResponse(content: string): {
    isAllowed: boolean;
    issues: string[];
    filteredContent?: string;
  } {
    const issues: string[] = [];
    let filteredContent = content;

    // 檢查是否包含醫療診斷
    if (this.containsMedicalDiagnosis(content)) {
      issues.push('包含醫療診斷內容');
    }

    // 檢查是否包含不安全的健康建議
    if (this.containsUnsafeHealthAdvice(content)) {
      issues.push('包含不安全的健康建議');
    }

    // 檢查是否包含藥物建議
    if (this.containsMedicationAdvice(content)) {
      issues.push('包含藥物建議');
    }

    // 檢查是否包含極端飲食建議
    if (this.containsExtremeDietAdvice(content)) {
      issues.push('包含極端飲食建議');
    }

    return {
      isAllowed: issues.length === 0,
      issues,
      filteredContent: issues.length > 0 ? this.sanitizeResponse(content) : undefined
    };
  }

  /**
   * 檢查是否包含醫療診斷請求
   */
  private containsMedicalDiagnosisRequest(content: string): boolean {
    const diagnosisPatterns = [
      /我是不是.*病/,
      /我得了.*嗎/,
      /這是.*病.*症狀嗎/,
      /我患有.*嗎/,
      /診斷.*我/,
      /我有.*疾病嗎/
    ];

    return diagnosisPatterns.some(pattern => pattern.test(content));
  }

  /**
   * 檢查是否包含醫療診斷
   */
  private containsMedicalDiagnosis(content: string): boolean {
    const diagnosisPatterns = [
      /你患有|你得了|你被診斷為/,
      /這是.*病|.*疾病的症狀/,
      /你的症狀表明/,
      /根據症狀.*可能是/
    ];

    return diagnosisPatterns.some(pattern => pattern.test(content));
  }

  /**
   * 檢查是否包含不安全的健康建議
   */
  private containsUnsafeHealthAdvice(content: string): boolean {
    const unsafePatterns = [
      /每天少於.*卡路里/,
      /完全不吃.*餐/,
      /長期.*禁食/,
      /極端.*減重/,
      /快速.*減重.*公斤/
    ];

    return unsafePatterns.some(pattern => pattern.test(content));
  }

  /**
   * 檢查是否包含藥物建議
   */
  private containsMedicationAdvice(content: string): boolean {
    const medicationPatterns = [
      /建議.*服用.*藥/,
      /你需要.*藥物/,
      /應該.*吃.*藥/,
      /建議.*用藥/
    ];

    return medicationPatterns.some(pattern => pattern.test(content));
  }

  /**
   * 檢查是否包含極端飲食建議
   */
  private containsExtremeDietAdvice(content: string): boolean {
    const extremePatterns = [
      /完全不吃.*類食物/,
      /永遠不要吃/,
      /絕對禁止.*食物/,
      /只吃.*其他都不吃/
    ];

    return extremePatterns.some(pattern => pattern.test(content));
  }

  /**
   * 清理回應內容
   */
  private sanitizeResponse(content: string): string {
    let sanitized = content;

    // 替換醫療診斷相關內容
    sanitized = sanitized.replace(
      /(你患有|你得了|診斷為)[^。！？]*/g,
      '建議諮詢專業醫療人員'
    );

    // 替換藥物建議
    sanitized = sanitized.replace(
      /(服用|吃|使用).*藥[^。！？]*/g,
      '如需用藥請諮詢醫師'
    );

    // 替換極端飲食建議
    sanitized = sanitized.replace(
      /(完全不吃|絕對禁止|永遠不要吃)[^。！？]*/g,
      '建議適量攝取各類營養'
    );

    return sanitized;
  }

  /**
   * 生成安全的替代回應
   */
  generateSafeAlternativeResponse(originalContent: string, issues: string[]): string {
    if (issues.includes('詢問醫療診斷相關問題')) {
      return '我無法提供醫療診斷。如果您有健康方面的疑慮，建議諮詢專業醫療人員。我可以幫您討論一般的營養和健康生活方式。';
    }

    if (issues.includes('包含醫療診斷內容')) {
      return '我不能提供醫療診斷。建議您就健康問題諮詢合格的醫療專業人員。我很樂意協助您了解一般的營養知識和健康飲食建議。';
    }

    if (issues.includes('包含不安全的健康建議')) {
      return '健康的生活方式需要循序漸進。我建議您採用均衡飲食和適量運動的方式來達成健康目標。如需個人化的健康計劃，請諮詢營養師或醫療專業人員。';
    }

    if (issues.includes('包含藥物建議')) {
      return '關於藥物或補充品的使用，請務必諮詢醫師或藥師。我可以協助您了解從天然食物中獲取營養的方法。';
    }

    // 預設安全回應
    return '感謝您的提問。為了您的安全，我建議就具體的健康問題諮詢專業醫療人員。我很樂意協助您了解一般的營養知識和健康飲食方式。';
  }

  /**
   * 檢查內容是否適合特定年齡群體
   */
  checkAgeAppropriate(content: string, userAge?: number): {
    isAppropriate: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (userAge && userAge < 18) {
      // 未成年人的特殊檢查
      if (content.includes('減重') || content.includes('減肥')) {
        issues.push('未成年人減重建議需要家長和醫師指導');
      }

      if (content.includes('補充品') || content.includes('營養品')) {
        issues.push('未成年人使用補充品需要醫師建議');
      }
    }

    if (userAge && userAge > 65) {
      // 高齡者的特殊檢查
      if (content.includes('劇烈運動') || content.includes('高強度')) {
        issues.push('高齡者運動建議需要醫師評估');
      }
    }

    return {
      isAppropriate: issues.length === 0,
      issues
    };
  }

  /**
   * 記錄過濾事件
   */
  logFilterEvent(
    userId: string,
    content: string,
    issues: string[],
    action: 'blocked' | 'filtered' | 'warned'
  ): void {
    // 實際實作時應該記錄到日誌系統
    console.log(`內容過濾事件 - 用戶: ${userId}, 動作: ${action}, 問題: ${issues.join(', ')}`);
  }

  /**
   * 獲取過濾統計
   */
  getFilterStats(): {
    totalChecks: number;
    blockedContent: number;
    filteredContent: number;
    commonIssues: string[];
  } {
    // 實際實作時應該從資料庫獲取統計資料
    return {
      totalChecks: 0,
      blockedContent: 0,
      filteredContent: 0,
      commonIssues: []
    };
  }
}