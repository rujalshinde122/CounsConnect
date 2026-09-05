'use client'

import Link from 'next/link'
import type { Client } from '@/lib/types'

interface RecentClientsCardProps {
  recentClients?: Client[] | null
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Inactive: 'bg-[#F6F5EE] text-[#5A6B6B] border-[#E2E0D6]',
  'On Hold': 'bg-amber-50 text-amber-800 border-amber-200',
}

export default function RecentClientsCard({ recentClients }: RecentClientsCardProps) {
  const hasClients = recentClients && recentClients.length > 0

  return (
    <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E2E0D6] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#2D3A3A]">Recent Clients</h2>
          <p className="text-xs text-[#5A6B6B] mt-0.5">Caseload snapshot</p>
        </div>

        <Link
          href="/dashboard/clients"
          className="text-xs font-semibold text-[#588B8B] hover:text-[#3D6363] hover:underline"
        >
          View all
        </Link>
      </div>

      {/* Content */}
      {!hasClients ? (
        <div className="py-10 px-6 text-center space-y-2">
          <p className="text-xs text-[#5A6B6B]">No clients registered yet</p>
        </div>
      ) : (
        <div className="divide-y divide-[#E2E0D6]/60">
          {recentClients.slice(0, 5).map((client) => {
            const statusCls = STATUS_STYLES[client.status] || STATUS_STYLES.Active

            return (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[#F6F5EE]/40 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#2D3A3A] group-hover:text-[#588B8B] transition-colors truncate">
                    {client.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-[#5A6B6B]">
                    <span>{client.age} yrs</span>
                    <span>•</span>
                    <span>{client.gender}</span>
                    {client.issues?.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-[#588B8B] truncate max-w-[160px]">
                          {client.issues.slice(0, 2).join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <span className={`text-xs px-2 py-0.5 rounded border font-medium shrink-0 ${statusCls}`}>
                  {client.status}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
