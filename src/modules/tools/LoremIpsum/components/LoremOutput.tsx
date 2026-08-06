"use client"

import { CodeHighlight } from "@webiston/ui/primitives/code-highlight"
import { useTranslations } from "next-intl"

import type { LoremFormat } from "../types"

/**
 * The text.
 *
 * Two renderings, because they are two different things to look at. Plain
 * filler is PROSE — it exists to be judged by eye, so it is set in the reading
 * face at reading measure, not in monospace. HTML output is CODE, so it goes
 * through the same highlighter the JSON formatter and the OG generator use.
 *
 * It scrolls in its own box: 100 paragraphs is a 40,000-character document,
 * and letting it set the page height pushes the controls that produced it off
 * the screen.
 */

interface LoremOutputProps {
  text: string
  format: LoremFormat
}

export function LoremOutput({ text, format }: LoremOutputProps) {
  const t = useTranslations("LoremIpsumPage.output")

  if (!text) {
    return (
      <p className="py-10 text-center text-muted-foreground text-sm">
        {t("empty")}
      </p>
    )
  }

  if (format === "html") {
    return (
      <CodeHighlight
        code={text}
        language="html"
        className="max-h-[30rem] rounded-lg border border-border bg-muted/40 text-xs"
      />
    )
  }

  return (
    <div className="max-h-[30rem] overflow-y-auto overscroll-contain rounded-lg border border-border bg-muted/20 p-5">
      {text.split("\n\n").map((paragraph, index) => (
        <p
          // The list is a re-render of one immutable string, never reordered.
          key={`${index}-${paragraph.slice(0, 24)}`}
          className="max-w-[68ch] text-foreground text-sm leading-relaxed not-first:mt-4"
        >
          {paragraph}
        </p>
      ))}
    </div>
  )
}
