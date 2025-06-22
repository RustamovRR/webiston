'use client'

import { useState } from 'react'
import { Check, Copy, Download, RefreshCw } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'
import { ToolHeader } from '@/components/shared/ToolHeader'

const UuidGenerator = () => {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState(1)
  const [copied, setCopied] = useState('')
  const [_, copy] = useCopyToClipboard()

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const handleGenerate = () => {
    const newUuids = Array.from({ length: count }, () => generateUUID())
    setUuids(newUuids)
  }

  const handleCopy = async (uuid: string, index: number) => {
    try {
      await copy(uuid)
      setCopied(`${index}`)
      setTimeout(() => setCopied(''), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleCopyAll = async () => {
    try {
      await copy(uuids.join('\n'))
      setCopied('all')
      setTimeout(() => setCopied(''), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleDownload = () => {
    const content = uuids.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'uuids.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <ToolHeader title="UUID Yaratuvchi" description="Noyob identifikatorlar yaratish (UUID v4) uchun vosita" />

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-zinc-900/50 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-300">Soni:</label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-16 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
            />
          </div>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Generate
          </button>
        </div>

        {uuids.length > 0 && (
          <div className="flex gap-2">
            {uuids.length > 1 && (
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-2 rounded bg-zinc-700 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-600"
              >
                {copied === 'all' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                Copy All
              </button>
            )}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded bg-zinc-700 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-600"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {uuids.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-zinc-100">Generated UUIDs</h3>
          {uuids.map((uuid, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg bg-zinc-900/80 p-4">
              <div className="flex-1">
                <code className="font-mono text-sm text-zinc-100">{uuid}</code>
              </div>
              <button
                onClick={() => handleCopy(uuid, index)}
                className="ml-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              >
                {copied === `${index}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 rounded-lg bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-100">UUID haqida</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">UUID v4 xususiyatlari:</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• 128-bit noyob identifikator</li>
              <li>• Random yoki pseudo-random</li>
              <li>• 36 karakter uzunlik (tireler bilan)</li>
              <li>• Duplication ehtimoli juda past</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">Foydalanish:</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Database primary keys</li>
              <li>• Session identifiers</li>
              <li>• API request tracking</li>
              <li>• File naming</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UuidGenerator
