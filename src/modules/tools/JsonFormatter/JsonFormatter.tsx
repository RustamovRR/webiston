'use client'

import { FileJson, X } from 'lucide-react'
import { CodeHighlight } from '@/components/ui'
import { Button } from '@/components/ui/button'

// Shared Components
import { ToolHeader } from '@/components/shared/ToolHeader'
import { DualTextPanel } from '@/components/shared/DualTextPanel'

// Local Components
import { InfoSection, ControlPanel } from './components'

// Utils & Hooks
import { useJsonFormatter } from '@/hooks/tools/useJsonFormatter'

const JsonFormatter = () => {
  const {
    inputJson,
    setInputJson,
    indentation,
    setIndentation,
    showLineNumbers,
    isMinified,
    jsonResult,
    handleFileUpload,
    loadSampleJson,
    downloadResult,
    clearInput,
    toggleMinify,
    toggleLineNumbers,
  } = useJsonFormatter()

  const displayJson = isMinified ? jsonResult.minified : jsonResult.formatted
  const fileSizeKB = Math.round((displayJson.length / 1024) * 100) / 100

  // Status component for JSON validation
  const statusComponent =
    inputJson.length > 0 ? (
      jsonResult.isValid ? (
        <span className="flex items-center gap-1 text-xs text-green-500 dark:text-green-400">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400"></div>
          To'g'ri format
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500 dark:bg-red-400"></div>
          Xatolik mavjud
        </span>
      )
    ) : null

  // Target empty state
  const targetEmptyState = (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="text-zinc-500">
        <FileJson size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-sm">Formatlangan JSON bu yerda ko'rinadi...</p>
        <p className="mt-2 text-xs opacity-75">JSON kiriting yoki fayl yuklang</p>
      </div>
    </div>
  )

  // Target footer component
  const targetFooterComponent = displayJson ? (
    <div className="text-xs text-zinc-600 dark:text-zinc-400">
      <span className="text-zinc-500">Hajm:</span>{' '}
      <span className="text-zinc-700 dark:text-zinc-300">{fileSizeKB} KB</span>
    </div>
  ) : null

  // Custom target content for JSON with syntax highlighting
  const targetContent =
    jsonResult.error && !jsonResult.isValid ? (
      <div className="p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-900/20">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400"></div>
            <strong className="text-sm text-red-700 dark:text-red-400">JSON Format Xatoligi</strong>
          </div>
          <p className="font-mono text-sm text-red-600 dark:text-red-300">{jsonResult.error}</p>
        </div>
      </div>
    ) : displayJson ? (
      <CodeHighlight code={displayJson} language="json" showLineNumbers={showLineNumbers} />
    ) : null

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="JSON Formatlash va Tekshirish"
        description="JSON ma'lumotlarni formatlash, tekshirish va optimallashtirish vositasi"
      />

      <ControlPanel
        indentation={indentation}
        setIndentation={setIndentation}
        showLineNumbers={showLineNumbers}
        isMinified={isMinified}
        isValid={jsonResult.isValid}
        handleFileUpload={handleFileUpload}
        loadSampleJson={loadSampleJson}
        clearInput={clearInput}
        toggleMinify={toggleMinify}
        toggleLineNumbers={toggleLineNumbers}
        downloadResult={downloadResult}
      />

      <DualTextPanel
        sourceText={inputJson}
        convertedText={displayJson}
        sourcePlaceholder="JSON ma'lumotlaringizni bu yerga kiriting yoki fayl yuklang..."
        sourceLabel="JSON Kirish"
        targetLabel={isMinified ? 'Siqilgan JSON' : 'Formatlangan JSON'}
        onSourceChange={setInputJson}
        onClear={clearInput}
        showSwapButton={false}
        showShadow={true}
        statusComponent={statusComponent}
        targetEmptyState={targetEmptyState}
        targetFooterComponent={targetFooterComponent}
        customTargetContent={targetContent}
      />

      <InfoSection />
    </div>
  )
}

export default JsonFormatter
