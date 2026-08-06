"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import { CodeHighlight } from "@webiston/ui/primitives/code-highlight"
import { Download } from "lucide-react"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import { OUTPUT_FORMATS } from "../constants"
import type { OutputFormat } from "../types"

/**
 * The block to paste, in the two shapes people paste it into.
 *
 * `html` for a `<head>`, and `next` for an App Router `metadata` export —
 * this site runs on Next and so does a large part of who opens this page, and
 * hand-translating twelve `<meta>` tags into the `openGraph` object shape is
 * exactly the mechanical step worth removing. The old panel offered "raw" and
 * "formatted", where formatted meant the same tags wrapped in a whole
 * boilerplate HTML document nobody needed.
 */

interface OutputPanelProps {
  code: string
  format: OutputFormat
  onFormatChange: (format: OutputFormat) => void
  tagCount: number
  onDownload: () => void
  className?: string
}

export function OutputPanel({
  code,
  format,
  onFormatChange,
  tagCount,
  onDownload,
  className
}: OutputPanelProps) {
  const t = useTranslations("OgMetaGeneratorPage.output")

  return (
    <ToolCard
      className={className}
      title={t("title")}
      actions={
        <>
          <span className="text-muted-foreground text-xs tabular-nums">
            {t("tags", { count: tagCount })}
          </span>
          <CopyButton text={code} variant="outline" label={t("copy")} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDownload}
            title={t("download")}
          >
            <Download aria-hidden="true" />
            <span className="sr-only">{t("download")}</span>
          </Button>
        </>
      }
      bodyClassName="p-5 space-y-4"
    >
      <div className="min-w-0 overflow-x-auto">
        <SegmentedControl<OutputFormat>
          label={t("format")}
          value={format}
          onChange={onFormatChange}
          options={OUTPUT_FORMATS.map((value) => ({
            value,
            label: t(`formats.${value}`)
          }))}
        />
      </div>

      {/* The suite's shared highlighter, the same one the JSON formatter
          prints its output with — a block of meta tags read as a wall of grey
          otherwise, and the whole point of this panel is that you scan it
          before pasting. `typescript` for the Next.js shape, `html` for the
          tags. */}
      <CodeHighlight
        code={code}
        language={format === "next" ? "typescript" : "html"}
        className="max-h-[26rem] rounded-lg border border-border bg-muted/40 text-xs"
      />
    </ToolCard>
  )
}
