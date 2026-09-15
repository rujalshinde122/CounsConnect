'use client'

import Link from 'next/link'
import type { Task } from '@/lib/types'
import { useLanguage } from '@/context/LanguageContext'

interface PendingTasksCardProps {
  pendingTasks?: Task[] | null
}

export default function PendingTasksCard({ pendingTasks }: PendingTasksCardProps) {
  const { t, locale } = useLanguage()
  const hasTasks = pendingTasks && pendingTasks.length > 0

  return (
    <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E2E0D6] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#2D3A3A]">{t('dashboard.overview.pendingTasks.title')}</h2>
          <p className="text-xs text-[#5A6B6B] mt-0.5">{t('dashboard.overview.pendingTasks.subtitle')}</p>
        </div>

        <Link
          href="/dashboard/tasks"
          className="text-xs font-semibold text-[#588B8B] hover:text-[#3D6363] hover:underline"
        >
          {t('common.viewAll')}
        </Link>
      </div>

      {/* Content */}
      {!hasTasks ? (
        <div className="py-10 px-6 text-center space-y-2">
          <p className="text-xs text-[#5A6B6B]">{t('dashboard.overview.pendingTasks.empty')}</p>
        </div>
      ) : (
        <div className="divide-y divide-[#E2E0D6]/60">
          {pendingTasks.map((task) => {
            const dueDate = task.deadline
              ? new Date(task.deadline).toLocaleDateString(locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-US')
              : null

            return (
              <div
                key={task.id}
                className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[#F6F5EE]/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#2D3A3A] truncate">
                    {task.title}
                  </p>
                  {task.patient?.name && (
                    <p className="text-xs text-[#5A6B6B] mt-0.5 truncate">
                      {t('common.patient')}: {task.patient.name}
                    </p>
                  )}
                </div>

                {dueDate && (
                  <span className="font-mono text-xs text-[#889898] shrink-0">
                    {t('common.due')} {dueDate}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
