'use client'

import { CalendarDays, Users, UserPlus, CheckSquare, TrendingUp } from 'lucide-react'
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
      badgeColor: 'bg-[#588B8B]/10 text-[#588B8B]',
      accentBg: 'from-[#588B8B]/5 to-transparent',
      borderColor: 'hover:border-[#588B8B]/40',
    },
    {
      label: t('dashboard.overview.stats.totalClients'),
      value: totalClientsCount,
      subtext: t('dashboard.overview.stats.totalClientsSubtext'),
      icon: Users,
      badgeColor: 'bg-emerald-50 text-emerald-700',
      accentBg: 'from-emerald-500/5 to-transparent',
      borderColor: 'hover:border-emerald-500/40',
    },
    {
      label: t('dashboard.overview.stats.newThisWeek'),
      value: newClientsThisWeekCount,
      subtext: t('dashboard.overview.stats.newThisWeekSubtext'),
      icon: UserPlus,
      badgeColor: 'bg-amber-50 text-amber-700',
      accentBg: 'from-amber-500/5 to-transparent',
      borderColor: 'hover:border-amber-500/40',
    },
    {
      label: t('dashboard.overview.stats.pendingTasks'),
      value: pendingTasksCount,
      subtext: t('dashboard.overview.stats.pendingTasksSubtext'),
      icon: CheckSquare,
      badgeColor: 'bg-indigo-50 text-indigo-700',
      accentBg: 'from-indigo-500/5 to-transparent',
      borderColor: 'hover:border-indigo-500/40',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, subtext, icon: Icon, badgeColor, accentBg, borderColor }) => (
        <div
          key={label}
          className={`group bg-white rounded-2xl p-5 border border-[#E2E0D6] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden ${borderColor}`}
        >
          {/* Subtle background gradient flare */}
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${accentBg} rounded-bl-full pointer-events-none transition-opacity group-hover:opacity-100 opacity-60`} />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold text-[#5A6B6B] uppercase tracking-wider">
              {label}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${badgeColor} transition-transform duration-200 group-hover:scale-110 shadow-2xs`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-3xl font-extrabold text-[#2D3A3A] tracking-tight tabular-nums">
              {value}
            </p>
            <p className="text-xs text-[#889898] font-medium mt-1">
              {subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
