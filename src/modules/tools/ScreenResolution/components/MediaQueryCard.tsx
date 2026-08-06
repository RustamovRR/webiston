"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { CodeHighlight } from "@webiston/ui/primitives/code-highlight"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import type { ScreenMetrics } from "../types"
import { mediaQuerySnippet } from "../utils/metrics"

/**
 * The CSS that matches what you are looking at, ready to paste.
 *
 * This is the step the old tool left to the reader: it printed the numbers and
 * stopped. Someone debugging a layout at this width then has to remember which
 * breakpoint they are in, look up its bounds, and type a range query — three
 * chances to get it wrong before the first test.
 *
 * A RANGE query, not a bare `min-width`, because the reason to copy this is
 * "reproduce exactly what I see", and an open-ended query also matches every
 * width above it.
 */

interface MediaQueryCardProps {
  metrics: ScreenMetrics
}

export function MediaQueryCard({ metrics }: MediaQueryCardProps) {
  const t = useTranslations("ScreenResolutionPage.mediaQuery")
  const snippet = mediaQuerySnippet(metrics)

  return (
    <ToolCard
      title={t("title")}
      actions={<CopyButton text={snippet} label={t("copy")} />}
      bodyClassName="p-0"
    >
      <CodeHighlight code={snippet} language="css" />
    </ToolCard>
  )
}
