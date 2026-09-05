'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserPlus } from 'lucide-react'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Overview', subtitle: 'Practice summary and today’s sessions' },
  '/dashboard/clients': { title: 'Clients', subtitle: 'Client roster and clinical intake profiles' },
  '/dashboard/clients/new': { title: 'New Client', subtitle: 'Intake registration form' },
  '/dashboard/appointments': { title: 'Appointments', subtitle: 'Scheduled counseling sessions' },
  '/dashboard/tasks': { title: 'Tasks', subtitle: 'Patient exercises and homework assignments' },
  '/dashboard/settings': { title: 'Settings', subtitle: 'Account preferences and security' },
}

interface DashboardNavbarProps {
  displayName: string
  initials: string
  role?: string
}

export default function DashboardNavbar({ displayName, initials }: DashboardNavbarProps) {
  const pathname = usePathname()

  const current =
    pageTitles[pathname] ||
    Object.entries(pageTitles)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([key]) => pathname.startsWith(key))?.[1] ||
    { title: 'Dashboard', subtitle: '' }

  return (
    <header className="sticky top-0 z-20 w-full h-16 px-8 bg-[#F6F5EE]/95 backdrop-blur-xs border-b border-[#E2E0D6] flex items-center shrink-0">
      <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Page Title & Context */}
        <div>
          <h1 className="text-base font-bold text-[#2D3A3A] tracking-tight leading-tight">
            {current.title}
          </h1>
          {current.subtitle && (
            <p className="text-xs text-[#5A6B6B] hidden sm:block leading-tight mt-0.5">
              {current.subtitle}
            </p>
          )}
        </div>

        {/* Right: Purposeful Action */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Client</span>
          </Link>
        </div>

      </div>
    </header>
  )
}
