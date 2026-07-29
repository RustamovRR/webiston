import { Check, Copy, Heart, History, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import React from "react"
import { TerminalInput } from "@/components/shared/TerminalInput"
import { Button } from "@/components/ui/button"
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

interface ColorHistoryProps {
  onColorSelect: (color: string) => void
  currentColor: string
}

const ColorHistory: React.FC<ColorHistoryProps> = ({
  onColorSelect,
  currentColor
}) => {
  const t = useTranslations("ColorConverterPage.ColorHistory")
  const [history, setHistory] = React.useState<ColorHistoryItem[]>([])
  const [favorites, setFavorites] = React.useState<ColorFavorite[]>([])
  const [copiedColor, setCopiedColor] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<"history" | "favorites">(
    "history"
  )

  // Load data on mount
  React.useEffect(() => {
    setHistory(getColorHistory())
    setFavorites(getColorFavorites())
  }, [])

  // Refresh data when current color changes
  React.useEffect(() => {
    setHistory(getColorHistory())
    setFavorites(getColorFavorites())
  }, [])

  const copyToClipboard = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color)
      setCopiedColor(color)
      setTimeout(() => setCopiedColor(null), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  const handleAddToFavorites = (hex: string, name?: string) => {
    const favoriteName = name || `Color ${hex}`
    addToColorFavorites(hex, favoriteName)
    setFavorites(getColorFavorites())
  }

  const handleRemoveFromFavorites = (hex: string) => {
    removeFromColorFavorites(hex)
    setFavorites(getColorFavorites())
  }

  const handleClearHistory = () => {
    clearColorHistory()
    setHistory([])
  }

  const handleClearFavorites = () => {
    clearColorFavorites()
    setFavorites([])
  }

  const renderColorItem = (
    hex: string,
    name?: string,
    showFavoriteButton = true
  ) => {
    const isFavorite = isColorFavorite(hex)

    return (
      <div
        key={hex}
        className="group relative cursor-pointer transition-all duration-200 hover:scale-105"
      >
        {/* Color square */}
        <button
          type="button"
          className="focus-visible:ring-ring aspect-square w-full rounded-lg border-2 border-border shadow-sm transition-all duration-200 group-hover:border-zinc-400 group-hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none dark:group-hover:border-zinc-500"
          style={{ backgroundColor: hex }}
          aria-label={`${name || hex} - select`}
          onClick={() => onColorSelect(hex)}
        />

        {/* Action buttons overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {/* Copy button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              copyToClipboard(hex)
            }}
            className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white shadow-lg transition-all hover:bg-black/80"
            title="Copy color"
          >
            {copiedColor === hex ? <Check size={12} /> : <Copy size={12} />}
          </button>

          {/* Favorite button */}
          {showFavoriteButton && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (isFavorite) {
                  handleRemoveFromFavorites(hex)
                } else {
                  handleAddToFavorites(hex, name)
                }
              }}
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium shadow-lg transition-all ${
                isFavorite
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-black/70 text-white hover:bg-black/80"
              }`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={12} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        {/* Color info */}
        <div className="mt-2 text-center">
          <div className="font-mono text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {hex}
          </div>
          {name && (
            <div className="truncate text-xs text-muted-foreground">{name}</div>
          )}
        </div>
      </div>
    )
  }

  const customContent = (
    <div className="p-4">
      {/* Tab buttons */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "bg-info text-info"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <History size={16} />
          {t("history") || "Tarix"} ({history.length})
        </button>

        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "favorites"
              ? "bg-destructive text-destructive"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Heart size={16} />
          {t("favorites") || "Sevimlilar"} ({favorites.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "history" ? (
        <div className="space-y-4">
          {/* Clear button */}
          {history.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                className="text-destructive hover:text-red-700"
              >
                <Trash2 size={14} className="mr-2" />
                {t("clearHistory") || "Tarixni tozalash"}
              </Button>
            </div>
          )}

          {/* History grid */}
          {history.length > 0 ? (
            <div className="grid grid-cols-6 gap-3 md:grid-cols-8 lg:grid-cols-10">
              {history.map((item) => renderColorItem(item.hex, item.name))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <div className="text-center">
                <History size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("noHistory") || "Hali tarix yo'q"}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Clear button */}
          {favorites.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFavorites}
                className="text-destructive hover:text-red-700"
              >
                <Trash2 size={14} className="mr-2" />
                {t("clearFavorites") || "Sevimlilarni tozalash"}
              </Button>
            </div>
          )}

          {/* Favorites grid */}
          {favorites.length > 0 ? (
            <div className="grid grid-cols-6 gap-3 md:grid-cols-8 lg:grid-cols-10">
              {favorites.map((item) =>
                renderColorItem(item.hex, item.name, false)
              )}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Heart size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {t("noFavorites") || "Hali sevimli ranglar yo'q"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <TerminalInput
      title={t("title") || "Rang Tarixi va Sevimlilar"}
      customContent={customContent}
      variant="default"
      showShadow={true}
      animate={true}
      minHeight="300px"
    />
  )
}

export default ColorHistory
