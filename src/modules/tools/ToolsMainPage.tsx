"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { type CSSProperties, useEffect, useMemo, useRef } from "react"
import { Input } from "@/components/ui/input"
import {
  AUDIENCE_FILTERS,
  CATEGORY_ACCENT_NEUTRAL,
  CATEGORY_ACCENTS,
  FILTER_OPTIONS,
  TOOL_CATEGORIES,
  TOOLS_LIST,
  type Tool
} from "@/constants"
import { Link } from "@/i18n/navigation"

import { useRouteEntrance, useToolsFilterStore } from "./toolsPageState"

/**
 * The tools directory.
 *
 * Laid out the way a directory earns its keep: the CONTENT above the fold.
 * The previous composition stacked a centred header, two filter groups that
 * each carried their own heading ("Kategoriya bo'yicha filtrlash",
 * "Foydalanuvchi turi"), a centred search and a standalone results-count row —
 * measured, the first card started ~940px down, so a visitor arriving at "the
 * tools page" saw everything except tools. Directories that do this well
 * (a marketplace, an integrations page) spend ONE toolbar row on controls:
 * search left, filters beside it, and the grid immediately after.
 *
 * The headings are gone because the controls say what they are; the audience
 * toggle is the suite's shared `SegmentedControl` — the same control every
 * tool page uses for its modes — instead of a third species of pill.
 */
const ToolsMainPage = () => {
  const tMain = useTranslations("ToolsPage.Main")
  const tTools = useTranslations("Tools")
  const tCategories = useTranslations("ToolCategories")
  const tFilters = useTranslations("Filters")

  // Above the tree: a locale switch remounts this page, and losing the
  // visitor's query and filters to a language toggle is the same defect the
  // tools themselves had. See `toolsPageState.ts`.
  const searchQuery = useToolsFilterStore((s) => s.searchQuery)
  const selectedCategory = useToolsFilterStore((s) => s.category)
  const selectedAudience = useToolsFilterStore((s) => s.audience)
  const setSearchQuery = useToolsFilterStore((s) => s.setSearchQuery)
  const setSelectedCategory = useToolsFilterStore((s) => s.setCategory)
  const setSelectedAudience = useToolsFilterStore((s) => s.setAudience)

  // Play the entrance on arrival, not on every re-render of the same route.
  const animate = useRouteEntrance()
  const rise = animate ? "rise" : ""

  /**
   * The grid answers FILTERING with its stagger even when the page entrance
   * has already been spent. Gating both on `useRouteEntrance` alone meant a
   * revisit got instant card swaps — the owner felt it. A ref, not state: the
   * click that flips it re-renders anyway, and the flag must survive renders
   * without causing one.
   */
  const hasInteracted = useRef(false)
  const gridRise = animate || hasInteracted.current ? "grid-rise" : ""

  const markInteraction = () => {
    hasInteracted.current = true
  }

  const allTools = useMemo(() => TOOLS_LIST, [])

  const filteredTools = useMemo(() => {
    let tools = allTools

    // Filter by category
    if (selectedCategory !== "all") {
      tools = tools.filter((tool) => tool.category === selectedCategory)
    }

    // Filter by audience
    if (selectedAudience !== "all") {
      tools = tools.filter((tool) => tool.audience === selectedAudience)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      tools = tools.filter((tool) => {
        const title = tTools(`${tool.tKey}.title`).toLowerCase()
        const description = tTools(`${tool.tKey}.description`).toLowerCase()
        // The SLUG counts too. Uzbek titles say "Yaratuvchi", not
        // "generator", so a visitor typing the word that is in the URL and in
        // every developer's head got **0 results** for "generator" — measured
        // on the real list. The href carries the English name for free.
        return (
          title.includes(query) ||
          description.includes(query) ||
          tool.href.toLowerCase().includes(query)
        )
      })
    }

    return tools
  }, [searchQuery, selectedCategory, selectedAudience, allTools, tTools])

  const isFiltered =
    searchQuery.trim().length > 0 ||
    selectedCategory !== "all" ||
    selectedAudience !== "all"

  /**
   * Filters live in the URL as well as in the store, so a filtered view
   * survives a refresh and can be SENT to someone — the thing a filter state
   * trapped in component memory can never do.
   *
   * `history.replaceState`, not `router.replace`: the params are a mirror of
   * client state, and asking the router to navigate for every keystroke in
   * the search box would schedule work nobody asked for. Hydration runs once,
   * in an effect — reading `location` during render would differ between
   * server and client and tear the hydration.
   */
  const hydratedFromUrl = useRef(false)
  useEffect(() => {
    if (hydratedFromUrl.current) return
    hydratedFromUrl.current = true

    const params = new URLSearchParams(window.location.search)
    const q = params.get("q")
    const cat = params.get("cat")
    const aud = params.get("aud")

    if (q) setSearchQuery(q)
    // Unknown values fall through to the defaults instead of rendering an
    // empty grid off a mistyped shared link.
    if (cat && FILTER_OPTIONS.some((option) => option.value === cat)) {
      setSelectedCategory(cat)
    }
    if (aud && AUDIENCE_FILTERS.some((filter) => filter.value === aud)) {
      setSelectedAudience(aud)
    }
  }, [setSearchQuery, setSelectedCategory, setSelectedAudience])

  useEffect(() => {
    if (!hydratedFromUrl.current) return

    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    if (selectedCategory !== "all") params.set("cat", selectedCategory)
    if (selectedAudience !== "all") params.set("aud", selectedAudience)

    const query = params.toString()
    const next = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname
    // Defaults mean a CLEAN url — nobody should share ?cat=all.
    window.history.replaceState(null, "", next)
  }, [searchQuery, selectedCategory, selectedAudience])

  const getCategoryLabel = (category: string) => {
    return tCategories(`${category}.title`)
  }

  // Colour by CATEGORY, from the `--chart-*` tokens. Restores the visual
  // variety the previous design had via 17 ad-hoc per-tool Tailwind classes,
  // but makes it MEAN something: the icon chip and the active filter chip share
  // a hue, so category is readable without reading the label.
  const accentFor = (category: string) =>
    CATEGORY_ACCENTS[category] ?? CATEGORY_ACCENT_NEUTRAL

  // The homepage card language verbatim: border-strong boundary, depth
  // gradient, PLAIN `transition` (Tailwind v4's `-translate-y-*` is the
  // `translate` property — a hand-written transform-only list leaves the lift
  // untransitioned), mono meta line, category-tinted icon chip.
  //
  // ONE meta line, not a badge plus a label: the audience pill that used to
  // sit top-right said "Umumiy" on ten of seventeen cards — a corner spent on
  // the least differentiating fact on the page. Category and audience now
  // share the mono footer, and the corner stays quiet.
  // Icon and title share ONE row. The stacked version spent a full row on a
  // 40px icon and measured ~230px per card; inline, the same information fits
  // ~150px, which is one more row of tools on every screen — density from
  // layout, not from shrinking the text.
  const ToolCard = ({ tool }: { tool: Tool }) => (
    <Link
      href={tool.href}
      className="group flex h-full flex-col rounded-lg border border-border-strong bg-gradient-to-b from-card to-card/60 p-4 transition duration-300 ease-out hover:-translate-y-1 hover:border-input hover:from-accent hover:to-accent/70 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span className="flex items-center gap-3">
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-md ${accentFor(tool.category).icon}`}
        >
          <tool.icon className="size-4" />
        </span>
        <h3 className="min-w-0 truncate font-semibold text-[15px] text-foreground leading-snug">
          {tTools(`${tool.tKey}.title`)}
        </h3>
      </span>
      <p className="mt-2.5 line-clamp-2 flex-1 text-pretty text-muted-foreground text-sm leading-relaxed">
        {tTools(`${tool.tKey}.description`)}
      </p>
      <span className="mt-3 font-mono text-[11px] text-muted-foreground">
        {getCategoryLabel(tool.category)} ·{" "}
        {tool.audience === "developer"
          ? tMain("audienceDeveloper")
          : tMain("audienceGeneral")}
      </span>
    </Link>
  )

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 sm:px-6 lg:px-8">
      {/* Left-aligned, like every tool page and the hero itself — a centred
          block was the one place the site's left gutter line broke. */}
      <div className={`${rise} mb-8`} style={{ "--i": 0 } as CSSProperties}>
        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="size-[5px] rounded-[1.5px] bg-primary" />
          <span className="text-foreground">/tools</span>
          <span className="text-muted-foreground">· {TOOLS_LIST.length}</span>
        </div>
        <h1 className="mt-3 font-bold text-3xl text-foreground tracking-[-0.03em] sm:text-4xl">
          {tMain("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {tMain("description")}
        </p>
      </div>

      {/* THE toolbar: search · category chips · audience switch. One row on
          desktop, stacking naturally below `lg`. Everything the two labelled
          sections plus the centred search used ~500px of column for. */}
      <div
        className={`${rise} mb-6 flex flex-col gap-3 lg:flex-row lg:items-center`}
        style={{ "--i": 1 } as CSSProperties}
      >
        <div className="relative w-full shrink-0 sm:w-80 lg:w-72">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={tMain("searchPlaceholder")}
            aria-label={tMain("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => {
              markInteraction()
              setSearchQuery(e.target.value)
            }}
            className="border-border-strong bg-card/60 pl-9 transition-colors duration-300 focus-visible:border-input"
          />
        </div>

        <div
          role="group"
          aria-label={tMain("filterByCategory")}
          className="flex flex-wrap items-center gap-2"
        >
          {FILTER_OPTIONS.map((option) => {
            const count =
              option.value === "all"
                ? TOOLS_LIST.length
                : TOOLS_LIST.filter((tool) => tool.category === option.value)
                    .length
            const active = selectedCategory === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  markInteraction()
                  setSelectedCategory(option.value)
                }}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition duration-300 ease-out ${
                  active
                    ? accentFor(option.value).chip
                    : "border-border-strong bg-card/60 text-muted-foreground hover:border-input hover:bg-accent hover:text-foreground"
                }`}
              >
                <option.icon className="size-4" />
                {tFilters(option.value === "all" ? "allTools" : option.value)}
                <span className="font-mono text-[10px] opacity-70">
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* The suite's own mode switch, not a third pill species. */}
        <div className="lg:ml-auto">
          <SegmentedControl<string>
            label={tMain("filterByAudience")}
            value={selectedAudience}
            onChange={(audience) => {
              markInteraction()
              setSelectedAudience(audience)
            }}
            options={AUDIENCE_FILTERS.map((filter) => ({
              value: filter.value,
              label: tFilters(filter.value)
            }))}
          />
        </div>
      </div>

      {/* The count SPEAKS ONLY WHEN NARROWED. At rest it duplicated the "17"
          already printed in the all-tools chip and sat glued under the search
          box — the owner flagged exactly that. `sr-only` at rest rather than
          unmounted: the element stays in the accessibility tree, so aria-live
          still announces every filter change to a screen reader. */}
      <p
        aria-live="polite"
        className={
          isFiltered
            ? "mb-4 font-mono text-muted-foreground text-xs"
            : "sr-only"
        }
      >
        {tMain("resultsFound", { count: filteredTools.length })}
      </p>

      {/* Tools Grid */}
      <div className="space-y-8">
        {filteredTools.length === 0 ? (
          <div className={`${rise} py-12 text-center`}>
            <p className="text-lg text-muted-foreground">
              {tMain("noResults")}
            </p>
            <p className="mt-2 text-muted-foreground/70 text-sm">
              {tMain("noResultsHint")}
            </p>
          </div>
        ) : (
          // The `key` folds the active filters in, so React remounts the grid
          // on every filter change and the CSS entrance replays — a staggered
          // fade-up in, nothing animating out. No exit animation is the point:
          // an exit tween on items that are being replaced in the same frame is
          // what read as a flicker.
          <div
            key={`${selectedCategory}-${selectedAudience}-${searchQuery}`}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredTools.map((tool, index) => (
              <div
                key={tool.href}
                className={gridRise}
                style={{ "--i": index } as CSSProperties}
              >
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      {!searchQuery &&
        selectedCategory === "all" &&
        selectedAudience === "all" && (
          <div className="mt-16 text-center">
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
              <div className="reveal">
                <div className="font-bold text-3xl text-foreground tabular-nums">
                  {TOOL_CATEGORIES.reduce(
                    (acc, cat) => acc + cat.tools.length,
                    0
                  )}
                </div>
                <div className="text-muted-foreground text-sm">
                  {tMain("totalTools")}
                </div>
              </div>
              <div className="reveal">
                <div className="font-bold text-3xl text-foreground tabular-nums">
                  {TOOL_CATEGORIES.length}
                </div>
                <div className="text-muted-foreground text-sm">
                  {tMain("categories")}
                </div>
              </div>
              <div className="reveal">
                <div className="font-bold text-3xl text-foreground tabular-nums">
                  {
                    TOOL_CATEGORIES.flatMap((cat) => cat.tools).filter(
                      (tool) => tool.audience === "general"
                    ).length
                  }
                </div>
                <div className="text-muted-foreground text-sm">
                  {tMain("generalTools")}
                </div>
              </div>
              <div className="reveal">
                <div className="font-bold text-3xl text-foreground tabular-nums">
                  {
                    TOOL_CATEGORIES.flatMap((cat) => cat.tools).filter(
                      (tool) => tool.audience === "developer"
                    ).length
                  }
                </div>
                <div className="text-muted-foreground text-sm">
                  {tMain("developerTools")}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default ToolsMainPage
