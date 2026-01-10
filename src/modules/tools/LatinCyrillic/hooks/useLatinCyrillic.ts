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

  // Track if user manually changed direction
  const userChangedDirection = useRef(false)

  // Get state from store
  const { direction, sourceText, setDirection, setSourceText, reset } =
    useTransliterationStore()

  const [debouncedText] = useDebounceValue(sourceText, DEBOUNCE_DELAY)

  // Auto-detect script and switch direction
  useEffect(() => {
    // Skip if user manually changed direction or text is too short
    if (
      userChangedDirection.current ||
      sourceText.length < AUTO_DETECT_THRESHOLD
    ) {
      return
    }

    const isCyrillic = isCyrillicText(sourceText)
    const expectedDirection: TransliterationDirection = isCyrillic
      ? "cyrillic-to-latin"
      : "latin-to-cyrillic"

    // Only switch if different from current
    if (direction !== expectedDirection) {
      setDirection(expectedDirection)
    }
  }, [sourceText, direction, setDirection])

  // Reset manual flag when text is cleared
  useEffect(() => {
    if (sourceText === "") {
      userChangedDirection.current = false
    }
  }, [sourceText])

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

  // Action: manually set direction (marks as user-changed)
  const handleSetDirection = (newDirection: TransliterationDirection) => {
    userChangedDirection.current = true
    setDirection(newDirection)
  }

  // Action: swap direction and use converted text as new source
  const handleSwap = () => {
    userChangedDirection.current = true
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
    userChangedDirection.current = false
    reset()
  }

  // Action: load sample text
  const loadSample = (sampleKey: SampleTextKey) => {
    userChangedDirection.current = true
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
