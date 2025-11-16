export const metadata = {
  title: '健康營養追蹤系統',
  description: '綜合性健康管理應用，透過拍照辨識餐點自動估算營養素，結合AI聊天顧問提供個人化建議',
}

// Export 模式：靜態生成所有頁面
// 移除 dynamic = 'force-dynamic' 以支持 output: 'export'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }}>
        {children}
      </body>
    </html>
  )
}