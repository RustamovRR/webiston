"use client"

import { Button } from "@webiston/ui/primitives/button"
import { Check, ClipboardPaste, Link2, Sparkles, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback, useState } from "react"

import { ToolCard } from "@/components/shared/ToolCard"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { FormPanel } from "./components/FormPanel"
import { ImportPanel } from "./components/ImportPanel"
import { IssueList } from "./components/IssueList"
import { OutputPanel } from "./components/OutputPanel"
import { RescrapeLinks } from "./components/RescrapeLinks"
import { SocialPreview } from "./components/SocialPreview"
import { useOgMetaGenerator } from "./hooks/useOgMetaGenerator"
import type { MetaDraft } from "./types"
import { encodeDraft } from "./utils/share"

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
  const tImport = useTranslations("OgMetaGeneratorPage.import")
  const tShare = useTranslations("OgMetaGeneratorPage.share")

  const [importing, setImporting] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

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
    applyImport,
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
    // This site's own OG endpoint, not a third-party placeholder service. The
    // header promises the text never leaves the browser; loading the sample
    // from picsum.photos would have made the tool's own demo the one request
    // that contradicts it — and it is 1200×630, so it also demonstrates the
    // image check passing.
    image: "https://webiston.uz/api/og?title=React%20Hooks",
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

  /**
   * The link to this exact form.
   *
   * Built on CLICK, not during render: `window.location.origin` does not exist
   * on the server, so reading it while rendering gives the server and the
   * client two different values — a hydration mismatch by construction. The
   * draft is already mirrored into the address bar, so this only has to add
   * the origin.
   */
  const copyLink = useCallback(() => {
    const link = `${window.location.origin}${window.location.pathname}${encodeDraft(draft)}`
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
      })
      // A refused clipboard write must not claim success — the defect already
      // fixed in the password generator and the UUID tool.
      .catch(() => {})
  }, [draft])

  /**
   * The suite's two keys, scoped by a containment check so an Escape pressed
   * inside a portalled control cannot wipe the form behind it.
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!event.currentTarget.contains(event.target as Node)) return

    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      if (!code) return
      event.preventDefault()
      void navigator.clipboard.writeText(code).catch(() => {})
      return
    }
    // Escape was missing here while every other refactored tool has it.
    if (event.key === "Escape" && hasContent) {
      event.preventDefault()
      clear()
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
        {/* First in the row on purpose: most visits start from a page that
            already has tags, not from an empty form. */}
        <Button
          type="button"
          variant={importing ? "default" : "outline"}
          size="sm"
          aria-expanded={importing}
          onClick={() => setImporting((open) => !open)}
        >
          <ClipboardPaste aria-hidden="true" />
          {tImport("open")}
        </Button>
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
          variant="outline"
          size="sm"
          disabled={!hasContent}
          onClick={copyLink}
        >
          {linkCopied ? (
            <Check aria-hidden="true" className="text-success" />
          ) : (
            <Link2 aria-hidden="true" />
          )}
          {linkCopied ? tShare("copied") : tShare("copy")}
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

      {importing && (
        <ImportPanel
          onImport={applyImport}
          onClose={() => setImporting(false)}
        />
      )}

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
            <div className="space-y-3">
              <IssueList issues={issues} probe={probe} />
              {/* The FAQ answers "why is my change not showing" with
                  "re-scrape it" — these are the actual endpoints, with the
                  visitor's own URL already in them. */}
              <RescrapeLinks url={draft.url} />
            </div>
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
