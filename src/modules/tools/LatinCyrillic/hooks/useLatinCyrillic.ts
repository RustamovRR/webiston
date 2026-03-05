/**
 * Custom hook for Latin-Cyrillic transliteration
 * Features:
 * - Auto-detect script (Cyrillic/Latin) and switch direction
 * - Zustand store for direction persistence
 * - Debounced conversion for performance
 *
 * Note: React 19+ with React Compiler handles memoization automatically
 */

import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import { useDebounceValue } from "usehooks-ts"

import { SAMPLE_TEXTS } from "../constants"
import { useTransliterationStore } from "../stores"
import type {
  SampleItem,
  SampleTextKey,
  TransliterationDirection,
  UseLatinCyrillicResult
} from "../types"
import { isCyrillicText, toCyrillic, toLatin } from "../utils"

const DEBOUNCE_DELAY = 100
// Minimum characters before auto-detect kicks in
const AUTO_DETECT_THRESHOLD = 3

export function useLatinCyrillic(): UseLatinCyrillicResult {
  const t = useTranslations("LatinCyrillicPage")

  // Track previous text length to detect paste operations
  const prevTextLength = useRef(0)

  // Get state from store
  const { direction, sourceText, setDirection, setSourceText, reset } =
    useTransliterationStore()

  const [debouncedText] = useDebounceValue(sourceText, DEBOUNCE_DELAY)

  // Auto-detect script and switch direction
  useEffect(() => {
    // Skip if text is too short
    if (sourceText.length < AUTO_DETECT_THRESHOLD) {
      prevTextLength.current = sourceText.length
      return
    }

    // Detect if this is a paste operation (large text change)
    const textLengthDiff = Math.abs(sourceText.length - prevTextLength.current)
    const isPasteOperation = textLengthDiff > 5

    // Always auto-detect on paste, or when typing normally
    const isCyrillic = isCyrillicText(sourceText)
    const expectedDirection: TransliterationDirection = isCyrillic
      ? "cyrillic-to-latin"
      : "latin-to-cyrillic"

    // Switch direction if different (always on paste, or when auto-detect matches)
    if (direction !== expectedDirection && isPasteOperation) {
      setDirection(expectedDirection)
    }

    prevTextLength.current = sourceText.length
  }, [sourceText, direction, setDirection])

  // Converted text - React Compiler handles memoization
  const convertedText = (() => {
    if (!debouncedText.trim()) return ""

    try {
      return direction === "latin-to-cyrillic"
        ? toCyrillic(debouncedText)
        : toLatin(debouncedText)
    } catch (error) {
      console.error("Transliteration error:", error)
      return ""
    }
  })()

  // Action: manually set direction
  const handleSetDirection = (newDirection: TransliterationDirection) => {
    setDirection(newDirection)
  }

  // Action: swap direction and use converted text as new source
  const handleSwap = () => {
    const newDirection: TransliterationDirection =
      direction === "latin-to-cyrillic"
        ? "cyrillic-to-latin"
        : "latin-to-cyrillic"

    setDirection(newDirection)

    if (convertedText) {
      setSourceText(convertedText)
    }
  }

  // Action: clear all state
  const handleClear = () => {
    prevTextLength.current = 0
    reset()
  }

  // Action: load sample text
  const loadSample = (sampleKey: SampleTextKey) => {
    const sampleText = SAMPLE_TEXTS[sampleKey]
    setSourceText(sampleText)

    if (sampleKey.includes("LATIN")) {
      setDirection("latin-to-cyrillic")
    } else if (
      sampleKey.includes("CYRILLIC") ||
      sampleKey.includes("RUSSIAN")
    ) {
      setDirection("cyrillic-to-latin")
    }
  }

  // Computed UI labels
  const sourceLang =
    direction === "latin-to-cyrillic" ? t("latin") : t("cyrillic")

  const targetLang =
    direction === "latin-to-cyrillic" ? t("cyrillic") : t("latin")

  const sourcePlaceholder =
    direction === "latin-to-cyrillic"
      ? t("inputPlaceholderLatin")
      : t("inputPlaceholderCyrillic")

  // Sample items for dropdown
  const samples: SampleItem[] = [
    {
      key: "LATIN_GREETING",
      label: t("samples.latinGreeting"),
      value: SAMPLE_TEXTS.LATIN_GREETING
    },
    {
      key: "CYRILLIC_GREETING",
      label: t("samples.cyrillicGreeting"),
      value: SAMPLE_TEXTS.CYRILLIC_GREETING
    },
    {
      key: "LATIN_PARAGRAPH",
      label: t("samples.latinParagraph"),
      value: SAMPLE_TEXTS.LATIN_PARAGRAPH
    },
    {
      key: "CYRILLIC_PARAGRAPH",
      label: t("samples.cyrillicParagraph"),
      value: SAMPLE_TEXTS.CYRILLIC_PARAGRAPH
    }
  ]

  return {
    direction,
    sourceText,
    convertedText,
    setDirection: handleSetDirection,
    setSourceText,
    handleSwap,
    handleClear,
    loadSample,
    sourceLang,
    targetLang,
    sourcePlaceholder,
    samples
  }
}
