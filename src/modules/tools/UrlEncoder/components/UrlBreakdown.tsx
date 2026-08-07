"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import type { QueryPair } from "../types"

/**
 * The URL, taken apart.
 *
 * The old tool had the pieces and stopped one step short: it parsed the URL,
 * printed protocol / host / path / search as four rows, and left the query as
 * one opaque `?q=hello%20world&lang=uz` string — which is the exact thing a
 * person opens a URL tool to read. Each parameter is its own row here, with
 * its value already decoded.
 *
 * It renders only when the text really parses as a URL, so it never guesses.
 */

interface UrlBreakdownProps {
  protocol?: string
  hostname?: string
  pathname?: string
  hash?: string
  query: readonly QueryPair[]
}

export function UrlBreakdown({
  protocol,
  hostname,
  pathname,
  hash,
  query
}: UrlBreakdownProps) {
  const t = useTranslations("UrlEncoderPage.Breakdown")

  const parts: Array<[string, string | undefined]> = [
    ["protocol", protocol],
    ["host", hostname],
    ["path", pathname],
    ["hash", hash]
  ]

  return (
    <ToolCard title={t("title")} bodyClassName="space-y-4 p-5">
      <dl className="space-y-2.5 text-sm">
        {parts.map(([key, value]) =>
          value ? (
            <div
              key={key}
              className="flex items-baseline justify-between gap-3"
            >
              <dt className="shrink-0 text-muted-foreground">{t(key)}</dt>
              <dd className="min-w-0 break-all text-right font-mono text-foreground">
                {value}
              </dd>
            </div>
          ) : null
        )}
      </dl>

      {query.length > 0 && (
        <div className="border-border border-t pt-4">
          {/* `mb-3`, not the container's `space-y-2`: at 8px this count sat on
              top of the first parameter box and read as part of it — reported
              from a screenshot, and correct. A label needs more air below it
              than the items it labels have between them. */}
          <p className="mb-3 text-muted-foreground text-xs">
            {t("params", { count: query.length })}
          </p>
          <dl className="space-y-2">
            {query.map((pair, index) => (
              <div
                // A query string may repeat a key — `?tag=a&tag=b` is normal —
                // so the key alone is not unique and the position is part of
                // the identity.
                key={`${pair.key}-${index}`}
                className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-2.5"
              >
                <div className="min-w-0 flex-1">
                  <dt className="break-all font-mono text-muted-foreground text-xs">
                    {pair.key}
                  </dt>
                  <dd className="mt-1 break-all font-mono text-foreground text-sm">
                    {pair.value || (
                      <span className="text-muted-foreground italic">
                        {t("emptyValue")}
                      </span>
                    )}
                  </dd>
                </div>
                {/* One value is usually the reason someone opened the tool —
                    an id, a token, a redirect target. Copying it should not
                    mean selecting it out of a wall of text by hand. */}
                {pair.value && (
                  <span className="shrink-0">
                    <CopyButton text={pair.value} />
                  </span>
                )}
              </div>
            ))}
          </dl>
        </div>
      )}
    </ToolCard>
  )
}
