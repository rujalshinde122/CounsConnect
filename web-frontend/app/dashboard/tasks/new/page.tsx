'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, CheckSquare, User, Calendar, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface ClientOption {
  id: string
  name: string | null
}

const FREQUENCIES = [
  { value: 'daily', labelKey: 'common.frequency.daily', fallback: 'Daily' },
  { value: 'weekly', labelKey: 'common.frequency.weekly', fallback: 'Weekly' },
  { value: 'biweekly', labelKey: 'common.frequency.biweekly', fallback: 'Bi-weekly' },
  { value: 'monthly', labelKey: 'common.frequency.monthly', fallback: 'Monthly' },
  { value: 'once', labelKey: 'common.frequency.once', fallback: 'One-time' },
] as const

export default function NewTaskPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [patients, setPatients] = useState<ClientOption[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [sessions, setSessions] = useState<{ id: string, session_date: string, session_number: number | null }[]>([])

  const getTomorrowStr = () => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  }

  const [form, setForm] = useState({
    patientId: '',
    sessionId: '',
    title: '',
    description: '',
    frequency: 'daily',
    deadline: getTomorrowStr(),
  })

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true)
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Query clients strictly for this counselor
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('counselor_id', user.id)
        .order('name')

      if (!error && data) {
        setPatients(data)
        if (data.length > 0) {
          setForm((prev) => ({ ...prev, patientId: data[0].id }))
        }
      }
      setLoadingPatients(false)
    }

    fetchPatients()
  }, [])

  useEffect(() => {
    if (!form.patientId) {
      setSessions([])
      return
    }
    const fetchSessions = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('session_notes')
        .select('id, session_date, session_number')
        .eq('client_id', form.patientId)
        .order('session_date', { ascending: false })
      if (data) setSessions(data)
    }
    fetchSessions()
  }, [form.patientId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (!form.patientId) {
      setError(t('dashboard.tasks.createModal.selectPatientPlaceholder') || 'Please select a client.')
      setSubmitting(false)
      return
    }

    if (!form.title.trim()) {
      setError('Please provide a task title.')
      setSubmitting(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from('tasks').insert({
      counselor_id: user.id,
      patient_id: form.patientId,
      session_id: form.sessionId || null,
      title: form.title.trim(),
      description: form.description.trim() || null,
      frequency: form.frequency,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      status: 'pending',
    })

    setSubmitting(false)
    if (insertError) {
      setError(insertError.message)
    } else {
      router.push('/dashboard/tasks')
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A6B6B] hover:text-[#2D3A3A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Tasks
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-[#E2E0D6] bg-[#F6F5EE]/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#588B8B]/10 border border-[#588B8B]/20 text-[#588B8B] flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#2D3A3A]">
              {t('dashboard.tasks.createModal.title')}
            </h2>
            <p className="text-xs text-[#5A6B6B] mt-0.5">
              {t('dashboard.tasks.createModal.subtitle')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* Select Patient / Client (Patients only, never counselors) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#2D3A3A] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#588B8B]" />
                <span>{t('dashboard.tasks.createModal.selectPatient')}</span>
                <span className="text-rose-500">*</span>
              </Label>
              <select
                className="w-full border border-[#E2E0D6] rounded-lg px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#588B8B] text-[#2D3A3A] cursor-pointer"
                value={form.patientId}
                onChange={(e) => update('patientId', e.target.value)}
                disabled={loadingPatients || patients.length === 0}
              >
                {loadingPatients ? (
                  <option value="">{t('common.loading')}</option>
                ) : patients.length === 0 ? (
                  <option value="">{t('dashboard.tasks.createModal.noPatients')}</option>
                ) : (
                  patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || 'Unnamed Client'}
                    </option>
                  ))
                )}
              </select>
              {patients.length === 0 && !loadingPatients && (
                <p className="text-[11px] text-amber-700 mt-1">
                  No clients found in your practice. Please add a client first.
                </p>
              )}
            </div>

            {/* Link to Session */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#2D3A3A] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#588B8B]" />
                <span>Link to Session (Optional)</span>
              </Label>
              <select
                className="w-full border border-[#E2E0D6] rounded-lg px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#588B8B] text-[#2D3A3A] cursor-pointer"
                value={form.sessionId}
                onChange={(e) => update('sessionId', e.target.value)}
                disabled={sessions.length === 0}
              >
                <option value="">No session linked</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    Session {s.session_number ? `#${s.session_number}` : ''} - {new Date(s.session_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#2D3A3A]">
                {t('dashboard.tasks.createModal.taskTitle')} <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder={t('dashboard.tasks.createModal.titlePlaceholder') || "e.g., Daily Thought Log, Deep Breathing 10 mins"}
                className="rounded-lg border-[#E2E0D6] bg-white text-xs sm:text-sm px-3.5 py-2"
                required
              />
            </div>

            {/* Instructions / Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#2D3A3A]">
                {t('dashboard.tasks.createModal.instructions')}
              </Label>
              <Textarea
                rows={3}
                className="resize-none text-xs rounded-lg border-[#E2E0D6] bg-white text-[#2D3A3A] p-2.5"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder={t('dashboard.tasks.createModal.instructionsPlaceholder') || "Detailed guidance for the client to complete this exercise..."}
              />
            </div>

            {/* Frequency Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#2D3A3A]">
                {t('dashboard.tasks.createModal.frequency')}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {FREQUENCIES.map((freq) => {
                  const isSelected = form.frequency === freq.value
                  return (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => update('frequency', freq.value)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#588B8B] text-white border-[#588B8B] shadow-2xs'
                          : 'bg-white text-[#5A6B6B] border-[#E2E0D6] hover:bg-[#F6F5EE]'
                      }`}
                    >
                      {t(freq.labelKey) || freq.fallback}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Due Date / Deadline */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#2D3A3A] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#588B8B]" />
                <span>{t('dashboard.tasks.createModal.deadline')}</span>
              </Label>
              <Input
                type="date"
                value={form.deadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => update('deadline', e.target.value)}
                className="rounded-lg border-[#E2E0D6] bg-white text-xs sm:text-sm px-3.5 py-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-[#E2E0D6]">
            <Button
              type="submit"
              disabled={submitting || patients.length === 0}
              className="bg-[#588B8B] hover:bg-[#3D6363] text-white rounded-lg px-5 text-xs font-semibold cursor-pointer"
            >
              {submitting ? t('dashboard.tasks.createModal.submitting') : t('dashboard.tasks.createModal.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
