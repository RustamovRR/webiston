"use client"

import { cn } from "@webiston/ui"
import { Check } from "lucide-react"
import { useTranslations } from "next-intl"

import { CopyButton } from "@/components/shared/CopyButton"

import { ALGORITHM_META } from "../constants"
import type { DigestFormat, HashAlgorithm, HashOutput } from "../types"

/**
 * One row per algorithm.
 *
 * What this replaces printed every digest TWICE — once as text in the result
 * panel and again in a "Batafsil natijalar" card below it — with a coloured
 * status pill on all four rows. A pill that says "secure" on the ones you
 * should use is decoration; the only status worth interrupting for is the one
 * that says stop. So the badge appears on the broken algorithms and nowhere
 * else.
 */

interface DigestListProps {
  outputs: readonly HashOutput[]
  format: DigestFormat
  /** The algorithm whose digest matched a pasted checksum, if any. */
  matched: HashAlgorithm | null
}

export function DigestList({ outputs, format, matched }: DigestListProps) {
  const t = useTranslations("HashGeneratorPage.results")

  return (
    <ul className="divide-y divide-border">
      {outputs.map((output) => {
        const meta = ALGORITHM_META[output.algorithm]
        const isMatch = matched === output.algorithm

        return (
          <li key={output.algorithm} className="px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <h3 className="font-medium text-foreground text-sm">
                  {output.algorithm}
                </h3>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {t("bits", { bits: meta.bits })}
                </span>
                {meta.status === "broken" && (
                  <span className="rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 font-medium text-[11px] text-destructive">
                    {t("broken")}
                  </span>
                )}
                {isMatch && (
                  <span className="flex items-center gap-1 rounded border border-success/30 bg-success/10 px-1.5 py-0.5 font-medium text-[11px] text-success">
                    <Check size={11} aria-hidden="true" />
                    {t("matched")}
                  </span>
                )}
              </div>
              <CopyButton text={output[format]} />
            </div>

            <p
              className={cn(
                "mt-2 break-all rounded-lg border p-2.5 font-mono text-xs leading-relaxed",
                isMatch
                  ? "border-success/40 bg-success/5 text-foreground"
                  : "border-border bg-muted/40 text-foreground"
              )}
            >
              {output[format]}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
