'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DeleteFoodLogButton({ id, className }: { id: string; className?: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function onDelete() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('food_logs').delete().eq('id', id)
    setLoading(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Could not remove entry',
        description: error.message,
      })
      return
    }

    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading}
      aria-label="Remove entry"
      className={cn(
        'shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-aka/10 hover:text-aka disabled:opacity-50',
        className
      )}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
    </button>
  )
}

export default DeleteFoodLogButton
