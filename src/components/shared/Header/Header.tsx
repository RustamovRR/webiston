import { cn } from "@webiston/ui"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@webiston/ui/primitives/navigation-menu"
import { getTranslations } from "next-intl/server"
// `BOOK_SECTIONS` already carries these ids and titles for the homepage.
// Header is a Server Component, so its `chapters` arrays never reach the
// client bundle — a second list would only be a second thing to keep in sync.
import { BOOK_SECTIONS } from "@/constants/navigation"
// Two Links, and the distinction is load-bearing.
//
// `Link` (next/link) is for `/books/**`, which is Uzbek-only by design and
// lives OUTSIDE the `[locale]` segment — prefixing it would produce
// `/ru/books/...`, which does not exist.
//
// `I18nLink` is for everything that DOES have a locale variant. Without it the
// header sent a Russian reader from `/ru/tools/qr-generator` to `/tools`, an
// Uzbek page — verified in the built HTML: `/ru` carried two unprefixed
// `/tools` hrefs against one correct `/ru/tools`. The first link a visitor
// clicked dropped them out of their own language.
import { chromeLinkLocale, Link as I18nLink } from "@/i18n/navigation"

import LanguageSelector from "../LanguageSelector/LanguageSelector"
import Search from "../Search"
import ThemeToggle from "../ThemeToggle"
import Logo from "./Logo"
import MobileMenuButton from "./MobileMenuButton"

interface HeaderProps {
  showLanguageSelector?: boolean
  /**
   * The active locale, passed in explicitly.
   *
   * **This is a bug fix, not plumbing.** With `useTranslations` this component
   * resolved the DEFAULT locale, so `/en` served an entirely Uzbek header —
   * "Kitoblar", "Foydali Vositalar", the book descriptions, all of it — on
   * every English page, while the page body beside it was correctly English.
   * The pages were right because each one calls `setRequestLocale` in its own
   * body; the layout's call does not reach this far.
   *
   * `getTranslations({ locale })` cannot get it wrong: the locale is an
   * argument rather than something read from ambient request state.
   */
  locale: string
}

export default async function Header({
  showLanguageSelector = true,
  locale
}: HeaderProps) {
  const t = await getTranslations({ locale, namespace: "Header" })

  return (
    // Frosted, not near-opaque. At `bg-background/95` this bar was effectively
    // solid and carried no tint, so where the homepage hero's brand light began
    // — exactly at the header's bottom edge — there was a hard horizontal seam:
    // flat dark above the line, teal below it.
    //
    // At 65% with a real blur the light passes through continuously, so the seam
    // disappears at every scroll position with no scroll listener and no
    // scroll-driven timeline (see the note in hero.css for why the timeline
    // approach was measured and rejected). The heavier blur is what keeps
    // navigation readable once content scrolls underneath — it is doing the work
    // the missing 30% of opacity used to do.
    <div
      data-site-header
      className="sticky top-0 z-50 border-border border-b bg-background/65 backdrop-blur-xl"
    >
      {/* `h-(--header-height)` rather than `h-16`: hero.css reaches its backdrop
          up behind this bar by exactly this value, and two hardcoded `4rem`s in
          separate files is precisely the pair that drifts. */}
      <div className="mx-auto flex h-(--header-height) w-full max-w-[1536px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <section className="flex items-center gap-6">
          <Logo locale={locale} />
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                {/*
                  Plain text, NOT a `<Link>`.

                  `NavigationMenuTrigger` renders a `<button>`, and an anchor
                  inside a button is invalid HTML — the spec forbids interactive
                  content inside interactive content. Browsers recover from it,
                  but the two elements fight over the click and over focus, and
                  a screen reader is told the control is a button whose contents
                  are a link to somewhere else. The route to /books is the first
                  item in the menu below, where it is unambiguous.
                */}
                <NavigationMenuTrigger className="relative cursor-pointer bg-transparent text-muted-foreground transition-colors duration-300 hover:text-foreground data-[state=open]:text-foreground">
                  {t("books")}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-1 p-2 max-md:max-w-[400px] md:w-[500px] md:gap-3 md:p-4">
                    {BOOK_SECTIONS.map((book) => (
                      <ListItem
                        key={book.id}
                        href={`/books/${book.id}`}
                        title={book.title}
                      >
                        {/*
                          Translated, not hardcoded. These three descriptions
                          were Uzbek string literals in this file, so every
                          visitor on /en read the Uzbek — in the site's own
                          navigation, on every page.
                        */}
                        {t(`bookDescriptions.${book.id}`)}
                      </ListItem>
                    ))}
                    <ListItem href="/books" title={t("allBooks")}>
                      {t("allBooksDescription")}
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className="relative cursor-pointer bg-transparent text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  <I18nLink href="/tools" locale={chromeLinkLocale(locale)}>
                    {t("tools")}
                  </I18nLink>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </section>

        <section className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Search />
            {showLanguageSelector && (
              <LanguageSelector
                labels={{
                  trigger: t("language"),
                  current: t("current"),
                  hint: t("languageHint")
                }}
              />
            )}
            <ThemeToggle />
          </div>
          {/* Below `md` this is the ONLY route to Search, the language
              switcher and the theme toggle — the row above them is
              `hidden md:flex`. Its labels and book list are resolved here, on
              the server, and passed down; the menu never resolves a locale
              itself. */}
          <div className="md:hidden">
            <MobileMenuButton
              books={BOOK_SECTIONS.map((book) => ({
                id: book.id,
                title: book.title,
                description: t(`bookDescriptions.${book.id}`)
              }))}
              labels={{
                menu: t("menu"),
                openMenu: t("openMenu"),
                closeMenu: t("closeMenu"),
                chapters: t("chapters"),
                browse: t("browse"),
                allBooks: t("allBooks"),
                tools: t("tools"),
                language: {
                  trigger: t("language"),
                  current: t("current"),
                  hint: t("languageHint")
                }
              }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

/**
 * One entry in the books menu.
 *
 * No `forwardRef`. React 19 passes `ref` as an ordinary prop, so the wrapper
 * this used to carry — plus the deprecated `React.ElementRef` it was typed
 * with — is machinery for a version we are two majors past.
 */
function ListItem({
  className,
  title,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"a">) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="font-medium text-sm leading-none">{title}</div>
          <p className="line-clamp-2 text-muted-foreground text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
}
