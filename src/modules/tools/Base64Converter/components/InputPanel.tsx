import { createTextInputPanel } from '@/lib/panel-utils'
import type { PanelStatus } from '@/types/panel'

interface InputPanelProps {
  mode: 'encode' | 'decode'
  value: string
  onChange: (value: string) => void
  status: PanelStatus
  stats: Array<{ label: string; value: number | string }>
}

export const InputPanel = ({ mode, value, onChange, status, stats }: InputPanelProps) => {
  const title = mode === 'encode' ? 'Asl Matn' : 'Base64 Matn'
  const placeholder =
    mode === 'encode' ? 'Kodlash uchun matnni kiriting...' : 'Dekodlash uchun Base64 matnni kiriting...'

  return createTextInputPanel(title, value, onChange, placeholder, status, stats)
}
