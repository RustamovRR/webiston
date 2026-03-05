"use client"

/**
 * Download Menu Component
 * Enhanced dropdown with chunk selection and format options
 * Supports TXT and DOCX formats (both support Unicode/Cyrillic)
 */

import { Download, FileIcon, FileText, Layers } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import type { DownloadFormat } from "../types"

interface DownloadMenuProps {
  onDownloadCurrent: (format: DownloadFormat) => void
  onDownloadAll: (format: DownloadFormat) => void
  disabled?: boolean
  isProcessing?: boolean
  hasChunks?: boolean
  selectedChunkId?: number | null
}

export function DownloadMenu({
  onDownloadCurrent,
  onDownloadAll,
  disabled = false,
  isProcessing = false,
  hasChunks = false,
  selectedChunkId
}: DownloadMenuProps) {
  const t = useTranslations("LatinCyrillicPage.downloadMenu")

  // Format menu items - reusable
  const FormatItems = ({
    onSelect
  }: {
    onSelect: (format: DownloadFormat) => void
  }) => (
    <>
      <DropdownMenuItem onClick={() => onSelect("txt")}>
        <FileText className="mr-2 h-4 w-4" />
        {t("asTxt")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onSelect("docx")}>
        <FileIcon className="mr-2 h-4 w-4" />
        {t("asDocx")}
      </DropdownMenuItem>
    </>
  )

  // Simple menu when no chunks
  if (!hasChunks) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || isProcessing}
          >
            <Download className="mr-2 h-4 w-4" />
            {isProcessing ? t("processing") : t("title")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <FormatItems onSelect={onDownloadCurrent} />
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Enhanced menu with chunk options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isProcessing}>
          <Download className="mr-2 h-4 w-4" />
          {isProcessing ? t("processing") : t("title")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Current selection submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <FileText className="h-4 w-4" />
            {selectedChunkId !== null && selectedChunkId !== undefined
              ? t("currentChunk", { number: selectedChunkId + 1 })
              : t("currentAll")}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <FormatItems onSelect={onDownloadCurrent} />
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Download all submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <Layers className="h-4 w-4" />
            {t("downloadAll")}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <FormatItems onSelect={onDownloadAll} />
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
