"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import { Check, Copy, Download } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import {
  COPIED_FEEDBACK_MS,
  DEFAULT_TOKEN_NAME,
  EXPORT_NOTATIONS,
  EXPORT_TARGETS
} from "../constants"
import type { ExportNotation, ExportTarget, ShadeStep } from "../types"
import { buildScaleExport, EXPORT_FILENAME } from "../utils/exports"

/**
 * Two axes and one copy button, with the snippet ON SCREEN.
 *
 * Three verified defects closed at once. The three buttons this replaces fired
 * the clipboard blind — for a thirteen-line `@theme` block that asks the
 * visitor to trust an unseen result, and every tool in the research shows the
 * snippet first. They emitted hex only, on a repo that is itself on Tailwind
 * v4 whose own palette is authored in OKLCH. And all three hardcoded the token
 * stem as `primary`, so exporting two scales produced two colliding blocks.
 *
 * Defaults stay Tailwind v4 + HEX: changing them would change what a returning
 * visitor's clipboard receives.
 */

interface ExportPanelProps {
  shades: readonly ShadeStep[]
  /** Derived from the colour's name; the visitor may override it. */
  defaultName: string
}

export function ExportPanel({ shades, defaultName }: ExportPanelProps) {
  const t = useTranslations("ColorConverterPage.Export")
  const [target, setTarget] = useState<ExportTarget>("tailwind")
  const [notation, setNotation] = useState<ExportNotation>("hex")
  const [name, setName] = useState(defaultName)
  const [copied, setCopied] = useState(false)

  // The colour changed under us and the visitor has not overridden the stem.
  const [lastDefault, setLastDefault] = useState(defaultName)
  if (lastDefault !== defaultName) {
    setLastDefault(defaultName)
    if (name === lastDefault) setName(defaultName)
  }

  const snippet = buildScaleExport(target, {
    shades,
    name: name.trim() || DEFAULT_TOKEN_NAME,
    notation
  })

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
    } catch {
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
  }

  const download = () => {
    const blob = new Blob([snippet], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${name.trim() || DEFAULT_TOKEN_NAME}.${EXPORT_FILENAME[target]}`
    document.body.appendChild(link)
    link.click()
    link.remove()
    requestAnimationFrame(() => URL.revokeObjectURL(url))
  }

  return (
    <div className="space-y-3 border-border border-t pt-4">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 overflow-x-auto">
            <SegmentedControl<ExportTarget>
              label={t("target")}
              value={target}
              onChange={setTarget}
              options={EXPORT_TARGETS.map((option) => ({
                value: option,
                label: t(`targets.${option}`)
              }))}
            />
          </div>
          <div className="min-w-0 overflow-x-auto">
            <SegmentedControl<ExportNotation>
              label={t("notation")}
              value={notation}
              onChange={setNotation}
              options={EXPORT_NOTATIONS.map((option) => ({
                value: option,
                label: t(`notations.${option}`)
              }))}
            />
          </div>
        </div>

        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">
            {t("tokenName")}
          </span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            spellCheck={false}
            className="h-9 w-full rounded-md border border-border bg-input px-3 font-mono text-foreground text-sm outline-none transition-colors focus:border-ring lg:w-44"
          />
        </label>
      </div>

      <pre className="max-h-56 overflow-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-foreground text-xs leading-relaxed">
        <code>{snippet}</code>
      </pre>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          {copied ? (
            <Check aria-hidden="true" className="text-success" />
          ) : (
            <Copy aria-hidden="true" />
          )}
          {t("copy")}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={download}>
          <Download aria-hidden="true" />
          {t("download")}
        </Button>
      </div>
    </div>
  )
}
