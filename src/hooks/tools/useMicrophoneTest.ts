import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'

export interface AudioDevice {
  deviceId: string
  label: string
}

export interface AudioInfo {
  sampleRate: number
  channelCount: number
  echoCancellation: boolean
  noiseSuppression: boolean
  autoGainControl: boolean
}

export interface RecordedAudio {
  id: string
  name: string
  url: string
  blob: Blob
  duration: number
  timestamp: Date
  size: number
  format: string
}

export interface AudioStats {
  level: number
  peak: number
  rms: number
  frequency: Uint8Array
  waveform: Uint8Array
}

interface UseMicrophoneTestOptions {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export const useMicrophoneTest = (options: UseMicrophoneTestOptions = {}) => {
  const t = useTranslations('MicrophoneTestPage.Hook.messages')

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])

  // State
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string>('')
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null)
  const [recordedAudios, setRecordedAudios] = useState<RecordedAudio[]>([])
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null)
  const [previewAudio, setPreviewAudio] = useState<RecordedAudio | null>(null)

  // Audio analysis state
  const [audioStats, setAudioStats] = useState<AudioStats>({
    level: 0,
    peak: 0,
    rms: 0,
    frequency: new Uint8Array(0),
    waveform: new Uint8Array(0),
  })

  const { onSuccess, onError } = options

  // Sample microphones for testing
  const sampleMicrophones = [
    {
      name: 'Standart Mikrofon',
      description: 'Asosiy audio kirish qurilmasi',
      tip: "Kompyuteringizning o'rnatilgan mikrofonini sinab ko'ring",
    },
    {
      name: 'USB Mikrofon',
      description: 'Tashqi USB audio qurilmasi',
      tip: 'Yuqori sifatli audio yozish uchun',
    },
    {
      name: 'Bluetooth Quloqchin',
      description: 'Simsiz audio qurilmasi',
      tip: 'Bluetooth ulanishi orqali audio kirish',
    },
  ]

  // Get available audio devices
  const getAudioDevices = useCallback(async () => {
    try {
      // Request permission first
      const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      permissionStream.getTracks().forEach((track) => track.stop())

      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => {
          let label = device.label || `${t('deviceLabel')} ${device.deviceId.slice(0, 8)}`

          // Shorten common long device names for better UI
          label = label
            .replace(/^Default - /, '')
            .replace(/\(Built-in\)/, '(Built-in)')
            .replace(/USB Audio Device/, 'USB Audio')
            .replace(/Microphone/, 'Mic')
            .replace(/Communications/, 'Comm')

          // Limit to reasonable length
          if (label.length > 35) {
            label = label.substring(0, 32) + '...'
          }

          return {
            deviceId: device.deviceId,
            label,
          }
        })

      setAudioDevices(audioInputs)
      if (audioInputs.length > 0 && !selectedDevice) {
        setSelectedDevice(audioInputs[0].deviceId)
      }

      onSuccess?.(`${audioInputs.length} ${t('devicesFound')}`)
    } catch (err) {
      const errorMessage = t('deviceAccessDenied')
      setError(errorMessage)
      onError?.(errorMessage)
      console.error('Error getting audio devices:', err)
    }
  }, [onSuccess, onError, selectedDevice])

  // Stop listening
  const stopListening = useCallback(() => {
    // Stop recording if active
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Cancel animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    setIsListening(false)
    setAudioStats({
      level: 0,
      peak: 0,
      rms: 0,
      frequency: new Uint8Array(0),
      waveform: new Uint8Array(0),
    })

    onSuccess?.(t('microphoneStopped'))
  }, [isRecording, onSuccess])

  // Start listening to microphone
  const startListening = useCallback(async () => {
    try {
      setError('')

      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 2,
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Create audio context for analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      analyser.minDecibels = -90
      analyser.maxDecibels = -10
      analyserRef.current = analyser

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // Get audio info from track settings
      const track = stream.getAudioTracks()[0]
      const settings = track.getSettings()

      const info: AudioInfo = {
        sampleRate: settings.sampleRate || 44100,
        channelCount: settings.channelCount || 2,
        echoCancellation: settings.echoCancellation || false,
        noiseSuppression: settings.noiseSuppression || false,
        autoGainControl: settings.autoGainControl || false,
      }

      setAudioInfo(info)
      setIsListening(true)

      onSuccess?.(t('microphoneStarted'))

      // Audio analysis will start automatically via useEffect
    } catch (err) {
      const errorMessage = t('microphoneStartError')
      setError(errorMessage)
      onError?.(errorMessage)
      console.error('Error starting microphone:', err)
    }
  }, [selectedDevice, onSuccess, onError])

  // Effect to start/stop audio analysis based on listening state
  useEffect(() => {
    if (isListening && analyserRef.current) {
      // Start audio analysis when listening begins
      const startAnalysis = () => {
        if (!analyserRef.current) return

        const bufferLength = analyserRef.current.frequencyBinCount
        const frequencyData = new Uint8Array(bufferLength)
        const waveformData = new Uint8Array(bufferLength)

        const analyze = () => {
          if (!analyserRef.current || !isListening) return

          // Get frequency and waveform data
          analyserRef.current.getByteFrequencyData(frequencyData)
          analyserRef.current.getByteTimeDomainData(waveformData)

          // Calculate audio level (RMS)
          let sum = 0
          let peak = 0
          for (let i = 0; i < frequencyData.length; i++) {
            const value = frequencyData[i] / 255
            sum += value * value
            peak = Math.max(peak, value)
          }
          const rms = Math.sqrt(sum / frequencyData.length)
          const level = Math.min(rms * 100, 100)

          setAudioStats({
            level,
            peak: peak * 100,
            rms: rms * 100,
            frequency: new Uint8Array(frequencyData),
            waveform: new Uint8Array(waveformData),
          })

          if (isListening) {
            animationRef.current = requestAnimationFrame(analyze)
          }
        }

        analyze()
      }

      startAnalysis()
    } else if (!isListening && animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [isListening])

  // Start recording
  const startRecording = useCallback(() => {
    if (!streamRef.current) {
      setError(t('microphoneStartError'))
      return
    }

    try {
      recordingChunksRef.current = []

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus',
      })

      mediaRecorderRef.current = mediaRecorder
      setRecordingStartTime(Date.now())
      setRecordingDuration(0)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data)
        }
      }

      const startTime = Date.now() // Capture start time in closure
      setRecordingStartTime(startTime)

      mediaRecorder.onstop = () => {
        const finalDuration = Math.floor((Date.now() - startTime) / 1000)

        const blob = new Blob(recordingChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        const timestamp = new Date()
        const filename = `audio-${timestamp.toISOString().slice(0, 19).replace(/:/g, '-')}.webm`

        const audioRecord: RecordedAudio = {
          id: Date.now().toString(),
          name: filename,
          url,
          blob,
          duration: finalDuration,
          timestamp,
          size: blob.size,
          format: 'WebM/Opus',
        }

        setRecordedAudios((prev) => [audioRecord, ...prev])
        setRecordingStartTime(null)
        setRecordingDuration(0)

        onSuccess?.(t('audioRecorded'))
      }

      mediaRecorder.start(1000)
      setIsRecording(true)

      onSuccess?.(t('recordingStarted'))
    } catch (err) {
      const errorMessage = t('recordingError')
      setError(errorMessage)
      onError?.(errorMessage)
      console.error('Error starting recording:', err)
    }
  }, [onSuccess, onError, t])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  // Recording duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRecording && recordingStartTime) {
      interval = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - recordingStartTime) / 1000))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording, recordingStartTime])

  // Switch microphone
  const switchMicrophone = useCallback((deviceId: string) => {
    setSelectedDevice(deviceId)
  }, [])

  // Download audio
  const downloadAudio = useCallback(
    (audio: RecordedAudio) => {
      const a = document.createElement('a')
      a.href = audio.url
      a.download = audio.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      onSuccess?.(t('audioDownloaded'))
    },
    [onSuccess],
  )

  // Delete audio
  const deleteAudio = useCallback(
    (audioId: string) => {
      setRecordedAudios((prev) => {
        const audio = prev.find((a) => a.id === audioId)
        if (audio) {
          URL.revokeObjectURL(audio.url)
        }
        return prev.filter((a) => a.id !== audioId)
      })

      onSuccess?.(t('audioDeleted'))
    },
    [onSuccess],
  )

  // Clear all recordings
  const clearAllRecordings = useCallback(() => {
    recordedAudios.forEach((audio) => {
      URL.revokeObjectURL(audio.url)
    })
    setRecordedAudios([])

    onSuccess?.(t('allAudiosDeleted'))
  }, [recordedAudios, onSuccess])

  // Preview audio
  const openPreview = useCallback((audio: RecordedAudio) => {
    setPreviewAudio(audio)
  }, [])

  const closePreview = useCallback(() => {
    setPreviewAudio(null)
  }, [])

  // Format duration
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Get audio quality rating
  const getAudioQuality = useCallback(
    (level: number) => {
      if (level > 60) return { text: t('qualityExcellent'), color: 'text-green-400' }
      if (level > 40) return { text: t('qualityGood'), color: 'text-blue-400' }
      if (level > 20) return { text: t('qualityAverage'), color: 'text-yellow-400' }
      return { text: t('qualityPoor'), color: 'text-red-400' }
    },
    [t],
  )

  // Get stats for display
  const getStats = useCallback(() => {
    return [
      { label: t('statsAudioLevel'), value: Math.round(audioStats.level) },
      { label: t('statsRecorded'), value: recordedAudios.length },
      { label: t('statsDuration'), value: recordingDuration },
    ]
  }, [audioStats.level, recordedAudios.length, recordingDuration, t])

  // Initialize on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      getAudioDevices()
    }

    return () => {
      stopListening()
    }
  }, [])

  return {
    // State
    audioDevices,
    selectedDevice,
    isListening,
    isRecording,
    error,
    audioInfo,
    recordedAudios,
    recordingDuration,
    previewAudio,
    audioStats,
    sampleMicrophones,

    // Actions
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
    closePreview,

    // Utilities
    formatDuration,
    getAudioQuality,
    getStats,
  }
}
