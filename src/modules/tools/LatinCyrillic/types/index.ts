/**
 * Type definitions barrel export
 */

import type { UzbekScript } from "@webiston/transliteration"

// Core transliteration types come from the package — one definition, not a
// re-declaration that can drift.
export type {
  DirectionPreference,
  ScriptType,
  TransliterationDirection
} from "@webiston/transliteration"
export type {
  DownloadFormat,
  FileImportStatus,
  ImportProgress
} from "./file"

/**
 * What the alphabet switch holds: "auto" — the Latin ↔ Cyrillic flip this
 * converter has always made — or the alphabet to convert INTO.
 */
export type ScriptPreference = "auto" | UzbekScript
