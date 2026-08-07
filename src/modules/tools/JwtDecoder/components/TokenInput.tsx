"use client"

import { Button } from "@webiston/ui/primitives/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@webiston/ui/primitives/dropdown-menu"
import { ChevronDown, Upload, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef } from "react"

import { ToolCard } from "@/components/shared/ToolCard"

/**
 * The one card the visitor authors in.
 *
 * `tone="muted"` is the suite's rule made visible: a primary kicker means the
 * tool derived this panel, a muted one means the visitor drives it.
 *
 * The character/word/line counter that used to sit under this field is gone. A
 * JWT is one string with no spaces and no newlines, so "words: 1, lines: 1"
 * was two numbers that could never say anything. The segment count replaces
 * them, because "3" versus "2" is the first thing that goes wrong with a
 * pasted token.
 */

interface TokenInputProps {
  token: string
  onChange: (token: string) => void
  onClear: () => void
  onFile: (file: File) => void
  isProcessing: boolean
  samples: ReadonlyArray<{ key: string; label: string; value: string }>
  onSample: (value: string) => void
}

export function TokenInput({
  token,
  onChange,
  onClear,
  onFile,
  isProcessing,
  samples,
  onSample
}: TokenInputProps) {
  const t = useTranslations("JwtDecoderPage.Input")
  const fileInput = useRef<HTMLInputElement>(null)

  const segments = token.trim() ? token.trim().split(".").length : 0

  return (
    <ToolCard
      tone="muted"
      title={t("title")}
      actions={
        <>
          <input
            ref={fileInput}
            type="file"
            accept=".txt,.json,text/plain,application/json"
            className="sr-only"
            onChange={(event) => {
              const picked = event.target.files?.[0]
              if (picked) onFile(picked)
              // Reset, so choosing the SAME file twice fires `change` again.
              event.target.value = ""
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                {t("sample")}
                <ChevronDown aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {samples.map((sample) => (
                <DropdownMenuItem
                  key={sample.key}
                  onClick={() => onSample(sample.value)}
                >
                  {sample.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isProcessing}
            onClick={() => fileInput.current?.click()}
            aria-label={t("upload")}
            title={t("upload")}
          >
            <Upload aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!token}
            onClick={onClear}
            aria-label={t("clear")}
            title={t("clear")}
          >
            <X aria-hidden="true" />
          </Button>
        </>
      }
      bodyClassName="space-y-3 p-5"
    >
      <textarea
        value={token}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("placeholder")}
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        rows={5}
        aria-label={t("title")}
        className="w-full resize-y break-all rounded-lg border border-border bg-input p-3 font-mono text-foreground text-sm outline-none transition-colors focus:border-ring"
      />
      <p className="flex flex-wrap gap-x-4 text-muted-foreground text-xs">
        <span>
          {t("characters")}{" "}
          <span className="font-mono text-foreground tabular-nums">
            {token.length}
          </span>
        </span>
        <span>
          {t("segments")}{" "}
          <span className="font-mono text-foreground tabular-nums">
            {segments}
          </span>
        </span>
      </p>
    </ToolCard>
  )
}
