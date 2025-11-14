export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1>404 - 頁面未找到</h1>
      <p>抱歉，您訪問的頁面不存在。</p>
      <a href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
        返回首頁
      </a>
    </div>
  )
}
