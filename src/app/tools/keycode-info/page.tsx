'use client'

import { useState, useEffect } from 'react'
import { Keyboard, Copy, RotateCcw } from 'lucide-react'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCopyToClipboard } from 'usehooks-ts'

interface KeyInfo {
  key: string
  code: string
  keyCode: number
  which: number
  charCode: number
  location: number
  repeat: boolean
  ctrlKey: boolean
  altKey: boolean
  shiftKey: boolean
  metaKey: boolean
  timestamp: number
}

const COMMON_KEYS = [
  { name: 'Enter', code: 'Enter', keyCode: 13 },
  { name: 'Escape', code: 'Escape', keyCode: 27 },
  { name: 'Space', code: 'Space', keyCode: 32 },
  { name: 'Tab', code: 'Tab', keyCode: 9 },
  { name: 'Backspace', code: 'Backspace', keyCode: 8 },
  { name: 'Delete', code: 'Delete', keyCode: 46 },
  { name: 'Arrow Up', code: 'ArrowUp', keyCode: 38 },
  { name: 'Arrow Down', code: 'ArrowDown', keyCode: 40 },
  { name: 'Arrow Left', code: 'ArrowLeft', keyCode: 37 },
  { name: 'Arrow Right', code: 'ArrowRight', keyCode: 39 },
  { name: 'F1', code: 'F1', keyCode: 112 },
  { name: 'F12', code: 'F12', keyCode: 123 },
]

export default function KeycodeInfoPage() {
  const [keyInfo, setKeyInfo] = useState<KeyInfo | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [keyHistory, setKeyHistory] = useState<KeyInfo[]>([])
  const [, copy] = useCopyToClipboard()

  useEffect(() => {
    if (isListening) {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Prevent default behavior for some keys to avoid page navigation
        if (['F5', 'F12', 'Tab'].includes(event.code)) {
          event.preventDefault()
        }

        const info: KeyInfo = {
          key: event.key,
          code: event.code,
          keyCode: event.keyCode,
          which: event.which,
          charCode: event.charCode || 0,
          location: event.location,
          repeat: event.repeat,
          ctrlKey: event.ctrlKey,
          altKey: event.altKey,
          shiftKey: event.shiftKey,
          metaKey: event.metaKey,
          timestamp: Date.now(),
        }

        setKeyInfo(info)
        setKeyHistory((prev) => [info, ...prev.slice(0, 9)]) // Keep last 10 keys
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isListening])

  const startListening = () => {
    setIsListening(true)
    setKeyInfo(null)
    setKeyHistory([])
  }

  const stopListening = () => {
    setIsListening(false)
  }

  const clearHistory = () => {
    setKeyHistory([])
    setKeyInfo(null)
  }

  const copyKeyInfo = (info: KeyInfo) => {
    const text = `Key: ${info.key}
Code: ${info.code}
KeyCode: ${info.keyCode}
Which: ${info.which}
Location: ${info.location}
Modifiers: ${
      [info.ctrlKey && 'Ctrl', info.altKey && 'Alt', info.shiftKey && 'Shift', info.metaKey && 'Meta']
        .filter(Boolean)
        .join(' + ') || 'None'
    }`

    copy(text)
  }

  const getLocationName = (location: number) => {
    switch (location) {
      case 0:
        return 'Standart'
      case 1:
        return 'Chap'
      case 2:
        return "O'ng"
      case 3:
        return 'Numpad'
      default:
        return "Noma'lum"
    }
  }

  const simulateKey = (commonKey: (typeof COMMON_KEYS)[0]) => {
    const mockInfo: KeyInfo = {
      key: commonKey.name,
      code: commonKey.code,
      keyCode: commonKey.keyCode,
      which: commonKey.keyCode,
      charCode: 0,
      location: 0,
      repeat: false,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      timestamp: Date.now(),
    }

    setKeyInfo(mockInfo)
    setKeyHistory((prev) => [mockInfo, ...prev.slice(0, 9)])
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <ToolHeader title="Klaviatura Kodlari" description="Klaviatura tugmalari kodlarini aniqlang va ma'lumot oling" />

      {/* Controls */}
      <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
        <div className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-medium text-zinc-200">Klaviatura eshitish rejimi</h3>
              <p className="text-sm text-zinc-400">
                {isListening
                  ? 'Klaviaturadan biror tugmani bosing'
                  : 'Klaviatura kodlarini aniqlash uchun rejimni yoqing'}
              </p>
            </div>
            <div className="flex gap-2">
              {!isListening ? (
                <Button onClick={startListening} className="bg-green-600 hover:bg-green-700">
                  <Keyboard className="mr-2 h-4 w-4" />
                  Eshitishni boshlash
                </Button>
              ) : (
                <Button onClick={stopListening} variant="destructive">
                  To'xtatish
                </Button>
              )}

              {keyHistory.length > 0 && (
                <Button onClick={clearHistory} variant="outline" className="border-zinc-700">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Tozalash
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Current Key Info */}
      {keyInfo && (
        <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">Joriy Tugma Ma'lumotlari</h3>
              <Button onClick={() => copyKeyInfo(keyInfo)} variant="outline" size="sm" className="border-zinc-700">
                <Copy className="mr-2 h-4 w-4" />
                Nusxalash
              </Button>
            </div>

            {/* Key Display */}
            <div className="mb-6 text-center">
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-2xl font-bold text-blue-400">
                {keyInfo.key === ' ' ? 'Space' : keyInfo.key}
              </div>
              <div className="mt-2 text-sm text-zinc-400">
                {keyInfo.repeat && <span className="text-yellow-400">• Takrorlanmoqda</span>}
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <div className="text-sm text-zinc-400">Key</div>
                <div className="font-mono text-zinc-100">"{keyInfo.key}"</div>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <div className="text-sm text-zinc-400">Code</div>
                <div className="font-mono text-zinc-100">{keyInfo.code}</div>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <div className="text-sm text-zinc-400">KeyCode</div>
                <div className="font-mono text-zinc-100">{keyInfo.keyCode}</div>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <div className="text-sm text-zinc-400">Which</div>
                <div className="font-mono text-zinc-100">{keyInfo.which}</div>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <div className="text-sm text-zinc-400">Location</div>
                <div className="text-zinc-100">{getLocationName(keyInfo.location)}</div>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <div className="text-sm text-zinc-400">Modifikatorlar</div>
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
          </div>
        </Card>
      )}

      {/* Common Keys */}
      <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">Umumiy Tugmalar</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {COMMON_KEYS.map((key) => (
              <button
                key={key.code}
                onClick={() => simulateKey(key)}
                className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-left transition-colors hover:border-zinc-600 hover:bg-zinc-800"
              >
                <div className="font-medium text-zinc-100">{key.name}</div>
                <div className="text-sm text-zinc-400">KeyCode: {key.keyCode}</div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Key History */}
      {keyHistory.length > 0 && (
        <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">Tugmalar Tarixi</h3>
            <div className="space-y-2">
              {keyHistory.map((key, index) => (
                <div
                  key={`${key.timestamp}-${index}`}
                  className="flex items-center justify-between rounded-lg bg-zinc-800/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-700 font-mono text-sm">
                      {key.key === ' ' ? '␣' : key.key}
                    </div>
                    <div>
                      <div className="text-sm text-zinc-100">
                        {key.code} (KeyCode: {key.keyCode})
                      </div>
                      {(key.ctrlKey || key.altKey || key.shiftKey || key.metaKey) && (
                        <div className="text-xs text-zinc-400">
                          +{' '}
                          {[key.ctrlKey && 'Ctrl', key.altKey && 'Alt', key.shiftKey && 'Shift', key.metaKey && 'Meta']
                            .filter(Boolean)
                            .join(' + ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => copyKeyInfo(key)}
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400 hover:text-zinc-100"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card className="border-zinc-800 bg-zinc-900/80">
        <div className="p-6">
          <h4 className="mb-3 font-medium text-zinc-200">Klaviatura kodlari vositasi qanday ishlatiladi?</h4>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>
              <strong>1. Eshitishni boshlang:</strong> "Eshitishni boshlash" tugmasini bosing
            </p>
            <p>
              <strong>2. Tugma bosing:</strong> Klaviaturadan har qanday tugmani bosing
            </p>
            <p>
              <strong>3. Ma'lumotlarni ko'ring:</strong> Tugma haqida batafsil ma'lumot ko'rsatiladi
            </p>
            <p>
              <strong>4. Umumiy tugmalar:</strong> Tez test uchun umumiy tugmalar ro'yxatidan foydalaning
            </p>
            <p>
              <strong>5. Nusxalash:</strong> Tugma ma'lumotlarini clipboard ga nusxalang
            </p>
            <p>
              <strong>6. Tarix:</strong> Bosgan tugmalar tarixi saqlanadi
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <div className="text-sm text-blue-400">
                <strong>Key:</strong> Tugmaning haqiqiy qiymati (masalan: "a", "Enter", "F1")
              </div>
            </div>
            <div className="rounded-lg bg-green-500/10 p-3">
              <div className="text-sm text-green-400">
                <strong>Code:</strong> Tugmaning fizik pozitsiyasi (masalan: "KeyA", "Enter", "F1")
              </div>
            </div>
            <div className="rounded-lg bg-purple-500/10 p-3">
              <div className="text-sm text-purple-400">
                <strong>KeyCode:</strong> Raqamli kod (masalan: 65, 13, 112)
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
