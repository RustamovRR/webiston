'use client'

import { Code, FileText, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { CodeHighlight, GradientTabs } from '@/components/ui'
import { StatsDisplay, CopyButton } from '@/components/shared'

interface OutputPanelProps {
  generatedMeta: string
  formattedMeta: string
  outputFormat: string
  outputStats: Array<{ label: string; value: number }>
  onFormatChange: (format: string) => void
  onDownload: (format: 'raw' | 'formatted') => void
}

const OutputPanel: React.FC<OutputPanelProps> = ({
  generatedMeta,
  formattedMeta,
  outputFormat,
  outputStats,
  onFormatChange,
  onDownload,
}) => {
  const t = useTranslations('OgMetaGeneratorPage.OutputPanel')

  const formatOptions = [
    {
      value: 'raw',
      label: t('metaTags'),
      icon: <Code size={16} />,
    },
    {
      value: 'formatted',
      label: t('fullHtml'),
      icon: <FileText size={16} />,
    },
  ]

  const currentOutput = outputFormat === 'formatted' ? formattedMeta : generatedMeta
  const currentLanguage = outputFormat === 'formatted' ? 'html' : 'xml'

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">{t('status')}</span>
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <GradientTabs options={formatOptions} value={outputFormat} onChange={onFormatChange} />
      </div>

      {/* Generated Meta Tags */}
      <div className="space-y-4">
        {currentOutput ? (
          <>
            <CodeHighlight
              code={currentOutput}
              language={currentLanguage}
              showLineNumbers={true}
              className="max-h-96 overflow-y-auto"
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <CopyButton text={currentOutput} size="sm" variant="outline" />
              <Button onClick={() => onDownload('raw')} variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                {t('downloadTxt')}
              </Button>
              <Button onClick={() => onDownload('formatted')} variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                {t('downloadHtml')}
              </Button>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-zinc-100/50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
            <Code size={48} className="mx-auto mb-4 text-zinc-400 dark:text-zinc-600" />
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t('emptyTitle')}, {t('emptyDesc')}
            </div>
          </div>
        )}
      </div>

      {/* Stats Display */}
      {currentOutput && (
        <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('outputStats')}</h4>
          <StatsDisplay stats={outputStats} />
        </div>
      )}
    </div>
  )
}

export default OutputPanel
