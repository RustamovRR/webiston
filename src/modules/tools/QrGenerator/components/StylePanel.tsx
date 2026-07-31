"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@webiston/ui/primitives/accordion"
import { Button } from "@webiston/ui/primitives/button"
import { cn } from "@webiston/ui/utils"
import { ImagePlus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef, useState } from "react"

import {
  CORNER_DOT_TYPES,
  CORNER_SQUARE_TYPES,
  DEFAULT_GRADIENT_COLOR,
  DOT_TYPES,
  MAX_LOGO_SIZE,
  MIN_LOGO_SIZE
} from "../constants"
import type { QrStyle } from "../types"
import { prepareLogo } from "../utils/logo"

/**
 * The styling controls — all of which now do something.
 *
 * The panel this replaces offered corner styles, pattern styles and a border
 * radius, none of which reached the renderer: the code came from an image
 * endpoint that accepts neither. It also ran to 1,012 lines across two files,
 * one wrapping the other, for a single collapsible section.
 *
 * Ordered by how often it is touched: colour, then shape, then the logo. The
 * two rarely-used groups start collapsed, so the panel opens at the size of
 * the decision most people came to make.
 */

interface StylePanelProps {
  style: QrStyle
  onChange: (patch: Partial<QrStyle>) => void
}

function ColorField({
  label,
  value,
  onChange,
  onClear
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onClear?: () => void
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      {/* The native swatch IS the control — a custom picker here would be a
          third-party dependency and a worse colour wheel than the OS ships. */}
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="size-9 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
        aria-label={label}
      />
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="font-mono text-muted-foreground text-xs uppercase">
        {value}
      </span>
      {onClear && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          aria-label={label}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      )}
    </label>
  )
}

function ShapeRow<T extends string>({
  label,
  options,
  value,
  onSelect,
  renderPreview
}: {
  label: string
  options: readonly T[]
  value: T
  onSelect: (value: T) => void
  renderPreview: (option: T, active: boolean) => React.ReactNode
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-muted-foreground text-sm">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option === value
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              aria-pressed={active}
              // The label IS the shape. A row of words ("classy-rounded")
              // makes the reader imagine the result; a row of swatches shows
              // it, which is the whole reason this control exists.
              className={cn(
                "flex size-11 cursor-pointer items-center justify-center rounded-lg border transition-colors",
                active
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-border-strong hover:bg-accent/50"
              )}
              title={option}
            >
              {renderPreview(option, active)}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function StylePanel({ style, onChange }: StylePanelProps) {
  const t = useTranslations("QrGeneratorPage.style")
  const fileRef = useRef<HTMLInputElement>(null)
  const [logoError, setLogoError] = useState(false)

  // Every file is accepted and scaled down; only a file the browser cannot
  // decode as an image is refused, and that refusal is now visible.
  const readLogo = async (file: File) => {
    const { dataUrl, error } = await prepareLogo(file)
    setLogoError(Boolean(error))
    if (dataUrl) onChange({ logo: dataUrl })
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <ColorField
          label={t("foreground")}
          value={style.foregroundColor}
          onChange={(foregroundColor) => onChange({ foregroundColor })}
        />
        <ColorField
          label={t("background")}
          value={style.backgroundColor}
          onChange={(backgroundColor) => onChange({ backgroundColor })}
        />
        {style.gradientColor ? (
          <ColorField
            label={t("gradientTo")}
            value={style.gradientColor}
            onChange={(gradientColor) => onChange({ gradientColor })}
            onClear={() => onChange({ gradientColor: undefined })}
          />
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({ gradientColor: DEFAULT_GRADIENT_COLOR })}
          >
            {t("addGradient")}
          </Button>
        )}
      </div>

      <Accordion
        type="multiple"
        className="divide-y divide-border overflow-hidden rounded-xl border border-border"
      >
        <AccordionItem value="shape" className="border-b-0">
          <AccordionTrigger className="rounded-none px-4 py-3 text-foreground text-sm transition-colors hover:bg-accent/40 hover:no-underline">
            {t("shapes")}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 px-4">
            <ShapeRow
              label={t("dots")}
              options={DOT_TYPES}
              value={style.dotType}
              onSelect={(dotType) => onChange({ dotType })}
              renderPreview={(option) => (
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-6 grid-cols-3 gap-px",
                    "[&>i]:bg-foreground"
                  )}
                >
                  {Array.from({ length: 9 }, (_, index) => (
                    <i
                      key={index}
                      className={cn(
                        "block",
                        option === "dots" && "rounded-full",
                        option === "rounded" && "rounded-[1px]",
                        option === "extra-rounded" && "rounded-[2px]",
                        option.startsWith("classy") && "rounded-tl-[3px]"
                      )}
                    />
                  ))}
                </span>
              )}
            />
            <ShapeRow
              label={t("cornerSquare")}
              options={CORNER_SQUARE_TYPES}
              value={style.cornerSquareType}
              onSelect={(cornerSquareType) => onChange({ cornerSquareType })}
              renderPreview={(option) => (
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-6 border-[3px] border-foreground",
                    option === "extra-rounded" && "rounded-md",
                    option === "dot" && "rounded-full"
                  )}
                />
              )}
            />
            <ShapeRow
              label={t("cornerDot")}
              options={CORNER_DOT_TYPES}
              value={style.cornerDotType}
              onSelect={(cornerDotType) => onChange({ cornerDotType })}
              renderPreview={(option) => (
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-3 bg-foreground",
                    option === "dot" && "rounded-full"
                  )}
                />
              )}
            />

            {/* Rounds the code's own outer edge. It clips the quiet zone, not
                the modules, so it costs nothing in readability — the scanner
                needs the light border, not ninety-degree corners. */}
            <label className="block text-sm">
              <span className="text-muted-foreground">
                {t("cornerRadius", {
                  percent: Math.round(style.backgroundRound * 100)
                })}
              </span>
              <input
                type="range"
                min={0}
                max={40}
                value={style.backgroundRound * 100}
                onChange={(event) =>
                  onChange({
                    backgroundRound: Number(event.target.value) / 100
                  })
                }
                className="mt-2 w-full accent-primary"
              />
            </label>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="logo" className="border-b-0">
          <AccordionTrigger className="rounded-none px-4 py-3 text-foreground text-sm transition-colors hover:bg-accent/40 hover:no-underline">
            {t("logo")}
          </AccordionTrigger>
          <AccordionContent className="space-y-3 px-4">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="sr-only"
              onChange={(event) => {
                const picked = event.target.files?.[0]
                if (picked) void readLogo(picked)
                event.target.value = ""
              }}
            />

            {logoError && (
              <p role="alert" className="text-destructive text-xs">
                {t("logoUnreadable")}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <ImagePlus aria-hidden="true" />
                {t("uploadLogo")}
              </Button>
              {style.logo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onChange({ logo: undefined })}
                >
                  <Trash2 aria-hidden="true" />
                  {t("removeLogo")}
                </Button>
              )}
            </div>

            {style.logo && (
              <label className="block text-sm">
                <span className="text-muted-foreground">
                  {t("logoSize", { percent: Math.round(style.logoSize * 100) })}
                </span>
                <input
                  type="range"
                  min={MIN_LOGO_SIZE * 100}
                  max={MAX_LOGO_SIZE * 100}
                  value={style.logoSize * 100}
                  onChange={(event) =>
                    onChange({ logoSize: Number(event.target.value) / 100 })
                  }
                  className="mt-2 w-full accent-primary"
                />
              </label>
            )}

            {/* Not a nag: a logo covers modules, so the tool silently raises
                error correction to H. Saying so is the difference between a
                setting that looks ignored and one that is understood. */}
            {style.logo && (
              <p className="text-muted-foreground text-xs leading-relaxed">
                {t("logoNote")}
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
