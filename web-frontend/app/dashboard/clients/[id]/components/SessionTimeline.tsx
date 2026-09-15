'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SessionNote, Task } from '@/lib/types'
import { Loader2, Clock, Video, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Props {
  clientId: string
}

export default function SessionTimeline({ clientId }: Props) {
  const [sessions, setSessions] = useState<SessionNote[]>([])
  const [sessionTasks, setSessionTasks] = useState<Record<string, Task[]>>({})
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    async function loadSessions() {
      const supabase = createClient()
      const { data } = await supabase
        .from('session_notes')
        .select('*')
        .eq('client_id', clientId)
        .order('session_date', { ascending: false })
      
      if (data) setSessions(data)

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('patient_id', clientId)
        .not('session_id', 'is', null)

      const tasksBySession: Record<string, Task[]> = {}
      tasks?.forEach(t => {
        if (t.session_id) {
           if (!tasksBySession[t.session_id]) tasksBySession[t.session_id] = []
           tasksBySession[t.session_id].push(t as unknown as Task)
        }
      })
      setSessionTasks(tasksBySession)

      setLoading(false)
    }
    loadSessions()
  }, [clientId])

  const filteredSessions = sessions.filter(s => {
    if (!filter) return true
    const term = filter.toLowerCase()
    return (
      (s.subjective?.toLowerCase() || '').includes(term) ||
      (s.objective?.toLowerCase() || '').includes(term) ||
      (s.assessment?.toLowerCase() || '').includes(term) ||
      (s.plan?.toLowerCase() || '').includes(term) ||
      (s.tags?.join(' ').toLowerCase() || '').includes(term)
    )
  })

  if (loading) return <div className="p-8 text-center text-sm text-[#5A6B6B]"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#2D3A3A]">Chronological Session History</h3>
          <p className="text-xs text-[#5A6B6B]">Review past consultations and clinical progress</p>
        </div>
        <input 
          type="text" 
          placeholder="Filter notes or tags..." 
          className="text-sm px-4 py-2 border border-[#E2E0D6] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#588B8B] w-full sm:w-64"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      {sessions.length === 0 ? (
        <div className="text-center p-12 bg-[#F6F5EE]/40 border border-dashed border-[#E2E0D6] rounded-xl text-[#5A6B6B] text-sm">
          No session notes recorded yet.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session, idx) => {
            const isExpanded = expandedId === session.id
            const dateStr = new Date(session.session_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
            
            return (
              <div key={session.id} className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs overflow-hidden transition-all">
                <div 
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#F6F5EE]/30"
                  onClick={() => setExpandedId(isExpanded ? null : session.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-[#EDF4F2] text-[#3D6363] w-12 h-12 rounded-full font-bold">
                      #{session.session_number || (sessions.length - idx)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#2D3A3A] text-sm sm:text-base">{dateStr}</h4>
                        {session.modality === 'Virtual' ? <Video className="w-4 h-4 text-[#5A6B6B]" /> : <Users className="w-4 h-4 text-[#5A6B6B]" />}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#5A6B6B] mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {session.duration_minutes} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex gap-1.5 flex-wrap justify-end items-center">
                      {session.progress_rating && (
                        <Badge variant="outline" className={`text-[10px] font-bold ${
                          session.progress_rating >= 4 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          session.progress_rating <= 2 ? 'bg-rose-50 border-rose-200 text-rose-700' :
                          'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {session.progress_rating === 1 && 'Getting Worse'}
                          {session.progress_rating === 2 && 'No Improvement'}
                          {session.progress_rating === 3 && 'Slight Improvement'}
                          {session.progress_rating === 4 && 'Good Progress'}
                          {session.progress_rating === 5 && 'Significant Improvement'}
                        </Badge>
                      )}
                      {session.tags?.map(t => (
                        <Badge key={t} variant="outline" className="text-[10px] bg-[#F6F5EE] border-[#E2E0D6] font-medium text-[#5A6B6B]">{t}</Badge>
                      ))}
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-[#5A6B6B]" /> : <ChevronDown className="w-5 h-5 text-[#5A6B6B]" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-[#E2E0D6] bg-[#F9F9F8] space-y-5 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {session.subjective && (
                        <div className="space-y-1.5">
                          <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#3D6363]">Subjective</h5>
                          <p className="text-sm text-[#2D3A3A] bg-white p-3 rounded-lg border border-[#E2E0D6] whitespace-pre-wrap">{session.subjective}</p>
                        </div>
                      )}
                      {session.objective && (
                        <div className="space-y-1.5">
                          <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#3D6363]">Objective</h5>
                          <p className="text-sm text-[#2D3A3A] bg-white p-3 rounded-lg border border-[#E2E0D6] whitespace-pre-wrap">{session.objective}</p>
                        </div>
                      )}
                      {session.assessment && (
                        <div className="space-y-1.5">
                          <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#3D6363]">Assessment</h5>
                          <p className="text-sm text-[#2D3A3A] bg-white p-3 rounded-lg border border-[#E2E0D6] whitespace-pre-wrap">{session.assessment}</p>
                        </div>
                      )}
                      {session.plan && (
                        <div className="space-y-1.5">
                          <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#3D6363]">Plan</h5>
                          <p className="text-sm text-[#2D3A3A] bg-white p-3 rounded-lg border border-[#E2E0D6] whitespace-pre-wrap">{session.plan}</p>
                        </div>
                      )}
                    </div>
                    
                    {(session.homework_assigned || session.private_clinical_notes || (sessionTasks[session.id] && sessionTasks[session.id].length > 0)) && (
                      <div className="pt-4 border-t border-[#E2E0D6] space-y-4">
                        {session.homework_assigned && (
                          <div className="space-y-1.5">
                            <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#8A6A4B]">Homework Assigned</h5>
                            <p className="text-sm text-[#2D3A3A] bg-[#FFFBF0] p-3 rounded-lg border border-[#EBE3D5] whitespace-pre-wrap">{session.homework_assigned}</p>
                          </div>
                        )}
                        {sessionTasks[session.id] && sessionTasks[session.id].length > 0 && (
                          <div className="space-y-1.5">
                            <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#588B8B]">Linked Tasks</h5>
                            <div className="space-y-2">
                              {sessionTasks[session.id].map(t => (
                                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white border border-[#E2E0D6] rounded-md text-xs shadow-xs">
                                  <div>
                                    <div className="font-bold text-[#2D3A3A]">{t.title}</div>
                                    {t.description && <div className="text-[10px] text-[#5A6B6B] mt-0.5 line-clamp-1">{t.description}</div>}
                                  </div>
                                  <div className="flex items-center gap-2 mt-2 sm:mt-0 shrink-0">
                                    <span className="text-[#5A6B6B] capitalize text-[10px] bg-[#F6F5EE] px-1.5 py-0.5 rounded border border-[#E2E0D6] font-medium">{t.frequency}</span>
                                    <span className={`px-2 py-0.5 rounded-full capitalize text-[10px] font-bold ${
                                      t.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}>
                                      {t.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {session.private_clinical_notes && (
                          <div className="space-y-1.5">
                            <h5 className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Private Clinical Notes</h5>
                            <p className="text-sm text-[#2D3A3A] bg-rose-50 p-3 rounded-lg border border-rose-100 whitespace-pre-wrap">{session.private_clinical_notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
