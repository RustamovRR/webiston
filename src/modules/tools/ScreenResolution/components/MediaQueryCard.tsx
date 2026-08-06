"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { CodeHighlight } from "@webiston/ui/primitives/code-highlight"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import { FRAMEWORKS } from "../constants"
import type { FrameworkId } from "../types"
import { mediaQuerySnippet } from "../utils/metrics"

/**
 * The CSS that matches the width in question, ready to paste.
 *
 * This is the step the old tool left to the reader: it printed the numbers and
 * stopped. Someone debugging a layout at this width then has to remember which
 * breakpoint they are in, look up its bounds, and type a range query — three
 * chances to get it wrong before the first test. No competitor in this
 * category generates the query at all.
 *
 * A RANGE query, not a bare `min-width`, because the reason to copy this is
 * "reproduce exactly what I see", and an open-ended query also matches every
 * width above it.
 */

interface MediaQueryCardProps {
  width: number | null
  height: number | null
  pixelRatio: number | null
  framework: FrameworkId
}

export function MediaQueryCard({
  width,
  height,
  pixelRatio,
  framework
}: MediaQueryCardProps) {
  const t = useTranslations("ScreenResolutionPage.mediaQuery")

  const scale =
    FRAMEWORKS.find((entry) => entry.id === framework) ?? FRAMEWORKS[0]

  const snippet =
    width !== null && height !== null && pixelRatio !== null
      ? mediaQuerySnippet({ width, height, pixelRatio, framework: scale })
      : ""

  return (
    <ToolCard
      title={t("title")}
      actions={
        <CopyButton text={snippet} disabled={!snippet} label={t("copy")} />
      }
      bodyClassName="p-0"
    >
      <CodeHighlight code={snippet} language="css" />
    </ToolCard>
  )
}
