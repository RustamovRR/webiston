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
import { CaseUpper, ChevronDown, Download, RefreshCw, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId } from "react"

import {
  COUNT_PRESETS,
  MAX_UUID_COUNT,
  MIN_UUID_COUNT,
  UUID_FORMATS,
  UUID_VERSIONS
} from "../constants"
import type { UuidCase, UuidFormat, UuidVersion } from "../types"

/**
 * A toolbar, not a card — the call latin-cyrillic made and every refactored
 * tool since has followed.
 *
 * The two rows carry the two questions in order: what to make (version, how
 * many) and how to show it (delimiters, case). Case is its own control rather
 * than a fourth entry in the format list, because it is a different axis —
 * the old four-option control meant `compact` and uppercase could not be
 * asked for together.
 */

interface ControlBarProps {
  version: UuidVersion
  onVersionChange: (version: UuidVersion) => void
  format: UuidFormat
  onFormatChange: (format: UuidFormat) => void
  textCase: UuidCase
  onTextCaseChange: (textCase: UuidCase) => void
  count: number
  onCountChange: (count: number) => void
  onGenerate: () => void
  onClear: () => void
  canExport: boolean
  onDownload: (kind: "txt" | "json") => void
}

export function ControlBar({
  version,
  onVersionChange,
  format,
  onFormatChange,
  textCase,
  onTextCaseChange,
  count,
  onCountChange,
  onGenerate,
  onClear,
  canExport,
  onDownload
}: ControlBarProps) {
  const t = useTranslations("UuidGeneratorPage.controls")
  const countId = useId()
  const isUpper = textCase === "upper"

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="min-w-0 overflow-x-auto">
            <SegmentedControl<UuidVersion>
              label={t("version")}
              value={version}
              onChange={onVersionChange}
              options={UUID_VERSIONS.map((value) => ({
                value,
                label: t(`versions.${value}`)
              }))}
            />
          </div>

          <div className="min-w-0 overflow-x-auto">
            <SegmentedControl<UuidFormat>
              label={t("format")}
              value={format}
              onChange={onFormatChange}
              options={UUID_FORMATS.map((value) => ({
                value,
                label: t(`formats.${value}`)
              }))}
            />
          </div>

          <Button
            type="button"
            variant={isUpper ? "default" : "outline"}
            size="sm"
            aria-pressed={isUpper}
            // A `title` as well as the accessible name: this is the one
            // control here whose icon has to carry its whole meaning.
            title={t("uppercase")}
            onClick={() => onTextCaseChange(isUpper ? "lower" : "upper")}
          >
            <CaseUpper aria-hidden="true" />
            <span className="sr-only">{t("uppercase")}</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={onGenerate}>
            <RefreshCw aria-hidden="true" />
            {t("generate")}
          </Button>

          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            <X aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{t("clear")}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canExport}
              >
                <Download aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">{t("download")}</span>
                <ChevronDown aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDownload("txt")}>
                {t("downloadTxt")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload("json")}>
                {t("downloadJson")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={countId}
          className="font-medium text-foreground text-sm"
        >
          {t("count")}
        </label>
        <Input
          id={countId}
          type="number"
          inputMode="numeric"
          min={MIN_UUID_COUNT}
          max={MAX_UUID_COUNT}
          value={count}
          onChange={(event) => onCountChange(event.target.valueAsNumber)}
          // A focused number input answers the mouse wheel by changing its
          // value, so scrolling the page with the pointer over this field
          // silently rewrites the count and regenerates the batch. Dropping
          // focus on wheel is the standard fix and costs nothing else.
          onWheel={(event) => event.currentTarget.blur()}
          className="h-8 w-20 font-mono text-sm"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          {COUNT_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={count === preset ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2.5 font-mono text-xs tabular-nums"
              aria-pressed={count === preset}
              onClick={() => onCountChange(preset)}
            >
              {preset}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
