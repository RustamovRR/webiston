"use client"

import { cn } from "@webiston/ui/utils"
import { ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

/**
 * The document as a collapsible tree.
 *
 * This is the view a formatter earns its keep with: a 400-line API response is
 * not read top to bottom, it is navigated — fold the noise, open the branch
 * you came for. The flat views cannot do that, which is why every serious
 * JSON tool ships a tree and ours did not.
 *
 * Values are coloured by TYPE, from the `--chart-*` tokens — the documented
 * exception to token-only colour (syntax colouring is data visualisation, and
 * these five are the palette the design system already reserves for exactly
 * that). Both schemes come free: the tokens flip themselves in dark mode.
 */

/** Value-type → colour class. One place, so the tree and the legend agree. */
const TYPE_CLASS = {
  key: "text-chart-4",
  string: "text-chart-2",
  number: "text-chart-1",
  boolean: "text-chart-3",
  null: "text-chart-5"
} as const

/**
 * Branches at or deeper than this start life folded, so a huge document
 * arrives as an overview instead of a wall. Shallow files open fully.
 */
const OPEN_DEPTH = 3

/**
 * A branch with more children than this starts folded REGARDLESS of depth,
 * and its children arrive in slices. Depth alone was not a guard: a 5,000-item
 * array at depth 2 opened everything — measured, the view switch took 3.95 s
 * and put 180,000 nodes in the DOM. Chrome's devtools fold exactly this way.
 */
const AUTO_FOLD_CHILDREN = 50

/** How many children one "show more" click reveals on a large branch. */
const CHUNK = 100

function Primitive({ value }: { value: unknown }) {
  if (value === null) {
    return <span className={TYPE_CLASS.null}>null</span>
  }
  if (typeof value === "string") {
    // `JSON.stringify`, not hand-wrapped quotes: a value containing `"` or a
    // newline must display in its escaped JSON form, exactly as the formatted
    // view prints it — the tree is a VIEW of the document, not a paraphrase.
    return <span className={TYPE_CLASS.string}>{JSON.stringify(value)}</span>
  }
  if (typeof value === "boolean") {
    return <span className={TYPE_CLASS.boolean}>{String(value)}</span>
  }
  return <span className={TYPE_CLASS.number}>{String(value)}</span>
}

interface BranchProps {
  /** The property name or array index this node sits under. */
  name?: string
  value: unknown
  depth: number
}

function Node({ name, value, depth }: BranchProps) {
  const t = useTranslations("JsonFormatterPage.Tree")
  const isArray = Array.isArray(value)
  const isObject = !isArray && value !== null && typeof value === "object"

  // Cheap — no entry array is built for the initial-state decision.
  const childCount = isArray
    ? (value as unknown[]).length
    : isObject
      ? Object.keys(value as object).length
      : 0

  const [open, setOpen] = useState(
    depth < OPEN_DEPTH && childCount <= AUTO_FOLD_CHILDREN
  )
  const [visible, setVisible] = useState(CHUNK)

  const label =
    name !== undefined ? (
      <>
        <span className={TYPE_CLASS.key}>
          {isArray || isObject ? name : `"${name}"`}
        </span>
        <span className="text-muted-foreground">: </span>
      </>
    ) : null

  if (!(isArray || isObject)) {
    return (
      <div className="py-px">
        {label}
        <Primitive value={value} />
      </div>
    )
  }

  const entries = isArray
    ? (value as unknown[]).map(
        (entry, index) => [String(index), entry] as const
      )
    : Object.entries(value as Record<string, unknown>)

  const count = isArray
    ? t("items", { count: entries.length })
    : t("keys", { count: entries.length })

  const shown = entries.slice(0, visible)
  const remaining = entries.length - shown.length

  return (
    <div className="py-px">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        // Negative margins mirror the padding, so the hover pill gets air
        // around the glyphs without moving the text off the tree's grid.
        className="-mx-1.5 -my-0.5 group inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-left hover:bg-accent/50"
      >
        <ChevronRight
          size={12}
          aria-hidden="true"
          className={cn(
            // `top-px` is an OPTICAL correction, not a layout one: the flex
            // centring is exact (measured 0.1px), but a monospace brace draws
            // its visual weight below the geometric centre of its box, so a
            // perfectly centred chevron reads as sitting high — which is
            // exactly what the owner's zoomed screenshot showed.
            "relative top-px shrink-0 text-muted-foreground transition-transform",
            open && "rotate-90"
          )}
        />
        <span>
          {label}
          <span className="text-muted-foreground">{isArray ? "[" : "{"}</span>
          {!open && (
            <>
              <span className="mx-1 font-sans text-[11px] text-muted-foreground">
                {count}
              </span>
              <span className="text-muted-foreground">
                {isArray ? "]" : "}"}
              </span>
            </>
          )}
        </span>
      </button>

      {open && (
        <>
          {/* The guide line is the affordance that makes nesting readable at
              depth — and it doubles as a click target vocabulary: everything
              hanging off one line is one branch. */}
          <div className="ml-[5px] border-border border-l pl-4">
            {shown.map(([key, entry]) => (
              <Node key={key} name={key} value={entry} depth={depth + 1} />
            ))}
            {remaining > 0 && (
              <button
                type="button"
                onClick={() => setVisible((previous) => previous + CHUNK)}
                className="-mx-1.5 my-0.5 cursor-pointer rounded-md px-1.5 py-0.5 font-sans text-[11px] text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              >
                {t("showMore", {
                  count: Math.min(remaining, CHUNK),
                  remaining
                })}
              </button>
            )}
          </div>
          <span className="ml-[17px] text-muted-foreground">
            {isArray ? "]" : "}"}
          </span>
        </>
      )}
    </div>
  )
}

export function JsonTree({ value }: { value: unknown }) {
  return (
    <div className="overflow-x-auto p-4 font-mono text-foreground text-sm leading-relaxed">
      <Node value={value} depth={0} />
    </div>
  )
}
