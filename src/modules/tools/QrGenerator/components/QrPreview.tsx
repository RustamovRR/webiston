"use client"

import { Button } from "@webiston/ui/primitives/button"
import { cn } from "@webiston/ui/utils"
import { AlertTriangle, Download, QrCode } from "lucide-react"
import { useTranslations } from "next-intl"

import type { QrDownloadFormat } from "../types"
import type { ScanVerdict } from "../utils/contrast"

/**
 * The code, and everything you do with it.
 *
 * Sticky, and on the first screen. Measured on the version this replaces: the
 * QR image sat at y=1671 in a 720px viewport — 2.3 screens below the fold, so
 * a visitor whose entire goal was "see a QR code" had to scroll past every
 * configuration control to find one. The controls now scroll; the answer does
 * not move.
 */

interface QrPreviewProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  hasCode: boolean
  scan: ScanVerdict
  isExporting: boolean
  onDownload: (format: QrDownloadFormat) => void
}

const FORMATS: readonly QrDownloadFormat[] = ["svg", "png", "webp"]

export function QrPreview({
  containerRef,
  hasCode,
  scan,
  isExporting,
  onDownload
}: QrPreviewProps) {
  const t = useTranslations("QrGeneratorPage.preview")

  return (
    <div className="lg:sticky lg:top-20">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2.5 border-border border-b px-5 py-3">
          <span
            aria-hidden="true"
            className="size-[6px] shrink-0 rounded-[2px] bg-primary"
          />
          <h2 className="font-medium text-base text-foreground">
            {t("title")}
          </h2>
        </div>

        <div className="flex min-h-[380px] items-center justify-center p-6">
          {/* The renderer appends its SVG here. Kept mounted even when empty
              so the node exists before the first draw — appending on demand
              made the first code arrive one frame late, as a visible pop. */}
          <div
            ref={containerRef}
            className={cn(
              "transition-opacity duration-200",
              hasCode ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={!hasCode}
          />

          {!hasCode && (
            <div className="absolute flex flex-col items-center text-muted-foreground">
              <QrCode size={44} className="opacity-40" aria-hidden="true" />
              <p className="mt-3 text-sm">{t("empty")}</p>
            </div>
          )}
        </div>

        {/* The warning every competitor shows and we did not. A QR reader is a
            thresholding algorithm: pale colours and inverted pairs produce a
            code that looks fine on screen and fails on a printed poster. */}
        {hasCode && scan.risk !== "ok" && (
          <p
            role="status"
            className="flex items-start gap-2 border-border border-t bg-destructive/10 px-5 py-3 text-destructive text-xs leading-relaxed"
          >
            <AlertTriangle
              size={14}
              className="mt-px shrink-0"
              aria-hidden="true"
            />
            <span>
              {scan.risk === "inverted"
                ? t("inverted")
                : t("lowContrast", { ratio: scan.ratio })}
            </span>
          </p>
        )}

        <div className="flex flex-wrap gap-2 border-border border-t bg-muted/30 px-5 py-4">
          {FORMATS.map((format) => (
            <Button
              key={format}
              type="button"
              size="sm"
              // SVG first and filled: it is the format that was missing, and
              // the only one that survives being printed at any size.
              variant={format === "svg" ? "default" : "outline"}
              disabled={!hasCode || isExporting}
              onClick={() => onDownload(format)}
            >
              <Download aria-hidden="true" />
              {format.toUpperCase()}
            </Button>
          ))}
          <span className="ml-auto self-center font-mono text-[11px] text-muted-foreground">
            {t("vectorHint")}
          </span>
        </div>
      </div>
    </div>
  )
}
