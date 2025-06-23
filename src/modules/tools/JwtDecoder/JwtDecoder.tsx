'use client'

import { useState, useMemo } from 'react'
import {
  Check,
  Copy,
  Download,
  X,
  AlertCircle,
  CheckCircle,
  Key,
  Clock,
  Shield,
  Upload,
  FileText,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'
import { Button } from '@/components/ui/button'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { NumberTicker } from '@/components/ui/number-ticker'
import { CodeHighlight, ShimmerButton, GradientTabs, TextInputPanel, OutputPanel, ToolPanel } from '@/components/ui'
import { UI_PATTERNS, TOOL_COLOR_MAP } from '@/constants/ui-constants'

interface JWTPayload {
  [key: string]: any
}

interface JWTHeader {
  alg?: string
  typ?: string
  [key: string]: any
}

interface DecodedJWT {
  header: JWTHeader
  payload: JWTPayload
  signature: string
  isValid: boolean
  error?: string
}

const JwtDecoder = () => {
  const [jwtToken, setJwtToken] = useState('')
  const [copied, setCopied] = useState('')
  const [viewMode, setViewMode] = useState<'decoded' | 'raw'>('decoded')
  const [showSignature, setShowSignature] = useState(false)
  const [_, copy] = useCopyToClipboard()

  const toolColors = TOOL_COLOR_MAP['jwt-decoder']

  const decodedJWT = useMemo((): DecodedJWT | null => {
    if (!jwtToken.trim()) return null

    try {
      const parts = jwtToken.split('.')
      if (parts.length !== 3) {
        return {
          header: {},
          payload: {},
          signature: '',
          isValid: false,
          error: "JWT 3 ta qismdan iborat bo'lishi kerak (header.payload.signature)",
        }
      }

      const [headerPart, payloadPart, signature] = parts

      // Decode header
      const header = JSON.parse(atob(headerPart.replace(/-/g, '+').replace(/_/g, '/')))

      // Decode payload
      const payload = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/')))

      return {
        header,
        payload,
        signature,
        isValid: true,
      }
    } catch (error) {
      return {
        header: {},
        payload: {},
        signature: '',
        isValid: false,
        error: "Noto'g'ri JWT format yoki buzilgan token",
      }
    }
  }, [jwtToken])

  const tokenInfo = useMemo(() => {
    if (!decodedJWT?.isValid) return null

    const now = Math.floor(Date.now() / 1000)
    const exp = decodedJWT.payload.exp
    const iat = decodedJWT.payload.iat
    const nbf = decodedJWT.payload.nbf

    return {
      isExpired: exp ? now > exp : false,
      isNotYetValid: nbf ? now < nbf : false,
      expiresAt: exp ? new Date(exp * 1000) : null,
      issuedAt: iat ? new Date(iat * 1000) : null,
      notBefore: nbf ? new Date(nbf * 1000) : null,
      algorithm: decodedJWT.header.alg,
      tokenType: decodedJWT.header.typ,
    }
  }, [decodedJWT])

  const handleCopy = async (content: string, type: string) => {
    try {
      await copy(content)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setJwtToken('')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setJwtToken(content.trim())
      }
      reader.readAsText(file)
    }
  }

  const formatJSON = (obj: any) => JSON.stringify(obj, null, 2)

  // Sample JWTs for different demonstrations
  const sampleTokens = {
    decoded: {
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MDA5MzkwMjJ9.Xnq5PCw7Mh7EH7QbmQ3VdDu8TaGHcCNEzNE1PZ7i0bU',
      description: "Dekodlangan JSON format ko'rish uchun",
    },
    raw: {
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MDA5MzkwMjJ9.Xnq5PCw7Mh7EH7QbmQ3VdDu8TaGHcCNEzNE1PZ7i0bU',
      description: "Base64 formatidagi xom ma'lumotlarni ko'rish uchun",
    },
  }

  const loadSampleToken = () => {
    const sample = viewMode === 'decoded' ? sampleTokens.decoded : sampleTokens.raw
    setJwtToken(sample.token)
  }

  const inputStats = [
    { label: 'belgi', value: jwtToken.length },
    { label: 'qism', value: jwtToken.split('.').length },
  ]

  const viewModeOptions = [
    {
      value: 'decoded',
      label: 'Dekodlangan',
      icon: <Eye size={16} />,
    },
    {
      value: 'raw',
      label: "Xom ma'lumot",
      icon: <EyeOff size={16} />,
    },
  ]

  const inputActions = jwtToken ? (
    <button
      onClick={handleClear}
      className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
      aria-label="Tozalash"
    >
      <X size={18} />
    </button>
  ) : undefined

  const headerContent = decodedJWT?.isValid ? (
    viewMode === 'decoded' ? (
      <CodeHighlight code={formatJSON(decodedJWT.header)} language="json" showLineNumbers={true} />
    ) : (
      <div>
        <div className="mb-3 text-xs font-medium text-zinc-500">Base64 formatidagi xom ma'lumot:</div>
        <pre className="rounded bg-zinc-900/50 p-3 font-mono text-sm break-all whitespace-pre-wrap text-zinc-50">
          {jwtToken.split('.')[0]}
        </pre>
      </div>
    )
  ) : undefined

  const payloadContent = decodedJWT?.isValid ? (
    viewMode === 'decoded' ? (
      <CodeHighlight code={formatJSON(decodedJWT.payload)} language="json" showLineNumbers={true} />
    ) : (
      <div>
        <div className="mb-3 text-xs font-medium text-zinc-500">Base64 formatidagi xom ma'lumot:</div>
        <pre className="rounded bg-zinc-900/50 p-3 font-mono text-sm break-all whitespace-pre-wrap text-zinc-50">
          {jwtToken.split('.')[1]}
        </pre>
      </div>
    )
  ) : undefined

  const headerActions = decodedJWT?.isValid ? (
    <>
      <button
        onClick={() => handleDownload(formatJSON(decodedJWT.header), 'jwt-header.json')}
        className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
        aria-label="Download Header"
      >
        <Download size={18} />
      </button>
      <button
        onClick={() => handleCopy(formatJSON(decodedJWT.header), 'header')}
        className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
        aria-label="Copy Header"
      >
        {copied === 'header' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
      </button>
    </>
  ) : undefined

  const payloadActions = decodedJWT?.isValid ? (
    <>
      <button
        onClick={() => handleDownload(formatJSON(decodedJWT.payload), 'jwt-payload.json')}
        className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
        aria-label="Download Payload"
      >
        <Download size={18} />
      </button>
      <button
        onClick={() => handleCopy(formatJSON(decodedJWT.payload), 'payload')}
        className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
        aria-label="Copy Payload"
      >
        {copied === 'payload' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
      </button>
    </>
  ) : undefined

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="JWT Token Decoder"
        description="JSON Web Token larni dekodlash va tahlil qilish uchun professional vosita"
      />

      {/* Rejim tanlash va sample data paneli */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* View Mode Tabs */}
            <GradientTabs
              options={viewModeOptions}
              value={viewMode}
              onChange={(value) => setViewMode(value as 'decoded' | 'raw')}
              toolCategory="converters"
            />

            {/* Sample data button */}
            <ShimmerButton onClick={loadSampleToken} variant="outline" size="sm">
              <FileText size={16} className="mr-2" />
              Namuna JWT ({viewMode === 'decoded' ? 'JSON' : 'Base64'})
            </ShimmerButton>
          </div>

          {/* Tozalash tugmasi */}
          <Button onClick={handleClear} variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-200">
            Tozalash
          </Button>
        </div>
      </div>

      {/* Ko'rish rejimlari haqida tushuntirish */}
      <div className="mb-6 rounded-lg border border-blue-600/20 bg-blue-900/10 p-4">
        <div className="flex items-start gap-3">
          <Info size={20} className="mt-0.5 flex-shrink-0 text-blue-400" />
          <div>
            <h4 className="mb-2 font-medium text-blue-300">Ko'rish rejimlari:</h4>
            <div className="space-y-1 text-sm text-blue-200/90">
              <p>
                <strong>Dekodlangan:</strong> JWT ning header va payload qismlarini odam o'qishi mumkin bo'lgan JSON
                formatda ko'rsatadi
              </p>
              <p>
                <strong>Xom ma'lumot:</strong> JWT ning asl Base64 formatidagi kodlangan ma'lumotlarini ko'rsatadi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Boshqaruv tugmalari */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Fayl yuklash */}
            <div className="flex items-center gap-2">
              <input type="file" accept=".txt,.json" onChange={handleFileUpload} className="hidden" id="file-upload" />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={16} className="mr-2" />
                  JWT fayl yuklash
                </label>
              </Button>
            </div>

            {/* Signature toggle */}
            {decodedJWT?.isValid && (
              <Button
                onClick={() => setShowSignature(!showSignature)}
                variant="outline"
                size="sm"
                className={showSignature ? `${toolColors.border} ${toolColors.bg} ${toolColors.text}` : ''}
              >
                <Key size={16} className="mr-2" />
                {showSignature ? 'Signature yashirish' : "Signature ko'rsatish"}
              </Button>
            )}
          </div>

          {/* Status indicator */}
          {decodedJWT && (
            <div className="flex items-center gap-2">
              {decodedJWT.isValid ? (
                <div className="flex items-center gap-1 text-green-500">
                  <CheckCircle size={16} />
                  <span className="text-sm">Yaroqli JWT</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-500">
                  <AlertCircle size={16} />
                  <span className="text-sm">Yaroqsiz JWT</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Signature haqida tushuntirish */}
      {decodedJWT?.isValid && (
        <div className="mb-6 rounded-lg border border-yellow-600/20 bg-yellow-900/10 p-4">
          <div className="flex items-start gap-3">
            <Key size={20} className="mt-0.5 flex-shrink-0 text-yellow-400" />
            <div>
              <h4 className="mb-2 font-medium text-yellow-300">Signature (Imzo) nima?</h4>
              <div className="space-y-1 text-sm text-yellow-200/90">
                <p>
                  <strong>Signature</strong> - JWT tokenning uchinchi qismi bo'lib, tokenning haqiqiyligini tasdiqlaydi.
                </p>
                <p>
                  Bu qism server tomonidan maxfiy kalit bilan yaratiladi va tokenning o'zgartirilmaganligini
                  kafolatlaydi.
                </p>
                <p>Signatureni ko'rsatish/yashirish tugmasi orqali ushbu maxfiy ma'lumotni boshqarishingiz mumkin.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JWT Input Panel */}
      <div className="mb-6">
        <TextInputPanel
          title="JWT Token"
          value={jwtToken}
          onChange={setJwtToken}
          placeholder="JWT tokenni bu yerga kiriting... (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
          autoFocus
          stats={inputStats}
          actions={inputActions}
          variant="terminal"
          minHeight="120px"
          maxHeight="120px"
        />
      </div>

      {/* Error Display */}
      {decodedJWT?.error && (
        <div className="mb-6 rounded-lg border border-red-600/20 bg-red-900/20 p-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle size={20} />
            <span className="font-semibold">Xatolik</span>
          </div>
          <p className="mt-2 text-sm text-red-300">{decodedJWT.error}</p>
        </div>
      )}

      {/* Token Status Cards */}
      {tokenInfo && decodedJWT?.isValid && (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div
            className={`rounded-lg border p-4 ${
              tokenInfo.isExpired ? 'border-red-600/20 bg-red-900/20' : 'border-green-600/20 bg-green-900/20'
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <Clock size={16} />
              <span className="font-medium">Muddat</span>
            </div>
            <p className={`text-sm ${tokenInfo.isExpired ? 'text-red-300' : 'text-green-300'}`}>
              {tokenInfo.isExpired ? 'Muddati tugagan' : 'Hali amal qiladi'}
            </p>
            {tokenInfo.expiresAt && (
              <p className="mt-1 text-xs text-zinc-400">{tokenInfo.expiresAt.toLocaleString()}</p>
            )}
          </div>

          <div className="rounded-lg border border-blue-600/20 bg-blue-900/20 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Shield size={16} />
              <span className="font-medium">Algoritm</span>
            </div>
            <p className="text-sm text-blue-300">{tokenInfo.algorithm || "Noma'lum"}</p>
            <p className="mt-1 text-xs text-zinc-400">Type: {tokenInfo.tokenType || 'JWT'}</p>
          </div>

          <div className="rounded-lg border border-yellow-600/20 bg-yellow-900/20 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Key size={16} />
              <span className="font-medium">Berilgan</span>
            </div>
            {tokenInfo.issuedAt ? (
              <p className="text-sm text-yellow-300">{tokenInfo.issuedAt.toLocaleString()}</p>
            ) : (
              <p className="text-sm text-zinc-400">Ma'lumot yo'q</p>
            )}
          </div>
        </div>
      )}

      {/* Decoded Content */}
      {decodedJWT?.isValid && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Header */}
          <ToolPanel title="Header" actions={headerActions} variant="terminal">
            <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
              {headerContent ? (
                <div>{headerContent}</div>
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div className="text-zinc-500">
                    <div className="mx-auto mb-4 opacity-50">
                      <Key size={48} />
                    </div>
                    <p className="text-sm">Header ma'lumotlari bu yerda ko'rinadi...</p>
                    <p className="mt-2 text-xs opacity-75">Ma'lumot kiriting</p>
                  </div>
                </div>
              )}
            </div>
          </ToolPanel>

          {/* Payload */}
          <ToolPanel title="Payload" actions={payloadActions} variant="terminal">
            <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
              {payloadContent ? (
                <div>{payloadContent}</div>
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div className="text-zinc-500">
                    <div className="mx-auto mb-4 opacity-50">
                      <FileText size={48} />
                    </div>
                    <p className="text-sm">Payload ma'lumotlari bu yerda ko'rinadi...</p>
                    <p className="mt-2 text-xs opacity-75">Ma'lumot kiriting</p>
                  </div>
                </div>
              )}
            </div>
          </ToolPanel>
        </div>
      )}

      {/* Signature Panel */}
      {showSignature && decodedJWT?.isValid && (
        <div className="mt-6">
          <ToolPanel
            title="Signature (Imzo)"
            actions={
              <button
                onClick={() => handleCopy(decodedJWT.signature, 'signature')}
                className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                aria-label="Copy Signature"
              >
                {copied === 'signature' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            }
            variant="terminal"
          >
            <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
              <div className="mb-3 text-xs font-medium text-zinc-500">JWT tokenning xavfsizlik imzosi:</div>
              <pre className="rounded bg-zinc-900/50 p-3 font-mono text-sm break-all whitespace-pre-wrap text-zinc-50">
                {decodedJWT.signature}
              </pre>
            </div>
          </ToolPanel>
        </div>
      )}

      {/* Ma'lumot va yordam bo'limi */}
      <div className={`mt-8 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Shield size={20} className={toolColors.text.replace('text-', 'text-')} />
          JWT haqida ma'lumot
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              JWT nima?
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• JSON Web Token - ma'lumotlarni xavfsiz uzatish uchun</li>
              <li>• 3 qismdan iborat: Header.Payload.Signature</li>
              <li>• Base64 formatida kodlangan</li>
              <li>• Digitally signed bo'lishi mumkin</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              Standart fieldlar
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>
                • <code className="text-zinc-300">iss</code> - Issuer (kim bergan)
              </li>
              <li>
                • <code className="text-zinc-300">sub</code> - Subject (nima haqida)
              </li>
              <li>
                • <code className="text-zinc-300">exp</code> - Expiration time
              </li>
              <li>
                • <code className="text-zinc-300">iat</code> - Issued at time
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              Xavfsizlik
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Signature orqali ma'lumot tekshiriladi</li>
              <li>• Expiration time ni doim tekshiring</li>
              <li>• Secret key ni maxfiy saqlang</li>
              <li>• HTTPS da uzating</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JwtDecoder
