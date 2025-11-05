'use client'

export default function Profile() {
  let activeTab = 'basic'
  let isEditing = false
  
  const profile = {
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
  }

  const preferences = {
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
      analytics: true,
      thirdPartyIntegration: true
    }
  }

  const setActiveTab = (tab: string) => {
    activeTab = tab
    // 更新 UI
    const tabs = ['basic', 'health', 'preferences']
    tabs.forEach(t => {
      const tabButton = document.getElementById(`tab-${t}`)
      const tabContent = document.getElementById(`content-${t}`)
      if (tabButton && tabContent) {
        if (t === tab) {
          tabButton.style.backgroundColor = '#f3f4f6'
          tabButton.style.borderBottom = '2px solid #4f46e5'
          tabButton.style.fontWeight = '600'
          tabButton.style.color = '#4f46e5'
          tabContent.style.display = 'block'
        } else {
          tabButton.style.backgroundColor = 'transparent'
          tabButton.style.borderBottom = '2px solid transparent'
          tabButton.style.fontWeight = 'normal'
          tabButton.style.color = '#6b7280'
          tabContent.style.display = 'none'
        }
      }
    })
  }

  const toggleEditing = () => {
    isEditing = !isEditing
    const editButton = document.getElementById('edit-button')
    const inputs = document.querySelectorAll('.profile-input')
    
    if (editButton) {
      editButton.textContent = isEditing ? '保存' : '編輯'
      editButton.style.backgroundColor = isEditing ? '#059669' : '#4f46e5'
    }
    
    inputs.forEach((input: any) => {
      input.disabled = !isEditing
      input.style.backgroundColor = isEditing ? 'white' : '#f9fafb'
    })
    
    if (!isEditing) {
      alert('個人資料已更新！')
    }
  }

  const handleSaveProfile = () => {
    alert('個人資料已更新！')
  }

  const handleSavePreferences = () => {
    alert('偏好設定已更新！')
  }

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
              <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>👤 個人資料</h1>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
        {/* 標籤頁 */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <button
              id="tab-basic"
              onClick={() => setActiveTab('basic')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: '#f3f4f6',
                borderBottom: '2px solid #4f46e5',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: '#4f46e5'
              }}
            >
              基本資料
            </button>
            <button
              id="tab-health"
              onClick={() => setActiveTab('health')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: '2px solid transparent',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'normal',
                color: '#6b7280'
              }}
            >
              健康目標
            </button>
            <button
              id="tab-preferences"
              onClick={() => setActiveTab('preferences')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: '2px solid transparent',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'normal',
                color: '#6b7280'
              }}
            >
              偏好設定
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            {/* 基本資料標籤 */}
            <div id="content-basic" style={{ display: 'block' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>基本資料</h2>
                  <button
                    id="edit-button"
                    onClick={toggleEditing}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    編輯
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      姓名
                    </label>
                    <input
                      type="text"
                      defaultValue={profile.name}
                      disabled={true}
                      className="profile-input"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#f9fafb'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      電子郵件
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: isEditing ? 'white' : '#f9fafb'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      年齡
                    </label>
                    <input
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: isEditing ? 'white' : '#f9fafb'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      性別
                    </label>
                    <select
                      value={profile.gender}
                      onChange={(e) => setProfile({...profile, gender: e.target.value})}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: isEditing ? 'white' : '#f9fafb'
                      }}
                    >
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                      <option value="other">其他</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      身高 (cm)
                    </label>
                    <input
                      type="number"
                      value={profile.height}
                      onChange={(e) => setProfile({...profile, height: parseInt(e.target.value)})}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: isEditing ? 'white' : '#f9fafb'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      體重 (kg)
                    </label>
                    <input
                      type="number"
                      value={profile.weight}
                      onChange={(e) => setProfile({...profile, weight: parseInt(e.target.value)})}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: isEditing ? 'white' : '#f9fafb'
                      }}
                    />
                  </div>
                </div>

                {/* BMI 計算 */}
                <div style={{ 
                  marginTop: '24px', 
                  padding: '16px', 
                  backgroundColor: '#f3f4f6', 
                  borderRadius: '6px' 
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    健康指標
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4f46e5' }}>
                        {(profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>BMI</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                        {profile.targetCalories}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>每日目標卡路里</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 健康目標標籤 */}
            {activeTab === 'health' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
                  健康目標設定
                </h2>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    活動水平
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activityLevels.map((level) => (
                      <label key={level.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="activityLevel"
                          value={level.value}
                          checked={profile.activityLevel === level.value}
                          onChange={(e) => setProfile({...profile, activityLevel: e.target.value})}
                          style={{ marginRight: '8px' }}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>{level.label}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{level.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    健康目標 (可多選)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    {healthGoals.map((goal) => (
                      <label key={goal.value} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: profile.goals.includes(goal.value) ? '#eff6ff' : 'white'
                      }}>
                        <input
                          type="checkbox"
                          value={goal.value}
                          checked={profile.goals.includes(goal.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfile({...profile, goals: [...profile.goals, goal.value]})
                            } else {
                              setProfile({...profile, goals: profile.goals.filter(g => g !== goal.value)})
                            }
                          }}
                          style={{ marginRight: '8px' }}
                        />
                        <span style={{ marginRight: '8px' }}>{goal.icon}</span>
                        <span style={{ fontSize: '14px' }}>{goal.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      目標體重 (kg)
                    </label>
                    <input
                      type="number"
                      value={profile.targetWeight}
                      onChange={(e) => setProfile({...profile, targetWeight: parseInt(e.target.value)})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      每日目標卡路里
                    </label>
                    <input
                      type="number"
                      value={profile.targetCalories}
                      onChange={(e) => setProfile({...profile, targetCalories: parseInt(e.target.value)})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  style={{
                    marginTop: '24px',
                    padding: '12px 24px',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  保存健康目標
                </button>
              </div>
            )}

            {/* 偏好設定標籤 */}
            {activeTab === 'preferences' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
                  偏好設定
                </h2>

                {/* 通知設定 */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '16px' }}>
                    通知設定
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px' }}>電子郵件通知</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.email}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, email: e.target.checked }
                        })}
                      />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px' }}>推播通知</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.push}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, push: e.target.checked }
                        })}
                      />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px' }}>週報通知</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.weeklyReport}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, weeklyReport: e.target.checked }
                        })}
                      />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px' }}>成就通知</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.achievements}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, achievements: e.target.checked }
                        })}
                      />
                    </label>
                  </div>
                </div>

                {/* 隱私設定 */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '16px' }}>
                    隱私設定
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px' }}>數據分享</span>
                      <input
                        type="checkbox"
                        checked={preferences.privacy.dataSharing}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          privacy: { ...preferences.privacy, dataSharing: e.target.checked }
                        })}
                      />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px' }}>使用分析</span>
                      <input
                        type="checkbox"
                        checked={preferences.privacy.analytics}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          privacy: { ...preferences.privacy, analytics: e.target.checked }
                        })}
                      />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px' }}>第三方整合</span>
                      <input
                        type="checkbox"
                        checked={preferences.privacy.thirdPartyIntegration}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          privacy: { ...preferences.privacy, thirdPartyIntegration: e.target.checked }
                        })}
                      />
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSavePreferences}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  保存偏好設定
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}