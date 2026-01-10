"use client"

/**
 * Chunk Selector Component
 * Horizontal scrollable list for selecting text chunks
 */

import { Check, Download, FileText } from "lucide-react"
import { useTranslations } from "next-intl"
import { ShimmerButton } from "@/components/ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib"

import type { DownloadFormat, TextChunk } from "../types"

interface ChunkSelectorProps {
  chunks: TextChunk[]
  selectedChunkId: number | null
  onSelectChunk: (chunkId: number | null) => void
  onDownloadAll: (format: DownloadFormat) => void
  isProcessing: boolean
}

export function ChunkSelector({
  chunks,
  selectedChunkId,
  onSelectChunk,
  onDownloadAll,
  isProcessing
}: ChunkSelectorProps) {
  const t = useTranslations("LatinCyrillicPage.chunks")

  if (chunks.length <= 1) return null

  // Format character count
  const formatCharCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <div className="mb-4 rounded-lg border bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("title")} ({chunks.length})
          </span>
        </div>

        {/* Download all button */}
        <ShimmerButton
          size="sm"
          variant="outline"
          onClick={() => onDownloadAll("docx")}
          disabled={isProcessing}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          {t("downloadAll")}
        </ShimmerButton>
      </div>

      {/* Chunk buttons - horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {/* All chunks button */}
        <Button
          variant={selectedChunkId === null ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectChunk(null)}
          className={cn(
            "shrink-0 gap-1.5",
            selectedChunkId === null &&
              "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          )}
        >
          {selectedChunkId === null && <Check className="h-3.5 w-3.5" />}
          {t("all")}
          <span className="text-xs opacity-70">
            ({formatCharCount(chunks.reduce((sum, c) => sum + c.charCount, 0))})
          </span>
        </Button>

        {/* Individual chunk buttons */}
        {chunks.map((chunk) => (
          <Button
            key={chunk.id}
            variant={selectedChunkId === chunk.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectChunk(chunk.id)}
            className={cn(
              "shrink-0 gap-1.5",
              selectedChunkId === chunk.id &&
                "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            )}
          >
            {selectedChunkId === chunk.id && <Check className="h-3.5 w-3.5" />}
            {t("chunk", { number: chunk.id + 1 })}
            <span className="text-xs opacity-70">
              ({formatCharCount(chunk.charCount)})
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
