"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { ControlBar } from "./components/ControlBar"
import { InspectField } from "./components/InspectField"
import { UuidList } from "./components/UuidList"
import { VERSION_META } from "./constants"
import { useUuidGenerator } from "./hooks/useUuidGenerator"

/**
 * UUID generator and inspector.
 *
 * Same shape as the hash generator: a toolbar, the answer, then the field
 * where you check a value you already have. Two weights, not five cards of
 * equal size — the values are what the visitor came for and the rest supports
 * them.
 */
const UuidGenerator = () => {
  const t = useTranslations("UuidGeneratorPage")
  const tResults = useTranslations("UuidGeneratorPage.results")
  const {
    count,
    version,
    format,
    textCase,
    formatted,
    asText,
    stats,
    inspectInput,
    verdict,
    setCount,
    setVersion,
    setFormat,
    setTextCase,
    setInspectInput,
    generate,
    clear,
    download
  } = useUuidGenerator()

  /**
   * The suite's two keys, scoped by a containment check so an Escape pressed
   * inside a portalled dropdown cannot wipe the panel behind it.
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!event.currentTarget.contains(event.target as Node)) return

    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      if (!asText) return
      event.preventDefault()
      void navigator.clipboard.writeText(asText).catch(() => {})
      return
    }
    if (event.key === "Escape" && (formatted.length > 0 || inspectInput)) {
      event.preventDefault()
      clear()
    }
  }

  return (
    // The key handler sits on the page wrapper, as in every other tool here:
    // it is a page-level shortcut rather than a control, and every interactive
    // element inside it is focusable in its own right.
    <div
      className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8"
      onKeyDown={handleKeyDown}
    >
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      <ControlBar
        version={version}
        onVersionChange={setVersion}
        format={format}
        onFormatChange={setFormat}
        textCase={textCase}
        onTextCaseChange={setTextCase}
        count={count}
        onCountChange={setCount}
        onGenerate={generate}
        onClear={clear}
        canExport={formatted.length > 0}
        onDownload={download}
      />

      {/* Two columns from `lg`, because both halves of the job are small: a
          36-character value does not need 1,536 pixels, and stacking them put
          the inspector below a list the visitor has to scroll past to reach
          it. The list caps its own height, so the columns stay level. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ToolCard
          className="lg:col-span-8"
          title={t(`controls.versions.${version}`)}
          actions={
            formatted.length > 0 ? (
              <>
                {/* Only for a batch. "1 value · 1 unique" is arithmetic
                    nobody needed; at 1000 it is the proof that the CSPRNG
                    behaved. */}
                {stats.total > 1 && (
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {tResults("count", {
                      total: stats.total,
                      unique: stats.unique
                    })}
                  </span>
                )}
                <CopyButton
                  text={asText}
                  variant="outline"
                  label={tResults("copyAll")}
                />
              </>
            ) : undefined
          }
        >
          {formatted.length > 0 ? (
            <UuidList values={formatted} />
          ) : (
            <p className="py-10 text-center text-muted-foreground text-sm">
              {tResults("empty")}
            </p>
          )}

          {/* One line, and only where it changes a decision: the versions with
              a clock in them are guessable from a value you have already seen,
              which is what makes them unusable as a token. */}
          {VERSION_META[version].predictable && version !== "nil" && (
            <p className="mt-4 text-muted-foreground text-xs leading-relaxed">
              {tResults("predictable")}
            </p>
          )}
        </ToolCard>

        <InspectField
          className="lg:col-span-4"
          value={inspectInput}
          onChange={setInspectInput}
          verdict={verdict}
        />
      </div>
    </div>
  )
}

export default UuidGenerator
export { UuidGenerator }
