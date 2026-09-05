import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { Task } from '@/lib/types'

export const metadata: Metadata = { title: 'Tasks | CounsConnect' }

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  missed: 'bg-rose-50 text-rose-800 border-rose-200',
  overdue: 'bg-orange-50 text-orange-800 border-orange-200',
}

const FREQ_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  once: 'One-time',
}

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      patient:profiles!tasks_patient_id_fkey(name, email)
    `)
    .eq('counselor_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#2D3A3A] tracking-tight">Tasks</h2>
        <p className="text-xs text-[#5A6B6B] mt-0.5">Assigned behavioral exercises and check-in tasks</p>
      </div>

      {!tasks || tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E0D6] p-12 text-center space-y-2">
          <p className="text-sm font-semibold text-[#2D3A3A]">No active tasks</p>
          <p className="text-xs text-[#5A6B6B]">
            Exercises and assignments assigned to patients will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs overflow-hidden">
          <div className="divide-y divide-[#E2E0D6]/60">
            {tasks.map((task: Task & { patient?: { name: string | null; email: string } }) => {
              const statusCls = STATUS_CLASSES[task.status] ?? STATUS_CLASSES.pending

              return (
                <div
                  key={task.id}
                  className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[#F6F5EE]/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#2D3A3A] text-xs leading-tight">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-[#5A6B6B] mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#889898]">
                      {task.patient?.name && (
                        <span className="text-[#5A6B6B] font-medium">
                          Patient: {task.patient.name}
                        </span>
                      )}
                      {task.frequency && (
                        <span>
                          • {FREQ_LABELS[task.frequency]}
                        </span>
                      )}
                      {task.deadline && (
                        <span className="font-mono">
                          • Due: {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded border capitalize font-medium ${statusCls}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
