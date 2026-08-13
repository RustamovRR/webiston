"use client"

import { useCallback, useMemo, useState } from "react"

import { parseAmount } from "@/lib/uzbek-number-words/amount"

import { buildSampleTilxat, DOCX_FILE_NAME, EMPTY_TILXAT } from "../constants"
import type { TilxatData, TilxatParty, TilxatScript } from "../types"
import { composeTilxat, plainText, type TilxatSegment } from "../utils/document"
import {
  isDateOrderValid,
  isValidAddress,
  isValidName,
  isValidPassport,
  isValidPinfl
} from "../utils/validate"

/**
 * Field-level errors, keyed the way the form addresses its inputs.
 *
 * Only FILLED fields can be wrong — an empty field is the blank form, which
 * is a feature. The value is a message key into `TilxatPage.errors.*`; the
 * hook never holds a human sentence, because it does not know the reader's
 * language.
 */
export type TilxatErrors = Partial<
  Record<
    | "borrower.fullName"
    | "borrower.passport"
    | "borrower.pinfl"
    | "borrower.address"
    | "lender.fullName"
    | "lender.passport"
    | "lender.pinfl"
    | "lender.address"
    | "amount"
    | "city"
    | "returnDate"
    | "witness.0"
    | "witness.1",
    string
  >
>

interface UseTilxat {
  data: TilxatData
  setParty: (
    role: "borrower" | "lender",
    field: keyof TilxatParty,
    value: string
  ) => void
  setField: <
    K extends "amount" | "method" | "city" | "givenDate" | "returnDate"
  >(
    field: K,
    value: TilxatData[K]
  ) => void
  setInterestFree: (interestFree: boolean) => void
  setWitness: (index: 0 | 1, value: string) => void
  script: TilxatScript
  setScript: (script: TilxatScript) => void
  /** The document in the chosen script, as segments — the preview bolds `value`s. */
  segments: TilxatSegment[]
  /** The same document flattened — what copy and the clipboard get. */
  text: string
  /** "TILXAT" or "ТИЛХАТ", for the sheet's heading and the copy text. */
  heading: string
  errors: TilxatErrors
  copy: () => Promise<boolean>
  print: () => void
  /** Save the sheet as a .docx. Resolves false if the export failed. */
  downloadDocx: () => Promise<boolean>
  /** True while the ~500 kB `docx` chunk is loading. */
  isExporting: boolean
  /** Fills every field with a worked example, dated from today. */
  loadSample: () => void
  reset: () => void
}

/**
 * Derived during render, like the number-to-words hook and for the same
 * reason: composing the paper is string work over a dozen fields, it finishes
 * in microseconds, and deriving it in `useMemo` means the sheet can never
 * show a different amount than the form — the class of bug a legal document
 * must not have.
 */
export function useTilxat(): UseTilxat {
  const [data, setData] = useState<TilxatData>(() =>
    structuredClone(EMPTY_TILXAT)
  )
  const [script, setScript] = useState<TilxatScript>("lotin")
  const [isExporting, setExporting] = useState(false)

  const composition = useMemo(() => composeTilxat(data), [data])
  const segments = script === "lotin" ? composition.lotin : composition.kirill
  const heading = script === "lotin" ? "TILXAT" : "ТИЛХАТ"
  const text = useMemo(() => plainText(segments, heading), [segments, heading])

  const errors = useMemo<TilxatErrors>(() => {
    const found: TilxatErrors = {}
    const party = (role: "borrower" | "lender", value: TilxatParty) => {
      if (value.fullName.trim() && !isValidName(value.fullName)) {
        found[`${role}.fullName`] = "name"
      }
      if (value.passport.trim() && !isValidPassport(value.passport)) {
        found[`${role}.passport`] = "passport"
      }
      if (value.pinfl.trim() && !isValidPinfl(value.pinfl)) {
        found[`${role}.pinfl`] = "pinfl"
      }
      if (value.address.trim() && !isValidAddress(value.address)) {
        found[`${role}.address`] = "address"
      }
    }
    party("borrower", data.borrower)
    party("lender", data.lender)

    if (data.amount.trim()) {
      const parsed = parseAmount(data.amount)
      if (!parsed.ok) {
        // "Too large" and "not a number" are different mistakes and deserve
        // different sentences — "faqat son kiriting" is nonsense advice to
        // someone who typed nothing but digits.
        found.amount = parsed.error === "tooLarge" ? "amountTooLarge" : "amount"
      }
    }
    if (data.city.trim() && !isValidAddress(data.city)) {
      found.city = "address"
    }
    if (!isDateOrderValid(data.givenDate, data.returnDate)) {
      found.returnDate = "dateOrder"
    }
    data.witnesses.forEach((name, index) => {
      if (name.trim() && !isValidName(name)) {
        found[`witness.${index as 0 | 1}`] = "name"
      }
    })

    return found
  }, [data])

  const setParty = useCallback(
    (role: "borrower" | "lender", field: keyof TilxatParty, value: string) => {
      setData((current) => ({
        ...current,
        [role]: { ...current[role], [field]: value }
      }))
    },
    []
  )

  const setField = useCallback(
    <K extends "amount" | "method" | "city" | "givenDate" | "returnDate">(
      field: K,
      value: TilxatData[K]
    ) => {
      setData((current) => ({ ...current, [field]: value }))
    },
    []
  )

  const setInterestFree = useCallback((interestFree: boolean) => {
    setData((current) => ({ ...current, interestFree }))
  }, [])

  const setWitness = useCallback((index: 0 | 1, value: string) => {
    setData((current) => {
      const witnesses: [string, string] = [...current.witnesses]
      witnesses[index] = value
      return { ...current, witnesses }
    })
  }, [])

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }, [text])

  /**
   * Print through the page itself, scoped by a body class.
   *
   * The print stylesheet (in `TilxatPreview`) hides everything except the
   * sheet while `tilxat-print` is on `<body>`. The class comes off on
   * `afterprint`, NOT after `window.print()` returns — Safari can return
   * before its dialog closes, and a class removed too early prints the whole
   * page chrome.
   */
  const print = useCallback(() => {
    document.body.classList.add("tilxat-print")
    window.addEventListener(
      "afterprint",
      () => document.body.classList.remove("tilxat-print"),
      { once: true }
    )
    window.print()
  }, [])

  const downloadDocx = useCallback(async () => {
    setExporting(true)
    try {
      const { downloadTilxatDocx } = await import("../utils/docx")
      await downloadTilxatDocx(segments, heading, DOCX_FILE_NAME)
      return true
    } catch (error) {
      console.error("Tilxat DOCX export failed:", error)
      return false
    } finally {
      setExporting(false)
    }
  }, [segments, heading])

  /** Read the clock HERE, on the click — never at module scope. */
  const loadSample = useCallback(() => {
    setData(buildSampleTilxat(new Date()))
  }, [])

  const reset = useCallback(() => {
    setData(structuredClone(EMPTY_TILXAT))
  }, [])

  return {
    data,
    setParty,
    setField,
    setInterestFree,
    setWitness,
    script,
    setScript,
    segments,
    text,
    heading,
    errors,
    copy,
    print,
    downloadDocx,
    isExporting,
    loadSample,
    reset
  }
}
