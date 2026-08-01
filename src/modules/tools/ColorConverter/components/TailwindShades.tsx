"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Check, Copy } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { CopySwatch } from "./CopySwatch"

/**
 * The 50–950 shade scale around the chosen colour, with the three export
 * shapes a developer pastes into a real project. This is the panel that makes
 * the tool a working instrument rather than a viewer.
 */

interface TailwindShadesProps {
  baseColor: string
  shades: ReadonlyArray<{ shade: number; hex: string }>
  isValid: boolean
}

type ExportKind = "css" | "tailwind" | "scss"

export function TailwindShades({
  baseColor,
  shades,
  isValid
}: TailwindShadesProps) {
  const t = useTranslations("ColorConverterPage.TailwindShades")
  const [copiedExport, setCopiedExport] = useState<ExportKind | null>(null)

  if (!isValid || shades.length === 0) return null

  const exports: Record<ExportKind, { label: string; build: () => string }> = {
    css: {
      label: "CSS Variables",
      build: () =>
        `:root {\n${shades
          .map(({ shade, hex }) => `  --color-primary-${shade}: ${hex};`)
          .join("\n")}\n}`
    },
    tailwind: {
      label: "Tailwind Config",
      build: () =>
        `primary: {\n${shades
          .map(({ shade, hex }) => `  '${shade}': '${hex}',`)
          .join("\n")}\n},`
    },
    scss: {
      label: "SCSS Variables",
      build: () =>
        shades.map(({ shade, hex }) => `$primary-${shade}: ${hex};`).join("\n")
    }
  }

  const copyExport = async (kind: ExportKind) => {
    try {
      await navigator.clipboard.writeText(exports[kind].build())
    } catch {
      return
    }
    setCopiedExport(kind)
    setTimeout(() => setCopiedExport(null), 2000)
  }

  return (
    <section className="mt-6 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-border border-b px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-[6px] shrink-0 rounded-[2px] bg-primary"
          />
          <h2 className="font-medium text-base text-foreground">
            {t("title")}
          </h2>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {baseColor}
        </span>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 lg:grid-cols-11">
          {shades.map(({ shade, hex }) => (
            <CopySwatch
              key={shade}
              color={hex}
              swatchClassName="aspect-square"
              caption={
                <span className="mt-1.5 block">
                  <span className="block font-medium text-foreground text-xs">
                    {shade}
                  </span>
                  <span className="block font-mono text-[10px] text-muted-foreground">
                    {hex}
                  </span>
                </span>
              }
            />
          ))}
        </div>

        <div>
          <span className="mb-2.5 block text-muted-foreground text-sm">
            {t("exportOptions")}
          </span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(exports) as ExportKind[]).map((kind) => (
              <Button
                key={kind}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyExport(kind)}
              >
                {copiedExport === kind ? (
                  <Check aria-hidden="true" className="text-success" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
                {exports[kind].label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
