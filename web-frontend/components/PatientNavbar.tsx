'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LanguageSwitcher from './LanguageSwitcher'
import { LogOut, User, HeartHandshake } from 'lucide-react'

interface PatientNavbarProps {
  displayName: string
  initials: string
}

export default function PatientNavbar({ displayName, initials }: PatientNavbarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 w-full h-16 px-4 sm:px-8 bg-white/95 backdrop-blur-md border-b border-[#E2E0D6] flex items-center justify-between shrink-0 shadow-2xs">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <Link href="/patient" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#588B8B] to-[#3D6363] text-white flex items-center justify-center font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform duration-200">
            C
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-[#2D3A3A] block leading-tight">
              CounsConnect
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#588B8B] flex items-center gap-1">
              <HeartHandshake className="w-3 h-3" /> Patient Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        <LanguageSwitcher variant="navbar" />

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#E2E0D6]">
          <div className="w-8 h-8 rounded-full bg-[#EDF4F2] border border-[#588B8B]/40 flex items-center justify-center text-xs font-bold text-[#263F3F]">
            {initials || <User className="w-4 h-4 text-[#588B8B]" />}
          </div>
          <span className="text-xs font-semibold text-[#2D3A3A] hidden md:inline">
            {displayName}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#5A6B6B] hover:text-[#991B1B] hover:bg-rose-50 border border-[#E2E0D6] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
