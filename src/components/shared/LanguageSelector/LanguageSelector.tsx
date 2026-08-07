"use client"

import { cn } from "@webiston/ui"
import { Button } from "@webiston/ui/primitives/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@webiston/ui/primitives/dropdown-menu"
import { Check, Languages } from "lucide-react"
import { useParams, useSelectedLayoutSegments } from "next/navigation"
import { useLocale } from "next-intl"
import { useTransition } from "react"
import { localeInfo, servedLocales } from "@/i18n/locales"
import { usePathname, useRouter } from "@/i18n/navigation"

/**
 * Switching language, without leaving the page you are on.
 *
 * The version this replaces had five problems, and four of them were visible:
 *
 * 1. **It did not render on the server.** A `dynamic(..., { ssr: false })`
 *    wrapper meant every visitor got a shimmering skeleton first and the real
 *    control a moment later — layout shift on every page load, for a control
 *    with nothing SSR-unsafe in it.
 * 2. **The English option flew a US flag.** English is not the United States,
 *    and Russian in Uzbekistan is spoken by Uzbek citizens rather than by
 *    Russia. Worse, **Windows ships no flag glyphs at all**, so every visitor
 *    on Windows saw a pair of letters in a box.
 * 3. **It never showed the language's name.** A `name` field was defined,
 *    carried "O'zbek" and "English", and was never rendered — the menu listed
 *    `uz` and `en`. Somebody looking for Russian scans for "Русский".
 * 4. **The tick was a `✓` character in `text-success`.** Green is the suite's
 *    colour for a good outcome, not for "this is the current one", and every
 *    other check in the codebase is the lucide icon.
 * 5. **It dropped the query string and hash**, so switching language on a page
 *    reached from search lost the search.
 *
 * The list itself comes from `i18n/locales.ts`, so this component does not
 * change when a language is added.
 *
 * Labels arrive as props rather than from `useTranslations`. This is a client
 * island inside a Server Component header, and reaching for a namespace here
 * would mean shipping `Header` messages to the client on **every route** — the
 * i18n gate caught exactly that. The server already has the strings.
 */

interface LanguageSelectorProps {
  labels: {
    /** Accessible name for the trigger. */
    trigger: string
    /** Announced beside the current language. */
    current: string
    /** Reassurance shown on deep pages. */
    hint: string
  }
}

export function LanguageSelector({ labels }: LanguageSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const segments = useSelectedLayoutSegments()
  const locale = useLocale()
  // The navigation is a server round-trip. Without this the menu closes and
  // nothing appears to happen until the new page arrives.
  const [isPending, startTransition] = useTransition()

  const locales = servedLocales()
  const current = localeInfo(locale)

  const change = (next: string) => {
    if (next === locale) return
    startTransition(() => {
      // `params` is passed through so a dynamic route keeps its values — a book
      // chapter switching language has to stay on that chapter, not fall back
      // to the section root.
      router.replace(
        // @ts-expect-error — `pathname` is typed as a known route literal, and
        // this component is mounted on every route including dynamic ones.
        { pathname, params },
        { locale: next }
      )
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          // Named, because "UZ" alone does not say what the button does. The
          // old trigger had no accessible name beyond the code.
          aria-label={labels.trigger}
          className="gap-2"
          disabled={isPending}
        >
          <Languages aria-hidden="true" className="size-4" />
          <span className="font-medium text-sm">
            {current.code.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-44">
        {locales.map((option) => {
          const active = option.code === locale
          return (
            <DropdownMenuItem
              key={option.code}
              onSelect={() => {
                change(option.code)
              }}
              className="cursor-pointer gap-2"
            >
              {/* `lang` on the label: without it a screen reader reads
                  "Русский" with Uzbek phonetics, and "O'zbekcha" with English
                  ones. One attribute, and the menu is actually usable. */}
              <span lang={option.htmlLang} className="flex-1">
                {option.nativeName}
              </span>
              <span className="font-mono text-muted-foreground text-xs uppercase">
                {option.code}
              </span>
              <Check
                aria-hidden="true"
                className={cn(
                  "size-4 shrink-0 transition-opacity",
                  // Always rendered, never conditional: an icon that appears
                  // and disappears reflows the row, so the whole menu twitches
                  // as the pointer moves down it.
                  active ? "opacity-100" : "opacity-0"
                )}
              />
              {active ? (
                <span className="sr-only">{labels.current}</span>
              ) : null}
            </DropdownMenuItem>
          )
        })}

        {/* Segment count is a cheap proxy for "this is a deep page": switching
            language there is the case where losing your place is most annoying,
            and it is worth saying that you will not. */}
        {segments.length > 1 ? (
          <p className="border-border border-t px-2 py-1.5 text-muted-foreground text-xs">
            {labels.hint}
          </p>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSelector
