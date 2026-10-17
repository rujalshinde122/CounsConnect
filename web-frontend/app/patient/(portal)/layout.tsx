import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PatientSidebar from '@/components/PatientSidebar'

export default async function PatientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role || user.user_metadata?.role || 'patient'
  if (role !== 'patient') {
    redirect('/dashboard')
  }

  // Check if patient has completed the intake profile
  const { data: client } = await supabase
    .from('clients')
    .select('id, name')
    .eq('user_id', user.id)
    .maybeSingle()

  // Gate: MUST complete profile/intake before accessing the patient homepage
  if (!client) {
    redirect('/patient/onboarding')
  }

  const displayName = client.name || user.user_metadata?.name || 'Patient'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Fetch appointments that require patient attention (rescheduled by counselor awaiting confirmation, or recently declined)
  const { data: clientAppts } = await supabase
    .from('appointments')
    .select('id, status, start_time, end_time, rescheduled_by_counselor, declined_by, patient_notified, notes')
    .eq('patient_id', client.id)

  const now = new Date()

  const timelineBadgeCount = (clientAppts || []).filter(a => {
    // If appointment is already completed or its scheduled date/time has passed, it is done — decrement/exclude!
    const apptDate = new Date(a.end_time || a.start_time)
    if (a.status === 'completed' || apptDate < now) {
      return false
    }

    const isRescheduled = a.status === 'pending' && (a.rescheduled_by_counselor === true || (a.notes && a.notes.includes('[Counselor Proposed Slot]')))
    const isDeclined = a.status === 'cancelled' && (a.declined_by === 'counselor' || !a.patient_notified)
    return isRescheduled || isDeclined
  }).length

  return (
    <div className="flex h-screen bg-[#F6F5EE] overflow-hidden">
      <PatientSidebar
        displayName={displayName}
        initials={initials}
        role="Patient"
        timelineBadgeCount={timelineBadgeCount}
      />
      <main className="flex-1 overflow-y-auto px-8 py-8 sm:px-10 sm:py-10 bg-[#F6F5EE]">
        {children}
      </main>
    </div>
  )
}
