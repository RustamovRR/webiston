'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Play, Square, Download, Volume2, VolumeX } from 'lucide-react'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AudioDevice {
  deviceId: string
  label: string
}

export default function MicrophoneTestPage() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  const [microphones, setMicrophones] = useState<AudioDevice[]>([])
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('')
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string>('')
  const [audioLevel, setAudioLevel] = useState<number>(0)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    getMicrophoneDevices()
    return () => {
      // Cleanup when component unmounts
      stopListening()
      if (timerInterval) clearInterval(timerInterval)
    }
  }, [])

  // Cleanup effect for when selectedMicrophone changes
  useEffect(() => {
    if (isListening && selectedMicrophone) {
      // Restart microphone with new device
      stopListening()
      setTimeout(() => {
        startListening()
      }, 100)
    }
  }, [selectedMicrophone])

  const getMicrophoneDevices = async () => {
    try {
      // Request permission first
      const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the permission stream immediately, we just needed permission
      permissionStream.getTracks().forEach((track) => track.stop())

      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioDevices = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Mikrofon ${device.deviceId.slice(0, 8)}`,
        }))

      setMicrophones(audioDevices)
      if (audioDevices.length > 0 && !selectedMicrophone) {
        setSelectedMicrophone(audioDevices[0].deviceId)
      }
    } catch (err) {
      setError('Mikrofon qurilmalariga kirish rad etildi yoki mavjud emas')
      console.error('Error getting microphone devices:', err)
    }
  }

  const startListening = async () => {
    try {
      setError('')

      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Create audio context for visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      setIsListening(true)

      // Start visualization
      visualizeAudio()
    } catch (err) {
      setError('Mikrofonni ishga tushirishda xatolik yuz berdi')
      console.error('Error starting microphone:', err)
    }
  }

  const stopListening = () => {
    // Stop recording first
    stopRecording()

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
        console.log('Stopped track:', track.kind, track.label)
      })
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
    setAudioLevel(0)
  }

  const visualizeAudio = () => {
    if (!analyserRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount)

    const draw = () => {
      if (!analyserRef.current || !isListening) return

      // Get time domain data for waveform
      analyserRef.current.getByteTimeDomainData(dataArray)
      // Get frequency data for level calculation
      analyserRef.current.getByteFrequencyData(frequencyData)

      // Calculate audio level from frequency data
      let sum = 0
      for (let i = 0; i < frequencyData.length; i++) {
        sum += frequencyData[i]
      }
      const average = sum / frequencyData.length
      const level = Math.min((average / 255) * 100, 100)
      setAudioLevel(level)

      // Clear canvas
      ctx.fillStyle = 'rgb(15, 23, 42)' // zinc-900
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw waveform
      ctx.lineWidth = 2
      ctx.strokeStyle = level > 20 ? '#10b981' : '#64748b' // green-500 or slate-500
      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.stroke()

      // Draw frequency bars (spectrum analyzer)
      const barWidth = canvas.width / (frequencyData.length / 4) // Use only lower frequencies
      let barHeight
      let xPos = 0

      for (let i = 0; i < frequencyData.length / 4; i++) {
        barHeight = (frequencyData[i] / 255) * canvas.height * 0.3 // Scale down the bars

        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
        if (frequencyData[i] > 100) {
          gradient.addColorStop(0, '#ef4444') // red-500
          gradient.addColorStop(0.5, '#f59e0b') // amber-500
          gradient.addColorStop(1, '#10b981') // green-500
        } else if (frequencyData[i] > 50) {
          gradient.addColorStop(0, '#f59e0b') // amber-500
          gradient.addColorStop(1, '#10b981') // green-500
        } else {
          gradient.addColorStop(0, '#10b981') // green-500
          gradient.addColorStop(1, '#6b7280') // gray-500
        }

        ctx.fillStyle = gradient
        ctx.fillRect(xPos, canvas.height - barHeight, barWidth - 1, barHeight)

        xPos += barWidth
      }

      // Continue animation
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
  }

  const startRecording = () => {
    if (!streamRef.current) return

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus',
      })

      mediaRecorderRef.current = mediaRecorder
      setRecordedChunks([])
      setRecordingTime(0)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data])
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setRecordedAudio(url)
      }

      mediaRecorder.start(1000)
      setIsRecording(true)

      // Start timer
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
      setTimerInterval(interval)
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

    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
  }

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return

    const blob = new Blob(recordedChunks, { type: 'audio/webm' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `microphone-test-${new Date().toISOString().slice(0, 19)}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <ToolHeader title="Mikrofon Test" description="Mikrofonni sinab ko'ring, ovoz yozing va sifatini tekshiring" />

      {/* Microphone Selection */}
      {microphones.length > 0 && (
        <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
          <div className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-zinc-200">Mikrofon tanlang:</label>
                <Select value={selectedMicrophone} onValueChange={setSelectedMicrophone}>
                  <SelectTrigger className="border-zinc-700 bg-zinc-800">
                    <SelectValue placeholder="Mikrofon tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {microphones.map((microphone) => (
                      <SelectItem key={microphone.deviceId} value={microphone.deviceId}>
                        {microphone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                {!isListening ? (
                  <Button
                    onClick={startListening}
                    disabled={!selectedMicrophone}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    Mikrofonni yoqish
                  </Button>
                ) : (
                  <Button onClick={stopListening} variant="destructive">
                    <MicOff className="mr-2 h-4 w-4" />
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

      {/* Audio Visualization */}
      <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              {audioLevel > 10 ? (
                <Volume2 className="h-5 w-5 text-blue-400" />
              ) : (
                <VolumeX className="h-5 w-5 text-zinc-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">Audio Vizualizatsiya</h3>
              <p className="text-sm text-zinc-400">Ovoz darajasi: {Math.round(audioLevel)}%</p>
            </div>
          </div>

          {/* Waveform Canvas */}
          <div className="relative mb-4 overflow-hidden rounded-lg bg-zinc-800">
            <canvas ref={canvasRef} width={800} height={200} className="h-32 w-full sm:h-48" />

            {/* Audio Level Indicator */}
            <div className="absolute right-4 bottom-4 left-4">
              <div className="h-2 overflow-hidden rounded-full bg-zinc-700">
                <div
                  className={`h-full transition-all duration-100 ${
                    audioLevel > 70 ? 'bg-red-500' : audioLevel > 30 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-sm text-white">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                {formatTime(recordingTime)}
              </div>
            )}
          </div>

          {/* Controls */}
          {isListening && (
            <div className="flex flex-wrap gap-2">
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
                  Audio yuklab olish
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Recorded Audio Playback */}
      {recordedAudio && (
        <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">Yozilgan Audio</h3>
            <audio controls src={recordedAudio} className="w-full rounded bg-zinc-800" />
          </div>
        </Card>
      )}

      {/* Audio Quality Info */}
      {isListening && (
        <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">Audio Sifat Ko'rsatkichlari</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-sm text-zinc-400">Joriy daraja</div>
                <div className="text-zinc-100">{Math.round(audioLevel)}%</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Sifat baholash</div>
                <div
                  className={`${
                    audioLevel > 50 ? 'text-green-400' : audioLevel > 20 ? 'text-yellow-400' : 'text-red-400'
                  }`}
                >
                  {audioLevel > 50 ? 'Yaxshi' : audioLevel > 20 ? "O'rtacha" : 'Past'}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Holat</div>
                <div className={`${isListening ? 'text-green-400' : 'text-red-400'}`}>
                  {isListening ? 'Faol' : "O'chirilgan"}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card className="border-zinc-800 bg-zinc-900/80">
        <div className="p-6">
          <h4 className="mb-3 font-medium text-zinc-200">Mikrofon test vositasi qanday ishlatiladi?</h4>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>
              <strong>1. Mikrofon tanlang:</strong> Agar bir nechta mikrofoningiz bo'lsa, ro'yxatdan kerakli birini
              tanlang
            </p>
            <p>
              <strong>2. Mikrofonni yoqing:</strong> "Mikrofonni yoqish" tugmasini bosing va brauzer ruxsatini bering
            </p>
            <p>
              <strong>3. Ovoz test:</strong> Gapiring va ovoz darajasini kuzating
            </p>
            <p>
              <strong>4. Sifat baholash:</strong> Vizualizatsiya va ko'rsatkichlar orqali mikrofon sifatini baholang
            </p>
            <p>
              <strong>5. Audio yozish:</strong> "Yozib olish" tugmasi bilan ovozingizni yozib oling
            </p>
            <p>
              <strong>6. Yuklab olish:</strong> Yozilgan audioni kompyuteringizga saqlang
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="rounded-lg bg-green-500/10 p-3">
              <div className="text-sm text-green-400">
                <strong>Yaxshi sifat:</strong> 50% dan yuqori ovoz darajasi (yashil rangli ko'rsatkich)
              </div>
            </div>
            <div className="rounded-lg bg-yellow-500/10 p-3">
              <div className="text-sm text-yellow-400">
                <strong>O'rtacha sifat:</strong> 20-50% ovoz darajasi (sariq rangli ko'rsatkich)
              </div>
            </div>
            <div className="rounded-lg bg-red-500/10 p-3">
              <div className="text-sm text-red-400">
                <strong>Past sifat:</strong> 20% dan past ovoz darajasi (qizil rangli ko'rsatkich)
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
