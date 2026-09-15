import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Double-check — middleware should have already redirected, but belt-and-suspenders
  if (!user) redirect('/login')

  // Fetch counselor profile for sidebar display
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, role')
    .eq('id', user.id)
    .single()

  const displayName = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Counselor'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex h-screen bg-[#F6F5EE] overflow-hidden">
      <Sidebar displayName={displayName} initials={initials} role={profile?.role ?? 'counselor'} />
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#F6F5EE]">
        {children}
      </main>
    </div>
  )
}
