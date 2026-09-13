'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ClientClinicalHistory } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, Loader2 } from 'lucide-react'

interface Props {
  clientId: string
}

export default function ClientClinicalHistoryTab({ clientId }: Props) {
  const [history, setHistory] = useState<ClientClinicalHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadHistory() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('client_clinical_history')
        .select('*')
        .eq('client_id', clientId)
        .single()
      
      if (data) {
        setHistory(data)
      } else {
        // Init empty state
        setHistory({
          client_id: clientId,
          chief_complaints: '',
          psychiatric_history: '',
          medical_history: '',
          family_history: '',
          triggers: '',
          current_medications: '',
          risk_level: 'Low',
          allergies_or_precautions: '',
          updated_at: new Date().toISOString()
        })
      }
      setLoading(false)
    }
    loadHistory()
  }, [clientId])

  const handleSave = async () => {
    if (!history) return
    setSaving(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('client_clinical_history')
      .upsert({ ...history, updated_at: new Date().toISOString() })
    
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      console.error("Error saving history:", error)
      alert("Failed to save history: " + error.message)
    }
  }

  if (loading) return <div className="p-8 text-center text-sm text-[#5A6B6B]"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#2D3A3A]">Clinical History & Background</h3>
          <p className="text-xs text-[#5A6B6B]">Comprehensive intake profile and risk assessment</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-[#365314] bg-[#ECFCCB] border border-[#84CC16]/30 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#588B8B] hover:bg-[#3D6363] text-white rounded-full px-6 text-xs font-bold"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-[#E2E0D6] shadow-2xs space-y-3">
            <label className="text-xs font-bold text-[#2D3A3A] uppercase tracking-wider">Chief Complaints</label>
            <Textarea
              className="resize-none text-sm bg-[#F6F5EE]/50 border-[#E2E0D6]"
              rows={3}
              value={history?.chief_complaints || ''}
              onChange={(e) => setHistory(prev => prev ? { ...prev, chief_complaints: e.target.value } : null)}
              placeholder="Primary reasons for seeking therapy..."
            />
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E0D6] shadow-2xs space-y-3">
            <label className="text-xs font-bold text-[#2D3A3A] uppercase tracking-wider">Psychiatric History</label>
            <Textarea
              className="resize-none text-sm bg-[#F6F5EE]/50 border-[#E2E0D6]"
              rows={3}
              value={history?.psychiatric_history || ''}
              onChange={(e) => setHistory(prev => prev ? { ...prev, psychiatric_history: e.target.value } : null)}
              placeholder="Past diagnoses, previous therapy, hospitalizations..."
            />
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E0D6] shadow-2xs space-y-3">
            <label className="text-xs font-bold text-[#2D3A3A] uppercase tracking-wider">Medical History</label>
            <Textarea
              className="resize-none text-sm bg-[#F6F5EE]/50 border-[#E2E0D6]"
              rows={2}
              value={history?.medical_history || ''}
              onChange={(e) => setHistory(prev => prev ? { ...prev, medical_history: e.target.value } : null)}
              placeholder="Chronic illnesses, surgeries, head injuries..."
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-[#E2E0D6] shadow-2xs space-y-4">
            <div className="flex flex-col space-y-3">
              <label className="text-xs font-bold text-[#2D3A3A] uppercase tracking-wider">Risk Level</label>
              <Select
                value={history?.risk_level || 'Low'}
                onValueChange={(val: any) => setHistory(prev => prev ? { ...prev, risk_level: val } : null)}
              >
                <SelectTrigger className="w-full text-sm bg-[#F6F5EE]/50 border-[#E2E0D6]">
                  <SelectValue placeholder="Select Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low Risk</SelectItem>
                  <SelectItem value="Medium">Medium Risk</SelectItem>
                  <SelectItem value="High">High Risk</SelectItem>
                  <SelectItem value="Crisis">Crisis (Immediate Attention)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-[#2D3A3A] uppercase tracking-wider">Current Medications</label>
              <Textarea
                className="resize-none text-sm bg-[#F6F5EE]/50 border-[#E2E0D6]"
                rows={2}
                value={history?.current_medications || ''}
                onChange={(e) => setHistory(prev => prev ? { ...prev, current_medications: e.target.value } : null)}
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-[#2D3A3A] uppercase tracking-wider">Allergies / Precautions</label>
              <Textarea
                className="resize-none text-sm bg-[#F6F5EE]/50 border-[#E2E0D6]"
                rows={1}
                value={history?.allergies_or_precautions || ''}
                onChange={(e) => setHistory(prev => prev ? { ...prev, allergies_or_precautions: e.target.value } : null)}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E0D6] shadow-2xs space-y-3">
            <label className="text-xs font-bold text-[#2D3A3A] uppercase tracking-wider">Triggers & Coping Mechanisms</label>
            <Textarea
              className="resize-none text-sm bg-[#F6F5EE]/50 border-[#E2E0D6]"
              rows={3}
              value={history?.triggers || ''}
              onChange={(e) => setHistory(prev => prev ? { ...prev, triggers: e.target.value } : null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
