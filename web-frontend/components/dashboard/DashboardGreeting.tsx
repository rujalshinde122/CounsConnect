'use client'

import { useLanguage } from '@/context/LanguageContext'

interface DashboardGreetingProps {
  displayName: string
}

export default function DashboardGreeting({ displayName }: DashboardGreetingProps) {
  const { t } = useLanguage()
  const h = new Date().getHours()
  const timeKey = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  const greeting = t(`dashboard.greeting.${timeKey}`)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2D3A3A] tracking-tight">
        {greeting}, {displayName}
      </h1>
      <p className="text-xs text-[#5A6B6B] mt-0.5">
        {t('dashboard.greeting.subtitle')}
      </p>
    </div>
  )
}
