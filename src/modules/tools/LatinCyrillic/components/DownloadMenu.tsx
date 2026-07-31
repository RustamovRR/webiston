"use client"

/**
 * Download the result as TXT or DOCX.
 *
 * Two items, one level. The previous version had two nested submenus —
 * "current chunk" and "download all", each with its own format pair — which
 * existed only because of chunking. Chunking is gone, and with it the submenu
 * tree, the `_partN` filenames that all collided, and the "download all" path
 * that silently wrote a single chunk.
 */

import { Button } from "@webiston/ui/primitives/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@webiston/ui/primitives/dropdown-menu"
import { Download, FileText, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import type { DownloadFormat } from "../types"

interface DownloadMenuProps {
  onDownload: (format: DownloadFormat) => void
  disabled?: boolean
  isBusy?: boolean
}

export function DownloadMenu({
  onDownload,
  disabled = false,
  isBusy = false
}: DownloadMenuProps) {
  const t = useTranslations("LatinCyrillicPage.download")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* The label is hidden on phones, not removed: three labelled buttons
            wrapped the toolbar onto a second row, and on a 375px screen every
            row above the input is a row the result gets pushed below. The
            accessible name is unaffected — it comes from the text either way.

            No margin on the label. `Button` already sets `gap-1.5` at this
            size, so an `ml-2` on top of it read as a gap-and-a-half between the
            icon and its own word. `sr-only` is absolutely positioned, so the
            gap collapses on its own when the label is hidden. */}
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isBusy}
          aria-label={t("label")}
        >
          {isBusy ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Download aria-hidden="true" />
          )}
          <span className="max-sm:sr-only">
            {isBusy ? t("preparing") : t("label")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onDownload("txt")}>
          <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("asTxt")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDownload("docx")}>
          <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("asDocx")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
