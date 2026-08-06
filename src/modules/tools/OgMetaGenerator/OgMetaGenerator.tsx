"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Sparkles, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback } from "react"

import { ToolCard } from "@/components/shared/ToolCard"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { FormPanel } from "./components/FormPanel"
import { IssueList } from "./components/IssueList"
import { OutputPanel } from "./components/OutputPanel"
import { SocialPreview } from "./components/SocialPreview"
import { useOgMetaGenerator } from "./hooks/useOgMetaGenerator"
import type { MetaDraft } from "./types"

/**
 * Open Graph / Twitter card generator.
 *
 * Three weights: the form you fill, the card as it will look, and the block
 * you paste. What this replaces put six panels of equal size on the page —
 * templates, a validation score, the form, the preview, the output and an
 * info section — with the preview and the output BELOW a 417-line form, so
 * the thing the tool exists to show was off the first screen.
 */
const OgMetaGenerator = () => {
  const t = useTranslations("OgMetaGeneratorPage")
  const tPreview = useTranslations("OgMetaGeneratorPage.preview")
  const tForm = useTranslations("OgMetaGeneratorPage.form")
  const tIssues = useTranslations("OgMetaGeneratorPage.issues")
  const tSample = useTranslations("OgMetaGeneratorPage.sample")

  const {
    draft,
    platform,
    output,
    probe,
    issues,
    code,
    tagCount,
    hasContent,
    setField,
    setPlatform,
    setOutput,
    loadSample,
    clear
  } = useOgMetaGenerator()

  /**
   * One sample, not five templates.
   *
   * The old panel offered "blog", "product", "video", "company" and "event",
   * and every one of them filled the form with this site's own URL, this
   * site's logo and a paragraph of marketing copy about Webiston — so
   * whichever a visitor picked, they got somebody else's page description to
   * edit. A sample exists to show the SHAPE of a filled form; one is enough,
   * and it is visibly an example.
   */
  const sample: MetaDraft = {
    title: tSample("title"),
    description: tSample("description"),
    image: "https://picsum.photos/1200/630",
    imageAlt: tSample("imageAlt"),
    url: "https://example.uz/blog/react-hooks",
    siteName: tSample("siteName"),
    type: "article",
    locale: draft.locale,
    twitterCard: "summary_large_image",
    twitterSite: "@example"
  }

  const download = useCallback(() => {
    const blob = new Blob([`${code}\n`], {
      type:
        output === "next"
          ? "text/plain;charset=utf-8"
          : "text/html;charset=utf-8"
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = output === "next" ? "metadata.ts" : "meta-tags.html"
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [code, output])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!event.currentTarget.contains(event.target as Node)) return
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      if (!code) return
      event.preventDefault()
      void navigator.clipboard.writeText(code).catch(() => {})
    }
  }

  return (
    <div
      className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8"
      onKeyDown={handleKeyDown}
    >
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => loadSample(sample)}
        >
          <Sparkles aria-hidden="true" />
          {tSample("load")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasContent}
          onClick={clear}
        >
          <X aria-hidden="true" />
          {tForm("clear")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ToolCard
          className="lg:col-span-5"
          tone="muted"
          title={tForm("panelTitle")}
        >
          <FormPanel draft={draft} onChange={setField} />
        </ToolCard>

        {/* The preview and the checks stay level with the top of the form, so
            the card the visitor is designing is never below the fold. */}
        <div className="space-y-6 lg:col-span-7">
          <ToolCard title={tPreview("title")}>
            <SocialPreview
              draft={draft}
              platform={platform}
              onPlatformChange={setPlatform}
              probe={probe}
            />
          </ToolCard>

          <ToolCard title={tIssues("title")}>
            <IssueList issues={issues} probe={probe} />
          </ToolCard>

          <OutputPanel
            code={code}
            format={output}
            onFormatChange={setOutput}
            tagCount={tagCount}
            onDownload={download}
          />
        </div>
      </div>
    </div>
  )
}

export default OgMetaGenerator
export { OgMetaGenerator }
