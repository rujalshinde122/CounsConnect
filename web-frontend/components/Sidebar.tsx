'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckSquare,
  Settings,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
]

interface SidebarProps {
  displayName: string
  initials: string
  role: string
}

export default function Sidebar({ displayName, initials, role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname.startsWith(href)

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-[#F6F5EE] border-r border-[#E2E0D6] h-screen select-none">
      
      {/* Brand Header — Fixed h-16 to align border-b perfectly with DashboardNavbar */}
      <div className="h-16 px-6 border-b border-[#E2E0D6] flex items-center shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#588B8B] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-2xs">
            C
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-[#2D3A3A] block leading-tight">
              CounsConnect
            </span>
            <p className="text-[11px] text-[#5A6B6B] leading-tight">
              Practice Workspace
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors',
                active
                  ? 'bg-white text-[#2D3A3A] font-semibold border border-[#E2E0D6] shadow-2xs'
                  : 'text-[#5A6B6B] hover:text-[#2D3A3A] hover:bg-white/50'
              )}
            >
              <Icon className={cn('w-4 h-4', active ? 'text-[#588B8B]' : 'text-[#889898]')} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>

      {/* Footer / User Profile & Settings */}
      <div className="p-3 border-t border-[#E2E0D6] space-y-1">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
            pathname.startsWith('/dashboard/settings')
              ? 'bg-white text-[#2D3A3A] font-semibold border border-[#E2E0D6] shadow-2xs'
              : 'text-[#5A6B6B] hover:text-[#2D3A3A] hover:bg-white/50'
          )}
        >
          <Settings className="w-4 h-4 text-[#889898]" />
          <span>Settings</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#5A6B6B] hover:text-[#EF4444] hover:bg-rose-50/50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-[#889898]" />
          <span>Sign out</span>
        </button>

        {/* User Badge */}
        <div className="pt-2 border-t border-[#E2E0D6] flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-md bg-[#588B8B] text-white flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#2D3A3A] truncate leading-tight">{displayName}</p>
            <p className="text-[10px] text-[#5A6B6B] capitalize leading-tight">{role}</p>
          </div>
        </div>
      </div>

    </aside>
  )
}
