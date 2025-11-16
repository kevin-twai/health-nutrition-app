'use client'

import { useState } from 'react'
import { recognizePhoto } from '@/lib/api-client'

export default function PhotoRecognition() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string>('')
  const [progress, setProgress] = useState<string>('')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setAnalysisResult(null)
      setError('')
      setProgress('')
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return
    
    setIsAnalyzing(true)
    setError('')
    setProgress('正在連接 API...')
    
    try {
      setProgress('正在分析照片...')
      const result = await recognizePhoto(selectedFile)
      
      console.log('✅ 分析結果:', result)
      
      if (result.success && result.data) {
        setAnalysisResult(result.data)
        setProgress('分析完成！')
      } else {
        throw new Error('API 回應格式錯誤')
      }
      
    } catch (err) {
      console.error('❌ 分析失敗:', err)
      const errorMsg = err instanceof Error ? err.message : '分析失敗'
      setError(errorMsg)
      setProgress('')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setAnalysisResult(null)
    setError('')
    setProgress('')
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
                  disabled={isAnalyzing}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isAnalyzing ? 'not-allowed' : 'pointer'
                  }}
                >
                  重新選擇
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 進度訊息 */}
        {progress && (
          <div style={{ 
            backgroundColor: '#dbeafe', 
            color: '#1e40af',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            ℹ️ {progress}
          </div>
        )}

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
            <div style={{ marginTop: '8px', fontSize: '14px' }}>
              提示：如果看到 503 錯誤，API 服務可能正在喚醒，請稍後再試。
            </div>
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
              overflow: 'auto',
              fontSize: '14px'
            }}>
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
