'use client'

import Link from 'next/link'
import type { Task } from '@/lib/types'

interface PendingTasksCardProps {
  pendingTasks?: Task[] | null
}

export default function PendingTasksCard({ pendingTasks }: PendingTasksCardProps) {
  const hasTasks = pendingTasks && pendingTasks.length > 0

  return (
    <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E2E0D6] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#2D3A3A]">Pending Tasks</h2>
          <p className="text-xs text-[#5A6B6B] mt-0.5">Assigned client exercises</p>
        </div>

        <Link
          href="/dashboard/tasks"
          className="text-xs font-semibold text-[#588B8B] hover:text-[#3D6363] hover:underline"
        >
          View all
        </Link>
      </div>

      {/* Content */}
      {!hasTasks ? (
        <div className="py-10 px-6 text-center space-y-2">
          <p className="text-xs text-[#5A6B6B]">No pending tasks</p>
        </div>
      ) : (
        <div className="divide-y divide-[#E2E0D6]/60">
          {pendingTasks.map((task) => (
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
                    Patient: {task.patient.name}
                  </p>
                )}
              </div>

              {task.deadline && (
                <span className="font-mono text-xs text-[#889898] shrink-0">
                  Due {new Date(task.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
