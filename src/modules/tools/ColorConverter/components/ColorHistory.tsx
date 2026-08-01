"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Heart, History, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import {
  addToColorFavorites,
  type ColorFavorite,
  type ColorHistoryItem,
  clearColorFavorites,
  clearColorHistory,
  getColorFavorites,
  getColorHistory,
  isColorFavorite,
  removeFromColorFavorites
} from "@/lib/utils"

import { CopySwatch } from "./CopySwatch"

/**
 * The colours this visitor has worked with — the one deliberately PERSISTED
 * piece of this tool (a palette is a project that spans visits; the live
 * draft is not).
 *
 * The old version read localStorage on mount only, so a colour chosen five
 * seconds ago never appeared until reload. It refreshes on every change of
 * the current colour now.
 */

interface ColorHistoryProps {
  onColorSelect: (color: string) => void
  /** Bumped by the hook on every history write — the refresh signal. */
  historyVersion: number
}

export function ColorHistory({
  onColorSelect,
  historyVersion
}: ColorHistoryProps) {
  const t = useTranslations("ColorConverterPage.ColorHistory")
  const [history, setHistory] = useState<ColorHistoryItem[]>([])
  const [favorites, setFavorites] = useState<ColorFavorite[]>([])
  const [tab, setTab] = useState<"history" | "favorites">("history")

  // biome-ignore lint/correctness/useExhaustiveDependencies: historyVersion is
  // the refresh SIGNAL — it is bumped by the hook on every history write, and
  // this effect re-reads storage exactly then. It is not referenced inside.
  useEffect(() => {
    setHistory(getColorHistory())
    setFavorites(getColorFavorites())
  }, [historyVersion])

  const toggleFavorite = (hex: string, name?: string) => {
    if (isColorFavorite(hex)) removeFromColorFavorites(hex)
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
    <section className="mt-6 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-border border-b px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-[6px] shrink-0 rounded-[2px] bg-border-strong"
          />
          <h2 className="font-medium text-base text-foreground">
            {t("title")}
          </h2>
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

      <div className="space-y-4 p-5">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={tab === "history" ? "default" : "outline"}
            onClick={() => setTab("history")}
          >
            <History aria-hidden="true" />
            {t("history")} · {history.length}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tab === "favorites" ? "default" : "outline"}
            onClick={() => setTab("favorites")}
          >
            <Heart aria-hidden="true" />
            {t("favorites")} · {favorites.length}
          </Button>
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
          <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 lg:grid-cols-12">
            {items.map((item) => (
              <div key={item.hex} className="relative">
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
                    isColorFavorite(item.hex)
                      ? t("removeFavorite")
                      : t("addFavorite")
                  }
                  aria-pressed={isColorFavorite(item.hex)}
                  className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-background/85 text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100 [div:hover>&]:opacity-100"
                >
                  <Heart
                    size={11}
                    fill={isColorFavorite(item.hex) ? "currentColor" : "none"}
                    className={
                      isColorFavorite(item.hex) ? "text-destructive" : undefined
                    }
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
