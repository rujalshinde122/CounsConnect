'use client'

import Link from 'next/link'
import { Users, ChevronRight } from 'lucide-react'
import type { Client } from '@/lib/types'
import { useLanguage } from '@/context/LanguageContext'

interface RecentClientsCardProps {
  recentClients?: Client[] | null
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50/90 text-emerald-800 border-emerald-200/80',
  Inactive: 'bg-[#F6F5EE] text-[#5A6B6B] border-[#E2E0D6]',
  'On Hold': 'bg-amber-50/90 text-amber-800 border-amber-200/80',
}

const AVATAR_COLORS = [
  'bg-emerald-100 text-emerald-800',
  'bg-teal-100 text-teal-800',
  'bg-cyan-100 text-cyan-800',
  'bg-amber-100 text-amber-800',
  'bg-purple-100 text-purple-800',
]

export default function RecentClientsCard({ recentClients }: RecentClientsCardProps) {
  const { t } = useLanguage()
  const hasClients = recentClients && recentClients.length > 0

  return (
    <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-xs overflow-hidden h-full flex flex-col justify-between">
      {/* Header */}
      <div className="px-6 py-4.5 border-b border-[#E2E0D6]/80 flex items-center justify-between bg-gradient-to-r from-white to-[#F6F5EE]/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#588B8B]/10 text-[#588B8B] flex items-center justify-center shadow-2xs">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#2D3A3A] tracking-tight">
              {t('dashboard.overview.recentClients.title')}
            </h2>
            <p className="text-xs text-[#5A6B6B] mt-0.5">
              {t('dashboard.overview.recentClients.subtitle')}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/clients"
          className="text-xs font-semibold text-[#588B8B] hover:text-[#3D6363] hover:underline underline-offset-4 flex items-center gap-1 transition-colors"
        >
          <span>{t('common.viewAll')}</span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1">
        {!hasClients ? (
          <div className="py-12 px-6 text-center space-y-2">
            <p className="text-xs text-[#5A6B6B]">{t('dashboard.overview.recentClients.empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E0D6]/60">
            {recentClients.slice(0, 5).map((client, idx) => {
              const statusCls = STATUS_STYLES[client.status] || STATUS_STYLES.Active
              const statusKey = client.status === 'Active' ? 'active' : client.status === 'Inactive' ? 'inactive' : 'onHold'
              const statusLabel = t(`common.status.${statusKey}`) || client.status
              const initials = client.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]

              return (
                <Link
                  key={client.id}
                  href={`/dashboard/clients/${client.id}`}
                  className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[#F6F5EE]/40 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor}`}>
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2D3A3A] group-hover:text-[#588B8B] transition-colors truncate">
                        {client.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#5A6B6B]">
                        <span>{client.age} {t('common.yrs')}</span>
                        <span>•</span>
                        <span>{client.gender}</span>
                        {client.issues?.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-[#588B8B] truncate max-w-[140px] font-medium">
                              {client.issues.slice(0, 2).join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold tracking-wide ${statusCls}`}>
                      {statusLabel}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#889898] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
