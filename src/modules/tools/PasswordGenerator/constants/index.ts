import type { PasswordSettings } from "../utils/generate-password"

/**
 * Tool-scoped constants. The presets used to be built inside the hook by a
 * `getPresetSettings(t: any)` that took the TRANSLATOR as an argument — so a
 * list of five fixed configurations was re-created on every render and could
 * not be imported by anything else, least of all a test.
 */

export const MIN_LENGTH = 4
export const MAX_LENGTH = 64

export const DEFAULT_SETTINGS: PasswordSettings = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: false,
  passwordType: "random"
}

export interface PasswordPreset {
  /** Also the i18n key under `PresetSettings.*`. */
  id: "standard" | "secure" | "easy" | "pin" | "wifi"
  settings: PasswordSettings
}

export const PRESETS: readonly PasswordPreset[] = [
  { id: "standard", settings: DEFAULT_SETTINGS },
  {
    id: "secure",
    settings: {
      length: 24,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: true,
      passwordType: "strong"
    }
  },
  {
    id: "easy",
    settings: {
      length: 12,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: true,
      passwordType: "memorable"
    }
  },
  {
    id: "pin",
    settings: {
      length: 6,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: false,
      passwordType: "random"
    }
  },
  {
    id: "wifi",
    settings: {
      length: 32,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: true,
      passwordType: "random"
    }
  }
]

export function isPresetActive(
  preset: PasswordPreset,
  settings: PasswordSettings
): boolean {
  return (Object.keys(preset.settings) as (keyof PasswordSettings)[]).every(
    (key) => preset.settings[key] === settings[key]
  )
}
