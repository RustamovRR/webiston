"use client"

import { Button } from "@webiston/ui/primitives/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@webiston/ui/primitives/dropdown-menu"
import { Check, ChevronDown, Copy } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

/**
 * One copy control with two shapes behind it.
 *
 * The first version put two bare `CopyButton`s next to each other — one for
 * the Markdown report and one for the JSON — and `CopyButton` renders an icon
 * with no text, so the toolbar showed **two identical buttons** whose only
 * difference was an accessible name nobody sees. A control that cannot be told
 * apart from its neighbour is worse than one option fewer.
 *
 * A menu, not two buttons: the choice is between two renderings of the same
 * data, which is exactly what a menu is for, and it is the pattern the UUID
 * generator already uses for its two download formats.
 */

interface CopyMenuProps {
  markdown: string
  json: string
}

export function CopyMenu({ markdown, json }: CopyMenuProps) {
  const t = useTranslations("DeviceInfoPage.controls")
  const [copied, setCopied] = useState(false)

  const copy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      // A refused clipboard write must not claim success.
      .catch(() => {})
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={!json}>
          {copied ? (
            <Check aria-hidden="true" className="text-success" />
          ) : (
            <Copy aria-hidden="true" />
          )}
          {copied ? t("copied") : t("copy")}
          <ChevronDown aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => copy(markdown)}>
          {t("copyReport")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copy(json)}>
          {t("copyJson")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
