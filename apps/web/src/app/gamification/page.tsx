'use client'

export default function Gamification() {
  const userStats = {
    level: 12,
    experience: 2450,
    nextLevelExp: 3000,
    totalPoints: 15680,
    streakDays: 7,
    completedTasks: 45,
    achievements: 8
  }

  const dailyTasks = [
    { id: 1, title: '記錄早餐', description: '拍照或手動記錄早餐內容', points: 50, completed: true },
    { id: 2, title: '喝水 8 杯', description: '今日飲水目標 2000ml', points: 30, completed: true, progress: 6, target: 8 },
    { id: 3, title: '步行 8000 步', description: '達成每日步數目標', points: 40, completed: false, progress: 5200, target: 8000 },
    { id: 4, title: '記錄晚餐', description: '拍照或手動記錄晚餐內容', points: 50, completed: false },
    { id: 5, title: '睡眠 7 小時', description: '保持充足睡眠', points: 60, completed: false }
  ]

  const achievements = [
    { id: 1, title: '連續記錄達人', description: '連續記錄 7 天', icon: '🔥', unlocked: true, date: '2024-11-01' },
    { id: 2, title: '營養均衡師', description: '一週內達成營養均衡 5 天', icon: '🥗', unlocked: true, date: '2024-10-28' },
    { id: 3, title: '水分補充王', description: '連續 3 天達成飲水目標', icon: '💧', unlocked: true, date: '2024-10-25' },
    { id: 4, title: '運動新手', description: '完成第一次運動記錄', icon: '🏃', unlocked: true, date: '2024-10-20' },
    { id: 5, title: '早起鳥兒', description: '連續 5 天早上 7 點前起床', icon: '🌅', unlocked: false },
    { id: 6, title: '蛋白質達人', description: '一週內每天達成蛋白質目標', icon: '💪', unlocked: false }
  ]

  const leaderboard = [
    { rank: 1, name: '健康小達人', points: 18500, avatar: '👑' },
    { rank: 2, name: '營養師小王', points: 17200, avatar: '🥇' },
    { rank: 3, name: '運動愛好者', points: 16800, avatar: '🥈' },
    { rank: 4, name: '您', points: 15680, avatar: '🥉', isCurrentUser: true },
    { rank: 5, name: '健身新手', points: 14200, avatar: '🏃' }
  ]

  const handleCompleteTask = (taskId: number) => {
    alert(`任務完成！獲得積分！`)
  }

  const progressPercentage = (userStats.experience / userStats.nextLevelExp) * 100

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
              <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>🎮 遊戲化系統</h1>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* 用戶統計 */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              個人統計
            </h2>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>
                等級 {userStats.level}
              </div>
            </div>

            {/* 經驗值進度條 */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>經驗值</span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {userStats.experience}/{userStats.nextLevelExp}
                </span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#e5e7eb', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${progressPercentage}%`, 
                  height: '100%', 
                  backgroundColor: '#4f46e5',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                  {userStats.totalPoints}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>總積分</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                  {userStats.streakDays}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>連續天數</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7c3aed' }}>
                  {userStats.completedTasks}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>完成任務</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ea580c' }}>
                  {userStats.achievements}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>獲得成就</div>
              </div>
            </div>
          </div>

          {/* 每日任務 */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              今日任務
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dailyTasks.map((task) => (
                <div key={task.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '12px',
                  backgroundColor: task.completed ? '#f0fdf4' : 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: task.completed ? '#166534' : '#1f2937',
                        textDecoration: task.completed ? 'line-through' : 'none'
                      }}>
                        {task.completed ? '✅' : '⭕'} {task.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {task.description}
                      </div>
                      {task.progress !== undefined && (
                        <div style={{ marginTop: '4px' }}>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            進度: {task.progress}/{task.target}
                          </div>
                          <div style={{ 
                            width: '100%', 
                            height: '4px', 
                            backgroundColor: '#e5e7eb', 
                            borderRadius: '2px',
                            marginTop: '2px'
                          }}>
                            <div style={{ 
                              width: `${(task.progress / task.target) * 100}%`, 
                              height: '100%', 
                              backgroundColor: '#4f46e5',
                              borderRadius: '2px'
                            }} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ marginLeft: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '500' }}>
                        +{task.points} 分
                      </div>
                      {!task.completed && (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          style={{
                            marginTop: '4px',
                            padding: '4px 8px',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          完成
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 成就系統 */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              成就收集
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {achievements.map((achievement) => (
                <div key={achievement.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '12px',
                  textAlign: 'center',
                  backgroundColor: achievement.unlocked ? '#fef3c7' : '#f9fafb',
                  opacity: achievement.unlocked ? 1 : 0.6
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                    {achievement.unlocked ? achievement.icon : '🔒'}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: achievement.unlocked ? '#92400e' : '#6b7280'
                  }}>
                    {achievement.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                    {achievement.description}
                  </div>
                  {achievement.unlocked && achievement.date && (
                    <div style={{ fontSize: '10px', color: '#92400e', marginTop: '4px' }}>
                      {achievement.date}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 排行榜 */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              本週排行榜
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboard.map((user) => (
                <div key={user.rank} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: user.isCurrentUser ? '#eff6ff' : 'transparent',
                  border: user.isCurrentUser ? '1px solid #3b82f6' : '1px solid transparent'
                }}>
                  <div style={{ 
                    width: '24px', 
                    textAlign: 'center', 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    color: user.rank <= 3 ? '#ea580c' : '#6b7280'
                  }}>
                    #{user.rank}
                  </div>
                  <div style={{ fontSize: '20px', margin: '0 8px' }}>
                    {user.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: user.isCurrentUser ? 'bold' : 'normal',
                      color: user.isCurrentUser ? '#1e40af' : '#1f2937'
                    }}>
                      {user.name}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#4f46e5' 
                  }}>
                    {user.points.toLocaleString()} 分
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}