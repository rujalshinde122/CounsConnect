'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Video, MapPin, Calendar, Clock, Plus } from 'lucide-react'
import type { Appointment } from '@/lib/types'
import AppointmentActions from '@/app/dashboard/appointments/AppointmentActions'
import CreateAppointmentModal, { type PatientOption } from '@/components/dashboard/CreateAppointmentModal'
import { useLanguage } from '@/context/LanguageContext'

interface TodayScheduleProps {
  todayAppts?: Appointment[] | null
  patients?: PatientOption[]
}

const STATUS_CLASSES: Record<string, string> = {
  confirmed: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/80',
  pending: 'bg-amber-50/90 text-amber-800 border-amber-200/80',
  completed: 'bg-[#EDF4F2] text-[#263F3F] border-[#588B8B]/30',
  cancelled: 'bg-rose-50/90 text-rose-800 border-rose-200/80',
}

export default function TodaySchedule({ todayAppts, patients }: TodayScheduleProps) {
  const { t, locale } = useLanguage()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const hasSessions = todayAppts && todayAppts.length > 0

  return (
    <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-xs overflow-hidden h-full flex flex-col justify-between">
      {/* Card Header */}
      <div className="px-6 py-4.5 border-b border-[#E2E0D6]/80 flex items-center justify-between bg-gradient-to-r from-white to-[#F6F5EE]/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#588B8B]/10 text-[#588B8B] flex items-center justify-center shadow-2xs">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#2D3A3A] tracking-tight">
              {t('dashboard.overview.todaySchedule.title')}
            </h2>
            <p className="text-xs text-[#5A6B6B] mt-0.5">
              {hasSessions
                ? t(todayAppts.length > 1 ? 'dashboard.overview.todaySchedule.sessionsTodayPlural' : 'dashboard.overview.todaySchedule.sessionsToday', { count: todayAppts.length })
                : t('dashboard.overview.todaySchedule.empty')}
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
            <span>{t('dashboard.appointments.scheduleButton')}</span>
          </button>

          <Link
            href="/dashboard/appointments"
            className="text-xs font-semibold text-[#588B8B] hover:text-[#3D6363] hover:underline underline-offset-4 flex items-center gap-1 transition-colors"
          >
            <span>{t('common.viewAll')}</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {!hasSessions ? (
          <div className="py-14 px-6 text-center space-y-3.5 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F6F5EE] border border-[#E2E0D6] flex items-center justify-center text-[#889898]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2D3A3A]">{t('dashboard.overview.todaySchedule.empty')}</p>
              <p className="text-[11px] text-[#889898] mt-0.5">Schedule a counseling consultation for today</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#588B8B] hover:bg-[#457070] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('dashboard.appointments.scheduleButton')}</span>
              </button>
              <Link
                href="/dashboard/appointments"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E2E0D6] hover:bg-[#F6F5EE] text-xs font-semibold text-[#2D3A3A] hover:border-[#588B8B]/40 shadow-2xs transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-[#588B8B]" />
                <span>{t('common.viewCalendar')}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E0D6]/60">
            {todayAppts.map((appt) => {
              const dateLocale = locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-US'
              const timeStr = new Date(appt.start_time).toLocaleTimeString(dateLocale, {
                hour: '2-digit',
                minute: '2-digit',
              })
              const statusCls = STATUS_CLASSES[appt.status] || STATUS_CLASSES.pending
              const statusLabel = t(`common.status.${appt.status}`) || appt.status
              const patientName = appt.patient?.name || `${t('common.patient')} ${t('common.status.scheduled')}`
              const initials = patientName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

              return (
                <div
                  key={appt.id}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#F6F5EE]/40 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Time Chip */}
                    <div className="flex flex-col items-center justify-center w-16 px-2 py-1 rounded-lg bg-[#F6F5EE] border border-[#E2E0D6]/70 shrink-0">
                      <span className="font-mono text-xs font-bold text-[#2D3A3A]">
                        {timeStr}
                      </span>
                    </div>

                    {/* Patient Initials Avatar */}
                    <div className="w-8 h-8 rounded-full bg-[#588B8B]/10 text-[#588B8B] flex items-center justify-center text-xs font-bold shrink-0 border border-[#588B8B]/20">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2D3A3A] group-hover:text-[#588B8B] transition-colors truncate">
                        {patientName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#5A6B6B]">
                        {appt.location === 'video' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#588B8B]">
                            <Video className="w-3 h-3 shrink-0" /> {t('common.onlineVideo')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D97706]">
                            <MapPin className="w-3 h-3 shrink-0" /> {t('common.inPerson')}
                          </span>
                        )}
                        {appt.notes && (
                          <span className="text-[#889898] text-[11px] truncate max-w-[200px]">
                            • {appt.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {appt.location === 'video' && appt.status === 'confirmed' && (
                      <button
                        type="button"
                        className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#588B8B] hover:bg-[#3D6363] text-white text-[11px] font-semibold shadow-2xs transition-colors cursor-pointer"
                        title="Join consultation call"
                      >
                        <Video className="w-3 h-3" />
                        <span>Join</span>
                      </button>
                    )}

                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border capitalize font-semibold tracking-wide ${statusCls}`}>
                      {statusLabel}
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

      {/* Schedule Appointment Modal */}
      <CreateAppointmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        patients={patients}
      />
    </div>
  )
}
