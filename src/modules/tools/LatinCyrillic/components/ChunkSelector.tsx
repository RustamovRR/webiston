"use client"

/**
 * Chunk Selector Component
 * Horizontal scrollable list for selecting text chunks
 * Uses CSS transitions for smooth, performant animations
 */

import { FileText } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib"

import type { TextChunk } from "../types"

interface ChunkSelectorProps {
  chunks: TextChunk[]
  selectedChunkId: number | null
  onSelectChunk: (chunkId: number | null) => void
}

// Format character count
function formatCharCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

// Individual chunk button with CSS-based selection animation
function ChunkButton({
  isSelected,
  onClick,
  label,
  charCount
}: {
  isSelected: boolean
  onClick: () => void
  label: string
  charCount: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        isSelected
          ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md"
          : [
              // Light mode
              "border border-zinc-200 bg-white text-zinc-700 shadow-sm",
              "hover:border-zinc-300 hover:bg-zinc-50",
              // Dark mode
              "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
              "dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            ]
      )}
    >
      <span className="flex items-center gap-1.5">
        {label}
        <span
          className={cn("text-xs", isSelected ? "opacity-80" : "opacity-60")}
        >
          ({formatCharCount(charCount)})
        </span>
      </span>
    </button>
  )
}

export function ChunkSelector({
  chunks,
  selectedChunkId,
  onSelectChunk
}: ChunkSelectorProps) {
  const t = useTranslations("LatinCyrillicPage.chunks")

  if (chunks.length <= 1) return null

  const totalCharCount = chunks.reduce((sum, c) => sum + c.charCount, 0)

  return (
    <nav
      aria-label={t("title")}
      className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-zinc-500" aria-hidden="true" />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("title")} ({chunks.length})
        </span>
      </div>

      {/* Chunk buttons - horizontal scroll */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label={t("title")}
      >
        {/* All chunks button */}
        <ChunkButton
          isSelected={selectedChunkId === null}
          onClick={() => onSelectChunk(null)}
          label={t("all")}
          charCount={totalCharCount}
        />

        {/* Individual chunk buttons */}
        {chunks.map((chunk) => (
          <ChunkButton
            key={chunk.id}
            isSelected={selectedChunkId === chunk.id}
            onClick={() => onSelectChunk(chunk.id)}
            label={t("chunk", { number: chunk.id + 1 })}
            charCount={chunk.charCount}
          />
        ))}
      </div>
    </nav>
  )
}
