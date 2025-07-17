import React from 'react'
import { Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CodeHighlight } from '@/components/ui'
import { TerminalInput, type TerminalInputAction } from '@/components/shared/TerminalInput'

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

  // Header actions
  const headerActions: TerminalInputAction[] = [
    {
      type: 'custom',
      component: (
        <button
          onClick={handleDownloadHeader}
          className="cursor-pointer rounded-full p-2.5 text-zinc-500 transition-all duration-200 hover:scale-105 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="Download Header"
        >
          <Download size={18} />
        </button>
      ),
    },
    {
      type: 'copy',
      text: formatJSON(header),
    },
  ]

  // Payload actions
  const payloadActions: TerminalInputAction[] = [
    {
      type: 'custom',
      component: (
        <button
          onClick={handleDownloadPayload}
          className="cursor-pointer rounded-full p-2.5 text-zinc-500 transition-all duration-200 hover:scale-105 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="Download Payload"
        >
          <Download size={18} />
        </button>
      ),
    },
    {
      type: 'copy',
      text: formatJSON(payload),
    },
  ]

  // Header custom content
  const headerCustomContent = (
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
  )

  // Payload custom content
  const payloadCustomContent = (
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
  )

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Header Panel */}
      <TerminalInput
        title={t('header')}
        readOnly={true}
        actions={headerActions}
        customContent={headerCustomContent}
        minHeight="200px"
        showShadow={true}
        animate={true}
        className="transition-all duration-200 hover:shadow-md"
      />

      {/* Payload Panel */}
      <TerminalInput
        title={t('payload')}
        readOnly={true}
        actions={payloadActions}
        customContent={payloadCustomContent}
        minHeight="200px"
        showShadow={true}
        animate={true}
        className="transition-all duration-200 hover:shadow-md"
      />
    </div>
  )
}

export default TokenParts
