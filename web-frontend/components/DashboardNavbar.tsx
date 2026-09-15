'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserPlus, CalendarPlus, CheckSquare } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'

const pageKeys: Record<string, { titleKey: string; subtitleKey: string }> = {
  '/dashboard': { titleKey: 'nav.overview', subtitleKey: 'nav.subtitles.overview' },
  '/dashboard/clients': { titleKey: 'nav.clients', subtitleKey: 'nav.subtitles.clients' },
  '/dashboard/clients/new': { titleKey: 'common.newClient', subtitleKey: 'nav.subtitles.newClient' },
  '/dashboard/appointments': { titleKey: 'nav.appointments', subtitleKey: 'nav.subtitles.appointments' },
  '/dashboard/appointments/new': { titleKey: 'dashboard.appointments.scheduleModal.title', subtitleKey: 'dashboard.appointments.scheduleModal.subtitle' },
  '/dashboard/tasks': { titleKey: 'nav.tasks', subtitleKey: 'nav.subtitles.tasks' },
  '/dashboard/tasks/new': { titleKey: 'dashboard.tasks.createModal.title', subtitleKey: 'dashboard.tasks.createModal.subtitle' },
  '/dashboard/settings': { titleKey: 'nav.settings', subtitleKey: 'nav.subtitles.settings' },
}

interface DashboardNavbarProps {
  displayName?: string
  initials?: string
  role?: string
}

export default function DashboardNavbar({
  displayName,
  initials,
  role = 'counselor',
}: DashboardNavbarProps = {}) {
  const pathname = usePathname()
  const { t } = useLanguage()

  const current =
    pageKeys[pathname] ||
    Object.entries(pageKeys)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([key]) => pathname.startsWith(key))?.[1] ||
    { titleKey: 'nav.overview', subtitleKey: 'nav.subtitles.overview' }

  return (
    <header className="sticky top-0 z-20 w-full h-16 px-6 sm:px-8 bg-[#F6F5EE]/85 backdrop-blur-md border-b border-[#E2E0D6]/80 flex items-center shrink-0 transition-all">
      <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Page Title & Context */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-[#2D3A3A] tracking-tight leading-tight flex items-center gap-2">
              <span>{t(current.titleKey)}</span>
            </h1>
            {current.subtitleKey && (
              <p className="text-xs text-[#5A6B6B] hidden sm:block leading-tight mt-0.5">
                {t(current.subtitleKey)}
              </p>
            )}
          </div>
        </div>

        {/* Right: Quick actions & Language */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Practice Status Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-emerald-800 text-[11px] font-medium select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Practice Active</span>
          </div>

          <LanguageSwitcher />

          {pathname.startsWith('/dashboard/appointments') ? (
            <Link
              href="/dashboard/appointments/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#588B8B] to-[#467272] hover:from-[#467272] hover:to-[#365959] text-white text-xs font-semibold shadow-xs hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shrink-0"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>{t('dashboard.appointments.scheduleButton')}</span>
            </Link>
          ) : pathname.startsWith('/dashboard/tasks') ? (
            <Link
              href="/dashboard/tasks/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#588B8B] to-[#467272] hover:from-[#467272] hover:to-[#365959] text-white text-xs font-semibold shadow-xs hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shrink-0"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{t('dashboard.tasks.assignTaskButton')}</span>
            </Link>
          ) : (
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#588B8B] to-[#467272] hover:from-[#467272] hover:to-[#365959] text-white text-xs font-semibold shadow-xs hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('common.newClient')}</span>
            </Link>
          )}

          {initials && (
            <div
              className="w-8 h-8 rounded-full bg-[#588B8B] text-white flex md:hidden items-center justify-center text-xs font-bold shrink-0"
              title={`${displayName || 'User'} (${role})`}
            >
              {initials}
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
