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

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import { Textarea } from "@webiston/ui/primitives/textarea"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { QrPreview, StylePanel, WifiFields } from "./components"
import { useQrGenerator } from "./hooks/useQrGenerator"
import type { QrInputMode } from "./stores/qrDraftStore"

const QrGenerator = () => {
  const t = useTranslations("QrGeneratorPage")
  const {
    value,
    setValue,
    mode,
    setMode,
    wifi,
    updateWifi,
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

      {/* Three cells, placed explicitly, because the reading order differs
          per breakpoint. Stacked on a phone it has to be input → CODE →
          controls: measured before this, the code sat at y=1805 on a 375x812
          screen — 2.2 screens below the input — because the whole style panel
          came first. Side by side it is input over controls on the left, with
          the code holding the right column across both rows. */}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="lg:col-start-1 lg:row-start-1">
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
            <div className="space-y-4 p-5">
              {/* Two modes, not five. URL, text, phone and SMS all live
                  happily in the free box; WiFi is the one format nobody can
                  hand-write (reserved-character escaping), so it alone earns
                  fields. The old five-tab strip that changed only a caption
                  is exactly what this is not. */}
              <SegmentedControl<QrInputMode>
                label={t("InputPanel.mode.label")}
                value={mode}
                onChange={setMode}
                options={[
                  { value: "text", label: t("InputPanel.mode.text") },
                  { value: "wifi", label: t("InputPanel.mode.wifi") }
                ]}
              />
              {mode === "text" ? (
                <Textarea
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder={t("InputPanel.placeholder")}
                  aria-label={t("InputPanel.title")}
                  rows={4}
                  className="resize-y font-mono text-sm"
                />
              ) : (
                <WifiFields wifi={wifi} onChange={updateWifi} />
              )}
            </div>
          </div>
        </div>

        {/* `self-stretch` is what makes the sticky card inside actually stick:
            `items-start` collapses this cell to its content height, and an
            element with no travel in its container never moves. */}
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-stretch">
          <QrPreview
            document={document}
            scan={scan}
            isExporting={isExporting}
            exportError={exportError}
            onDownload={download}
          />
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <StylePanel style={style} onChange={updateStyle} />
        </div>
      </div>
    </div>
  )
}

export default QrGenerator
export { QrGenerator }
