'use client'

import { useState, useMemo, useCallback } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import { toCyrillic, toLatin } from '@/lib/transliteration'

export type Direction = 'latin-to-cyrillic' | 'cyrillic-to-latin'

// Sample data constants
export const SAMPLE_TEXTS = {
  LATIN_GREETING: "Assalomu alaykum! Bu Lotin-Kirill o'giruvchi vositasi.",
  CYRILLIC_GREETING: 'Ассалому алайкум! Бу Лотин-Кирилл ўгирувчи воситаси.',
  LATIN_PARAGRAPH: "O'zbekiston Respublikasi mustaqil davlat hisoblanadi. Uning poytaxti Toshkent shahri.",
  CYRILLIC_PARAGRAPH: 'Ўзбекистон Республикаси мустақил давлат ҳисобланади. Унинг пойтахти Тошкент шаҳри.',
}

interface UseLatinCyrillicResult {
  // State
  direction: Direction
  sourceText: string
  convertedText: string

  // Actions
  setDirection: (direction: Direction) => void
  setSourceText: (text: string) => void
  handleSwap: () => void
  handleClear: () => void
  loadSample: (sampleKey: keyof typeof SAMPLE_TEXTS) => void

  // Computed
  sourceLang: string
  targetLang: string
  sourcePlaceholder: string
  samples: Array<{ key: string; label: string; value: string }>
}

export const useLatinCyrillic = (): UseLatinCyrillicResult => {
  const [direction, setDirection] = useState<Direction>('latin-to-cyrillic')
  const [sourceText, setSourceText] = useState('')

  const [debouncedText] = useDebounceValue(sourceText, 100)

  const convertedText = useMemo(() => {
    if (!debouncedText.trim()) return ''

    try {
      return direction === 'latin-to-cyrillic' ? toCyrillic(debouncedText) : toLatin(debouncedText)
    } catch (error) {
      console.error('Transliteration error:', error)
      return ''
    }
  }, [debouncedText, direction])

  const handleSwap = useCallback(() => {
    const newDirection: Direction = direction === 'latin-to-cyrillic' ? 'cyrillic-to-latin' : 'latin-to-cyrillic'

    setDirection(newDirection)

    // If we have converted text, use it as new source text
    if (convertedText) {
      setSourceText(convertedText)
    }
  }, [direction, convertedText])

  const handleClear = useCallback(() => {
    setSourceText('')
  }, [])

  const loadSample = useCallback((sampleKey: keyof typeof SAMPLE_TEXTS) => {
    const sampleText = SAMPLE_TEXTS[sampleKey]
    setSourceText(sampleText)

    // Auto-detect direction based on sample text
    if (sampleKey.includes('LATIN')) {
      setDirection('latin-to-cyrillic')
    } else if (sampleKey.includes('CYRILLIC')) {
      setDirection('cyrillic-to-latin')
    }
  }, [])

  // Computed values
  const sourceLang = direction === 'latin-to-cyrillic' ? 'Lotin' : 'Kirill'
  const targetLang = direction === 'latin-to-cyrillic' ? 'Kirill' : 'Lotin'
  const sourcePlaceholder = direction === 'latin-to-cyrillic' ? 'Matn kiriting...' : 'Матн киритинг...'

  const samples = [
    { key: 'LATIN_GREETING', label: 'Lotin salom', value: SAMPLE_TEXTS.LATIN_GREETING },
    { key: 'CYRILLIC_GREETING', label: 'Kirill salom', value: SAMPLE_TEXTS.CYRILLIC_GREETING },
    { key: 'LATIN_PARAGRAPH', label: 'Lotin paragraf', value: SAMPLE_TEXTS.LATIN_PARAGRAPH },
    { key: 'CYRILLIC_PARAGRAPH', label: 'Kirill paragraf', value: SAMPLE_TEXTS.CYRILLIC_PARAGRAPH },
  ]

  return {
    // State
    direction,
    sourceText,
    convertedText,

    // Actions
    setDirection,
    setSourceText,
    handleSwap,
    handleClear,
    loadSample,

    // Computed
    sourceLang,
    targetLang,
    sourcePlaceholder,
    samples,
  }
}
