"use client"

import { FileWarning, ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"

import { DropZone } from "@/components/shared/DropZone"
import { ToolCard } from "@/components/shared/ToolCard"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { TokenInput } from "./components/TokenInput"
import { TokenParts } from "./components/TokenParts"
import { TokenSummary } from "./components/TokenSummary"
import { useJwtDecoder } from "./hooks/useJwtDecoder"

/**
 * JWT decoder.
 *
 * Two weights, the suite's shape: the token goes in on the left, the VERDICT
 * is pinned on the right, and the three segments sit underneath. The version
 * this replaces was eight components stacked in one column behind a row of
 * four equal info cards, so "is this expired" — the question almost everyone
 * arrives with — carried the same weight as "what is the `typ` claim".
 *
 * Nothing here touches the network, and the page says so: people paste live
 * access tokens into JWT decoders, and a claim of privacy is worth nothing
 * unless it is made where the pasting happens.
 */
const JwtDecoder = () => {
  const t = useTranslations("JwtDecoderPage")
  const {
    token,
    setToken,
    decoded,
    timing,
    unsigned,
    error,
    showSignature,
    setShowSignature,
    isProcessing,
    fileError,
    samples,
    loadSample,
    clear,
    readFile,
    download,
    now
  } = useJwtDecoder()

  /**
   * The suite's clear-on-Escape. Scoped by a containment check: portalled
   * overlays live outside this DOM but inside the React tree, so without it an
   * Escape pressed in the sample dropdown would wipe the visitor's token.
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!event.currentTarget.contains(event.target as Node)) return
    if (event.key === "Escape" && token) {
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

      <DropZone
        onFile={readFile}
        label={t("Input.dropHere")}
        hint={t("Input.accepts")}
      >
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_400px]">
          <div className="lg:col-start-1 lg:row-start-1">
            <TokenInput
              token={token}
              onChange={setToken}
              onClear={clear}
              onFile={readFile}
              isProcessing={isProcessing}
              samples={samples}
              onSample={loadSample}
            />
          </div>

          {/* Second in the DOM, so on a phone the verdict lands immediately
              under the field instead of below three JSON blocks. */}
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-stretch">
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
              {decoded ? (
                <TokenSummary
                  token={decoded}
                  timing={timing}
                  unsigned={unsigned}
                  now={now}
                />
              ) : (
                <ToolCard title={t("Summary.title")} bodyClassName="p-5">
                  <div className="flex min-h-[220px] flex-col items-center justify-center text-center text-muted-foreground">
                    <ShieldCheck
                      size={40}
                      className="opacity-40"
                      aria-hidden="true"
                    />
                    <p className="mt-3 text-sm">{t("Summary.empty")}</p>
                    <p className="mt-1 text-xs opacity-75">
                      {t("Summary.privacy")}
                    </p>
                  </div>
                </ToolCard>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-start-1 lg:row-start-2">
            {(error || fileError) && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive text-sm"
              >
                <FileWarning
                  size={16}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                />
                {fileError || error}
              </p>
            )}

            {decoded && (
              <TokenParts
                token={decoded}
                showSignature={showSignature}
                onToggleSignature={setShowSignature}
                onDownload={download}
              />
            )}
          </div>
        </div>
      </DropZone>
    </div>
  )
}

export default JwtDecoder
export { JwtDecoder }
