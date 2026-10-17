'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckSquare,
  CalendarPlus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Bell,
  XCircle,
  X,
} from 'lucide-react'
import BookAppointmentModal from './BookAppointmentModal'
import type { Client, Appointment, Task, Profile } from '@/lib/types'

interface OverviewClientProps {
  client: Client
  counselor: Profile
  appointments: Appointment[]
  tasks: Task[]
}

const STATUS_CLASSES: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  completed: 'bg-[#EDF4F2] text-[#263F3F] border-[#588B8B]/30',
  cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
}

export default function OverviewClient({
  client,
  counselor,
  appointments,
  tasks,
}: OverviewClientProps) {
  const router = useRouter()
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [localAppointments, setLocalAppointments] = useState(appointments)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setLocalAppointments(appointments)
  }, [appointments])

  const handleDeleteAppointment = async (apptId: string) => {
    setDeletingId(apptId)
    // Optimistic remove so UI updates instantly
    setLocalAppointments(prev => prev.filter(a => a.id !== apptId))
    try {
      const supabase = createClient()
      const { error } = await supabase.from('appointments').delete().eq('id', apptId)
      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error('Failed to delete appointment:', err)
      setLocalAppointments(appointments)
    } finally {
      setDeletingId(null)
    }
  }

  const now = new Date()

  // Rescheduled slots proposed by counselor requiring patient confirmation (only upcoming)
  const rescheduledAppts = localAppointments.filter(a => {
    if (a.status !== 'pending') return false
    const isProposed = a.rescheduled_by_counselor === true || (a.notes && a.notes.includes('[Counselor Proposed Slot]'))
    if (!isProposed) return false
    const apptDate = new Date(a.end_time || a.start_time)
    return apptDate >= now // Decrement/exclude once date is past!
  })

  // Pending requests submitted by patient awaiting counselor confirmation (only upcoming)
  const pendingMineAppts = localAppointments.filter(a => {
    if (a.status !== 'pending') return false
    const isProposed = a.rescheduled_by_counselor === true || (a.notes && a.notes.includes('[Counselor Proposed Slot]'))
    if (isProposed) return false
    const apptDate = new Date(a.end_time || a.start_time)
    return apptDate >= now // Decrement/exclude once date is past!
  })

  // Confirmed appointments (only upcoming)
  const confirmedAppts = localAppointments.filter(a => {
    if (a.status !== 'confirmed') return false
    const apptDate = new Date(a.end_time || a.start_time)
    return apptDate >= now // Decrement/exclude once date is past!
  })

  // Declined appointments requiring review (only upcoming or recent)
  const declinedAppts = localAppointments.filter(a => {
    if (a.status !== 'cancelled') return false
    if (a.declined_by !== 'counselor' && a.patient_notified) return false
    const apptDate = new Date(a.end_time || a.start_time)
    return apptDate >= now // Decrement/exclude once date is past!
  })

  // Decrement yellow notification count when appointments are past or deleted
  const totalSessionUpdates = rescheduledAppts.length + declinedAppts.length
  const activeCount = rescheduledAppts.length + pendingMineAppts.length + confirmedAppts.length

  // Next upcoming (prefer confirmed, then pending)
  const nextAppt = confirmedAppts[0] || pendingMineAppts[0]

  // Pending tasks
  const activeTasks = tasks.filter(t => t.status !== 'completed').slice(0, 3)

  return (
    <div className="space-y-8">

      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-[#3D6363] via-[#2D4E4E] to-[#263F3F] rounded-3xl px-8 py-7 text-white relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white/3 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Welcome back, {client.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-[#DDEAE7] max-w-lg leading-relaxed opacity-90">
              Your care plan is monitored by your dedicated counselor. Track exercises, view therapy goals, and book sessions below.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/15 min-w-[200px]">
            <div className="w-11 h-11 rounded-xl bg-white/15 text-white flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-emerald-300 tracking-widest block leading-none mb-1">
                Your Counselor
              </span>
              <p className="font-extrabold text-sm text-white leading-tight">{counselor.name}</p>
              <p className="text-[11px] text-[#DDEAE7]/80 leading-tight mt-0.5">{counselor.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banners — only shown when there are updates */}
      {(rescheduledAppts.length > 0 || declinedAppts.length > 0) && (
        <div className="space-y-3">
          {rescheduledAppts.length > 0 && (
            <Link
              href="/patient/sessions"
              className="flex items-start gap-3.5 bg-amber-50 border border-amber-300 rounded-2xl px-5 py-4 hover:bg-amber-100/60 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-amber-900">Counselor Proposed a New Slot</p>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500 text-white shrink-0">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Your counselor suggested an alternate time for your appointment. Tap to review and confirm in Sessions Timeline.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          {declinedAppts.length > 0 && (
            <div className="relative group">
              <Link
                href="/patient/sessions"
                className="flex items-start gap-3.5 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4 hover:bg-rose-100/50 transition-colors cursor-pointer group pr-12"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <XCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-rose-900">Session Request Declined</p>
                    <span className="text-[10px] text-rose-700 font-bold shrink-0" suppressHydrationWarning>
                      {new Date(declinedAppts[0].start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                    {declinedAppts[0].cancel_reason || 'Your counselor was unavailable for the requested time slot. Please book an alternative.'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-rose-500 shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Small Cross Button to Remove from History */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleDeleteAppointment(declinedAppts[0].id)
                }}
                disabled={deletingId === declinedAppts[0].id}
                title="Remove from history"
                aria-label="Remove from history"
                className="absolute right-3.5 top-3.5 w-6 h-6 rounded-full flex items-center justify-center text-rose-400 hover:text-rose-800 hover:bg-rose-200/80 transition-colors cursor-pointer z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Card 1: Sessions */}
        <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-sm p-6 flex flex-col gap-4 hover:border-[#588B8B]/50 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EDF4F2] flex items-center justify-center">
                <Calendar className="w-4.5 h-4.5 text-[#588B8B]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D3A3A] leading-tight">Sessions</h3>
                <p className="text-[11px] text-[#5A6B6B]">{activeCount} active</p>
              </div>
            </div>
            {totalSessionUpdates > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-sm">
                <Bell className="w-3 h-3" />
                {totalSessionUpdates}
              </span>
            )}
          </div>

          <div className="flex-1">
            {nextAppt ? (
              <div className="rounded-xl border border-[#E2E0D6] bg-[#F6F5EE]/60 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[#588B8B]">Next Session</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CLASSES[nextAppt.status]}`}>
                    {nextAppt.status === 'pending' ? 'Awaiting Approval' : 'Confirmed'}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm text-[#2D3A3A]" suppressHydrationWarning>
                    {new Date(nextAppt.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#5A6B6B]">
                    <Clock className="w-3 h-3 text-[#588B8B]" />
                    <span suppressHydrationWarning>{new Date(nextAppt.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>·</span>
                    {nextAppt.location === 'video' ? (
                      <span className="flex items-center gap-1 text-[#588B8B] font-semibold"><Video className="w-3 h-3" /> Video</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#D84C20] font-semibold"><MapPin className="w-3 h-3" /> In-Person</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#E2E0D6] bg-[#F6F5EE]/40 p-4 text-center space-y-1">
                <Calendar className="w-6 h-6 text-[#889898] mx-auto opacity-50" />
                <p className="text-xs font-semibold text-[#2D3A3A]">No sessions scheduled</p>
                <p className="text-[11px] text-[#5A6B6B]">Use the booking card to request one.</p>
              </div>
            )}
          </div>

          <Link
            href="/patient/sessions"
            className="flex items-center justify-between text-xs font-bold text-[#588B8B] hover:text-[#3D6363] pt-3 border-t border-[#E2E0D6] group transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <span>Sessions Timeline</span>
              {totalSessionUpdates > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 text-[9px] font-extrabold text-white bg-amber-500 rounded-full">
                  {totalSessionUpdates}
                </span>
              )}
            </div>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Card 2: Tasks */}
        <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-sm p-6 flex flex-col gap-4 hover:border-[#588B8B]/50 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EDF4F2] flex items-center justify-center">
                <CheckSquare className="w-4.5 h-4.5 text-[#588B8B]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D3A3A] leading-tight">Tasks</h3>
                <p className="text-[11px] text-[#5A6B6B]">{activeTasks.length} pending</p>
              </div>
            </div>
            {activeTasks.length > 0 && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {activeTasks.length} Due
              </span>
            )}
          </div>

          <div className="flex-1 space-y-2">
            {activeTasks.length > 0 ? (
              activeTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-xl border border-[#E2E0D6] bg-[#F6F5EE]/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#2D3A3A] truncate">{t.title}</p>
                    {t.deadline && (
                      <p className="text-[10px] text-[#889898] mt-0.5" suppressHydrationWarning>
                        Due {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[#E2E0D6] bg-[#F6F5EE]/40 p-4 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto opacity-70" />
                <p className="text-xs font-semibold text-[#2D3A3A]">All caught up!</p>
                <p className="text-[11px] text-[#5A6B6B]">No pending exercises.</p>
              </div>
            )}
          </div>

          <Link
            href="/patient/tasks"
            className="flex items-center justify-between text-xs font-bold text-[#588B8B] hover:text-[#3D6363] pt-3 border-t border-[#E2E0D6] group transition-colors"
          >
            <span>Open Tasks Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Card 3: Book Appointment */}
        <div className="bg-gradient-to-br from-[#588B8B] to-[#3D6363] rounded-2xl shadow-sm p-6 flex flex-col gap-4 relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <CalendarPlus className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">Book Session</h3>
              <p className="text-[11px] text-white/70">Request with your counselor</p>
            </div>
          </div>

          <div className="relative z-10 flex-1 space-y-3">
            <p className="text-xs text-white/80 leading-relaxed">
              Schedule an appointment with <span className="font-bold text-white">{counselor.name}</span>. Pick your preferred date, time, and format.
            </p>

            <div className="flex flex-col gap-2">
              {[
                { icon: Calendar, text: 'Choose date & time' },
                { icon: Video, text: 'Video or in-person' },
                { icon: AlertCircle, text: 'Pending counselor approval' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-[11px] text-white/70">
                  <Icon className="w-3 h-3 text-white/50 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="relative z-10 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#3D6363] text-xs font-extrabold shadow-sm hover:bg-[#F6F5EE] active:scale-[0.98] transition-all cursor-pointer"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        counselorId={counselor.id}
        counselorName={counselor.name || 'Counselor'}
        clientId={client.id}
      />
    </div>
  )
}
