"use client"

import { Button } from "@webiston/ui/primitives/button"
import { AlertTriangle, Download, QrCode } from "lucide-react"
import { useTranslations } from "next-intl"

import type { QrDownloadFormat } from "../types"
import type { ScanVerdict } from "../utils/contrast"
import type { QrDocument } from "../utils/render"

/**
 * The code, and everything you do with it.
 *
 * Rendered as real SVG elements from the same model the exporter serialises,
 * so the preview and the downloaded file are the same picture by construction.
 * Sticky, and on the first screen: measured on the version this replaces, the
 * code sat at y=1671 in a 720px viewport — 2.3 screens below the fold.
 */

interface QrPreviewProps {
  document: QrDocument | null
  scan: ScanVerdict
  isExporting: boolean
  exportError: boolean
  onDownload: (format: QrDownloadFormat) => void
}

const FORMATS: readonly QrDownloadFormat[] = ["svg", "png", "webp"]

function QrArtwork({ doc, title }: { doc: QrDocument; title: string }) {
  const { model, frame, layout, label } = doc

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width={layout.width}
      height={layout.height}
      className="h-auto w-full max-w-[320px]"
      role="img"
      // The caption is NOT the name of this image. `frameLabel` defaults to
      // "SCAN ME" and keeps its value when the frame is switched off, so a
      // screen reader announced "SCAN ME" for a code that showed no caption
      // at all.
      aria-label={title}
    >
      {model.gradient && (
        <defs>
          {model.gradient.type === "radial" ? (
            <radialGradient id={model.gradient.id}>
              <stop offset="0" stopColor={model.gradient.from} />
              <stop offset="1" stopColor={model.gradient.to} />
            </radialGradient>
          ) : (
            <linearGradient id={model.gradient.id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={model.gradient.from} />
              <stop offset="1" stopColor={model.gradient.to} />
            </linearGradient>
          )}
        </defs>
      )}

      {layout.surface && (
        <rect
          x={0}
          y={0}
          width={layout.width}
          height={layout.height}
          rx={frame.radius * model.extent}
          fill={doc.surfaceFill}
          stroke={frame.surface === "outline" ? doc.accent : undefined}
          strokeWidth={
            frame.surface === "outline" ? model.extent * 0.012 : undefined
          }
        />
      )}

      <g transform={`translate(${layout.qrX},${layout.qrY})`}>
        <rect
          width={model.extent}
          height={model.extent}
          rx={model.background.radius}
          fill={model.background.fill}
        />
        {/* Every data module in ONE path: a 57x57 code is 3,000 modules, and
            three thousand DOM nodes re-created on each keystroke is the
            difference between instant and janky. */}
        <path d={model.dataPath} fill={model.ink} />
        {model.eyeFrames.map((d) => (
          <path key={d} d={d} fill={model.ink} fillRule="evenodd" />
        ))}
        {model.eyeBalls.map((d) => (
          <path key={d} d={d} fill={model.ink} />
        ))}
        {model.logo && (
          <image
            href={model.logo.href}
            x={model.logo.x}
            y={model.logo.y}
            width={model.logo.size}
            height={model.logo.size}
            preserveAspectRatio="xMidYMid meet"
          />
        )}
      </g>

      {layout.label && (
        <>
          {frame.labelOnAccent && (
            <rect
              x={layout.label.x}
              y={layout.label.y}
              width={layout.label.width}
              height={layout.label.height}
              fill={doc.accent}
            />
          )}
          <text
            x={layout.width / 2}
            y={layout.label.y + layout.label.height / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="system-ui, sans-serif"
            fontWeight={700}
            fontSize={layout.label.height * 0.46}
            letterSpacing={layout.label.height * 0.06}
            fill={frame.labelOnAccent ? doc.onAccent : doc.accent}
          >
            {label}
          </text>
        </>
      )}

      {layout.brackets && (
        <path
          d={layout.brackets}
          fill="none"
          stroke={doc.accent}
          strokeWidth={model.extent * 0.02}
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

export function QrPreview({
  document,
  scan,
  isExporting,
  exportError,
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
          {document && (
            <span className="ml-auto font-mono text-[11px] text-muted-foreground tabular-nums">
              {t("modules", { count: document.model.moduleCount })}
            </span>
          )}
        </div>

        <div className="flex min-h-[380px] items-center justify-center p-6">
          {document ? (
            <QrArtwork doc={document} title={t("title")} />
          ) : (
            <div className="flex flex-col items-center text-muted-foreground">
              <QrCode size={44} className="opacity-40" aria-hidden="true" />
              <p className="mt-3 text-sm">{t("empty")}</p>
            </div>
          )}
        </div>

        {/* The warning every competitor shows and we did not. A reader
            thresholds the image: pale colours and inverted pairs produce a code
            that looks fine on screen and fails on a printed poster. */}
        {document && scan.risk !== "ok" && (
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
              {/* Two messages, not one: "might fail in poor light" and "expect
                  it to fail" are different pieces of advice, and telling a
                  visitor the second when you mean the first teaches them to
                  ignore the warning. */}
              {scan.risk === "inverted"
                ? t("inverted")
                : scan.severe
                  ? t("lowContrastSevere", { ratio: scan.ratio })
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
              // SVG first and filled: it is the only format that survives being
              // printed at any size, and it was the format we did not have.
              variant={format === "svg" ? "default" : "outline"}
              disabled={!document || isExporting}
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

        {exportError && (
          <p role="alert" className="px-5 pb-4 text-destructive text-xs">
            {t("exportFailed")}
          </p>
        )}
      </div>
    </div>
  )
}
