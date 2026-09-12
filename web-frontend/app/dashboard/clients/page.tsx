import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import ClientsView from '@/components/dashboard/ClientsView'

export const metadata: Metadata = { title: 'Clients | CounsConnect' }

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, age, gender, issues, status, created_at')
    .eq('counselor_id', user.id)
    .order('created_at', { ascending: false })

  return <ClientsView clients={clients as any} />
}
