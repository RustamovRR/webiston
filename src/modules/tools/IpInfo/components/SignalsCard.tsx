"use client"

import { cn } from "@webiston/ui"
import { Check, Minus, TriangleAlert } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { ToolCard } from "@/components/shared/ToolCard"

import type { IpLocation } from "../types"
import {
  type BrowserContext,
  compareSignals,
  mismatchCount,
  readBrowserContext
} from "../utils/signals"

/**
 * Does your browser agree with your address?
 *
 * The honest replacement for the fabricated security score. A VPN moves your
 * public address to another country; it does not move your operating system's
 * clock. So a Frankfurt address reported by a browser running on
 * `Asia/Tashkent` is the strongest free signal that traffic is tunnelled — and
 * no competitor in this category runs it without charging, because they reach
 * for a paid exit-node database instead.
 *
 * Every value on the left is read from YOUR browser, on your machine, and sent
 * nowhere. That is the difference between this and the panel it replaces.
 *
 * A signal, never a verdict: each row says what a mismatch means rather than
 * printing a score. Travel, a manually set clock and a corporate proxy all
 * produce the same reading as a VPN, and the page says so.
 */

interface SignalsCardProps {
  data: IpLocation | null
}

export function SignalsCard({ data }: SignalsCardProps) {
  const t = useTranslations("IpInfoPage.signals")
  const [browser, setBrowser] = useState<BrowserContext | null>(null)

  // Read after mount: `Intl` and `navigator` do not exist during the
  // prerender, and the card renders its labels either way.
  useEffect(() => {
    setBrowser(readBrowserContext())
  }, [])

  const signals = data && browser ? compareSignals(data, browser) : null
  const mismatches = signals ? mismatchCount(signals) : 0

  return (
    <ToolCard title={t("title")}>
      <p className="text-muted-foreground text-sm">
        {signals === null
          ? t("pending")
          : mismatches === 0
            ? t("summaryAligned")
            : t("summaryMismatched", { count: mismatches })}
      </p>

      <dl className="mt-4 divide-y divide-border">
        {(signals ?? PENDING_ROWS).map((signal) => (
          <div key={signal.key} className="flex items-start gap-3 py-3">
            <StatusIcon status={signal.status} />
            <div className="min-w-0 flex-1">
              <dt className="text-foreground text-sm">
                {t(`items.${signal.key}.label`)}
              </dt>
              <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 font-mono text-muted-foreground text-xs">
                <span>
                  {t("browserSide")}: {signal.browser ?? "—"}
                </span>
                <span>
                  {t("addressSide")}: {signal.address ?? "—"}
                </span>
              </dd>
              {signal.status === "mismatch" ? (
                <p className="mt-1.5 text-muted-foreground text-xs">
                  {t(`items.${signal.key}.mismatch`)}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </dl>
    </ToolCard>
  )
}

/** Keeps the card's height stable before the first comparison. */
const PENDING_ROWS = [
  { key: "timezone", status: "unknown", browser: null, address: null },
  { key: "offset", status: "unknown", browser: null, address: null },
  { key: "language", status: "unknown", browser: null, address: null }
] as const

function StatusIcon({ status }: { status: "match" | "mismatch" | "unknown" }) {
  const Icon =
    status === "match" ? Check : status === "mismatch" ? TriangleAlert : Minus

  return (
    <Icon
      aria-hidden="true"
      className={cn(
        "mt-0.5 size-4 shrink-0",
        status === "match" && "text-success",
        status === "mismatch" && "text-warning",
        status === "unknown" && "text-muted-foreground"
      )}
    />
  )
}
