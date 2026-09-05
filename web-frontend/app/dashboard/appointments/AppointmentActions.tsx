'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function AppointmentActions({ appointmentId }: { appointmentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const updateStatus = async (status: string) => {
    setLoading(status)
    const supabase = createClient()
    await supabase.from('appointments').update({ status, updated_at: new Date().toISOString() }).eq('id', appointmentId)
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus('completed')} disabled={!!loading}>
        {loading === 'completed' ? '...' : 'Complete'}
      </Button>
      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => updateStatus('cancelled')} disabled={!!loading}>
        {loading === 'cancelled' ? '...' : 'Cancel'}
      </Button>
    </div>
  )
}
