import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ClientClinicalHistoryTab from './components/ClientClinicalHistoryTab'
import SessionTimeline from './components/SessionTimeline'
import SessionNoteEditor from './components/SessionNoteEditor'
import TasksView from '@/components/dashboard/TasksView'
import type { Task } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('clients').select('name').eq('id', id).single()
  return { title: `${data?.name ?? 'Client Details'} | CounsConnect` }
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Inactive: 'bg-[#F6F5EE] text-[#5A6B6B] border-[#E2E0D6]',
  'On Hold': 'bg-amber-50 text-amber-800 border-amber-200',
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !client) notFound()

  const { data: clinicalHistory } = await supabase
    .from('client_clinical_history')
    .select('*')
    .eq('client_id', id)
    .single()

  const { data: clientTasks } = await supabase
    .from('tasks')
    .select(`
      *,
      patient:clients!tasks_patient_id_fkey(name)
    `)
    .eq('patient_id', id)
    .order('created_at', { ascending: false })


  const swotFields = [
    { key: 'swot_strengths', label: 'Strengths', color: 'bg-emerald-50/60 border-emerald-200 text-emerald-900' },
    { key: 'swot_weaknesses', label: 'Weaknesses', color: 'bg-rose-50/60 border-rose-200 text-rose-900' },
    { key: 'swot_opportunities', label: 'Opportunities', color: 'bg-sky-50/60 border-sky-200 text-sky-900' },
    { key: 'swot_threats', label: 'Threats', color: 'bg-amber-50/60 border-amber-200 text-amber-900' },
  ] as const

  const statusCls = STATUS_STYLES[client.status] || STATUS_STYLES.Active

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A6B6B] hover:text-[#2D3A3A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Clients
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#2D3A3A] tracking-tight">{client.name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${statusCls}`}>
                {client.status}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5A6B6B]">
              <span className="font-mono">{client.age} years old</span>
              <span>•</span>
              <span>{client.gender}</span>
              {client.marital_status && (
                <>
                  <span>•</span>
                  <span>{client.marital_status}</span>
                </>
              )}
              {client.education && (
                <>
                  <span>•</span>
                  <span>{client.education}</span>
                </>
              )}
              {client.profession && (
                <>
                  <span>•</span>
                  <span>{client.profession}</span>
                </>
              )}
            </div>

            {client.issues?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {client.issues.map((issue: string) => (
                  <span
                    key={issue}
                    className="bg-[#EDF4F2] text-[#2D3A3A] border border-[#588B8B]/20 text-xs px-2 py-0.5 rounded font-medium"
                  >
                    {issue}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Interface */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start bg-white border border-[#E2E0D6] rounded-xl p-1 mb-6 flex-wrap h-auto">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-[#588B8B] data-[state=active]:text-white">At-a-Glance Overview</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-[#588B8B] data-[state=active]:text-white">Clinical History</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-lg data-[state=active]:bg-[#588B8B] data-[state=active]:text-white">Session Timeline</TabsTrigger>
          <TabsTrigger value="new_note" className="rounded-lg data-[state=active]:bg-[#588B8B] data-[state=active]:text-white">Active Session Note</TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-lg data-[state=active]:bg-[#588B8B] data-[state=active]:text-white">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          {/* SWOT Analysis Card */}
          {swotFields.some(f => !!client[f.key]) && (
            <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs p-6">
              <h3 className="font-bold text-[#2D3A3A] text-sm mb-3">SWOT Assessment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {swotFields.map(({ key, label, color }) =>
                  client[key] ? (
                    <div key={key} className={`border rounded-lg p-3.5 ${color}`}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">{label}</p>
                      <p className="text-xs leading-relaxed font-normal">{client[key]}</p>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
          {clinicalHistory ? (
            <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs p-6 space-y-4">
              <h3 className="font-bold text-[#2D3A3A] text-sm mb-3">Clinical Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clinicalHistory.chief_complaints && (
                  <div>
                    <h4 className="text-xs font-bold text-[#5A6B6B] uppercase tracking-wider mb-1">Chief Complaints</h4>
                    <p className="text-sm text-[#2D3A3A] bg-[#F6F5EE] p-3 rounded-lg whitespace-pre-wrap">{clinicalHistory.chief_complaints}</p>
                  </div>
                )}
                {clinicalHistory.risk_level && (
                  <div>
                    <h4 className="text-xs font-bold text-[#5A6B6B] uppercase tracking-wider mb-1">Risk Level</h4>
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold border ${
                      clinicalHistory.risk_level === 'Low' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      clinicalHistory.risk_level === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {clinicalHistory.risk_level}
                    </span>
                  </div>
                )}
                {clinicalHistory.current_medications && (
                  <div>
                    <h4 className="text-xs font-bold text-[#5A6B6B] uppercase tracking-wider mb-1">Medications</h4>
                    <p className="text-sm text-[#2D3A3A] bg-[#F6F5EE] p-3 rounded-lg whitespace-pre-wrap">{clinicalHistory.current_medications}</p>
                  </div>
                )}
                {clinicalHistory.triggers && (
                  <div>
                    <h4 className="text-xs font-bold text-[#5A6B6B] uppercase tracking-wider mb-1">Triggers</h4>
                    <p className="text-sm text-[#2D3A3A] bg-[#F6F5EE] p-3 rounded-lg whitespace-pre-wrap">{clinicalHistory.triggers}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#F6F5EE]/40 border border-dashed border-[#E2E0D6] rounded-xl p-8 text-center">
              <p className="text-sm text-[#5A6B6B]">No clinical history recorded yet. Use the Clinical History tab to update.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <ClientClinicalHistoryTab clientId={client.id} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          <SessionTimeline clientId={client.id} />
        </TabsContent>

        <TabsContent value="new_note" className="mt-0">
          <SessionNoteEditor clientId={client.id} counselorId={client.counselor_id} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-0">
          <TasksView tasks={clientTasks as unknown as (Task & { patient?: { name: string | null } })[]} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
