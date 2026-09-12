'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, CheckSquare, Clock, Calendar, User, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/context/LanguageContext'
import type { PatientOption } from './CreateAppointmentModal'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  patients?: PatientOption[]
  onSuccess?: () => void
}

const FREQUENCIES = ['once', 'daily', 'weekly', 'biweekly', 'monthly'] as const

export default function CreateTaskModal({
  isOpen,
  onClose,
  patients: initialPatients,
  onSuccess,
}: CreateTaskModalProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const [patients, setPatients] = useState<PatientOption[]>(initialPatients || [])
  const [loadingPatients, setLoadingPatients] = useState(false)

  // Form states
  const getTomorrowStr = () => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  }

  const [patientId, setPatientId] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [frequency, setFrequency] = useState<string>('daily')
  const [deadline, setDeadline] = useState<string>(getTomorrowStr())

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch patients if not passed
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
      setError(t('dashboard.tasks.createModal.selectPatientPlaceholder'))
      return
    }

    if (!title.trim()) {
      setError('Please provide a task title')
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

      const deadlineIso = deadline ? new Date(`${deadline}T23:59:59`).toISOString() : null

      const { error: insertError } = await supabase.from('tasks').insert({
        counselor_id: user.id,
        patient_id: patientId,
        title: title.trim(),
        description: description.trim() || null,
        frequency,
        deadline: deadlineIso,
        status: 'pending',
      })

      if (insertError) {
        setError(insertError.message)
        setSubmitting(false)
        return
      }

      setSubmitting(false)
      setTitle('')
      setDescription('')
      onClose()
      if (onSuccess) onSuccess()
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Failed to assign task')
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
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E2E0D6] bg-gradient-to-r from-white via-[#F6F5EE]/40 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#588B8B]/10 border border-[#588B8B]/20 text-[#588B8B] flex items-center justify-center shadow-2xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2D3A3A] tracking-tight">
                {t('dashboard.tasks.createModal.title')}
              </h3>
              <p className="text-xs text-[#5A6B6B] mt-0.5">
                {t('dashboard.tasks.createModal.subtitle')}
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

        {/* Body / Form */}
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
              <span>{t('dashboard.tasks.createModal.selectPatient')}</span>
              <span className="text-rose-500">*</span>
            </label>

            {loadingPatients ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E2E0D6] bg-[#F6F5EE]/50 text-xs text-[#5A6B6B]">
                <Loader2 className="w-4 h-4 animate-spin text-[#588B8B]" />
                <span>Loading directory...</span>
              </div>
            ) : patients.length === 0 ? (
              <div className="p-3 rounded-xl border border-dashed border-[#E2E0D6] bg-[#F6F5EE]/40 text-xs text-[#889898] text-center">
                {t('dashboard.tasks.createModal.noPatients')}
              </div>
            ) : (
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E0D6] bg-white text-[#2D3A3A] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#588B8B]/30 focus:border-[#588B8B] shadow-2xs transition-all cursor-pointer"
                required
              >
                <option value="" disabled>
                  {t('dashboard.tasks.createModal.selectPatientPlaceholder')}
                </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name ? `${p.name} (${p.email})` : p.email}
                    {p.role ? ` — ${p.role}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Task Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D3A3A]">
              <span>{t('dashboard.tasks.createModal.taskTitle')}</span>
              <span className="text-rose-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('dashboard.tasks.createModal.titlePlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E0D6] bg-white text-[#2D3A3A] text-xs font-medium placeholder-[#889898] focus:outline-none focus:ring-2 focus:ring-[#588B8B]/30 focus:border-[#588B8B] shadow-2xs transition-all"
              required
            />
          </div>

          {/* Instructions / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D3A3A]">
              {t('dashboard.tasks.createModal.instructions')}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('dashboard.tasks.createModal.instructionsPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E0D6] bg-white text-[#2D3A3A] text-xs font-normal placeholder-[#889898] focus:outline-none focus:ring-2 focus:ring-[#588B8B]/30 focus:border-[#588B8B] shadow-2xs transition-all resize-none"
            />
          </div>

          {/* Frequency Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D3A3A]">
              {t('dashboard.tasks.createModal.frequency')}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {FREQUENCIES.map((freq) => {
                const isSelected = frequency === freq
                const label = t(`common.frequency.${freq}`) || freq
                return (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequency(freq)}
                    className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center truncate ${
                      isSelected
                        ? 'bg-[#588B8B] text-white border-[#588B8B] shadow-2xs'
                        : 'bg-white text-[#5A6B6B] border-[#E2E0D6] hover:bg-[#F6F5EE]'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Deadline Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D3A3A] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#588B8B]" />
              <span>{t('dashboard.tasks.createModal.deadline')}</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E0D6] bg-white text-[#2D3A3A] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#588B8B]/30 focus:border-[#588B8B] shadow-2xs transition-all"
            />
          </div>

          {/* Footer Actions */}
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
                  <span>{t('dashboard.tasks.createModal.submitting')}</span>
                </>
              ) : (
                <span>{t('dashboard.tasks.createModal.submit')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
