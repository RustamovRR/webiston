"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Input } from "@webiston/ui/primitives/input"
import { Wand2 } from "lucide-react"
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
import type { SnapshotOptions, ThemePalette, WindowFrame } from "../types"
import { BackgroundPicker } from "./BackgroundPicker"
import { SelectField } from "./SelectField"
import { ThemePicker } from "./ThemePicker"

interface StylePanelProps {
  options: SnapshotOptions
  onChange: (patch: Partial<SnapshotOptions>) => void
  font: CodeFontId
  onFontChange: (font: CodeFontId) => void
  themes: readonly ThemePalette[]
  theme: string
  onThemeChange: (theme: string) => void
  languages: readonly { id: string; label: string }[]
  language: string
  onLanguageChange: (language: string) => void
  onFormat: () => void
  /** False for the 342 grammars Prettier has no parser for. */
  formattable: boolean
  formatting: boolean
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
  onLanguageChange,
  onFormat,
  formattable,
  formatting
}: StylePanelProps) {
  const t = useTranslations("CodeSnapshotPage.style")
  const titleId = useId()
  const numbersId = useId()
  const hintId = useId()

  /**
   * The preset the current background came from, or null once it stops
   * matching one. Compared on the colours rather than tracked as its own piece
   * of state — the background IS the option, and a second field holding "which
   * chip" is a second source of truth that a URL-restored value would break.
   */
  const activeBackground =
    BACKGROUND_PRESETS.find(
      (preset) =>
        preset.value.from === options.background.from &&
        preset.value.to === options.background.to
    )?.id ?? null

  return (
    <div className="flex flex-col gap-4">
      {/* Theme and background are the two decisions that are made by LOOKING,
          so they get real estate and their own row; everything below is
          refinement and stays in the two-column grid of dropdowns. */}
      <ThemePicker
        label={t("theme")}
        hint={t("themeCount", { count: themes.length })}
        themes={themes}
        value={theme}
        onChange={onThemeChange}
      />

      <BackgroundPicker
        label={t("background")}
        value={activeBackground}
        onChange={(background) => onChange({ background })}
        options={BACKGROUND_PRESETS.map((preset) => ({
          id: preset.id,
          label: t(`backgrounds.${preset.id}`),
          value: preset.value
        }))}
      />

      {/* Language and Format sit together because the button's availability
          is a fact ABOUT the language: Prettier parses 18 of Shiki's 360
          grammars. Disabled rather than hidden — a control that vanishes as
          you scroll a dropdown is harder to understand than one that is
          visibly unavailable, and `title` says why. */}
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <SelectField
            label={t("language")}
            value={language}
            onChange={onLanguageChange}
            options={languages.map((item) => ({
              value: item.id,
              label: item.label
            }))}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onFormat}
          disabled={!formattable || formatting}
          title={formattable ? undefined : t("formatUnavailable")}
        >
          <Wand2 className="size-4" />
          {formatting ? t("formatting") : t("format")}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
