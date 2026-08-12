"use client"

import { Input } from "@webiston/ui/primitives/input"
import { useTranslations } from "next-intl"
import { useId } from "react"

import {
  BACKGROUND_PRESETS,
  CODE_FONTS,
  type CodeFontId,
  FONT_SIZES,
  LINE_HEIGHTS,
  PADDINGS
} from "../constants"
import type { SnapshotOptions, WindowFrame } from "../types"
import { SelectField } from "./SelectField"

interface StylePanelProps {
  options: SnapshotOptions
  onChange: (patch: Partial<SnapshotOptions>) => void
  font: CodeFontId
  onFontChange: (font: CodeFontId) => void
  themes: readonly { id: string; label: string }[]
  theme: string
  onThemeChange: (theme: string) => void
  languages: readonly { id: string; label: string }[]
  language: string
  onLanguageChange: (language: string) => void
}

const FRAMES: WindowFrame[] = ["macos", "plain", "none"]

/**
 * Every control, in one column. Dumb: props in, callbacks out.
 *
 * Ordered by how often a first-time visitor touches them — theme and language
 * decide whether the picture is right at all, and the rest is refinement. The
 * competition buries the language picker in a second panel and it is the first
 * thing anyone needs.
 */
export function StylePanel({
  options,
  onChange,
  font,
  onFontChange,
  themes,
  theme,
  onThemeChange,
  languages,
  language,
  onLanguageChange
}: StylePanelProps) {
  const t = useTranslations("CodeSnapshotPage.style")
  const titleId = useId()
  const numbersId = useId()
  const hintId = useId()

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label={t("theme")}
          value={theme}
          onChange={onThemeChange}
          options={themes.map((item) => ({
            value: item.id,
            label: item.label
          }))}
        />
        <SelectField
          label={t("language")}
          value={language}
          onChange={onLanguageChange}
          options={languages.map((item) => ({
            value: item.id,
            label: item.label
          }))}
        />
        <SelectField
          label={t("font")}
          value={font}
          onChange={(value) => onFontChange(value as CodeFontId)}
          options={CODE_FONTS.map((item) => ({
            value: item.id,
            label: item.label
          }))}
        />
        <SelectField
          label={t("fontSize")}
          value={String(options.fontSize)}
          onChange={(value) => onChange({ fontSize: Number(value) })}
          options={FONT_SIZES.map((size) => ({
            value: String(size),
            label: `${size}px`
          }))}
        />
        <SelectField
          label={t("lineHeight")}
          value={String(options.lineHeight)}
          onChange={(value) => onChange({ lineHeight: Number(value) })}
          options={LINE_HEIGHTS.map((value) => ({
            value: String(value),
            label: String(value)
          }))}
        />
        <SelectField
          label={t("padding")}
          value={String(options.padding)}
          onChange={(value) => onChange({ padding: Number(value) })}
          options={PADDINGS.map((value) => ({
            value: String(value),
            label: `${value}px`
          }))}
        />
        <SelectField
          label={t("frame")}
          value={options.frame}
          onChange={(value) => onChange({ frame: value as WindowFrame })}
          options={FRAMES.map((value) => ({
            value,
            label: t(`frames.${value}`)
          }))}
        />
        <SelectField
          label={t("background")}
          value={
            BACKGROUND_PRESETS.find(
              (preset) =>
                preset.value.from === options.background.from &&
                preset.value.to === options.background.to
            )?.id ?? BACKGROUND_PRESETS[0].id
          }
          onChange={(value) => {
            const preset = BACKGROUND_PRESETS.find((item) => item.id === value)
            if (preset) onChange({ background: preset.value })
          }}
          options={BACKGROUND_PRESETS.map((preset) => ({
            value: preset.id,
            label: t(`backgrounds.${preset.id}`)
          }))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        {/* `windowTitle`, not `title` — the panel's own card heading already
            owns `style.title`, and a second `title` key in the same object
            silently overwrote it: JSON keeps the last one, so the card
            rendered "Sarlavha" as its heading. */}
        <label htmlFor={titleId} className="text-muted-foreground text-xs">
          {t("windowTitle")}
        </label>
        {/* Disabled off the macOS frame, because `paint.ts` only draws the
            title in that bar. Left enabled, the visitor types a filename and
            watches nothing happen — a control that lies about what it does is
            worse than one that is visibly unavailable. */}
        <Input
          id={titleId}
          value={options.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder={t("titlePlaceholder")}
          disabled={options.frame !== "macos"}
          aria-describedby={options.frame !== "macos" ? hintId : undefined}
        />
        {options.frame !== "macos" && (
          <p id={hintId} className="text-muted-foreground text-xs">
            {t("titleOnlyMacos")}
          </p>
        )}
      </div>

      {/* A native checkbox, not a switch: this is a form control inside a form
          panel, and the package has no checkbox primitive to reach for. */}
      <div className="flex items-center gap-2">
        <input
          id={numbersId}
          type="checkbox"
          checked={options.showLineNumbers}
          onChange={(event) =>
            onChange({ showLineNumbers: event.target.checked })
          }
          className="size-4 accent-primary"
        />
        <label htmlFor={numbersId} className="text-foreground text-sm">
          {t("lineNumbers")}
        </label>
      </div>
    </div>
  )
}
