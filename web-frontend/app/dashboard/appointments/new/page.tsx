'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Video, MapPin, Calendar, Clock } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function NewAppointmentPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [loadingClients, setLoadingClients] = useState(true)

  const [form, setForm] = useState({
    clientId: '',
    date: '',
    time: '',
    duration: '60',
    location: 'video' as 'video' | 'in-person',
    notes: '',
  })

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  useEffect(() => {
    const fetchClients = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('clients')
        .select('id, name')
        .eq('counselor_id', user.id)
        .order('name')
      
      if (data) setClients(data)
      setLoadingClients(false)
    }
    fetchClients()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (!form.clientId || !form.date || !form.time) {
      setError(t('dashboard.appointments.scheduleModal.selectPatientPlaceholder') || 'Please fill in all required fields.')
      setSubmitting(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setSubmitting(false); return }

    // Construct start_time and end_time
    const startDateTime = new Date(`${form.date}T${form.time}`)
    const endDateTime = new Date(startDateTime.getTime() + parseInt(form.duration) * 60000)

    // Check if appointment is in the past
    if (startDateTime < new Date()) {
      setError('Cannot schedule an appointment in the past.')
      setSubmitting(false)
      return
    }

    // Check for overlaps
    const { data: overlapping } = await supabase
      .from('appointments')
      .select('id')
      .eq('counselor_id', user.id)
      .not('status', 'eq', 'cancelled')
      .lt('start_time', endDateTime.toISOString())
      .gt('end_time', startDateTime.toISOString())

    if (overlapping && overlapping.length > 0) {
      setError('This session is already booked. Please check for open slots.')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from('appointments').insert({
      counselor_id: user.id,
      patient_id: form.clientId,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      status: 'confirmed',
      location: form.location,
      notes: form.notes || null,
    })

    setSubmitting(false)
    if (insertError) {
      setError(insertError.message)
    } else {
      router.push('/dashboard/appointments')
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/appointments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A6B6B] hover:text-[#2D3A3A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Schedule
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-[#E2E0D6] bg-[#F6F5EE]/40">
          <h2 className="text-sm font-bold text-[#2D3A3A]">
            {t('dashboard.appointments.scheduleModal.title')}
          </h2>
          <p className="text-xs text-[#5A6B6B] mt-0.5">
            {t('dashboard.appointments.scheduleModal.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#2D3A3A]">
                {t('dashboard.appointments.scheduleModal.selectPatient')} <span className="text-rose-500">*</span>
              </Label>
              <select
                className="w-full border border-[#E2E0D6] rounded-lg px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#588B8B] text-[#2D3A3A]"
                value={form.clientId}
                onChange={e => update('clientId', e.target.value)}
                disabled={loadingClients}
              >
                <option value="">{loadingClients ? t('common.loading') : (t('dashboard.appointments.scheduleModal.selectPatientPlaceholder') || 'Choose a client')}</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2D3A3A] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {t('dashboard.appointments.scheduleModal.date')} <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => update('date', e.target.value)}
                  className="rounded-lg border-[#E2E0D6] bg-white text-xs sm:text-sm px-3.5 py-2"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2D3A3A] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {t('dashboard.appointments.scheduleModal.time')} <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={e => update('time', e.target.value)}
                  className="rounded-lg border-[#E2E0D6] bg-white text-xs sm:text-sm px-3.5 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2D3A3A]">{t('dashboard.appointments.scheduleModal.duration')}</Label>
                <select
                  className="w-full border border-[#E2E0D6] rounded-lg px-3 py-2 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#588B8B] text-[#2D3A3A]"
                  value={form.duration}
                  onChange={e => update('duration', e.target.value)}
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2D3A3A]">{t('dashboard.appointments.scheduleModal.format')}</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => update('location', 'video')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      form.location === 'video'
                        ? 'bg-[#EDF4F2] text-[#263F3F] border-[#588B8B]'
                        : 'bg-white text-[#5A6B6B] border-[#E2E0D6] hover:bg-[#F6F5EE]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" /> {t('common.onlineVideo')}
                  </button>
                  <button
                    type="button"
                    onClick={() => update('location', 'in-person')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      form.location === 'in-person'
                        ? 'bg-[#FFF0E5] text-[#D84C20] border-[#FF8A65]'
                        : 'bg-white text-[#5A6B6B] border-[#E2E0D6] hover:bg-[#F6F5EE]'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" /> {t('common.inPerson')}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#2D3A3A]">{t('dashboard.appointments.scheduleModal.notes')}</Label>
              <Textarea
                rows={3}
                className="resize-none text-xs rounded-lg border-[#E2E0D6] bg-white text-[#2D3A3A] p-2.5"
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                placeholder={t('dashboard.appointments.scheduleModal.notesPlaceholder') || "Any special notes or preparation required for this session..."}
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-[#E2E0D6]">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#588B8B] hover:bg-[#3D6363] text-white rounded-lg px-5 text-xs font-semibold cursor-pointer"
            >
              {submitting ? t('dashboard.appointments.scheduleModal.submitting') : t('dashboard.appointments.scheduleModal.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
