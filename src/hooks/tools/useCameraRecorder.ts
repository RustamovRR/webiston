import { useState, useRef, useEffect, useCallback } from 'react'
import { useReactMediaRecorder } from 'react-media-recorder'

export interface CameraDevice {
  deviceId: string
  label: string
}

export interface VideoInfo {
  width: number
  height: number
  frameRate: number
}

interface UseCameraRecorderOptions {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export const useCameraRecorder = (options: UseCameraRecorderOptions = {}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [screenshotCount, setScreenshotCount] = useState(0)

  const { onSuccess, onError } = options

  // React Media Recorder hook
  const {
    status,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    mediaBlobUrl,
    previewStream,
    clearBlobUrl,
  } = useReactMediaRecorder({
    video: {
      deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 },
    },
    audio: false, // Video only for camera recorder
    askPermissionOnMount: true, // Auto-request permission
    onStart: () => {
      onSuccess?.('Video yozib olish boshlandi')
    },
    onStop: (blobUrl: string) => {
      onSuccess?.('Video yozib olish tugallandi')
    },
  })

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

      // Just get user media to check permission and set streaming state
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      // Set video info from the stream
      const track = mediaStream.getVideoTracks()[0]
      const settings = track.getSettings()

      const info: VideoInfo = {
        width: settings.width || 1280,
        height: settings.height || 720,
        frameRate: settings.frameRate || 30,
      }

      setVideoInfo(info)
      setIsStreaming(true)

      // Set up our own video ref for screenshot functionality
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.muted = true
        videoRef.current.playsInline = true

        try {
          await videoRef.current.play()
        } catch (playError) {
          console.log('Autoplay issue, but camera should work:', playError)
        }
      }

      onSuccess?.(`Kamera ishga tushirildi: ${info.width}x${info.height}`)
    } catch (err) {
      const errorMessage = 'Kamerani ishga tushirishda xatolik yuz berdi'
      setError(errorMessage)
      onError?.(errorMessage)
      console.error('Error starting camera:', err)
    }
  }, [selectedCamera, onSuccess, onError])

  const stopCamera = useCallback(() => {
    // Stop any ongoing recording first
    if (status === 'recording') {
      stopRecording()
    }

    // Stop the camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => {
        track.stop()
        console.log('Stopped track:', track.kind, track.label)
      })
      videoRef.current.srcObject = null
    }

    setIsStreaming(false)
    setVideoInfo(null)
    setError('')
    clearBlobUrl()
    onSuccess?.("Kamera to'xtatildi")
  }, [status, stopRecording, clearBlobUrl, onSuccess])

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

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `camera-recorder-screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            setScreenshotCount((prev) => prev + 1)

            onSuccess?.('Screenshot muvaffaqiyatli saqlandi')
          }
        })
      }
    } catch (err) {
      onError?.('Screenshot olishda xatolik yuz berdi')
      console.error('Error taking screenshot:', err)
    }
  }, [onSuccess, onError])

  const downloadRecording = useCallback(() => {
    if (!mediaBlobUrl) {
      onError?.('Yuklab olish uchun video mavjud emas')
      return
    }

    try {
      const a = document.createElement('a')
      a.href = mediaBlobUrl
      a.download = `camera-recorder-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      onSuccess?.('Video muvaffaqiyatli yuklab olindi')
    } catch (err) {
      onError?.('Video yuklab olishda xatolik yuz berdi')
      console.error('Error downloading recording:', err)
    }
  }, [mediaBlobUrl, onSuccess, onError])

  const refreshCameras = useCallback(() => {
    getCameraDevices()
  }, [getCameraDevices])

  const switchCamera = useCallback(
    (deviceId: string) => {
      setSelectedCamera(deviceId)
      // If currently streaming, restart with new camera
      if (isStreaming) {
        stopCamera()
        setTimeout(() => {
          startCamera()
        }, 500)
      }
    },
    [isStreaming, stopCamera, startCamera],
  )

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

  // Auto-refresh cameras on mount
  useEffect(() => {
    getCameraDevices()
  }, [])

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return {
    // Refs
    videoRef,
    canvasRef,

    // State
    isStreaming,
    cameras,
    selectedCamera,
    error,
    videoInfo,
    screenshotCount,

    // React Media Recorder state
    status,
    mediaBlobUrl,
    previewStream,
    isRecording: status === 'recording',

    // Actions
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

    // Utilities
    getCameraStats,
    getVideoQuality,
  }
}
