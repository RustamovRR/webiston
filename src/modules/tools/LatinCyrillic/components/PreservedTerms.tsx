"use client"

import { useTranslations } from "next-intl"

/**
 * Names what the converter deliberately did NOT convert.
 *
 * The engine preserves links, e-mail addresses, code and ~740 technical terms.
 * From the output alone that is indistinguishable from a bug: the user sees
 * `React` come back as `React` and concludes the tool missed it. The FAQ
 * explains it, but nobody reads an FAQ while looking at a result — so the
 * result says it itself.
 */

/** Enough to recognise the behaviour, few enough to fit one footer line. */
const MAX_SHOWN = 3

/** Long matches here are code blocks and HTML tags, not words. */
const MAX_TERM_LENGTH = 18

function toLabel(term: string): string {
  const flat = term.replace(/\s+/g, " ").trim()
  return flat.length > MAX_TERM_LENGTH
    ? `${flat.slice(0, MAX_TERM_LENGTH - 1)}…`
    : flat
}

export function PreservedTerms({ terms }: { terms: readonly string[] }) {
  const t = useTranslations("LatinCyrillicPage.preserved")

  if (terms.length === 0) return null

  const shown = terms.slice(0, MAX_SHOWN).map(toLabel)
  const remaining = terms.length - shown.length
  const list =
    remaining > 0
      ? `${shown.join(", ")} ${t("more", { count: remaining })}`
      : shown.join(", ")

  return (
    <span
      aria-live="polite"
      className="truncate font-mono text-[11px] text-muted-foreground"
      title={terms.join(", ")}
    >
      {t("note", { terms: list })}
    </span>
  )
}
