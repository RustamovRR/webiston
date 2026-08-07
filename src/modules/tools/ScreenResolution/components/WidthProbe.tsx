"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Input } from "@webiston/ui/primitives/input"
import { RotateCcw, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useState } from "react"

import { MAX_PROBE_WIDTH, MIN_PROBE_WIDTH } from "../constants"
import type { Preview } from "../types"
import { parseProbeWidth } from "../utils/metrics"

/**
 * Ask about a width that is not the one you are sitting at.
 *
 * This is the feature the paid extensions are built around — Viewport Resizer
 * and Responsive Viewport Resizer both charge for "snap to a breakpoint" and
 * "jump to a device size" — and it is the one thing a page-based tool can give
 * away for free, because the question ("what happens at 768?") never actually
 * required resizing anything. Typing a width answers the breakpoint, the
 * device match and the media query without you dragging your window to 360px
 * and losing the devtools panel you were reading.
 *
 * The rotate button matters more than it looks: half of responsive bugs live
 * in landscape, and checking landscape by physically rotating a laptop is not
 * an option.
 */

interface WidthProbeProps {
  preview: Preview | null
  onPreview: (preview: Preview | null) => void
  /** Height used when the visitor types a width but names no device. */
  fallbackHeight: number
}

export function WidthProbe({
  preview,
  onPreview,
  fallbackHeight
}: WidthProbeProps) {
  const t = useTranslations("ScreenResolutionPage.probe")
  const inputId = useId()
  const [draft, setDraft] = useState("")

  const parsed = parseProbeWidth(draft)
  const isInvalid = draft.trim() !== "" && parsed === null

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (parsed === null) return
    onPreview({ width: parsed, height: fallbackHeight })
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card px-5 py-4"
    >
      <div className="min-w-0">
        <label
          htmlFor={inputId}
          className="block text-muted-foreground text-xs"
        >
          {t("label")}
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <Input
            id={inputId}
            inputMode="numeric"
            className="w-32 font-mono tabular-nums"
            placeholder={t("placeholder")}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? `${inputId}-error` : undefined}
          />
          <Button type="submit" size="sm" disabled={parsed === null}>
            {t("apply")}
          </Button>
        </div>
      </div>

      {preview ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-foreground text-sm tabular-nums">
            {preview.width} × {preview.height}
            {preview.source ? (
              <span className="ml-2 text-muted-foreground">
                {preview.source}
              </span>
            ) : null}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onPreview({
                width: preview.height,
                height: preview.width,
                source: preview.source
              })
            }
          >
            <RotateCcw aria-hidden="true" />
            {t("rotate")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onPreview(null)
              setDraft("")
            }}
          >
            <X aria-hidden="true" />
            {t("clear")}
          </Button>
        </div>
      ) : null}

      {isInvalid ? (
        <p
          id={`${inputId}-error`}
          className="w-full text-destructive text-xs"
          role="alert"
        >
          {t("outOfRange", { min: MIN_PROBE_WIDTH, max: MAX_PROBE_WIDTH })}
        </p>
      ) : null}
    </form>
  )
}
