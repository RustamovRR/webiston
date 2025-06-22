'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, CameraOff, Play, Square, Download, Info } from 'lucide-react'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CameraDevice {
  deviceId: string
  label: string
}

export default function CameraTestPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [videoInfo, setVideoInfo] = useState<{
    width: number
    height: number
    frameRate: number
  } | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  useEffect(() => {
    getCameraDevices()
    return () => {
      stopCamera()
    }
  }, [])

  const getCameraDevices = async () => {
    try {
      // Request permission first
      await navigator.mediaDevices.getUserMedia({ video: true })

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices
        .filter((device) => device.kind === 'videoinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Kamera ${device.deviceId.slice(0, 8)}`,
        }))

      setCameras(videoDevices)
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId)
      }
    } catch (err) {
      setError('Kamera qurilmalariga kirish rad etildi yoki mavjud emas')
      console.error('Error getting camera devices:', err)
    }
  }

  const startCamera = async () => {
    try {
      setError('')

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            const track = mediaStream.getVideoTracks()[0]
            const settings = track.getSettings()

            setVideoInfo({
              width: settings.width || videoRef.current.videoWidth,
              height: settings.height || videoRef.current.videoHeight,
              frameRate: settings.frameRate || 30,
            })
          }
        }
        await videoRef.current.play()
        setIsStreaming(true)
      }
    } catch (err) {
      setError('Kamerani ishga tushirishda xatolik yuz berdi')
      console.error('Error starting camera:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
    setVideoInfo(null)
    stopRecording()
  }

  const startRecording = () => {
    if (!stream) return

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      })

      mediaRecorderRef.current = mediaRecorder
      setRecordedChunks([])

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data])
        }
      }

      mediaRecorder.start(1000) // Record in 1-second chunks
      setIsRecording(true)
    } catch (err) {
      setError("Yozib olishni boshlab bo'lmadi")
      console.error('Error starting recording:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return

    const blob = new Blob(recordedChunks, { type: 'video/webm' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `camera-test-${new Date().toISOString().slice(0, 19)}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const takeScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    if (ctx) {
      ctx.drawImage(video, 0, 0)

      // Download screenshot
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `camera-screenshot-${new Date().toISOString().slice(0, 19)}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      })
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <ToolHeader title="Kamera Test" description="Kamerangizni sinab ko'ring, video yozing va screenshot oling" />

      {/* Camera Selection */}
      {cameras.length > 0 && (
        <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
          <div className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-zinc-200">Kamera tanlang:</label>
                <Select value={selectedCamera} onValueChange={setSelectedCamera}>
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
              <div className="flex gap-2">
                {!isStreaming ? (
                  <Button onClick={startCamera} disabled={!selectedCamera} className="bg-green-600 hover:bg-green-700">
                    <Camera className="mr-2 h-4 w-4" />
                    Kamerani yoqish
                  </Button>
                ) : (
                  <Button onClick={stopCamera} variant="destructive">
                    <CameraOff className="mr-2 h-4 w-4" />
                    To'xtatish
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-500/20 bg-red-500/10">
          <div className="p-4">
            <div className="text-red-400">{error}</div>
          </div>
        </Card>
      )}

      {/* Video Display */}
      <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
        <div className="p-6">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-800">
            {isStreaming ? (
              <>
                <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                <canvas ref={canvasRef} className="hidden" />

                {/* Recording indicator */}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-sm text-white">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    Yozilmoqda
                  </div>
                )}

                {/* Video info overlay */}
                {videoInfo && (
                  <div className="absolute top-4 right-4 rounded bg-black/70 px-3 py-1 text-sm text-white">
                    {videoInfo.width}×{videoInfo.height} @ {Math.round(videoInfo.frameRate)}fps
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                <div className="text-center">
                  <Camera className="mx-auto mb-4 h-16 w-16 opacity-50" />
                  <p>Kamerani yoqish uchun yuqoridagi tugmani bosing</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          {isStreaming && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={takeScreenshot} variant="outline" className="border-zinc-700">
                <Download className="mr-2 h-4 w-4" />
                Screenshot
              </Button>

              {!isRecording ? (
                <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
                  <Play className="mr-2 h-4 w-4" />
                  Yozib olish
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  <Square className="mr-2 h-4 w-4" />
                  To'xtatish
                </Button>
              )}

              {recordedChunks.length > 0 && (
                <Button onClick={downloadRecording} variant="outline" className="border-zinc-700">
                  <Download className="mr-2 h-4 w-4" />
                  Video yuklab olish
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Video Info */}
      {videoInfo && (
        <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Info className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Video Ma'lumotlari</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-sm text-zinc-400">Piksel o'lchami</div>
                <div className="text-zinc-100">
                  {videoInfo.width} × {videoInfo.height}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Kadr tezligi</div>
                <div className="text-zinc-100">{Math.round(videoInfo.frameRate)} FPS</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Sifat</div>
                <div className="text-zinc-100">
                  {videoInfo.height >= 1080 ? 'Full HD' : videoInfo.height >= 720 ? 'HD' : 'SD'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card className="border-zinc-800 bg-zinc-900/80">
        <div className="p-6">
          <h4 className="mb-3 font-medium text-zinc-200">Kamera test vositasi qanday ishlatiladi?</h4>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>
              <strong>1. Kamera tanlang:</strong> Agar bir nechta kamerangiz bo'lsa, ro'yxatdan kerakli birini tanlang
            </p>
            <p>
              <strong>2. Kamerani yoqing:</strong> "Kamerani yoqish" tugmasini bosing va brauzer ruxsatini bering
            </p>
            <p>
              <strong>3. Video test:</strong> O'zingizni ko'ring va kamera sifatini baholang
            </p>
            <p>
              <strong>4. Screenshot:</strong> Rasm saqlab qolish uchun "Screenshot" tugmasini bosing
            </p>
            <p>
              <strong>5. Video yozish:</strong> "Yozib olish" tugmasi bilan qisqa video yarating
            </p>
            <p>
              <strong>6. Yuklab olish:</strong> Screenshot yoki videoni kompyuteringizga saqlang
            </p>
          </div>

          <div className="mt-4 rounded-lg bg-blue-500/10 p-3">
            <div className="text-sm text-blue-400">
              <strong>Maslahat:</strong> Kamera ishlamayotgan bo'lsa, brauzer sozlamalarida kamera ruxsatini tekshiring
              yoki boshqa brauzerda sinab ko'ring.
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
