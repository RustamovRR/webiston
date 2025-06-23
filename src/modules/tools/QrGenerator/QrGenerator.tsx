'use client'

import { useState, useEffect } from 'react'
import { Check, Copy, Download, QrCode } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'

const QrGenerator = () => {
  const [inputText, setInputText] = useState('')
  const [qrSize, setQrSize] = useState(200)
  const [copied, setCopied] = useState(false)
  const [qrUrl, setQrUrl] = useState('')
  const [_, copy] = useCopyToClipboard()

  // Generate QR code URL using API
  useEffect(() => {
    if (inputText.trim()) {
      const encodedText = encodeURIComponent(inputText)
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedText}`)
    } else {
      setQrUrl('')
    }
  }, [inputText, qrSize])

  const handleCopy = async () => {
    if (!inputText) return
    try {
      await copy(inputText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleDownload = () => {
    if (!qrUrl) return
    const a = document.createElement('a')
    a.href = qrUrl
    a.download = 'qrcode.png'
    a.click()
  }

  const presets = [
    { label: 'Website URL', value: 'https://webiston.uz' },
    { label: 'Email', value: 'mailto:info@example.com' },
    { label: 'Phone', value: 'tel:+998901234567' },
    { label: 'SMS', value: 'sms:+998901234567?body=Salom!' },
    { label: 'WiFi', value: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;' },
  ]

  return (
    <div className="mx-auto mt-6 w-full max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-100">QR Code Generator</h1>
        <p className="text-lg text-zinc-400">Matn, URL va ma'lumotlar uchun QR kod yaratish vositasi</p>
      </div>

      {/* Presets */}
      <div className="mb-6 rounded-lg bg-zinc-900/50 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-300">Tayyor shablonlar:</h3>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => setInputText(preset.value)}
              className="rounded bg-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-600"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div>
          <div className="rounded-xl bg-zinc-900/80 shadow-inner">
            <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
              <span className="text-lg font-semibold text-zinc-100">Input Text/URL</span>
              <button
                onClick={handleCopy}
                disabled={!inputText}
                className="rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-50"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>

            <div className="p-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="h-32 w-full resize-none rounded bg-zinc-800 p-3 text-sm text-zinc-50 placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="QR kodga aylantirmoqchi bo'lgan matn, URL yoki ma'lumotni kiriting..."
                autoFocus
              />
            </div>

            <div className="border-t border-zinc-800 p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm text-zinc-300">QR o'lchami:</label>
                <select
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
                >
                  <option value={150}>150x150</option>
                  <option value={200}>200x200</option>
                  <option value={300}>300x300</option>
                  <option value={400}>400x400</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        <div>
          <div className="rounded-xl bg-zinc-900/80 shadow-inner">
            <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
              <span className="text-lg font-semibold text-zinc-100">QR Code</span>
              {qrUrl && (
                <button
                  onClick={handleDownload}
                  className="rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                >
                  <Download size={18} />
                </button>
              )}
            </div>

            <div className="flex min-h-[300px] items-center justify-center p-8">
              {qrUrl ? (
                <div className="text-center">
                  <img
                    src={qrUrl}
                    alt="Generated QR Code"
                    className="mx-auto rounded bg-white p-2"
                    style={{ width: qrSize, height: qrSize }}
                  />
                  <p className="mt-4 text-sm text-zinc-400">
                    {qrSize}x{qrSize} pixels
                  </p>
                </div>
              ) : (
                <div className="text-center text-zinc-500">
                  <QrCode size={64} className="mx-auto mb-4 opacity-50" />
                  <p>Matn kiriting va QR kod yaratiladi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 rounded-lg bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-100">QR Code haqida</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">QR Code turlari:</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• URL va web linklar</li>
              <li>• Matn xabarlari</li>
              <li>• Email manzillari</li>
              <li>• Telefon raqamlari</li>
              <li>• WiFi ulanish ma'lumotlari</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">Foydalanish:</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Marketing va reklama</li>
              <li>• Kontakt ma'lumotlari ulashish</li>
              <li>• Event ro'yxatdan o'tish</li>
              <li>• Menu va narxlar</li>
              <li>• App download linklari</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QrGenerator
