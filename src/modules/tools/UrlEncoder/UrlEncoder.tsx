"use client"

import { ArrowLeftRight, Link2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { DropZone } from "@/components/shared/DropZone"
import { DualTextPanel } from "@/components/shared/DualTextPanel"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { ControlBar } from "./components/ControlBar"
import { UrlBreakdown } from "./components/UrlBreakdown"
import { useUrlEncoder } from "./hooks/useUrlEncoder"

/**
 * URL encoder and decoder.
 *
 * Same shape as latin-cyrillic and the Base64 converter, because it is the
 * same kind of tool: a toolbar, then one `DualTextPanel`. The breakdown sits
 * under it and appears only when the text really parses as a URL.
 */
const UrlEncoder = () => {
  const t = useTranslations("UrlEncoderPage")
  const {
    input,
    setInput,
    mode,
    setMode,
    scope,
    setScope,
    isProcessing,
    result,
    breakdown,
    fileError,
    samples,
    loadSample,
    switchMode,
    clear,
    readFile,
    download,
    canDownload
  } = useUrlEncoder()

  const isEncoding = mode === "encode"

  /**
   * The suite's two keys, scoped by a containment check so an Escape pressed
   * inside the portalled sample dropdown cannot wipe the visitor's input.
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!event.currentTarget.contains(event.target as Node)) return

    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      if (!result.output) return
      event.preventDefault()
      void navigator.clipboard.writeText(result.output).catch(() => {})
      return
    }
    if (event.key === "Escape" && input) {
      event.preventDefault()
      clear()
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: a bubbling key
    // handler scoped to the tool, not an interactive element of its own
    <div
      className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8"
      onKeyDown={handleKeyDown}
    >
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      <ControlBar
        mode={mode}
        onModeChange={setMode}
        scope={scope}
        onScopeChange={setScope}
        isProcessing={isProcessing}
        onFile={readFile}
        samples={samples}
        onSample={loadSample}
        onClear={clear}
        canDownload={canDownload}
        onDownload={download}
      />

      {fileError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive text-sm"
        >
          {fileError}
        </p>
      )}

      <DropZone
        onFile={readFile}
        label={t("file.dropHere")}
        hint={t("file.accepts")}
      >
        <div className="space-y-6">
          <DualTextPanel
            sourceText={input}
            convertedText={result.output}
            sourcePlaceholder={
              isEncoding
                ? t("Panel.encodePlaceholder")
                : t("Panel.decodePlaceholder")
            }
            sourceLabel={
              isEncoding ? t("Panel.plainInput") : t("Panel.encodedInput")
            }
            targetLabel={
              isEncoding ? t("Panel.encodedResult") : t("Panel.decodedResult")
            }
            onSourceChange={setInput}
            onSwap={switchMode}
            onClear={clear}
            swapIcon={<ArrowLeftRight size={20} />}
            swapButtonTitle={t("Panel.switchMode")}
            showSwapButton={true}
            showShadow={true}
            isProcessing={isProcessing}
            error={result.error}
            targetEmptyState={
              <div className="flex h-full items-center justify-center p-8 text-center">
                <div className="text-muted-foreground">
                  <Link2
                    size={44}
                    className="mx-auto opacity-40"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm">
                    {isEncoding
                      ? t("Panel.encodedWillAppear")
                      : t("Panel.decodedWillAppear")}
                  </p>
                  <p className="mt-1 text-xs opacity-75">
                    {t("Panel.enterUrlOrUpload")}
                  </p>
                </div>
              </div>
            }
            targetFooterComponent={
              result.output ? (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
                  <span>
                    {t("Panel.inputLength")}{" "}
                    <span className="font-mono text-foreground tabular-nums">
                      {input.length}
                    </span>
                  </span>
                  <span>
                    {t("Panel.outputLength")}{" "}
                    <span className="font-mono text-foreground tabular-nums">
                      {result.output.length}
                    </span>
                  </span>
                </div>
              ) : null
            }
          />

          {/* Only when the text really parses as a URL — the tool never
              guesses that something is one. */}
          {breakdown && (
            <UrlBreakdown
              protocol={breakdown.protocol}
              hostname={breakdown.hostname}
              pathname={breakdown.pathname}
              hash={breakdown.hash}
              query={breakdown.query}
            />
          )}
        </div>
      </DropZone>
    </div>
  )
}

export default UrlEncoder
export { UrlEncoder }
