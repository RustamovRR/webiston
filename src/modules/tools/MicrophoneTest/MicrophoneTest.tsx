'use client'

import { Mic } from 'lucide-react'
import { ToolHeader, StatsDisplay } from '@/components/shared'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useMicrophoneTest } from '@/hooks/tools/useMicrophoneTest'
import { ControlPanel, AudioPreviewPanel, RecordedAudioPanel, InfoSection } from './components'

export default function MicrophoneTest() {
  const t = useTranslations('MicrophoneTestPage.ToolHeader')
  const tSample = useTranslations('MicrophoneTestPage.SampleMicrophones')

  const {
    audioDevices,
    selectedDevice,
    isListening,
    isRecording,
    error,
    audioInfo,
    recordedAudios,
    recordingDuration,
    audioStats,
    sampleMicrophones,
    getAudioDevices,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    switchMicrophone,
    downloadAudio,
    deleteAudio,
    clearAllRecordings,
    openPreview,
    formatDuration,
    getAudioQuality,
    getStats,
  } = useMicrophoneTest({
    onSuccess: (message: string) => console.log('Success:', message),
    onError: (error: string) => console.error('Error:', error),
  })

  const audioQuality = getAudioQuality(audioStats.level)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader title={t('title')} description={t('description')} />

      <div className="mb-8">
        <StatsDisplay stats={getStats()} />
      </div>

      {/* Control Panel */}
      <div className="mb-6">
        <ControlPanel
          audioDevices={audioDevices}
          selectedDevice={selectedDevice}
          isListening={isListening}
          audioQuality={audioQuality}
          onStartListening={startListening}
          onStopListening={stopListening}
          onRefreshDevices={getAudioDevices}
          onSwitchMicrophone={switchMicrophone}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Audio Preview Panel */}
        <div className="sticky top-6 h-fit">
          <AudioPreviewPanel
            isListening={isListening}
            isRecording={isRecording}
            recordingDuration={recordingDuration}
            audioStats={audioStats}
            audioInfo={audioInfo}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            formatDuration={formatDuration}
          />
        </div>

        {/* Recorded Audio Panel */}
        <div className="h-[600px]">
          <RecordedAudioPanel
            recordedAudios={recordedAudios}
            onPreview={openPreview}
            onDownload={downloadAudio}
            onDelete={deleteAudio}
            onClearAll={clearAllRecordings}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-red-200 bg-red-50/80 p-4 backdrop-blur-sm dark:border-red-500/20 dark:bg-red-500/10"
        >
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Sample Microphones - Show when no devices */}
      {!isListening && audioDevices.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80"
        >
          <div className="flex items-center gap-2 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-400">{tSample('title')}</span>
          </div>

          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-zinc-200/50 bg-zinc-50/30 p-4 transition-all hover:border-zinc-300 hover:bg-zinc-50/50 dark:border-zinc-700/50 dark:bg-zinc-800/30 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50">
                <div className="mb-2 flex items-center gap-2">
                  <Mic className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{tSample('standard.name')}</span>
                </div>
                <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">{tSample('standard.description')}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">{tSample('standard.tip')}</p>
              </div>

              <div className="rounded-lg border border-zinc-200/50 bg-zinc-50/30 p-4 transition-all hover:border-zinc-300 hover:bg-zinc-50/50 dark:border-zinc-700/50 dark:bg-zinc-800/30 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50">
                <div className="mb-2 flex items-center gap-2">
                  <Mic className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{tSample('usb.name')}</span>
                </div>
                <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">{tSample('usb.description')}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">{tSample('usb.tip')}</p>
              </div>

              <div className="rounded-lg border border-zinc-200/50 bg-zinc-50/30 p-4 transition-all hover:border-zinc-300 hover:bg-zinc-50/50 dark:border-zinc-700/50 dark:bg-zinc-800/30 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50">
                <div className="mb-2 flex items-center gap-2">
                  <Mic className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{tSample('bluetooth.name')}</span>
                </div>
                <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">{tSample('bluetooth.description')}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">{tSample('bluetooth.tip')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Section */}
      <InfoSection />
    </div>
  )
}
