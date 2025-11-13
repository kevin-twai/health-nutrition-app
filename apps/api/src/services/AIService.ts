import { 
  ChatMessage, 
  MessageRole, 
  ConversationContext,
  NutritionAnalysis,
  Recommendation,
  RecommendationType,
  Priority,
  HealthGoal,
  UserProfile
} from '../types/shared';

/**
 * AI 服務 - 整合 OpenAI GPT API 進行智能對話
 */
export class AIService {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';
  private model: string = 'gpt-4';
  private maxTokens: number = 1000;
  private temperature: number = 0.7;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OpenAI API 金鑰未設定');
    }
  }

  /**
   * 生成 AI 回應
   */
  async generateResponse(
    messages: ChatMessage[],
    context: ConversationContext,
    userProfile?: UserProfile
  ): Promise<{
    message: string;
    suggestions: string[];
    confidence: number;
    metadata?: any;
  }> {
    try {
      const systemPrompt = this.buildSystemPrompt(context, userProfile);
      const conversationMessages = this.formatMessagesForAPI(messages, systemPrompt);

      const response = await this.callOpenAI(conversationMessages);
      
      // 解析回應並提取建議
      const parsedResponse = this.parseAIResponse(response);
      
      // 內容安全性檢查
      const safetyCheck = this.checkResponseSafety(parsedResponse.message);
      if (!safetyCheck.isSafe) {
        throw new Error('AI 回應包含不當內容');
      }

      return {
        message: parsedResponse.message,
        suggestions: parsedResponse.suggestions,
        confidence: parsedResponse.confidence,
        metadata: {
          model: this.model,
          processingTime: Date.now(),
          safetyChecked: true
        }
      };
    } catch (error) {
      console.error('AI 服務錯誤:', error);
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
    }
  }

  /**
   * 建立系統提示詞
   */
  private buildSystemPrompt(context: ConversationContext, userProfile?: UserProfile): string {
    const basePrompt = `你是一位專業的營養師和健康顧問，專門幫助用戶改善飲食習慣和達成健康目標。

你的特點：
- 提供基於科學的營養建議
- 考慮用戶的個人情況和偏好
- 使用友善、鼓勵的語調
- 避免給出醫療診斷或治療建議
- 建議用戶在必要時諮詢醫療專業人員

回應格式要求：
- 主要回應內容
- 提供 2-3 個具體的行動建議
- 保持回應簡潔但有用（200-400 字）

`;

    let contextPrompt = '';
    
    // 添加用戶檔案資訊
    if (userProfile) {
      contextPrompt += `用戶資訊：
- 年齡：${userProfile.age} 歲
- 性別：${userProfile.gender}
- 身高：${userProfile.height} 公分
- 體重：${userProfile.weight} 公斤
- 活動水平：${userProfile.activityLevel}

`;
    }

    // 添加健康目標
    if (context.healthGoals && context.healthGoals.length > 0) {
      contextPrompt += `健康目標：\n`;
      context.healthGoals.forEach(goal => {
        contextPrompt += `- ${goal.type}: 目標 ${goal.target}，目前 ${goal.current}\n`;
      });
      contextPrompt += '\n';
    }

    // 添加最近營養資料
    if (context.recentNutritionData && context.recentNutritionData.length > 0) {
      contextPrompt += `最近營養攝取情況：\n`;
      const recentData = context.recentNutritionData.slice(0, 3);
      recentData.forEach(data => {
        contextPrompt += `- ${data.date.toLocaleDateString()}: ${Math.round(data.totalCalories)} 大卡\n`;
      });
      contextPrompt += '\n';
    }

    // 添加對話摘要
    if (context.conversationSummary) {
      contextPrompt += `對話背景：${context.conversationSummary}\n\n`;
    }

    return basePrompt + contextPrompt;
  }

  /**
   * 格式化訊息給 OpenAI API
   */
  private formatMessagesForAPI(messages: ChatMessage[], systemPrompt: string): any[] {
    const apiMessages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // 只取最近的 10 條訊息以控制 token 使用
    const recentMessages = messages.slice(-10);
    
    recentMessages.forEach(message => {
      apiMessages.push({
        role: message.role === MessageRole.USER ? 'user' : 'assistant',
        content: message.content
      });
    });

    return apiMessages;
  }

  /**
   * 呼叫 OpenAI API
   */
  private async callOpenAI(messages: any[]): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API 錯誤: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return (data as any)?.choices[0]?.message?.content || '';
  }

  /**
   * 解析 AI 回應
   */
  private parseAIResponse(response: string): {
    message: string;
    suggestions: string[];
    confidence: number;
  } {
    // 簡單的解析邏輯 - 實際實作時可以更複雜
    const lines = response.split('\n').filter(line => line.trim());
    
    let message = response;
    const suggestions: string[] = [];
    
    // 尋找建議項目（以 "建議：" 或 "1." 等開頭的行）
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.match(/^(\d+\.|[•-]|\*)\s*/) || 
          trimmedLine.startsWith('建議：') ||
          trimmedLine.startsWith('建議')) {
        suggestions.push(trimmedLine.replace(/^(\d+\.|[•-]|\*|建議：?)\s*/, ''));
      }
    });

    // 如果沒有找到明確的建議，從回應中提取
    if (suggestions.length === 0) {
      const sentences = response.split(/[。！？]/).filter(s => s.trim());
      if (sentences.length > 1) {
        suggestions.push(...sentences.slice(-2).map(s => s.trim()));
      }
    }

    // 計算信心度（基於回應長度和結構）
    const confidence = Math.min(0.9, 0.5 + (response.length / 1000) * 0.4);

    return {
      message: message.trim(),
      suggestions: suggestions.slice(0, 3), // 最多 3 個建議
      confidence
    };
  }

  /**
   * 檢查回應安全性
   */
  private checkResponseSafety(content: string): { isSafe: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // 檢查是否包含醫療診斷相關內容
    const medicalDiagnosisPatterns = [
      /你患有|你得了|診斷為|確診/,
      /這是.*病|.*疾病/,
      /需要.*藥物|服用.*藥/,
      /立即就醫|緊急就醫/
    ];

    medicalDiagnosisPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        issues.push('包含醫療診斷內容');
      }
    });

    // 檢查是否包含不當的減重建議
    const unsafeWeightLossPatterns = [
      /極端.*減重|快速.*減重/,
      /不吃.*餐|跳過.*餐/,
      /每天.*少於.*卡路里/
    ];

    unsafeWeightLossPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        issues.push('包含不安全的減重建議');
      }
    });

    return {
      isSafe: issues.length === 0,
      issues
    };
  }

  /**
   * 獲取備用回應（當 AI 服務失敗時）
   */
  private getFallbackResponse(userMessage: string): {
    message: string;
    suggestions: string[];
    confidence: number;
    metadata?: any;
  } {
    const fallbackResponses = [
      {
        keywords: ['減重', '減肥', '瘦身'],
        message: '減重是一個循序漸進的過程。建議您保持均衡飲食，適量運動，並設定合理的目標。',
        suggestions: [
          '每天記錄飲食內容',
          '增加蔬菜和蛋白質攝取',
          '保持規律的運動習慣'
        ]
      },
      {
        keywords: ['營養', '飲食', '健康'],
        message: '均衡的營養攝取對健康很重要。建議您多樣化飲食，確保獲得各種必需的營養素。',
        suggestions: [
          '每餐包含蛋白質、碳水化合物和蔬菜',
          '適量攝取健康脂肪',
          '保持充足的水分攝取'
        ]
      }
    ];

    // 根據用戶訊息選擇合適的備用回應
    for (const response of fallbackResponses) {
      if (response.keywords.some(keyword => userMessage.includes(keyword))) {
        return {
          ...response,
          confidence: 0.3,
          metadata: { fallback: true }
        };
      }
    }

    // 預設備用回應
    return {
      message: '感謝您的提問。我建議您保持均衡飲食和規律運動，如有具體的健康問題，請諮詢專業醫療人員。',
      suggestions: [
        '記錄每日飲食',
        '保持規律作息',
        '適量運動'
      ],
      confidence: 0.2,
      metadata: { fallback: true }
    };
  }

  /**
   * 生成個人化建議
   */
  async generatePersonalizedRecommendations(
    context: ConversationContext,
    userProfile?: UserProfile
  ): Promise<Recommendation[]> {
    try {
      const prompt = this.buildRecommendationPrompt(context, userProfile);
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.5
        })
      });

      if (!response.ok) {
        throw new Error('無法生成個人化建議');
      }

      const data = await response.json();
      const aiResponse = (data as any)?.choices[0]?.message?.content || '';
      
      return this.parseRecommendations(aiResponse);
    } catch (error) {
      console.error('生成建議錯誤:', error);
      return this.getFallbackRecommendations(context);
    }
  }

  /**
   * 建立建議生成提示詞
   */
  private buildRecommendationPrompt(context: ConversationContext, userProfile?: UserProfile): string {
    let prompt = '基於以下用戶資訊，生成 3-5 個具體的健康和營養建議：\n\n';
    
    if (userProfile) {
      prompt += `用戶資訊：年齡 ${userProfile.age}，${userProfile.gender}，${userProfile.height}cm，${userProfile.weight}kg\n`;
    }
    
    if (context.healthGoals.length > 0) {
      prompt += `健康目標：${context.healthGoals.map(g => g.type).join('、')}\n`;
    }
    
    prompt += '\n請提供具體、可執行的建議，每個建議包含：\n';
    prompt += '1. 建議標題\n2. 詳細說明\n3. 優先級（高/中/低）\n';
    prompt += '格式：[優先級] 標題：說明\n';
    
    return prompt;
  }

  /**
   * 解析建議回應
   */
  private parseRecommendations(response: string): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const lines = response.split('\n').filter(line => line.trim());
    
    lines.forEach((line, index) => {
      const match = line.match(/\[(高|中|低)\]\s*([^：:]+)[：:]\s*(.+)/);
      if (match) {
        const [, priorityStr, title, description] = match;
        const priority = priorityStr === '高' ? Priority.HIGH : 
                        priorityStr === '中' ? Priority.MEDIUM : Priority.LOW;
        
        recommendations.push({
          id: `rec_${Date.now()}_${index}`,
          type: this.inferRecommendationType(title + description),
          title: title.trim(),
          description: description.trim(),
          priority,
          actionable: true,
          relatedGoals: []
        });
      }
    });
    
    return recommendations;
  }

  /**
   * 推斷建議類型
   */
  private inferRecommendationType(content: string): RecommendationType {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('運動') || lowerContent.includes('健身')) {
      return RecommendationType.EXERCISE;
    } else if (lowerContent.includes('餐點') || lowerContent.includes('菜單')) {
      return RecommendationType.MEAL_PLANNING;
    } else if (lowerContent.includes('習慣') || lowerContent.includes('養成')) {
      return RecommendationType.HABIT_FORMATION;
    } else if (lowerContent.includes('檢查') || lowerContent.includes('監測')) {
      return RecommendationType.HEALTH_CHECK;
    } else {
      return RecommendationType.NUTRITION_ADJUSTMENT;
    }
  }

  /**
   * 獲取備用建議
   */
  private getFallbackRecommendations(context: ConversationContext): Recommendation[] {
    return [
      {
        id: 'fallback_1',
        type: RecommendationType.NUTRITION_ADJUSTMENT,
        title: '均衡飲食',
        description: '確保每餐包含蛋白質、碳水化合物和蔬菜',
        priority: Priority.HIGH,
        actionable: true,
        relatedGoals: []
      },
      {
        id: 'fallback_2',
        type: RecommendationType.HABIT_FORMATION,
        title: '規律記錄',
        description: '每天記錄飲食內容，培養健康意識',
        priority: Priority.MEDIUM,
        actionable: true,
        relatedGoals: []
      }
    ];
  }

  /**
   * 設定 API 參數
   */
  setModel(model: string): void {
    this.model = model;
  }

  setMaxTokens(maxTokens: number): void {
    this.maxTokens = maxTokens;
  }

  setTemperature(temperature: number): void {
    this.temperature = Math.max(0, Math.min(2, temperature));
  }
}