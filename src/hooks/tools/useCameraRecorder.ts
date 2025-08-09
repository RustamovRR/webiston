import { useState, useRef, useEffect, useCallback } from 'react'
import { useReactMediaRecorder } from 'react-media-recorder'
import { useTranslations } from 'next-intl'

export interface CameraDevice {
  deviceId: string
  label: string
}

export interface VideoInfo {
  width: number
  height: number
  frameRate: number
}

export interface CapturedMedia {
  id: string
  type: 'screenshot' | 'video'
  url: string
  filename: string
  timestamp: Date
  duration?: number
  size?: number
}

interface UseCameraRecorderOptions {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export const useCameraRecorder = (options: UseCameraRecorderOptions = {}) => {
  const t = useTranslations('CameraRecorderPage.Hook.messages')

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia[]>([])
  const [previewMedia, setPreviewMedia] = useState<CapturedMedia | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [recordingDuration, setRecordingDuration] = useState<number>(0)
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null)
  const [videoQuality, setVideoQuality] = useState<{ width: number; height: number }>({ width: 1280, height: 720 })

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
      width: { ideal: videoQuality.width },
      height: { ideal: videoQuality.height },
      frameRate: { ideal: 30 },
    },
    audio: true, // Enable audio recording
    askPermissionOnMount: false, // Don't auto-request permission
    onStart: () => {
      setRecordingStartTime(Date.now())
      onSuccess?.(t('recordingStarted'))
    },
    onStop: (blobUrl: string) => {
      const finalDuration = recordingDuration
      setRecordingStartTime(null)
      setRecordingDuration(0)

      if (blobUrl) {
        const timestamp = new Date()
        const filename = `video-${timestamp.toISOString().slice(0, 19).replace(/:/g, '-')}.webm`

        // Get blob size
        fetch(blobUrl).then((response) => {
          const media: CapturedMedia = {
            id: Date.now().toString(),
            type: 'video',
            url: blobUrl,
            filename,
            timestamp,
            duration: finalDuration,
            size: response.headers.get('content-length')
              ? parseInt(response.headers.get('content-length')!)
              : undefined,
          }
          setCapturedMedia((prev) => [media, ...prev])
        })

        onSuccess?.(t('recordingSaved'))
      }
    },
  })

  // Recording duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (status === 'recording' && recordingStartTime) {
      interval = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - recordingStartTime) / 1000))
      }, 1000)
    } else {
      setRecordingDuration(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [status, recordingStartTime])

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
          label: device.label || `${t('cameraDeviceLabel')} ${device.deviceId.slice(0, 8)}`,
        }))

      setCameras(videoDevices)
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId)
      }

      onSuccess?.(`${videoDevices.length} ${t('camerasFound')}`)
    } catch (err) {
      const errorMessage = t('cameraAccessDenied')
      setError(errorMessage)
      onError?.(errorMessage)
      console.error('Error getting camera devices:', err)
    }
  }, [onSuccess, onError])

  const startCamera = useCallback(async () => {
    try {
      setError('')

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: videoQuality.width },
          height: { ideal: videoQuality.height },
          frameRate: { ideal: 30 },
        },
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      // Store the camera stream for preview
      setCameraStream(mediaStream)

      // Set video info from the stream
      const track = mediaStream.getVideoTracks()[0]
      const settings = track.getSettings()

      const info: VideoInfo = {
        width: settings.width || videoQuality.width,
        height: settings.height || videoQuality.height,
        frameRate: settings.frameRate || 30,
      }

      setVideoInfo(info)
      setIsStreaming(true)
      setIsCameraActive(true)

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

      onSuccess?.(`${t('cameraStarted')}: ${info.width}x${info.height}`)
    } catch (err) {
      const errorMessage = t('cameraStartError')
      setError(errorMessage)
      onError?.(errorMessage)
      console.error('Error starting camera:', err)
    }
  }, [selectedCamera, videoQuality, onSuccess, onError])

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

    // Clean up camera stream state
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }

    setIsStreaming(false)
    setIsCameraActive(false)
    setVideoInfo(null)
    setError('')
    clearBlobUrl()
    onSuccess?.(t('cameraStopped'))
  }, [status, stopRecording, clearBlobUrl, cameraStream, onSuccess])

  const takeScreenshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) {
      onError?.(t('screenshotRequired'))
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
            const timestamp = new Date()
            const filename = `screenshot-${timestamp.toISOString().slice(0, 19).replace(/:/g, '-')}.png`

            const media: CapturedMedia = {
              id: Date.now().toString(),
              type: 'screenshot',
              url,
              filename,
              timestamp,
              size: blob.size,
            }

            setCapturedMedia((prev) => [media, ...prev])
            onSuccess?.(t('screenshotTaken'))
          }
        }, 'image/png')
      }
    } catch (err) {
      onError?.(t('screenshotError'))
      console.error('Error taking screenshot:', err)
    }
  }, [isCameraActive, onSuccess, onError])

  const downloadMedia = useCallback(
    (media: CapturedMedia) => {
      const a = document.createElement('a')
      a.href = media.url
      a.download = media.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      onSuccess?.(media.type === 'screenshot' ? t('screenshotDownloaded') : t('videoDownloaded'))
    },
    [onSuccess],
  )

  const deleteMedia = useCallback(
    (mediaId: string) => {
      setCapturedMedia((prev) => {
        const mediaToDelete = prev.find((m) => m.id === mediaId)
        if (mediaToDelete) {
          URL.revokeObjectURL(mediaToDelete.url)
          onSuccess?.(mediaToDelete.type === 'screenshot' ? t('screenshotDeleted') : t('videoDeleted'))
        }
        return prev.filter((m) => m.id !== mediaId)
      })

      // Close preview if this media was being previewed
      if (previewMedia?.id === mediaId) {
        setPreviewMedia(null)
      }
    },
    [previewMedia, onSuccess],
  )

  const openPreview = useCallback((media: CapturedMedia) => {
    setPreviewMedia(media)
  }, [])

  const closePreview = useCallback(() => {
    setPreviewMedia(null)
  }, [])

  // Sample data for testing
  const getSampleData = useCallback(() => {
    return {
      cameras: [
        { deviceId: 'sample1', label: 'Front Camera' },
        { deviceId: 'sample2', label: 'Back Camera' },
      ],
      videoInfo: { width: 1280, height: 720, frameRate: 30 },
    }
  }, [])

  const switchCamera = useCallback(
    (deviceId: string) => {
      setSelectedCamera(deviceId)

      // If camera is currently active, restart with new camera
      if (isCameraActive) {
        stopCamera()
        // Wait a bit for cleanup
        setTimeout(() => {
          startCamera()
        }, 500)
      }
    },
    [isCameraActive, stopCamera, startCamera],
  )

  const refreshCameras = useCallback(async () => {
    try {
      onSuccess?.(t('camerasRefreshing'))

      // Clear current cameras list
      setCameras([])
      setSelectedCamera('')

      // Refresh cameras list
      await getCameraDevices()

      onSuccess?.(t('camerasRefreshed'))
    } catch (err) {
      onError?.(t('camerasRefreshError'))
      console.error('Error refreshing cameras:', err)
    }
  }, [onSuccess, onError, getCameraDevices])

  const downloadRecording = useCallback(() => {
    if (mediaBlobUrl) {
      const a = document.createElement('a')
      a.href = mediaBlobUrl
      a.download = `camera-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      onSuccess?.(t('recordingDownloaded'))
    }
  }, [mediaBlobUrl, onSuccess])

  const getCameraStats = useCallback(() => {
    return {
      isActive: isCameraActive,
      recordingStatus: status,
      screenshotCount: capturedMedia.filter((m) => m.type === 'screenshot').length,
      videoCount: capturedMedia.filter((m) => m.type === 'video').length,
      totalMedia: capturedMedia.length,
      hasPreview: !!previewMedia,
      videoInfo,
    }
  }, [isCameraActive, status, capturedMedia, previewMedia, videoInfo])

  const updateVideoQuality = useCallback(
    (quality: { width: number; height: number }) => {
      setVideoQuality(quality)

      // If camera is currently active, restart with new quality
      if (isCameraActive) {
        stopCamera()
        // Wait a bit for cleanup
        setTimeout(() => {
          startCamera()
        }, 500)
      }
    },
    [isCameraActive, stopCamera, startCamera],
  )

  const formatRecordingDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const getCurrentRecordingInfo = useCallback(() => {
    return {
      isRecording: status === 'recording',
      duration: recordingDuration,
      formattedDuration: formatRecordingDuration(recordingDuration),
      quality: videoQuality,
      qualityLabel: `${videoQuality.width}×${videoQuality.height}`,
      frameRate: videoInfo?.frameRate || 30,
      status: status,
    }
  }, [status, recordingDuration, formatRecordingDuration, videoQuality, videoInfo])

  // Auto-initialize camera devices on mount - only once
  useEffect(() => {
    getCameraDevices()
  }, []) // Empty dependency array - run only once

  return {
    videoRef,
    canvasRef,
    isStreaming,
    isCameraActive,
    cameras,
    selectedCamera,
    error,
    videoInfo,
    status,
    mediaBlobUrl,
    previewStream,
    cameraStream,
    isRecording: status === 'recording',
    capturedMedia,
    previewMedia,
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
    getSampleData,
    downloadMedia,
    deleteMedia,
    openPreview,
    closePreview,
    recordingDuration,
    recordingStartTime,
    videoQuality,
    updateVideoQuality,
    formatRecordingDuration,
    getCurrentRecordingInfo,
  }
}
