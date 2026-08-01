"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import { useTranslations } from "next-intl"

import { isPresetActive, MAX_LENGTH, MIN_LENGTH, PRESETS } from "../constants"
import type { PasswordSettings } from "../utils/generate-password"

/**
 * Everything the visitor can turn. Presets first — the same argument as the
 * QR page's style strip: five ready answers beat six controls, and the
 * controls below stay for the visitor who knows exactly what they want.
 */

type PasswordType = PasswordSettings["passwordType"]

/** The five on/off switches, driven off one table instead of five copies. */
const TOGGLES = [
  "includeUppercase",
  "includeLowercase",
  "includeNumbers",
  "includeSymbols",
  "excludeSimilar"
] as const

const TOGGLE_KEY: Record<(typeof TOGGLES)[number], string> = {
  includeUppercase: "uppercase",
  includeLowercase: "lowercase",
  includeNumbers: "numbers",
  includeSymbols: "symbols",
  excludeSimilar: "excludeSimilar"
}

interface SettingsPanelProps {
  settings: PasswordSettings
  onChange: (patch: Partial<PasswordSettings>) => void
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const t = useTranslations("PasswordGeneratorPage.ConfigPanel")
  const tTypes = useTranslations("PasswordGeneratorPage.PasswordTypes")
  const tOptions = useTranslations("PasswordGeneratorPage.CharacterOptions")
  const tPresets = useTranslations("PasswordGeneratorPage.PresetSettings")

  return (
    <div className="space-y-5">
      <fieldset>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-muted-foreground text-sm">{t("presets")}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              size="sm"
              variant={isPresetActive(preset, settings) ? "default" : "outline"}
              title={tPresets(`${preset.id}.description`)}
              onClick={() => onChange(preset.settings)}
            >
              {tPresets(`${preset.id}.label`)}
            </Button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-5 rounded-xl border border-border bg-card p-5">
        <SegmentedControl<PasswordType>
          label={t("passwordType")}
          value={settings.passwordType}
          onChange={(passwordType) => onChange({ passwordType })}
          options={[
            { value: "random", label: tTypes("random") },
            { value: "strong", label: tTypes("strong") },
            { value: "memorable", label: tTypes("memorable") }
          ]}
        />

        <label className="block text-sm">
          <span className="text-muted-foreground">
            {t("lengthLabel", { length: settings.length })}
          </span>
          <input
            type="range"
            min={MIN_LENGTH}
            max={MAX_LENGTH}
            value={settings.length}
            onChange={(event) =>
              onChange({ length: Number(event.target.value) })
            }
            className="mt-2 w-full accent-primary"
          />
        </label>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {TOGGLES.map((toggle) => (
            <label
              key={toggle}
              className="flex cursor-pointer items-center gap-2.5 text-sm"
            >
              <input
                type="checkbox"
                checked={settings[toggle]}
                onChange={(event) =>
                  onChange({ [toggle]: event.target.checked })
                }
                className="size-4 accent-primary"
              />
              <span className="text-foreground">
                {tOptions(TOGGLE_KEY[toggle])}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
