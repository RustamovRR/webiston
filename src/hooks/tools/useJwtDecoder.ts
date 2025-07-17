import { useState, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'

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

interface TokenInfo {
  isExpired: boolean
  isNotYetValid: boolean
  expiresAt: Date | null
  issuedAt: Date | null
  notBefore: Date | null
  algorithm: string | undefined
  tokenType: string | undefined
}

interface JwtDecoderState {
  inputText: string
  viewMode: 'decoded' | 'raw'
  showSignature: boolean
  isProcessing: boolean
  result: DecodedJWT | null
  tokenInfo: TokenInfo | null
}

export const useJwtDecoder = () => {
  const tErrors = useTranslations('JwtDecoderPage.ErrorDisplay')
  const tFileErrors = useTranslations('JwtDecoderPage.FileErrors')

  const [inputText, setInputText] = useState('')
  const [viewMode, setViewMode] = useState<'decoded' | 'raw'>('decoded')
  const [showSignature, setShowSignature] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Sample JWT tokens
  const samples = useMemo(
    () => [
      {
        key: 'standard',
        label: 'Standart JWT Token',
        value:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaSBWYWxpeWV2IiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MDA5MzkwMjIsImlzcyI6IndlYmlzdG9uLnV6IiwiYXVkIjoidXNlcnMifQ.4HT8FzQJN_Bd8gI8W9Z5gD5q3rQ2dN3a7Z1k9e6L8rY',
      },
      {
        key: 'expired',
        label: 'Muddati tugagan JWT',
        value:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjQyNjIyfQ.4HT8FzQJN_Bd8gI8W9Z5gD5q3rQ2dN3a7Z1k9e6L8rY',
      },
      {
        key: 'complex',
        label: 'Murakkab Payload bilan',
        value:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ.eyJzdWIiOiJ1c2VyXzEyMzQ1IiwibmFtZSI6IkZheXpvbiAoZmF5em9uQHdlYmlzdG9uLnV6KSIsImVtYWlsIjoiZmF5em9uQHdlYmlzdG9uLnV6IiwiaWF0IjoxNjA5NDU5MjAwLCJleHAiOjE3MDA5MzkwMjIsIm5iZiI6MTYwOTQ1OTIwMCwiaXNzIjoid2ViaXN0b24udXoiLCJhdWQiOiJtb2JpbGUtYXBwIiwic2NvcGUiOiJyZWFkIHdyaXRlIiwidXNlcl9yb2xlIjoiYWRtaW4ifQ.signature_part_here',
      },
    ],
    [],
  )

  // Decode JWT token
  const result = useMemo((): DecodedJWT | null => {
    if (!inputText.trim()) return null

    try {
      const parts = inputText.trim().split('.')
      if (parts.length !== 3) {
        return {
          header: {},
          payload: {},
          signature: '',
          isValid: false,
          error: tErrors('threeParts'),
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
        error: tErrors('invalidFormat'),
      }
    }
  }, [inputText, tErrors])

  // Calculate token info
  const tokenInfo = useMemo((): TokenInfo | null => {
    if (!result?.isValid) return null

    const now = Math.floor(Date.now() / 1000)
    const exp = result.payload.exp
    const iat = result.payload.iat
    const nbf = result.payload.nbf

    return {
      isExpired: exp ? now > exp : false,
      isNotYetValid: nbf ? now < nbf : false,
      expiresAt: exp ? new Date(exp * 1000) : null,
      issuedAt: iat ? new Date(iat * 1000) : null,
      notBefore: nbf ? new Date(nbf * 1000) : null,
      algorithm: result.header.alg,
      tokenType: result.header.typ,
    }
  }, [result])

  // File upload handler
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // File size validation (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(tFileErrors('fileSizeError'))
        return
      }

      // File type validation
      const allowedTypes = ['text/plain', 'application/json']
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|json)$/)) {
        alert(tFileErrors('fileTypeError'))
        return
      }

      setIsProcessing(true)

      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setInputText(content.trim())
          setIsProcessing(false)
        }
        reader.onerror = () => {
          alert(tFileErrors('fileReadError'))
          setIsProcessing(false)
        }
        reader.readAsText(file)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tFileErrors('fileUploadError')
        alert(errorMessage)
        setIsProcessing(false)
      }
    },
    [tFileErrors],
  )

  // Download handlers
  const handleDownloadHeader = useCallback(() => {
    if (!result?.isValid) return

    try {
      const content = JSON.stringify(result.header, null, 2)
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'jwt-header.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      alert(tFileErrors('downloadError'))
    }
  }, [result, tFileErrors])

  const handleDownloadPayload = useCallback(() => {
    if (!result?.isValid) return

    try {
      const content = JSON.stringify(result.payload, null, 2)
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'jwt-payload.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      alert(tFileErrors('downloadError'))
    }
  }, [result, tFileErrors])

  // Load sample text
  const loadSampleText = useCallback((sampleValue: string) => {
    setInputText(sampleValue)
  }, [])

  // Clear input
  const handleClear = useCallback(() => {
    setInputText('')
  }, [])

  // Toggle signature visibility
  const handleToggleSignature = useCallback(() => {
    setShowSignature((prev) => !prev)
  }, [])

  // Format JSON
  const formatJSON = useCallback((obj: any) => {
    return JSON.stringify(obj, null, 2)
  }, [])

  // Calculate input stats
  const inputStats = useMemo(
    () => ({
      characters: inputText.length,
      words: inputText.split(/\s+/).filter((word) => word.length > 0).length,
      lines: inputText.split('\n').length,
    }),
    [inputText],
  )

  // Calculate parts count
  const partsCount = useMemo(() => {
    return inputText.trim() ? inputText.split('.').length : 0
  }, [inputText])

  return {
    // State
    inputText,
    setInputText,
    viewMode,
    setViewMode,
    showSignature,
    isProcessing,
    result,
    tokenInfo,

    // Handlers
    handleFileUpload,
    handleDownloadHeader,
    handleDownloadPayload,
    loadSampleText,
    handleClear,
    handleToggleSignature,
    formatJSON,

    // Stats
    inputStats,
    partsCount,

    // Sample data
    samples,
  }
}
