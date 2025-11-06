export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '1rem 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#1f2937',
            margin: 0
          }}>
            健康營養追蹤系統
          </h1>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <a href="/auth" style={{ 
              color: '#3b82f6', 
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              登入
            </a>
            <a href="/dashboard" style={{ 
              color: '#3b82f6', 
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              儀表板
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '4rem 1rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            🚀 AI 驅動的健康管理
          </h2>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            透過拍照辨識餐點自動估算營養素，結合AI聊天顧問提供個人化建議，
            並整合第三方平台實現自動化記錄。
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="/auth" style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-block'
            }}>
              立即開始
            </a>
            <a href="/dashboard" style={{
              backgroundColor: 'white',
              color: '#3b82f6',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              border: '2px solid #3b82f6',
              display: 'inline-block'
            }}>
              進入系統
            </a>
          </div>
        </div>

        {/* Features */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginTop: '4rem'
        }}>
          {[
            {
              title: '📸 拍照辨識餐點',
              description: '使用AI技術自動辨識食物並計算營養成分'
            },
            {
              title: '🤖 AI 健康顧問',
              description: '個人化健康建議和營養指導'
            },
            {
              title: '🔗 第三方整合',
              description: '與Notion、Line、Apple Health等平台同步'
            },
            {
              title: '📊 健康報告',
              description: '詳細的健康趨勢分析和改善建議'
            },
            {
              title: '🎮 遊戲化系統',
              description: '任務、獎勵和成就系統提升參與度'
            },
            {
              title: '👤 個人檔案',
              description: '完整的個人健康數據管理'
            }
          ].map((feature, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                {feature.title}
              </h3>
              <p style={{ 
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{ 
          marginTop: '4rem',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '2rem',
            color: '#1f2937'
          }}>
            快速導航
          </h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '1rem', 
            justifyContent: 'center'
          }}>
            {[
              { name: '登入/註冊', href: '/auth' },
              { name: '儀表板', href: '/dashboard' },
              { name: '拍照辨識', href: '/photo' },
              { name: 'AI 聊天', href: '/chat' },
              { name: '健康報告', href: '/reports' },
              { name: '遊戲化', href: '/gamification' },
              { name: '個人檔案', href: '/profile' }
            ].map((link) => (
              <a key={link.name} href={link.href} style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                textDecoration: 'none',
                fontWeight: '500',
                border: '1px solid #d1d5db'
              }}>
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '2rem 0',
        marginTop: '4rem'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280' }}>
            © 2024 健康營養追蹤系統. 由 AI 技術驅動的健康管理平台.
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            後端 API: <a href="https://health-nutrition-app-w3zm.onrender.com" 
                        style={{ color: '#3b82f6' }}>
              health-nutrition-app-w3zm.onrender.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}