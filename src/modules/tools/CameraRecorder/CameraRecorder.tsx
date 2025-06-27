'use client'

import { Camera, CameraOff, Play, Square, Image, RefreshCw, Clock } from 'lucide-react'
import { ToolHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { ShimmerButton } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCameraRecorder } from '@/hooks/tools/useCameraRecorder'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoPreview, MediaPreviewModal, MediaGridItem } from './components'

const QUALITY_OPTIONS = [
  { value: 'hd', label: 'HD (1280×720)', width: 1280, height: 720 },
  { value: 'fhd', label: 'Full HD (1920×1080)', width: 1920, height: 1080 },
  { value: 'sd', label: 'SD (640×480)', width: 640, height: 480 },
]

export default function CameraRecorderPage() {
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

  const formatRecordingStatus = (status: string) => {
    switch (status) {
      case 'recording':
        return 'Yozib olinmoqda'
      case 'stopping':
        return "To'xtatilmoqda"
      case 'stopped':
        return "To'xtatildi"
      case 'idle':
        return 'Tayyor'
      case 'acquiring_media':
        return 'Media olinmoqda'
      default:
        return status
    }
  }

  const cameraStats = getCameraStats()
  const recordingInfo = getCurrentRecordingInfo()

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader title="Kamera Yozuvchi" description="Kamerangizni sinab ko'ring, video yozing va screenshot oling" />

      {/* Control Panel */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium text-zinc-300">Kamera Sozlamalari</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isCameraActive ? 'bg-green-500' : 'bg-zinc-500'}`}></div>
            <span className="text-xs text-zinc-500">{isCameraActive ? 'Faol' : 'Nofaol'}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">Kamera:</label>
              <Select value={selectedCamera} onValueChange={switchCamera} disabled={cameras.length === 0}>
                <SelectTrigger className="border-zinc-700 bg-zinc-800">
                  <SelectValue placeholder="Kamera tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {cameras.map((camera) => (
                    <SelectItem key={camera.deviceId} value={camera.deviceId}>
                      {camera.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">Sifat:</label>
              <Select value={selectedQuality} onValueChange={handleQualityChange}>
                <SelectTrigger className="border-zinc-700 bg-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUALITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={refreshCameras} variant="outline" className="w-full border-zinc-700">
                <RefreshCw className="mr-2 h-4 w-4" />
                Yangilash
              </Button>
            </div>

            <div className="flex items-end gap-2">
              {!isCameraActive ? (
                <ShimmerButton
                  onClick={startCamera}
                  disabled={!selectedCamera || cameras.length === 0}
                  className="flex-1"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Kamerani Yoqish
                </ShimmerButton>
              ) : (
                <Button onClick={stopCamera} variant="destructive" className="flex-1">
                  <CameraOff className="mr-2 h-4 w-4" />
                  Kamerani O'chirish
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Camera Preview Panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-medium text-zinc-300">Kamera Ko'rinishi</span>
            </div>
            <div className="flex items-center gap-2">
              {isRecording && (
                <>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
                  <span className="text-xs text-red-400">REC {recordingInfo.formattedDuration}</span>
                </>
              )}
              {!isRecording && (
                <>
                  <div className={`h-2 w-2 rounded-full ${isCameraActive ? 'bg-green-500' : 'bg-zinc-500'}`}></div>
                  <span className="text-xs text-zinc-500">{isCameraActive ? 'Live' : 'Off'}</span>
                </>
              )}
            </div>
          </div>

          {/* Video Preview */}
          <div className="p-6">
            <div className="aspect-video overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
              {isCameraActive ? (
                <VideoPreview stream={cameraStream} />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400">
                  <div className="text-center">
                    <Camera className="mx-auto mb-4 h-16 w-16 opacity-50" />
                    <p className="text-lg">Kamerani yoqish uchun yuqoridagi tugmani bosing</p>
                    <p className="mt-2 text-sm text-zinc-500">Avval ruxsat berishingiz kerak</p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            {isCameraActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex justify-center gap-2"
              >
                <Button
                  onClick={takeScreenshot}
                  variant="outline"
                  className="border-zinc-700"
                  disabled={!isCameraActive}
                >
                  <Image className="mr-2 h-4 w-4" />
                  Screenshot
                </Button>

                {!isRecording ? (
                  <ShimmerButton
                    onClick={startRecording}
                    disabled={!isCameraActive}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Yozishni Boshlash
                  </ShimmerButton>
                ) : (
                  <Button onClick={stopRecording} variant="destructive">
                    <Square className="mr-2 h-4 w-4" />
                    Yozishni To'xtatish
                  </Button>
                )}
              </motion.div>
            )}

            {/* Status Display */}
            {isCameraActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 backdrop-blur-sm transition-all hover:border-zinc-600 hover:bg-zinc-800/70"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`h-3 w-3 flex-shrink-0 rounded-full ${isRecording ? 'animate-pulse bg-red-500' : 'bg-green-500'}`}
                    ></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-zinc-300">Status</div>
                      <div className="text-sm text-zinc-100">{formatRecordingStatus(status)}</div>
                    </div>
                  </div>

                  {videoInfo && (
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-3 w-3 flex-shrink-0 rounded-full bg-blue-500"></div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-zinc-300">Sifat</div>
                        <div className="text-sm text-zinc-100">
                          {videoInfo.width}×{videoInfo.height} @ {videoInfo.frameRate}fps
                        </div>
                      </div>
                    </div>
                  )}

                  {isRecording && recordingInfo.duration > 0 && (
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-3 w-3 flex-shrink-0 animate-pulse rounded-full bg-red-500"></div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-zinc-300">Vaqt</div>
                        <div className="font-mono text-sm text-red-100">{recordingInfo.formattedDuration}</div>
                      </div>
                    </div>
                  )}

                  {!isRecording && selectedCamera && (
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-3 w-3 flex-shrink-0 rounded-full bg-purple-500"></div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-zinc-300">Kamera</div>
                        <div
                          className="truncate text-sm text-zinc-100"
                          title={cameras.find((c) => c.deviceId === selectedCamera)?.label || 'Tanlangan kamera'}
                        >
                          {cameras.find((c) => c.deviceId === selectedCamera)?.label || 'Tanlangan kamera'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isRecording && (
                  <div className="mt-3 border-t border-zinc-700 pt-3">
                    <div className="flex flex-col gap-1 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                      <span>Recording to WebM format with audio</span>
                      <span>Quality: {recordingInfo.qualityLabel}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Hidden elements for screenshot functionality */}
          <video ref={videoRef} className="hidden" />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Captured Media Panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-medium text-zinc-300">Saqlangan Media</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-zinc-500">{capturedMedia.length} ta fayl</span>
            </div>
          </div>

          <div className="p-6">
            <div className="max-h-96 overflow-y-auto">
              <AnimatePresence>
                {capturedMedia.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-40 items-center justify-center text-zinc-400"
                  >
                    <div className="text-center">
                      <Clock className="mx-auto mb-2 h-12 w-12 opacity-50" />
                      <p>Hali hech qanday media saqlanmagan</p>
                      <p className="text-sm text-zinc-500">Screenshot yoki video oling</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {capturedMedia.map((media) => (
                      <MediaGridItem
                        key={media.id}
                        media={media}
                        onPreview={() => openPreview(media)}
                        onDownload={() => downloadMedia(media)}
                        onDelete={() => deleteMedia(media.id)}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Stats */}
            {capturedMedia.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg bg-zinc-800/50 p-3"
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">Screenshots:</span>
                    <span className="ml-2 text-blue-400">{cameraStats.screenshotCount}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Videolar:</span>
                    <span className="ml-2 text-green-400">{cameraStats.videoCount}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 backdrop-blur-sm"
        >
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Info Section - DeviceInfo/OgMetaGenerator style */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium text-zinc-300">Ma'lumot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
            <span className="text-xs text-zinc-500">Yordam</span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-medium text-zinc-200">Asosiy foydalanish joylari:</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <strong>Content Creation:</strong> Blog, video kontent va ijtimoiy media uchun
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  <strong>Documentation:</strong> Layihalar va jarayonlar uchun video hujjatlar
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                  <strong>Education:</strong> Ta'lim va o'qitish materiallari yaratish
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                  <strong>Testing:</strong> Kamera va mikrofon funksionalligini tekshirish
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                  <strong>Quality Control:</strong> Turli qurilmalarda video sifatini baholash
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 font-medium text-zinc-200">Professional maslahatlar:</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  Yaxshi yorug'lik sharoitida video yozing
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  Mikrofon yaqin bo'lishi uchun kameraga yaqinroq o'tiring
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                  HD yoki Full HD sifatni tanlang, lekin internet tezligini hisobga oling
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                  Screenshot olishdan oldin video ni pauza qiling
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                  Katta fayllarni cloud storage'ga yuklang
                </li>
              </ul>

              <div className="mt-4 rounded-lg bg-blue-500/10 p-3">
                <div className="text-sm text-blue-400">
                  <strong>Eslatma:</strong> Video va audio fayllar avtomatik WebM formatida saqlanadi. Bu format
                  zamonaviy brauzerlarda yaxshi qo'llab-quvvatlanadi va yuqori sifat bilan kichik hajmga ega.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Preview Modal */}
      <MediaPreviewModal media={previewMedia} onClose={closePreview} />
    </div>
  )
}
