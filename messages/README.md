# Translation files

The full spec — locales, namespaces, how a page gets its strings, the
glossary — is **`docs/reference/content-i18n.md`**. This file is only the map.

```
messages/
├── common/{uz,en,ru}.json          shared shell: HomePage, Header, Common, Footer, …
├── tools/<folder>/{uz,en,ru}.json  one folder per tool, plus tools-page
└── index.js                        merges them per locale (object spread)
```

## Adding a tool's strings

1. Create `tools/<folder>/uz.json`, `en.json` and `ru.json`. The top-level key is
   the namespace — `<Tool>Page` by convention (`QrGeneratorPage`), not the
   folder name.
2. Import all three in `index.js` and spread them into `uz`, `en` and `ru`.
   A namespace two files share is overwritten silently — the later one wins.
3. Name the namespace in the route's `CLIENT_NAMESPACES` (or `TOOL_NAMESPACE`)
   for `<LocaleMessages>`.
4. `pnpm i18n` — fails on a key missing from any locale, and on a namespace a
   Client Component calls that no route provides.
