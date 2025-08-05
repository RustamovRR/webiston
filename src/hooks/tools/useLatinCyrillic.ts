'use client'

import { useState, useMemo, useCallback } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('LatinCyrillicPage')
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
  const sourceLang = direction === 'latin-to-cyrillic' ? t('latin') : t('cyrillic')
  const targetLang = direction === 'latin-to-cyrillic' ? t('cyrillic') : t('latin')
  const sourcePlaceholder =
    direction === 'latin-to-cyrillic' ? t('inputPlaceholderLatin') : t('inputPlaceholderCyrillic')

  const samples = useMemo(
    () => [
      { key: 'LATIN_GREETING', label: t('samples.latinGreeting'), value: SAMPLE_TEXTS.LATIN_GREETING },
      { key: 'CYRILLIC_GREETING', label: t('samples.cyrillicGreeting'), value: SAMPLE_TEXTS.CYRILLIC_GREETING },
      { key: 'LATIN_PARAGRAPH', label: t('samples.latinParagraph'), value: SAMPLE_TEXTS.LATIN_PARAGRAPH },
      { key: 'CYRILLIC_PARAGRAPH', label: t('samples.cyrillicParagraph'), value: SAMPLE_TEXTS.CYRILLIC_PARAGRAPH },
    ],
    [t],
  )

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
