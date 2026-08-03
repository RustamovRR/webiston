"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@webiston/ui/primitives/dropdown-menu"
import { ChevronDown, Download, Upload, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useRef } from "react"

import { CONVERSION_MODES } from "../constants"
import type { Base64Sample, ConversionMode } from "../types"

/**
 * A toolbar, not a card — the same call latin-cyrillic made, for the same
 * reason: a bordered box around a direction switch and a set of file actions
 * puts a card around two things that are not one thing, and the panels below
 * are then the second level of nesting.
 *
 * `GradientTabs` and `ShimmerButton` are gone. The tabs were the jumping-
 * highlight control already replaced across the suite by `SegmentedControl`
 * (one indicator that slides, real radio semantics, keyboard support), and the
 * shimmer was chrome on a download button. The old wiring also ignored the
 * clicked VALUE and called a toggle instead — correct only while there are
 * exactly two options.
 */

interface ControlBarProps {
  mode: ConversionMode
  onModeChange: (mode: ConversionMode) => void
  urlSafe: boolean
  onUrlSafeChange: (urlSafe: boolean) => void
  isProcessing: boolean
  acceptedFileTypes: string
  onFile: (file: File) => void
  samples: readonly Base64Sample[]
  onSample: (value: string) => void
  onClear: () => void
  canDownload: boolean
  onDownload: () => void
}

export function ControlBar({
  mode,
  onModeChange,
  urlSafe,
  onUrlSafeChange,
  isProcessing,
  acceptedFileTypes,
  onFile,
  samples,
  onSample,
  onClear,
  canDownload,
  onDownload
}: ControlBarProps) {
  const t = useTranslations("Base64ConverterPage.ControlBar")
  const fileInput = useRef<HTMLInputElement>(null)
  // The file input used a hardcoded `id="file-upload"`, so two of these on one
  // page would have pointed the second label at the first input.
  const urlSafeId = useId()

  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-4">
        <div className="min-w-0 overflow-x-auto">
          <SegmentedControl<ConversionMode>
            label={t("direction")}
            value={mode}
            onChange={onModeChange}
            options={CONVERSION_MODES.map((value) => ({
              value,
              label: t(value)
            }))}
          />
        </div>

        {/* Only meaningful when producing base64; decoding accepts both
            alphabets unconditionally, so offering the switch there would be
            a control that changes nothing. */}
        {mode === "encode" && (
          <label
            htmlFor={urlSafeId}
            className="flex cursor-pointer items-center gap-2 text-muted-foreground text-sm"
          >
            <input
              id={urlSafeId}
              type="checkbox"
              checked={urlSafe}
              onChange={(event) => onUrlSafeChange(event.target.checked)}
              className="size-4 accent-primary"
            />
            {t("urlSafe")}
          </label>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInput}
          type="file"
          accept={acceptedFileTypes}
          className="sr-only"
          onChange={(event) => {
            const picked = event.target.files?.[0]
            if (picked) onFile(picked)
            // Reset, so choosing the SAME file twice fires `change` again.
            event.target.value = ""
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isProcessing}
          onClick={() => fileInput.current?.click()}
        >
          <Upload aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{t("upload")}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              {t("sample")}
              <ChevronDown aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {samples.map((sample) => (
              <DropdownMenuItem
                key={sample.key}
                onClick={() => onSample(sample.value)}
              >
                {sample.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          <X aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{t("clear")}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canDownload || isProcessing}
          onClick={onDownload}
        >
          <Download aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{t("download")}</span>
        </Button>
      </div>
    </div>
  )
}
