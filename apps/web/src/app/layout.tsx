export const metadata = {
  title: '健康營養追蹤系統',
  description: '綜合性健康管理應用，透過拍照辨識餐點自動估算營養素，結合AI聊天顧問提供個人化建議',
}

// 強制動態渲染
export const dynamic = 'force-dynamic'
export const revalidate = 0

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