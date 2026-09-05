'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, Check } from 'lucide-react'

interface ClientNotesProps {
  clientId: string
  initialNotes: string
}

export default function ClientNotes({ clientId, initialNotes }: ClientNotesProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('clients').update({ notes }).eq('id', clientId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E2E0D6] shadow-xs overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E2E0D6] bg-[#F6F5EE]/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#588B8B]" />
          <div>
            <p className="text-sm font-bold text-[#2D3A3A]">Counselor Clinical Notes</p>
            <p className="text-xs text-[#5A6B6B]">Confidential records — encrypted & accessible only by you</p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-4">
        <Textarea
          rows={6}
          className="resize-none text-xs sm:text-sm rounded-2xl border-[#E2E0D6] bg-[#F6F5EE]/50 focus:bg-white text-[#2D3A3A] p-4 leading-relaxed"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Document therapy session notes, psychological observations, behavioral assignments, and next session agenda..."
        />
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#588B8B] hover:bg-[#3D6363] text-white rounded-full px-6 text-xs font-bold shadow-xs transition-colors"
          >
            {saving ? 'Saving...' : 'Save Clinical Notes'}
          </Button>
          {saved && (
            <span className="text-[#365314] bg-[#ECFCCB] border border-[#84CC16]/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Notes updated
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
