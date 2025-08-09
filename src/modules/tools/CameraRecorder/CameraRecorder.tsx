'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ToolHeader } from '@/components/shared'
import { useCameraRecorder } from '@/hooks/tools/useCameraRecorder'
import {
  ControlPanel,
  VideoPreviewPanel,
  StatusPanel,
  MediaPanel,
  InfoSection,
  VideoPreview,
  MediaPreviewModal,
} from './components'

const QUALITY_OPTIONS = [
  { value: 'hd', label: 'HD (1280×720)', width: 1280, height: 720 },
  { value: 'fhd', label: 'Full HD (1920×1080)', width: 1920, height: 1080 },
  { value: 'sd', label: 'SD (640×480)', width: 640, height: 480 },
]

export default function CameraRecorderPage() {
  const t = useTranslations('CameraRecorderPage.ToolHeader')
  const tErrors = useTranslations('CameraRecorderPage.Errors')

  const [selectedQuality, setSelectedQuality] = useState('hd')

  const {
    videoRef,
    canvasRef,
    isCameraActive,
    cameras,
    selectedCamera,
    error,
    videoInfo,
    status,
    cameraStream,
    isRecording,
    capturedMedia,
    previewMedia,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    takeScreenshot,
    refreshCameras,
    switchCamera,
    getCameraStats,
    downloadMedia,
    deleteMedia,
    openPreview,
    closePreview,
    updateVideoQuality,
    getCurrentRecordingInfo,
  } = useCameraRecorder({
    onSuccess: (message: string) => console.log('Success:', message),
    onError: (error: string) => console.error('Error:', error),
  })

  // Update video quality when dropdown changes
  const handleQualityChange = (qualityValue: string) => {
    setSelectedQuality(qualityValue)
    const quality = QUALITY_OPTIONS.find((q) => q.value === qualityValue)
    if (quality) {
      updateVideoQuality({ width: quality.width, height: quality.height })
    }
  }

  const cameraStats = getCameraStats()
  const recordingInfo = getCurrentRecordingInfo()

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader title={t('title')} description={t('description')} />

      {/* Control Panel */}
      <div className="mb-6">
        <ControlPanel
          isCameraActive={isCameraActive}
          cameras={cameras}
          selectedCamera={selectedCamera}
          selectedQuality={selectedQuality}
          onStartCamera={startCamera}
          onStopCamera={stopCamera}
          onRefreshCameras={refreshCameras}
          onSwitchCamera={switchCamera}
          onQualityChange={handleQualityChange}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Camera Preview Panel */}
        <div className="space-y-4">
          <VideoPreviewPanel
            isCameraActive={isCameraActive}
            isRecording={isRecording}
            cameraStream={cameraStream}
            recordingInfo={recordingInfo}
            onTakeScreenshot={takeScreenshot}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
          />

          {/* Status Panel */}
          <StatusPanel
            isCameraActive={isCameraActive}
            isRecording={isRecording}
            status={status}
            videoInfo={videoInfo}
            recordingInfo={recordingInfo}
            selectedCamera={selectedCamera}
            cameras={cameras}
          />

          {/* Hidden elements for screenshot functionality */}
          <video ref={videoRef} className="hidden" />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Captured Media Panel */}
        <MediaPanel
          capturedMedia={capturedMedia}
          cameraStats={cameraStats}
          onPreview={openPreview}
          onDownload={downloadMedia}
          onDelete={deleteMedia}
        />
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

      {/* Info Section */}
      <InfoSection />

      {/* Media Preview Modal */}
      <MediaPreviewModal media={previewMedia} onClose={closePreview} />
    </div>
  )
}
