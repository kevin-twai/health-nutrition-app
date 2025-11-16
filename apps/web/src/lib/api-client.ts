// API 客戶端 - 帶重試和錯誤處理

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-api.onrender.com'

interface FetchOptions extends RequestInit {
  maxRetries?: number
  retryDelay?: number
}

/**
 * 帶重試機制的 fetch
 */
export async function fetchWithRetry(
  url: string, 
  options: FetchOptions = {}
): Promise<Response> {
  const { maxRetries = 3, retryDelay = 2000, ...fetchOptions } = options
  
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 嘗試 ${attempt + 1}/${maxRetries + 1}: ${url}`)
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: AbortSignal.timeout(30000) // 30秒超時
      })
      
      // 如果是 503，可能是服務休眠，需要重試
      if (response.status === 503 && attempt < maxRetries) {
        console.warn(`⚠️ 收到 503，服務可能正在喚醒，${retryDelay}ms 後重試...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        continue
      }
      
      return response
      
    } catch (error) {
      lastError = error as Error
      console.error(`❌ 嘗試 ${attempt + 1} 失敗:`, error)
      
      if (attempt < maxRetries) {
        console.log(`⏳ ${retryDelay}ms 後重試...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }
  
  throw lastError || new Error('請求失敗')
}

/**
 * 喚醒 API 服務
 */
export async function wakeUpAPI(): Promise<boolean> {
  try {
    console.log('🔔 正在喚醒 API 服務...')
    const response = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(10000)
    })
    return response.ok
  } catch (error) {
    console.error('❌ 喚醒 API 失敗:', error)
    return false
  }
}

/**
 * 上傳照片進行辨識
 */
export async function recognizePhoto(file: File): Promise<any> {
  // 先嘗試喚醒 API
  console.log('📡 檢查 API 狀態...')
  await wakeUpAPI()
  
  const formData = new FormData()
  formData.append('photo', file)
  
  const response = await fetchWithRetry(`${API_URL}/api/v1/photo/recognize`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer demo-token'
    },
    body: formData,
    maxRetries: 3,
    retryDelay: 3000 // 3秒重試間隔
  })
  
  if (!response.ok) {
    throw new Error(`API 錯誤: ${response.status}`)
  }
  
  return await response.json()
}

export { API_URL }
