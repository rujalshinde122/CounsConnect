'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, Loader2 } from 'lucide-react'

interface Props {
  clientId: string
  counselorId: string
  onSaved?: () => void
}

export default function SessionNoteEditor({ clientId, counselorId, onSaved }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Form State
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10))
  const [duration, setDuration] = useState('60')
  const [modality, setModality] = useState('In-Person')
  const [tagsInput, setTagsInput] = useState('')
  const [progressRating, setProgressRating] = useState<string>('3')

  
  const [subjective, setSubjective] = useState('')
  const [objective, setObjective] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [homework, setHomework] = useState('')
  const [privateNotes, setPrivateNotes] = useState('')

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    
    // auto-increment session number for this client
    const { count } = await supabase.from('session_notes').select('*', { count: 'exact', head: true }).eq('client_id', clientId)
    const nextSessionNumber = (count || 0) + 1

    const { error } = await supabase.from('session_notes').insert({
      client_id: clientId,
      counselor_id: counselorId,
      session_number: nextSessionNumber,
      session_date: new Date(date).toISOString(),
      duration_minutes: parseInt(duration) || 60,
      modality,
      subjective,
      objective,
      assessment,
      plan,
      homework_assigned: homework,
      private_clinical_notes: privateNotes,
      tags: tagsArray,
      progress_rating: parseInt(progressRating) || null
    })
    
    // Auto-create task if homework is assigned
    if (!error && homework.trim() !== '') {
      await supabase.from('tasks').insert({
        counselor_id: counselorId,
        patient_id: clientId,
        title: 'Session Homework',
        description: homework.trim(),
        frequency: 'once',
        status: 'pending'
      })
    }

    setSaving(false)
    if (!error) {
      setSaved(true)
      // Reset form
      setSubjective(''); setObjective(''); setAssessment(''); setPlan(''); setHomework(''); setPrivateNotes(''); setTagsInput(''); setProgressRating('3');
      setTimeout(() => setSaved(false), 3000)
      if (onSaved) onSaved()
    } else {
      console.error("Error saving session note:", error)
      alert("Failed to save note: " + error.message)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E0D6] shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E2E0D6] bg-[#F6F5EE]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#2D3A3A]">New Session Note</h3>
          <p className="text-xs text-[#5A6B6B]">SOAP format structured documentation</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1 rounded-md border border-[#E2E0D6] shadow-xs">
           <input 
             type="date" 
             value={date} 
             onChange={e => setDate(e.target.value)} 
             className="text-xs px-2 py-1 outline-none text-[#2D3A3A] font-medium"
           />
           <div className="w-px h-4 bg-[#E2E0D6]"></div>
           <Select value={modality} onValueChange={(val) => setModality(val || 'In-Person')}>
              <SelectTrigger className="w-[110px] h-7 text-xs border-none shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In-Person">In-Person</SelectItem>
                <SelectItem value="Virtual">Virtual</SelectItem>
              </SelectContent>
           </Select>
           <div className="w-px h-4 bg-[#E2E0D6]"></div>
           <div className="flex items-center px-2">
             <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-10 text-xs text-right outline-none font-medium" />
             <span className="text-xs text-[#5A6B6B] ml-1">min</span>
           </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* S & O */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D6363] uppercase tracking-wider flex items-center justify-between">
                <span>Subjective (S)</span>
                <span className="text-[10px] font-normal opacity-70 normal-case">Client&apos;s report</span>
              </label>
              <Textarea 
                value={subjective} onChange={e => setSubjective(e.target.value)}
                placeholder="What the client says about their condition..."
                className="resize-none text-sm bg-[#F6F5EE]/30 focus:bg-white" rows={4} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D6363] uppercase tracking-wider flex items-center justify-between">
                <span>Objective (O)</span>
                <span className="text-[10px] font-normal opacity-70 normal-case">Observations</span>
              </label>
              <Textarea 
                value={objective} onChange={e => setObjective(e.target.value)}
                placeholder="Clinical observations, affect, behavior..."
                className="resize-none text-sm bg-[#F6F5EE]/30 focus:bg-white" rows={4} 
              />
            </div>
          </div>

          {/* A & P */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D6363] uppercase tracking-wider flex items-center justify-between">
                <span>Assessment (A)</span>
                <span className="text-[10px] font-normal opacity-70 normal-case">Analysis</span>
              </label>
              <Textarea 
                value={assessment} onChange={e => setAssessment(e.target.value)}
                placeholder="Your synthesis of S and O, diagnosis updates..."
                className="resize-none text-sm bg-[#F6F5EE]/30 focus:bg-white" rows={4} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D6363] uppercase tracking-wider flex items-center justify-between">
                <span>Plan (P)</span>
                <span className="text-[10px] font-normal opacity-70 normal-case">Next steps</span>
              </label>
              <Textarea 
                value={plan} onChange={e => setPlan(e.target.value)}
                placeholder="Treatment direction, goals for next session..."
                className="resize-none text-sm bg-[#F6F5EE]/30 focus:bg-white" rows={4} 
              />
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2E0D6] pt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8A6A4B] uppercase tracking-wider">Homework Assigned</label>
            <Textarea 
                value={homework} onChange={e => setHomework(e.target.value)}
                placeholder="Activities or reflections assigned to client..."
                className="resize-none text-sm bg-[#FFFBF0]/50 focus:bg-white border-[#EBE3D5]" rows={2} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-rose-700 uppercase tracking-wider">Private Clinical Notes</label>
            <Textarea 
                value={privateNotes} onChange={e => setPrivateNotes(e.target.value)}
                placeholder="Strictly confidential hypotheses or supervision notes..."
                className="resize-none text-sm bg-rose-50/30 focus:bg-white border-rose-100" rows={2} 
            />
          </div>
        </div>

        <div className="border-t border-[#E2E0D6] pt-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D3A3A] uppercase tracking-wider">Session Tags</label>
              <input 
                type="text" 
                value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                placeholder="e.g. CBT, Anxiety"
                className="w-full text-sm px-3 py-2 border border-[#E2E0D6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#588B8B]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D3A3A] uppercase tracking-wider">Clinical Progress</label>
              <Select value={progressRating} onValueChange={setProgressRating}>
                <SelectTrigger className="w-full text-sm border-[#E2E0D6] h-[38px]">
                  <SelectValue placeholder="Select Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Getting Worse</SelectItem>
                  <SelectItem value="2">2 - No Improvement</SelectItem>
                  <SelectItem value="3">3 - Slight Improvement</SelectItem>
                  <SelectItem value="4">4 - Good Progress</SelectItem>
                  <SelectItem value="5">5 - Significant Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {saved && (
              <span className="text-[#365314] bg-[#ECFCCB] border border-[#84CC16]/30 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Note Saved
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#588B8B] hover:bg-[#3D6363] text-white rounded-lg px-8 py-5 h-auto text-sm font-bold shadow-md transition-all hover:shadow-lg"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {saving ? 'Saving...' : 'Save Session Note'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
