import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import TasksView from '@/components/dashboard/TasksView'

export const metadata: Metadata = { title: 'Tasks | CounsConnect' }

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: tasks },
    { data: patients },
  ] = await Promise.all([
    supabase
      .from('tasks')
      .select(`
        *,
        patient:profiles!tasks_patient_id_fkey(name, email)
      `)
      .eq('counselor_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, name, email, role'),
  ])

  return <TasksView tasks={tasks as any} patients={patients as any} />
}
