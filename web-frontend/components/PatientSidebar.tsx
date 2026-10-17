'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import {
  LayoutDashboard,
  User,
  CalendarDays,
  CheckSquare,
  LogOut,
  HeartHandshake,
} from 'lucide-react'

const patientNavItems = [
  { href: '/patient', label: 'Overview', icon: LayoutDashboard },
  { href: '/patient/profile', label: 'Profile', icon: User },
  { href: '/patient/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/patient/sessions', label: 'Sessions Timeline', icon: CalendarDays, badgeKey: 'sessions' },
]

interface PatientSidebarProps {
  displayName: string
  initials: string
  role?: string
  timelineBadgeCount?: number
}

export default function PatientSidebar({
  displayName,
  initials,
  role = 'Patient',
  timelineBadgeCount = 0,
}: PatientSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    href === '/patient'
      ? pathname === href
      : pathname.startsWith(href)

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-[#F6F5EE] border-r border-[#E2E0D6] h-screen select-none relative z-10">
      
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-[#E2E0D6]/80 flex items-center shrink-0">
        <Link href="/patient" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#588B8B] to-[#3D6363] text-white flex items-center justify-center font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform duration-200">
            C
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-[#2D3A3A] block leading-tight">
              {t('common.appName')}
            </span>
            <p className="text-[11px] text-[#588B8B] font-semibold leading-tight mt-0.5 flex items-center gap-1">
              <HeartHandshake className="w-3 h-3" /> Patient Portal
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3.5 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-2.5 pb-1 text-[10px] font-bold text-[#889898] uppercase tracking-wider">
          Patient Menu
        </div>
        {patientNavItems.map(({ href, label, icon: Icon, badgeKey }) => {
          const active = isActive(href)
          const showBadge = badgeKey === 'sessions' && timelineBadgeCount > 0

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150',
                active
                  ? 'bg-white text-[#2D3A3A] font-bold border border-[#E2E0D6] shadow-2xs'
                  : 'text-[#5A6B6B] hover:text-[#2D3A3A] hover:bg-white/60'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#588B8B] rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform duration-150 group-hover:scale-110 shrink-0',
                    active ? 'text-[#588B8B]' : 'text-[#889898]'
                  )}
                />
                <span className="truncate">{label}</span>
              </div>

              {showBadge && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-extrabold text-white bg-amber-600 rounded-full shadow-2xs animate-pulse">
                  {timelineBadgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* User & Settings Footer */}
      <div className="p-3.5 border-t border-[#E2E0D6]/80 space-y-1 bg-[#F6F5EE]/60">
        <LanguageSwitcher variant="sidebar" />

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#5A6B6B] hover:text-[#EF4444] hover:bg-rose-50/70 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#889898]" />
          <span>{t('common.signOut')}</span>
        </button>

        {/* User Card */}
        <div className="pt-2.5 mt-1 border-t border-[#E2E0D6]/70 flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#588B8B] to-[#3D6363] text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0 ring-2 ring-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#2D3A3A] truncate leading-tight">{displayName}</p>
            <p className="text-[10px] text-[#588B8B] font-semibold capitalize leading-tight mt-0.5">{role}</p>
          </div>
        </div>
      </div>

    </aside>
  )
}
