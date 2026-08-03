"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@webiston/ui/primitives/dropdown-menu"
import { Input } from "@webiston/ui/primitives/input"
import { ChevronDown, Download, Upload, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef } from "react"

import { OUTPUT_FORMATS } from "../constants"
import type { DigestFormat, HashSample } from "../types"

/**
 * A toolbar, not a card — the call latin-cyrillic made and every refactored
 * tool since has followed.
 *
 * Gone from what this replaces: the gradient tab strip, two shimmer buttons
 * forcing a hardcoded white background with an important flag and a separate
 * dark-mode override, and the algorithm checkboxes. The checkboxes were the
 * source of a real bug — see the hook — and bought nothing: all five digests
 * are computed anyway.
 */

type HashMode = "hash" | "hmac"

interface ControlBarProps {
  hmacEnabled: boolean
  onHmacEnabledChange: (enabled: boolean) => void
  hmacKey: string
  onHmacKeyChange: (key: string) => void
  format: DigestFormat
  onFormatChange: (format: DigestFormat) => void
  isBusy: boolean
  onFile: (file: File) => void
  samples: readonly HashSample[]
  onSample: (value: string) => void
  onClear: () => void
  canDownload: boolean
  onDownload: () => void
}

export function ControlBar({
  hmacEnabled,
  onHmacEnabledChange,
  hmacKey,
  onHmacKeyChange,
  format,
  onFormatChange,
  isBusy,
  onFile,
  samples,
  onSample,
  onClear,
  canDownload,
  onDownload
}: ControlBarProps) {
  const t = useTranslations("HashGeneratorPage.controls")
  const fileInput = useRef<HTMLInputElement>(null)

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="min-w-0 overflow-x-auto">
            <SegmentedControl<HashMode>
              label={t("mode")}
              value={hmacEnabled ? "hmac" : "hash"}
              onChange={(mode) => onHmacEnabledChange(mode === "hmac")}
              options={[
                { value: "hash", label: t("modes.hash") },
                { value: "hmac", label: t("modes.hmac") }
              ]}
            />
          </div>

          <div className="min-w-0 overflow-x-auto">
            <SegmentedControl<DigestFormat>
              label={t("format")}
              value={format}
              onChange={onFormatChange}
              options={OUTPUT_FORMATS.map((value) => ({
                value,
                label: t(`formats.${value}`)
              }))}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInput}
            type="file"
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
            disabled={isBusy}
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
            disabled={!canDownload || isBusy}
            onClick={onDownload}
          >
            <Download aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{t("download")}</span>
          </Button>
        </div>
      </div>

      {/* Only in HMAC mode: a key field with nothing to key is furniture. */}
      {hmacEnabled && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="hmac-key"
            className="font-medium text-foreground text-sm"
          >
            {t("hmacKey")}
          </label>
          <Input
            id="hmac-key"
            type="text"
            value={hmacKey}
            onChange={(event) => onHmacKeyChange(event.target.value)}
            placeholder={t("hmacKeyPlaceholder")}
            className="font-mono"
            autoComplete="off"
            spellCheck={false}
          />
          <p className="text-muted-foreground text-xs">{t("hmacKeyHint")}</p>
        </div>
      )}
    </div>
  )
}
