"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import { Input } from "@webiston/ui/primitives/input"
import { Download, RefreshCw, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId } from "react"

import {
  AMOUNT_PRESETS,
  BYTE_PRESETS,
  LOREM_BANKS,
  LOREM_FORMATS,
  LOREM_UNITS,
  MAX_AMOUNT,
  MAX_BYTES,
  MIN_AMOUNT
} from "../constants"
import type { LoremBank, LoremFormat, LoremUnit } from "../types"

/**
 * A toolbar, not a card — the call latin-cyrillic made and every refactored
 * tool since has followed.
 *
 * What this replaces was a 238-line "ConfigPanel" card holding the controls,
 * the actions, the copy button and the download button, with three palette
 * classes and a header of its own.
 */

interface ControlBarProps {
  unit: LoremUnit
  onUnitChange: (unit: LoremUnit) => void
  amount: number
  onAmountChange: (amount: number) => void
  bank: LoremBank
  onBankChange: (bank: LoremBank) => void
  format: LoremFormat
  onFormatChange: (format: LoremFormat) => void
  startWithLorem: boolean
  onStartWithLoremChange: (value: boolean) => void
  onGenerate: () => void
  onClear: () => void
  canExport: boolean
  onDownload: () => void
}

export function ControlBar({
  unit,
  onUnitChange,
  amount,
  onAmountChange,
  bank,
  onBankChange,
  format,
  onFormatChange,
  startWithLorem,
  onStartWithLoremChange,
  onGenerate,
  onClear,
  canExport,
  onDownload
}: ControlBarProps) {
  const t = useTranslations("LoremIpsumPage.controls")
  const amountId = useId()
  const bankId = useId()
  const loremId = useId()
  const isBytes = unit === "bytes"

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="min-w-0 overflow-x-auto">
            <SegmentedControl<LoremUnit>
              label={t("unit")}
              value={unit}
              onChange={onUnitChange}
              options={LOREM_UNITS.map((value) => ({
                value,
                label: t(`units.${value}`)
              }))}
            />
          </div>

          <div className="min-w-0 overflow-x-auto">
            <SegmentedControl<LoremFormat>
              label={t("format")}
              value={format}
              onChange={onFormatChange}
              options={LOREM_FORMATS.map((value) => ({
                value,
                label: t(`formats.${value}`)
              }))}
            />
          </div>
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canExport}
            onClick={onDownload}
          >
            <Download aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{t("download")}</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={amountId}
            className="font-medium text-foreground text-sm"
          >
            {isBytes ? t("amountBytes") : t("amount")}
          </label>
          <Input
            id={amountId}
            type="number"
            inputMode="numeric"
            min={MIN_AMOUNT}
            max={isBytes ? MAX_BYTES : MAX_AMOUNT}
            value={amount}
            onChange={(event) => onAmountChange(event.target.valueAsNumber)}
            // A focused number input answers the wheel by changing its value,
            // so scrolling the page over this field would silently rewrite the
            // request and regenerate.
            onWheel={(event) => event.currentTarget.blur()}
            className="h-8 w-24 font-mono text-sm"
          />
          {/* Bytes get their own row of presets: the sizes a field limit
              actually comes in, not 1/3/5/10. */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(isBytes ? BYTE_PRESETS : AMOUNT_PRESETS).map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={amount === preset ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2.5 font-mono text-xs tabular-nums"
                aria-pressed={amount === preset}
                onClick={() => onAmountChange(preset)}
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor={bankId}
            className="font-medium text-foreground text-sm"
          >
            {t("bank")}
          </label>
          <select
            id={bankId}
            value={bank}
            onChange={(event) => onBankChange(event.target.value as LoremBank)}
            className="h-8 rounded-lg border border-border bg-input px-2 text-foreground text-sm outline-none transition-colors focus:border-ring"
          >
            {LOREM_BANKS.map((value) => (
              <option key={value} value={value}>
                {t(`banks.${value}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Only for the classic list. `Lorem ipsum dolor sit amet` is Latin,
            and the old tool offered this toggle for all five word lists and
            then ignored it on four of them. */}
        {bank === "cicero" && (
          <div className="flex items-center gap-2">
            <input
              id={loremId}
              type="checkbox"
              checked={startWithLorem}
              onChange={(event) => onStartWithLoremChange(event.target.checked)}
              className="size-4 accent-primary"
            />
            <label htmlFor={loremId} className="text-foreground text-sm">
              {t("startWithLorem")}
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
