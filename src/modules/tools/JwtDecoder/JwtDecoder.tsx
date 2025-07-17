'use client'

import { useJwtDecoder } from '@/hooks/tools/useJwtDecoder'
import { useTranslations } from 'next-intl'
import { ToolHeader } from '@/components/shared/ToolHeader'
import {
  ControlPanel,
  TokenInfoCards,
  InfoSection,
  SignatureSection,
  SignatureInfo,
  TokenParts,
  ErrorDisplay,
  InputPanel,
} from './components'

const JwtDecoder = () => {
  const t = useTranslations('JwtDecoderPage.ToolHeader')
  const tSamples = useTranslations('JwtDecoderPage.Samples')

  const {
    inputText,
    setInputText,
    viewMode,
    setViewMode,
    showSignature,
    isProcessing,
    result,
    tokenInfo,
    handleFileUpload,
    handleDownloadHeader,
    handleDownloadPayload,
    loadSampleText,
    handleClear,
    handleToggleSignature,
    formatJSON,
    inputStats,
    partsCount,
    samples,
  } = useJwtDecoder()

  // Update sample labels with translations
  const translatedSamples = samples.map((sample) => ({
    ...sample,
    label:
      sample.key === 'standard'
        ? tSamples('standard')
        : sample.key === 'expired'
          ? tSamples('expired')
          : sample.key === 'complex'
            ? tSamples('complex')
            : sample.label,
  }))

  const handleFileUploadWrapper = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(event)
    // Reset input
    event.target.value = ''
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader title={t('title')} description={t('description')} />

      {/* Enhanced Control Panel with integrated info */}
      <ControlPanel
        viewMode={viewMode}
        setViewMode={setViewMode}
        showSignature={showSignature}
        handleToggleSignature={handleToggleSignature}
        isProcessing={isProcessing}
        handleFileUpload={handleFileUploadWrapper}
        loadSampleText={loadSampleText}
        samples={translatedSamples}
        isValid={result?.isValid || false}
      />

      {/* Input Panel */}
      <InputPanel
        inputText={inputText}
        setInputText={setInputText}
        isProcessing={isProcessing}
        handleClear={handleClear}
        inputStats={inputStats}
        partsCount={partsCount}
      />

      {/* Error Display */}
      {result?.error && <ErrorDisplay error={result.error} />}

      {/* JWT Results Section - Unified Layout */}
      {result?.isValid && (
        <div className="space-y-6">
          {/* Token Status Cards - Moved closer to results */}
          {tokenInfo && <TokenInfoCards tokenInfo={tokenInfo} />}

          {/* Token Parts */}
          <TokenParts
            header={result.header}
            payload={result.payload}
            viewMode={viewMode}
            inputText={inputText}
            handleDownloadHeader={handleDownloadHeader}
            handleDownloadPayload={handleDownloadPayload}
            formatJSON={formatJSON}
          />

          {/* Signature Section - Moved closer to toggle */}
          {showSignature && <SignatureSection signature={result.signature} />}

          {/* Signature Info */}
          <SignatureInfo />
        </div>
      )}

      {/* Collapsible Information Section */}
      <InfoSection />
    </div>
  )
}

export default JwtDecoder
