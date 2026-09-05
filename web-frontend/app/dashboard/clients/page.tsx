import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { UserPlus } from 'lucide-react'
import type { Client } from '@/lib/types'

export const metadata: Metadata = { title: 'Clients | CounsConnect' }

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Inactive: 'bg-[#F6F5EE] text-[#5A6B6B] border-[#E2E0D6]',
  'On Hold': 'bg-amber-50 text-amber-800 border-amber-200',
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, age, gender, issues, status, created_at')
    .eq('counselor_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2D3A3A] tracking-tight">Clients</h2>
          <p className="text-xs text-[#5A6B6B] mt-0.5">
            {clients?.length ?? 0} total client{clients?.length !== 1 ? 's' : ''}
          </p>
        </div>

        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Client</span>
        </Link>
      </div>

      {!clients || clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E0D6] p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-[#2D3A3A]">No clients registered yet</p>
          <p className="text-xs text-[#5A6B6B] max-w-sm mx-auto">
            Add your first client to start managing notes, sessions, and task assignments.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#588B8B] hover:bg-[#3D6363] text-white text-xs font-semibold transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add First Client</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_80px_100px_120px] gap-4 px-6 py-3 bg-[#F6F5EE]/60 border-b border-[#E2E0D6] text-xs font-semibold text-[#5A6B6B] uppercase tracking-wide">
            <span>Name</span>
            <span>Age</span>
            <span>Gender</span>
            <span className="text-right">Status</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#E2E0D6]/60">
            {(clients as Pick<Client, 'id'|'name'|'age'|'gender'|'issues'|'status'|'created_at'>[]).map((client) => {
              const statusCls = STATUS_STYLES[client.status] || STATUS_STYLES.Active

              return (
                <Link
                  key={client.id}
                  href={`/dashboard/clients/${client.id}`}
                  className="grid grid-cols-[1fr_80px_100px_120px] gap-4 px-6 py-3.5 items-center hover:bg-[#F6F5EE]/40 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#2D3A3A] group-hover:text-[#588B8B] transition-colors truncate">
                      {client.name}
                    </p>
                    {client.issues?.length > 0 && (
                      <p className="text-xs text-[#5A6B6B] mt-0.5 truncate">
                        {client.issues.slice(0, 3).join(', ')}{client.issues.length > 3 ? ` +${client.issues.length - 3}` : ''}
                      </p>
                    )}
                  </div>

                  <span className="text-xs text-[#5A6B6B] font-mono">{client.age}</span>
                  <span className="text-xs text-[#5A6B6B]">{client.gender}</span>

                  <div className="text-right">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded border font-medium ${statusCls}`}>
                      {client.status}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
