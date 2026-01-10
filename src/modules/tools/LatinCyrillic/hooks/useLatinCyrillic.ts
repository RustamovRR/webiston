"use client"

/**
 * Custom hook for Latin-Cyrillic transliteration
 * Manages state, conversion logic, and UI helpers
 */

import { useTranslations } from "next-intl"
import { useCallback, useMemo, useState } from "react"
import { useDebounceValue } from "usehooks-ts"
import { SAMPLE_TEXTS } from "../constants"
import type {
  SampleItem,
  SampleTextKey,
  TransliterationDirection,
  UseLatinCyrillicResult
} from "../types"
import { toCyrillic, toLatin } from "../utils"

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 100

export function useLatinCyrillic(): UseLatinCyrillicResult {
  const t = useTranslations("LatinCyrillicPage")

  // Core state
  const [direction, setDirection] =
    useState<TransliterationDirection>("latin-to-cyrillic")
  const [sourceText, setSourceText] = useState("")

  // Debounced text for performance
  const [debouncedText] = useDebounceValue(sourceText, DEBOUNCE_DELAY)

  // Computed: converted text
  const convertedText = useMemo(() => {
    if (!debouncedText.trim()) return ""

    try {
      return direction === "latin-to-cyrillic"
        ? toCyrillic(debouncedText)
        : toLatin(debouncedText)
    } catch (error) {
      console.error("Transliteration error:", error)
      return ""
    }
  }, [debouncedText, direction])

  // Action: swap direction and use converted text as new source
  const handleSwap = useCallback(() => {
    const newDirection: TransliterationDirection =
      direction === "latin-to-cyrillic"
        ? "cyrillic-to-latin"
        : "latin-to-cyrillic"

    setDirection(newDirection)

    if (convertedText) {
      setSourceText(convertedText)
    }
  }, [direction, convertedText])

  // Action: clear source text
  const handleClear = useCallback(() => {
    setSourceText("")
  }, [])

  // Action: load sample text
  const loadSample = useCallback((sampleKey: SampleTextKey) => {
    const sampleText = SAMPLE_TEXTS[sampleKey]
    setSourceText(sampleText)

    // Auto-detect direction based on sample type
    if (sampleKey.includes("LATIN")) {
      setDirection("latin-to-cyrillic")
    } else if (
      sampleKey.includes("CYRILLIC") ||
      sampleKey.includes("RUSSIAN")
    ) {
      setDirection("cyrillic-to-latin")
    }
  }, [])

  // Computed: UI labels
  const sourceLang = useMemo(
    () => (direction === "latin-to-cyrillic" ? t("latin") : t("cyrillic")),
    [direction, t]
  )

  const targetLang = useMemo(
    () => (direction === "latin-to-cyrillic" ? t("cyrillic") : t("latin")),
    [direction, t]
  )

  const sourcePlaceholder = useMemo(
    () =>
      direction === "latin-to-cyrillic"
        ? t("inputPlaceholderLatin")
        : t("inputPlaceholderCyrillic"),
    [direction, t]
  )

  // Computed: sample items for dropdown
  const samples: SampleItem[] = useMemo(
    () => [
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
    ],
    [t]
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
    samples
  }
}
