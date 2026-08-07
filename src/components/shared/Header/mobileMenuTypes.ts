/**
 * The shape the header hands the mobile menu.
 *
 * Every string is resolved on the SERVER, in `Header.tsx`, with
 * `getTranslations({ locale })` and passed down. The menu never calls
 * `useTranslations` itself, and that is deliberate: this repo has already been
 * bitten twice by a client component resolving the ambient locale and landing
 * on the default, which shipped an entirely Uzbek header to `/en`. A locale
 * that arrives as an argument cannot be resolved wrongly.
 */

export interface MobileNavBook {
  id: string
  title: string
  description: string
}

export interface MobileMenuLabels {
  /** Accessible name for the panel itself. */
  menu: string
  openMenu: string
  closeMenu: string
  /** Heading over the current book's chapter list. */
  chapters: string
  /** Heading over the site-wide links. */
  browse: string
  allBooks: string
  tools: string
  /** Passed straight through to `LanguageSelector`. */
  language: {
    trigger: string
    current: string
    hint: string
  }
}
