#!/bin/bash

echo "🔧 修復前端 API 連接問題"
echo "========================================"
echo ""

echo "問題診斷："
echo "1. 前端無法連接到後端 API"
echo "2. 出現 CORS 和 503 錯誤"
echo "3. Render 日誌未收到請求"
echo ""

echo "📝 步驟 1: 檢查 API 服務狀態..."
echo "請確認以下 Render 服務是否正常運行："
echo "  - health-nutrition-api (後端 API)"
echo "  - health-nutrition-web (前端)"
echo ""

echo "📝 步驟 2: 更新前端 API 配置..."

# 創建一個簡化的照片頁面，直接使用正確的 API URL
cat > apps/web/src/app/photo/page-simple.tsx << 'EOF'
'use client'

import { useState } from 'react'

export default function PhotoRecognition() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string>('')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setAnalysisResult(null)
      setError('')
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return
    
    setIsAnalyzing(true)
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('photo', selectedFile)
      
      // 使用正確的 API URL - 直接從環境變數讀取
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-api.onrender.com'
      console.log('🔗 API URL:', apiUrl)
      
      const response = await fetch(`${apiUrl}/api/v1/photo/recognize`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer demo-token'
        },
        body: formData
      })
      
      console.log('📥 Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`API 錯誤: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('✅ Result:', result)
      
      if (result.success && result.data) {
        setAnalysisResult(result.data)
      } else {
        throw new Error('API 回應格式錯誤')
      }
      
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err instanceof Error ? err.message : '分析失敗')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setAnalysisResult(null)
    setError('')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '32px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '24px' }}>
          📸 拍照辨識
        </h1>

        {/* 上傳區域 */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '24px',
          marginBottom: '24px'
        }}>
          {!previewUrl ? (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ marginBottom: '16px' }}
              />
              <p style={{ color: '#6b7280' }}>請選擇食物照片</p>
            </div>
          ) : (
            <div>
              <img 
                src={previewUrl}
                alt="預覽" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '400px', 
                  borderRadius: '8px',
                  marginBottom: '16px'
                }} 
              />
              <div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: isAnalyzing ? '#9ca3af' : '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                    marginRight: '12px'
                  }}
                >
                  {isAnalyzing ? '分析中...' : '🔍 開始分析'}
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  重新選擇
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: '#991b1b',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            ❌ {error}
          </div>
        )}

        {/* 分析結果 */}
        {analysisResult && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              分析結果
            </h2>
            <pre style={{ 
              backgroundColor: '#f3f4f6',
              padding: '16px',
              borderRadius: '6px',
              overflow: 'auto'
            }}>
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
EOF

echo "✅ 創建了簡化版照片頁面"
echo ""

echo "📝 步驟 3: 創建診斷腳本..."
cat > test-api-connection.sh << 'TESTEOF'
#!/bin/bash

echo "🔍 測試 API 連接"
echo "===================="
echo ""

# 測試 API 健康檢查
echo "1. 測試 API 健康檢查..."
curl -v https://health-nutrition-api.onrender.com/health 2>&1 | head -20

echo ""
echo "2. 測試 API 根路徑..."
curl -v https://health-nutrition-api.onrender.com/ 2>&1 | head -20

echo ""
echo "3. 測試 CORS 預檢請求..."
curl -v -X OPTIONS https://health-nutrition-api.onrender.com/api/v1/photo/recognize \
  -H "Origin: https://health-nutrition-web.onrender.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  2>&1 | head -30
TESTEOF

chmod +x test-api-connection.sh

echo "✅ 創建了 API 連接測試腳本"
echo ""

echo "📝 步驟 4: 提交修復..."
git add apps/web/src/app/photo/page-simple.tsx test-api-connection.sh
git commit -m "fix: 添加簡化版照片頁面和 API 連接測試

- 創建簡化的照片辨識頁面用於測試
- 添加 API 連接診斷腳本
- 幫助診斷前後端連接問題"

echo ""
echo "📤 推送到 Git..."
git push origin main

echo ""
echo "✅ 修復完成！"
echo ""
echo "🔍 下一步診斷："
echo "1. 運行測試腳本: ./test-api-connection.sh"
echo "2. 檢查 Render Dashboard 中的 API 服務日誌"
echo "3. 確認 API 服務的環境變數設置"
echo ""
echo "📋 需要檢查的 Render 環境變數："
echo "  API 服務 (health-nutrition-api):"
echo "    - PORT (應該是 10000)"
echo "    - NODE_ENV=production"
echo "    - OPENAI_API_KEY"
echo ""
echo "  Web 服務 (health-nutrition-web):"
echo "    - NEXT_PUBLIC_API_URL=https://health-nutrition-api.onrender.com"
echo "    - PORT=10000"
echo ""
