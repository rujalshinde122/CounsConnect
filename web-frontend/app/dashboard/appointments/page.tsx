import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Video, MapPin, CalendarPlus } from 'lucide-react'
import AppointmentActions from './AppointmentActions'

export const metadata: Metadata = { title: 'Appointments | CounsConnect' }

const STATUS_CLASSES: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  completed: 'bg-[#EDF4F2] text-[#263F3F] border-[#588B8B]/30',
  cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
}

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('counselor_id', user.id)
    .order('start_time', { ascending: false })

  // Group by date
  const grouped: Record<string, typeof appointments> = {}
  for (const appt of appointments ?? []) {
    const date = new Date(appt.start_time).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    if (!grouped[date]) grouped[date] = []
    grouped[date]!.push(appt)
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2D3A3A] tracking-tight">Schedule</h2>
          <p className="text-xs text-[#5A6B6B] mt-0.5">Your upcoming and past sessions</p>
        </div>
        <Link
          href="/dashboard/appointments/new"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          <span>New Appointment</span>
        </Link>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E0D6] p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-[#2D3A3A]">No appointments yet</p>
          <p className="text-xs text-[#5A6B6B] max-w-sm mx-auto">
            Appointments booked by patients or scheduled by you will appear here.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/appointments/new"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-semibold transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([date, appts]) => (
          <div key={date} className="space-y-2.5">
            <p className="text-xs font-bold text-[#5A6B6B] uppercase tracking-wide">{date}</p>

            <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs overflow-hidden">
              <div className="divide-y divide-[#E2E0D6]/60">
                {appts!.map((appt) => {
                  const statusCls = STATUS_CLASSES[appt.status] || STATUS_CLASSES.pending

                  return (
                    <div
                      key={appt.id}
                      className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[#F6F5EE]/40 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="font-mono text-xs font-semibold text-[#5A6B6B] w-16 shrink-0">
                          {new Date(appt.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <div className="min-w-0">
                          <p className="font-semibold text-[#2D3A3A] text-xs leading-tight">Patient Session</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#5A6B6B]">
                            {appt.location === 'video' ? (
                              <span className="flex items-center gap-1">
                                <Video className="w-3 h-3 text-[#588B8B]" /> Online Video
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#FF8A65]" /> In-Person
                              </span>
                            )}
                            {appt.notes && (
                              <span className="text-[#889898] truncate max-w-[240px]">
                                • {appt.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded border capitalize font-medium ${statusCls}`}>
                          {appt.status}
                        </span>

                        {['pending', 'confirmed'].includes(appt.status) && (
                          <AppointmentActions appointmentId={appt.id} />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
