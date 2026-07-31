"use client"

/**
 * What the empty source panel offers instead of a blank rectangle.
 *
 * The idle page used to be two large empty terminals and nothing to do. These
 * are the two first moves anyone actually makes — paste what is on the
 * clipboard, or try the tool on something.
 */

import { Button } from "@webiston/ui/primitives/button"
import { ClipboardPaste, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

interface SourceEmptyActionsProps {
  onText: (text: string) => void
  onSample: () => void
}

export function SourceEmptyActions({
  onText,
  onSample
}: SourceEmptyActionsProps) {
  const t = useTranslations("LatinCyrillicPage.empty")
  // Safari and Firefox refuse `readText` without a user gesture they trust, and
  // some setups deny it outright. Hiding the button after a refusal is better
  // than leaving a control that does nothing.
  const [pasteBlocked, setPasteBlocked] = useState(false)

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) onText(text)
    } catch {
      setPasteBlocked(true)
    }
  }

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-2">
      {!pasteBlocked && (
        <Button type="button" variant="outline" size="sm" onClick={paste}>
          <ClipboardPaste className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("paste")}
        </Button>
      )}
      <Button type="button" variant="ghost" size="sm" onClick={onSample}>
        <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
        {t("sample")}
      </Button>
    </div>
  )
}
