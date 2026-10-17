'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, Video, MapPin, X, CheckCircle2, AlertCircle } from 'lucide-react'

interface BookAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  counselorId: string
  counselorName: string
  clientId: string
  onSuccess?: () => void
}

export default function BookAppointmentModal({
  isOpen,
  onClose,
  counselorId,
  counselorName,
  clientId,
  onSuccess,
}: BookAppointmentModalProps) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [sessionDate, setSessionDate] = useState('')
  const [startTime, setStartTime] = useState('15:00')
  const [duration, setDuration] = useState('60')
  const [format, setFormat] = useState<'video' | 'in-person'>('video')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!sessionDate) {
      setError('Please select a session date')
      return
    }
    if (!startTime) {
      setError('Please select a session start time')
      return
    }

    setSubmitting(true)

    try {
      const startDateTime = new Date(`${sessionDate}T${startTime}:00`)
      const durationMinutes = parseInt(duration, 10) || 60
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000)

      const supabase = createClient()
      const { error: insertError } = await supabase.from('appointments').insert({
        counselor_id: counselorId,
        patient_id: clientId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: format,
        notes: notes.trim() || null,
        status: 'pending', // Pending counselor confirmation
        rescheduled_by_counselor: false, // New request from patient - NOT rescheduled yet
        counselor_notified: false, // Notifies counselor in sidebar
        patient_notified: true,
      })

      if (insertError) throw new Error(insertError.message)

      setSuccess(true)
      if (onSuccess) onSuccess()
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to request appointment'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-[#E2E0D6] shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E2E0D6] flex items-center justify-between bg-[#F6F5EE]/40">
          <div>
            <h2 className="text-sm font-bold text-[#2D3A3A] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#588B8B]" /> Schedule Appointment
            </h2>
            <p className="text-xs text-[#5A6B6B] mt-0.5">
              Request a session with <strong className="text-[#2D3A3A]">{counselorName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#5A6B6B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#2D3A3A]">Session Request Sent!</h3>
            <p className="text-xs text-[#5A6B6B] leading-relaxed max-w-sm mx-auto">
              Your appointment request for <strong>{sessionDate}</strong> at <strong>{startTime}</strong> has been sent to your counselor. The session status is currently <span className="font-semibold text-amber-700">Pending Confirmation</span> until accepted.
            </p>
            <div className="pt-2">
              <Button
                onClick={() => {
                  setSuccess(false)
                  onClose()
                }}
                className="rounded-full bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-bold px-6 py-2"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2D3A3A]">
                  Session Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="date"
                  min={today}
                  required
                  value={sessionDate}
                  onChange={e => setSessionDate(e.target.value)}
                  className="rounded-xl border-[#E2E0D6] bg-white text-xs px-3.5 py-2.5 focus:border-[#588B8B]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2D3A3A]">
                  Start Time <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="rounded-xl border-[#E2E0D6] bg-white text-xs px-3.5 py-2.5 focus:border-[#588B8B]"
                />
              </div>
            </div>

            {/* Duration & Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2D3A3A]">Duration</Label>
                <select
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full border border-[#E2E0D6] rounded-xl px-3.5 py-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#588B8B] text-[#2D3A3A]"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2D3A3A]">Session Format</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('video')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      format === 'video'
                        ? 'border-[#588B8B] bg-[#EDF4F2] text-[#263F3F]'
                        : 'border-[#E2E0D6] bg-white text-[#5A6B6B] hover:bg-[#F6F5EE]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-[#588B8B]" />
                    Online Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('in-person')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      format === 'in-person'
                        ? 'border-[#588B8B] bg-[#EDF4F2] text-[#263F3F]'
                        : 'border-[#E2E0D6] bg-white text-[#5A6B6B] hover:bg-[#F6F5EE]'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#D84C20]" />
                    In-Person
                  </button>
                </div>
              </div>
            </div>

            {/* Notes / Agenda */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#2D3A3A]">
                Session Notes / Agenda
              </Label>
              <Textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g., Initial intake assessment, CBT thought review, discuss stress..."
                className="resize-none text-xs rounded-xl border-[#E2E0D6] bg-white text-[#2D3A3A] p-3 focus:border-[#588B8B]"
              />
            </div>

            {/* Notice Alert */}
            <div className="bg-[#F6F5EE] border border-[#E2E0D6] rounded-xl p-3 flex items-start gap-2 text-[11px] text-[#5A6B6B] leading-relaxed">
              <AlertCircle className="w-4 h-4 text-[#588B8B] shrink-0 mt-0.5" />
              <span>
                Booking requests are submitted in <strong>Pending</strong> state. Your counselor will check their availability to confirm or coordinate slot timings with you.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E0D6]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="rounded-full text-xs font-semibold px-4 py-2 border-[#E2E0D6] text-[#5A6B6B]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-bold px-6 py-2 shadow-xs transition-colors"
              >
                {submitting ? 'Submitting...' : 'Request Session'}
              </Button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
