"use client"

import { ExternalLink } from "lucide-react"
import { useTranslations } from "next-intl"

import { isAbsoluteHttpUrl } from "../utils/validate"

/**
 * Where to go when the card is right but the platform is still showing the
 * old one.
 *
 * The FAQ answers "why is my change not showing" with "re-scrape it" — and
 * then left the visitor to find the two tools by name. These are the actual
 * endpoints, with their own URL already filled in.
 *
 * Telegram has no web debugger: refreshing a link preview there means sending
 * the URL to @WebpageBot, which is why that entry is a chat link and not an
 * inspector. It matters more than the other two for this site's audience.
 */

interface RescrapeLinksProps {
  url: string
}

export function RescrapeLinks({ url }: RescrapeLinksProps) {
  const t = useTranslations("OgMetaGeneratorPage.rescrape")
  const trimmed = url.trim()
  if (!isAbsoluteHttpUrl(trimmed)) return null

  const encoded = encodeURIComponent(trimmed)
  const targets = [
    {
      key: "facebook",
      label: "Facebook",
      href: `https://developers.facebook.com/tools/debug/?q=${encoded}`
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/post-inspector/inspect/${encoded}`
    },
    { key: "telegram", label: "Telegram", href: "https://t.me/WebpageBot" }
  ]

  return (
    <div className="border-border border-t pt-3">
      <p className="text-muted-foreground text-xs leading-relaxed">
        {t("hint")}
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {targets.map((target) => (
          <li key={target.key}>
            <a
              href={target.href}
              target="_blank"
              // `noreferrer` as well as `noopener`: these are third-party
              // debuggers and there is no reason to hand them the page the
              // visitor came from.
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary text-xs underline-offset-4 hover:underline"
            >
              {target.label}
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
