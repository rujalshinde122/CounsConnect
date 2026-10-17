'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  CalendarDays,
  Calendar,
  Clock,
  Video,
  MapPin,
  CalendarPlus,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  FileText,
  X,
  XCircle,
  RotateCw,
  Bell,
  Sparkles,
} from 'lucide-react'
import BookAppointmentModal from './BookAppointmentModal'
import type { Appointment, Task, SessionNote, Profile, Client } from '@/lib/types'

interface SessionsTimelineViewProps {
  client: Client
  counselor: Profile
  appointments: Appointment[]
  sessionNotes: SessionNote[]
  tasks: Task[]
}

const STATUS_CLASSES: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  completed: 'bg-[#EDF4F2] text-[#263F3F] border-[#588B8B]/30',
  cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
}

export default function SessionsTimelineView({
  client,
  counselor,
  appointments,
  sessionNotes,
  tasks,
}: SessionsTimelineViewProps) {
  const router = useRouter()
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [localAppointments, setLocalAppointments] = useState(appointments)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isClearingAll, setIsClearingAll] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLocalAppointments(appointments)
  }, [appointments])

  // 1. Client Accepts & Confirms a slot that was proposed/rescheduled by the counselor
  const handleConfirmAppointment = async (apptId: string) => {
    setConfirmingId(apptId)
    setError('')

    try {
      const supabase = createClient()
      const { error: confirmError } = await supabase
        .from('appointments')
        .update({
          status: 'confirmed',
          rescheduled_by_counselor: false,
          patient_notified: true,
          counselor_notified: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', apptId)

      if (confirmError) throw new Error(confirmError.message)

      setLocalAppointments(prev =>
        prev.map(a =>
          a.id === apptId ? { ...a, status: 'confirmed', rescheduled_by_counselor: false } : a
        )
      )
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to confirm appointment'
      setError(message)
    } finally {
      setConfirmingId(null)
    }
  }

  // 2. Client cancels their appointment or request
  const handleCancelAppointment = async (apptId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment request?')) return

    setCancellingId(apptId)
    setError('')

    try {
      const supabase = createClient()
      const { error: cancelError } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          declined_by: 'patient',
          cancel_reason: 'Cancelled by patient',
          updated_at: new Date().toISOString(),
        })
        .eq('id', apptId)

      if (cancelError) throw new Error(cancelError.message)

      setLocalAppointments(prev =>
        prev.map(a =>
          a.id === apptId ? { ...a, status: 'cancelled', declined_by: 'patient', cancel_reason: 'Cancelled by patient' } : a
        )
      )
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel appointment'
      setError(message)
    } finally {
      setCancellingId(null)
    }
  }

  // 3. Client permanently removes a declined/cancelled appointment from history & database
  const handleDeleteDeclined = async (apptId: string) => {
    setDeletingId(apptId)
    // Optimistic removal so card vanishes immediately
    setLocalAppointments(prev => prev.filter(a => a.id !== apptId))
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', apptId)

      if (deleteError) throw new Error(deleteError.message)
      router.refresh()
    } catch (err: unknown) {
      console.error('Failed to remove appointment:', err)
      setLocalAppointments(appointments)
      setError(err instanceof Error ? err.message : 'Failed to remove appointment')
    } finally {
      setDeletingId(null)
    }
  }

  // 4. Client clears all declined/cancelled appointments from history
  const handleClearAllDeclined = async () => {
    if (!declinedOrCancelledAppointments.length) return
    if (!confirm('Remove all declined and cancelled appointments from history?')) return

    setIsClearingAll(true)
    const idsToDelete = declinedOrCancelledAppointments.map(a => a.id)
    setLocalAppointments(prev => prev.filter(a => !idsToDelete.includes(a.id)))

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .in('id', idsToDelete)

      if (deleteError) throw new Error(deleteError.message)
      router.refresh()
    } catch (err: unknown) {
      console.error('Failed to clear appointments:', err)
      setLocalAppointments(appointments)
      setError(err instanceof Error ? err.message : 'Failed to clear appointments')
    } finally {
      setIsClearingAll(false)
    }
  }

  const now = new Date()

  // Categorize appointments
  // A. Rescheduled by counselor awaiting patient confirmation (only upcoming)
  const rescheduledAppointments = localAppointments.filter(a => {
    if (a.status !== 'pending') return false
    const isProposed = a.rescheduled_by_counselor === true || (a.notes && a.notes.includes('[Counselor Proposed Slot]'))
    if (!isProposed) return false
    const apptDate = new Date(a.end_time || a.start_time)
    return apptDate >= now // Decrement/exclude once date is past
  })

  // B. Pending requests submitted by patient awaiting counselor confirmation (only upcoming)
  const pendingCounselorAppointments = localAppointments.filter(a => {
    if (a.status !== 'pending') return false
    const isProposed = a.rescheduled_by_counselor === true || (a.notes && a.notes.includes('[Counselor Proposed Slot]'))
    if (isProposed) return false
    const apptDate = new Date(a.end_time || a.start_time)
    return apptDate >= now // Decrement/exclude once date is past
  })

  // C. Confirmed appointments (only upcoming)
  const confirmedAppointments = localAppointments.filter(a => {
    if (a.status !== 'confirmed') return false
    const apptDate = new Date(a.end_time || a.start_time)
    return apptDate >= now // Decrement once date is past
  })

  // D. Cancelled or Declined appointments
  const declinedOrCancelledAppointments = localAppointments.filter(a => a.status === 'cancelled')

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#2D3A3A] tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#588B8B]" /> Sessions Timeline
          </h1>
          <p className="text-xs text-[#5A6B6B] mt-1 leading-relaxed">
            Track your appointments, confirmed sessions, and past clinical notes.
          </p>
        </div>

        <Button
          onClick={() => setIsBookModalOpen(true)}
          className="rounded-xl bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-bold px-5 py-2.5 shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          Book New Session
        </Button>
      </div>

      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* SECTION 1: RESCHEDULED BY COUNSELOR (ACTION REQUIRED BY CLIENT) */}
      {rescheduledAppointments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-900">
              Action Required — Counselor Proposed Alternate Slot ({rescheduledAppointments.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rescheduledAppointments.map((appt) => (
              <div
                key={appt.id}
                className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-5 space-y-3 shadow-xs ring-2 ring-amber-200/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-[#2D3A3A]" suppressHydrationWarning>
                      {new Date(appt.start_time).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-[#5A6B6B]">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span className="font-semibold text-amber-900" suppressHydrationWarning>
                        {new Date(appt.start_time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>•</span>
                      {appt.location === 'video' ? (
                        <span className="inline-flex items-center gap-1 text-[#588B8B] font-semibold">
                          <Video className="w-3 h-3" /> Online Video
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#D84C20] font-semibold">
                          <MapPin className="w-3 h-3" /> In-Person
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-amber-200/80 text-amber-950 border-amber-300">
                    Rescheduled by Counselor
                  </span>
                </div>

                {/* Counselor Proposal Note */}
                {appt.notes && (
                  <div className="bg-white/90 border border-amber-200 rounded-xl p-3 text-xs text-[#2D3A3A]">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">
                      Counselor Proposal / Note:
                    </span>
                    <p className="mt-0.5 whitespace-pre-wrap">{appt.notes}</p>
                  </div>
                )}

                <div className="bg-amber-100/80 border border-amber-300 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-amber-950">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                  <span>
                    Your counselor proposed this alternative time slot. If this timing suits you, click <strong>Accept & Confirm Slot</strong> below.
                  </span>
                </div>

                {/* Patient can Accept & Confirm OR Cancel this proposed slot */}
                <div className="pt-2 border-t border-amber-200 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCancelAppointment(appt.id)}
                    disabled={cancellingId === appt.id}
                    className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 hover:underline cursor-pointer"
                  >
                    {cancellingId === appt.id ? 'Cancelling...' : 'Decline / Cancel'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmAppointment(appt.id)}
                    disabled={confirmingId === appt.id}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{confirmingId === appt.id ? 'Confirming...' : 'Accept & Confirm Slot'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: CONFIRMED SESSIONS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#4A5C5C]">
            Confirmed Sessions ({confirmedAppointments.length})
          </h2>
        </div>

        {confirmedAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmedAppointments.map((appt) => {
              const isVideo = appt.location === 'video'

              return (
                <div
                  key={appt.id}
                  className="rounded-2xl border border-[#E2E0D6] bg-white p-5 space-y-3 hover:border-[#588B8B] transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-[#2D3A3A]" suppressHydrationWarning>
                        {new Date(appt.start_time).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-[#5A6B6B]">
                        <Clock className="w-3.5 h-3.5 text-[#588B8B]" />
                        <span suppressHydrationWarning>
                          {new Date(appt.start_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>•</span>
                        {isVideo ? (
                          <span className="inline-flex items-center gap-1 text-[#588B8B] font-semibold">
                            <Video className="w-3 h-3" /> Online Video
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#D84C20] font-semibold">
                            <MapPin className="w-3 h-3" /> In-Person
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
                      Confirmed
                    </span>
                  </div>

                  {appt.notes && (
                    <div className="bg-[#F6F5EE]/60 border border-[#E2E0D6] rounded-xl p-2.5 text-xs text-[#2D3A3A]">
                      <span className="text-[10px] uppercase font-bold text-[#889898] block">Agenda / Notes:</span>
                      <p className="mt-0.5">{appt.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-[#588B8B] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready for call
                    </span>
                    {isVideo && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Video Call
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-[#E2E0D6] p-6 text-center space-y-1.5">
            <Calendar className="w-6 h-6 text-[#889898] mx-auto opacity-50" />
            <p className="text-xs font-semibold text-[#2D3A3A]">No confirmed upcoming sessions</p>
          </div>
        )}
      </div>

      {/* SECTION 3: PENDING COUNSELOR CONFIRMATION */}
      {pendingCounselorAppointments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#4A5C5C]">
              Awaiting Counselor Review ({pendingCounselorAppointments.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingCounselorAppointments.map((appt) => (
              <div
                key={appt.id}
                className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-[#2D3A3A]" suppressHydrationWarning>
                      {new Date(appt.start_time).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-[#5A6B6B]">
                      <Clock className="w-3.5 h-3.5 text-[#588B8B]" />
                      <span suppressHydrationWarning>
                        {new Date(appt.start_time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>•</span>
                      {appt.location === 'video' ? (
                        <span className="inline-flex items-center gap-1 text-[#588B8B] font-semibold">
                          <Video className="w-3 h-3" /> Online Video
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#D84C20] font-semibold">
                          <MapPin className="w-3 h-3" /> In-Person
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-amber-100 text-amber-800 border-amber-300">
                    Pending Approval
                  </span>
                </div>

                {appt.notes && (
                  <div className="bg-white/80 border border-amber-200/80 rounded-xl p-2.5 text-xs text-[#2D3A3A]">
                    <span className="text-[10px] uppercase font-bold text-[#889898] block">Your Requested Agenda:</span>
                    <p className="mt-0.5">{appt.notes}</p>
                  </div>
                )}

                <div className="bg-amber-100/60 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-amber-900">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Awaiting confirmation from your counselor <strong>{counselor.name}</strong>. You will receive an update once your counselor approves or suggests a slot.
                  </span>
                </div>

                {/* CRITICAL: ONLY CANCEL REQUEST IS SHOWN - PATIENT CANNOT SELF-CONFIRM */}
                <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-[#5A6B6B]">Submitted for counselor review</span>
                  <button
                    type="button"
                    onClick={() => handleCancelAppointment(appt.id)}
                    disabled={cancellingId === appt.id}
                    className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 hover:underline cursor-pointer"
                  >
                    {cancellingId === appt.id ? 'Cancelling...' : 'Cancel Request'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: DECLINED OR CANCELLED APPOINTMENTS (WITH CROSS BUTTON TO REMOVE) */}
      {declinedOrCancelledAppointments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#4A5C5C]">
                Declined & Cancelled ({declinedOrCancelledAppointments.length})
              </h2>
            </div>

            {declinedOrCancelledAppointments.length > 1 && (
              <button
                type="button"
                onClick={handleClearAllDeclined}
                disabled={isClearingAll}
                className="text-[11px] font-bold text-rose-700 hover:text-rose-900 hover:underline cursor-pointer flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>{isClearingAll ? 'Clearing...' : 'Clear All History'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {declinedOrCancelledAppointments.map((appt) => {
              const isCounselorDeclined = appt.declined_by === 'counselor' || !appt.declined_by

              return (
                <div
                  key={appt.id}
                  className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 space-y-3 shadow-xs relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-[#2D3A3A] line-through opacity-80" suppressHydrationWarning>
                        {new Date(appt.start_time).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-[#5A6B6B]">
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                        <span suppressHydrationWarning>
                          {new Date(appt.start_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-rose-100 text-rose-900 border-rose-300">
                        {isCounselorDeclined ? 'Declined by Counselor' : 'Cancelled'}
                      </span>
                      {/* Small Cross Button to remove from history */}
                      <button
                        type="button"
                        onClick={() => handleDeleteDeclined(appt.id)}
                        disabled={deletingId === appt.id}
                        title="Remove from history"
                        aria-label="Remove from history"
                        className="w-6 h-6 rounded-full flex items-center justify-center text-rose-400 hover:text-rose-800 hover:bg-rose-200/80 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/90 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-950 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-rose-800 block">
                      Status Update:
                    </span>
                    <p className="leading-relaxed">
                      {appt.cancel_reason ||
                        (isCounselorDeclined
                          ? 'Your counselor was unavailable for this slot. Please choose another date or time.'
                          : 'This session was cancelled.')}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-rose-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteDeclined(appt.id)}
                      disabled={deletingId === appt.id}
                      className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      <span>{deletingId === appt.id ? 'Removing...' : 'Remove Notice'}</span>
                    </button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setIsBookModalOpen(true)}
                      className="rounded-full bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-bold px-3 py-1 shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Book Alternative Slot</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SECTION 5: COMPLETED SESSIONS & CLINICAL NOTES TIMELINE */}
      <div className="space-y-5 pt-4 border-t-2 border-dashed border-[#E2E0D6]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#588B8B]" />
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#4A5C5C]">
            Past Sessions & Clinical Notes ({sessionNotes.length})
          </h2>
        </div>

        {sessionNotes.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E2E0D6]">
            {sessionNotes.map((session, index) => {
              const sessionTasks = tasks.filter(t => t.session_id === session.id)

              return (
                <div key={session.id} className="relative space-y-3">
                  <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#588B8B] ring-4 ring-white" />

                  <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-xs p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E0D6] pb-3">
                      <div>
                        <span className="text-[11px] font-bold text-[#588B8B] uppercase tracking-wide">
                          Session #{session.session_number || sessionNotes.length - index}
                        </span>
                        <h3 className="text-sm font-bold text-[#2D3A3A]" suppressHydrationWarning>
                          {new Date(session.session_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#5A6B6B]">
                        {session.duration_minutes && (
                          <span className="bg-[#F6F5EE] border border-[#E2E0D6] px-2.5 py-0.5 rounded-md font-mono text-[11px]">
                            {session.duration_minutes} min
                          </span>
                        )}
                        <span className="bg-[#EDF4F2] text-[#263F3F] border border-[#588B8B]/30 px-2.5 py-0.5 rounded-md font-semibold text-[11px]">
                          {session.modality || 'Session'}
                        </span>
                      </div>
                    </div>

                    {session.homework_assigned && (
                      <div className="bg-[#F6F5EE]/70 border border-[#E2E0D6] rounded-xl p-3.5 space-y-1">
                        <strong className="text-xs font-bold text-[#2D3A3A] flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#588B8B]" /> Session Homework & Focus:
                        </strong>
                        <p className="text-xs text-[#5A6B6B] leading-relaxed whitespace-pre-wrap">
                          {session.homework_assigned}
                        </p>
                      </div>
                    )}

                    {sessionTasks.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A6B6B] flex items-center gap-1.5">
                          <ListTodo className="w-3.5 h-3.5 text-[#588B8B]" /> Exercises Assigned in this Session:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {sessionTasks.map((t) => (
                            <div
                              key={t.id}
                              className="p-2.5 rounded-xl border border-[#E2E0D6] bg-[#F6F5EE]/40 flex items-center justify-between text-xs"
                            >
                              <span className="font-semibold text-[#2D3A3A] truncate">{t.title}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  t.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {t.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {session.tags && session.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {session.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-[#F6F5EE] text-[#5A6B6B] border border-[#E2E0D6]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-[#E2E0D6] p-8 text-center space-y-2">
            <CalendarDays className="w-8 h-8 text-[#889898] mx-auto opacity-50" />
            <h3 className="text-xs font-bold text-[#2D3A3A]">No past sessions recorded yet</h3>
            <p className="text-[11px] text-[#5A6B6B] max-w-sm mx-auto leading-relaxed">
              Once you meet with your counselor, session summaries, homework notes, and progress logs will be cataloged here in this timeline.
            </p>
          </div>
        )}
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
