'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  CheckSquare,
  CheckCircle2,
  Check,
  RotateCcw,
  Clock,
  Plus,
  Search,
  X,
  Loader2,
  Pencil,
  Trash2,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  Activity,
} from 'lucide-react'
import type { Task, TaskFrequency, TaskStatus } from '@/lib/types'
import { useLanguage } from '@/context/LanguageContext'

interface TasksViewProps {
  tasks: (Task & { patient?: { name: string | null } })[] | null
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

const FREQUENCIES: { value: TaskFrequency; labelKey: string; fallback: string }[] = [
  { value: 'daily', labelKey: 'common.frequency.daily', fallback: 'Daily' },
  { value: 'weekly', labelKey: 'common.frequency.weekly', fallback: 'Weekly' },
  { value: 'biweekly', labelKey: 'common.frequency.biweekly', fallback: 'Bi-weekly' },
  { value: 'monthly', labelKey: 'common.frequency.monthly', fallback: 'Monthly' },
  { value: 'once', labelKey: 'common.frequency.once', fallback: 'One-time' },
]

const STATUS_OPTIONS: { value: TaskStatus; labelKey: string; fallback: string }[] = [
  { value: 'pending', labelKey: 'common.status.pending', fallback: 'Pending' },
  { value: 'completed', labelKey: 'common.status.completed', fallback: 'Completed' },
  { value: 'missed', labelKey: 'common.status.missed', fallback: 'Missed' },
  { value: 'overdue', labelKey: 'common.status.overdue', fallback: 'Overdue' },
]

type TaskItem = Task & { patient?: { name: string | null } }

export default function TasksView({ tasks }: TasksViewProps) {
  const { t, locale } = useLanguage()
  const router = useRouter()

  const [localTasks, setLocalTasks] = useState<TaskItem[]>(tasks ?? [])
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Edit modal state
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null)
  const [editForm, setEditForm] = useState<{
    title: string
    description: string
    frequency: TaskFrequency
    deadline: string
    status: TaskStatus
  }>({
    title: '',
    description: '',
    frequency: 'daily',
    deadline: '',
    status: 'pending',
  })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState('')

  // Delete modal state
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Sync prop changes to local state
  useEffect(() => {
    setLocalTasks(tasks ?? [])
  }, [tasks])

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!editSubmitting) setEditingTask(null)
        if (!deleteSubmitting) setDeletingTask(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editSubmitting, deleteSubmitting])

  const toggleTaskStatus = async (task: TaskItem) => {
    if (updatingId) return
    setUpdatingId(task.id)
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed'

    // Optimistic local update
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    )

    const supabase = createClient()
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', task.id)

    if (error) {
      // Revert if failed
      setLocalTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      )
    } else {
      router.refresh()
    }
    setUpdatingId(null)
  }

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task)
    setEditError('')
    let deadlineStr = ''
    if (task.deadline) {
      try {
        deadlineStr = new Date(task.deadline).toISOString().split('T')[0]
      } catch {
        deadlineStr = ''
      }
    }
    setEditForm({
      title: task.title,
      description: task.description || '',
      frequency: (task.frequency as TaskFrequency) || 'daily',
      deadline: deadlineStr,
      status: task.status,
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return

    if (!editForm.title.trim()) {
      setEditError('Task title is required.')
      return
    }

    setEditSubmitting(true)
    setEditError('')

    const supabase = createClient()
    const payload = {
      title: editForm.title.trim(),
      description: editForm.description.trim() || null,
      frequency: editForm.frequency,
      deadline: editForm.deadline ? new Date(editForm.deadline).toISOString() : null,
      status: editForm.status,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', editingTask.id)

    setEditSubmitting(false)

    if (error) {
      setEditError(error.message)
      return
    }

    // Instant local state update
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === editingTask.id ? { ...t, ...payload } : t))
    )
    setEditingTask(null)
    router.refresh()
  }

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return

    setDeleteSubmitting(true)
    setDeleteError('')

    const supabase = createClient()
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', deletingTask.id)

    setDeleteSubmitting(false)

    if (error) {
      setDeleteError(error.message)
      return
    }

    // Instant local state update
    setLocalTasks((prev) => prev.filter((t) => t.id !== deletingTask.id))
    setDeletingTask(null)
    router.refresh()
  }

  const dateLocale = locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-US'

  const counts = useMemo(() => {
    const list = localTasks
    return {
      all: list.length,
      pending: list.filter((t) => t.status === 'pending').length,
      completed: list.filter((t) => t.status === 'completed').length,
      overdue: list.filter((t) => t.status === 'overdue').length,
      missed: list.filter((t) => t.status === 'missed').length,
    }
  }, [localTasks])

  const filteredTasks = useMemo(() => {
    return localTasks.filter((task) => {
      const matchesFilter = filter === 'all' || task.status === filter
      if (!matchesFilter) return false
      if (!searchTerm) return true
      const term = searchTerm.toLowerCase()
      const title = task.title.toLowerCase()
      const desc = task.description?.toLowerCase() || ''
      const patient = task.patient?.name?.toLowerCase() || ''
      return title.includes(term) || desc.includes(term) || patient.includes(term)
    })
  }, [localTasks, filter, searchTerm])

  const tabs = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'pending', label: t('common.status.pending'), count: counts.pending },
    { key: 'completed', label: t('common.status.completed'), count: counts.completed },
    ...(counts.overdue > 0
      ? [{ key: 'overdue', label: t('common.status.overdue') || 'Overdue', count: counts.overdue }]
      : []),
    ...(counts.missed > 0
      ? [{ key: 'missed', label: t('common.status.missed') || 'Missed', count: counts.missed }]
      : []),
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3A3A] tracking-tight flex items-center gap-2.5">
            <span>{t('dashboard.tasks.title')}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#588B8B]/10 text-[#588B8B] border border-[#588B8B]/20">
              {localTasks.length}
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
          {tabs.map((tab) => {
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
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#E2E0D6] text-[#5A6B6B]'
                  }`}
                >
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

      {localTasks.length === 0 ? (
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
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Task Type Icon Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-700'
                          : 'bg-[#588B8B]/10 border-[#588B8B]/20 text-[#588B8B]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4.5 h-4.5" />
                      ) : (
                        <CheckSquare className="w-4.5 h-4.5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-bold text-xs sm:text-sm leading-tight transition-colors ${
                          isCompleted
                            ? 'line-through text-[#889898]'
                            : 'text-[#2D3A3A] group-hover:text-[#588B8B]'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-[#5A6B6B] mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#889898]">
                        {task.patient?.name && (
                          <span className="text-[#5A6B6B] font-semibold flex items-center gap-1">
                            <User className="w-3 h-3 text-[#588B8B]" />
                            <span>
                              {t('common.patient')}: {task.patient.name}
                            </span>
                          </span>
                        )}
                        {task.frequency && (
                          <span className="px-2 py-0.2 rounded-md bg-[#F6F5EE] border border-[#E2E0D6] text-[11px] font-medium text-[#5A6B6B]">
                            {t(`common.frequency.${task.frequency}`) ||
                              FREQ_KEYS[task.frequency] ||
                              task.frequency}
                          </span>
                        )}
                        {task.deadline && (
                          <span className="font-mono text-[11px] font-medium flex items-center gap-1 text-[#889898]">
                            <Clock className="w-3 h-3 text-[#889898]" />
                            <span>
                              {t('common.due')}: {new Date(task.deadline).toLocaleDateString(dateLocale)}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Badge */}
                  <div className="shrink-0 flex items-center gap-2.5 flex-wrap justify-end">
                    {/* Status Badge */}
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border capitalize font-semibold tracking-wide ${statusCls}`}
                    >
                      {statusLabel}
                    </span>

                    {/* Mark as Completed / Mark as Pending Button */}
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(task)}
                      disabled={updatingId === task.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
                        isCompleted
                          ? 'bg-[#F6F5EE] hover:bg-[#E2E0D6]/70 text-[#5A6B6B] hover:text-[#2D3A3A] border-[#E2E0D6]'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200/90 shadow-2xs hover:shadow-xs'
                      } ${updatingId === task.id ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {updatingId === task.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                      ) : isCompleted ? (
                        <RotateCcw className="w-3.5 h-3.5 text-[#5A6B6B]" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                      )}
                      <span>
                        {isCompleted
                          ? t('dashboard.tasks.markAsPending') || 'Mark as Pending'
                          : t('dashboard.tasks.markAsCompleted') || 'Mark as Completed'}
                      </span>
                    </button>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(task)}
                        title={t('dashboard.tasks.editTask') || 'Edit Task'}
                        className="p-1.5 rounded-lg text-[#5A6B6B] hover:text-[#588B8B] hover:bg-[#588B8B]/10 border border-transparent hover:border-[#588B8B]/20 transition-all cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeletingTask(task)
                          setDeleteError('')
                        }}
                        title={t('dashboard.tasks.deleteTask') || 'Delete Task'}
                        className="p-1.5 rounded-lg text-[#5A6B6B] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

      {/* ================= EDIT TASK MODAL ================= */}
      {editingTask && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !editSubmitting) setEditingTask(null)
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E2E0D6] bg-[#F6F5EE]/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#588B8B]/10 border border-[#588B8B]/20 text-[#588B8B] flex items-center justify-center shrink-0">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D3A3A]">
                    {t('dashboard.tasks.editModal.title') || 'Edit Task'}
                  </h3>
                  <p className="text-[11px] text-[#5A6B6B]">
                    {t('dashboard.tasks.editModal.subtitle') ||
                      'Update task title, schedule, instructions, or status'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !editSubmitting && setEditingTask(null)}
                className="p-1.5 rounded-lg text-[#889898] hover:text-[#2D3A3A] hover:bg-[#E2E0D6]/40 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {editError && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">{editError}</div>
                </div>
              )}

              {/* Client Info (Read-only banner) */}
              {editingTask.patient?.name && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F6F5EE] border border-[#E2E0D6] text-xs text-[#5A6B6B]">
                  <User className="w-4 h-4 text-[#588B8B]" />
                  <span className="font-medium text-[#2D3A3A]">
                    {t('common.patient')}:
                  </span>
                  <span className="font-semibold text-[#588B8B]">{editingTask.patient.name}</span>
                </div>
              )}

              {/* Task Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2D3A3A]">
                  {t('dashboard.tasks.editModal.taskTitle') || 'Task Title'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder={
                    t('dashboard.tasks.createModal.titlePlaceholder') || 'e.g., Daily Thought Log'
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E2E0D6] bg-white text-[#2D3A3A] placeholder-[#889898] focus:border-[#588B8B] focus:ring-2 focus:ring-[#588B8B]/15 outline-none transition-all"
                />
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2D3A3A] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#588B8B]" />
                  <span>{t('dashboard.tasks.editModal.status') || 'Status'}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STATUS_OPTIONS.map((st) => {
                    const isSelected = editForm.status === st.value
                    return (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => setEditForm((prev) => ({ ...prev, status: st.value }))}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center capitalize ${
                          isSelected
                            ? `${STATUS_CLASSES[st.value]} ring-2 ring-[#588B8B]/30 font-bold shadow-2xs`
                            : 'bg-white text-[#5A6B6B] border-[#E2E0D6] hover:bg-[#F6F5EE]'
                        }`}
                      >
                        {t(st.labelKey) || st.fallback}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Description / Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2D3A3A]">
                  {t('dashboard.tasks.editModal.instructions') || 'Instructions / Description'}
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder={
                    t('dashboard.tasks.editModal.instructionsPlaceholder') ||
                    'Detailed instructions for client...'
                  }
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[#E2E0D6] bg-white text-[#2D3A3A] placeholder-[#889898] focus:border-[#588B8B] focus:ring-2 focus:ring-[#588B8B]/15 outline-none transition-all resize-none"
                />
              </div>

              {/* Frequency Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2D3A3A]">
                  {t('dashboard.tasks.editModal.frequency') || 'Frequency'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {FREQUENCIES.map((freq) => {
                    const isSelected = editForm.frequency === freq.value
                    return (
                      <button
                        key={freq.value}
                        type="button"
                        onClick={() => setEditForm((prev) => ({ ...prev, frequency: freq.value }))}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#588B8B] text-white border-[#588B8B] shadow-2xs'
                            : 'bg-white text-[#5A6B6B] border-[#E2E0D6] hover:bg-[#F6F5EE]'
                        }`}
                      >
                        {t(freq.labelKey) || freq.fallback}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Due Date / Deadline */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2D3A3A] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#588B8B]" />
                  <span>{t('dashboard.tasks.editModal.deadline') || 'Due Date / Deadline'}</span>
                </label>
                <input
                  type="date"
                  value={editForm.deadline}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, deadline: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#E2E0D6] bg-white text-[#2D3A3A] focus:border-[#588B8B] focus:ring-2 focus:ring-[#588B8B]/15 outline-none transition-all"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E0D6]">
                <button
                  type="button"
                  onClick={() => !editSubmitting && setEditingTask(null)}
                  disabled={editSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5A6B6B] hover:text-[#2D3A3A] hover:bg-[#F6F5EE] border border-[#E2E0D6] transition-colors cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#588B8B] hover:bg-[#457070] text-white shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {editSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('dashboard.tasks.editModal.saving') || 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{t('dashboard.tasks.editModal.save') || t('common.save')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingTask && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleteSubmitting) setDeletingTask(null)
          }}
        >
          <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Warning Icon */}
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#2D3A3A]">
                {t('dashboard.tasks.deleteModal.title') || 'Delete Task'}
              </h3>
              <p className="text-xs text-[#5A6B6B] max-w-xs mx-auto">
                {t('dashboard.tasks.deleteModal.subtitle') ||
                  'Are you sure you want to delete this task? This action cannot be undone.'}
              </p>
            </div>

            {/* Task summary card */}
            <div className="bg-[#F6F5EE]/70 rounded-xl p-3.5 border border-[#E2E0D6] space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-[#2D3A3A] truncate">
                  {deletingTask.title}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.2 rounded-full border capitalize font-semibold ${
                    STATUS_CLASSES[deletingTask.status] ?? STATUS_CLASSES.pending
                  }`}
                >
                  {t(`common.status.${deletingTask.status}`) || deletingTask.status}
                </span>
              </div>
              {deletingTask.patient?.name && (
                <p className="text-[11px] text-[#5A6B6B]">
                  {t('common.patient')}: <strong className="text-[#2D3A3A]">{deletingTask.patient.name}</strong>
                </p>
              )}
            </div>

            {deleteError && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{deleteError}</div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => !deleteSubmitting && setDeletingTask(null)}
                disabled={deleteSubmitting}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-[#5A6B6B] hover:text-[#2D3A3A] hover:bg-[#F6F5EE] border border-[#E2E0D6] transition-colors cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteSubmitting}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deleteSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('dashboard.tasks.deleteModal.deleting') || 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('dashboard.tasks.deleteModal.confirm') || 'Delete Task'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
