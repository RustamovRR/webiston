/**
 * Every document, as a route.
 *
 * Deliberately separate from the template objects themselves: the switcher is
 * a Server Component that needs only slugs and hrefs, and importing the
 * templates would pull each one's `'use client'` field component onto the
 * server render for no reason.
 *
 * Flat, keyword-exact URLs, NOT `/tools/hujjatlar/<slug>`: "tilxat" is the
 * query people type, and `/tools/tilxat` is the best URL that query can have.
 * The `/tools` page stays uncluttered at a different layer — the whole family
 * ships as ONE card in `TOOLS_LIST`, because routes and cards are independent.
 */
export const TEMPLATE_LINKS = [
  { slug: "tilxat", href: "/tools/tilxat" },
  { slug: "ariza", href: "/tools/ishdan-boshash-arizasi" },
  // Next to the other ariza: a visitor who landed on the wrong one of the two
  // is the likeliest switcher click on either page.
  { slug: "tatil", href: "/tools/tatil-arizasi" },
  { slug: "tushuntirish", href: "/tools/tushuntirish-xati" }
] as const

export type TemplateSlug = (typeof TEMPLATE_LINKS)[number]["slug"]
