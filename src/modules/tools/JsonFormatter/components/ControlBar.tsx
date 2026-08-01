"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@webiston/ui/primitives/select"
import { Download, Eye, EyeOff, FileJson, Upload, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef } from "react"

import { INDENT_OPTIONS, type IndentOption } from "../constants"
import type { ViewMode } from "../stores/jsonDraftStore"

/**
 * The controls, as a bar rather than a card.
 *
 * The card is gone for the reason it went from the converter: a bordered box
 * around two groups that are not one thing reads as "something is missing".
 * The panels below are the cards; this is a row.
 *
 * Formatted/Minified is the shared `SegmentedControl` — the same control the
 * converter uses for its direction. It replaces a single ghost button whose
 * label was the state it would switch TO, so the tool showed "Siqilgan" while
 * displaying formatted output.
 */

interface ControlBarProps {
  indent: IndentOption
  onIndentChange: (indent: IndentOption) => void
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  showLineNumbers: boolean
  onToggleLineNumbers: () => void
  canDownload: boolean
  acceptedFileTypes: string
  onFile: (file: File) => void
  onSample: () => void
  onClear: () => void
  onDownload: () => void
}

export function ControlBar({
  indent,
  onIndentChange,
  view,
  onViewChange,
  showLineNumbers,
  onToggleLineNumbers,
  canDownload,
  acceptedFileTypes,
  onFile,
  onSample,
  onClear,
  onDownload
}: ControlBarProps) {
  const t = useTranslations("JsonFormatterPage.ControlPanel")
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={acceptedFileTypes}
          className="sr-only"
          onChange={(event) => {
            const picked = event.target.files?.[0]
            if (picked) onFile(picked)
            // Reset, or picking the same file twice fires no change event.
            event.target.value = ""
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
        >
          <Upload aria-hidden="true" />
          {t("fileUpload")}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onSample}>
          <FileJson aria-hidden="true" />
          {t("sampleJson")}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          <X aria-hidden="true" />
          {t("clear")}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl<ViewMode>
          label={t("viewMode")}
          value={view}
          onChange={onViewChange}
          options={[
            { value: "formatted", label: t("formatted") },
            { value: "tree", label: t("tree") },
            { value: "minified", label: t("minified") }
          ]}
        />

        <div className="flex items-center gap-2">
          <label
            htmlFor="json-indentation"
            className="text-muted-foreground text-sm"
          >
            {t("indentation")}
          </label>
          <Select
            value={indent}
            onValueChange={(value) => onIndentChange(value as IndentOption)}
          >
            <SelectTrigger id="json-indentation" className="w-[4.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDENT_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "\t" ? t("tab") : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleLineNumbers}
          aria-pressed={showLineNumbers}
        >
          {showLineNumbers ? (
            <EyeOff aria-hidden="true" />
          ) : (
            <Eye aria-hidden="true" />
          )}
          {/* `sr-only`, not `hidden`: below `sm` this button is icon-only, and
              `hidden` takes the label out of the accessibility tree too —
              leaving a button with no name at all. Same fix the converter's
              mobile toolbar got. */}
          <span className="sr-only sm:not-sr-only">{t("lineNumbers")}</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onDownload}
          disabled={!canDownload}
        >
          <Download aria-hidden="true" />
          {t("download")}
        </Button>
      </div>
    </div>
  )
}
