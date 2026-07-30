/**
 * Lazy handle for the search engine.
 *
 * The point of this file is that it contains NO static import of
 * `./flexsearch`. `Search.tsx` is a Client Component in the site header, so
 * whatever it imports statically lands in the initial bundle of every route —
 * and `flexsearch.ts` both imports the FlexSearch library at module scope and
 * instantiates `new SearchEngine()` (which calls `new Index(...)`) as a
 * module-level side effect.
 *
 * Measured on a prerendered book chapter: FlexSearch was **74 KB gzipped** of
 * the page's 359 KB, downloaded and parsed by every reader on all 269 routes,
 * including the ~all of them who never open search. A previous pass made the
 * 1.07 MB *index* load on intent; the *library* was still eager.
 *
 * The dynamic `import()` is cached by the module system, and the promise is
 * memoised here on top, so hover → focus → click cannot start three loads.
 * Same intent signal as before (`onPointerEnter`/`onFocus`), so by the time the
 * dialog opens the chunk is usually already there.
 */
let pending: Promise<
  Awaited<typeof import("./flexsearch")>["searchEngine"]
> | null = null

export function loadSearchEngine() {
  pending ??= import("./flexsearch").then((m) => m.searchEngine)
  return pending
}
