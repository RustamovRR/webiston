"use client"

/**
 * QR code generator.
 *
 * Preview-first: the code is the answer, so it holds the right-hand column and
 * stays there while the controls scroll. Measured on the version this
 * replaces, the code itself sat at y=1671 — 2.3 screens below the fold on a
 * 720px screen.
 *
 * The content-type tab strip is deliberately NOT here yet. It used to change
 * one caption and nothing else, so a visitor who pressed "WiFi" got the same
 * empty text box and still had to hand-write `WIFI:T:WPA;S:…;P:…;;`. It comes
 * back with real forms behind it, or not at all.
 */

import { Button } from "@webiston/ui/primitives/button"
import { Textarea } from "@webiston/ui/primitives/textarea"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { QrPreview, StylePanel } from "./components"
import { useQrGenerator } from "./hooks/useQrGenerator"

const QrGenerator = () => {
  const t = useTranslations("QrGeneratorPage")
  const {
    value,
    setValue,
    style,
    updateStyle,
    reset,
    document,
    download,
    isExporting,
    exportError,
    hasCode,
    detectedType,
    scan
  } = useQrGenerator()

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-border border-b px-5 py-3">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="size-[6px] shrink-0 rounded-[2px] bg-border-strong"
                />
                <h2 className="font-medium text-base text-foreground">
                  {t("InputPanel.title")}
                </h2>
              </div>
              {hasCode && (
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {t(`detected.${detectedType}`)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    aria-label={t("ControlPanel.clear")}
                  >
                    <X aria-hidden="true" />
                  </Button>
                </span>
              )}
            </div>
            <div className="p-5">
              <Textarea
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={t("InputPanel.placeholder")}
                aria-label={t("InputPanel.title")}
                rows={4}
                className="resize-y font-mono text-sm"
              />
            </div>
          </div>

          <StylePanel style={style} onChange={updateStyle} />
        </div>

        <QrPreview
          document={document}
          scan={scan}
          isExporting={isExporting}
          exportError={exportError}
          onDownload={download}
        />
      </div>
    </div>
  )
}

export default QrGenerator
export { QrGenerator }
