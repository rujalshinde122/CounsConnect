'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckSquare,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Save,
  RotateCcw,
} from 'lucide-react'
import type { Task } from '@/lib/types'

interface PatientTasksViewProps {
  tasks: Task[]
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-Weekly',
  monthly: 'Monthly',
  once: 'One-Time',
}

export default function PatientTasksView({ tasks }: PatientTasksViewProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  // Local state for editing notes per task
  const [taskNotes, setTaskNotes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    tasks.forEach(t => {
      initial[t.id] = t.patient_notes || ''
    })
    return initial
  })

  const [savingTaskId, setSavingTaskId] = useState<string | null>(null)
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleNotesChange = (taskId: string, val: string) => {
    setTaskNotes(prev => ({ ...prev, [taskId]: val }))
  }

  const handleSaveNotes = async (taskId: string) => {
    setSavingTaskId(taskId)
    setError('')
    setSavedSuccessId(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          patient_notes: taskNotes[taskId] || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)

      if (updateError) throw new Error(updateError.message)

      setSavedSuccessId(taskId)
      setTimeout(() => setSavedSuccessId(null), 3000)
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save notes'
      setError(message)
    } finally {
      setSavingTaskId(null)
    }
  }

  const handleToggleComplete = async (task: Task) => {
    setSavingTaskId(task.id)
    setError('')

    const nextStatus = task.status === 'completed' ? 'pending' : 'completed'
    const completedAt = nextStatus === 'completed' ? new Date().toISOString() : null

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: nextStatus,
          patient_notes: taskNotes[task.id] || '',
          completed_at: completedAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id)

      if (updateError) throw new Error(updateError.message)

      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update task status'
      setError(message)
    } finally {
      setSavingTaskId(null)
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status !== 'completed'
    if (filter === 'completed') return t.status === 'completed'
    return true
  })

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status !== 'completed').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#2D3A3A] tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#588B8B]" /> Tasks & Exercises
          </h1>
          <p className="text-xs text-[#5A6B6B] mt-1 leading-relaxed">
            Homework, behavioral logs, and therapy assignments from your counselor
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#E2E0D6] shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-[#588B8B] text-white shadow-sm'
                : 'text-[#5A6B6B] hover:text-[#2D3A3A] hover:bg-[#F6F5EE]'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'pending'
                ? 'bg-[#588B8B] text-white shadow-sm'
                : 'text-[#5A6B6B] hover:text-[#2D3A3A] hover:bg-[#F6F5EE]'
            }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'completed'
                ? 'bg-[#588B8B] text-white shadow-sm'
                : 'text-[#5A6B6B] hover:text-[#2D3A3A] hover:bg-[#F6F5EE]'
            }`}
          >
            Done ({counts.completed})
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed'
            const isOverdue =
              task.deadline &&
              !isCompleted &&
              new Date(task.deadline) < new Date()

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs p-6 space-y-4 ${
                  isCompleted
                    ? 'border-[#E2E0D6] bg-white/70'
                    : 'border-[#588B8B]/40 hover:border-[#588B8B]'
                }`}
              >
                {/* Task Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E2E0D6]/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-sm font-bold ${
                          isCompleted ? 'text-[#5A6B6B] line-through' : 'text-[#2D3A3A]'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.frequency && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F6F5EE] border border-[#E2E0D6] text-[#588B8B] uppercase">
                          {FREQUENCY_LABELS[task.frequency] || task.frequency}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#5A6B6B] leading-relaxed pt-1 whitespace-pre-wrap">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Status & Deadline Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    {task.deadline && (
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          isOverdue
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-[#F6F5EE] text-[#5A6B6B] border-[#E2E0D6]'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span suppressHydrationWarning>
                          {isOverdue ? 'Overdue: ' : 'Due: '}
                          {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isOverdue
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

                {/* Counselor Feedback (if exists) */}
                {task.feedback && (
                  <div className="bg-[#EDF4F2] border border-[#588B8B]/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#263F3F]">
                    <MessageSquare className="w-4 h-4 text-[#588B8B] shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block text-[11px] uppercase tracking-wide text-[#588B8B]">
                        Counselor Feedback:
                      </strong>
                      <p className="leading-relaxed mt-0.5">{task.feedback}</p>
                    </div>
                  </div>
                )}

                {/* Patient Input / Output Workspace */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#5A6B6B] uppercase tracking-wide">
                      Your Exercise Notes & Reflections
                    </label>
                    {savedSuccessId === task.id && (
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Notes saved!
                      </span>
                    )}
                  </div>

                  <Textarea
                    rows={3}
                    value={taskNotes[task.id] ?? ''}
                    onChange={(e) => handleNotesChange(task.id, e.target.value)}
                    placeholder="Record your thoughts, behavioral triggers, or output for this exercise here..."
                    className="resize-none text-xs rounded-xl border-[#E2E0D6] bg-[#F6F5EE]/40 text-[#2D3A3A] p-3 focus:bg-white focus:border-[#588B8B]"
                  />

                  {/* Actions for this task */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="text-[11px] text-[#5A6B6B]">
                      {task.completed_at ? (
                        <span suppressHydrationWarning>
                          Completed on {new Date(task.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      ) : (
                        <span>Save notes anytime; your counselor can review your progress.</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveNotes(task.id)}
                        disabled={savingTaskId === task.id}
                        className="rounded-full text-xs font-semibold px-3.5 py-1.5 border-[#E2E0D6] text-[#2D3A3A] hover:bg-[#F6F5EE] flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save Notes</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleToggleComplete(task)}
                        disabled={savingTaskId === task.id}
                        className={`rounded-full text-xs font-bold px-4 py-1.5 shadow-xs transition-colors flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-[#F6F5EE] hover:bg-[#E2E0D6] text-[#5A6B6B] border border-[#E2E0D6]'
                            : 'bg-[#588B8B] hover:bg-[#3D6363] text-white'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <RotateCcw className="w-3 h-3" />
                            <span>Reopen Task</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark as Complete</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-[#E2E0D6] p-12 text-center space-y-3">
          <CheckSquare className="w-10 h-10 text-[#889898] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[#2D3A3A]">
            {filter === 'completed'
              ? 'No completed tasks yet'
              : filter === 'pending'
              ? 'No pending tasks'
              : 'No tasks assigned yet'}
          </h3>
          <p className="text-xs text-[#5A6B6B] max-w-sm mx-auto leading-relaxed">
            Exercises, homework assignments, and self-reflection logs given by your counselor during sessions will appear here.
          </p>
        </div>
      )}

    </div>
  )
}
