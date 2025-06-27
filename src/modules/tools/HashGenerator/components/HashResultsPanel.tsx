import { createCustomPanel } from '@/lib/panel-utils'
import { CopyButton } from '@/components/shared'
import { Hash } from 'lucide-react'
import type { PanelStatus } from '@/types/panel'

interface HashResult {
  algorithm: string
  hash: string
  length: number
  security: 'Low' | 'Medium' | 'High' | 'Very High'
  status: 'deprecated' | 'weak' | 'secure' | 'recommended'
}

interface HashResultsPanelProps {
  hashes: HashResult[]
  outputStats: Array<{ label: string; value: number | string }>
}

export const HashResultsPanel = ({ hashes, outputStats }: HashResultsPanelProps) => {
  const status: PanelStatus = hashes.length > 0 ? { type: 'success' } : { type: 'ready' }

  const renderHashResults = () => {
    if (hashes.length === 0) {
      return (
        <div className="flex h-full items-center justify-center p-8 text-center">
          <div className="text-zinc-500">
            <Hash size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">Hash natijalar bu yerda ko'rinadi...</p>
            <p className="mt-2 text-xs opacity-75">Matn kiriting va hash yarating</p>
          </div>
        </div>
      )
    }

    return (
      <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
        <div className="space-y-4">
          {hashes.map((hashData, index) => (
            <div key={index} className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-indigo-400">{hashData.algorithm.toUpperCase()}</h3>
                <CopyButton text={hashData.hash} />
              </div>
              <div className="font-mono text-sm break-all text-zinc-100">{hashData.hash}</div>
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                <span>Uzunlik: {hashData.hash.length} belgi</span>
                <span>Yaratilgan: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const actions = hashes.length > 0 && (
    <CopyButton
      text={hashes.map((h) => `${h.algorithm.toUpperCase()}: ${h.hash}`).join('\n')}
      disabled={hashes.length === 0}
    />
  )

  return createCustomPanel('Hash Natijalar', renderHashResults(), status, outputStats, actions)
}
