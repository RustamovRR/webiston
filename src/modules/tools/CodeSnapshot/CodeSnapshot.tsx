"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import { Check, Copy, Download, Link2, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback, useMemo, useState } from "react"

import { ToolCard } from "@/components/shared/ToolCard"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { SnapshotEditor, StylePanel } from "./components"
import {
  type CodeFontId,
  EXPORT_FORMATS,
  EXPORT_SCALES,
  type ExportFormatId,
  POPULAR_LANGUAGES,
  THEME_PALETTES
} from "./constants"
import { useCodeSnapshot } from "./hooks/useCodeSnapshot"
import { ALL_LANGUAGES } from "./utils/highlight"

/**
 * Code Snapshot — paste code, get a picture of it.
 *
 * ONE surface. The picture on the right is also the editor — you type into
 * the thing you are making, which is what carbon.now.sh, codeimage.dev, ray.so
 * and snappify all do. The left column is controls only; it used to hold a
 * plain textarea that nobody looked at after their first paste, and that split
 * existed for no better reason than a canvas being hard to type into.
 *
 * Fonts arrive as a prop rather than being imported here. `next/font` has to be
 * called from a module the route owns so its `@font-face` rules are scoped to
 * this route; loading them from a component that other pages might one day
 * import is how a tool-local font quietly becomes a site-wide download.
 */

interface CodeSnapshotProps {
  /** `id -> CSS font-family`, supplied by the route that loaded the faces. */
  fontFamilies: Record<CodeFontId, string>
}

const CodeSnapshot = ({ fontFamilies }: CodeSnapshotProps) => {
  const t = useTranslations("CodeSnapshotPage")
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  /** The zoom the preview settled on; 1 unless the picture had to shrink. */
  const [fit, setFit] = useState(1)
  const handleFitChange = useCallback((next: number) => setFit(next), [])

  const {
    code,
    setCode,
    language,
    setLanguage,
    font,
    setFont,
    theme,
    setTheme,
    options,
    updateOptions,
    applyPreset,
    toggleLineFocus,
    clearLineFocus,
    scale,
    setScale,
    exportFormat,
    setExportFormat,
    canvasRef,
    ghostRef,
    layout,
    foreground,
    effectiveScale,
    error,
    download,
    copy,
    format,
    formatting,
    formattable,
    onPaste,
    detected,
    undoDetection,
    dropFile,
    copyLink,
    reset
  } = useCodeSnapshot(fontFamilies)

  const languages = useMemo(() => {
    const popular = POPULAR_LANGUAGES.map((id) =>
      ALL_LANGUAGES.find((lang) => lang.id === id)
    ).filter((lang) => lang !== undefined)
    const rest = ALL_LANGUAGES.filter(
      (lang) => !POPULAR_LANGUAGES.includes(lang.id)
    )
    return [...popular, ...rest]
  }, [])

  /**
   * A blocked clipboard falls back to a download.
   *
   * Both calls report rather than throw. The first version awaited a promise
   * React never handled, so on an oversized canvas the button did nothing at
   * all and the only trace was an unhandled rejection in the console — the
   * exact case this fallback exists for.
   */
  const handleCopyLink = async () => {
    if (!(await copyLink())) return
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 1600)
  }

  const handleCopy = async () => {
    if (await copy()) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
      return
    }
    await download()
  }

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      {/* `items-start` so the two columns size to their own content instead of
          the taller one, and `lg:self-stretch` on the right cell to give the
          sticky card inside it somewhere to travel — a sticky element in a
          cell collapsed to its content height never moves. Both halves of that
          pairing are load-bearing; `QrGenerator.tsx:122` learned the same
          thing. */}
      {/* `min-w-0` on BOTH cells, not just the wide one. A grid item's
          automatic minimum size is its min-content width, and the picture is
          as wide as the code — so below `lg`, where the track is `auto`, a
          long line pushed the whole page sideways. Measured on a 375px
          viewport: document scrollWidth 655 → 428 from this alone. */}
      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <ToolCard
            title={t("style.title")}
            tone="muted"
            actions={
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                aria-label={t("actions.reset")}
              >
                <RotateCcw className="size-4" />
              </Button>
            }
          >
            <StylePanel
              options={options}
              onChange={updateOptions}
              font={font}
              onFontChange={setFont}
              themes={THEME_PALETTES}
              theme={theme}
              onThemeChange={setTheme}
              languages={languages}
              language={language}
              onLanguageChange={setLanguage}
              onFormat={() => void format()}
              formattable={formattable}
              formatting={formatting}
              detected={detected}
              onUndoDetection={undoDetection}
              onClearFocus={clearLineFocus}
              onApplyPreset={applyPreset}
            />
          </ToolCard>
        </div>

        <div className="min-w-0 lg:self-stretch">
          <ToolCard
            className="lg:sticky lg:top-20"
            title={t("preview.title")}
            tone="primary"
            actions={
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied ? t("actions.copied") : t("actions.copy")}
                </Button>
                <Button size="sm" onClick={() => void download()}>
                  <Download className="size-4" />
                  {t("actions.download")}
                </Button>
              </div>
            }
          >
            <SnapshotEditor
              canvasRef={canvasRef}
              layout={layout}
              code={code}
              onCodeChange={setCode}
              fontFamily={fontFamilies[font]}
              fontSize={options.fontSize}
              caretColor={foreground}
              label={t("input.label")}
              onPaste={onPaste}
              onDropFile={(file) => void dropFile(file)}
              dropHint={t("input.dropHint")}
              focusLines={options.focusLines}
              onToggleLineFocus={toggleLineFocus}
              focusLabel={(number) => t("input.focusLine", { number })}
              ghostRef={ghostRef}
              onFitChange={handleFitChange}
            />
            {/* The scale lives here, beside the pixel size it produces —
                not in the card header. Two reasons, one of them measured: a
                third control in ToolCard's `shrink-0` actions row cannot wrap,
                so it held the page 53px wider than a 375px viewport; and the
                readout under it is literally the answer to the question the
                control asks. */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <SegmentedControl
                  label={t("preview.scaleLabel")}
                  value={String(scale)}
                  onChange={(value) =>
                    setScale(Number(value) as (typeof EXPORT_SCALES)[number])
                  }
                  options={EXPORT_SCALES.map((value) => ({
                    value: String(value),
                    label: `${value}x`
                  }))}
                />
                {/* PNG or WebP, for the DOWNLOAD only — the clipboard takes
                  PNG and nothing else in any engine. Measured on a real
                  1674×2624 export: PNG 2,295,644 bytes against WebP's
                  244,422, with 0.05% of pixels differing by at most 4/255.
                  See `constants/index.ts` for the whole table, including why
                  JPEG and AVIF are absent. */}
                <SegmentedControl
                  label={t("preview.formatLabel")}
                  value={exportFormat}
                  onChange={(value) => setExportFormat(value as ExportFormatId)}
                  options={EXPORT_FORMATS.map((format) => ({
                    value: format.id,
                    label: format.id.toUpperCase()
                  }))}
                />
                {/* Sharing lives beside the scale, not in the card header:
                  ToolCard's actions row cannot wrap, and a third button there
                  is what pushed the page 53px past a 375px viewport before. */}
                <Button variant="ghost" size="sm" onClick={handleCopyLink}>
                  {linkCopied ? (
                    <Check className="size-4" />
                  ) : (
                    <Link2 className="size-4" />
                  )}
                  {linkCopied ? t("actions.linkCopied") : t("actions.copyLink")}
                </Button>
              </div>
              {/* Only when it is NOT 1:1. Saying "100%" on every picture is
                  noise; saying "48%" explains why the text looks small and
                  reassures that the FILE is full size. */}
              {fit < 0.999 && (
                <p className="text-muted-foreground text-xs">
                  {t("preview.zoom", { percent: Math.round(fit * 100) })}
                </p>
              )}
              {exportFormat === "webp" && (
                <p className="text-muted-foreground text-xs">
                  {t("preview.formatNote")}
                </p>
              )}
              {layout && effectiveScale !== null && (
                <p className="text-muted-foreground text-xs">
                  {t("preview.dimensions", {
                    width: Math.round(layout.width * effectiveScale),
                    height: Math.round(layout.height * effectiveScale)
                  })}
                </p>
              )}
            </div>

            <div className="mt-2 space-y-1">
              {/* The chosen scale is not always the one used: past the
                  browser's canvas cap the export is silently blank, so it is
                  stepped down — and saying so is the difference between a
                  smaller file and an inexplicable one. */}
              {effectiveScale !== null && effectiveScale !== scale && (
                <p className="text-muted-foreground text-xs">
                  {t("preview.scaleReduced", {
                    wanted: scale,
                    used: effectiveScale
                  })}
                </p>
              )}
              {error && (
                <p role="alert" className="text-destructive text-xs">
                  {t(`errors.${error}`)}
                </p>
              )}
            </div>
          </ToolCard>
        </div>
      </div>
    </div>
  )
}

export default CodeSnapshot
export { CodeSnapshot }
