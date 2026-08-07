# LatinCyrillic

The Latin ↔ Cyrillic converter at `/tools/latin-cyrillic`. The site's
most-visited page.

## Where the logic lives

**Not here.** Conversion and the direction policy are in
`@webiston/transliteration`, because four surfaces need the same answers:

| Surface | File |
| ------- | ---- |
| This tool | `hooks/useLatinCyrillic.ts` |
| Extension popup | `apps/extensions/latin-cyrillic/entrypoints/popup/App.tsx` |
| In-page popover | `apps/extensions/latin-cyrillic/entrypoints/content.ts` |
| Context menu | `apps/extensions/latin-cyrillic/entrypoints/background.ts` |

The package exposes exactly four things they share:

```ts
resolveDirection(text, preference)      // "auto" | direction  →  direction
convert(text, direction)                // the one call that runs it
convertWithPreference(text, preference) // both of the above, in one step
oppositeDirection(direction)            // for the swap control
```

`preference` is `"auto" | "latin-to-cyrillic" | "cyrillic-to-latin"`. Under
`"auto"` the text decides, on every change — there is no paste heuristic and no
memory of the previous answer.

## Structure

```
LatinCyrillic/
├── components/
│   ├── AlphabetTable.tsx    # SERVER — the Latin↔Cyrillic reference table
│   ├── ConverterFaq.tsx     # SERVER — the visible FAQ (same keys as the schema)
│   ├── DirectionTabs.tsx    # Avto / → Кирилл / → Lotin
│   ├── DownloadMenu.tsx     # TXT · DOCX
│   ├── DropZone.tsx         # drop a file anywhere on the tool
│   ├── SourceEmptyActions.tsx
│   └── index.ts             # CLIENT components only — see the note in it
├── constants/               # sample text, file limits, the alphabet data
├── hooks/
│   ├── useLatinCyrillic.ts  # text + direction + result
│   └── useFileImport.ts     # TXT/PDF/DOCX in, TXT/DOCX out
├── seo/                     # metadata + JSON-LD (FAQ reads the i18n messages)
├── stores/                  # one persisted value: the direction preference
├── LatinCyrillic.tsx        # the client island
└── index.ts
```

`AlphabetTable` and `ConverterFaq` are Server Components rendered by
`page.tsx` as SIBLINGS of the converter, not children of it. A child of a
`'use client'` tree is a client component whether it needs to be or not, and
those two are static markup.

## Two rules that are easy to break here

1. **Import the module directly from `page.tsx`, never via `@/modules/tools`.**
   That barrel re-exports all 21 tool modules and every one of them is
   `'use client'`. Importing through it put 22 tool modules in this route's
   client manifest instead of 1, and 664 KB gz of JS instead of 358.
2. **`components/index.ts` is client-only.** `LatinCyrillic.tsx` imports it, so
   naming a Server Component there pulls `next-intl/server` into the browser.

## Engine correctness

The hard cases live in `packages/transliteration/__tests__/uzbek-corpus.test.ts`.
When a conversion is reported wrong, the failing word goes in that file first —
it is the bug report.
