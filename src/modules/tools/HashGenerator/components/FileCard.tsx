"use client"

import { Button } from "@webiston/ui/primitives/button"
import { FileDigit, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { formatFileSize } from "@/lib/utils"

import type { FileSource } from "../types"

/**
 * What a loaded file looks like in the source panel.
 *
 * It is a card rather than the file's text in a textarea because the file's
 * text is not what gets hashed — its bytes are. The old tool put the decoded
 * text in the box and hashed that, which is why its "file hash" disagreed with
 * `sha256sum` for anything holding a BOM, CRLF endings or a non-UTF-8 byte.
 * Showing an editable copy of something that is not the input would be the
 * same lie in a nicer shape.
 */

interface FileCardProps {
  file: FileSource
  onRemove: () => void
}

export function FileCard({ file, onRemove }: FileCardProps) {
  const t = useTranslations("HashGeneratorPage.file")

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-muted/40 p-5 text-center">
        <FileDigit
          size={32}
          className="mx-auto text-muted-foreground"
          aria-hidden="true"
        />
        <p className="mt-3 break-all font-medium text-foreground text-sm">
          {file.name}
        </p>
        <p className="mt-1 text-muted-foreground text-xs tabular-nums">
          {formatFileSize(file.size)}
        </p>
        <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
          {t("hashingBytes")}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRemove}
        >
          <X aria-hidden="true" />
          {t("remove")}
        </Button>
      </div>
    </div>
  )
}
