import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { Client, Appointment, Task, Profile } from '@/lib/types'
import OverviewClient from '@/components/patient/OverviewClient'

export const metadata: Metadata = {
  title: 'Client Overview | CounsConnect',
  description: 'Your confidential therapy and wellness workspace',
}

export default async function PatientHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch patient's client record
  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!clientData) {
    redirect('/patient/onboarding')
  }

  const client = clientData as Client

  // 2. Fetch assigned counselor profile
  const { data: counselorData } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('id', client.counselor_id)
    .maybeSingle()

  const counselor = (counselorData as Profile) || {
    id: client.counselor_id,
    name: 'Test Counsellor',
    email: 'counselor@gmail.com',
  }

  // 3. Fetch appointments (including pending, confirmed, and recently declined)
  const { data: appointmentsData } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', client.id)
    .order('start_time', { ascending: false })

  const appointments = (appointmentsData as Appointment[]) || []

  // 4. Fetch assigned tasks
  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('patient_id', client.id)
    .order('created_at', { ascending: false })

  const tasks = (tasksData as Task[]) || []

  return (
    <OverviewClient
      client={client}
      counselor={counselor}
      appointments={appointments}
      tasks={tasks}
    />
  )
}
