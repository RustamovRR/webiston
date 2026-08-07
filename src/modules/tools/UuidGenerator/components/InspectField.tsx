"use client"

import { cn } from "@webiston/ui"
import { Input } from "@webiston/ui/primitives/input"
import { CheckCircle2, HelpCircle } from "lucide-react"
import { useTranslations } from "next-intl"

import type { InspectVerdict } from "../types"
import { formatUtcTimestamp } from "../utils/uuid"

/**
 * Paste a UUID you were handed, and be told what it is.
 *
 * The other half of this tool's job, and the half it did not have. A
 * generator answers "give me one"; the question a developer actually arrives
 * with as often is "what is this thing in my log line" — which version, and,
 * for the versions that carry a clock, when it was made. The old page
 * advertised "UUID validation" in its structured data and had no field to
 * paste a UUID into.
 *
 * It reads every version RFC 9562 defines, not only the four this tool makes:
 * a v3 or v5 that came out of somebody else's system is exactly the value you
 * cannot identify by eye.
 */

interface InspectFieldProps {
  value: string
  onChange: (value: string) => void
  verdict: InspectVerdict | null
  className?: string
}

export function InspectField({
  value,
  onChange,
  verdict,
  className
}: InspectFieldProps) {
  const t = useTranslations("UuidGeneratorPage.inspect")
  const hasInput = value.trim().length > 0

  return (
    <section
      aria-labelledby="uuid-inspect-heading"
      className={cn(
        "h-fit rounded-xl border border-border bg-card p-4",
        className
      )}
    >
      <h2
        id="uuid-inspect-heading"
        className="font-medium text-foreground text-sm"
      >
        {t("title")}
      </h2>
      <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
        {t("hint")}
      </p>

      <Input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("placeholder")}
        className="mt-3 font-mono text-xs"
        autoComplete="off"
        spellCheck={false}
        aria-label={t("title")}
        aria-describedby={hasInput ? "uuid-inspect-verdict" : undefined}
      />

      {hasInput && (
        <div
          id="uuid-inspect-verdict"
          // `status`, not `alert`: a half-pasted UUID is not an emergency, and
          // an assertive region would interrupt on every keystroke.
          role="status"
          className="mt-3"
        >
          {verdict === null ? (
            <p className="flex items-center gap-2 text-muted-foreground text-sm">
              <HelpCircle size={16} aria-hidden="true" className="shrink-0" />
              {t("invalid")}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="flex items-center gap-2 font-medium text-success text-sm">
                <CheckCircle2
                  size={16}
                  aria-hidden="true"
                  className="shrink-0"
                />
                {verdict.special
                  ? t(`special.${verdict.special}`)
                  : t("versionName", {
                      version: verdict.version ?? 0,
                      name: t(`versionNames.${verdict.version}`)
                    })}
              </p>

              <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
                <dt className="text-muted-foreground">{t("variant")}</dt>
                <dd className="text-foreground">
                  {t(`variants.${verdict.variant}`)}
                </dd>

                {verdict.timestamp !== null && (
                  <>
                    <dt className="text-muted-foreground">{t("created")}</dt>
                    <dd className="font-mono text-foreground text-xs tabular-nums">
                      {formatUtcTimestamp(verdict.timestamp)}
                    </dd>
                  </>
                )}

                <dt className="text-muted-foreground">{t("canonical")}</dt>
                <dd className="break-all font-mono text-foreground text-xs">
                  {verdict.canonical}
                </dd>
              </dl>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
