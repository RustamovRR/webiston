"use client"

/**
 * Drop a file anywhere on the tool.
 *
 * The drag handlers already existed — they were wired only to a modal, so the
 * only way to give the tool a file was to open a dialog first, pick the file,
 * and wait 800 ms for the dialog to close itself. Dropping onto the page is
 * how file input has worked everywhere else for a decade.
 *
 * The counter is not incidental: `dragleave` fires every time the pointer
 * crosses into a CHILD element, so a boolean flickers the overlay off and on
 * as the cursor moves across the panels. Counting enter/leave pairs is the
 * standard fix.
 */

import { Upload } from "lucide-react"
import { useTranslations } from "next-intl"
import { type ReactNode, useRef, useState } from "react"

interface DropZoneProps {
  onFile: (file: File) => void
  children: ReactNode
}

export function DropZone({ onFile, children }: DropZoneProps) {
  const t = useTranslations("LatinCyrillicPage.file")
  const [isOver, setIsOver] = useState(false)
  const depth = useRef(0)

  const reset = () => {
    depth.current = 0
    setIsOver(false)
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the drop target is
    // the whole page; the keyboard path is the file button in the panel header
    <div
      className="relative"
      onDragEnter={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return
        depth.current += 1
        setIsOver(true)
      }}
      onDragOver={(event) => {
        // Without preventDefault the browser navigates to the dropped file.
        if (event.dataTransfer.types.includes("Files")) event.preventDefault()
      }}
      onDragLeave={() => {
        depth.current -= 1
        if (depth.current <= 0) reset()
      }}
      onDrop={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return
        event.preventDefault()
        reset()
        const file = event.dataTransfer.files[0]
        if (file) onFile(file)
      }}
    >
      {children}

      {isOver && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl border-2 border-primary border-dashed bg-background/85 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <Upload className="h-8 w-8 text-primary" />
            <p className="font-medium text-base text-foreground">
              {t("dropHere")}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              {t("accepts")}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
