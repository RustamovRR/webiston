"use client"

import { SearchIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useRef, useState } from "react"
import { searchEngine } from "@/lib/search/flexsearch"
import type { ISearchHit } from "@/types/common"
import SearchDialog from "./SearchDialog"

export default function Search() {
  const t = useTranslations("Search")
  const [open, setOpen] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [groupedHits, setGroupedHits] = useState<ISearchHit[][]>([])
  // Resolved after mount, never during render: `navigator` does not exist on the
  // server, and branching on it in the render body would make the server and
  // client markup disagree. `false` is the safe first paint — the shortcut
  // handler below accepts Ctrl *and* Cmd, so the badge is only ever cosmetically
  // behind, and the badge reserves width for both labels.
  const [isMac, setIsMac] = useState(false)

  const handleSearchChange = (value: string) => {
    setQuery(value)

    clearTimeout(debounceTimer.current)

    if (!value.trim()) {
      setLoading(false)
      setGroupedHits([])
      return
    }

    setLoading(true)
    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await searchEngine.search(value)
        setGroupedHits(results)
      } catch (error) {
        console.error("Search failed:", error)
        setGroupedHits([])
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce delay
  }

  const clearSearch = useCallback(() => {
    setQuery("")
    setGroupedHits([])
  }, [])

  useEffect(() => {
    // `userAgentData.platform` is the non-deprecated source; `navigator.platform`
    // is the fallback still needed for Safari and Firefox.
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } })
        .userAgentData?.platform ?? navigator.platform
    setIsMac(/mac|iphone|ipad|ipod/i.test(platform))
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (!open) {
      clearSearch()
    }
  }, [open, clearSearch])

  // Build the index when the dialog OPENS, not when the page mounts.
  //
  // `public/search-index.json` is 1.07 MB. Loading it on mount meant every
  // visitor on every route downloaded and indexed it, including the ~all of them
  // who never search. Opening the dialog gives us the time before the first
  // keystroke, and `searchEngine.search()` initialises on demand anyway, so a
  // fast typist is still correct — just briefly slower.
  //
  // This stays as the fallback for ⌘K users who never touch the button; the
  // real work usually starts earlier, on hover/focus (see `warmSearch`).
  useEffect(() => {
    if (open) searchEngine.initialize().catch(console.error)
  }, [open])

  // Prefetch on INTENT. Indexing ~1000 documents is a long task, and starting
  // it at the moment the dialog begins animating in is what produced the
  // visible flicker on first open. Hover/focus buys us a few hundred
  // milliseconds; `initialize()` is single-flight, so calling it twice is free.
  const warmSearch = () => searchEngine.warm()

  return (
    <>
      {/* A button, not a div+onClick. This control opens a dialog, so it needs
          to be reachable and activatable by keyboard — a div gives no focus, no
          Enter/Space, and no role. The previous markup also nested a readOnly
          <Input> here, which put a focusable field in the tab order that did
          nothing when focused; a span carries the same look with none of that. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        onPointerEnter={warmSearch}
        onFocus={warmSearch}
        aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
        className="focus-visible:ring-ring flex h-9 w-56 cursor-pointer items-center gap-2 rounded-xl bg-muted px-3 text-left focus-visible:ring-2 focus-visible:outline-none"
      >
        <SearchIcon
          aria-hidden="true"
          className="text-muted-foreground size-4 shrink-0"
        />
        {/* `truncate` + `min-w-0` is what keeps the label from sliding under the
            badge. The previous markup positioned the icon and the kbd
            `absolute` and left this label the only element in flow, so it had
            nothing to push against and no width to be constrained by — at the
            149px the header actually gives this button, "Qidirish..." overlapped
            the badge by a measured 25px. Everything is in flow now. */}
        <span className="min-w-0 flex-1 truncate text-muted-foreground text-base md:text-sm">
          {t("placeholder")}
        </span>
        {/* Reserve the width both labels can occupy so the post-mount platform
            swap below cannot shift the header. "Control" is never rendered —
            `Ctrl` is the wider of the two real labels, `⌘K` the narrower. */}
        <kbd className="grid shrink-0 min-w-[3.25rem] place-items-center rounded-md border border-border-strong px-1.5 py-0.5 font-sans text-[11px] text-muted-foreground select-none">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
      <SearchDialog
        open={open}
        onOpenChange={setOpen}
        query={query}
        hits={groupedHits}
        loading={loading}
        onSearch={handleSearchChange}
        onClearSearch={clearSearch}
      />
    </>
  )
}
