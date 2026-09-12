'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckSquare, CheckCircle2, Clock, Plus } from 'lucide-react'
import type { Task } from '@/lib/types'
import { useLanguage } from '@/context/LanguageContext'
import CreateTaskModal from '@/components/dashboard/CreateTaskModal'
import type { PatientOption } from '@/components/dashboard/CreateAppointmentModal'

interface PendingTasksCardProps {
  pendingTasks?: Task[] | null
  patients?: PatientOption[]
}

export default function PendingTasksCard({ pendingTasks, patients }: PendingTasksCardProps) {
  const { t, locale } = useLanguage()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const hasTasks = pendingTasks && pendingTasks.length > 0

  return (
    <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-xs overflow-hidden h-full flex flex-col justify-between">
      {/* Header */}
      <div className="px-6 py-4.5 border-b border-[#E2E0D6]/80 flex items-center justify-between bg-gradient-to-r from-white to-[#F6F5EE]/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#588B8B]/10 text-[#588B8B] flex items-center justify-center shadow-2xs">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#2D3A3A] tracking-tight">
              {t('dashboard.overview.pendingTasks.title')}
            </h2>
            <p className="text-xs text-[#5A6B6B] mt-0.5">
              {t('dashboard.overview.pendingTasks.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#588B8B] hover:bg-[#457070] text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('dashboard.tasks.assignTaskButton')}</span>
          </button>

          <Link
            href="/dashboard/tasks"
            className="text-xs font-semibold text-[#588B8B] hover:text-[#3D6363] hover:underline underline-offset-4 flex items-center gap-1 transition-colors"
          >
            <span>{t('common.viewAll')}</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {!hasTasks ? (
          <div className="py-12 px-6 text-center space-y-3 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-2xl bg-[#F6F5EE] border border-[#E2E0D6] flex items-center justify-center text-emerald-600 mb-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2D3A3A]">{t('dashboard.overview.pendingTasks.empty')}</p>
              <p className="text-[11px] text-[#889898] mt-0.5">Assign therapeutic exercises or homework to patients</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#588B8B] hover:bg-[#457070] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('dashboard.tasks.assignTaskButton')}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E0D6]/60">
            {pendingTasks.map((task) => {
              const dateLocale = locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-US'
              const dueDate = task.deadline ? new Date(task.deadline).toLocaleDateString(dateLocale) : ''

              return (
                <div
                  key={task.id}
                  className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[#F6F5EE]/40 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-4 h-4 rounded-md border-2 border-[#E2E0D6] group-hover:border-[#588B8B] transition-colors shrink-0 flex items-center justify-center" />

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2D3A3A] group-hover:text-[#588B8B] transition-colors truncate">
                        {task.title}
                      </p>
                      {task.patient?.name && (
                        <p className="text-[11px] text-[#5A6B6B] mt-0.5 truncate">
                          {t('common.patient')}: <span className="font-semibold">{task.patient.name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {task.deadline && (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-800 bg-amber-50/90 border border-amber-200/70 px-2 py-0.5 rounded-full shrink-0">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{dueDate}</span>
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Assign Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        patients={patients}
      />
    </div>
  )
}
