"use client"

import { Button } from "@webiston/ui/primitives/button"
import { useTranslations } from "next-intl"
import { useId, useState } from "react"

import { ToolCard } from "@/components/shared/ToolCard"

import type { MetaDraft } from "../types"
import { countImported, parseHeadHtml } from "../utils/parse"

/**
 * Paste the tags you already have, and edit them.
 *
 * Nobody starts from an empty form: they have a page, it shares badly, and
 * they want to fix the tags that are on it. Competitors solve that by fetching
 * the URL server-side; pasting reaches the same place with no server, no
 * request-forgery surface, and no dependency on the page being reachable from
 * our machine.
 *
 * The count is reported honestly. A paste that fills nothing says so, because
 * a form that simply does not change is indistinguishable from a broken
 * button.
 */

interface ImportPanelProps {
  onImport: (patch: Partial<MetaDraft>) => void
  onClose: () => void
}

export function ImportPanel({ onImport, onClose }: ImportPanelProps) {
  const t = useTranslations("OgMetaGeneratorPage.import")
  const inputId = useId()
  const [html, setHtml] = useState("")
  const [result, setResult] = useState<number | null>(null)

  const run = () => {
    const found = parseHeadHtml(html)
    const count = countImported(found)
    setResult(count)
    if (count > 0) onImport(found)
  }

  return (
    <ToolCard title={t("title")} tone="muted" className="mb-4">
      <label
        htmlFor={inputId}
        className="text-muted-foreground text-sm leading-relaxed"
      >
        {t("hint")}
      </label>
      <textarea
        id={inputId}
        value={html}
        onChange={(event) => {
          setHtml(event.target.value)
          setResult(null)
        }}
        // `t.raw`: the example IS a meta tag, and ICU reads `<meta …>` as a
        // rich-text tag it has no handler for — the same reason the JSON
        // formatter's examples go through `t.raw`.
        placeholder={String(t.raw("placeholder"))}
        rows={5}
        spellCheck={false}
        className="mt-2 w-full resize-y rounded-lg border border-border bg-input px-3 py-2 font-mono text-foreground text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" disabled={!html.trim()} onClick={run}>
          {t("action")}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t("close")}
        </Button>

        {result !== null && (
          <p
            role="status"
            className={
              result > 0
                ? "text-success text-sm"
                : "text-muted-foreground text-sm"
            }
          >
            {result > 0 ? t("found", { count: result }) : t("nothing")}
          </p>
        )}
      </div>
    </ToolCard>
  )
}
