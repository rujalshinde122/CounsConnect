'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { UserPlus, Search, Users, X, ChevronRight } from 'lucide-react'
import type { Client } from '@/lib/types'
import { useLanguage } from '@/context/LanguageContext'

interface ClientsViewProps {
  clients: Pick<Client, 'id' | 'name' | 'age' | 'gender' | 'issues' | 'status' | 'created_at'>[] | null
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  Inactive: 'bg-[#F6F5EE] text-[#5A6B6B] border-[#E2E0D6]',
  'On Hold': 'bg-amber-50 text-amber-800 border-amber-200/80',
}

const AVATAR_COLORS = [
  'bg-emerald-100 text-emerald-800',
  'bg-teal-100 text-teal-800',
  'bg-cyan-100 text-cyan-800',
  'bg-amber-100 text-amber-800',
  'bg-purple-100 text-purple-800',
]

export default function ClientsView({ clients }: ClientsViewProps) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  const counts = useMemo(() => {
    const list = clients ?? []
    return {
      all: list.length,
      active: list.filter((c) => c.status === 'Active').length,
      onHold: list.filter((c) => c.status === 'On Hold').length,
      inactive: list.filter((c) => c.status === 'Inactive').length,
    }
  }, [clients])

  const filteredClients = (clients ?? []).filter((client) => {
    const matchesStatus = statusFilter === 'All' || client.status === statusFilter
    if (!matchesStatus) return false

    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      client.name.toLowerCase().includes(term) ||
      (client.issues && client.issues.some((i) => i.toLowerCase().includes(term)))
    )
  })

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2D3A3A] tracking-tight flex items-center gap-2.5">
            <span>{t('dashboard.clients.title')}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#588B8B]/10 text-[#588B8B] border border-[#588B8B]/20">
              {clients?.length ?? 0}
            </span>
          </h1>
          <p className="text-xs text-[#5A6B6B] mt-0.5">
            {t('dashboard.clients.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#588B8B] to-[#457070] hover:from-[#457070] hover:to-[#365959] text-white text-xs font-bold shadow-xs hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('dashboard.clients.newClientButton')}</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E0D6] p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'All', label: 'All', count: counts.all },
            { key: 'Active', label: t('common.status.active'), count: counts.active },
            { key: 'On Hold', label: t('common.status.onHold'), count: counts.onHold },
            { key: 'Inactive', label: t('common.status.inactive'), count: counts.inactive },
          ].map((tab) => {
            const isSelected = statusFilter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#588B8B] text-white shadow-2xs'
                    : 'bg-[#F6F5EE] text-[#5A6B6B] hover:bg-[#EFEFE8] hover:text-[#2D3A3A]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#E2E0D6] text-[#5A6B6B]'}`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#889898] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('dashboard.clients.searchPlaceholder')}
            className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-[#E2E0D6] bg-[#F6F5EE]/50 focus:bg-white text-xs text-[#2D3A3A] placeholder-[#889898] focus:outline-none focus:ring-1 focus:ring-[#588B8B] transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#889898] hover:text-[#2D3A3A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Roster Table or Empty State */}
      {!clients || clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E0D6] p-16 text-center space-y-3.5 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#F6F5EE] border border-[#E2E0D6] flex items-center justify-center mx-auto text-[#588B8B]">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#2D3A3A]">{t('dashboard.clients.emptyTitle')}</h3>
          <p className="text-xs text-[#5A6B6B] max-w-sm mx-auto">
            {t('dashboard.clients.emptySubtitle')}
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-bold transition-all shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('dashboard.clients.addFirstClient')}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E0D6] shadow-xs overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_90px_110px_130px_40px] gap-4 px-6 py-3.5 bg-[#F6F5EE]/60 border-b border-[#E2E0D6] text-xs font-bold text-[#5A6B6B] uppercase tracking-wider">
            <span>{t('dashboard.clients.table.name')}</span>
            <span>{t('dashboard.clients.table.age')}</span>
            <span>{t('dashboard.clients.table.gender')}</span>
            <span className="text-right">{t('dashboard.clients.table.status')}</span>
            <span />
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#E2E0D6]/60">
            {filteredClients.map((client, idx) => {
              const statusCls = STATUS_STYLES[client.status] || STATUS_STYLES.Active
              const statusKey = client.status === 'Active' ? 'active' : client.status === 'Inactive' ? 'inactive' : 'onHold'
              const statusLabel = t(`common.status.${statusKey}`) || client.status
              const initials = client.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]

              return (
                <Link
                  key={client.id}
                  href={`/dashboard/clients/${client.id}`}
                  className="grid grid-cols-[1fr_90px_110px_130px_40px] gap-4 px-6 py-4 items-center hover:bg-[#F6F5EE]/40 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor}`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2D3A3A] group-hover:text-[#588B8B] transition-colors truncate">
                        {client.name}
                      </p>
                      {client.issues?.length > 0 && (
                        <p className="text-xs text-[#5A6B6B] mt-0.5 truncate">
                          {client.issues.slice(0, 3).join(', ')}{client.issues.length > 3 ? ` +${client.issues.length - 3}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-[#5A6B6B] font-medium">
                    {client.age} {t('common.yrs')}
                  </span>
                  <span className="text-xs text-[#5A6B6B] font-medium">{client.gender}</span>

                  <div className="text-right">
                    <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full border font-semibold tracking-wide ${statusCls}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <ChevronRight className="w-4 h-4 text-[#889898] group-hover:text-[#588B8B] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              )
            })}
            {filteredClients.length === 0 && (
              <div className="p-12 text-center text-xs text-[#5A6B6B] space-y-1">
                <p className="font-semibold text-[#2D3A3A]">No matching clients found</p>
                <p className="text-[11px] text-[#889898]">Try changing your search query or status filter</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
