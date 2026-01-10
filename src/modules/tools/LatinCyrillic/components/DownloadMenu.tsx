"use client"

/**
 * Download Menu Component
 * Dropdown menu for downloading in different formats
 */

import { Download, FileIcon, FileText } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface DownloadMenuProps {
  onDownloadTxt: () => void
  onDownloadDocx: () => void
  disabled?: boolean
  isProcessing?: boolean
}

export function DownloadMenu({
  onDownloadTxt,
  onDownloadDocx,
  disabled = false,
  isProcessing = false
}: DownloadMenuProps) {
  const t = useTranslations("LatinCyrillicPage.downloadMenu")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isProcessing}>
          <Download className="mr-2 h-4 w-4" />
          {isProcessing ? t("processing") : t("title")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onDownloadTxt}>
          <FileText className="mr-2 h-4 w-4" />
          {t("asTxt")} (.txt)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownloadDocx}>
          <FileIcon className="mr-2 h-4 w-4" />
          {t("asDocx")} (.docx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
