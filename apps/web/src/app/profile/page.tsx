'use client'

'use client'

import { useState } from 'react'

export default function Profile() {
  const [activeTab, setActiveTab] = useState('basic')
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: '張小明',
    email: 'demo@example.com',
    age: 28,
    gender: 'male',
    height: 170,
    weight: 65,
    activityLevel: 'moderate',
    goals: ['weight_loss', 'muscle_gain'],
    targetWeight: 60,
    targetCalories: 1800
  })
  
  const [preferences, setPreferences] = useState({
    language: 'zh-TW',
    timezone: 'Asia/Taipei',
    notifications: {
      email: true,
      push: true,
      weeklyReport: true,
      achievements: true
    },
    privacy: {
      dataSharing: false,
      profileVisibility: 'private'
    }
  })

  const genderOptions = [
    { value: 'male', label: '男性' },
    { value: 'female', label: '女性' },
    { value: 'other', label: '其他' }
  ]

  const activityLevels = [
    { value: 'sedentary', label: '久坐少動', description: '辦公室工作，很少運動' },
    { value: 'light', label: '輕度活動', description: '偶爾散步或輕度運動' },
    { value: 'moderate', label: '中度活動', description: '每週運動3-4次' },
    { value: 'active', label: '高度活動', description: '每週運動5-6次' },
    { value: 'very_active', label: '極度活動', description: '每天高強度運動' }
  ]

  const healthGoals = [
    { value: 'weight_loss', label: '減重', icon: '📉' },
    { value: 'weight_gain', label: '增重', icon: '📈' },
    { value: 'muscle_gain', label: '增肌', icon: '💪' },
    { value: 'maintenance', label: '維持', icon: '⚖️' },
    { value: 'health_improvement', label: '改善健康', icon: '❤️' }
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => window.location.href = '/dashboard'}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← 返回
              </button>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>個人檔案</h1>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                padding: '8px 16px',
                backgroundColor: isEditing ? '#10b981' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {isEditing ? '儲存' : '編輯'}
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Tab Navigation */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ borderBottom: '1px solid #e5e7eb' }}>
            <nav style={{ display: 'flex', gap: '32px' }}>
              {[
                { id: 'basic', label: '基本資料', icon: '👤' },
                { id: 'health', label: '健康資料', icon: '💪' },
                { id: 'preferences', label: '偏好設定', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 0',
                    border: 'none',
                    backgroundColor: 'transparent',
                    borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                    color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: activeTab === tab.id ? '600' : '400'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>基本資料</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  姓名
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    backgroundColor: isEditing ? 'white' : '#f9fafb'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  電子郵件
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    backgroundColor: isEditing ? 'white' : '#f9fafb'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  年齡
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    backgroundColor: isEditing ? 'white' : '#f9fafb'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  性別
                </label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({...profile, gender: e.target.value})}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    backgroundColor: isEditing ? 'white' : '#f9fafb'
                  }}
                >
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Health Info Tab */}
        {activeTab === 'health' && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>健康資料</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  身高 (cm)
                </label>
                <input
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile({...profile, height: parseInt(e.target.value)})}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    backgroundColor: isEditing ? 'white' : '#f9fafb'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  體重 (kg)
                </label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => setProfile({...profile, weight: parseInt(e.target.value)})}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    backgroundColor: isEditing ? 'white' : '#f9fafb'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  目標體重 (kg)
                </label>
                <input
                  type="number"
                  value={profile.targetWeight}
                  onChange={(e) => setProfile({...profile, targetWeight: parseInt(e.target.value)})}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    backgroundColor: isEditing ? 'white' : '#f9fafb'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  目標卡路里
                </label>
                <input
                  type="number"
                  value={profile.targetCalories}
                  onChange={(e) => setProfile({...profile, targetCalories: parseInt(e.target.value)})}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    backgroundColor: isEditing ? 'white' : '#f9fafb'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: '#374151' }}>
                活動程度
              </label>
              <div style={{ display: 'grid', gap: '12px' }}>
                {activityLevels.map((level) => (
                  <label key={level.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="activityLevel"
                      value={level.value}
                      checked={profile.activityLevel === level.value}
                      onChange={(e) => setProfile({...profile, activityLevel: e.target.value})}
                      disabled={!isEditing}
                    />
                    <div>
                      <div style={{ fontWeight: '500' }}>{level.label}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: '#374151' }}>
                健康目標
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {healthGoals.map((goal) => (
                  <label key={goal.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={profile.goals.includes(goal.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProfile({...profile, goals: [...profile.goals, goal.value]})
                        } else {
                          setProfile({...profile, goals: profile.goals.filter(g => g !== goal.value)})
                        }
                      }}
                      disabled={!isEditing}
                    />
                    <span>{goal.icon} {goal.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>偏好設定</h2>
            
            <div style={{ display: 'grid', gap: '32px' }}>
              {/* Language & Timezone */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>語言與時區</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                      語言
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px',
                        backgroundColor: isEditing ? 'white' : '#f9fafb'
                      }}
                    >
                      <option value="zh-TW">繁體中文</option>
                      <option value="zh-CN">简体中文</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                      時區
                    </label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px',
                        backgroundColor: isEditing ? 'white' : '#f9fafb'
                      }}
                    >
                      <option value="Asia/Taipei">台北時間</option>
                      <option value="Asia/Shanghai">上海時間</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>通知設定</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    { key: 'email', label: '電子郵件通知', description: '接收重要更新和提醒' },
                    { key: 'push', label: '推播通知', description: '即時提醒和建議' },
                    { key: 'weeklyReport', label: '週報', description: '每週健康報告' },
                    { key: 'achievements', label: '成就通知', description: '達成目標時的慶祝通知' }
                  ].map((item) => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.notifications[item.key as keyof typeof preferences.notifications]}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: {
                            ...preferences.notifications,
                            [item.key]: e.target.checked
                          }
                        })}
                        disabled={!isEditing}
                      />
                      <div>
                        <div style={{ fontWeight: '500' }}>{item.label}</div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>{item.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Privacy */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>隱私設定</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.privacy.dataSharing}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        privacy: {
                          ...preferences.privacy,
                          dataSharing: e.target.checked
                        }
                      })}
                      disabled={!isEditing}
                    />
                    <div>
                      <div style={{ fontWeight: '500' }}>資料分享</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>允許匿名資料用於改善服務</div>
                    </div>
                  </label>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                      個人檔案可見性
                    </label>
                    <select
                      value={preferences.privacy.profileVisibility}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        privacy: {
                          ...preferences.privacy,
                          profileVisibility: e.target.value
                        }
                      })}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px',
                        backgroundColor: isEditing ? 'white' : '#f9fafb'
                      }}
                    >
                      <option value="private">私人</option>
                      <option value="friends">朋友可見</option>
                      <option value="public">公開</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}