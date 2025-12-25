'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, Copy, RotateCcw, Play, Square, Info, Monitor, Command } from 'lucide-react'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { Button } from '@/components/ui/button'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { CopyButton } from '@/components/shared/CopyButton'
import { useKeycodeInfo, type KeyInfo, type CommonKey } from './hooks/useKeycodeInfo'

export default function KeycodeInfo() {
  const {
    keyInfo,
    isListening,
    keyHistory,
    commonKeys,
    startListening,
    stopListening,
    clearHistory,
    simulateKey,
    getLocationName,
    formatKeyInfo,
    getCommonKeysByCategory,
  } = useKeycodeInfo()

  const getKeyDisplayValue = (key: string): string => {
    if (key === ' ') return 'Space'
    if (key === 'ArrowUp') return '↑'
    if (key === 'ArrowDown') return '↓'
    if (key === 'ArrowLeft') return '←'
    if (key === 'ArrowRight') return '→'
    return key
  }

  const getCategoryIcon = (category: CommonKey['category']) => {
    switch (category) {
      case 'navigation':
        return <Monitor className="h-4 w-4" />
      case 'function':
        return <Command className="h-4 w-4" />
      case 'special':
        return <Keyboard className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="Keycode Ma'lumotlari"
        description="Klaviatura tugmalarining kodlarini va ma'lumotlarini professional tarzda aniqlang"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Controls & Detection */}
        <div className="space-y-6">
          {/* Keyboard Listening Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm"
          >
            {/* Panel Header */}
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-800/50 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="font-mono text-sm text-zinc-300">Klaviatura Tinglash</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-green-500' : 'bg-zinc-500'}`}></div>
                <span className="text-xs text-zinc-400">{isListening ? 'FAOL' : "O'CHIQ"}</span>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mb-2 text-sm text-zinc-400">
                    {isListening
                      ? 'Klaviaturadan biror tugmani bosing...'
                      : 'Klaviatura kodlarini aniqlash uchun rejimni yoqing'}
                  </div>

                  {/* Listening Status */}
                  <div
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 ${
                      isListening
                        ? 'border border-green-500/20 bg-green-500/10 text-green-400'
                        : 'border border-zinc-700 bg-zinc-800/50 text-zinc-400'
                    }`}
                  >
                    <Keyboard className="h-4 w-4" />
                    <span className="font-mono text-sm">
                      {isListening ? 'Tinglash rejimi yoniq' : "Tinglash rejimi o'chiq"}
                    </span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-2">
                  {!isListening ? (
                    <ShimmerButton onClick={startListening} className="flex-1 bg-green-600 hover:bg-green-700">
                      <Play className="mr-2 h-4 w-4" />
                      Tinglashni Boshlash
                    </ShimmerButton>
                  ) : (
                    <Button onClick={stopListening} variant="destructive" className="flex-1">
                      <Square className="mr-2 h-4 w-4" />
                      To'xtatish
                    </Button>
                  )}

                  {keyHistory.length > 0 && (
                    <Button onClick={clearHistory} variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Current Key Display */}
          {keyInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm"
            >
              {/* Panel Header */}
              <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-800/50 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="font-mono text-sm text-zinc-300">Tugma Ma'lumotlari</span>
                </div>
                <CopyButton text={formatKeyInfo(keyInfo)} />
              </div>

              <div className="p-6">
                {/* Key Visual Display */}
                <div className="mb-6 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-2 inline-flex h-24 w-24 items-center justify-center rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-2xl font-bold text-blue-400"
                  >
                    {getKeyDisplayValue(keyInfo.key)}
                  </motion.div>

                  <div className="text-sm text-zinc-400">
                    {keyInfo.repeat && (
                      <span className="inline-flex items-center gap-1 text-yellow-400">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-400"></div>
                        Takrorlanmoqda
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Details Grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3">
                    <div className="mb-1 text-xs text-zinc-400">Key</div>
                    <div className="font-mono text-zinc-100">"{keyInfo.key}"</div>
                  </div>
                  <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3">
                    <div className="mb-1 text-xs text-zinc-400">Code</div>
                    <div className="font-mono text-zinc-100">{keyInfo.code}</div>
                  </div>
                  <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3">
                    <div className="mb-1 text-xs text-zinc-400">KeyCode</div>
                    <div className="font-mono text-blue-400">{keyInfo.keyCode}</div>
                  </div>
                  <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3">
                    <div className="mb-1 text-xs text-zinc-400">Which</div>
                    <div className="font-mono text-zinc-100">{keyInfo.which}</div>
                  </div>
                  <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3">
                    <div className="mb-1 text-xs text-zinc-400">Location</div>
                    <div className="text-zinc-100">{getLocationName(keyInfo.location)}</div>
                  </div>
                  <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3">
                    <div className="mb-1 text-xs text-zinc-400">Modifikatorlar</div>
                    <div className="text-zinc-100">
                      {[
                        keyInfo.ctrlKey && 'Ctrl',
                        keyInfo.altKey && 'Alt',
                        keyInfo.shiftKey && 'Shift',
                        keyInfo.metaKey && 'Meta',
                      ]
                        .filter(Boolean)
                        .join(' + ') || "Yo'q"}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 border-t border-zinc-800 pt-4">
                  <div className="flex gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      <span className="font-mono text-blue-400">{keyInfo.keyCode}</span>
                      <span>KeyCode</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-zinc-100">{keyInfo.key}</span>
                      <span>Tugma</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-zinc-100">{new Date(keyInfo.timestamp).toLocaleTimeString()}</span>
                      <span>Vaqt</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Panel - Common Keys & History */}
        <div className="space-y-6">
          {/* Common Keys Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm"
          >
            {/* Panel Header */}
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-800/50 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="font-mono text-sm text-zinc-300">Umumiy Tugmalar</span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-2 sm:grid-cols-1 lg:grid-cols-2">
                {commonKeys.map((key) => (
                  <motion.button
                    key={key.code}
                    onClick={() => simulateKey(key)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-left transition-all hover:border-zinc-600 hover:bg-zinc-800 hover:shadow-lg"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      {getCategoryIcon(key.category)}
                      <span className="font-medium text-zinc-100 group-hover:text-white">{key.name}</span>
                    </div>
                    <div className="mb-1 text-xs text-zinc-400">
                      KeyCode: <span className="font-mono text-blue-400">{key.keyCode}</span>
                    </div>
                    {key.description && <div className="text-xs text-zinc-500">{key.description}</div>}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Key History Panel */}
          {keyHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm"
            >
              {/* Panel Header */}
              <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-800/50 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="font-mono text-sm text-zinc-300">Tugmalar Tarixi</span>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto p-6">
                <div className="space-y-2">
                  <AnimatePresence>
                    {keyHistory.map((key, index) => (
                      <motion.div
                        key={`${key.timestamp}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3 transition-colors hover:bg-zinc-800/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-700 font-mono text-sm text-zinc-200">
                            {getKeyDisplayValue(key.key)}
                          </div>
                          <div>
                            <div className="text-sm text-zinc-100">
                              {key.code} <span className="font-mono text-blue-400">({key.keyCode})</span>
                            </div>
                            {(key.ctrlKey || key.altKey || key.shiftKey || key.metaKey) && (
                              <div className="text-xs text-zinc-400">
                                +{' '}
                                {[
                                  key.ctrlKey && 'Ctrl',
                                  key.altKey && 'Alt',
                                  key.shiftKey && 'Shift',
                                  key.metaKey && 'Meta',
                                ]
                                  .filter(Boolean)
                                  .join(' + ')}
                              </div>
                            )}
                          </div>
                        </div>
                        <CopyButton
                          text={formatKeyInfo(key)}
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-zinc-100"
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* History Stats */}
                <div className="mt-4 border-t border-zinc-800 pt-4">
                  <div className="flex gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      <span className="font-mono text-blue-400">{keyHistory.length}</span>
                      <span>Jami tugmalar</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-zinc-100">{keyHistory[0]?.key || "Yo'q"}</span>
                      <span>Oxirgi</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-zinc-100">
                        {keyHistory[0] ? new Date(keyHistory[0].timestamp).toLocaleTimeString() : '--:--'}
                      </span>
                      <span>Vaqt</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Help Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm"
      >
        {/* Panel Header */}
        <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-800/50 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex-1 text-center">
            <span className="font-mono text-sm text-zinc-300">Yo'riqnoma</span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-medium text-zinc-200">
                <Info className="h-4 w-4 text-blue-400" />
                Asosiy Ma'lumotlar
              </h4>
              <div className="space-y-2 text-sm text-zinc-400">
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                  <div className="mb-1 font-medium text-blue-400">Key</div>
                  <div>Tugmaning haqiqiy qiymati (a, Enter, F1)</div>
                </div>
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                  <div className="mb-1 font-medium text-green-400">Code</div>
                  <div>Tugmaning fizik pozitsiyasi (KeyA, Enter)</div>
                </div>
                <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
                  <div className="mb-1 font-medium text-purple-400">KeyCode</div>
                  <div>Raqamli identifikator (65, 13, 112)</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-medium text-zinc-200">
                <Keyboard className="h-4 w-4 text-green-400" />
                Qanday Ishlatish
              </h4>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>
                  <strong className="text-zinc-300">1.</strong> "Tinglashni Boshlash" tugmasini bosing
                </p>
                <p>
                  <strong className="text-zinc-300">2.</strong> Klaviaturadan har qanday tugmani bosing
                </p>
                <p>
                  <strong className="text-zinc-300">3.</strong> Tugma haqida batafsil ma'lumot ko'ring
                </p>
                <p>
                  <strong className="text-zinc-300">4.</strong> Umumiy tugmalar ro'yxatidan test qiling
                </p>
                <p>
                  <strong className="text-zinc-300">5.</strong> Ma'lumotlarni nusxalang
                </p>
                <p>
                  <strong className="text-zinc-300">6.</strong> Tugmalar tarixini kuzating
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-medium text-zinc-200">
                <Command className="h-4 w-4 text-yellow-400" />
                Professional Xususiyatlar
              </h4>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>• Real-time keycode aniqlash</p>
                <p>• Modifier tugmalar qo'llab-quvvatlash</p>
                <p>• 20 tagacha tugma tarixi</p>
                <p>• Kategoriyalangan umumiy tugmalar</p>
                <p>• Professional nusxalash formati</p>
                <p>• Responsive terminal interfeys</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
