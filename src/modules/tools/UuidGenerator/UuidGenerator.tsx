'use client'

import { useTranslations } from 'next-intl'
import { ToolHeader, DualTextPanel } from '@/components/shared'
import { useUuidGenerator } from './hooks/useUuidGenerator'
import { ConfigPanel, InputPanel, ResultsPanel, StatsPanel, InfoPanel } from './components'

const UuidGenerator = () => {
  const t = useTranslations('UuidGeneratorPage.ToolHeader')
  const tInput = useTranslations('UuidGeneratorPage.InputPanel')
  const tResults = useTranslations('UuidGeneratorPage.ResultsPanel')

  const {
    uuids,
    count,
    version,
    format,
    isGenerating,
    stats,
    outputStats,
    sampleCounts,
    setCount,
    setVersion,
    setFormat,
    handleGenerate,
    handleClear,
    downloadUuids,
    downloadAsJson,
    loadSampleCount,
    getVersionInfo,
    getFormatInfo,
  } = useUuidGenerator({
    onSuccess: (message) => {
      console.log('Success:', message)
    },
    onError: (error) => {
      console.error('Error:', error)
    },
  })

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader title={t('title')} description={t('description')} />

      {/* Configuration Panel */}
      <ConfigPanel
        count={count}
        version={version}
        format={format}
        isGenerating={isGenerating}
        sampleCounts={sampleCounts as any}
        onCountChange={setCount}
        onVersionChange={setVersion}
        onFormatChange={setFormat}
        onGenerate={handleGenerate}
        onClear={handleClear}
        onLoadSample={loadSampleCount}
        hasResults={uuids.length > 0}
        getVersionInfo={getVersionInfo}
        getFormatInfo={getFormatInfo}
      />

      {/* Dual Panel Layout */}
      <DualTextPanel
        sourceText={`Count: ${count}\nVersion: ${version}\nFormat: ${format}`}
        convertedText={uuids.map((uuid) => uuid.uuid).join('\n')}
        sourcePlaceholder="UUID sozlamalari bu yerda ko'rsatiladi"
        sourceLabel={tInput('title')}
        targetLabel={tResults('title')}
        onSourceChange={() => {}} // Read-only for UUID generator
        onClear={handleClear}
        showSwapButton={false}
        showShadow={true}
        customSourceContent={
          <InputPanel
            count={count}
            version={version}
            format={format}
            getVersionInfo={getVersionInfo}
            getFormatInfo={getFormatInfo}
          />
        }
        customTargetContent={
          <ResultsPanel
            uuids={uuids}
            outputStats={outputStats}
            onDownloadTxt={downloadUuids}
            onDownloadJson={downloadAsJson}
          />
        }
      />

      {/* Statistics Panel */}
      <StatsPanel stats={stats} isVisible={uuids.length > 0} />

      {/* Information Panel */}
      <InfoPanel />
    </div>
  )
}

export default UuidGenerator
