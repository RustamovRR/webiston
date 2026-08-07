"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Heart, History, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"

import {
  addToColorFavorites,
  type ColorFavorite,
  type ColorHistoryItem,
  clearColorFavorites,
  clearColorHistory,
  getColorFavorites,
  getColorHistory,
  removeFromColorFavorites
} from "@/lib/utils"

import { CopySwatch } from "./CopySwatch"

/**
 * The colours this visitor has worked with — the one deliberately PERSISTED
 * piece of this tool (a palette is a project that spans visits; the live draft
 * is not).
 *
 * The heart state is derived from React state, never read from localStorage
 * during render. It used to call `isColorFavorite()` — a `getItem` plus a
 * `JSON.parse` — four times per swatch inside the JSX. With the React Compiler
 * on, that memoised: measured, un-favouriting a colour removed it from storage
 * while the icon kept reporting `aria-pressed="true"`, because the cached
 * element had no dependency that changed. Reading mutable globals in render is
 * the defect; the read count was only the symptom.
 */

interface ColorHistoryProps {
  onColorSelect: (color: string) => void
  /** Bumped by the hook on every history write — the refresh signal. */
  historyVersion: number
}

type Tab = "history" | "favorites"

export function ColorHistory({
  onColorSelect,
  historyVersion
}: ColorHistoryProps) {
  const t = useTranslations("ColorConverterPage.ColorHistory")
  const [history, setHistory] = useState<ColorHistoryItem[]>([])
  const [favorites, setFavorites] = useState<ColorFavorite[]>([])
  const [tab, setTab] = useState<Tab>("history")

  // `historyVersion` is the refresh SIGNAL: the hook bumps it on every history
  // write and this effect re-reads storage exactly then. It is deliberately
  // not referenced in the body. (The suppression must be ONE comment line —
  // Biome ignores a `biome-ignore` that has other comments between it and the
  // diagnostic, which is why the three-line version had no effect.)
  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh signal, not a value read here
  useEffect(() => {
    setHistory(getColorHistory())
    setFavorites(getColorFavorites())
  }, [historyVersion])

  const favoriteHexes = useMemo(
    () => new Set(favorites.map((item) => item.hex.toLowerCase())),
    [favorites]
  )

  /**
   * The set the hearts are DRAWN from decides the write, rather than a second
   * `localStorage` read asking the same question. Two sources of truth for one
   * fact is what the docblock above describes going wrong; re-reading storage
   * here only avoided it because this runs in an event and not in render.
   */
  const toggleFavorite = (hex: string, name?: string) => {
    if (favoriteHexes.has(hex.toLowerCase())) removeFromColorFavorites(hex)
    else addToColorFavorites(hex, name || hex)
    setFavorites(getColorFavorites())
  }

  const items = tab === "history" ? history : favorites

  const clearAll = () => {
    if (tab === "history") {
      clearColorHistory()
      setHistory([])
    } else {
      clearColorFavorites()
      setFavorites([])
    }
  }

  return (
    // A workbench panel now, not a card: the ToolCard wrapper moved up to
    // the Workbench, which owns one card for all four views.
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={tab === "history" ? "default" : "outline"}
            aria-pressed={tab === "history"}
            onClick={() => setTab("history")}
          >
            <History aria-hidden="true" />
            {t("history")} · {history.length}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tab === "favorites" ? "default" : "outline"}
            aria-pressed={tab === "favorites"}
            onClick={() => setTab("favorites")}
          >
            <Heart aria-hidden="true" />
            {t("favorites")} · {favorites.length}
          </Button>
        </div>
        {items.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={clearAll}
          >
            <Trash2 aria-hidden="true" />
            {tab === "history" ? t("clearHistory") : t("clearFavorites")}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-28 flex-col items-center justify-center text-center text-muted-foreground">
          {tab === "history" ? (
            <History size={28} className="opacity-40" aria-hidden="true" />
          ) : (
            <Heart size={28} className="opacity-40" aria-hidden="true" />
          )}
          <p className="mt-2 text-sm">
            {tab === "history" ? t("noHistory") : t("noFavorites")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-3">
          {items.map((item) => {
            const isFavorite = favoriteHexes.has(item.hex.toLowerCase())
            return (
              <div key={item.hex} className="group/item relative">
                <CopySwatch
                  color={item.hex}
                  onSelect={() => onColorSelect(item.hex)}
                  swatchClassName="aspect-square"
                  caption={
                    <span className="mt-1 block truncate font-mono text-[10px] text-muted-foreground">
                      {item.hex}
                    </span>
                  }
                />
                <button
                  type="button"
                  onClick={() => toggleFavorite(item.hex, item.name)}
                  aria-label={
                    isFavorite ? t("removeFavorite") : t("addFavorite")
                  }
                  aria-pressed={isFavorite}
                  className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-background/85 text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover/item:opacity-100 aria-pressed:opacity-100"
                >
                  <Heart
                    size={11}
                    aria-hidden="true"
                    fill={isFavorite ? "currentColor" : "none"}
                    className={isFavorite ? "text-destructive" : undefined}
                  />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
