"use client"

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"

import type { ImageProbe, ValidationIssue } from "../types"

/**
 * What is wrong, and nothing else.
 *
 * What this replaces was a score out of 100 — a title of 30–60 characters was
 * worth 25 points, a site name 10 — printed above a checklist. A score cannot
 * be acted on: it does not say what to change, and 72/100 means nothing
 * anywhere outside that panel. Each row here names one thing and what it does
 * to the card.
 *
 * The measured image size is shown even when there is no problem with it,
 * because "1200 × 630" is the fact the visitor came to confirm.
 */

interface IssueListProps {
  issues: readonly ValidationIssue[]
  probe: ImageProbe
}

export function IssueList({ issues, probe }: IssueListProps) {
  const t = useTranslations("OgMetaGeneratorPage.issues")

  return (
    <div className="space-y-3">
      {probe.status === "ready" && (
        <p className="font-mono text-muted-foreground text-xs tabular-nums">
          {t("measured", {
            width: probe.width,
            height: probe.height,
            ratio: (probe.width / probe.height).toFixed(2)
          })}
        </p>
      )}

      {issues.length === 0 ? (
        <p className="flex items-center gap-2 font-medium text-success text-sm">
          <CheckCircle2 size={16} aria-hidden="true" className="shrink-0" />
          {t("clean")}
        </p>
      ) : (
        <ul className="space-y-2">
          {issues.map((issue) => (
            <li
              key={issue.key}
              className={
                issue.level === "error"
                  ? "flex items-start gap-2 text-destructive text-sm"
                  : "flex items-start gap-2 text-warning text-sm"
              }
            >
              {issue.level === "error" ? (
                <XCircle
                  size={15}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                />
              ) : (
                <AlertTriangle
                  size={15}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                />
              )}
              <span className="leading-relaxed">
                {t(issue.key, issue.values)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
