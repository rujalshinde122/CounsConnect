'use client'

import { Clock } from 'lucide-react'

export default function SessionInfoCard() {
  const offlineSlots = ['11:00 AM', '12:30 PM', '2:00 PM', '3:30 PM']
  const onlineSlots = ['8:00 AM', '8:00 PM']

  return (
    <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs overflow-hidden h-full flex flex-col justify-between">
      <div className="px-6 py-4 border-b border-[#E2E0D6] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#2D3A3A]">Practice Availability</h2>
          <p className="text-xs text-[#5A6B6B] mt-0.5">Regular consultation time slots</p>
        </div>
        <Clock className="w-4 h-4 text-[#588B8B]" />
      </div>

      <div className="p-6 space-y-4 text-xs flex-1">
        {/* Offline Slots */}
        <div>
          <p className="font-semibold text-[#5A6B6B] mb-2 uppercase tracking-wide text-[11px]">
            Offline In-Person (Mon–Fri)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {offlineSlots.map((slot) => (
              <span
                key={slot}
                className="font-mono bg-[#F6F5EE] border border-[#E2E0D6] text-[#2D3A3A] px-2.5 py-1 rounded-md text-xs font-medium"
              >
                {slot}
              </span>
            ))}
          </div>
        </div>

        {/* Online Slots */}
        <div className="pt-3 border-t border-[#E2E0D6]/60">
          <p className="font-semibold text-[#5A6B6B] mb-2 uppercase tracking-wide text-[11px]">
            Online Video (Mon–Fri)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {onlineSlots.map((slot) => (
              <span
                key={slot}
                className="font-mono bg-[#EDF4F2] border border-[#588B8B]/20 text-[#263F3F] px-2.5 py-1 rounded-md text-xs font-medium"
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
