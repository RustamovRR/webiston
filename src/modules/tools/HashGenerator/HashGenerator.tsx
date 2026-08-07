"use client"

import { Fingerprint, Info } from "lucide-react"
import { useTranslations } from "next-intl"

import { DropZone } from "@/components/shared/DropZone"
import { DualTextPanel } from "@/components/shared/DualTextPanel"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { ControlBar } from "./components/ControlBar"
import { DigestList } from "./components/DigestList"
import { FileCard } from "./components/FileCard"
import { VerifyField } from "./components/VerifyField"
import { useHashGenerator } from "./hooks/useHashGenerator"

/**
 * Hash generator and checksum verifier.
 *
 * Same shape as latin-cyrillic, the Base64 converter and the URL encoder: a
 * toolbar, then one `DualTextPanel`. The right-hand panel holds one row per
 * algorithm instead of a block of text, because this tool is one input and
 * five answers.
 */
const HashGenerator = () => {
  const t = useTranslations("HashGeneratorPage")
  const {
    text,
    setText,
    file,
    clearFile,
    format,
    setFormat,
    expected,
    setExpected,
    hmacEnabled,
    setHmacEnabled,
    hmacKey,
    setHmacKey,
    outputs,
    byteCount,
    needsHmacKey,
    isHashing,
    isReading,
    verdict,
    fileError,
    samples,
    loadSample,
    readFile,
    clear,
    asText,
    download,
    canDownload
  } = useHashGenerator()

  /**
   * The suite's two keys, scoped by a containment check so an Escape pressed
   * inside the portalled sample dropdown cannot wipe the visitor's input.
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!event.currentTarget.contains(event.target as Node)) return

    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      if (!asText) return
      event.preventDefault()
      void navigator.clipboard.writeText(asText).catch(() => {})
      return
    }
    if (event.key === "Escape" && (text || file)) {
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
        hmacEnabled={hmacEnabled}
        onHmacEnabledChange={setHmacEnabled}
        hmacKey={hmacKey}
        onHmacKeyChange={setHmacKey}
        format={format}
        onFormatChange={setFormat}
        isBusy={isReading}
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
            sourceText={text}
            convertedText={asText}
            sourcePlaceholder={t("panel.placeholder")}
            sourceLabel={file ? t("panel.fileSource") : t("panel.textSource")}
            targetLabel={
              hmacEnabled ? t("panel.hmacResults") : t("panel.results")
            }
            onSourceChange={setText}
            onClear={clear}
            showSwapButton={false}
            showShadow={true}
            /* Reading a file only. `DualTextPanel` disables its textarea while
               processing, and text hashing finishes in well under a
               millisecond — wiring it in here took focus away on every
               character typed and flashed "processing" in the result panel. */
            isProcessing={isReading || (isHashing && file !== null)}
            statusComponent={
              byteCount > 0 ? (
                <span className="text-muted-foreground text-xs tabular-nums">
                  {/* Bytes, not characters. The digest is over bytes, so
                      `Oʻzbekiston` is 12 of them and not the 11 characters
                      `.length` reports. */}
                  {t("panel.bytes", { count: byteCount })}
                </span>
              ) : null
            }
            customSourceContent={
              file ? <FileCard file={file} onRemove={clearFile} /> : undefined
            }
            customTargetContent={
              outputs.length > 0 ? (
                <DigestList
                  outputs={outputs}
                  format={format}
                  matched={verdict?.kind === "match" ? verdict.algorithm : null}
                />
              ) : undefined
            }
            targetEmptyState={
              <div className="flex h-full items-center justify-center p-8 text-center">
                <div className="text-muted-foreground">
                  <Fingerprint
                    size={44}
                    className="mx-auto opacity-40"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm">
                    {needsHmacKey ? t("panel.needsKey") : t("panel.willAppear")}
                  </p>
                  <p className="mt-1 text-xs opacity-75">
                    {needsHmacKey ? t("panel.needsKeyHint") : t("panel.hint")}
                  </p>
                </div>
              </div>
            }
          />

          {/* Web Crypto has no MD5, so there is no HMAC-MD5 row to show. Said
              out loud, because an algorithm silently disappearing from a list
              of five reads as a bug. */}
          {hmacEnabled && (
            <p className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-muted-foreground text-sm">
              <Info size={15} aria-hidden="true" className="shrink-0" />
              {t("panel.noHmacMd5")}
            </p>
          )}

          <VerifyField
            value={expected}
            onChange={setExpected}
            verdict={verdict}
          />
        </div>
      </DropZone>
    </div>
  )
}

export default HashGenerator
export { HashGenerator }
