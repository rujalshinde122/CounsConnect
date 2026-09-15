'use client'

import LanguageSwitcher from './LanguageSwitcher'

interface DashboardNavbarProps {
  displayName?: string
  initials?: string
  role?: string
}

export default function DashboardNavbar({}: DashboardNavbarProps = {}) {
  return (
    <header className="sticky top-0 z-20 w-full h-14 px-6 sm:px-8 bg-[#F6F5EE]/95 backdrop-blur-xs border-b border-[#E2E0D6] flex items-center justify-end shrink-0">
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
      </div>
    </header>
  )
}

