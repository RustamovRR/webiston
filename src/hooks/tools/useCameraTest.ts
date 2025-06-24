import { useState, useRef, useEffect, useCallback } from 'react'

export interface CameraDevice {
  deviceId: string
  label: string
}

export interface VideoInfo {
  width: number
  height: number
  frameRate: number
}

interface UseCameraTestOptions {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export const useCameraTest = (options: UseCameraTestOptions = {}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])

  const { onSuccess, onError } = options

  const getCameraDevices = useCallback(async () => {
    try {
      // Request permission first
      const permissionStream = await navigator.mediaDevices.getUserMedia({ video: true })
      // Stop the permission stream immediately, we just needed permission
      permissionStream.getTracks().forEach((track) => track.stop())

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

      onSuccess?.(`${videoDevices.length} ta kamera topildi`)
    } catch (err) {
      const errorMessage = 'Kamera qurilmalariga kirish rad etildi yoki mavjud emas'
      setError(errorMessage)
      onError?.(errorMessage)
      console.error('Error getting camera devices:', err)
    }
  }, [selectedCamera, onSuccess, onError])

  const startCamera = useCallback(async () => {
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

        // Wait for metadata to load
        const handleLoadedMetadata = () => {
          if (videoRef.current && mediaStream) {
            const track = mediaStream.getVideoTracks()[0]
            const settings = track.getSettings()

            const info: VideoInfo = {
              width: settings.width || videoRef.current.videoWidth,
              height: settings.height || videoRef.current.videoHeight,
              frameRate: settings.frameRate || 30,
            }

            setVideoInfo(info)
            setIsStreaming(true)
            onSuccess?.(`Kamera ishga tushirildi: ${info.width}x${info.height}`)
          }
        }

        // Add event listener for metadata loaded
        videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)

        // Also try to play the video
        try {
          await videoRef.current.play()
        } catch (playError) {
          console.error('Error playing video:', playError)
          // Even if autoplay fails, the video should still show
          setIsStreaming(true)
        }
      }
    } catch (err) {
      const errorMessage = 'Kamerani ishga tushirishda xatolik yuz berdi'
      setError(errorMessage)
      onError?.(errorMessage)
      console.error('Error starting camera:', err)
    }
  }, [selectedCamera, onSuccess, onError])

  const stopCamera = useCallback(() => {
    // Stop recording first
    stopRecording()

    // Stop all tracks
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop()
        console.log('Stopped track:', track.kind, track.label)
      })
      setStream(null)
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.load() // Force reload to clear any cached stream
    }

    setIsStreaming(false)
    setVideoInfo(null)
    setError('')
    onSuccess?.("Kamera to'xtatildi")
  }, [stream, onSuccess])

  const startRecording = useCallback(() => {
    if (!stream) {
      onError?.('Yozib olish uchun avval kamerani yoqing')
      return
    }

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

      mediaRecorder.onstop = () => {
        onSuccess?.('Video yozib olish tugallandi')
      }

      mediaRecorder.start(1000) // Record in 1-second chunks
      setIsRecording(true)
      onSuccess?.('Video yozib olish boshlandi')
    } catch (err) {
      const errorMessage = "Yozib olishni boshlab bo'lmadi"
      setError(errorMessage)
      onError?.(errorMessage)
      console.error('Error starting recording:', err)
    }
  }, [stream, onSuccess, onError])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const downloadRecording = useCallback(() => {
    if (recordedChunks.length === 0) {
      onError?.('Yuklab olish uchun video mavjud emas')
      return
    }

    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `camera-test-${new Date().toISOString().slice(0, 19)}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      onSuccess?.('Video muvaffaqiyatli yuklab olindi')
    } catch (err) {
      onError?.('Video yuklab olishda xatolik yuz berdi')
      console.error('Error downloading recording:', err)
    }
  }, [recordedChunks, onSuccess, onError])

  const takeScreenshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      onError?.("Screenshot olish uchun kamera yoqilgan bo'lishi kerak")
      return
    }

    try {
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

            onSuccess?.('Screenshot muvaffaqiyatli saqlandi')
          }
        })
      }
    } catch (err) {
      onError?.('Screenshot olishda xatolik yuz berdi')
      console.error('Error taking screenshot:', err)
    }
  }, [onSuccess, onError])

  const refreshCameras = useCallback(() => {
    getCameraDevices()
  }, [getCameraDevices])

  const switchCamera = useCallback((deviceId: string) => {
    setSelectedCamera(deviceId)
  }, [])

  const getVideoQuality = useCallback(() => {
    if (!videoInfo) return 'Unknown'

    if (videoInfo.height >= 1080) return 'Full HD (1080p)'
    if (videoInfo.height >= 720) return 'HD (720p)'
    if (videoInfo.height >= 480) return 'SD (480p)'
    return 'Low Quality'
  }, [videoInfo])

  const getCameraStats = useCallback(() => {
    if (!videoInfo) return null

    return {
      resolution: `${videoInfo.width} × ${videoInfo.height}`,
      frameRate: `${Math.round(videoInfo.frameRate)} FPS`,
      quality: getVideoQuality(),
      aspectRatio: (videoInfo.width / videoInfo.height).toFixed(2),
    }
  }, [videoInfo, getVideoQuality])

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Auto-refresh cameras on mount
  useEffect(() => {
    getCameraDevices()
  }, [])

  // Handle camera switching
  useEffect(() => {
    if (isStreaming && selectedCamera) {
      // Restart camera with new device
      stopCamera()
      setTimeout(() => {
        startCamera()
      }, 100)
    }
  }, [selectedCamera])

  return {
    // Refs
    videoRef,
    canvasRef,

    // State
    stream,
    isStreaming,
    cameras,
    selectedCamera,
    error,
    videoInfo,
    isRecording,
    recordedChunks: recordedChunks.length > 0,

    // Actions
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    downloadRecording,
    takeScreenshot,
    refreshCameras,
    switchCamera,

    // Utilities
    getCameraStats,
    getVideoQuality,
  }
}
