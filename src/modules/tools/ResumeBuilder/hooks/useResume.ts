"use client"

import { useCallback, useEffect, useState } from "react"

import { buildSampleResume, EMPTY_RESUME } from "../constants"
import type {
  EducationEntry,
  ExperienceEntry,
  LanguageEntry,
  ResumeData
} from "../types"

/**
 * Where the draft lives. localStorage, not a server — the privacy claim is
 * the same one the rest of the site makes, and this keeps it literally true:
 * the resume never leaves the device.
 */
const STORAGE_KEY = "webiston:rezyume:v1"

/** A blank row for each repeating section. */
export const EMPTY_EXPERIENCE: ExperienceEntry = {
  company: "",
  role: "",
  from: "",
  to: "",
  current: false,
  description: ""
}
export const EMPTY_EDUCATION: EducationEntry = {
  institution: "",
  field: "",
  from: "",
  to: ""
}
export const EMPTY_LANGUAGE: LanguageEntry = { name: "", level: "" }

/**
 * Merge a stored draft over the empty shape.
 *
 * NOT `JSON.parse(stored)` straight into state: a draft written by an older
 * version is missing whatever fields have been added since, and a missing
 * `contact` object would throw on first render. Merging one level deep on the
 * nested objects covers every shape this data has.
 */
function restore(): ResumeData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as Partial<ResumeData>
    return {
      ...EMPTY_RESUME,
      ...stored,
      contact: { ...EMPTY_RESUME.contact, ...stored.contact },
      personal: { ...EMPTY_RESUME.personal, ...stored.personal },
      experience: stored.experience ?? [],
      education: stored.education ?? [],
      skills: stored.skills ?? [],
      languages: stored.languages ?? []
    }
  } catch {
    // A corrupt draft is not worth an error screen — start clean.
    return null
  }
}

interface UseResume {
  data: ResumeData
  /** Top-level field, type-safe per key. */
  set: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void
  /** One key inside `contact` or `personal`. */
  setNested: <S extends "contact" | "personal", K extends keyof ResumeData[S]>(
    section: S,
    key: K,
    value: ResumeData[S][K]
  ) => void
  /** One field of one row of a repeating section. */
  setRow: <S extends RepeatingSection, K extends keyof ResumeData[S][number]>(
    section: S,
    index: number,
    key: K,
    value: ResumeData[S][number][K]
  ) => void
  addRow: (section: RepeatingSection) => void
  removeRow: (section: RepeatingSection, index: number) => void
  moveRow: (section: RepeatingSection, index: number, by: -1 | 1) => void
  loadSample: () => void
  reset: () => void
  /** False until the stored draft has been read — the sheet waits for it. */
  restored: boolean
}

type RepeatingSection = "experience" | "education" | "languages"

const BLANK_ROW: Record<RepeatingSection, unknown> = {
  experience: EMPTY_EXPERIENCE,
  education: EMPTY_EDUCATION,
  languages: EMPTY_LANGUAGE
}

/**
 * Everything the resume form does. One hook, because the alternative is a
 * Zustand store for state that never outlives this tree.
 *
 * The draft is READ in an effect rather than in `useState`'s initialiser:
 * this page is server-rendered, and touching localStorage during the first
 * render makes the server and client markup disagree — a hydration error on
 * an SEO-critical page. So the first paint is the empty form, and the stored
 * draft replaces it a tick later.
 */
export function useResume(): UseResume {
  const [data, setData] = useState<ResumeData>(() =>
    structuredClone(EMPTY_RESUME)
  )
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    const stored = restore()
    if (stored) setData(stored)
    setRestored(true)
  }, [])

  // Only after the restore has run: writing before it would persist the empty
  // form over a real draft on every page load.
  useEffect(() => {
    if (!restored) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Quota or private mode — the tool still works, it just forgets.
    }
  }, [data, restored])

  const set = useCallback(
    <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
      setData((current) => ({ ...current, [key]: value }))
    },
    []
  )

  const setNested = useCallback(
    <S extends "contact" | "personal", K extends keyof ResumeData[S]>(
      section: S,
      key: K,
      value: ResumeData[S][K]
    ) => {
      setData((current) => ({
        ...current,
        [section]: { ...current[section], [key]: value }
      }))
    },
    []
  )

  const setRow = useCallback(
    <S extends RepeatingSection, K extends keyof ResumeData[S][number]>(
      section: S,
      index: number,
      key: K,
      value: ResumeData[S][number][K]
    ) => {
      setData((current) => ({
        ...current,
        [section]: current[section].map((row, at) =>
          at === index ? { ...row, [key]: value } : row
        )
      }))
    },
    []
  )

  const addRow = useCallback((section: RepeatingSection) => {
    setData((current) => ({
      ...current,
      [section]: [
        ...current[section],
        structuredClone(BLANK_ROW[section]) as never
      ]
    }))
  }, [])

  const removeRow = useCallback((section: RepeatingSection, index: number) => {
    setData((current) => ({
      ...current,
      [section]: current[section].filter((_, at) => at !== index)
    }))
  }, [])

  /** Reordering matters here: a CV is read top-down and recency is the point. */
  const moveRow = useCallback(
    (section: RepeatingSection, index: number, by: -1 | 1) => {
      setData((current) => {
        const rows = [...current[section]]
        const target = index + by
        if (target < 0 || target >= rows.length) return current
        ;[rows[index], rows[target]] = [rows[target], rows[index]]
        return { ...current, [section]: rows }
      })
    },
    []
  )

  const loadSample = useCallback(() => setData(buildSampleResume()), [])
  const reset = useCallback(() => setData(structuredClone(EMPTY_RESUME)), [])

  return {
    data,
    set,
    setNested,
    setRow,
    addRow,
    removeRow,
    moveRow,
    loadSample,
    reset,
    restored
  }
}
