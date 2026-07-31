"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@webiston/ui/primitives/accordion"
import { Button } from "@webiston/ui/primitives/button"
import { Input } from "@webiston/ui/primitives/input"
import { cn } from "@webiston/ui/utils"
import { ImagePlus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef, useState } from "react"

import {
  DEFAULT_GRADIENT_COLOR,
  MAX_FRAME_LABEL_LENGTH,
  MAX_LOGO_SIZE,
  MAX_QUIET_ZONE,
  MIN_LOGO_SIZE,
  MIN_QUIET_ZONE
} from "../constants"
import type { QrStyle } from "../types"
import {
  EYE_BALL_SHAPES,
  EYE_FRAME_SHAPES,
  eyeBallPath,
  eyeFramePath
} from "../utils/eyes"
import { FRAMES } from "../utils/frames"
import { prepareLogo } from "../utils/logo"
import { STANDARD_QUIET_ZONE } from "../utils/render"
import { MODULE_SHAPES, modulePath } from "../utils/shapes"

/**
 * The styling controls.
 *
 * Every swatch is drawn by the SAME path functions that draw the code, at a
 * smaller scale. That is deliberate: a hand-drawn approximation of a shape
 * drifts from the real output the moment either changes, and the whole reason
 * to show a swatch instead of the word "classy-rounded" is that the picture is
 * the truth.
 *
 * Ordered by how often it is touched — colour, shape, frame, logo, then the
 * two settings almost nobody should change.
 */

interface StylePanelProps {
  style: QrStyle
  onChange: (patch: Partial<QrStyle>) => void
}

const SWATCH = 34

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
      {/* The native swatch IS the control — a custom picker would be another
          dependency and a worse colour wheel than the OS already ships. */}
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
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          <Trash2 aria-hidden="true" />
        </Button>
      )}
    </label>
  )
}

function SwatchButton({
  active,
  onClick,
  title,
  children
}: {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={cn(
        "flex size-12 cursor-pointer items-center justify-center rounded-lg border transition-colors",
        active
          ? "border-primary bg-primary/10"
          : "border-border hover:border-border-strong hover:bg-accent/50"
      )}
    >
      {children}
    </button>
  )
}

/** A 4x4 patch of modules, so neighbour-aware shapes show their fusing. */
const PATCH = [
  [1, 1, 0, 1],
  [1, 1, 1, 0],
  [0, 1, 1, 1],
  [1, 0, 1, 1]
]

export function StylePanel({ style, onChange }: StylePanelProps) {
  const t = useTranslations("QrGeneratorPage.style")
  const fileRef = useRef<HTMLInputElement>(null)
  const [logoError, setLogoError] = useState(false)

  // Every file is accepted and scaled down; only a file the browser cannot
  // decode as an image is refused, and that refusal is visible.
  const readLogo = async (file: File) => {
    const { dataUrl, error } = await prepareLogo(file)
    setLogoError(Boolean(error))
    if (dataUrl) onChange({ logo: dataUrl })
  }

  const unit = SWATCH / 4

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
          <>
            <ColorField
              label={t("gradientTo")}
              value={style.gradientColor}
              onChange={(gradientColor) => onChange({ gradientColor })}
              onClear={() => onChange({ gradientColor: undefined })}
            />
            <div className="flex gap-2">
              {(["linear", "radial"] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  size="sm"
                  variant={style.gradientType === type ? "default" : "outline"}
                  onClick={() => onChange({ gradientType: type })}
                >
                  {t(`gradient.${type}`)}
                </Button>
              ))}
            </div>
          </>
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
        defaultValue={["shape"]}
        className="divide-y divide-border overflow-hidden rounded-xl border border-border"
      >
        <AccordionItem value="shape" className="border-b-0">
          <AccordionTrigger className="rounded-none px-4 py-3 text-foreground text-sm transition-colors hover:bg-accent/40 hover:no-underline">
            {t("shapes")}
          </AccordionTrigger>
          <AccordionContent className="space-y-5 px-4">
            <fieldset>
              <legend className="mb-2 text-muted-foreground text-sm">
                {t("dots")}
              </legend>
              <div className="flex flex-wrap gap-2">
                {MODULE_SHAPES.map((shape) => (
                  <SwatchButton
                    key={shape}
                    title={shape}
                    active={style.dotType === shape}
                    onClick={() => onChange({ dotType: shape })}
                  >
                    <svg
                      viewBox={`0 0 ${SWATCH} ${SWATCH}`}
                      className="size-8 fill-foreground"
                      aria-hidden="true"
                    >
                      <title>{shape}</title>
                      {PATCH.flatMap((row, r) =>
                        row.map((on, c) =>
                          on ? (
                            <path
                              key={`${r}-${c}`}
                              d={modulePath(shape, {
                                x: c * unit,
                                y: r * unit,
                                size: unit,
                                neighbours: {
                                  top: Boolean(PATCH[r - 1]?.[c]),
                                  bottom: Boolean(PATCH[r + 1]?.[c]),
                                  left: Boolean(row[c - 1]),
                                  right: Boolean(row[c + 1])
                                }
                              })}
                            />
                          ) : null
                        )
                      )}
                    </svg>
                  </SwatchButton>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-muted-foreground text-sm">
                {t("cornerSquare")}
              </legend>
              <div className="flex flex-wrap gap-2">
                {EYE_FRAME_SHAPES.map((shape) => (
                  <SwatchButton
                    key={shape}
                    title={shape}
                    active={style.cornerSquareType === shape}
                    onClick={() => onChange({ cornerSquareType: shape })}
                  >
                    <svg
                      viewBox="0 0 35 35"
                      className="size-8 fill-foreground"
                      aria-hidden="true"
                    >
                      <title>{shape}</title>
                      <path
                        d={eyeFramePath(shape, { x: 0, y: 0, module: 5 })}
                        fillRule="evenodd"
                      />
                    </svg>
                  </SwatchButton>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-muted-foreground text-sm">
                {t("cornerDot")}
              </legend>
              <div className="flex flex-wrap gap-2">
                {EYE_BALL_SHAPES.map((shape) => (
                  <SwatchButton
                    key={shape}
                    title={shape}
                    active={style.cornerDotType === shape}
                    onClick={() => onChange({ cornerDotType: shape })}
                  >
                    <svg
                      viewBox="0 0 35 35"
                      className="size-8 fill-foreground"
                      aria-hidden="true"
                    >
                      <title>{shape}</title>
                      <path d={eyeBallPath(shape, { x: 0, y: 0, module: 5 })} />
                    </svg>
                  </SwatchButton>
                ))}
              </div>
            </fieldset>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="frame" className="border-b-0">
          <AccordionTrigger className="rounded-none px-4 py-3 text-foreground text-sm transition-colors hover:bg-accent/40 hover:no-underline">
            {t("frame")}
          </AccordionTrigger>
          <AccordionContent className="space-y-3 px-4">
            <div className="flex flex-wrap gap-2">
              {FRAMES.map((frame) => (
                <SwatchButton
                  key={frame.id}
                  title={frame.id}
                  active={style.frame === frame.id}
                  onClick={() => onChange({ frame: frame.id })}
                >
                  <svg
                    viewBox="0 0 32 36"
                    className="size-8"
                    aria-hidden="true"
                  >
                    <title>{frame.id}</title>
                    <rect
                      x={1}
                      y={1}
                      width={30}
                      height={frame.labelHeight ? 34 : 30}
                      rx={frame.radius * 40}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={frame.surface === "none" ? 0 : 1.5}
                      className="text-foreground"
                    />
                    <rect
                      x={7}
                      y={frame.labelPosition === "top" ? 12 : 6}
                      width={18}
                      height={18}
                      className="fill-foreground"
                      opacity={0.85}
                    />
                    {frame.labelHeight > 0 && (
                      <rect
                        x={1}
                        y={frame.labelPosition === "top" ? 1 : 27}
                        width={30}
                        height={8}
                        className="fill-foreground"
                        opacity={0.5}
                      />
                    )}
                  </svg>
                </SwatchButton>
              ))}
            </div>

            {style.frame !== "none" && (
              // `htmlFor`, not a wrapping label: `Input` is a component, so a
              // linter cannot see the control inside — and an explicit
              // association is what a screen reader wants anyway.
              <div className="text-sm">
                <label
                  htmlFor="qr-frame-label"
                  className="block text-muted-foreground"
                >
                  {t("frameLabel")}
                </label>
                <Input
                  id="qr-frame-label"
                  value={style.frameLabel}
                  onChange={(event) =>
                    onChange({ frameLabel: event.target.value })
                  }
                  maxLength={MAX_FRAME_LABEL_LENGTH}
                  className="mt-2"
                />
              </div>
            )}
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

            {logoError && (
              <p role="alert" className="text-destructive text-xs">
                {t("logoUnreadable")}
              </p>
            )}

            {style.logo && (
              <>
                <label className="block text-sm">
                  <span className="text-muted-foreground">
                    {t("logoSize", {
                      percent: Math.round(style.logoSize * 100)
                    })}
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
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t("logoNote")}
                </p>
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="advanced" className="border-b-0">
          <AccordionTrigger className="rounded-none px-4 py-3 text-foreground text-sm transition-colors hover:bg-accent/40 hover:no-underline">
            {t("advanced")}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 px-4">
            <label className="block text-sm">
              <span className="text-muted-foreground">
                {t("quietZone", { modules: style.quietZone })}
              </span>
              <input
                type="range"
                min={MIN_QUIET_ZONE}
                max={MAX_QUIET_ZONE}
                value={style.quietZone}
                onChange={(event) =>
                  onChange({ quietZone: Number(event.target.value) })
                }
                className="mt-2 w-full accent-primary"
              />
              {/* Named, not just a number: below four modules the symbol can
                  fail to be FOUND, which looks like a broken code rather than
                  a tight margin. */}
              {style.quietZone < STANDARD_QUIET_ZONE && (
                <span className="mt-1 block text-destructive text-xs">
                  {t("quietZoneWarning", { standard: STANDARD_QUIET_ZONE })}
                </span>
              )}
            </label>

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
      </Accordion>
    </div>
  )
}
