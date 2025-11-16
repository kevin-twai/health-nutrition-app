'use client'

import { useState, useEffect } from 'react'
// 暫時移除 heroicons 依賴，使用 emoji 替代

interface WeeklyReport {
  period: string
  summary: {
    totalCalories: number
    avgCaloriesPerDay: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
  }
  trends: {
    caloriesTrend: string
    proteinTrend: string
    exerciseTrend: string
  }
}

export default function Reports() {
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchWeeklyReport()
  }, [])

  const fetchWeeklyReport = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://health-nutrition-api.onrender.com'
      const response = await fetch(`${API_URL}/api/v1/reports/weekly`)
      const data = await response.json()
      if (data.success) {
        setWeeklyReport(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch weekly report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <span className="text-green-500 text-xl">📈</span>
      case 'decreasing':
        return <span className="text-red-500 text-xl">📉</span>
      default:
        return <span className="text-gray-500 text-xl">📊</span>
    }
  }

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return '上升趨勢'
      case 'decreasing':
        return '下降趨勢'
      case 'stable':
        return '穩定'
      case 'improving':
        return '改善中'
      default:
        return '無變化'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
      case 'improving':
        return 'text-green-600'
      case 'decreasing':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入報告中...</p>
        </div>
      </div>
    )
  }

  if (!weeklyReport) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">無法載入報告資料</p>
          <button
            onClick={fetchWeeklyReport}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            重新載入
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">健康報告</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                返回儀表板
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 報告期間 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">週度健康報告</h2>
              <span className="text-sm text-gray-500">{weeklyReport.period}</span>
            </div>
          </div>

          {/* 營養攝取總覽 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">營養攝取總覽</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800">總卡路里</h4>
                <p className="text-2xl font-bold text-blue-900">
                  {weeklyReport.summary.totalCalories.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600">
                  平均每日: {weeklyReport.summary.avgCaloriesPerDay} 卡
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-800">總蛋白質</h4>
                <p className="text-2xl font-bold text-green-900">
                  {weeklyReport.summary.totalProtein}g
                </p>
                <p className="text-sm text-green-600">
                  平均每日: {Math.round(weeklyReport.summary.totalProtein / 7)}g
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800">總碳水化合物</h4>
                <p className="text-2xl font-bold text-yellow-900">
                  {weeklyReport.summary.totalCarbs}g
                </p>
                <p className="text-sm text-yellow-600">
                  平均每日: {Math.round(weeklyReport.summary.totalCarbs / 7)}g
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-800">總脂肪</h4>
                <p className="text-2xl font-bold text-purple-900">
                  {weeklyReport.summary.totalFat}g
                </p>
                <p className="text-sm text-purple-600">
                  平均每日: {Math.round(weeklyReport.summary.totalFat / 7)}g
                </p>
              </div>
            </div>
          </div>

          {/* 趨勢分析 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">趨勢分析</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-4 border rounded-lg">
                <div className="flex-shrink-0 mr-4">
                  {getTrendIcon(weeklyReport.trends.caloriesTrend)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">卡路里攝取</h4>
                  <p className={`text-sm ${getTrendColor(weeklyReport.trends.caloriesTrend)}`}>
                    {getTrendText(weeklyReport.trends.caloriesTrend)}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-4 border rounded-lg">
                <div className="flex-shrink-0 mr-4">
                  {getTrendIcon(weeklyReport.trends.proteinTrend)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">蛋白質攝取</h4>
                  <p className={`text-sm ${getTrendColor(weeklyReport.trends.proteinTrend)}`}>
                    {getTrendText(weeklyReport.trends.proteinTrend)}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-4 border rounded-lg">
                <div className="flex-shrink-0 mr-4">
                  {getTrendIcon(weeklyReport.trends.exerciseTrend)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">運動表現</h4>
                  <p className={`text-sm ${getTrendColor(weeklyReport.trends.exerciseTrend)}`}>
                    {getTrendText(weeklyReport.trends.exerciseTrend)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 建議事項 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">個人化建議</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800">營養建議</h4>
                <p className="text-sm text-green-700 mt-1">
                  您的蛋白質攝取呈現上升趨勢，這很好！建議繼續保持，並注意搭配適量的蔬菜和水果。
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">運動建議</h4>
                <p className="text-sm text-blue-700 mt-1">
                  您的運動表現正在改善中，建議每週至少進行 150 分鐘的中等強度運動。
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800">生活習慣建議</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  保持規律的作息時間，確保每天 7-8 小時的充足睡眠，有助於新陳代謝和體重管理。
                </p>
              </div>
            </div>
          </div>

          {/* 行動計劃 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">下週行動計劃</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 border rounded-lg">
                <input type="checkbox" className="mr-3" />
                <span className="text-gray-900">每天記錄三餐營養攝取</span>
              </div>
              <div className="flex items-center p-3 border rounded-lg">
                <input type="checkbox" className="mr-3" />
                <span className="text-gray-900">增加蔬菜攝取量至每日 5 份</span>
              </div>
              <div className="flex items-center p-3 border rounded-lg">
                <input type="checkbox" className="mr-3" />
                <span className="text-gray-900">每週進行 3 次 30 分鐘有氧運動</span>
              </div>
              <div className="flex items-center p-3 border rounded-lg">
                <input type="checkbox" className="mr-3" />
                <span className="text-gray-900">每天飲水量達到 2000ml</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}