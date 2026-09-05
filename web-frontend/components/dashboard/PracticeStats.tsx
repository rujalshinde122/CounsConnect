'use client'

import { CalendarDays, Users, UserPlus, CheckSquare } from 'lucide-react'

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
  const stats = [
    {
      label: "Today's Sessions",
      value: todaySessionsCount,
      subtext: "Scheduled today",
      icon: CalendarDays,
    },
    {
      label: "Total Clients",
      value: totalClientsCount,
      subtext: "Active caseload",
      icon: Users,
    },
    {
      label: "New This Week",
      value: newClientsThisWeekCount,
      subtext: "Past 7 days",
      icon: UserPlus,
    },
    {
      label: "Pending Tasks",
      value: pendingTasksCount,
      subtext: "Client assignments",
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
