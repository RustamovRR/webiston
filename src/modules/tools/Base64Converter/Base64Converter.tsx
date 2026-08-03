"use client"

import { ArrowLeftRight, FileText } from "lucide-react"
import { useTranslations } from "next-intl"
import { DropZone } from "@/components/shared/DropZone"
import { DualTextPanel } from "@/components/shared/DualTextPanel"
import { ToolHeader } from "@/components/shared/ToolHeader"
import { formatFileSize } from "@/lib/utils"

import { ControlBar } from "./components/ControlBar"
import { useBase64Converter } from "./hooks/useBase64Converter"

/**
 * Base64 encoder and decoder.
 *
 * Same shape as latin-cyrillic, because it is the same kind of tool: a
 * toolbar, then one `DualTextPanel`. Sharing the panel is the point — a
 * converter that invented its own two-column layout would be the fourth
 * variation of a component eight tools already use.
 */

const Base64Converter = () => {
  const t = useTranslations("Base64ConverterPage")
  const {
    input,
    setInput,
    mode,
    setMode,
    urlSafe,
    setUrlSafe,
    isProcessing,
    result,
    fileName,
    fileError,
    switchMode,
    clear,
    loadSample,
    readFile,
    download,
    canDownload,
    acceptedFileTypes,
    samples
  } = useBase64Converter()

  const isEncoding = mode === "encode"

  /**
   * The same two keys every refactored tool answers to. Scoped by a
   * containment check: portalled overlays live outside this DOM but INSIDE the
   * React tree, so without it an Escape pressed in the sample dropdown would
   * clear the visitor's payload — the exact defect found in latin-cyrillic.
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
        urlSafe={urlSafe}
        onUrlSafeChange={setUrlSafe}
        isProcessing={isProcessing}
        acceptedFileTypes={acceptedFileTypes}
        onFile={readFile}
        samples={samples}
        onSample={loadSample}
        onClear={clear}
        canDownload={canDownload}
        onDownload={download}
      />

      {/* A file that could not be read is reported HERE, in the document.
          It used to be three `alert()` calls — a modal that blocks the page to
          say a file was too big, and on /en it said so in Uzbek. */}
      {fileError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive text-sm"
        >
          {fileError}
        </p>
      )}

      {/* Drop a file anywhere on the tool — the same affordance latin-cyrillic
          has, shared at its second consumer. For a converter whose headline
          job is file-to-base64, requiring a button click first is the friction
          that tool already removed. */}
      <DropZone
        onFile={readFile}
        label={t("file.dropHere")}
        hint={isEncoding ? t("file.acceptsEncode") : t("file.acceptsDecode")}
      >
        <DualTextPanel
          sourceText={input}
          convertedText={result.output}
          sourcePlaceholder={
            isEncoding
              ? t("Panel.encodePlaceholder")
              : t("Panel.decodePlaceholder")
          }
          sourceLabel={
            isEncoding ? t("Panel.plainTextInput") : t("Panel.base64TextInput")
          }
          targetLabel={
            isEncoding ? t("Panel.base64Result") : t("Panel.decodedResult")
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
          statusComponent={
            fileName ? (
              <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs">
                <FileText size={12} aria-hidden="true" className="shrink-0" />
                <span className="truncate">{fileName}</span>
              </span>
            ) : null
          }
          targetEmptyState={
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div className="text-muted-foreground">
                <FileText
                  size={44}
                  className="mx-auto opacity-40"
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm">
                  {isEncoding
                    ? t("Panel.encodedBase64WillAppear")
                    : t("Panel.decodedTextWillAppear")}
                </p>
                <p className="mt-1 text-xs opacity-75">
                  {t("Panel.enterTextOrUpload")}
                </p>
              </div>
            </div>
          }
          targetFooterComponent={
            result.output ? (
              // Bytes, not `String.length`. The old footer divided the string
              // length by 1024 and called it KB, so every Cyrillic or Uzbek
              // character was counted as one byte while it costs two.
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
                <span>
                  {t("Panel.sourceSize")}{" "}
                  <span className="font-mono text-foreground tabular-nums">
                    {formatFileSize(result.bytes)}
                  </span>
                </span>
                <span>
                  {t("Panel.resultSize")}{" "}
                  <span className="font-mono text-foreground tabular-nums">
                    {formatFileSize(result.outputBytes)}
                  </span>
                </span>
              </div>
            ) : null
          }
        />
      </DropZone>
    </div>
  )
}

export default Base64Converter
export { Base64Converter }
