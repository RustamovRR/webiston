"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import { Check, Copy, Download, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"

import { ToolCard } from "@/components/shared/ToolCard"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { SnapshotEditor, StylePanel } from "./components"
import {
  type CodeFontId,
  DEFAULT_FONT,
  EXPORT_SCALES,
  FEATURED_THEMES
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

/** Popular grammars first; the rest of the 360 follow alphabetically. */
const POPULAR = [
  "typescript",
  "javascript",
  "tsx",
  "jsx",
  "python",
  "rust",
  "go",
  "java",
  "csharp",
  "php",
  "ruby",
  "sql",
  "html",
  "css",
  "json",
  "yaml",
  "bash",
  "markdown"
]

const CodeSnapshot = ({ fontFamilies }: CodeSnapshotProps) => {
  const t = useTranslations("CodeSnapshotPage")
  const [font, setFont] = useState<CodeFontId>(DEFAULT_FONT)
  const [copied, setCopied] = useState(false)

  const {
    code,
    setCode,
    language,
    setLanguage,
    theme,
    setTheme,
    options,
    updateOptions,
    scale,
    setScale,
    canvasRef,
    layout,
    foreground,
    effectiveScale,
    error,
    download,
    copy,
    reset
  } = useCodeSnapshot(fontFamilies[font])

  const languages = useMemo(() => {
    const popular = POPULAR.map((id) =>
      ALL_LANGUAGES.find((lang) => lang.id === id)
    ).filter((lang) => lang !== undefined)
    const rest = ALL_LANGUAGES.filter((lang) => !POPULAR.includes(lang.id))
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
      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
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
              themes={FEATURED_THEMES}
              theme={theme}
              onThemeChange={setTheme}
              languages={languages}
              language={language}
              onLanguageChange={setLanguage}
            />
          </ToolCard>
        </div>

        <div className="lg:self-stretch">
          <ToolCard
            className="lg:sticky lg:top-20"
            title={t("preview.title")}
            tone="primary"
            actions={
              <div className="flex flex-wrap items-center justify-end gap-2">
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
            />
            <div className="mt-2 space-y-1">
              {layout && effectiveScale !== null && (
                <p className="text-muted-foreground text-xs">
                  {t("preview.dimensions", {
                    width: Math.round(layout.width * effectiveScale),
                    height: Math.round(layout.height * effectiveScale)
                  })}
                </p>
              )}
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
