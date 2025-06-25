'use client'

import { Camera, CameraOff, Play, Square, Download, Info, Video, Image, Settings, RefreshCw } from 'lucide-react'
import { ToolHeader, CopyButton } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { ShimmerButton } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCameraRecorder } from '@/hooks/tools'
import { useState, useEffect, useRef } from 'react'

const QUALITY_OPTIONS = [
  { value: 'hd', label: 'HD (1280×720)', width: 1280, height: 720 },
  { value: 'fhd', label: 'Full HD (1920×1080)', width: 1920, height: 1080 },
  { value: 'sd', label: 'SD (640×480)', width: 640, height: 480 },
]

// Separate VideoPreview component for proper stream handling
const VideoPreview = ({ stream }: { stream: MediaStream | null }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(console.error)
    }
  }, [stream])

  if (!stream) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400">
        <div className="text-center">
          <Camera className="mx-auto mb-4 h-16 w-16 opacity-50" />
          <p className="text-lg">Kamerani yoqish uchun yuqoridagi tugmani bosing</p>
          <p className="mt-2 text-sm text-zinc-500">Avval ruxsat berishingiz kerak</p>
        </div>
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      className="h-full w-full object-cover"
      autoPlay
      muted
      playsInline
      controls={false}
      onLoadedData={() => console.log('Preview video loaded')}
      onPlaying={() => console.log('Preview video playing')}
      onError={(e) => console.error('Preview video error:', e)}
    />
  )
}

export default function CameraRecorderPage() {
  const [selectedQuality, setSelectedQuality] = useState('hd')

  const {
    videoRef,
    canvasRef,
    isStreaming,
    cameras,
    selectedCamera,
    error,
    videoInfo,
    screenshotCount,
    status,
    mediaBlobUrl,
    previewStream,
    isRecording,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
    takeScreenshot,
    refreshCameras,
    switchCamera,
    clearBlobUrl,
    getCameraStats,
  } = useCameraRecorder({
    onSuccess: (message: string) => console.log('Success:', message),
    onError: (error: string) => console.error('Error:', error),
  })

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
            <div className={`h-2 w-2 rounded-full ${isStreaming ? 'bg-green-500' : 'bg-zinc-500'}`}></div>
            <span className="text-xs text-zinc-500">{isStreaming ? 'Active' : 'Inactive'}</span>
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
              <Select value={selectedQuality} onValueChange={setSelectedQuality}>
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
              {!isStreaming ? (
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

      {/* Debug Panel - Temporary for testing */}
      {(isStreaming || previewStream) && (
        <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-yellow-500/20 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-medium text-yellow-300">Debug Ma'lumotlari</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-yellow-500">Debug</span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <div className="font-medium text-yellow-300">Recording Status:</div>
                <div className="text-yellow-100">{formatRecordingStatus(status)}</div>
              </div>
              <div>
                <div className="font-medium text-yellow-300">Is Streaming:</div>
                <div className="text-yellow-100">{isStreaming ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="font-medium text-yellow-300">Video Info:</div>
                <div className="text-yellow-100">{videoInfo ? 'Loaded' : 'None'}</div>
              </div>
              <div>
                <div className="font-medium text-yellow-300">Selected Camera:</div>
                <div className="truncate text-yellow-100">{selectedCamera || 'None'}</div>
              </div>
              <div>
                <div className="font-medium text-yellow-300">Cameras Count:</div>
                <div className="text-yellow-100">{cameras.length}</div>
              </div>
              <div>
                <div className="font-medium text-yellow-300">Media Blob:</div>
                <div className="text-yellow-100">{mediaBlobUrl ? 'Available' : 'None'}</div>
              </div>
              <div>
                <div className="font-medium text-yellow-300">Preview Stream:</div>
                <div className="text-yellow-100">{previewStream ? 'Active' : 'None'}</div>
              </div>
              <div>
                <div className="font-medium text-yellow-300">Screenshots:</div>
                <div className="text-yellow-100">{screenshotCount}</div>
              </div>
              <div>
                <div className="font-medium text-yellow-300">Error:</div>
                <div className="text-yellow-100">{error || 'None'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-red-500/20 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-medium text-red-300">Xatolik</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-red-500">Error</span>
            </div>
          </div>
          <div className="p-6">
            <div className="text-red-400">{error}</div>
          </div>
        </div>
      )}

      {/* Video Display */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <Video className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-zinc-300">Video Preview</span>
          </div>
          <div className="flex items-center gap-2">
            {isRecording && (
              <>
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
                <span className="text-xs text-red-400">{formatRecordingStatus(status)}</span>
              </>
            )}
            {!isRecording && (
              <>
                <div
                  className={`h-2 w-2 rounded-full ${isStreaming || previewStream ? 'bg-green-500' : 'bg-zinc-500'}`}
                ></div>
                <span className="text-xs text-zinc-500">{isStreaming || previewStream ? 'Live' : 'Off'}</span>
              </>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-800">
            <VideoPreview stream={previewStream || (videoRef.current?.srcObject as MediaStream)} />
            <canvas ref={canvasRef} className="hidden" />

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-sm text-white">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                {formatRecordingStatus(status)}
              </div>
            )}

            {/* Video info overlay */}
            {videoInfo && (
              <div className="absolute top-4 right-4 rounded bg-black/70 px-3 py-1 text-sm text-white">
                {videoInfo.width}×{videoInfo.height} @ {Math.round(videoInfo.frameRate)}fps
              </div>
            )}
          </div>

          {/* Controls */}
          {(isStreaming || previewStream) && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={takeScreenshot} variant="outline" className="border-zinc-700">
                <Image className="mr-2 h-4 w-4" />
                Screenshot ({screenshotCount})
              </Button>

              {!isRecording ? (
                <ShimmerButton onClick={startRecording}>
                  <Play className="mr-2 h-4 w-4" />
                  Video Yozish
                </ShimmerButton>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={stopRecording} variant="destructive">
                    <Square className="mr-2 h-4 w-4" />
                    Yozishni To'xtatish
                  </Button>
                  {status === 'recording' && (
                    <Button onClick={pauseRecording} variant="outline" className="border-zinc-700">
                      Pause
                    </Button>
                  )}
                </div>
              )}

              {mediaBlobUrl && (
                <Button onClick={downloadRecording} variant="outline" className="border-zinc-700">
                  <Download className="mr-2 h-4 w-4" />
                  Video Yuklab Olish
                </Button>
              )}

              {mediaBlobUrl && (
                <Button onClick={clearBlobUrl} variant="outline" className="border-zinc-700">
                  Tozalash
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Info Panel */}
      {cameraStats && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <Info className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-zinc-300">Video Ma'lumotlari</span>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={JSON.stringify(cameraStats, null, 2)} size="sm" variant="ghost" />
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-zinc-500">Stats</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <div className="text-sm text-zinc-400">Piksel o'lchami</div>
                <div className="mt-1 text-zinc-100">{cameraStats.resolution}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Kadr tezligi</div>
                <div className="mt-1 text-zinc-100">{cameraStats.frameRate}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Sifat darajasi</div>
                <div className="mt-1 text-zinc-100">{cameraStats.quality}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Aspect Ratio</div>
                <div className="mt-1 text-zinc-100">{cameraStats.aspectRatio}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <Settings className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium text-zinc-300">Kamera yozuvchi haqida</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-zinc-500">Information</span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-medium text-zinc-200">Asosiy funksiyalar:</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <strong>Live Preview:</strong> Real vaqtda kamera ko'rinishini ko'rish
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                  <strong>Video Recording:</strong> Yuqori sifatli video yozib olish
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                  <strong>Screenshot:</strong> Bir bosishda rasm saqlash
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                  <strong>Quality Control:</strong> Sifat sozlamalari (HD, Full HD)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  <strong>Multi-Camera:</strong> Bir nechta kamera o'rtasida almashish
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 font-medium text-zinc-200">Professional maslahatlar:</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-500"></div>
                  Yaxshi yorug'lik uchun derazaga yuzlaning
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
                  Video yozishdan oldin audio testini qiling
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                  Stabil internet ulanishini ta'minlang
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                  Browser ruxsatlarini tekshirib ko'ring
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  Background noise'ni minimallash uchun jimgina joy tanlang
                </li>
              </ul>

              <div className="mt-4 rounded-lg bg-green-500/10 p-3">
                <div className="text-sm text-green-400">
                  <strong>Maslahat:</strong> Eng yaxshi natija uchun HD yoki Full HD sifatni tanlang va kamerani to'g'ri
                  holatda joylashtiring.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
