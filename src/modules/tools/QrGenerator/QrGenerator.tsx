'use client'

import { FileText } from 'lucide-react'
import { ToolHeader, DualTextPanel } from '@/components/shared'
import { ControlPanel, QrDisplay, InfoSection } from './components'
import { useQrGenerator } from '@/hooks'

const QrGenerator = () => {
  const {
    inputText,
    qrUrl,
    qrSize,
    errorLevel,
    isGenerating,
    stats,
    groupedPresets,
    availableSizes,
    errorLevels,
    setInputText,
    setQrSize,
    setErrorLevel,
    handlePresetSelect,
    handleClear,
    downloadQr,
    handleFileUpload,
    detectInputType,
  } = useQrGenerator({
    onSuccess: (message) => console.log(message),
    onError: (error) => console.error(error),
  })

  const handleFileUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const inputType = detectInputType(inputText)
  const canDownload = !!qrUrl

  // Status component
  const statusComponent =
    inputText.length > 0 ? (
      <span className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></div>
        QR yaratishga tayyor
      </span>
    ) : null

  // Target empty state
  const targetEmptyState = (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="text-zinc-500">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-sm">QR kod bu yerda ko'rinadi...</p>
        <p className="mt-2 text-xs opacity-75">Matn kiriting va QR kod yaratiladi</p>
      </div>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="QR Kod Generator"
        description="Professional QR kod yaratish vositasi. URL, matn, kontakt va WiFi ma'lumotlari uchun QR kodlar yaratish."
      />

      <ControlPanel
        qrSize={qrSize}
        errorLevel={errorLevel}
        isGenerating={isGenerating}
        availableSizes={availableSizes}
        errorLevels={errorLevels}
        groupedPresets={groupedPresets}
        canDownload={canDownload}
        inputText={inputText}
        onSizeChange={setQrSize}
        onErrorLevelChange={setErrorLevel}
        onPresetSelect={handlePresetSelect}
        onFileUpload={handleFileUploadChange}
        onClear={handleClear}
        onDownload={downloadQr}
      />

      <DualTextPanel
        sourceText={inputText}
        convertedText={
          qrUrl
            ? `QR kod muvaffaqiyatli yaratildi!\n\nO'lcham: ${qrSize}x${qrSize} pixels\nXato tuzatish: ${errorLevel}\nTur: ${inputType}\n\nQR Kodi quyida ko'rinadi.`
            : ''
        }
        sourceLabel="Tool Kirish"
        targetLabel="Tool Natija"
        onSourceChange={setInputText}
        sourcePlaceholder="QR kod uchun matn kiriting (URL, kontakt ma'lumotlari, WiFi sozlamalari va h.k.)"
        onClear={handleClear}
        showSwapButton={false}
        isProcessing={isGenerating}
        variant="terminal"
        statusComponent={statusComponent}
        targetEmptyState={targetEmptyState}
        showShadow={true}
      />

      <QrDisplay qrUrl={qrUrl} qrSize={qrSize} errorLevel={errorLevel} inputType={inputType} stats={stats} />

      <InfoSection />
    </div>
  )
}

export default QrGenerator
