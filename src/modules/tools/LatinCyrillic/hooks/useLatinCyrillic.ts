/**
 * Custom hook for Latin-Cyrillic transliteration
 * Manages state, conversion logic, and UI helpers
 *
 * Note: React 19+ with React Compiler handles memoization automatically
 * No need for useMemo/useCallback - compiler optimizes re-renders
 */

import { useTranslations } from "next-intl"
import { useState } from "react"
import { useDebounceValue } from "usehooks-ts"
import { SAMPLE_TEXTS } from "../constants"
import type {
  SampleItem,
  SampleTextKey,
  TransliterationDirection,
  UseLatinCyrillicResult
} from "../types"
import { toCyrillic, toLatin } from "../utils"

const DEBOUNCE_DELAY = 100

export function useLatinCyrillic(): UseLatinCyrillicResult {
  const t = useTranslations("LatinCyrillicPage")

  const [direction, setDirection] =
    useState<TransliterationDirection>("latin-to-cyrillic")
  const [sourceText, setSourceText] = useState("")

  const [debouncedText] = useDebounceValue(sourceText, DEBOUNCE_DELAY)

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

  // Action: clear source text
  const handleClear = () => {
    setSourceText("")
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
    setDirection,
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
