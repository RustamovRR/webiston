'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { ConfigPanel, TemplatesPanel, FormPanel, OutputPanel, PreviewPanel, InfoSection } from './components'
import { useOgMetaGenerator } from '@/hooks/tools'

export default function OgMetaGenerator() {
  const t = useTranslations('OgMetaGeneratorPage.ToolHeader')

  const {
    metaData,
    generatedMeta,
    formattedMeta,
    activeTab,
    inputStats,
    outputStats,
    previewInfo,
    presetTemplates,
    ogTypes,
    twitterCardTypes,
    loadSampleData,
    loadTemplate,
    clearForm,
    updateField,
    downloadMeta,
    setActiveTab,
  } = useOgMetaGenerator()

  const [outputFormat, setOutputFormat] = useState('raw')

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader title={t('title')} description={t('description')} />

      <ConfigPanel activeTab={activeTab} onTabChange={setActiveTab} />

      <TemplatesPanel
        presetTemplates={presetTemplates}
        onLoadTemplate={loadTemplate}
        onLoadSampleData={loadSampleData}
        onClearForm={clearForm}
      />

      {activeTab === 'form' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FormPanel
            metaData={metaData}
            inputStats={inputStats}
            ogTypes={ogTypes}
            twitterCardTypes={twitterCardTypes}
            onUpdateField={updateField}
          />

          <OutputPanel
            generatedMeta={generatedMeta}
            formattedMeta={formattedMeta}
            outputFormat={outputFormat}
            outputStats={outputStats}
            onFormatChange={setOutputFormat}
            onDownload={downloadMeta}
          />
        </div>
      )}

      {activeTab === 'preview' && <PreviewPanel previewInfo={previewInfo} />}

      <InfoSection />
    </div>
  )
}
