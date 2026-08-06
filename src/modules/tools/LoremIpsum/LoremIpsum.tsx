"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { ControlBar } from "./components/ControlBar"
import { LoremOutput } from "./components/LoremOutput"
import { useLoremIpsum } from "./hooks/useLoremIpsum"

/**
 * Lorem ipsum generator.
 *
 * One weight, not four: the text is the whole product, so it gets the page.
 * What this replaces put a config card, a stats strip, a two-panel layout
 * whose right half was a stat sheet rendered as text, an info card and a help
 * card on one screen — five things competing with the paragraph the visitor
 * came for.
 */
const LoremIpsum = () => {
  const t = useTranslations("LoremIpsumPage")
  const tOutput = useTranslations("LoremIpsumPage.output")

  const {
    unit,
    amount,
    bank,
    format,
    startWithLorem,
    output,
    stats,
    hasText,
    setUnit,
    setAmount,
    setBank,
    setFormat,
    setStartWithLorem,
    generate,
    clear,
    download
  } = useLoremIpsum()

  /**
   * The suite's two keys, scoped by a containment check so an Escape pressed
   * inside a portalled control cannot wipe the panel behind it.
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!event.currentTarget.contains(event.target as Node)) return

    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      if (!output) return
      event.preventDefault()
      void navigator.clipboard.writeText(output).catch(() => {})
      return
    }
    if (event.key === "Escape" && hasText) {
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

      <ControlBar
        unit={unit}
        onUnitChange={setUnit}
        amount={amount}
        onAmountChange={setAmount}
        bank={bank}
        onBankChange={setBank}
        format={format}
        onFormatChange={setFormat}
        startWithLorem={startWithLorem}
        onStartWithLoremChange={setStartWithLorem}
        onGenerate={generate}
        onClear={clear}
        canExport={hasText}
        onDownload={download}
      />

      {/* Named for what it holds, not for which list produced it: a panel
          titled "Bacon" says nothing about the region it labels, and the bank
          is already visible in the toolbar above. */}
      <ToolCard
        title={tOutput("title")}
        actions={
          hasText ? (
            <>
              {/* Three measured facts, not a stat sheet in a panel of its
                  own. Bytes are shown because the byte mode makes the number
                  the point. */}
              <span className="text-muted-foreground text-xs tabular-nums">
                {tOutput("stats", {
                  words: stats.words,
                  characters: stats.characters,
                  bytes: stats.bytes
                })}
              </span>
              <CopyButton
                text={output}
                variant="outline"
                label={tOutput("copy")}
              />
            </>
          ) : undefined
        }
      >
        <LoremOutput text={output} format={format} />
      </ToolCard>
    </div>
  )
}

export default LoremIpsum
export { LoremIpsum }
