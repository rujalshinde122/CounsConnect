'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckSquare,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', labelKey: 'nav.overview', icon: LayoutDashboard },
  { href: '/dashboard/clients', labelKey: 'nav.clients', icon: Users },
  { href: '/dashboard/appointments', labelKey: 'nav.appointments', icon: CalendarDays },
  { href: '/dashboard/tasks', labelKey: 'nav.tasks', icon: CheckSquare },
]

interface SidebarProps {
  displayName: string
  initials: string
  role: string
}

export default function Sidebar({ displayName, initials, role }: SidebarProps) {
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
    href === '/dashboard'
      ? pathname === href
      : pathname.startsWith(href)

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-[#F6F5EE] border-r border-[#E2E0D6] h-screen select-none relative z-10">
      
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-[#E2E0D6]/80 flex items-center shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#588B8B] to-[#3D6363] text-white flex items-center justify-center font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform duration-200">
            C
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-[#2D3A3A] block leading-tight">
                {t('common.appName')}
              </span>
              <span className="text-[#84CC16] text-[10px]">✳</span>
            </div>
            <p className="text-[11px] text-[#5A6B6B] font-medium leading-tight mt-0.5">
              {t('common.practiceWorkspace')}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3.5 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-2.5 pb-1 text-[10px] font-bold text-[#889898] uppercase tracking-wider">
          Practice Menu
        </div>
        {navItems.map(({ href, labelKey, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150',
                active
                  ? 'bg-white text-[#2D3A3A] font-bold border border-[#E2E0D6] shadow-2xs'
                  : 'text-[#5A6B6B] hover:text-[#2D3A3A] hover:bg-white/60'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#588B8B] rounded-r-full" />
              )}
              <Icon
                className={cn(
                  'w-4 h-4 transition-transform duration-150 group-hover:scale-110',
                  active ? 'text-[#588B8B]' : 'text-[#889898]'
                )}
              />
              <span className="truncate">{t(labelKey)}</span>
            </Link>
          )
        })}
      </div>

      {/* User & Settings Footer */}
      <div className="p-3.5 border-t border-[#E2E0D6]/80 space-y-1 bg-[#F6F5EE]/60">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
            pathname.startsWith('/dashboard/settings')
              ? 'bg-white text-[#2D3A3A] font-bold border border-[#E2E0D6] shadow-2xs'
              : 'text-[#5A6B6B] hover:text-[#2D3A3A] hover:bg-white/60'
          )}
        >
          <Settings className="w-4 h-4 text-[#889898]" />
          <span>{t('nav.settings')}</span>
        </Link>

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
            <p className="text-[10px] text-[#5A6B6B] capitalize leading-tight mt-0.5">{role}</p>
          </div>
        </div>
      </div>

    </aside>
  )
}
