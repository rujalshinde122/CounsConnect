'use client'

import Link from 'next/link'
import { Video, MapPin } from 'lucide-react'
import type { Appointment } from '@/lib/types'
import AppointmentActions from '@/app/dashboard/appointments/AppointmentActions'

interface TodayScheduleProps {
  todayAppts?: Appointment[] | null
}

const STATUS_CLASSES: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  completed: 'bg-[#EDF4F2] text-[#263F3F] border-[#588B8B]/30',
  cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
}

export default function TodaySchedule({ todayAppts }: TodayScheduleProps) {
  const hasSessions = todayAppts && todayAppts.length > 0

  return (
    <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E2E0D6] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#2D3A3A]">Today&apos;s Schedule</h2>
          <p className="text-xs text-[#5A6B6B] mt-0.5">
            {hasSessions ? `${todayAppts.length} session${todayAppts.length > 1 ? 's' : ''} today` : 'No sessions scheduled'}
          </p>
        </div>

        <Link
          href="/dashboard/appointments"
          className="text-xs font-semibold text-[#588B8B] hover:text-[#3D6363] hover:underline"
        >
          View all
        </Link>
      </div>

      {/* Content */}
      {!hasSessions ? (
        <div className="py-12 px-6 text-center space-y-3">
          <p className="text-xs font-medium text-[#5A6B6B]">No sessions scheduled for today</p>
          <Link
            href="/dashboard/appointments"
            className="inline-block px-3 py-1.5 rounded-lg border border-[#E2E0D6] hover:bg-[#F6F5EE] text-xs font-semibold text-[#2D3A3A] transition-colors"
          >
            View calendar
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[#E2E0D6]/60">
          {todayAppts.map((appt) => {
            const timeStr = new Date(appt.start_time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })
            const statusCls = STATUS_CLASSES[appt.status] || STATUS_CLASSES.pending

            return (
              <div
                key={appt.id}
                className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[#F6F5EE]/40 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono text-xs font-semibold text-[#5A6B6B] w-16 shrink-0">
                    {timeStr}
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#2D3A3A] truncate">
                      {appt.patient?.name || 'Patient Session'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[#5A6B6B]">
                      {appt.location === 'video' ? (
                        <span className="flex items-center gap-1">
                          <Video className="w-3 h-3 text-[#588B8B]" /> Online Video
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#FF8A65]" /> In-Person
                        </span>
                      )}
                      {appt.notes && (
                        <span className="text-[#889898] truncate max-w-[200px]">
                          • {appt.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded border capitalize font-medium ${statusCls}`}>
                    {appt.status}
                  </span>

                  {['pending', 'confirmed'].includes(appt.status) && (
                    <AppointmentActions appointmentId={appt.id} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
