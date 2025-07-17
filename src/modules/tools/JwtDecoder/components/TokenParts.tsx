import React from 'react'
import { Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CodeHighlight } from '@/components/ui'
import { CopyButton } from '@/components/shared/CopyButton'

interface TokenPartsProps {
  header: any
  payload: any
  viewMode: 'decoded' | 'raw'
  inputText: string
  handleDownloadHeader: () => void
  handleDownloadPayload: () => void
  formatJSON: (json: any) => string
}

const TokenParts: React.FC<TokenPartsProps> = ({
  header,
  payload,
  viewMode,
  inputText,
  handleDownloadHeader,
  handleDownloadPayload,
  formatJSON,
}) => {
  const t = useTranslations('JwtDecoderPage.TokenParts')

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Header Panel */}
      <div className="rounded-lg border border-zinc-200 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/30 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80 transition-all duration-200 hover:bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80 transition-all duration-200 hover:bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80 transition-all duration-200 hover:bg-green-500"></div>
            </div>
            <span className="ml-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">{t('header')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHeader}
              className="cursor-pointer rounded-full p-2.5 text-zinc-500 transition-all duration-200 hover:scale-105 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Download Header"
            >
              <Download size={18} />
            </button>
            <CopyButton text={formatJSON(header)} disabled={false} />
          </div>
        </div>
        <div className="relative min-h-[200px]">
          <div className="p-4 transition-all duration-200">
            {viewMode === 'decoded' ? (
              <div className="animate-in fade-in duration-300">
                <CodeHighlight code={formatJSON(header)} language="json" showLineNumbers={false} />
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('rawData')}</div>
                <pre className="rounded bg-zinc-100 p-3 font-mono text-sm break-all whitespace-pre-wrap text-zinc-800 transition-colors duration-200 dark:bg-zinc-800/50 dark:text-zinc-200">
                  {inputText.split('.')[0]}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payload Panel */}
      <div className="rounded-lg border border-zinc-200 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/30 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80 transition-all duration-200 hover:bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80 transition-all duration-200 hover:bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80 transition-all duration-200 hover:bg-green-500"></div>
            </div>
            <span className="ml-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">{t('payload')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPayload}
              className="cursor-pointer rounded-full p-2.5 text-zinc-500 transition-all duration-200 hover:scale-105 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              aria-label="Download Payload"
            >
              <Download size={18} />
            </button>
            <CopyButton text={formatJSON(payload)} disabled={false} />
          </div>
        </div>
        <div className="relative min-h-[200px]">
          <div className="p-4 transition-all duration-200">
            {viewMode === 'decoded' ? (
              <div className="animate-in fade-in duration-300">
                <CodeHighlight code={formatJSON(payload)} language="json" showLineNumbers={false} />
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('rawData')}</div>
                <pre className="rounded bg-zinc-100 p-3 font-mono text-sm break-all whitespace-pre-wrap text-zinc-800 transition-colors duration-200 dark:bg-zinc-800/50 dark:text-zinc-200">
                  {inputText.split('.')[1]}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenParts
