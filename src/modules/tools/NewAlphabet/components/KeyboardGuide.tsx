import { LATIN_2027_LETTERS } from "@webiston/transliteration"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import type { ReactNode } from "react"

import { EXTENSION_PAGE_PATH } from "@/constants/extension"
import { localePath } from "@/i18n/locales"

import {
  KEYBOARD_PLATFORMS,
  type KeyboardCodes,
  MAC_EXTENDED_KEYS
} from "../constants"

/**
 * How to type ş, ç, ğ, ö — the answer to "yangi alifbo klaviatura(da)",
 * 19 Search Console impressions in the page's first days and 122 in the
 * seven days to 2026-10-29.
 *
 * Server Component, no client code. Every key combination was checked
 * against the real thing before it went in (see `MAC_EXTENDED_KEYS`). The
 * Turkish-layout warning is the part other guides leave out: on a computer,
 * "Turkish Q" puts the dotless ı on the i key, ö on the comma and ç on the
 * period — the advice most of them give, and a silent corruption of Uzbek.
 */

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="whitespace-nowrap rounded-md border border-border-strong bg-background px-1.5 py-0.5 font-sans text-[11px] text-foreground">
      {children}
    </kbd>
  )
}

/** Word's Alt + X code: the hex code point without "U+". */
const hexCode = (char: string) =>
  (char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0")

/** The key list under a method, from the package's letters. */
function KeyList({ codes }: { codes: KeyboardCodes }) {
  const items =
    codes === "unicode"
      ? LATIN_2027_LETTERS.flatMap((letter) =>
          [letter.lower, letter.upper].map((glyph) => ({
            glyph,
            keys: [hexCode(glyph)]
          }))
        )
      : LATIN_2027_LETTERS.map((letter) => ({
          glyph: letter.lower,
          keys: MAC_EXTENDED_KEYS[letter.old] ?? []
        }))

  return (
    <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
      {items.map(({ glyph, keys }) => (
        <li key={glyph} className="flex items-center gap-2">
          <span className="w-4 font-mono text-[15px] text-foreground">
            {glyph}
          </span>
          <span className="flex gap-1">
            {keys.map((key) => (
              <Kbd key={key}>{key}</Kbd>
            ))}
          </span>
        </li>
      ))}
    </ul>
  )
}

export async function KeyboardGuide({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "NewAlphabetPage.keyboard"
  })

  const kbd = (chunks: ReactNode) => <Kbd>{chunks}</Kbd>

  return (
    <section id="klaviatura" className="mt-16 scroll-mt-20">
      <div className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2.5 rounded-full border border-border-strong bg-card/60 px-3 py-1 font-mono text-[11px] tracking-[0.15em]">
          <span className="size-[5px] shrink-0 rounded-[1.5px] bg-primary" />
          <span className="text-muted-foreground">{t("kicker")}</span>
        </div>
        <h2 className="text-balance font-bold text-2xl text-foreground tracking-[-0.01em] sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
          {t("description")}
        </p>
        <p className="mt-3 max-w-2xl text-pretty text-muted-foreground leading-loose">
          {t.rich("easiest", {
            kbd,
            ext: (chunks) => (
              <Link
                href={localePath(locale, EXTENSION_PAGE_PATH)}
                className="rounded-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {chunks}
              </Link>
            )
          })}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {KEYBOARD_PLATFORMS.map((platform) => (
          <div
            key={platform.id}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <h3 className="border-border/60 border-b px-5 py-3 font-medium text-foreground text-sm">
              {t(`platforms.${platform.id}.title`)}
            </h3>
            <ol className="divide-y divide-border/60">
              {platform.methods.map((method) => (
                <li key={method.key} className="px-5 py-4">
                  <p className="font-medium text-foreground text-sm">
                    {t(`platforms.${platform.id}.methods.${method.key}.title`)}
                  </p>
                  <p className="mt-1 text-pretty text-muted-foreground text-sm leading-relaxed">
                    {t.rich(
                      `platforms.${platform.id}.methods.${method.key}.body`,
                      { kbd }
                    )}
                  </p>
                  {method.codes && <KeyList codes={method.codes} />}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card px-5 py-4">
        <p className="font-medium text-foreground text-sm">
          {t("warning.title")}
        </p>
        <p className="mt-1 max-w-3xl text-pretty text-muted-foreground text-sm leading-relaxed">
          {t("warning.body")}
        </p>
      </div>
    </section>
  )
}
