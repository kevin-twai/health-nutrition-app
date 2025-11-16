'use client'

export default function DebugInfo() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-api.onrender.com'
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <div><strong>🔍 調試信息</strong></div>
      <div>API URL: {apiUrl}</div>
      <div>環境: {process.env.NODE_ENV}</div>
    </div>
  )
}
