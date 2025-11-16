// API 配置和工具函數
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-api.onrender.com';

// API 請求輔助函數
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 如果有 token，加入 Authorization header
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request failed: ${endpoint}`, error);
    throw error;
  }
}

// 特定 API 端點
export const api = {
  // 認證
  register: (data: { email: string; password: string; passwordConfirm: string; name: string }) =>
    apiRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 食物搜尋
  searchFood: (query: string) =>
    apiRequest(`/api/v1/food/search?q=${encodeURIComponent(query)}`),

  // 照片辨識
  recognizePhoto: (formData: FormData) =>
    apiRequest('/api/v1/photo/recognize', {
      method: 'POST',
      body: formData,
      headers: {}, // 讓瀏覽器自動設置 Content-Type for FormData
    }),

  // AI 聊天
  chat: (message: string) =>
    apiRequest('/api/v1/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // 報告
  getWeeklyReport: () =>
    apiRequest('/api/v1/reports/weekly'),

  // 遊戲化
  getGamificationProfile: () =>
    apiRequest('/api/v1/gamification/profile'),

  // 健康檢查
  healthCheck: () =>
    apiRequest('/health'),
};
