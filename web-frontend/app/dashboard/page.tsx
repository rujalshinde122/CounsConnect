import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { Client, Task } from '@/lib/types'
import PracticeStats from '@/components/dashboard/PracticeStats'
import TodaySchedule from '@/components/dashboard/TodaySchedule'
import SessionInfoCard from '@/components/dashboard/SessionInfoCard'
import PendingTasksCard from '@/components/dashboard/PendingTasksCard'
import RecentClientsCard from '@/components/dashboard/RecentClientsCard'
import DashboardGreeting from '@/components/dashboard/DashboardGreeting'

export const metadata: Metadata = { title: 'Overview | CounsConnect' }

function getDateRanges() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  return { todayStart, todayEnd, weekAgo }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { todayStart, todayEnd, weekAgo } = getDateRanges()

  const [
    { data: todayAppts },
    { count: totalClients },
    { count: newClients },
    { data: pendingTasks },
    { data: recentClients },
    { data: profile },
  ] = await Promise.all([
    supabase.from('appointments')
      .select('*, patient:profiles!appointments_patient_id_fkey(name, email)')
      .eq('counselor_id', user.id)
      .gte('start_time', todayStart).lte('start_time', todayEnd).order('start_time'),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('counselor_id', user.id),
    supabase.from('clients').select('*', { count: 'exact', head: true })
      .eq('counselor_id', user.id).gte('created_at', weekAgo),
    supabase.from('tasks').select('id, title, deadline, status, patient:profiles!tasks_patient_id_fkey(name, email)')
      .eq('counselor_id', user.id).eq('status', 'pending').limit(5),
    supabase.from('clients').select('id, name, age, gender, issues, status, created_at')
      .eq('counselor_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('name, role').eq('id', user.id).single(),
  ])

  const displayName = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Counselor'

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      
      {/* Welcome Header */}
      <DashboardGreeting displayName={displayName} />

      {/* Practice Metric Stats (4 Cards) */}
      <PracticeStats
        todaySessionsCount={todayAppts?.length ?? 0}
        totalClientsCount={totalClients ?? 0}
        newClientsThisWeekCount={newClients ?? 0}
        pendingTasksCount={pendingTasks?.length ?? 0}
      />

      {/* Main Row: Today's Schedule (8 cols) + Session Info & Slots (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <TodaySchedule todayAppts={todayAppts} />
        </div>
        <div className="lg:col-span-4">
          <SessionInfoCard />
        </div>
      </div>

      {/* Secondary Row: Recent Clients (6 cols) + Pending Tasks (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentClientsCard recentClients={recentClients as unknown as Client[]} />
        <PendingTasksCard pendingTasks={pendingTasks as unknown as Task[]} />
      </div>

    </div>
  )
}
