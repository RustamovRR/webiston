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

import { MODE_PREFERENCES, URL_SCOPES } from "../constants"
import type {
  ConversionMode,
  ModePreference,
  UrlSample,
  UrlScope
} from "../types"

/**
 * A toolbar, not a card — the call latin-cyrillic made and the Base64
 * converter followed.
 *
 * The direction control defaults to **Avto** and the bar says what that
 * resolved to. The first rebuild made both the direction and the encoding
 * standard mandatory up-front choices — four combinations, one of which
 * returns the input unchanged — and the result was a tool nobody could tell
 * was working. The distinction is real; making the visitor settle it before
 * seeing an answer was the mistake.
 *
 * The scope control appears **only while encoding**, because that is the only
 * direction where the two standards give different answers worth choosing
 * between. `GradientTabs` and `ShimmerButton` are gone.
 */

interface ControlBarProps {
  preference: ModePreference
  onPreferenceChange: (preference: ModePreference) => void
  /** What `auto` resolved to. Shown so the guess is never hidden. */
  mode: ConversionMode
  scope: UrlScope
  onScopeChange: (scope: UrlScope) => void
  /** Empty until there is something to resolve. */
  resolvedHint?: string
  isProcessing: boolean
  onFile: (file: File) => void
  samples: readonly UrlSample[]
  onSample: (value: string) => void
  onClear: () => void
  canDownload: boolean
  onDownload: () => void
}

export function ControlBar({
  preference,
  onPreferenceChange,
  mode,
  scope,
  onScopeChange,
  resolvedHint,
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
          <SegmentedControl<ModePreference>
            label={t("direction")}
            value={preference}
            onChange={onPreferenceChange}
            options={MODE_PREFERENCES.map((value) => ({
              value,
              label: t(value)
            }))}
          />
        </div>

        {/* Only while encoding: decoding has one sensible answer, and offering
            a second as an equal choice was half of what made this confusing. */}
        {mode === "encode" && (
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
        )}

        {resolvedHint && (
          <p className="text-muted-foreground text-xs">{resolvedHint}</p>
        )}
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
