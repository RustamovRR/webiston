"use client"

import { AlertTriangle, CircleCheck, CircleX, Clock } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import type { DecodedJwt, TokenTiming } from "../types"
import { REGISTERED_CLAIMS } from "../utils/jwt"

/**
 * The verdict, pinned.
 *
 * A developer opens a JWT decoder to answer one of two questions — "what is in
 * this token" and "why is it being rejected" — and the second one is almost
 * always expiry. The tool this replaces printed `exp` as a date in a row of
 * four equal cards and left the arithmetic to the reader.
 *
 * Everything here is stated as a fact or not at all. A token with no `exp`
 * gets "no expiry claim", not "valid": saying "not expired" about a claim that
 * was never checked is the kind of answer this tool exists to avoid.
 */

interface TokenSummaryProps {
  token: DecodedJwt
  timing: TokenTiming | null
  unsigned: boolean
}

/** `iss`, `sub`, `aud`, `jti` — the identity claims, when the token has them. */
const IDENTITY_CLAIMS = REGISTERED_CLAIMS.filter(
  (claim) => !["exp", "nbf", "iat"].includes(claim)
)

export function TokenSummary({ token, timing, unsigned }: TokenSummaryProps) {
  const t = useTranslations("JwtDecoderPage.Summary")
  const format = useFormatter()

  const alg = typeof token.header.alg === "string" ? token.header.alg : null
  const typ = typeof token.header.typ === "string" ? token.header.typ : null

  const status = (() => {
    if (!timing) return null
    if (timing.isExpired) return "expired" as const
    if (timing.isNotYetValid) return "notYet" as const
    if (timing.isExpired === false) return "active" as const
    return "noExpiry" as const
  })()

  const STATUS_ICON = {
    active: <CircleCheck size={16} className="text-success" />,
    expired: <CircleX size={16} className="text-destructive" />,
    notYet: <Clock size={16} className="text-muted-foreground" />,
    noExpiry: <Clock size={16} className="text-muted-foreground" />
  }

  return (
    <ToolCard title={t("title")} bodyClassName="space-y-4 p-5">
      {status && (
        <p className="flex items-start gap-2 font-medium text-foreground text-sm">
          <span className="mt-0.5 shrink-0">{STATUS_ICON[status]}</span>
          <span>
            {t(`status.${status}`)}
            {timing?.expiresAt && (
              // Relative time is the answer; the absolute date is the evidence.
              <span className="block font-normal text-muted-foreground">
                {format.relativeTime(timing.expiresAt.date)} ·{" "}
                {format.dateTime(timing.expiresAt.date, {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}
              </span>
            )}
          </span>
        </p>
      )}

      {unsigned && (
        // Not a warning about THIS token being dangerous — a statement about
        // what `alg: none` means, on the page where someone is looking at one.
        <p
          role="note"
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-destructive text-xs leading-relaxed"
        >
          <AlertTriangle
            size={14}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />
          {t("unsigned")}
        </p>
      )}

      <dl className="space-y-2.5 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">{t("algorithm")}</dt>
          <dd className="font-mono text-foreground">{alg ?? t("absent")}</dd>
        </div>
        {typ && (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">{t("type")}</dt>
            <dd className="font-mono text-foreground">{typ}</dd>
          </div>
        )}
        {timing?.lifetimeSeconds !== null &&
          timing?.lifetimeSeconds !== undefined && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{t("lifetime")}</dt>
              <dd className="font-mono text-foreground tabular-nums">
                {format.relativeTime(
                  new Date(timing.lifetimeSeconds * 1000),
                  new Date(0)
                )}
              </dd>
            </div>
          )}
        {IDENTITY_CLAIMS.map((claim) => {
          const value = token.payload[claim]
          if (typeof value !== "string" && typeof value !== "number")
            return null
          return (
            <div
              key={claim}
              className="flex items-baseline justify-between gap-3"
            >
              <dt className="shrink-0 text-muted-foreground">
                <span className="font-mono">{claim}</span>{" "}
                <span className="text-xs">{t(`claims.${claim}`)}</span>
              </dt>
              <dd className="min-w-0 truncate font-mono text-foreground">
                {String(value)}
              </dd>
            </div>
          )
        })}
      </dl>
    </ToolCard>
  )
}
