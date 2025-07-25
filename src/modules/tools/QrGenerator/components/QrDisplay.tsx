import React from 'react'
import { QrSize, QrErrorLevel } from '@/hooks'

interface QrDisplayProps {
  qrUrl: string
  qrSize: QrSize
  errorLevel: QrErrorLevel
  inputType: string
  stats: {
    characters: number
    words: number
    lines: number
  }
}

const QrDisplay: React.FC<QrDisplayProps> = ({ qrUrl, qrSize, errorLevel, inputType, stats }) => {
  if (!qrUrl) return null

  return (
    <div className="mt-6 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">QR Kod Natijasi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Generated</span>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="rounded-lg border border-zinc-300 bg-zinc-100/30 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
          <img
            src={qrUrl}
            alt="Generated QR Code"
            className="mx-auto max-w-full rounded-lg"
            style={{ maxWidth: '300px', height: 'auto' }}
          />
          <div className="mt-3 text-center">
            <div className="text-xs text-zinc-600 dark:text-zinc-500">
              {qrSize}x{qrSize} pixels • {errorLevel} xato tuzatish • {inputType}
            </div>
            <div className="mt-2 flex justify-center gap-2 text-xs">
              <span className="rounded bg-zinc-300 px-2 py-1 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                {stats.characters} belgi
              </span>
              <span className="rounded bg-zinc-300 px-2 py-1 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                {stats.words} so'z
              </span>
              <span className="rounded bg-zinc-300 px-2 py-1 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                {stats.lines} qator
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QrDisplay
