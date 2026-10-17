import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { Task, Client } from '@/lib/types'
import PatientTasksView from '@/components/patient/PatientTasksView'

export const metadata: Metadata = {
  title: 'Tasks & Homework | CounsConnect',
  description: 'Manage and update your therapy homework and behavioral exercises',
}

export default async function PatientTasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: clientData } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!clientData) {
    redirect('/patient/onboarding')
  }

  const client = clientData as Pick<Client, 'id'>

  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('patient_id', client.id)
    .order('created_at', { ascending: false })

  const tasks = (tasksData as Task[]) || []

  return <PatientTasksView tasks={tasks} />
}
