'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface Props {
  clientId: string
  initialStatus: string
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Inactive: 'bg-[#F6F5EE] text-[#5A6B6B] border-[#E2E0D6]',
  'On Hold': 'bg-amber-50 text-amber-800 border-amber-200',
}

export default function ClientStatusSelect({ clientId, initialStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus)
    setUpdating(true)
    
    const supabase = createClient()
    await supabase.from('clients').update({ status: newStatus }).eq('id', clientId)
    
    setUpdating(false)
    router.refresh()
  }

  const statusCls = STATUS_STYLES[status] || STATUS_STYLES.Active

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={handleStatusChange} disabled={updating}>
        <SelectTrigger className={`h-7 px-2.5 py-0.5 text-xs font-medium border rounded shadow-none transition-colors focus:ring-0 ${statusCls} w-auto min-w-[90px]`}>
          <div className="flex items-center gap-1.5">
            {updating && <Loader2 className="w-3 h-3 animate-spin" />}
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Active" className="text-xs">Active</SelectItem>
          <SelectItem value="On Hold" className="text-xs">On Hold</SelectItem>
          <SelectItem value="Inactive" className="text-xs">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
