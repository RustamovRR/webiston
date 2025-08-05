'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { ToolHeader } from '@/components/shared'
import { ControlPanel, OutputPanel, CurrentIpPanel, SampleIpsPanel, InfoSection } from './components'
import { useIPInfo } from '@/hooks/tools/useIPInfo'

export default function IpInfo() {
  const t = useTranslations('IpInfoPage.ToolHeader')

  const {
    ipAddress,
    ipInfo,
    currentIP,
    isLoading,
    error,
    setIpAddress,
    analyzeIP,
    loadSampleIP,
    loadCurrentIP,
    clearData,
    downloadInfo,
    getStats,
    samples,
    canDownload,
    isEmpty,
  } = useIPInfo()

  const stats = getStats()

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <ToolHeader title={t('title')} description={t('description')} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Input */}
        <div className="space-y-6">
          <ControlPanel
            ipAddress={ipAddress}
            isLoading={isLoading}
            error={error}
            canDownload={canDownload}
            isEmpty={isEmpty}
            stats={stats}
            onIpAddressChange={setIpAddress}
            onAnalyze={analyzeIP}
            onLoadCurrentIP={loadCurrentIP}
            onClear={clearData}
            onDownload={downloadInfo}
            hasCurrentIP={!!currentIP}
          />

          <CurrentIpPanel currentIP={currentIP} />

          <SampleIpsPanel samples={samples} onLoadSample={loadSampleIP} />
        </div>

        {/* Right Panel - Results */}
        <div className="space-y-6">
          <OutputPanel ipInfo={ipInfo} />
        </div>
      </div>

      <InfoSection />
    </div>
  )
}
