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
import { useRef } from "react"

import { CONVERSION_MODES, URL_SCOPES } from "../constants"
import type { ConversionMode, UrlSample, UrlScope } from "../types"

/**
 * A toolbar, not a card — the call latin-cyrillic made and the Base64
 * converter followed.
 *
 * TWO segmented controls, and the second one is the point of this refactor.
 * "Value" and "whole URL" are different standards (see `utils/urlCodec.ts`),
 * so which one is meant has to be a visible, deliberate choice rather than a
 * guess the tool makes silently. `GradientTabs` and `ShimmerButton` are gone.
 */

interface ControlBarProps {
  mode: ConversionMode
  onModeChange: (mode: ConversionMode) => void
  scope: UrlScope
  onScopeChange: (scope: UrlScope) => void
  isProcessing: boolean
  onFile: (file: File) => void
  samples: readonly UrlSample[]
  onSample: (value: string) => void
  onClear: () => void
  canDownload: boolean
  onDownload: () => void
}

export function ControlBar({
  mode,
  onModeChange,
  scope,
  onScopeChange,
  isProcessing,
  onFile,
  samples,
  onSample,
  onClear,
  canDownload,
  onDownload
}: ControlBarProps) {
  const t = useTranslations("UrlEncoderPage.ControlBar")
  const fileInput = useRef<HTMLInputElement>(null)

  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
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
        <div className="min-w-0 overflow-x-auto">
          <SegmentedControl<UrlScope>
            label={t("scope")}
            value={scope}
            onChange={onScopeChange}
            options={URL_SCOPES.map((value) => ({
              value,
              label: t(`scopes.${value}`)
            }))}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInput}
          type="file"
          accept=".txt,.json,text/plain,application/json"
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
