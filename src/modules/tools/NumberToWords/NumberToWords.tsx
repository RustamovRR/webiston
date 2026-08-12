"use client"

import { SegmentedControl } from "@webiston/ui/composites/SegmentedControl"
import { Button } from "@webiston/ui/primitives/button"
import { Input } from "@webiston/ui/primitives/input"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId } from "react"

import { ToolCard } from "@/components/shared/ToolCard"
import { ToolHeader } from "@/components/shared/ToolHeader"

import { WordsCard } from "./components"
import { OUTPUT_MODES, type OutputMode } from "./constants"
import { useNumberToWords } from "./hooks/useNumberToWords"
import { parseAmount } from "./utils/amount"
import { amountToWords, capitalise } from "./utils/words"

/**
 * The example under the empty state — computed by the REAL pipeline, at module
 * scope, so it can never drift from what the tool actually produces. A
 * hand-written sample would have kept saying "ming so'm" after the bir-ming
 * convention changed; this one updated itself.
 */
const SAMPLE_INPUT = "1 250 000,50"
const SAMPLE_WORDS = (() => {
  const parsed = parseAmount(SAMPLE_INPUT)
  if (!parsed.ok) return null
  const words = amountToWords(parsed.amount, "sum")
  return words ? capitalise(words.latin) : null
})()

/**
 * Summani so'z bilan yozish — a sum, spelled out in Uzbek.
 *
 * The job is one line long and it is a legal one: an invoice, a contract or a
 * payment order carries its amount in words as well as digits, and until now
 * the only tools for it in Uzbek were a 2010s Excel macro and a blog post
 * about the algorithm.
 *
 * Both scripts, always, side by side. That is the part no competitor can copy
 * cheaply: `@webiston/transliteration` is already here, already tested, and
 * turns the Latin sum into Cyrillic with one call — anyone else would have to
 * write and maintain a transliteration engine to offer the second column.
 */
export function NumberToWords() {
  const t = useTranslations("NumberToWordsPage")
  const tCommon = useTranslations("Common")
  const inputId = useId()
  const capsId = useId()
  const documentId = useId()

  const {
    input,
    setInput,
    mode,
    setMode,
    capitalised,
    setCapitalised,
    documentFormat,
    setDocumentFormat,
    state,
    clear
  } = useNumberToWords()

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
      <ToolHeader
        title={t("ToolHeader.title")}
        description={t("ToolHeader.description")}
      />

      {/* NO `items-start`, deliberately — this is the fix for the two cards
          never matching in height. A grid cell stretches to its row by
          default, so with `h-full` on both cards they are equal BY
          CONSTRUCTION in every state: empty (was 249px against 178px),
          short sum (275/306) and an 18-digit one (275/358). Sticky was
          considered instead and it solves nothing here — the whole tool fits
          one viewport, so there is nowhere for a sticky card to travel. */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <ToolCard
          title={t("input.title")}
          tone="muted"
          className="flex h-full flex-col"
          bodyClassName="flex-1 p-5"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              disabled={!input}
              aria-label={tCommon("clear")}
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={inputId}
                className="text-muted-foreground text-xs"
              >
                {t("input.label")}
              </label>
              {/* `inputMode="decimal"`, not `type="number"`. A number input
                  refuses the spaces and commas people paste out of 1C and a
                  spreadsheet — the exact shapes `parseAmount` exists to
                  read — and silently blanks itself on them. This asks a
                  phone for the numeric keypad without taking the text away. */}
              <Input
                id={inputId}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                inputMode="decimal"
                autoComplete="off"
                placeholder={t("input.placeholder")}
                className="font-mono text-lg"
                aria-describedby={
                  state.status === "error" ? `${inputId}-error` : undefined
                }
                aria-invalid={state.status === "error"}
              />
              {state.status === "ready" && (
                // The amount read back in groups of three. This is how a
                // missing or extra zero gets caught, and it is the only check
                // available before the sum reaches a document.
                <p className="font-mono text-muted-foreground text-sm tabular-nums">
                  {state.formatted}
                </p>
              )}
              {state.status === "error" && (
                <p
                  id={`${inputId}-error`}
                  role="alert"
                  className="text-destructive text-xs"
                >
                  {t(`errors.${state.error}`)}
                </p>
              )}
            </div>

            <SegmentedControl
              label={t("mode.label")}
              value={mode}
              onChange={(value) => setMode(value as OutputMode)}
              options={OUTPUT_MODES.map((value) => ({
                value,
                label: t(`mode.${value}`)
              }))}
            />

            <div className="flex items-center gap-2">
              <input
                id={capsId}
                type="checkbox"
                checked={capitalised}
                onChange={(event) => setCapitalised(event.target.checked)}
                className="size-4 accent-primary"
              />
              <label htmlFor={capsId} className="text-foreground text-sm">
                {t("capitalise")}
              </label>
            </div>

            {/* The contract line itself: `1 250 000,50 (Bir million …)`.
                For most visitors this string IS the deliverable — it gets
                pasted into the hujjat as-is — and without the toggle they
                were assembling it by hand from two separate copies. */}
            <div className="flex items-center gap-2">
              <input
                id={documentId}
                type="checkbox"
                checked={documentFormat}
                onChange={(event) => setDocumentFormat(event.target.checked)}
                className="size-4 accent-primary"
              />
              <label htmlFor={documentId} className="text-foreground text-sm">
                {t("documentFormat")}
              </label>
            </div>
          </div>
        </ToolCard>

        <ToolCard
          title={t("result.title")}
          tone="primary"
          className="flex h-full flex-col"
          bodyClassName="flex flex-1 flex-col p-5"
        >
          {state.status === "ready" ? (
            <div className="flex flex-col gap-3">
              <WordsCard
                label={t("result.latin")}
                words={state.words.latin}
                copyLabel={tCommon("copy")}
                copiedLabel={tCommon("copied")}
              />
              <WordsCard
                label={t("result.cyrillic")}
                words={state.words.cyrillic}
                copyLabel={tCommon("copy")}
                copiedLabel={tCommon("copied")}
              />
              {state.fractionIgnored && (
                // Said out loud rather than silently dropped: Uzbek reads a
                // decimal as a fraction whose denominator changes with the
                // number of places, and inventing that grammar on a document
                // is worse than declining it.
                <p className="text-muted-foreground text-xs">
                  {t("result.fractionIgnored")}
                </p>
              )}
            </div>
          ) : (
            // Centred in the card the input column sizes, and it TEACHES
            // instead of apologising: the sample is computed by the real
            // pipeline at module scope, so it shows exactly what pressing the
            // keys will produce and can never drift from the algorithm.
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <p className="text-muted-foreground text-sm">
                {t("result.empty")}
              </p>
              {/* Full-strength `text-muted-foreground`, no `/70` — the same
                  slash-opacity measured 3.08:1 in light mode on the theme
                  count and failed AA. Size carries the hierarchy instead. */}
              {SAMPLE_WORDS && (
                <p className="text-muted-foreground text-xs">
                  <span className="font-mono tabular-nums">{SAMPLE_INPUT}</span>
                  {" → "}
                  {SAMPLE_WORDS}
                </p>
              )}
            </div>
          )}
        </ToolCard>
      </div>
    </div>
  )
}

export default NumberToWords
