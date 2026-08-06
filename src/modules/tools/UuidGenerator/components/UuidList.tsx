"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { Button } from "@webiston/ui/primitives/button"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { ROW_CHUNK } from "../constants"

/**
 * The values, one per row, each copyable on its own.
 *
 * The old panel printed the whole batch into a single `<pre>`, so taking ONE
 * identifier — which is what the overwhelming majority of visits are for —
 * meant selecting 36 characters out of a wall of text without catching the
 * line above it.
 *
 * A single value gets the panel to itself at a size you can read across a
 * desk, the way the password generator treats its one answer. A batch becomes
 * a numbered list, revealed in slices: 1000 rows each with their own copy
 * button is 1000 mounted components for a list nobody scrolls to the end of —
 * the same guard the JSON tree needed.
 */

interface UuidListProps {
  values: readonly string[]
}

export function UuidList({ values }: UuidListProps) {
  const t = useTranslations("UuidGeneratorPage.results")
  const [visible, setVisible] = useState(ROW_CHUNK)
  const [shownFor, setShownFor] = useState(values)

  // A fresh batch starts from the top — otherwise generating 1000 after having
  // expanded a previous list mounts every row at once. Adjusted during render
  // rather than in an effect, which is React's own answer for state that
  // depends on a prop: no extra pass, and no frame paints the stale count.
  if (shownFor !== values) {
    setShownFor(values)
    setVisible(ROW_CHUNK)
  }

  if (values.length === 1) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-4">
        <output className="break-all font-mono text-base text-foreground sm:text-lg">
          {values[0]}
        </output>
        <CopyButton
          text={values[0]}
          variant="outline"
          label={t("copyOne")}
          className="shrink-0"
        />
      </div>
    )
  }

  const shown = values.slice(0, visible)
  const remaining = values.length - shown.length

  return (
    // The list scrolls in its OWN box. Asking for 100 values and getting a
    // 4,000-pixel column pushes the inspector, the reference and the FAQ off
    // the end of the document, and the controls that produced the list scroll
    // away with them — so changing your mind about the count means scrolling
    // back up past everything you just generated. A fixed box keeps the whole
    // tool on one screen no matter what number is in the field.
    <div className="max-h-[26rem] overflow-y-auto overscroll-contain rounded-lg border border-border">
      <ol className="divide-y divide-border">
        {shown.map((value, index) => (
          <li
            // Not keyed on the value alone: a batch of Nil UUIDs is 1000
            // identical strings, and React answers duplicate keys with a
            // warning per row. The list is replaced wholesale and never
            // reordered, so the position is a legitimate part of the identity.
            key={`${index}:${value}`}
            className="flex items-center gap-3 bg-muted/20 px-3 py-2 transition-colors hover:bg-accent/30"
          >
            <span className="w-10 shrink-0 text-right font-mono text-muted-foreground text-xs tabular-nums">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 break-all font-mono text-foreground text-sm">
              {value}
            </span>
            <CopyButton text={value} label={t("copyOne")} />
          </li>
        ))}
      </ol>

      {/* Inside the scroller, so it is where scrolling to the end leaves you
          rather than a control you have to come back out of the box to find. */}
      {remaining > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full rounded-none border-border border-t"
          onClick={() => setVisible((current) => current + ROW_CHUNK)}
        >
          {t("showMore", { count: Math.min(ROW_CHUNK, remaining), remaining })}
        </Button>
      )}
    </div>
  )
}
