import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '健康營養追蹤系統',
  description: '綜合性健康管理應用，透過拍照辨識餐點自動估算營養素，結合AI聊天顧問提供個人化建議',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>{children}</body>
    </html>
  )
}