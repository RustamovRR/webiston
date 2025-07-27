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
  const tAll = useTranslations('OgMetaGeneratorPage')

  const {
    metaData,
    generatedMeta,
    formattedMeta,
    inputStats,
    outputStats,
    previewInfo,
    presetTemplates,
    loadSampleData,
    loadTemplate,
    clearForm,
    updateField,
    downloadMeta,
  } = useOgMetaGenerator(
    {
      onSuccess: (message) => console.log(message),
      onError: (error) => console.error(error),
    },
    tAll,
  )

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

      {/* Professional 2-Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column: Form Panel (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <FormPanel metaData={metaData} inputStats={inputStats} onUpdateField={updateField} />
          </div>
        </div>

        {/* Right Column: Preview + Output (Scrollable) */}
        <div className="space-y-6 lg:col-span-1">
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

      <InfoSection />
    </div>
  )
}
