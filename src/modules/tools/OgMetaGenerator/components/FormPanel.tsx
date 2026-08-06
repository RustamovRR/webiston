"use client"

import { cn } from "@webiston/ui"
import { Input } from "@webiston/ui/primitives/input"
import { useTranslations } from "next-intl"
import { useId } from "react"

import {
  DESCRIPTION_IDEAL_MAX,
  OG_LOCALES,
  OG_TYPES,
  TITLE_IDEAL_MAX,
  TWITTER_CARDS
} from "../constants"
import type { MetaDraft, OgType, TwitterCard } from "../types"

/**
 * The fields, in the order they matter.
 *
 * Title, description and image decide what a share card looks like; the rest
 * is configuration and sits under them. What this replaces was a 417-line
 * panel with a "Basic info" and a "System settings" accordion, macOS traffic
 * lights in its header and eleven palette classes.
 *
 * The counters are the important detail. The old form **refused keystrokes**
 * past 70 characters — `updateField` returned early without setting state and
 * called an `onError` that was wired to nothing, so the field simply stopped
 * accepting input with no explanation. Long titles are legal; they are just
 * truncated by the platforms. So everything is typeable and the counter says
 * where the cut falls.
 */

interface FormPanelProps {
  draft: MetaDraft
  onChange: <Key extends keyof MetaDraft>(
    field: Key,
    value: MetaDraft[Key]
  ) => void
}

export function FormPanel({ draft, onChange }: FormPanelProps) {
  const t = useTranslations("OgMetaGeneratorPage.form")
  const ids = useId()

  const field = (name: keyof MetaDraft) => `${ids}-${name}`

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <label
            htmlFor={field("title")}
            className="font-medium text-foreground text-sm"
          >
            {t("title")}
          </label>
          <Counter length={draft.title.trim().length} max={TITLE_IDEAL_MAX} />
        </div>
        <Input
          id={field("title")}
          value={draft.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder={t("titlePlaceholder")}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <label
            htmlFor={field("description")}
            className="font-medium text-foreground text-sm"
          >
            {t("description")}
          </label>
          <Counter
            length={draft.description.trim().length}
            max={DESCRIPTION_IDEAL_MAX}
          />
        </div>
        <textarea
          id={field("description")}
          value={draft.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder={t("descriptionPlaceholder")}
          rows={3}
          className="w-full resize-y rounded-lg border border-border bg-input px-3 py-2 text-foreground text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={field("image")}
          className="font-medium text-foreground text-sm"
        >
          {t("image")}
        </label>
        <Input
          id={field("image")}
          value={draft.image}
          onChange={(event) => onChange("image", event.target.value)}
          placeholder="https://saytingiz.uz/og.png"
          className="font-mono text-xs"
          autoComplete="off"
          spellCheck={false}
        />
        <p className="text-muted-foreground text-xs">{t("imageHint")}</p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={field("imageAlt")}
          className="font-medium text-foreground text-sm"
        >
          {t("imageAlt")}
        </label>
        <Input
          id={field("imageAlt")}
          value={draft.imageAlt}
          onChange={(event) => onChange("imageAlt", event.target.value)}
          placeholder={t("imageAltPlaceholder")}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={field("url")}
          className="font-medium text-foreground text-sm"
        >
          {t("url")}
        </label>
        <Input
          id={field("url")}
          value={draft.url}
          onChange={(event) => onChange("url", event.target.value)}
          placeholder="https://saytingiz.uz/sahifa"
          className="font-mono text-xs"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor={field("siteName")}
            className="font-medium text-foreground text-sm"
          >
            {t("siteName")}
          </label>
          <Input
            id={field("siteName")}
            value={draft.siteName}
            onChange={(event) => onChange("siteName", event.target.value)}
            placeholder="Webiston"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={field("twitterSite")}
            className="font-medium text-foreground text-sm"
          >
            {t("twitterSite")}
          </label>
          <Input
            id={field("twitterSite")}
            value={draft.twitterSite}
            onChange={(event) => onChange("twitterSite", event.target.value)}
            placeholder="@webiston_uz"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <Select
          id={field("type")}
          label={t("type")}
          value={draft.type}
          onChange={(value) => onChange("type", value as OgType)}
          options={OG_TYPES.map((value) => ({
            value,
            label: t(`types.${value}`)
          }))}
        />

        <Select
          id={field("twitterCard")}
          label={t("twitterCard")}
          value={draft.twitterCard}
          onChange={(value) => onChange("twitterCard", value as TwitterCard)}
          options={TWITTER_CARDS.map((value) => ({
            value,
            label: t(`cards.${value}`)
          }))}
        />

        <Select
          id={field("locale")}
          label={t("locale")}
          value={draft.locale}
          onChange={(value) => onChange("locale", value)}
          options={OG_LOCALES.map((value) => ({ value, label: value }))}
        />
      </div>
    </div>
  )
}

/**
 * How much of the text survives.
 *
 * Muted until the limit is passed, then `warning` — never `destructive`,
 * because a long title is not an error, it is a title that will be cut.
 */
function Counter({ length, max }: { length: number; max: number }) {
  return (
    <span
      className={cn(
        "font-mono text-xs tabular-nums",
        length > max ? "text-warning" : "text-muted-foreground"
      )}
    >
      {length} / {max}
    </span>
  )
}

interface SelectProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly { value: string; label: string }[]
}

/** A native `<select>`: five options do not need a portal and a listbox. */
function Select({ id, label, value, onChange, options }: SelectProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="font-medium text-foreground text-sm">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-border bg-input px-3 text-foreground text-sm outline-none transition-colors focus:border-ring"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
