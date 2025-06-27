'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Play, Square, Download, Volume2, VolumeX, RefreshCw, Trash2 } from 'lucide-react'
import { ToolHeader, StatsDisplay } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { AudioVisualizer, AudioGridItem } from './components'
import { motion, AnimatePresence } from 'framer-motion'
import { useMicrophoneTest } from '@/hooks/tools/useMicrophoneTest'

interface AudioDevice {
  deviceId: string
  label: string
}

export default function MicrophoneTest() {
  const {
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
      <ToolHeader title="Mikrofon Test" description="Professional audio test, visualization va yozib olish vositasi" />

      <div className="mb-8">
        <StatsDisplay stats={getStats()} />
      </div>

      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium text-zinc-300">Audio Sozlamalari</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-green-500' : 'bg-zinc-500'}`}></div>
            <span className="text-xs text-zinc-500">{isListening ? 'Faol' : 'Nofaol'}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="md:col-span-2 lg:col-span-1">
              <label className="mb-2 block text-sm font-medium text-zinc-200">Mikrofon:</label>
              <Select value={selectedDevice} onValueChange={switchMicrophone} disabled={audioDevices.length === 0}>
                <SelectTrigger className="h-10 w-full border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 focus:border-zinc-600">
                  <SelectValue placeholder="Mikrofon tanlang" />
                </SelectTrigger>
                <SelectContent
                  className="max-w-[300px] border-zinc-700 bg-zinc-800"
                  position="popper"
                  side="bottom"
                  align="start"
                >
                  {audioDevices.map((device) => (
                    <SelectItem
                      key={device.deviceId}
                      value={device.deviceId}
                      className="max-w-[280px] truncate text-zinc-200 hover:bg-zinc-700 focus:bg-zinc-700"
                    >
                      <span className="truncate" title={device.label}>
                        {device.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">Sifat:</label>
              <div className="flex h-10 items-center rounded-lg border border-zinc-700 bg-zinc-800 px-3">
                <div
                  className={`mr-2 h-2 w-2 rounded-full ${
                    audioQuality.text === 'Ajoyib'
                      ? 'bg-green-500'
                      : audioQuality.text === 'Yaxshi'
                        ? 'bg-blue-500'
                        : audioQuality.text === "O'rtacha"
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                  }`}
                ></div>
                <span className={`text-sm font-medium ${audioQuality.color}`}>{audioQuality.text}</span>
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={getAudioDevices} variant="outline" className="w-full border-zinc-700 hover:bg-zinc-700">
                <RefreshCw className="mr-2 h-4 w-4" />
                Yangilash
              </Button>
            </div>

            <div className="flex items-end gap-2">
              {!isListening ? (
                <ShimmerButton
                  onClick={startListening}
                  disabled={!selectedDevice || audioDevices.length === 0}
                  className="flex-1"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Mikrofonni Yoqish
                </ShimmerButton>
              ) : (
                <Button onClick={stopListening} variant="destructive" className="flex-1">
                  <MicOff className="mr-2 h-4 w-4" />
                  Mikrofonni O'chirish
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-medium text-zinc-300">Audio Vizualizatsiya</span>
            </div>
            <div className="flex items-center gap-2">
              {isRecording && (
                <>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
                  <span className="text-xs text-red-400">REC {formatDuration(recordingDuration)}</span>
                </>
              )}
              {!isRecording && (
                <>
                  <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-green-500' : 'bg-zinc-500'}`}></div>
                  <span className="text-xs text-zinc-500">{isListening ? 'Live' : 'Off'}</span>
                </>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <AudioVisualizer
                audioStats={audioStats}
                isActive={isListening}
                width={500}
                height={200}
                className="w-full"
              />
            </div>

            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex justify-center gap-3"
              >
                {!isRecording ? (
                  <ShimmerButton
                    onClick={startRecording}
                    disabled={!isListening}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Yozib Olishni Boshlash
                  </ShimmerButton>
                ) : (
                  <Button onClick={stopRecording} variant="destructive">
                    <Square className="mr-2 h-4 w-4" />
                    Yozib Olishni To'xtatish
                  </Button>
                )}
              </motion.div>
            )}

            {isListening && audioInfo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
              >
                <h4 className="mb-3 font-semibold text-zinc-200">Audio Ma'lumotlar</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">Sample Rate:</span>
                    <span className="ml-2 text-zinc-100">{audioInfo.sampleRate} Hz</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Kanallar:</span>
                    <span className="ml-2 text-zinc-100">{audioInfo.channelCount}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Echo Cancellation:</span>
                    <span className={`ml-2 ${audioInfo.echoCancellation ? 'text-green-400' : 'text-red-400'}`}>
                      {audioInfo.echoCancellation ? 'Yoqilgan' : "O'chirilgan"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Noise Suppression:</span>
                    <span className={`ml-2 ${audioInfo.noiseSuppression ? 'text-green-400' : 'text-red-400'}`}>
                      {audioInfo.noiseSuppression ? 'Yoqilgan' : "O'chirilgan"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-medium text-zinc-300">Yozilgan Audiolar</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-zinc-500">{recordedAudios.length} ta fayl</span>
              </div>
              {recordedAudios.length > 0 && (
                <Button
                  onClick={clearAllRecordings}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-red-400 hover:text-red-300"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Hammasini o'chirish
                </Button>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="max-h-96 overflow-y-auto">
              <AnimatePresence>
                {recordedAudios.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-40 items-center justify-center text-zinc-400"
                  >
                    <div className="text-center">
                      <Volume2 className="mx-auto mb-2 h-12 w-12 opacity-50" />
                      <p>Hali hech qandar audio yozilmagan</p>
                      <p className="text-sm text-zinc-500">Mikrofonni yoqib audio yozing</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {recordedAudios.map((audio) => (
                      <AudioGridItem
                        key={audio.id}
                        audio={audio}
                        onPreview={() => openPreview(audio)}
                        onDownload={() => downloadAudio(audio)}
                        onDelete={() => deleteAudio(audio.id)}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 backdrop-blur-sm"
        >
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      )}

      {!isListening && audioDevices.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 border-b border-zinc-800 px-6 py-4">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium text-zinc-400">Mikrofon Turlari</span>
          </div>

          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {sampleMicrophones.map((sample, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4 transition-all hover:border-zinc-600 hover:bg-zinc-800/50"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Mic className="h-4 w-4 text-blue-400" />
                    <span className="font-medium text-zinc-200">{sample.name}</span>
                  </div>
                  <p className="mb-2 text-sm text-zinc-400">{sample.description}</p>
                  <p className="text-xs text-zinc-500">{sample.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-12 space-y-8">
        <div className="flex flex-col items-center">
          <h2 className="mb-4 text-3xl font-bold text-zinc-100">Mikrofon Test Haqida</h2>
          <p className="mx-auto max-w-2xl text-center text-lg text-zinc-400">
            Professional audio test va vizualizatsiya vositasi. Real-time audio tahlil, sifat baholash va yozib olish
            imkoniyatlari bilan.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h3 className="mb-6 text-xl font-semibold text-zinc-100">Audio Test Funksiyalari</h3>
            <p className="mb-6 text-zinc-400">Mikrofoningizni professional darajada test qilish va tahlil qilish:</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-3">
                <code className="rounded bg-green-500/20 px-2 py-1 text-green-300">Real-time</code>
                <span>Jonli audio vizualizatsiya</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-blue-500/20 px-2 py-1 text-blue-300">Equalizer</code>
                <span>Chastota spektri tahlili</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-purple-500/20 px-2 py-1 text-purple-300">Waveform</code>
                <span>Audio to'lqin shakli ko'rsatish</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-orange-500/20 px-2 py-1 text-orange-300">Level Meter</code>
                <span>Audio daraja o'lchash</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h3 className="mb-6 text-xl font-semibold text-zinc-100">Yozib Olish Imkoniyatlari</h3>
            <p className="mb-6 text-zinc-400">Professional audio yozib olish va boshqarish funksiyalari:</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-3">
                <code className="rounded bg-cyan-500/20 px-2 py-1 text-cyan-300">WebM/Opus</code>
                <span>Yuqori sifatli audio format</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-yellow-500/20 px-2 py-1 text-yellow-300">Management</code>
                <span>Audio fayllarni boshqarish</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-red-500/20 px-2 py-1 text-red-300">Playback</code>
                <span>Yozilgan audiolarni eshitish</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-indigo-500/20 px-2 py-1 text-indigo-300">Download</code>
                <span>Fayllarni yuklab olish</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h3 className="mb-6 text-xl font-semibold text-zinc-100">Sifat Baholash</h3>
            <p className="mb-6 text-zinc-400">Audio sifatini professional darajada baholash va tavsiyalar:</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-3">
                <code className="rounded bg-pink-500/20 px-2 py-1 text-pink-300">Ajoyib</code>
                <span>60%+ audio daraja (optimal)</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-teal-500/20 px-2 py-1 text-teal-300">Yaxshi</code>
                <span>40-60% audio daraja</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-violet-500/20 px-2 py-1 text-violet-300">O'rtacha</code>
                <span>20-40% audio daraja</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-emerald-500/20 px-2 py-1 text-emerald-300">Past</code>
                <span>20% dan past (yaxshilash kerak)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h3 className="mb-6 text-xl font-semibold text-zinc-100">Texnik Ma'lumotlar va Sozlamalar</h3>
          <p className="mb-8 text-zinc-400">
            Mikrofon test vositasi zamonaviy audio technology'lar bilan ishlaydi va professional audio processing
            imkoniyatlarini taqdim etadi:
          </p>

          <div className="mt-2 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-6">
              <h4 className="mb-3 font-semibold text-zinc-200">Audio Processing</h4>
              <p className="mb-3 text-sm text-zinc-400">
                Real-time audio analiz Web Audio API bilan amalga oshiriladi.
              </p>
              <code className="text-xs text-green-300">44.1 kHz sample rate, 16-bit depth</code>
            </div>

            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-6">
              <h4 className="mb-3 font-semibold text-zinc-200">Noise Reduction</h4>
              <p className="mb-3 text-sm text-zinc-400">Echo cancellation va noise suppression avtomatik yoqiladi.</p>
              <code className="text-xs text-blue-300">Advanced audio filtering algorithms</code>
            </div>

            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-6">
              <h4 className="mb-3 font-semibold text-zinc-200">Visualization Engine</h4>
              <p className="mb-3 text-sm text-zinc-400">
                HTML5 Canvas va real-time audio data bilan professional visualization.
              </p>
              <code className="text-xs text-purple-300">FFT analysis, 2048 buffer size</code>
            </div>

            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-6">
              <h4 className="mb-3 font-semibold text-zinc-200">Multi-device Support</h4>
              <p className="mb-3 text-sm text-zinc-400">
                Ko'plab mikrofon qurilmalari va USB audio interface'larni qo'llab-quvvatlash.
              </p>
              <code className="text-xs text-orange-300">MediaDevices API integration</code>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h3 className="mb-6 text-xl font-semibold text-zinc-100">Foydalanish Holatlari</h3>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="mb-4 font-semibold text-zinc-200">Content Creation va Podcasting</h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li>• Podcast recording uchun mikrofon sifatini tekshirish</li>
                <li>• YouTube va video content uchun audio test</li>
                <li>• Live streaming oldidan mikrofon sozlash</li>
                <li>• Voice-over va narration uchun tayyorgarlik</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-zinc-200">Professional Audio va Texnik</h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li>• Audio equipment testing va diagnostics</li>
                <li>• Remote work uchun mikrofon sifatini baholash</li>
                <li>• Conference call oldidan audio check</li>
                <li>• Music recording setup verification</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-8">
          <h4 className="mb-4 font-semibold text-blue-200">Professional Maslahatlar</h4>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-blue-100">
                <strong>Optimal Masofa:</strong> Mikrofonga 15-20 sm masofada gaplashing. Bu eng yaxshi audio sifat va
                kam noise ta'minlaydi.
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-100">
                <strong>Audio Level:</strong>
                <code className="mx-1 rounded bg-blue-500/20 px-1 text-blue-300">40-70%</code>
                oralig'ida audio level saqlash optimal hisoblanadi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
