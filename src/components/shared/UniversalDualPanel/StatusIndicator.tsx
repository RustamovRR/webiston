'use client'

import { cn } from '@/lib'
import { useStatusIndicator } from '@/hooks/panel/useStatusIndicator'
import type { PanelStatus } from '@/types/panel'

interface StatusIndicatorProps {
  status?: PanelStatus
}

export const StatusIndicator = ({ status }: StatusIndicatorProps) => {
  const { getStatusColor, getMessage } = useStatusIndicator()

  if (!status) return null

  return (
    <div className="flex items-center gap-2">
      <div className={cn('h-2 w-2 rounded-full', getStatusColor(status.type))}></div>
      <span className="text-xs text-zinc-500">{getMessage(status)}</span>
    </div>
  )
}
