'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Check, X, Calendar, Clock, AlertCircle } from 'lucide-react'

interface AppointmentActionsProps {
  appointmentId: string
  currentStatus?: string
  startTime?: string
  currentNotes?: string | null
}

export default function AppointmentActions({
  appointmentId,
  currentStatus = 'pending',
  startTime,
  currentNotes,
}: AppointmentActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [isDeclineOpen, setIsDeclineOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [rescheduleNote, setRescheduleNote] = useState('')
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const updateStatus = async (status: string, reason?: string) => {
    setLoading(status)
    try {
      const supabase = createClient()
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === 'confirmed') {
        updateData.rescheduled_by_counselor = false
        updateData.counselor_notified = true
        updateData.patient_notified = false
      } else if (status === 'cancelled') {
        updateData.declined_by = 'counselor'
        updateData.cancel_reason = reason || 'Counselor is unavailable at requested time'
        updateData.counselor_notified = true
        updateData.patient_notified = false
      }

      const { error: updateError } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId)

      if (updateError) throw updateError
      setIsDeclineOpen(false)
      router.refresh()
    } catch (err: unknown) {
      console.error('Failed to update status:', err)
    } finally {
      setLoading(null)
    }
  }

  const handleProposeSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newDate || !newTime) {
      setError('Please provide both new date and start time')
      return
    }

    setLoading('reschedule')
    try {
      const startDateTime = new Date(`${newDate}T${newTime}:00`)
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000)

      const noteText = rescheduleNote.trim()
        ? `[Counselor Proposed Slot]: ${rescheduleNote.trim()}`
        : `[Counselor Proposed Slot]: Rescheduled to ${newDate} at ${newTime}`

      const combinedNotes = currentNotes
        ? `${currentNotes}\n\n${noteText}`
        : noteText

      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          notes: combinedNotes,
          status: 'pending',
          rescheduled_by_counselor: true, // Crucial: sets flag so patient sees Accept & Confirm
          counselor_notified: true,
          patient_notified: false, // Triggers notification badge on patient side
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)

      if (updateError) throw updateError

      setIsRescheduleOpen(false)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to propose new slot'
      setError(msg)
    } finally {
      setLoading(null)
    }
  }

  const isPending = currentStatus === 'pending'

  return (
    <>
      <div className="flex items-center gap-1.5">
        {isPending ? (
          <>
            {/* Confirm Slot Button */}
            <Button
              size="sm"
              className="h-7 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg px-2.5 flex items-center gap-1 shadow-2xs cursor-pointer"
              onClick={() => updateStatus('confirmed')}
              disabled={!!loading}
            >
              <Check className="w-3 h-3" />
              <span>{loading === 'confirmed' ? 'Confirming...' : 'Confirm'}</span>
            </Button>

            {/* Propose Alternate Slot Button */}
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-[#E2E0D6] text-[#5A6B6B] hover:text-[#2D3A3A] hover:bg-[#F6F5EE] rounded-lg px-2.5 flex items-center gap-1 cursor-pointer"
              onClick={() => {
                if (startTime) {
                  const d = new Date(startTime)
                  setNewDate(d.toISOString().split('T')[0])
                  setNewTime(d.toTimeString().substring(0, 5))
                }
                setIsRescheduleOpen(true)
              }}
              disabled={!!loading}
            >
              <Clock className="w-3 h-3 text-[#588B8B]" />
              <span>Reschedule</span>
            </Button>

            {/* Decline Button (Opens modal to give quick reason) */}
            <Button
              size="sm"
              variant="destructive"
              className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg px-2.5 flex items-center gap-1 shadow-2xs cursor-pointer"
              onClick={() => setIsDeclineOpen(true)}
              disabled={!!loading}
            >
              <X className="w-3 h-3" />
              <span>Decline</span>
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-[#E2E0D6] hover:bg-[#F6F5EE] text-[#2D3A3A] rounded-lg px-2.5 cursor-pointer"
              onClick={() => updateStatus('completed')}
              disabled={!!loading}
            >
              {loading === 'completed' ? '...' : 'Complete'}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg px-2.5 shadow-2xs cursor-pointer"
              onClick={() => updateStatus('cancelled', 'Session cancelled by counselor')}
              disabled={!!loading}
            >
              {loading === 'cancelled' ? '...' : 'Cancel'}
            </Button>
          </>
        )}
      </div>

      {/* Decline Reason Modal */}
      {isDeclineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E2E0D6] shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#E2E0D6] flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-[#2D3A3A]">Decline Session Request</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeclineOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center text-[#5A6B6B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-[#5A6B6B]">
                The client will be notified that this session was declined.
              </p>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2D3A3A]">Reason / Note for Client (Optional)</Label>
                <Input
                  value={declineReason}
                  onChange={e => setDeclineReason(e.target.value)}
                  placeholder="e.g., Slot unavailable / please pick another day"
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E0D6]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeclineOpen(false)}
                  disabled={loading === 'cancelled'}
                  className="rounded-full text-xs h-8 px-4"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => updateStatus('cancelled', declineReason)}
                  disabled={loading === 'cancelled'}
                  className="rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold h-8 px-5"
                >
                  {loading === 'cancelled' ? 'Declining...' : 'Confirm Decline'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule / Alternate Slot Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E2E0D6] shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#E2E0D6] flex items-center justify-between bg-[#F6F5EE]/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#588B8B]" />
                <h3 className="text-sm font-bold text-[#2D3A3A]">Propose Alternate Slot</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center text-[#5A6B6B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProposeSlot} className="p-6 space-y-4">
              {error && (
                <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#2D3A3A]">New Date</Label>
                  <Input
                    type="date"
                    min={today}
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-[#2D3A3A]">Start Time</Label>
                  <Input
                    type="time"
                    required
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#2D3A3A]">Note to Client (Optional)</Label>
                <Textarea
                  rows={2}
                  value={rescheduleNote}
                  onChange={e => setRescheduleNote(e.target.value)}
                  placeholder="e.g., Free at 4 PM instead of 3 PM due to clinical supervision..."
                  className="text-xs rounded-xl resize-none"
                />
              </div>

              <div className="bg-[#F6F5EE] border border-[#E2E0D6] rounded-xl p-3 flex items-start gap-2 text-[11px] text-[#5A6B6B]">
                <AlertCircle className="w-4 h-4 text-[#588B8B] shrink-0 mt-0.5" />
                <span>
                  The appointment timing will be updated and sent back to the client for their review and confirmation.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E0D6]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRescheduleOpen(false)}
                  disabled={loading === 'reschedule'}
                  className="rounded-full text-xs h-8 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading === 'reschedule'}
                  className="rounded-full bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-bold h-8 px-5"
                >
                  {loading === 'reschedule' ? 'Updating...' : 'Propose Slot'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
