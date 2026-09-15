import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { Client, Task } from '@/lib/types'
import PracticeStats from '@/components/dashboard/PracticeStats'
import TodaySchedule from '@/components/dashboard/TodaySchedule'
import PendingTasksCard from '@/components/dashboard/PendingTasksCard'
import RecentClientsCard from '@/components/dashboard/RecentClientsCard'

export const metadata: Metadata = { title: 'Overview | CounsConnect' }

function getDateRanges() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  return { todayStart, todayEnd, weekAgo }
}

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
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
    supabase.from('appointments').select('*').eq('counselor_id', user.id)
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
      <div>
        <h1 className="text-2xl font-bold text-[#2D3A3A] tracking-tight">
          Good {getGreeting()}, {displayName}
        </h1>
        <p className="text-xs text-[#5A6B6B] mt-0.5">
          Manage your counseling sessions, client records, and practice schedule.
        </p>
      </div>

      {/* Practice Metric Stats (4 Cards) */}
      <PracticeStats
        todaySessionsCount={todayAppts?.length ?? 0}
        totalClientsCount={totalClients ?? 0}
        newClientsThisWeekCount={newClients ?? 0}
        pendingTasksCount={pendingTasks?.length ?? 0}
      />

      {/* Main Row: Today's Schedule */}
      <TodaySchedule todayAppts={todayAppts} />

      {/* Secondary Row: Recent Clients (6 cols) + Pending Tasks (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentClientsCard recentClients={recentClients as unknown as Client[]} />
        <PendingTasksCard pendingTasks={pendingTasks as unknown as Task[]} />
      </div>

    </div>
  )
}
