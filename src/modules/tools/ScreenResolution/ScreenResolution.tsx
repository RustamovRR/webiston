'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ToolHeader } from '@/components/shared'
import {
  ControlPanel,
  OutputPanel,
  ResolutionCategoriesPanel,
  DeviceTypesPanel,
  ModeInfoPanel,
  InfoSection,
} from './components'
import { useScreenResolution } from '@/hooks/tools'

export default function ScreenResolution() {
  const t = useTranslations('ScreenResolutionPage.ToolHeader')
  const tStats = useTranslations('ScreenResolutionPage.ControlPanel')

  const {
    screenInfo,
    isLoading,
    isFullscreen,
    refreshInfo,
    toggleFullscreen,
    loadSampleData,
    downloadScreenInfo,
    getScreenAnalysis,
    getResolutionCategories,
    getDeviceTypes,
    getStats,
  } = useScreenResolution()

  const analysis = screenInfo ? getScreenAnalysis() : null
  const stats = screenInfo ? getStats(tStats) : []

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <ToolHeader title={t('title')} description={t('description')} />

      <div className="relative grid gap-6 lg:grid-cols-2">
        <div className="lg:sticky lg:top-20">
          <ControlPanel
            isLoading={isLoading}
            isFullscreen={isFullscreen}
            stats={stats}
            onRefresh={refreshInfo}
            onToggleFullscreen={toggleFullscreen}
            onLoadSample={loadSampleData}
            onDownload={downloadScreenInfo}
          />
        </div>

        <div>
          {' '}
          <OutputPanel screenInfo={screenInfo} analysis={analysis} />
        </div>
      </div>

      {/* Qo'shimcha ma'lumotlar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <ResolutionCategoriesPanel
          categories={getResolutionCategories()}
          currentCategory={analysis?.resolutionCategory}
        />

        <DeviceTypesPanel deviceTypes={getDeviceTypes()} currentDeviceType={analysis?.deviceType} />

        <ModeInfoPanel isFullscreen={isFullscreen} analysis={analysis as any} />
      </motion.div>

      <InfoSection />
    </div>
  )
}
