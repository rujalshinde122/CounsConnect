'use client'

import { CalendarDays, Users, UserPlus, CheckSquare } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface PracticeStatsProps {
  todaySessionsCount: number
  totalClientsCount: number
  newClientsThisWeekCount: number
  pendingTasksCount: number
}

export default function PracticeStats({
  todaySessionsCount,
  totalClientsCount,
  newClientsThisWeekCount,
  pendingTasksCount,
}: PracticeStatsProps) {
  const { t } = useLanguage()

  const stats = [
    {
      label: t('dashboard.overview.stats.todaySessions'),
      value: todaySessionsCount,
      subtext: t('dashboard.overview.stats.todaySessionsSubtext'),
      icon: CalendarDays,
    },
    {
      label: t('dashboard.overview.stats.totalClients'),
      value: totalClientsCount,
      subtext: t('dashboard.overview.stats.totalClientsSubtext'),
      icon: Users,
    },
    {
      label: t('dashboard.overview.stats.newThisWeek'),
      value: newClientsThisWeekCount,
      subtext: t('dashboard.overview.stats.newThisWeekSubtext'),
      icon: UserPlus,
    },
    {
      label: t('dashboard.overview.stats.pendingTasks'),
      value: pendingTasksCount,
      subtext: t('dashboard.overview.stats.pendingTasksSubtext'),
      icon: CheckSquare,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, subtext, icon: Icon }) => (
        <div
          key={label}
          className="bg-white rounded-xl p-5 border border-[#E2E0D6] shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#5A6B6B] uppercase tracking-wide">
              {label}
            </span>
            <Icon className="w-4 h-4 text-[#588B8B]" />
          </div>
          <p className="text-2xl font-bold text-[#2D3A3A] tracking-tight tabular-nums">
            {value}
          </p>
          <p className="text-xs text-[#889898] mt-0.5">
            {subtext}
          </p>
        </div>
      ))}
    </div>
  )
}
