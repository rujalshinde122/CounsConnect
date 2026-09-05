import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import SettingsForm from './SettingsForm'

export const metadata: Metadata = { title: 'Settings | CounsConnect' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, phone, place_of_stay, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#2D3A3A] tracking-tight">Settings</h2>
        <p className="text-xs text-[#5A6B6B] mt-0.5">Manage your profile and password</p>
      </div>

      <SettingsForm
        userId={user.id}
        initialName={profile?.name ?? ''}
        initialPhone={profile?.phone ?? ''}
        initialPlaceOfStay={profile?.place_of_stay ?? ''}
        email={user.email ?? ''}
        role={profile?.role ?? 'counselor'}
      />
    </div>
  )
}
