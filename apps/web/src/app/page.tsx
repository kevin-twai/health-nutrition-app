import { CameraIcon, ChatBubbleLeftRightIcon, ChartBarIcon, TrophyIcon, LinkIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const features = [
    {
      name: '拍照辨識餐點營養',
      description: '使用AI技術自動辨識食物並計算營養成分',
      icon: CameraIcon,
    },
    {
      name: 'AI 聊天健康顧問',
      description: '個人化健康建議和營養指導',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: '第三方平台整合',
      description: '與Notion、Line、Apple Health等平台同步',
      icon: LinkIcon,
    },
    {
      name: '週度健康報告',
      description: '詳細的健康趨勢分析和改善建議',
      icon: ChartBarIcon,
    },
    {
      name: '遊戲化任務系統',
      description: '任務、獎勵和成就系統提升參與度',
      icon: TrophyIcon,
    },
  ]

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              健康營養追蹤系統
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              綜合性健康管理應用，透過拍照辨識餐點自動估算營養素，結合AI聊天顧問提供個人化建議，
              並整合第三方平台實現自動化記錄。
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/auth"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                立即開始
              </a>
              <a href="/dashboard" className="text-sm font-semibold leading-6 text-gray-900">
                進入系統 <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">功能特色</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              全方位健康管理解決方案
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              結合最新AI技術和使用者友善設計，提供完整的健康追蹤和管理體驗。
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}