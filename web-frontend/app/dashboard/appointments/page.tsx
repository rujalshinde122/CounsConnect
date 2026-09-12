import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import AppointmentsView from '@/components/dashboard/AppointmentsView'

export const metadata: Metadata = { title: 'Appointments | CounsConnect' }

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: appointments },
    { data: patients },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(name, email)
      `)
      .eq('counselor_id', user.id)
      .order('start_time', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, name, email, role'),
  ])

  return <AppointmentsView appointments={appointments as any} patients={patients as any} />
}
