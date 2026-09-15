'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { CheckSquare, CheckCircle2, Clock, Plus, Search, X } from 'lucide-react'
import type { Task } from '@/lib/types'
import { useLanguage } from '@/context/LanguageContext'

interface TasksViewProps {
  tasks: (Task & { patient?: { name: string | null; email: string } })[] | null
}

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-amber-50/90 text-amber-800 border-amber-200/80',
  completed: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/80',
  missed: 'bg-rose-50/90 text-rose-800 border-rose-200/80',
  overdue: 'bg-orange-50/90 text-orange-800 border-orange-200/80',
}

const FREQ_KEYS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  once: 'One-time',
}

export default function TasksView({ tasks }: TasksViewProps) {
  const { t, locale } = useLanguage()
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const dateLocale = locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-US'

  const counts = useMemo(() => {
    const list = tasks ?? []
    return {
      all: list.length,
      pending: list.filter((t) => t.status === 'pending').length,
      completed: list.filter((t) => t.status === 'completed').length,
      overdue: list.filter((t) => t.status === 'overdue').length,
    }
  }, [tasks])

  const filteredTasks = useMemo(() => {
    const list = tasks ?? []
    return list.filter((task) => {
      const matchesFilter = filter === 'all' || task.status === filter
      if (!matchesFilter) return false
      if (!searchTerm) return true
      const term = searchTerm.toLowerCase()
      const title = task.title.toLowerCase()
      const desc = task.description?.toLowerCase() || ''
      const patient = task.patient?.name?.toLowerCase() || ''
      return title.includes(term) || desc.includes(term) || patient.includes(term)
    })
  }, [tasks, filter, searchTerm])

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3A3A] tracking-tight flex items-center gap-2.5">
            <span>{t('dashboard.tasks.title')}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#588B8B]/10 text-[#588B8B] border border-[#588B8B]/20">
              {tasks?.length ?? 0}
            </span>
          </h1>
          <p className="text-xs text-[#5A6B6B] mt-0.5">{t('dashboard.tasks.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Assign Task Action Button */}
          <Link
            href="/dashboard/tasks/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#588B8B] to-[#457070] hover:from-[#457070] hover:to-[#365959] text-white text-xs font-bold shadow-xs hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('dashboard.tasks.assignTaskButton')}</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E0D6] p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'pending', label: t('common.status.pending'), count: counts.pending },
            { key: 'completed', label: t('common.status.completed'), count: counts.completed },
          ].map((tab) => {
            const isSelected = filter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#588B8B] text-white shadow-2xs'
                    : 'text-[#5A6B6B] hover:text-[#2D3A3A] hover:bg-[#F6F5EE]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#E2E0D6] text-[#5A6B6B]'}`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#889898] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('common.search')}
            className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-[#F6F5EE]/70 hover:bg-[#F6F5EE] focus:bg-white text-xs sm:text-sm text-[#2D3A3A] placeholder-[#889898] border border-transparent focus:border-[#588B8B] focus:outline-none transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#889898] hover:text-[#2D3A3A] p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {!tasks || tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E0D6] p-16 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#F6F5EE] border border-[#E2E0D6] flex items-center justify-center mx-auto text-[#588B8B]">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#2D3A3A]">{t('dashboard.tasks.emptyTitle')}</h3>
            <p className="text-xs text-[#5A6B6B] max-w-sm mx-auto">
              {t('dashboard.tasks.emptySubtitle')}
            </p>
          </div>
          <div>
            <Link
              href="/dashboard/tasks/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#588B8B] hover:bg-[#457070] text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('dashboard.tasks.assignTaskButton')}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-xs overflow-hidden">
          <div className="divide-y divide-[#E2E0D6]/60">
            {filteredTasks.map((task) => {
              const statusCls = STATUS_CLASSES[task.status] ?? STATUS_CLASSES.pending
              const statusLabel = t(`common.status.${task.status}`) || task.status
              const isCompleted = task.status === 'completed'

              return (
                <div
                  key={task.id}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#F6F5EE]/40 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-[#588B8B] border-[#588B8B] text-white'
                          : 'border-[#E2E0D6] group-hover:border-[#588B8B]'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>

                    <div className="min-w-0">
                      <p className={`font-bold text-xs leading-tight transition-colors ${isCompleted ? 'line-through text-[#889898]' : 'text-[#2D3A3A] group-hover:text-[#588B8B]'}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-[#5A6B6B] mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#889898]">
                        {task.patient?.name && (
                          <span className="text-[#5A6B6B] font-semibold">
                            {t('common.patient')}: {task.patient.name}
                          </span>
                        )}
                        {task.frequency && (
                          <span className="px-2 py-0.2 rounded-md bg-[#F6F5EE] border border-[#E2E0D6] text-[11px] font-medium text-[#5A6B6B]">
                            {t(`common.frequency.${task.frequency}`) || FREQ_KEYS[task.frequency] || task.frequency}
                          </span>
                        )}
                        {task.deadline && (
                          <span className="font-mono text-[11px] font-medium flex items-center gap-1 text-[#889898]">
                            <Clock className="w-3 h-3 text-[#889898]" />
                            <span>{t('common.due')}: {new Date(task.deadline).toLocaleDateString(dateLocale)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border capitalize font-semibold tracking-wide ${statusCls}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
              )
            })}
            {filteredTasks.length === 0 && (
              <div className="p-12 text-center text-xs text-[#5A6B6B]">
                No tasks in this category
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
