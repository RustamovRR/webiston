import { Hash } from 'lucide-react'
import { CopyButton } from '@/components/shared'

interface GeneratedUuid {
  id: string
  uuid: string
  version: string
  format: string
  timestamp: number
}

interface UuidDisplayProps {
  uuids: GeneratedUuid[]
  stats: {
    totalGenerated: number
    currentBatch: number
    averageLength: number
    uniqueFormats: number
  }
}

export const UuidDisplay = ({ uuids, stats }: UuidDisplayProps) => {
  if (uuids.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium text-zinc-300">UUID Natijalari</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-zinc-500"></div>
            <span className="text-xs text-zinc-500">Bo'sh</span>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex h-96 items-center justify-center p-8 text-center">
          <div className="text-zinc-500">
            <Hash size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">UUID'lar bu yerda ko'rinadi...</p>
            <p className="mt-2 text-xs opacity-75">Yuqorida "UUID Yaratish" tugmasini bosing</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-300">UUID Natijalari</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-zinc-500">Tayyor ({uuids.length})</span>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-h-96 overflow-y-auto p-6">
        <div className="grid gap-3">
          {uuids.map((uuid, index) => (
            <div
              key={uuid.id}
              className="group rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4 transition-colors hover:bg-zinc-700/30"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>#{index + 1}</span>
                    <span>•</span>
                    <span>{uuid.version.toUpperCase()}</span>
                    <span>•</span>
                    <span>{uuid.format}</span>
                    <span>•</span>
                    <span>{new Date(uuid.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="mt-1 font-mono text-sm break-all text-zinc-100">{uuid.uuid}</div>
                </div>
                <div className="flex-shrink-0">
                  <CopyButton text={uuid.uuid} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="border-t border-zinc-800 bg-zinc-800/30 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Jami: {stats.totalGenerated} ta UUID</span>
          <span>Joriy: {stats.currentBatch} ta</span>
          <span>O'rtacha uzunlik: {stats.averageLength}</span>
          <span>Format turlari: {stats.uniqueFormats}</span>
        </div>
      </div>
    </div>
  )
}
