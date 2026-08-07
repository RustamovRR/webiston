"use client"

import { Input } from "@webiston/ui/primitives/input"
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"

import type { VerifyVerdict } from "../types"

/**
 * Paste the checksum a download published, and be told whether it matches.
 *
 * This is the job people open a hash tool to do, and the old version could not
 * do it at all — it computed a digest and left the visitor to compare 64
 * characters by eye. The route's structured data listed "Hash taqqoslash"
 * (hash comparison) in its `featureList` anyway.
 *
 * `stripChecksumLabel` means a whole line off a release page works, in any of
 * the four shapes checksums are published in — bare, `sha256sum` output, BSD
 * `shasum` output, or the `sha256:…` form registries use.
 */

interface VerifyFieldProps {
  value: string
  onChange: (value: string) => void
  verdict: VerifyVerdict | null
}

export function VerifyField({ value, onChange, verdict }: VerifyFieldProps) {
  const t = useTranslations("HashGeneratorPage.verify")

  return (
    <section
      aria-labelledby="verify-heading"
      className="rounded-xl border border-border bg-card p-4"
    >
      <h2 id="verify-heading" className="font-medium text-foreground text-sm">
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
        aria-describedby={verdict ? "verify-verdict" : undefined}
      />

      {verdict && (
        <p
          id="verify-verdict"
          // `status`, not `alert`: a mismatch while the visitor is still
          // pasting is not an emergency, and an assertive live region would
          // interrupt them mid-paste on every keystroke.
          role="status"
          className={
            verdict.kind === "match"
              ? "mt-3 flex items-center gap-2 font-medium text-success text-sm"
              : verdict.kind === "mismatch"
                ? "mt-3 flex items-center gap-2 font-medium text-destructive text-sm"
                : "mt-3 flex items-center gap-2 text-muted-foreground text-sm"
          }
        >
          {verdict.kind === "match" ? (
            <CheckCircle2 size={16} aria-hidden="true" className="shrink-0" />
          ) : verdict.kind === "mismatch" ? (
            <XCircle size={16} aria-hidden="true" className="shrink-0" />
          ) : (
            <HelpCircle size={16} aria-hidden="true" className="shrink-0" />
          )}
          {verdict.kind === "unknown"
            ? t("unknown")
            : t(verdict.kind, { algorithm: verdict.algorithm })}
        </p>
      )}
    </section>
  )
}
