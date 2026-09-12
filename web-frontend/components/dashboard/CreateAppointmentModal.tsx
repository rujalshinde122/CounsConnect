'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Calendar, Clock, Video, MapPin, CheckCircle2, User, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/context/LanguageContext'

export interface PatientOption {
  id: string
  name: string | null
  email: string
  role?: string
}

interface CreateAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  initialDate?: string
  patients?: PatientOption[]
  onSuccess?: () => void
}

export default function CreateAppointmentModal({
  isOpen,
  onClose,
  initialDate,
  patients: initialPatients,
  onSuccess,
}: CreateAppointmentModalProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const [patients, setPatients] = useState<PatientOption[]>(initialPatients || [])
  const [loadingPatients, setLoadingPatients] = useState(false)

  // Form states
  const getTodayStr = () => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  }

  const [patientId, setPatientId] = useState<string>('')
  const [date, setDate] = useState<string>(initialDate || getTodayStr())
  const [time, setTime] = useState<string>('10:00')
  const [duration, setDuration] = useState<number>(45) // minutes
  const [location, setLocation] = useState<'video' | 'in-person'>('video')
  const [status, setStatus] = useState<'confirmed' | 'pending'>('confirmed')
  const [notes, setNotes] = useState<string>('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch patients if not provided
  useEffect(() => {
    if (isOpen) {
      setError(null)
      if (initialPatients && initialPatients.length > 0) {
        setPatients(initialPatients)
        if (!patientId) setPatientId(initialPatients[0].id)
      } else {
        setLoadingPatients(true)
        const supabase = createClient()
        supabase
          .from('profiles')
          .select('id, name, email, role')
          .then(({ data, error }) => {
            setLoadingPatients(false)
            if (!error && data && data.length > 0) {
              setPatients(data)
              if (!patientId) setPatientId(data[0].id)
            }
          })
      }
    }
  }, [isOpen, initialPatients])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!patientId) {
      setError(t('dashboard.appointments.scheduleModal.selectPatientPlaceholder'))
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Authentication session expired. Please sign in again.')
        setSubmitting(false)
        return
      }

      // Calculate start and end ISO timestamps
      const [year, month, day] = date.split('-').map(Number)
      const [hours, minutes] = time.split(':').map(Number)
      const startDate = new Date(year, month - 1, day, hours, minutes)
      const endDate = new Date(startDate.getTime() + duration * 60 * 1000)

      const { error: insertError } = await supabase.from('appointments').insert({
        counselor_id: user.id,
        patient_id: patientId,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        location,
        status,
        notes: notes.trim() || null,
      })

      if (insertError) {
        setError(insertError.message)
        setSubmitting(false)
        return
      }

      setSubmitting(false)
      onClose()
      if (onSuccess) onSuccess()
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Failed to schedule appointment')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E0D6] overflow-hidden z-10 animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#E2E0D6] bg-gradient-to-r from-white via-[#F6F5EE]/40 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#588B8B]/10 border border-[#588B8B]/20 text-[#588B8B] flex items-center justify-center shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2D3A3A] tracking-tight">
                {t('dashboard.appointments.scheduleModal.title')}
              </h3>
              <p className="text-xs text-[#5A6B6B] mt-0.5">
                {t('dashboard.appointments.scheduleModal.subtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#889898] hover:text-[#2D3A3A] hover:bg-[#F6F5EE] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4.5 flex-1">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Patient Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D3A3A] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#588B8B]" />
              <span>{t('dashboard.appointments.scheduleModal.selectPatient')}</span>
              <span className="text-rose-500">*</span>
            </label>

            {loadingPatients ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E2E0D6] bg-[#F6F5EE]/50 text-xs text-[#5A6B6B]">
                <Loader2 className="w-4 h-4 animate-spin text-[#588B8B]" />
                <span>Loading directory...</span>
              </div>
            ) : patients.length === 0 ? (
              <div className="p-3 rounded-xl border border-dashed border-[#E2E0D6] bg-[#F6F5EE]/40 text-xs text-[#889898] text-center">
                {t('dashboard.appointments.scheduleModal.noPatients')}
              </div>
            ) : (
              <div className="relative">
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E0D6] bg-white text-[#2D3A3A] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#588B8B]/30 focus:border-[#588B8B] shadow-2xs transition-all cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    {t('dashboard.appointments.scheduleModal.selectPatientPlaceholder')}
                  </option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name ? `${p.name} (${p.email})` : p.email}
                      {p.role ? ` — ${p.role}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Session Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D3A3A] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#588B8B]" />
                <span>{t('dashboard.appointments.scheduleModal.date')}</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E0D6] bg-white text-[#2D3A3A] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#588B8B]/30 focus:border-[#588B8B] shadow-2xs transition-all"
                required
              />
            </div>

            {/* Start Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D3A3A] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#588B8B]" />
                <span>{t('dashboard.appointments.scheduleModal.time')}</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E0D6] bg-white text-[#2D3A3A] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#588B8B]/30 focus:border-[#588B8B] shadow-2xs transition-all"
                required
              />
            </div>
          </div>

          {/* Duration Pills */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D3A3A]">
              {t('dashboard.appointments.scheduleModal.duration')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 50, 60].map((mins) => {
                const isSelected = duration === mins
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                      isSelected
                        ? 'bg-[#588B8B] text-white border-[#588B8B] shadow-2xs'
                        : 'bg-white text-[#5A6B6B] border-[#E2E0D6] hover:border-[#588B8B]/40 hover:bg-[#F6F5EE]'
                    }`}
                  >
                    {mins}m
                  </button>
                )
              })}
            </div>
          </div>

          {/* Format Selection Cards (Online Video vs In-Person) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D3A3A]">
              {t('dashboard.appointments.scheduleModal.format')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocation('video')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                  location === 'video'
                    ? 'border-[#588B8B] bg-[#588B8B]/5 ring-1 ring-[#588B8B]'
                    : 'border-[#E2E0D6] bg-white hover:bg-[#F6F5EE]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    location === 'video'
                      ? 'bg-[#588B8B] text-white'
                      : 'bg-[#F6F5EE] text-[#5A6B6B]'
                  }`}
                >
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2D3A3A]">
                    {t('dashboard.appointments.scheduleModal.video')}
                  </p>
                  <p className="text-[10px] text-[#889898]">Remote Tele-session</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLocation('in-person')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                  location === 'in-person'
                    ? 'border-[#D97706] bg-[#D97706]/5 ring-1 ring-[#D97706]'
                    : 'border-[#E2E0D6] bg-white hover:bg-[#F6F5EE]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    location === 'in-person'
                      ? 'bg-[#D97706] text-white'
                      : 'bg-[#F6F5EE] text-[#5A6B6B]'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2D3A3A]">
                    {t('dashboard.appointments.scheduleModal.inPerson')}
                  </p>
                  <p className="text-[10px] text-[#889898]">Clinic Office Room</p>
                </div>
              </button>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D3A3A]">
              {t('dashboard.appointments.scheduleModal.status')}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus('confirmed')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                  status === 'confirmed'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                    : 'bg-white text-[#5A6B6B] border-[#E2E0D6] hover:bg-[#F6F5EE]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('dashboard.appointments.scheduleModal.confirmed')}</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                  status === 'pending'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300'
                    : 'bg-white text-[#5A6B6B] border-[#E2E0D6] hover:bg-[#F6F5EE]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('dashboard.appointments.scheduleModal.pending')}</span>
              </button>
            </div>
          </div>

          {/* Notes / Agenda */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D3A3A]">
              {t('dashboard.appointments.scheduleModal.notes')}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('dashboard.appointments.scheduleModal.notesPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E0D6] bg-white text-[#2D3A3A] text-xs font-normal placeholder-[#889898] focus:outline-none focus:ring-2 focus:ring-[#588B8B]/30 focus:border-[#588B8B] shadow-2xs transition-all resize-none"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2E0D6]/80">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-[#E2E0D6] bg-white hover:bg-[#F6F5EE] text-[#5A6B6B] text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              {t('common.cancel')}
            </button>

            <button
              type="submit"
              disabled={submitting || patients.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#588B8B] to-[#457070] hover:from-[#457070] hover:to-[#365959] text-white text-xs font-bold shadow-xs hover:shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('dashboard.appointments.scheduleModal.submitting')}</span>
                </>
              ) : (
                <span>{t('dashboard.appointments.scheduleModal.submit')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
