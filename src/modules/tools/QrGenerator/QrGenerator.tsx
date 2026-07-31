"use client"

/**
 * QR code generator.
 *
 * Preview-first: the code is the answer, so it holds the right-hand column and
 * stays there while the controls scroll. The previous layout put every
 * configuration block above it and left the code itself at y=1671 — measured,
 * on a 720px screen, 2.3 screens below the fold.
 */

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import { Textarea } from "@webiston/ui/primitives/textarea"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { QrPreview, StylePanel } from "./components"
import { CONTENT_TYPES } from "./constants"
import { useQrGenerator } from "./hooks/useQrGenerator"
import type { QrContentType } from "./types"

const QrGenerator = () => {
  const t = useTranslations("QrGeneratorPage")
  const {
    value,
    setValue,
    contentType,
    setContentType,
    style,
    updateStyle,
    reset,
    containerRef,
    download,
    isExporting,
    hasCode,
    detectedType,
    scan
  } = useQrGenerator()

  const contentOptions = CONTENT_TYPES.map((type) => ({
    value: type,
    label: t(`Categories.${type}`)
  }))

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div className="space-y-3">
            <SegmentedControl<QrContentType>
              label={t("ControlPanel.categoryLabel")}
              options={contentOptions}
              value={contentType}
              onChange={setContentType}
            />
            <p className="text-muted-foreground text-sm">
              {t(`Categories.descriptions.${contentType}`)}
            </p>
          </div>

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
          containerRef={containerRef}
          hasCode={hasCode}
          scan={scan}
          isExporting={isExporting}
          onDownload={download}
        />
      </div>
    </div>
  )
}

export default QrGenerator
export { QrGenerator }
