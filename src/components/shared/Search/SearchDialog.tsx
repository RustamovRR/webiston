"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import type { CSSProperties } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { useMobileMenuStore } from "@/stores"
import type { ISearchHit } from "@/types"
import { CustomSearchBox, GroupedHit, NoResults } from "./SearchComponents"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  query: string
  hits: ISearchHit[][]
  loading: boolean
  onSearch: (value: string) => void
  onClearSearch: () => void
}

export default function SearchDialog({
  open,
  onOpenChange,
  query,
  hits,
  loading,
  onSearch,
  onClearSearch
}: SearchDialogProps) {
  const t = useTranslations("Search")
  const _router = useRouter()
  const closeMobileMenu = useMobileMenuStore((state) => state.close)

  const handleHitClick = (_path: string) => {
    onOpenChange(false) // Close the search dialog
    onClearSearch()
    closeMobileMenu() // Close the mobile menu
  }

  const hasResults = hits.length > 0
  const showInitialState = !loading && !hasResults && !query
  const showNoResults = !loading && !hasResults && query
  const showLoading = loading && !hasResults

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* framer-motion removed from this dialog. Radix already animates the
          content in (via tw-animate-css), and an `AnimatePresence` fade+slide
          on the inner state ran ON TOP of it — two entrance animations over the
          same pixels, which is the other half of the flicker the owner saw. The
          states now swap with no animation of their own; the dialog's single
          entrance is the only motion. */}
      <DialogContent className="flex h-[460px] max-h-[85vh] flex-col gap-0 overflow-hidden border-border-strong p-0 sm:max-w-[620px]">
        <DialogHeader className="border-border border-b px-4 py-3">
          <DialogTitle className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.15em]">
            <span className="size-[5px] rounded-[1.5px] bg-primary" />
            <span className="text-foreground">{t("title")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pt-4 pb-1">
          <CustomSearchBox value={query} onChange={onSearch} />
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-2">
          {showLoading && (
            <div className="flex h-full items-center justify-center gap-2.5 font-mono text-muted-foreground text-xs">
              {/* Three dots on the grid-rise stagger — a real progress signal
                  while the 1.07 MB index finishes building, where before there
                  was only static text. */}
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="search-dot size-1.5 rounded-full bg-primary"
                    style={{ "--i": i } as CSSProperties}
                  />
                ))}
              </span>
              {t("loading")}
            </div>
          )}

          {showNoResults && <NoResults query={query} />}

          {showInitialState && (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              {/* Was `FileSearch` at 40% opacity — muddy and shapeless. Now the
                  ⌘K glyph itself in the brand chip: it names the thing the user
                  just used, and teaches the shortcut. */}
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/12 font-mono text-primary text-sm">
                ⌘K
              </span>
              <p className="mt-3.5 max-w-xs text-muted-foreground text-sm">
                {t("initialHint")}
              </p>
            </div>
          )}

          {hasResults &&
            hits.map((groupedHits, index) => (
              <GroupedHit
                key={groupedHits[0]?.objectID || index}
                hits={groupedHits}
                onHitClick={handleHitClick}
              />
            ))}
        </div>

        {/* Keyboard legend, matching the hero palette's footer. */}
        <div className="border-border border-t px-4 py-2.5 font-mono text-[10px] text-muted-foreground">
          {t("hints")}
        </div>
      </DialogContent>
    </Dialog>
  )
}
