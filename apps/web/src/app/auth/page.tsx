'use client'

export default function Auth() {
  const handleDemoLogin = () => {
    // 直接導向儀表板
    window.location.href = '/dashboard'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 直接導向儀表板
    window.location.href = '/dashboard'
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '48px 16px'
    }}>
      <div style={{
        maxWidth: '448px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            margin: '0 auto 24px',
            height: '48px',
            width: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: '#e0e7ff'
          }}>
            <svg style={{ height: '24px', width: '24px', color: '#4f46e5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 style={{
            fontSize: '30px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '8px'
          }}>
            健康營養追蹤系統
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            登入或註冊您的帳戶
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                電子郵件
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#111827'
                }}
                placeholder="請輸入電子郵件地址"
              />
            </div>

            <div>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#111827'
                }}
                placeholder="請輸入密碼"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '8px 16px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px',
                color: 'white',
                backgroundColor: '#4f46e5',
                cursor: 'pointer'
              }}
            >
              登入
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              style={{
                color: '#4f46e5',
                fontSize: '14px',
                fontWeight: '500',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              還沒有帳戶？立即註冊
            </button>
          </div>
        </form>

        {/* 示範帳戶 */}
        <div style={{
          padding: '16px',
          backgroundColor: '#eff6ff',
          borderRadius: '8px'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#1e40af',
            marginBottom: '8px'
          }}>快速體驗</h3>
          <p style={{
            fontSize: '12px',
            color: '#2563eb',
            marginBottom: '8px'
          }}>您可以使用以下測試帳戶：</p>
          <div style={{
            fontSize: '12px',
            color: '#1d4ed8'
          }}>
            <p>電子郵件: demo@example.com</p>
            <p>密碼: demo123</p>
          </div>
          <div style={{ marginTop: '8px' }}>
            <button
              onClick={handleDemoLogin}
              style={{
                fontSize: '12px',
                color: '#2563eb',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              直接進入系統體驗
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}