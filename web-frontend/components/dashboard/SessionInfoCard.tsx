'use client'

import { useState } from 'react'
import { Clock, Sun, Moon, Sparkles, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export default function SessionInfoCard() {
  const { t } = useLanguage()
  const [selectedDay, setSelectedDay] = useState('Mon')

  const offlineSlots = ['11:00 AM', '12:30 PM', '2:00 PM', '3:30 PM']
  const onlineSlots = ['8:00 AM', '6:30 PM', '8:00 PM']

  return (
    <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-xs overflow-hidden h-full flex flex-col justify-between">
      {/* Header */}
      <div className="px-6 py-4.5 border-b border-[#E2E0D6]/80 flex items-center justify-between bg-gradient-to-r from-white to-[#F6F5EE]/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#588B8B]/10 text-[#588B8B] flex items-center justify-center shadow-2xs">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#2D3A3A] tracking-tight">
              {t('dashboard.overview.availability.title')}
            </h2>
            <p className="text-xs text-[#5A6B6B] mt-0.5">
              {t('dashboard.overview.availability.subtitle')}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          <CheckCircle2 className="w-3 h-3" />
          <span>Open</span>
        </span>
      </div>

      {/* Day Selector Pills */}
      <div className="px-6 pt-4 pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-[#F6F5EE] rounded-xl border border-[#E2E0D6]/70">
          {DAYS.map((day) => {
            const isSelected = day === selectedDay
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#2D3A3A] shadow-xs'
                    : 'text-[#5A6B6B] hover:text-[#2D3A3A] hover:bg-white/50'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Slots Content */}
      <div className="p-6 space-y-4 text-xs flex-1">
        {/* Offline In-Person */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Sun className="w-3.5 h-3.5 text-[#D97706]" />
            <p className="font-bold text-[#5A6B6B] uppercase tracking-wider text-[10px]">
              {t('dashboard.overview.availability.offlineSlots')}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {offlineSlots.map((slot) => (
              <span
                key={slot}
                className="font-mono bg-[#F6F5EE] hover:bg-[#EFEFE8] border border-[#E2E0D6] text-[#2D3A3A] px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-default shadow-2xs"
              >
                {slot}
              </span>
            ))}
          </div>
        </div>

        {/* Online Video */}
        <div className="pt-3 border-t border-[#E2E0D6]/60">
          <div className="flex items-center gap-1.5 mb-2">
            <Moon className="w-3.5 h-3.5 text-[#588B8B]" />
            <p className="font-bold text-[#5A6B6B] uppercase tracking-wider text-[10px]">
              {t('dashboard.overview.availability.onlineSlots')}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {onlineSlots.map((slot) => (
              <span
                key={slot}
                className="font-mono bg-[#EDF4F2] hover:bg-[#DDEAE7] border border-[#588B8B]/25 text-[#263F3F] px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-default shadow-2xs"
              >
                {slot}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
