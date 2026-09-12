'use client'

import { useState, useMemo } from 'react'
import { Video, MapPin, Calendar, Clock, CalendarDays, Plus } from 'lucide-react'
import AppointmentActions from '@/app/dashboard/appointments/AppointmentActions'
import CreateAppointmentModal, { type PatientOption } from '@/components/dashboard/CreateAppointmentModal'
import { useLanguage } from '@/context/LanguageContext'
import type { Appointment } from '@/lib/types'

interface AppointmentsViewProps {
  appointments: Appointment[] | null
  patients?: PatientOption[]
}

const STATUS_CLASSES: Record<string, string> = {
  confirmed: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/80',
  pending: 'bg-amber-50/90 text-amber-800 border-amber-200/80',
  completed: 'bg-[#EDF4F2] text-[#263F3F] border-[#588B8B]/30',
  cancelled: 'bg-rose-50/90 text-rose-800 border-rose-200/80',
}

export default function AppointmentsView({ appointments, patients }: AppointmentsViewProps) {
  const { t, locale } = useLanguage()
  const [filter, setFilter] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const dateLocale = locale === 'hi' ? 'hi-IN' : locale === 'mr' ? 'mr-IN' : 'en-US'

  const filteredAppointments = useMemo(() => {
    const list = appointments ?? []
    if (filter === 'all') return list
    return list.filter((a) => a.status === filter)
  }, [appointments, filter])

  // Group by date
  const grouped: Record<string, Appointment[]> = {}
  for (const appt of filteredAppointments) {
    const date = new Date(appt.start_time).toLocaleDateString(dateLocale, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(appt)
  }

  const counts = useMemo(() => {
    const list = appointments ?? []
    return {
      all: list.length,
      confirmed: list.filter((a) => a.status === 'confirmed').length,
      pending: list.filter((a) => a.status === 'pending').length,
      completed: list.filter((a) => a.status === 'completed').length,
    }
  }, [appointments])

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#2D3A3A] tracking-tight flex items-center gap-2.5">
            <span>{t('dashboard.appointments.title')}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#588B8B]/10 text-[#588B8B] border border-[#588B8B]/20">
              {appointments?.length ?? 0}
            </span>
          </h2>
          <p className="text-xs text-[#5A6B6B] mt-0.5">{t('dashboard.appointments.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#E2E0D6] shadow-xs">
            {[
              { key: 'all', label: 'All', count: counts.all },
              { key: 'confirmed', label: t('common.status.confirmed'), count: counts.confirmed },
              { key: 'pending', label: t('common.status.pending'), count: counts.pending },
              { key: 'completed', label: t('common.status.completed'), count: counts.completed },
            ].map((tab) => {
              const isSelected = filter === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
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

          {/* Schedule Session Action Button */}
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#588B8B] to-[#457070] hover:from-[#457070] hover:to-[#365959] text-white text-xs font-bold shadow-xs hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('dashboard.appointments.scheduleButton')}</span>
          </button>
        </div>
      </div>

      {/* Appointment Groups */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E0D6] p-16 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#F6F5EE] border border-[#E2E0D6] flex items-center justify-center mx-auto text-[#588B8B]">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#2D3A3A]">{t('dashboard.appointments.emptyTitle')}</h3>
            <p className="text-xs text-[#5A6B6B] max-w-sm mx-auto">
              {t('dashboard.appointments.emptySubtitle')}
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#588B8B] hover:bg-[#457070] text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('dashboard.appointments.scheduleButton')}</span>
            </button>
          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([date, appts]) => (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#588B8B]" />
              <p className="text-xs font-extrabold text-[#2D3A3A] tracking-wider uppercase">{date}</p>
              <span className="text-[11px] text-[#889898] font-medium">({appts.length} sessions)</span>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-xs overflow-hidden">
              <div className="divide-y divide-[#E2E0D6]/60">
                {appts.map((appt) => {
                  const statusCls = STATUS_CLASSES[appt.status] || STATUS_CLASSES.pending
                  const statusLabel = t(`common.status.${appt.status}`) || appt.status
                  const patientName = appt.patient?.name || `${t('common.patient')} ${t('common.status.scheduled')}`
                  const initials = patientName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

                  return (
                    <div
                      key={appt.id}
                      className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#F6F5EE]/40 transition-all group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Time Chip */}
                        <div className="flex flex-col items-center justify-center w-16 px-2 py-1 rounded-xl bg-[#F6F5EE] border border-[#E2E0D6]/70 shrink-0">
                          <span className="font-mono text-xs font-bold text-[#2D3A3A]">
                            {new Date(appt.start_time).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Patient Initials Avatar */}
                        <div className="w-8 h-8 rounded-full bg-[#588B8B]/10 text-[#588B8B] flex items-center justify-center text-xs font-bold shrink-0 border border-[#588B8B]/20">
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold text-[#2D3A3A] text-xs leading-tight group-hover:text-[#588B8B] transition-colors">
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
                              <span className="text-[#889898] text-[11px] truncate max-w-[240px]">
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
                            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
            </div>
          </div>
        ))
      )}

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        patients={patients}
      />
    </div>
  )
}
