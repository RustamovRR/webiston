# LatinCyrillic

The Uzbek alphabet converter — Latin, Cyrillic and the 2027 Latin (Law
OʻRQ-1184). The site's most-visited tool, and the client island of TWO routes:

| Route | Answers the search | Opens on |
| ----- | ------------------ | -------- |
| `/tools/latin-cyrillic` | "lotin kirill" | Avto |
| `/tools/yangi-alifbo` | "yangi alifbo", "ş harfi" | → Yangi lotin |

One tool, two front doors. Each route brings its own heading (passed in as
props), its own reference table and FAQ; the converter is identical, so
neither visitor is sent to the other page to finish the job. Each route
remembers its own switch position; the draft text is shared, so it survives
following the link between them. `DEFAULT_PREFERENCE` in `constants/` is the
one place that names both.

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

The extension still speaks in those directions. This page has moved one step
further: its switch holds `"auto" | UzbekScript` — a destination, not a
direction — and converts with `toUzbekScript`, which reads all three
alphabets in any mix. Under `"auto"` the text decides on every change, by the
same rule `resolveDirection` uses (Cyrillic-dominant → Latin, else Cyrillic).
The new alphabet is never an auto result; it is always picked.

## Structure

```
LatinCyrillic/
├── components/
│   ├── AlphabetTable.tsx    # SERVER — the Latin↔Cyrillic reference table
│   ├── ConverterFaq.tsx     # SERVER — the visible FAQ (same keys as the schema)
│   ├── DirectionTabs.tsx    # Avto / → Кирилл / → Lotin / → Yangi lotin
│   ├── DownloadMenu.tsx     # TXT · DOCX
│   ├── DropZone.tsx         # drop a file anywhere on the tool
│   ├── SourceEmptyActions.tsx
│   └── index.ts             # CLIENT components only — see the note in it
├── constants/               # sample text, file limits, the alphabet data
├── hooks/
│   ├── useLatinCyrillic.ts  # text + target alphabet + result
│   └── useFileImport.ts     # TXT/PDF/DOCX in, TXT/DOCX out
├── seo/                     # metadata + JSON-LD (FAQ reads the i18n messages)
├── stores/                  # persisted: switch position per route + exceptions
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
