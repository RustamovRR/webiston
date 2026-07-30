"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import {
  AUDIENCE_FILTERS,
  FILTER_OPTIONS,
  TOOL_CATEGORIES,
  TOOLS_LIST,
  type Tool
} from "@/constants"
import { Link } from "@/i18n/navigation"

const ToolsMainPage = () => {
  const tMain = useTranslations("ToolsPage.Main")
  const tTools = useTranslations("Tools")
  const tCategories = useTranslations("ToolCategories")
  const tFilters = useTranslations("Filters")

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAudience, setSelectedAudience] = useState("all")
  const hasAnimated = useRef(false)

  useEffect(() => {
    hasAnimated.current = true
  }, [])

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
        return title.includes(query) || description.includes(query)
      })
    }

    return tools
  }, [searchQuery, selectedCategory, selectedAudience, allTools, tTools])

  const getCategoryLabel = (category: string) => {
    return tCategories(`${category}.title`)
  }

  // Token pairs, not blue/green palette classes: developer reads in the brand
  // accent, general in the neutral chip — both scheme-proof with no dark:.
  const getAudienceColor = (audience: string) =>
    audience === "developer"
      ? "bg-primary/12 text-primary"
      : "bg-muted text-muted-foreground"

  // The homepage card language verbatim: border-strong boundary, depth
  // gradient, PLAIN `transition` (Tailwind v4's `-translate-y-*` is the
  // `translate` property — a hand-written transform-only list leaves the lift
  // untransitioned), mono category meta, brand-tinted icon chip.
  const ToolCard = ({ tool }: { tool: Tool }) => (
    <Link
      href={tool.href}
      className="group flex h-full flex-col rounded-lg border border-border-strong bg-gradient-to-b from-card to-card/60 p-4 transition duration-300 ease-out hover:-translate-y-1 hover:border-input hover:from-accent hover:to-accent/70 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="flex items-start justify-between">
        <span className="flex size-10 items-center justify-center rounded-md bg-primary/12 text-primary">
          <tool.icon className="size-5" />
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] ${getAudienceColor(tool.audience)}`}
        >
          {tool.audience === "developer"
            ? tMain("audienceDeveloper")
            : tMain("audienceGeneral")}
        </span>
      </div>
      <h3 className="mt-3 font-semibold text-base text-foreground leading-snug">
        {tTools(`${tool.tKey}.title`)}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-pretty text-muted-foreground text-sm leading-relaxed">
        {tTools(`${tool.tKey}.description`)}
      </p>
      <span className="mt-3 font-mono text-[11px] text-muted-foreground">
        {getCategoryLabel(tool.category)}
      </span>
    </Link>
  )

  return (
    <motion.div
      className="mx-auto w-full max-w-7xl px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="mb-8 flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        {/* Same identity system as the homepage dividers: accent pixel +
            mono label + count. Replaces a pulsing blue Sparkles icon and the
            AuroraText gradient — both off-token, neither ours. */}
        <div className="mb-4 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em]">
          <span className="size-[5px] rounded-[1.5px] bg-primary" />
          <span className="text-foreground">/tools</span>
          <span className="text-muted-foreground">· {TOOLS_LIST.length}</span>
        </div>
        <h1 className="text-center font-bold text-4xl text-foreground tracking-[-0.03em]">
          {tMain("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-muted-foreground">
          {tMain("description")}
        </p>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h3 className="mb-3 text-center font-medium text-muted-foreground text-sm">
          {tMain("filterByCategory")}
        </h3>
        {/* Chip row with live counts (the reference's tools page idea). The
            selected chip is brand-tinted, not a gradient — GradientTabs was the
            old language and the only gradient control on the page. */}
        <div className="flex flex-wrap justify-center gap-2">
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
                onClick={() => setSelectedCategory(option.value)}
                className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition duration-300 ease-out ${
                  active
                    ? "border-primary/40 bg-primary/12 text-primary"
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
      </motion.div>

      {/* Audience Filters */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <h3 className="mb-3 text-center font-medium text-muted-foreground text-sm">
          {tMain("filterByAudience")}
        </h3>
        <div className="flex justify-center gap-2">
          {AUDIENCE_FILTERS.map((filter) => {
            const active = selectedAudience === filter.value
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedAudience(filter.value)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition duration-300 ease-out ${
                  active
                    ? "border-primary/40 bg-primary/12 text-primary"
                    : "border-border-strong bg-card/60 text-muted-foreground hover:border-input hover:bg-accent hover:text-foreground"
                }`}
              >
                {tFilters(filter.value)}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="relative mx-auto max-w-md">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={tMain("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border-strong bg-card/60 pl-10 transition-colors duration-300 focus-visible:border-input"
          />
        </div>
      </motion.div>

      {/* Results count */}
      <motion.div
        className="mb-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <p className="font-mono text-muted-foreground text-xs">
          {tMain("resultsFound", { count: filteredTools.length })}
        </p>
      </motion.div>

      {/* Tools Grid */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {filteredTools.length === 0 ? (
          <motion.div
            className="py-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-lg text-muted-foreground">
              {tMain("noResults")}
            </p>
            <p className="mt-2 text-muted-foreground/70 text-sm">
              {tMain("noResultsHint")}
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="popLayout">
              {filteredTools.map((tool, index) => (
                <motion.div
                  key={tool.href}
                  layout
                  initial={
                    hasAnimated.current
                      ? false
                      : { opacity: 0, y: 20, scale: 0.95 }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: hasAnimated.current ? 0.2 : 0.4,
                      delay: hasAnimated.current ? 0 : index * 0.1,
                      ease: "easeOut"
                    }
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.2 }
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Statistics */}
      {!searchQuery &&
        selectedCategory === "all" &&
        selectedAudience === "all" && (
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <div className="font-bold text-3xl text-foreground tabular-nums">
                  {TOOL_CATEGORIES.reduce(
                    (acc, cat) => acc + cat.tools.length,
                    0
                  )}
                </div>
                <div className="text-muted-foreground text-sm">
                  {tMain("totalTools")}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <div className="font-bold text-3xl text-foreground tabular-nums">
                  {TOOL_CATEGORIES.length}
                </div>
                <div className="text-muted-foreground text-sm">
                  {tMain("categories")}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
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
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
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
              </motion.div>
            </div>
          </motion.div>
        )}
    </motion.div>
  )
}

export default ToolsMainPage
