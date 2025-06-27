import { createTextInputPanel, createCustomPanel } from '@/lib/panel-utils'
import { Upload } from 'lucide-react'
import type { PanelStatus } from '@/types/panel'

interface HashInputPanelProps {
  activeTab: 'text' | 'file'
  inputText: string
  setInputText: (value: string) => void
  isGenerating: boolean
  inputStats: Array<{ label: string; value: number | string }>
  handleFileUploadChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const HashInputPanel = ({
  activeTab,
  inputText,
  setInputText,
  isGenerating,
  inputStats,
  handleFileUploadChange,
}: HashInputPanelProps) => {
  const status: PanelStatus = isGenerating
    ? { type: 'processing', message: 'Ishlanmoqda...' }
    : inputText.length > 0
      ? { type: 'valid', message: 'Hash yaratishga tayyor' }
      : { type: 'ready' }

  if (activeTab === 'text') {
    return createTextInputPanel(
      'Matn Kirish',
      inputText,
      setInputText,
      "Hash qilmoqchi bo'lgan matnni kiriting...",
      status,
      inputStats,
    )
  }

  return createCustomPanel(
    'Fayl Hash Kirish',
    <div className="flex h-full items-center justify-center">
      <label className="flex cursor-pointer flex-col items-center gap-4 rounded-lg border-2 border-dashed border-zinc-600 p-8 transition-colors hover:border-zinc-500">
        <Upload size={48} className="text-zinc-500" />
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-300">Faylni tanlang</p>
          <p className="text-xs text-zinc-500">TXT, JSON, CSV, MD, XML, LOG (10MB gacha)</p>
        </div>
        <input
          type="file"
          accept=".txt,.json,.csv,.md,.xml,.log"
          onChange={handleFileUploadChange}
          className="hidden"
        />
      </label>
    </div>,
    status,
    inputStats,
  )
}
