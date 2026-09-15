import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { Appointment } from '@/lib/types'
import AppointmentsView from '@/components/dashboard/AppointmentsView'

export const metadata: Metadata = { title: 'Appointments | CounsConnect' }

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:clients!appointments_patient_id_fkey(name)
    `)
    .eq('counselor_id', user.id)
    .order('start_time', { ascending: false })

  return <AppointmentsView appointments={appointments as unknown as Appointment[]} />
}
