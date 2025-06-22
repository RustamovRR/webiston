'use client'

import { useState, useMemo } from 'react'
import { Check, Copy, Download, X, AlertCircle, CheckCircle, Key, Clock, Shield } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'
import { NumberTicker } from '@/components/ui/number-ticker'

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
  const [_, copy] = useCopyToClipboard()

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

  const formatJSON = (obj: any) => JSON.stringify(obj, null, 2)

  // Sample JWT for testing
  const sampleJWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MDA5MzkwMjJ9.Xnq5PCw7Mh7EH7QbmQ3VdDu8TaGHcCNEzNE1PZ7i0bU'

  return (
    <div className="mx-auto mt-6 w-full max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-100">JWT Token Decoder</h1>
        <p className="text-lg text-zinc-400">
          JSON Web Token larni dekodlash va tahlil qilish uchun professional vosita
        </p>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <div className="rounded-xl bg-zinc-900/80 shadow-inner">
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
            <span className="text-lg font-semibold text-zinc-100">JWT Token</span>
            <div className="flex gap-2">
              <button
                onClick={() => setJwtToken(sampleJWT)}
                className="rounded bg-zinc-700 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-600"
              >
                Sample JWT
              </button>
              {jwtToken && (
                <button
                  onClick={handleClear}
                  className="rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                  aria-label="Clear"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="relative" style={{ height: '120px' }}>
            <textarea
              value={jwtToken}
              onChange={(e) => setJwtToken(e.target.value)}
              className="absolute inset-0 h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none"
              placeholder="JWT tokenni bu yerga kiriting... (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
              autoFocus
            />
          </div>

          <div className="flex justify-between border-t border-zinc-800 px-4 py-2 text-sm text-zinc-500">
            <div className="flex gap-4">
              <span>
                <NumberTicker value={jwtToken.length} /> characters
              </span>
            </div>
            {decodedJWT && (
              <div className="flex items-center gap-2">
                {decodedJWT.isValid ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle size={16} />
                    <span>Valid JWT</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-500">
                    <AlertCircle size={16} />
                    <span>Invalid JWT</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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

      {/* Token Status */}
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
              <p className="text-sm text-zinc-400">Ma\'lumot yo\'q</p>
            )}
          </div>
        </div>
      )}

      {/* Decoded Content */}
      {decodedJWT?.isValid && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Header */}
          <div className="rounded-xl bg-zinc-900/80 shadow-inner">
            <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
              <span className="text-lg font-semibold text-zinc-100">Header</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(formatJSON(decodedJWT.header), 'jwt-header.json')}
                  className="rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                  aria-label="Download Header"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => handleCopy(formatJSON(decodedJWT.header), 'header')}
                  className="rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                  aria-label="Copy Header"
                >
                  {copied === 'header' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="relative" style={{ height: '300px' }}>
              <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
                <pre className="font-mono text-sm whitespace-pre-wrap text-zinc-50">
                  {formatJSON(decodedJWT.header)}
                </pre>
              </div>
            </div>
          </div>

          {/* Payload */}
          <div className="rounded-xl bg-zinc-900/80 shadow-inner">
            <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
              <span className="text-lg font-semibold text-zinc-100">Payload</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(formatJSON(decodedJWT.payload), 'jwt-payload.json')}
                  className="rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                  aria-label="Download Payload"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => handleCopy(formatJSON(decodedJWT.payload), 'payload')}
                  className="rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                  aria-label="Copy Payload"
                >
                  {copied === 'payload' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="relative" style={{ height: '300px' }}>
              <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
                <pre className="font-mono text-sm whitespace-pre-wrap text-zinc-50">
                  {formatJSON(decodedJWT.payload)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 rounded-lg bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-100">JWT haqida ma'lumot</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">JWT nima?</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• JSON Web Token - ma'lumotlarni xavfsiz uzatish uchun</li>
              <li>• 3 qismdan iborat: Header.Payload.Signature</li>
              <li>• Base64 formatida kodlangan</li>
              <li>• Digitally signed bo'lishi mumkin</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">Standart fieldlar:</h4>
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
        </div>
      </div>
    </div>
  )
}

export default JwtDecoder
