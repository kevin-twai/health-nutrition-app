'use client'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIChat() {
  let messages: Message[] = [
    {
      id: 1,
      role: 'assistant',
      content: '您好！我是您的 AI 健康顧問。我可以幫助您分析營養攝取、制定健康計劃、回答健康相關問題。請問今天有什麼可以幫助您的嗎？',
      timestamp: new Date()
    }
  ]
  let messageIdCounter = 2

  const handleSendMessage = () => {
    const inputElement = document.getElementById('message-input') as HTMLInputElement
    const inputMessage = inputElement?.value.trim()
    
    if (!inputMessage) return

    const userMessage: Message = {
      id: messageIdCounter++,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    messages.push(userMessage)
    inputElement.value = ''
    
    // 更新聊天界面
    updateChatDisplay()
    
    // 顯示正在輸入
    showTypingIndicator()

    // 模擬 AI 回應
    setTimeout(() => {
      const aiResponse: Message = {
        id: messageIdCounter++,
        role: 'assistant',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      }
      messages.push(aiResponse)
      hideTypingIndicator()
      updateChatDisplay()
    }, 1500)
  }

  const updateChatDisplay = () => {
    const messagesContainer = document.getElementById('messages-container')
    if (messagesContainer) {
      messagesContainer.innerHTML = messages.map((message) => `
        <div style="margin-bottom: 16px; display: flex; justify-content: ${message.role === 'user' ? 'flex-end' : 'flex-start'};">
          <div style="max-width: 70%; padding: 12px 16px; border-radius: 12px; background-color: ${message.role === 'user' ? '#4f46e5' : '#f3f4f6'}; color: ${message.role === 'user' ? 'white' : '#1f2937'};">
            <div style="white-space: pre-line; font-size: 14px;">
              ${message.content}
            </div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 4px; text-align: right;">
              ${message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      `).join('')
      
      // 滾動到底部
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  const showTypingIndicator = () => {
    const typingIndicator = document.getElementById('typing-indicator')
    if (typingIndicator) {
      typingIndicator.style.display = 'flex'
    }
  }

  const hideTypingIndicator = () => {
    const typingIndicator = document.getElementById('typing-indicator')
    if (typingIndicator) {
      typingIndicator.style.display = 'none'
    }
  }

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()
    
    if (input.includes('減重') || input.includes('減肥')) {
      return '關於減重，我建議您：\n\n1. 創造適度的熱量赤字（每日減少300-500卡路里）\n2. 增加蛋白質攝取，有助維持肌肉量\n3. 多吃蔬菜和全穀物，增加飽足感\n4. 配合適度運動，特別是阻力訓練\n5. 保持充足睡眠，有助新陳代謝\n\n您目前的體重目標是什麼呢？'
    }
    
    if (input.includes('蛋白質') || input.includes('protein')) {
      return '蛋白質是很重要的營養素！根據您的活動量，建議每公斤體重攝取0.8-1.2克蛋白質。\n\n優質蛋白質來源包括：\n• 瘦肉、魚類、雞蛋\n• 豆類、豆腐、豆漿\n• 堅果、種子\n• 乳製品\n\n您平常比較喜歡哪些蛋白質食物呢？'
    }
    
    if (input.includes('水') || input.includes('喝水')) {
      return '充足的水分攝取很重要！一般建議每日飲水量為體重(kg) × 30-35ml。\n\n喝水的好處：\n• 促進新陳代謝\n• 幫助消化\n• 維持皮膚健康\n• 調節體溫\n\n建議分次飲用，不要一次喝太多。您平常一天大概喝多少水呢？'
    }
    
    if (input.includes('運動') || input.includes('健身')) {
      return '運動對健康非常重要！建議結合有氧運動和阻力訓練：\n\n有氧運動（每週150分鐘）：\n• 快走、慢跑、游泳\n• 騎自行車、跳舞\n\n阻力訓練（每週2-3次）：\n• 重量訓練\n• 徒手訓練（伏地挺身、深蹲）\n\n您目前有在做什麼運動嗎？'
    }
    
    return '謝謝您的問題！作為您的健康顧問，我建議您：\n\n1. 保持均衡飲食，多樣化攝取各類營養素\n2. 規律運動，結合有氧和阻力訓練\n3. 充足睡眠，每晚7-9小時\n4. 適當管理壓力\n5. 定期健康檢查\n\n如果您有更具體的健康問題或目標，歡迎詳細告訴我，我可以提供更個人化的建議！'
  }

  const quickQuestions = [
    '如何制定減重計劃？',
    '每日蛋白質需求量',
    '健康飲食建議',
    '運動計劃推薦',
    '如何改善睡眠品質？'
  ]

  const handleQuickQuestion = (question: string) => {
    const inputElement = document.getElementById('message-input') as HTMLInputElement
    if (inputElement) {
      inputElement.value = question
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSendMessage()
    }
  }

  // 初始化聊天顯示
  const initializeChat = () => {
    setTimeout(() => {
      updateChatDisplay()
    }, 100)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => window.location.href = '/dashboard'}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← 返回
              </button>
              <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>💬 AI 健康顧問</h1>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
        <script dangerouslySetInnerHTML={{
          __html: `
            setTimeout(() => {
              const messagesContainer = document.getElementById('messages-container');
              if (messagesContainer) {
                messagesContainer.innerHTML = \`
                  <div style="margin-bottom: 16px; display: flex; justify-content: flex-start;">
                    <div style="max-width: 70%; padding: 12px 16px; border-radius: 12px; background-color: #f3f4f6; color: #1f2937;">
                      <div style="white-space: pre-line; font-size: 14px;">
                        您好！我是您的 AI 健康顧問。我可以幫助您分析營養攝取、制定健康計劃、回答健康相關問題。請問今天有什麼可以幫助您的嗎？
                      </div>
                      <div style="font-size: 12px; opacity: 0.7; margin-top: 4px; text-align: right;">
                        \${new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                \`;
              }
            }, 100);
          `
        }} />
        {/* 聊天區域 */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
          height: '500px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* 消息列表 */}
          <div style={{ 
            flex: 1, 
            padding: '24px', 
            overflowY: 'auto',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div id="messages-container"></div>
            
            <div id="typing-indicator" style={{ 
              marginBottom: '16px',
              display: 'none',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#f3f4f6',
                color: '#6b7280'
              }}>
                AI 正在輸入中...
              </div>
            </div>
          </div>

          {/* 輸入區域 */}
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                id="message-input"
                onKeyPress={handleKeyPress}
                placeholder="輸入您的健康問題..."
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                發送
              </button>
            </div>
          </div>
        </div>

        {/* 快速問題 */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
          padding: '24px',
          marginTop: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '16px' }}>
            常見問題：
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#374151'
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}