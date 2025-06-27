import { createTextInputPanel } from '@/lib/panel-utils'
import type { PanelStatus } from '@/types/panel'

interface JsonInputPanelProps {
  inputJson: string
  setInputJson: (value: string) => void
  isValid: boolean
  inputStats: Array<{ label: string; value: number | string }>
}

export const JsonInputPanel = ({ inputJson, setInputJson, isValid, inputStats }: JsonInputPanelProps) => {
  const status: PanelStatus =
    inputJson.length > 0
      ? isValid
        ? { type: 'valid', message: 'JSON yaroqli' }
        : { type: 'error', message: 'JSON xato' }
      : { type: 'ready' }

  return createTextInputPanel(
    'JSON Kirish',
    inputJson,
    setInputJson,
    "JSON ma'lumotlaringizni bu yerga kiriting yoki fayl yuklang...",
    status,
    inputStats,
  )
}
