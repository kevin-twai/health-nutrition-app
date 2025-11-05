'use client'

export default function Dashboard() {
  const handleNavigation = (section: string) => {
    switch (section) {
      case '總覽':
        // 已在儀表板頁面
        break
      case '拍照辨識':
        window.location.href = '/photo'
        break
      case 'AI 顧問':
        window.location.href = '/chat'
        break
      case '遊戲化':
        window.location.href = '/gamification'
        break
      case '個人資料':
        window.location.href = '/profile'
        break
      case 'AI 健康顧問':
        window.location.href = '/chat'
        break
      case '遊戲化系統':
        window.location.href = '/gamification'
        break
      case '第三方整合':
        alert('第三方整合功能開發中')
        break
      case '系統設定':
        window.location.href = '/profile'
        break
      case '記錄今日餐點':
        window.location.href = '/photo'
        break
      case '開始 AI 對話':
        window.location.href = '/chat'
        break
      case '查看今日任務':
        window.location.href = '/gamification'
        break
      default:
        alert(`${section} 功能開發中`)
    }
  }

  const handleReportsClick = () => {
    window.location.href = '/reports'
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>健康營養追蹤系統</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px', color: '#374151' }}>歡迎使用</span>
              <a
                href="/auth"
                style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none' }}
              >
                登入
              </a>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          {/* Sidebar */}
          <div style={{ 
            width: '256px', 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '24px' 
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => handleNavigation('總覽')}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '8px 12px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  borderRadius: '6px', 
                  backgroundColor: '#e0e7ff', 
                  color: '#4338ca',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                📊 總覽
              </button>
              <button 
                onClick={() => handleNavigation('拍照辨識')}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '8px 12px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  borderRadius: '6px', 
                  color: '#4b5563',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                📸 拍照辨識
              </button>
              <button 
                onClick={() => handleNavigation('AI 顧問')}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '8px 12px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  borderRadius: '6px', 
                  color: '#4b5563',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                💬 AI 顧問
              </button>
              <button 
                onClick={() => handleNavigation('遊戲化')}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '8px 12px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  borderRadius: '6px', 
                  color: '#4b5563',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                🎮 遊戲化
              </button>
              <button 
                onClick={() => handleNavigation('個人資料')}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '8px 12px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  borderRadius: '6px', 
                  color: '#4b5563',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                👤 個人資料
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>今日概覽</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#1e40af' }}>今日卡路里</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>1,250</p>
                    <p style={{ fontSize: '14px', color: '#2563eb' }}>目標: 2,000</p>
                  </div>
                  <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#166534' }}>蛋白質</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#14532d' }}>45g</p>
                    <p style={{ fontSize: '14px', color: '#16a34a' }}>目標: 60g</p>
                  </div>
                  <div style={{ backgroundColor: '#faf5ff', padding: '16px', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#7c2d12' }}>連續記錄</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#581c87' }}>7 天</p>
                    <p style={{ fontSize: '14px', color: '#9333ea' }}>保持下去！</p>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>主要功能</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                    <h3 style={{ fontWeight: '500', color: '#111827' }}>📸 拍照辨識</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>上傳食物照片，AI 自動辨識營養成分</p>
                    <button 
                      onClick={() => handleNavigation('拍照辨識')}
                      style={{ 
                        marginTop: '12px', 
                        fontSize: '14px', 
                        color: '#4f46e5', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      開始使用 →
                    </button>
                  </div>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                    <h3 style={{ fontWeight: '500', color: '#111827' }}>💬 AI 健康顧問</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>與 AI 顧問對話，獲得個人化健康建議</p>
                    <button 
                      onClick={() => handleNavigation('AI 健康顧問')}
                      style={{ 
                        marginTop: '12px', 
                        fontSize: '14px', 
                        color: '#4f46e5', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      開始對話 →
                    </button>
                  </div>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                    <h3 style={{ fontWeight: '500', color: '#111827' }}>📊 健康報告</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>查看詳細的健康趨勢分析和建議</p>
                    <button 
                      onClick={handleReportsClick}
                      style={{ 
                        marginTop: '12px', 
                        fontSize: '14px', 
                        color: '#4f46e5', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      查看報告 →
                    </button>
                  </div>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                    <h3 style={{ fontWeight: '500', color: '#111827' }}>🎮 遊戲化系統</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>完成任務，獲得積分和成就</p>
                    <button 
                      onClick={() => handleNavigation('遊戲化系統')}
                      style={{ 
                        marginTop: '12px', 
                        fontSize: '14px', 
                        color: '#4f46e5', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      查看任務 →
                    </button>
                  </div>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                    <h3 style={{ fontWeight: '500', color: '#111827' }}>🔗 第三方整合</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>連接 Notion、Line、Apple Health</p>
                    <button 
                      onClick={() => handleNavigation('第三方整合')}
                      style={{ 
                        marginTop: '12px', 
                        fontSize: '14px', 
                        color: '#4f46e5', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      管理連接 →
                    </button>
                  </div>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                    <h3 style={{ fontWeight: '500', color: '#111827' }}>⚙️ 系統設定</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>個人化設定和偏好管理</p>
                    <button 
                      onClick={() => handleNavigation('系統設定')}
                      style={{ 
                        marginTop: '12px', 
                        fontSize: '14px', 
                        color: '#4f46e5', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      前往設定 →
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>快速操作</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <button 
                    onClick={() => handleNavigation('記錄今日餐點')}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#4f46e5', 
                      color: 'white', 
                      borderRadius: '6px', 
                      border: 'none', 
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    記錄今日餐點
                  </button>
                  <button 
                    onClick={() => handleNavigation('開始 AI 對話')}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#059669', 
                      color: 'white', 
                      borderRadius: '6px', 
                      border: 'none', 
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    開始 AI 對話
                  </button>
                  <button 
                    onClick={() => handleNavigation('查看今日任務')}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#7c3aed', 
                      color: 'white', 
                      borderRadius: '6px', 
                      border: 'none', 
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    查看今日任務
                  </button>
                  <button 
                    onClick={handleReportsClick}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#2563eb', 
                      color: 'white', 
                      borderRadius: '6px', 
                      border: 'none', 
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    生成健康報告
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}