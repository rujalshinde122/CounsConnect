import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { Client, Profile, Appointment, SessionNote, Task } from '@/lib/types'
import SessionsTimelineView from '@/components/patient/SessionsTimelineView'

export const metadata: Metadata = {
  title: 'Sessions Timeline | CounsConnect',
  description: 'Chronological timeline of counseling sessions, notes, and tasks',
}

export default async function PatientSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch client record
  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!clientData) {
    redirect('/patient/onboarding')
  }

  const client = clientData as Client

  // 2. Fetch counselor profile
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

  // 3. Fetch appointments
  const { data: appointmentsData } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', client.id)
    .order('start_time', { ascending: true })

  const appointments = (appointmentsData as Appointment[]) || []

  // 4. Fetch session notes
  const { data: sessionNotesData } = await supabase
    .from('session_notes')
    .select('*')
    .eq('client_id', client.id)
    .order('session_date', { ascending: false })

  const sessionNotes = (sessionNotesData as SessionNote[]) || []

  // 5. Fetch tasks
  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('patient_id', client.id)
    .order('created_at', { ascending: false })

  const tasks = (tasksData as Task[]) || []

  return (
    <SessionsTimelineView
      client={client}
      counselor={counselor}
      appointments={appointments}
      sessionNotes={sessionNotes}
      tasks={tasks}
    />
  )
}
