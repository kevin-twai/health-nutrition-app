// API 工具 - 帶重試和喚醒邏輯

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-api.onrender.com'

interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  timeout?: number
}

/**
 * 喚醒 API 服務（Render 免費方案會休眠）
 */
async function wakeUpAPI(): Promise<boolean> {
  try {
    console.log('🔄 正在喚醒 API 服務...')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超時
    
    const response = await fetch(`${API_URL}/health`, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      console.log('✅ API 服務已喚醒')
      return true
    }
    return false
  } catch (error) {
    console.warn('⚠️ 喚醒 API 失敗:', error)
    return false
  }
}

/**
 * 帶重試邏輯的 fetch
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    retryDelay = 2000,
    timeout = 60000
  } = retryOptions

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 第一次嘗試時，先喚醒 API
      if (attempt === 0) {
        await wakeUpAPI()
      }

      console.log(`📤 嘗試 ${attempt + 1}/${maxRetries + 1}: ${url}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // 如果是 503 錯誤且還有重試次數，繼續重試
      if (response.status === 503 && attempt < maxRetries) {
        console.warn(`⚠️ 收到 503 錯誤，${retryDelay}ms 後重試...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        continue
      }

      // 其他錯誤或成功，直接返回
      return response

    } catch (error) {
      lastError = error as Error
      console.error(`❌ 嘗試 ${attempt + 1} 失敗:`, error)

      // 如果還有重試次數，等待後繼續
      if (attempt < maxRetries) {
        console.log(`⏳ ${retryDelay}ms 後重試...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }

  // 所有重試都失敗
  throw lastError || new Error('請求失敗')
}

/**
 * 上傳照片進行食物辨識
 */
export async function recognizeFood(file: File): Promise<any> {
  const formData = new FormData()
  formData.append('photo', file)

  const token = localStorage.getItem('authToken') || 'demo-token'

  const response = await fetchWithRetry(
    `${API_URL}/api/v1/photo/recognize`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    },
    {
      maxRetries: 3,
      retryDelay: 3000, // 3秒
      timeout: 60000 // 60秒
    }
  )

  if (!response.ok) {
    throw new Error(`API 錯誤: ${response.status}`)
  }

  return response.json()
}

export { API_URL }
