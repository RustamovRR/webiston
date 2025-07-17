'use client'

import { FileText, ArrowLeftRight } from 'lucide-react'

// Shared Components
import { ToolHeader } from '@/components/shared/ToolHeader'
import { DualTextPanel } from '@/components/shared/DualTextPanel'

// Local Components
import { InfoSection, ControlPanel } from './components'

// Utils & Hooks
import { useBase64Converter } from '@/hooks/tools/useBase64Converter'

const Base64Converter = () => {
  const {
    inputText,
    setInputText,
    mode,
    setMode,
    isProcessing,
    result,
    handleModeSwitch,
    handleClear,
    handleFileUpload,
    downloadResult,
    loadSampleText,
    canDownload,
    acceptedFileTypes,
    samples,
  } = useBase64Converter()

  const handleFileUploadWrapper = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const displayOutput = result.output || ''
  const fileSizeKB = Math.round((displayOutput.length / 1024) * 100) / 100

  // Status component
  const statusComponent =
    inputText.length > 0 ? (
      <span className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></div>
        {mode === 'encode' ? 'Kodlashga tayyor' : 'Dekodlashga tayyor'}
      </span>
    ) : null

  // Target empty state
  const targetEmptyState = (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="text-zinc-500">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-sm">
          {mode === 'encode' ? "Kodlangan Base64 bu yerda ko'rinadi..." : "Dekodlangan matn bu yerda ko'rinadi..."}
        </p>
        <p className="mt-2 text-xs opacity-75">Matn kiriting yoki fayl yuklang</p>
      </div>
    </div>
  )

  // Target footer component
  const targetFooterComponent = displayOutput ? (
    <div className="text-xs text-zinc-600 dark:text-zinc-400">
      <span className="text-zinc-500">Hajm:</span>{' '}
      <span className="text-zinc-700 dark:text-zinc-300">{fileSizeKB} KB</span>
    </div>
  ) : null

  // Custom target content for errors
  const targetContent =
    result.error && !result.isValid ? (
      <div className="p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-900/20">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400"></div>
            <strong className="text-sm text-red-700 dark:text-red-400">Konvertatsiya Xatoligi</strong>
          </div>
          <p className="font-mono text-sm text-red-600 dark:text-red-300">{result.error}</p>
        </div>
      </div>
    ) : null

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="Base64 Konverter va Kodlash"
        description="Matn va fayllarni Base64 formatiga o'girish va aksincha dekodlash vositasi"
      />

      <ControlPanel
        mode={mode}
        setMode={setMode}
        isProcessing={isProcessing}
        acceptedFileTypes={acceptedFileTypes}
        handleFileUpload={handleFileUploadWrapper}
        samples={samples}
        loadSampleText={loadSampleText}
        handleClear={handleClear}
        canDownload={canDownload}
        downloadResult={downloadResult}
      />

      <DualTextPanel
        sourceText={inputText}
        convertedText={displayOutput}
        sourcePlaceholder={
          mode === 'encode'
            ? "Kodlamoqchi bo'lgan matnni kiriting yoki fayl yuklang..."
            : "Dekodlamoqchi bo'lgan Base64 matnni kiriting..."
        }
        sourceLabel={mode === 'encode' ? 'Oddiy Matn Kirish' : 'Base64 Matn Kirish'}
        targetLabel={mode === 'encode' ? 'Base64 Natija' : 'Dekodlangan Natija'}
        onSourceChange={setInputText}
        onSwap={handleModeSwitch}
        onClear={handleClear}
        swapIcon={<ArrowLeftRight size={20} />}
        swapButtonTitle="Rejimni almashtirish"
        showSwapButton={true}
        showShadow={true}
        isProcessing={isProcessing}
        statusComponent={statusComponent}
        targetEmptyState={targetEmptyState}
        targetFooterComponent={targetFooterComponent}
        customTargetContent={targetContent}
      />

      <InfoSection />
    </div>
  )
}

export default Base64Converter
