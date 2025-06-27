import { createDisplayPanel } from '@/lib/panel-utils'
import { CopyButton } from '@/components/shared'
import type { PanelStatus } from '@/types/panel'

interface OutputPanelProps {
  mode: 'encode' | 'decode'
  content: string
  isValid: boolean
  error?: string
  status: PanelStatus
  stats: Array<{ label: string; value: number | string }>
}

export const OutputPanel = ({ mode, content, isValid, error, status, stats }: OutputPanelProps) => {
  const title = mode === 'encode' ? 'Base64 Natija' : 'Dekodlangan Matn'
  const emptyMessage =
    mode === 'encode' ? "Kodlangan matn bu yerda ko'rinadi..." : "Dekodlangan matn bu yerda ko'rinadi..."

  const actions = <CopyButton text={content} disabled={!isValid} />

  return createDisplayPanel(
    title,
    content,
    status,
    stats,
    error,
    {
      message: emptyMessage,
      subMessage: 'Matn kiriting va natijani oling',
    },
    undefined,
    actions,
  )
}
