'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ToolHeader } from '@/components/shared/ToolHeader'
import {
  ConfigPanel,
  TemplatesPanel,
  FormPanel,
  OutputPanel,
  PreviewPanel,
  ValidationPanel,
  InfoSection,
} from './components'
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

      <TemplatesPanel
        presetTemplates={presetTemplates}
        onLoadTemplate={loadTemplate}
        onLoadSampleData={loadSampleData}
        onClearForm={clearForm}
      />

      <ValidationPanel metaData={metaData} />

      {/* Professional Responsive Layout */}
      <div className="space-y-6">
        {/* Mobile: Stacked, Desktop: Side by side */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: Form + Validation */}
          <div className="space-y-6">
            <FormPanel
              metaData={metaData}
              inputStats={inputStats}
              ogTypes={ogTypes}
              twitterCardTypes={twitterCardTypes}
              onUpdateField={updateField}
            />
          </div>

          {/* Right Column: Preview + Output */}
          <div className="space-y-6">
            <PreviewPanel previewInfo={previewInfo} />

            <OutputPanel
              generatedMeta={generatedMeta}
              formattedMeta={formattedMeta}
              outputFormat={outputFormat}
              outputStats={outputStats}
              onFormatChange={setOutputFormat}
              onDownload={downloadMeta}
            />
          </div>
        </div>
      </div>

      <InfoSection />
    </div>
  )
}
