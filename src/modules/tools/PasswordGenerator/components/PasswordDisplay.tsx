"use client"

import { Button } from "@webiston/ui/primitives/button"
import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react"
import { useTranslations } from "next-intl"

/**
 * The password itself — the hero of the page.
 *
 * It used to be printed into a read-only `DualTextPanel` textarea labelled
 * "Tool Kirish", as if the visitor had typed it. The password is the OUTPUT
 * and the only thing anyone came for, so it gets the treatment the QR code
 * gets: first, large, with its actions on it.
 *
 * Characters are coloured by CLASS — digits and symbols stand apart from
 * letters. This is the 1Password/Bitwarden convention and it earns its place:
 * an ambiguous glyph ("is that l or 1?") answers itself by colour. Chart
 * tokens, the design system's data-visualisation palette — a character's
 * class IS data.
 */

const CHAR_CLASS = {
  digit: "text-chart-1",
  symbol: "text-chart-5"
} as const

function classFor(char: string): string | undefined {
  if (/\d/.test(char)) return CHAR_CLASS.digit
  if (/[^a-zA-Z0-9]/.test(char)) return CHAR_CLASS.symbol
  return undefined
}

interface PasswordDisplayProps {
  password: string
  /** Translated message when the settings allow no password. */
  errorText?: string
  show: boolean
  copied: boolean
  onToggleShow: () => void
  onCopy: () => void
  onRegenerate: () => void
}

export function PasswordDisplay({
  password,
  errorText,
  show,
  copied,
  onToggleShow,
  onCopy,
  onRegenerate
}: PasswordDisplayProps) {
  const t = useTranslations("PasswordGeneratorPage.ConfigPanel")

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2.5 border-border border-b px-5 py-3">
        <span
          aria-hidden="true"
          className="size-[6px] shrink-0 rounded-[2px] bg-primary"
        />
        <h2 className="font-medium text-base text-foreground">{t("result")}</h2>
      </div>

      <div className="px-5 py-6">
        {errorText ? (
          <p
            role="alert"
            className="flex items-center gap-2 text-destructive text-sm"
          >
            <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
            {errorText}
          </p>
        ) : (
          // `break-all`, or a 64-character draw walks out of the card.
          // Masked shows dots WITHOUT per-class colour — colouring the mask
          // would leak which positions hold digits over a shoulder.
          <output className="block select-all break-all font-mono text-foreground text-xl leading-relaxed tracking-wide">
            {show
              ? [...password].map((char, index) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: characters repeat; position is the identity
                    key={index}
                    className={classFor(char)}
                  >
                    {char}
                  </span>
                ))
              : "•".repeat(password.length)}
          </output>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-border border-t bg-muted/30 px-5 py-4">
        <Button type="button" size="sm" onClick={onRegenerate}>
          <RefreshCw aria-hidden="true" />
          {t("generateButton")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!password}
          onClick={onCopy}
        >
          {copied ? (
            <Check aria-hidden="true" className="text-success" />
          ) : (
            <Copy aria-hidden="true" />
          )}
          {copied ? t("copiedButton") : t("copyButton")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!password}
          onClick={onToggleShow}
          aria-pressed={!show}
        >
          {show ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          {show ? t("hideButton") : t("showButton")}
        </Button>
      </div>
    </div>
  )
}
