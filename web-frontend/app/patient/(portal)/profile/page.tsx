import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { Client, Profile } from '@/lib/types'
import ProfileView from '@/components/patient/ProfileView'

export const metadata: Metadata = {
  title: 'Profile | CounsConnect',
  description: 'Personal profile, intake details, and SWOT analysis',
}

export default async function PatientProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!clientData) {
    redirect('/patient/onboarding')
  }

  const client = clientData as Client

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

  return <ProfileView client={client} counselor={counselor} />
}
